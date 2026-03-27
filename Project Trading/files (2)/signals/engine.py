"""
signals/engine.py — 22-strategy signal fusion engine with ML filter.

Indicator weights (total ~36 weight units):
  #  Strategy               Weight
  1  EMA Crossover (9/21)    2.5
  2  EMA-200 Trend Filter     2.0
  3  MACD Histogram Cross     2.0
  4  RSI Overbought/Oversold  1.5
  5  RSI Divergence           2.0
  6  Stochastic Cross         1.0
  7  CCI ±100                 1.0
  8  Williams %R              1.0
  9  MFI                      1.0
 10  Bollinger Bands %B       1.5
 11  SuperTrend Flip          2.5
 12  Ichimoku Cloud           2.5
 13  ADX Trend Strength       1.5
 14  Squeeze Momentum         1.5
 15  Donchian Breakout        1.5
 16  Keltner Channel          1.0
 17  VWAP Position            1.0
 18  OBV vs EMA               1.0
 19  Candlestick Patterns     2.0
 20  Pivot Point S/R          1.5
 21  Hurst + Z-Score Regime   1.0
 22  ML Pattern Filter        3.0
"""
from __future__ import annotations
import logging, threading, time
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum, auto
from typing import Callable, Dict, List, Optional, Tuple

import numpy as np

from signals.indicators import Ind
from data.bars          import Bar

logger = logging.getLogger(__name__)


class Direction(Enum):
    BUY  = auto()
    SELL = auto()
    FLAT = auto()


class Strength(Enum):
    WEAK        = 1
    MODERATE    = 2
    STRONG      = 3
    VERY_STRONG = 4


@dataclass
class Vote:
    name:      str
    direction: Direction
    weight:    float = 1.0
    note:      str   = ""


@dataclass
class TradingSignal:
    pair:          str
    direction:     Direction
    strength:      Strength
    entry_price:   float
    stop_loss:     float
    take_profit:   float
    tp2:           float
    tp3:           float
    confidence:    float
    votes_bull:    int
    votes_bear:    int
    atr:           float
    spread_pips:   float
    session:       str
    timeframe:     str
    risk_reward:   float    = 0.0
    lot_size:      float    = 0.01
    notes:         List[str]= field(default_factory=list)
    timestamp:     float    = field(default_factory=time.time)

    @property
    def dir_str(self) -> str:
        return self.direction.name

    @property
    def strength_str(self) -> str:
        return self.strength.name.replace("_"," ")

    def to_db_signal(self):
        from db.database import Signal
        return Signal(
            pair          = self.pair,
            direction     = self.dir_str,
            strength      = self.strength_str,
            entry_price   = self.entry_price,
            stop_loss     = self.stop_loss,
            take_profit   = self.take_profit,
            take_profit_2 = self.tp2,
            take_profit_3 = self.tp3,
            confidence    = self.confidence,
            votes_bull    = self.votes_bull,
            votes_bear    = self.votes_bear,
            atr           = self.atr,
            spread_pips   = self.spread_pips,
            session       = self.session,
            timeframe     = self.timeframe,
            risk_reward   = self.risk_reward,
            position_size = self.lot_size,
            notes         = " | ".join(self.notes[:5]),
            created_at    = self.timestamp,
        )


# ── Bar price buffer ──────────────────────────────────────────────────────────
class PriceBuffer:
    MAX = 500
    def __init__(self):
        self._bars: List[Bar] = []
        self.bid = 0.0; self.ask = 0.0

    def add(self, bar: Bar):
        self._bars.append(bar)
        if len(self._bars) > self.MAX:
            self._bars.pop(0)

    def update_tick(self, bid, ask):
        self.bid=bid; self.ask=ask
        if self._bars:
            self._bars[-1].close = (bid+ask)/2

    def arrays(self):
        if not self._bars:
            e=np.array([],dtype=float)
            return e,e,e,e,e
        o=np.array([b.open   for b in self._bars],dtype=float)
        h=np.array([b.high   for b in self._bars],dtype=float)
        l=np.array([b.low    for b in self._bars],dtype=float)
        c=np.array([b.close  for b in self._bars],dtype=float)
        v=np.array([b.volume for b in self._bars],dtype=float)
        return o,h,l,c,v

    def __len__(self): return len(self._bars)


# ── ML Pattern engine ─────────────────────────────────────────────────────────
class _MLFilter:
    def __init__(self, cfg: dict):
        self.cfg        = cfg
        self._model     = None
        self._lock      = threading.Lock()
        self._labels:   List[int]  = []
        self._features: List[list] = []
        self._trained   = False
        self._last_train= 0.0
        logger.debug("MLFilter ready (model=%s)", cfg.get("model_type"))

    def _build_features(self, o, h, l, c, v) -> Optional[list]:
        if len(c) < 30: return None
        try:
            r  = np.diff(c)/c[:-1]; lr = np.log(c[1:]/c[:-1])
            mom5  = (c[-1]-c[-6])/c[-6] if len(c)>=6 else 0
            mom10 = (c[-1]-c[-11])/c[-11] if len(c)>=11 else 0
            mom20 = (c[-1]-c[-21])/c[-21] if len(c)>=21 else 0
            atr   = Ind.atr(h,l,c,14)[-1] or 1e-8
            rsi_v = Ind.rsi(c,14)
            rsi_n = (rsi_v[-1]-50)/50 if not np.isnan(rsi_v[-1]) else 0
            bb_u,bb_m,bb_l = Ind.bollinger(c,20,2.0)
            bb_pct= (c[-1]-bb_l[-1])/(bb_u[-1]-bb_l[-1]) if (bb_u[-1]-bb_l[-1])>0 else 0.5
            body  = abs(c[-1]-o[-1])/(h[-1]-l[-1]) if (h[-1]-l[-1])>0 else 0
            uwk   = (h[-1]-max(c[-1],o[-1]))/(h[-1]-l[-1]) if (h[-1]-l[-1])>0 else 0
            lwk   = (min(c[-1],o[-1])-l[-1])/(h[-1]-l[-1]) if (h[-1]-l[-1])>0 else 0
            vol_r = v[-1]/v[-20:].mean() if v[-20:].mean()>0 else 1
            sk    = float(np.array(r[-20:]).std(ddof=1)) if len(r)>=20 else 0
            slope = Ind.linreg_slope(c,14)[-1] or 0
            pct_rng=(c[-1]-l[-20:].min())/(h[-20:].max()-l[-20:].min()+1e-9)
            ml_l,ml_sl,_ = Ind.macd(c)
            macd_n= (ml_l[-1]-ml_sl[-1])/(atr) if not np.isnan(ml_l[-1]) else 0
            ac    = np.corrcoef(r[-20:-1],r[-19:]) if len(r)>=20 else [[0,0],[0,0]]
            autocr= float(ac[0,1]) if not np.isnan(ac[0,1]) else 0
            vp    = float(np.sum(r[-20:]<0)/20) if len(r)>=20 else 0.5
            feats = [
                float(r[-1]) if len(r)>=1 else 0,
                float(r[-2]) if len(r)>=2 else 0,
                float(r[-3]) if len(r)>=3 else 0,
                float(r[-5]) if len(r)>=5 else 0,
                float(lr[-1]) if len(lr)>=1 else 0,
                float(np.mean(r[-5:])) if len(r)>=5 else 0,
                float(np.std(r[-10:])) if len(r)>=10 else 0,
                mom5, mom10, mom20,
                float(atr/c[-1]), rsi_n, float(bb_pct),
                body, uwk, lwk,
                float(vol_r), sk, slope,
                float(pct_rng), macd_n, autocr, vp,
            ]
            return feats
        except Exception as e:
            logger.debug("Feature build error: %s", e)
            return None

    def observe(self, o, h, l, c, v) -> None:
        feats = self._build_features(o,h,l,c,v)
        if feats is None or len(c)<2: return
        label = 1 if c[-1]>c[-2] else 0
        with self._lock:
            self._features.append(feats)
            self._labels.append(label)
            if len(self._features) > 2000:
                self._features.pop(0); self._labels.pop(0)

    def maybe_retrain(self) -> None:
        now = time.time()
        interval = self.cfg.get("retrain_interval",3600)
        min_s    = self.cfg.get("min_samples",200)
        with self._lock:
            n = len(self._labels)
            if n < min_s: return
            if now - self._last_train < interval: return
            X = list(self._features); y = list(self._labels)
        self._train(X, y)
        self._last_train = now

    def _train(self, X, y):
        try:
            from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
            from sklearn.calibration import CalibratedClassifierCV
            model_t = self.cfg.get("model_type","random_forest")
            n_est   = self.cfg.get("n_estimators",200)
            if model_t == "random_forest":
                base = RandomForestClassifier(n_estimators=n_est, n_jobs=-1,
                                              random_state=42, max_depth=8)
            else:
                base = GradientBoostingClassifier(n_estimators=100, random_state=42)
            model = CalibratedClassifierCV(base, cv=3, method="sigmoid")
            model.fit(X, y)
            with self._lock:
                self._model   = model
                self._trained = True
            logger.info("ML model trained on %d samples", len(y))
        except Exception as e:
            logger.warning("ML training failed: %s", e)

    def predict(self, o, h, l, c, v) -> Tuple[float,float]:
        """Returns (p_bull, p_bear)."""
        with self._lock:
            if not self._trained or self._model is None:
                return self._heuristic(c)
        feats = self._build_features(o,h,l,c,v)
        if feats is None: return 0.5, 0.5
        try:
            proba = self._model.predict_proba([feats])[0]
            if len(proba)==2:
                return float(proba[1]), float(proba[0])
        except Exception: pass
        return 0.5, 0.5

    @staticmethod
    def _heuristic(c) -> Tuple[float,float]:
        if len(c)<10: return 0.5,0.5
        recent = np.diff(c[-10:])
        slope  = float(recent.mean())
        p_bull = 0.5 + min(0.15, abs(slope/c[-1]*100))
        return (p_bull,1-p_bull) if slope>0 else (1-p_bull,p_bull)


# ── Active trading sessions ───────────────────────────────────────────────────
def _current_sessions() -> str:
    utc_h = datetime.now(timezone.utc).hour
    sess  = []
    if 21<=utc_h or utc_h<6:  sess.append("Sydney")
    if 0<=utc_h<9:             sess.append("Tokyo")
    if 8<=utc_h<17:            sess.append("London")
    if 13<=utc_h<22:           sess.append("New York")
    return "/".join(sess) if sess else "Off-hours"


# ── Main signal engine ────────────────────────────────────────────────────────
class SignalEngine:
    def __init__(self, config, risk_mgr, db):
        self.config       = config
        self.risk         = risk_mgr
        self.db           = db
        self._lock        = threading.Lock()
        self._bufs:       Dict[str, PriceBuffer] = {}
        self._ml:         Dict[str, _MLFilter]   = {}
        self._last_signal:Dict[str, float]        = {}
        self._callbacks:  List[Callable]          = []
        logger.info("SignalEngine ready")

    def on_signal(self, cb: Callable) -> None:
        self._callbacks.append(cb)

    def _fire(self, sig: TradingSignal) -> None:
        db_sig = sig.to_db_signal()
        self.db.insert_signal(db_sig)
        for cb in self._callbacks:
            try: cb(sig)
            except Exception as e: logger.debug("signal cb: %s", e)

    def _buf(self, pair: str) -> PriceBuffer:
        if pair not in self._bufs:
            self._bufs[pair] = PriceBuffer()
        return self._bufs[pair]

    def _ml_filter(self, pair: str) -> _MLFilter:
        if pair not in self._ml:
            self._ml[pair] = _MLFilter(self.config.ml_cfg)
        return self._ml[pair]

    # Called by BarAggregator on every completed bar
    def on_bar(self, pair: str, bar: Bar, tf: str) -> None:
        if tf != self.config.primary_tf:
            return
        buf = self._buf(pair)
        buf.add(bar)
        o,h,l,c,v = buf.arrays()
        ml = self._ml_filter(pair)
        ml.observe(o,h,l,c,v)
        ml.maybe_retrain()
        if len(c) < 50:
            return
        self._analyse(pair, o, h, l, c, v, tf, buf.bid, buf.ask)

    def on_tick(self, pair: str, bid: float, ask: float) -> None:
        if pair in self._bufs:
            self._bufs[pair].update_tick(bid, ask)

    # ── Core analysis ─────────────────────────────────────────────────────────
    def _analyse(self, pair, o, h, l, c, v, tf, bid, ask):
        cfg  = self.config.ind_cfg
        rcfg = self.config.risk_cfg
        scfg = self.config.signal_cfg
        from auth.account import PIP_SIZE, PIP_VALUE

        pip_sz  = PIP_SIZE.get(pair,  0.0001)
        pip_val = PIP_VALUE.get(pair, 10.0)

        # Cooldown check
        now = time.time()
        last = self._last_signal.get(pair, 0)
        if now - last < scfg.get("signal_cooldown", 300):
            return

        mid   = (bid+ask)/2 if bid>0 else c[-1]
        spread= (ask-bid)/pip_sz if bid>0 else 0.0
        if spread > scfg.get("spread_filter_pips",3.0) > 0:
            return

        votes: List[Vote] = []

        # ── 1. EMA Crossover ─────────────────────────────────────────────────
        ema_f = Ind.ema(c, cfg.get("ema_fast",9))
        ema_s = Ind.ema(c, cfg.get("ema_slow",21))
        if not (np.isnan(ema_f[-1]) or np.isnan(ema_s[-1]) or
                np.isnan(ema_f[-2]) or np.isnan(ema_s[-2])):
            crossed_up   = ema_f[-2]<=ema_s[-2] and ema_f[-1]>ema_s[-1]
            crossed_down = ema_f[-2]>=ema_s[-2] and ema_f[-1]<ema_s[-1]
            if crossed_up:
                votes.append(Vote("EMA Cross",Direction.BUY,2.5,"EMA9 crossed above EMA21"))
            elif crossed_down:
                votes.append(Vote("EMA Cross",Direction.SELL,2.5,"EMA9 crossed below EMA21"))
            elif ema_f[-1]>ema_s[-1]:
                votes.append(Vote("EMA Align",Direction.BUY,1.0,"EMA9 above EMA21"))
            else:
                votes.append(Vote("EMA Align",Direction.SELL,1.0,"EMA9 below EMA21"))

        # ── 2. EMA-200 Trend filter ───────────────────────────────────────────
        ema_t = Ind.ema(c, cfg.get("ema_trend",200))
        if not np.isnan(ema_t[-1]):
            d = Direction.BUY if c[-1]>ema_t[-1] else Direction.SELL
            votes.append(Vote("EMA200",d,2.0,
                              f"Price {'above' if d==Direction.BUY else 'below'} EMA200"))

        # ── 3. MACD Histogram Cross ───────────────────────────────────────────
        ml,sl,hist = Ind.macd(c,cfg.get("macd_fast",12),
                               cfg.get("macd_slow",26),cfg.get("macd_signal",9))
        if not any(np.isnan([hist[-1],hist[-2]])):
            if hist[-2]<=0 and hist[-1]>0:
                votes.append(Vote("MACD",Direction.BUY,2.0,"MACD histogram bullish cross"))
            elif hist[-2]>=0 and hist[-1]<0:
                votes.append(Vote("MACD",Direction.SELL,2.0,"MACD histogram bearish cross"))
            elif hist[-1]>0:
                votes.append(Vote("MACD",Direction.BUY,0.5,"MACD histogram positive"))
            else:
                votes.append(Vote("MACD",Direction.SELL,0.5,"MACD histogram negative"))

        # ── 4. RSI ────────────────────────────────────────────────────────────
        rsi_v = Ind.rsi(c, cfg.get("rsi_period",14))
        if not np.isnan(rsi_v[-1]):
            rv = rsi_v[-1]
            ob = cfg.get("rsi_ob",70); os_ = cfg.get("rsi_os",30)
            if rv < os_:
                votes.append(Vote("RSI",Direction.BUY,1.5,f"RSI oversold ({rv:.1f})"))
            elif rv > ob:
                votes.append(Vote("RSI",Direction.SELL,1.5,f"RSI overbought ({rv:.1f})"))

        # ── 5. RSI Divergence ─────────────────────────────────────────────────
        bull_div, bear_div = Ind.divergence(c, rsi_v, 10)
        if bull_div:
            votes.append(Vote("RSI Div",Direction.BUY,2.0,"Bullish RSI divergence"))
        if bear_div:
            votes.append(Vote("RSI Div",Direction.SELL,2.0,"Bearish RSI divergence"))

        # ── 6. Stochastic ─────────────────────────────────────────────────────
        sk,sd_ = Ind.stochastic(h,l,c,cfg.get("stoch_k",14),
                                 cfg.get("stoch_d",3),cfg.get("stoch_smooth",3))
        if not any(np.isnan([sk[-1],sd_[-1],sk[-2],sd_[-2]])):
            if sk[-2]<sd_[-2] and sk[-1]>sd_[-1] and sk[-1]<20:
                votes.append(Vote("Stoch",Direction.BUY,1.0,"Stochastic bullish cross in oversold"))
            elif sk[-2]>sd_[-2] and sk[-1]<sd_[-1] and sk[-1]>80:
                votes.append(Vote("Stoch",Direction.SELL,1.0,"Stochastic bearish cross in overbought"))

        # ── 7. CCI ────────────────────────────────────────────────────────────
        cci_v = Ind.cci(h,l,c,cfg.get("cci_period",20))
        if not np.isnan(cci_v[-1]):
            if cci_v[-1]<-100:
                votes.append(Vote("CCI",Direction.BUY,1.0,f"CCI oversold ({cci_v[-1]:.0f})"))
            elif cci_v[-1]>100:
                votes.append(Vote("CCI",Direction.SELL,1.0,f"CCI overbought ({cci_v[-1]:.0f})"))

        # ── 8. Williams %R ────────────────────────────────────────────────────
        wr = Ind.williams_r(h,l,c,cfg.get("williams_period",14))
        if not np.isnan(wr[-1]):
            if wr[-1]<-80:
                votes.append(Vote("Williams%R",Direction.BUY,1.0,f"%R oversold ({wr[-1]:.0f})"))
            elif wr[-1]>-20:
                votes.append(Vote("Williams%R",Direction.SELL,1.0,f"%R overbought ({wr[-1]:.0f})"))

        # ── 9. MFI ────────────────────────────────────────────────────────────
        mfi_v = Ind.mfi(h,l,c,v,cfg.get("mfi_period",14))
        if not np.isnan(mfi_v[-1]):
            if mfi_v[-1]<20:
                votes.append(Vote("MFI",Direction.BUY,1.0,f"MFI oversold ({mfi_v[-1]:.0f})"))
            elif mfi_v[-1]>80:
                votes.append(Vote("MFI",Direction.SELL,1.0,f"MFI overbought ({mfi_v[-1]:.0f})"))

        # ── 10. Bollinger Bands ───────────────────────────────────────────────
        bb_u,bb_m,bb_l = Ind.bollinger(c,cfg.get("bb_period",20),cfg.get("bb_std",2.0))
        if not any(np.isnan([bb_u[-1],bb_l[-1]])) and (bb_u[-1]-bb_l[-1])>0:
            pctb = (c[-1]-bb_l[-1])/(bb_u[-1]-bb_l[-1])
            if pctb<0.05:
                votes.append(Vote("BB",Direction.BUY,1.5,"Price at lower Bollinger Band"))
            elif pctb>0.95:
                votes.append(Vote("BB",Direction.SELL,1.5,"Price at upper Bollinger Band"))

        # ── 11. SuperTrend ────────────────────────────────────────────────────
        st,dr = Ind.supertrend(h,l,c,cfg.get("supertrend_period",10),
                                cfg.get("supertrend_mult",3.0))
        if not any(np.isnan([st[-1],st[-2]])):
            if dr[-2]==-1 and dr[-1]==1:
                votes.append(Vote("SuperTrend",Direction.BUY,2.5,"SuperTrend flipped BULLISH"))
            elif dr[-2]==1 and dr[-1]==-1:
                votes.append(Vote("SuperTrend",Direction.SELL,2.5,"SuperTrend flipped BEARISH"))
            elif dr[-1]==1:
                votes.append(Vote("SuperTrend",Direction.BUY,1.0,"SuperTrend bullish"))
            else:
                votes.append(Vote("SuperTrend",Direction.SELL,1.0,"SuperTrend bearish"))

        # ── 12. Ichimoku ──────────────────────────────────────────────────────
        ich = Ind.ichimoku(h,l,c,cfg.get("ichimoku_tenkan",9),
                            cfg.get("ichimoku_kijun",26),cfg.get("ichimoku_senkou",52))
        if not any(np.isnan([ich["tenkan"][-1],ich["kijun"][-1],
                              ich["senkou_a"][-1],ich["senkou_b"][-1]])):
            t=ich["tenkan"][-1]; k=ich["kijun"][-1]
            cloud_top=max(ich["senkou_a"][-1],ich["senkou_b"][-1])
            cloud_bot=min(ich["senkou_a"][-1],ich["senkou_b"][-1])
            if c[-1]>cloud_top and t>k:
                votes.append(Vote("Ichimoku",Direction.BUY,2.5,"Price above cloud, Tenkan>Kijun"))
            elif c[-1]<cloud_bot and t<k:
                votes.append(Vote("Ichimoku",Direction.SELL,2.5,"Price below cloud, Tenkan<Kijun"))

        # ── 13. ADX ───────────────────────────────────────────────────────────
        adx_v,dip,dim = Ind.adx(h,l,c,cfg.get("adx_period",14))
        thresh = cfg.get("adx_thresh",25)
        if not any(np.isnan([adx_v[-1],dip[-1],dim[-1]])):
            if adx_v[-1]>thresh:
                d = Direction.BUY if dip[-1]>dim[-1] else Direction.SELL
                votes.append(Vote("ADX",d,1.5,
                                  f"ADX={adx_v[-1]:.0f} trend {'up' if d==Direction.BUY else 'down'}"))

        # ── 14. Squeeze Momentum ─────────────────────────────────────────────
        mom,sq = Ind.squeeze(h,l,c,cfg.get("squeeze_bb",20),cfg.get("squeeze_kc",20))
        if not any(np.isnan([mom[-1],mom[-2]])):
            if sq[-2] and not sq[-1]:   # squeeze released
                d = Direction.BUY if mom[-1]>0 else Direction.SELL
                votes.append(Vote("Squeeze",d,1.5,
                                  f"Squeeze released {'bullish' if d==Direction.BUY else 'bearish'}"))
            elif not np.isnan(mom[-1]):
                if mom[-2]<0 and mom[-1]>0:
                    votes.append(Vote("Squeeze",Direction.BUY,0.5,"Squeeze momentum turned positive"))
                elif mom[-2]>0 and mom[-1]<0:
                    votes.append(Vote("Squeeze",Direction.SELL,0.5,"Squeeze momentum turned negative"))

        # ── 15. Donchian breakout ─────────────────────────────────────────────
        dc_u,dc_m,dc_l = Ind.donchian(h,l,cfg.get("donchian_period",20))
        if not any(np.isnan([dc_u[-2],dc_l[-2]])):
            if c[-1]>dc_u[-2]:
                votes.append(Vote("Donchian",Direction.BUY,1.5,"Donchian upper breakout"))
            elif c[-1]<dc_l[-2]:
                votes.append(Vote("Donchian",Direction.SELL,1.5,"Donchian lower breakout"))

        # ── 16. Keltner ───────────────────────────────────────────────────────
        kc_u,kc_m,kc_l = Ind.keltner(h,l,c,cfg.get("keltner_period",20),
                                       cfg.get("keltner_mult",2.0))
        if not any(np.isnan([kc_u[-1],kc_l[-1]])):
            if c[-1]>kc_u[-1]:
                votes.append(Vote("Keltner",Direction.SELL,1.0,"Price above Keltner upper"))
            elif c[-1]<kc_l[-1]:
                votes.append(Vote("Keltner",Direction.BUY,1.0,"Price below Keltner lower"))

        # ── 17. VWAP ──────────────────────────────────────────────────────────
        if cfg.get("vwap_enabled",True):
            vwap_v = Ind.vwap(h,l,c,v)
            if not np.isnan(vwap_v[-1]):
                d = Direction.BUY if c[-1]>vwap_v[-1] else Direction.SELL
                votes.append(Vote("VWAP",d,1.0,
                                  f"Price {'above' if d==Direction.BUY else 'below'} VWAP"))

        # ── 18. OBV ───────────────────────────────────────────────────────────
        obv_v  = Ind.obv(c,v)
        obv_em = Ind.ema(obv_v,20)
        if not np.isnan(obv_em[-1]):
            d = Direction.BUY if obv_v[-1]>obv_em[-1] else Direction.SELL
            votes.append(Vote("OBV",d,1.0,
                              f"OBV {'above' if d==Direction.BUY else 'below'} EMA20"))

        # ── 19. Candlestick patterns ──────────────────────────────────────────
        pats = Ind.candle_patterns(o,h,l,c)
        for pname, pdir in pats.items():
            if pdir==1:
                votes.append(Vote("Pattern",Direction.BUY,2.0,f"Bullish {pname}"))
                break
            elif pdir==-1:
                votes.append(Vote("Pattern",Direction.SELL,2.0,f"Bearish {pname}"))
                break

        # ── 20. Pivot Point S/R ───────────────────────────────────────────────
        if len(h)>=2:
            pivs = Ind.pivots_classic(h[-2],l[-2],c[-2])
            tol  = 0.002*c[-1]
            for lvl in [pivs["s1"],pivs["s2"],pivs["s3"]]:
                if abs(c[-1]-lvl)<tol:
                    votes.append(Vote("Pivot",Direction.BUY,1.5,
                                      f"Price near pivot support {lvl:.5f}"))
                    break
            for lvl in [pivs["r1"],pivs["r2"],pivs["r3"]]:
                if abs(c[-1]-lvl)<tol:
                    votes.append(Vote("Pivot",Direction.SELL,1.5,
                                      f"Price near pivot resistance {lvl:.5f}"))
                    break

        # ── 21. Hurst + Z-Score regime ────────────────────────────────────────
        H = Ind.hurst(c)
        if H > 0.55:   # trending
            slope_v = Ind.linreg_slope(c,20)
            if not np.isnan(slope_v[-1]):
                d = Direction.BUY if slope_v[-1]>0 else Direction.SELL
                votes.append(Vote("Hurst",d,1.0,
                                  f"Hurst={H:.2f} trending {'up' if d==Direction.BUY else 'down'}"))
        elif H < 0.45:  # mean-reverting
            zs = Ind.zscore(c,20)
            if not np.isnan(zs[-1]):
                if zs[-1]<-2.0:
                    votes.append(Vote("ZScore",Direction.BUY,1.0,
                                      f"Z-Score={zs[-1]:.1f} mean-reversion BUY"))
                elif zs[-1]>2.0:
                    votes.append(Vote("ZScore",Direction.SELL,1.0,
                                      f"Z-Score={zs[-1]:.1f} mean-reversion SELL"))

        # ── 22. ML filter ──────────────────────────────────────────────────────
        ml_filter = self._ml_filter(pair)
        p_bull, p_bear = ml_filter.predict(o,h,l,c,v)
        thresh_ml = self.config.ml_cfg.get("confidence_thresh",0.60)
        if scfg.get("use_ml_filter",True):
            if p_bull >= thresh_ml:
                votes.append(Vote("ML",Direction.BUY,3.0,
                                  f"ML bullish probability {p_bull:.0%}"))
            elif p_bear >= thresh_ml:
                votes.append(Vote("ML",Direction.SELL,3.0,
                                  f"ML bearish probability {p_bear:.0%}"))

        # ── Tally votes ────────────────────────────────────────────────────────
        if not votes:
            return
        bull_w = sum(v.weight for v in votes if v.direction==Direction.BUY)
        bear_w = sum(v.weight for v in votes if v.direction==Direction.SELL)
        total_w= sum(v.weight for v in votes
                     if v.direction in (Direction.BUY,Direction.SELL))
        bull_n = sum(1 for v in votes if v.direction==Direction.BUY)
        bear_n = sum(1 for v in votes if v.direction==Direction.SELL)
        min_conf = scfg.get("min_confluence",3)

        if bull_w > bear_w and bull_n >= min_conf:
            direction = Direction.BUY
            confidence= bull_w/total_w if total_w>0 else 0.5
        elif bear_w > bull_w and bear_n >= min_conf:
            direction = Direction.SELL
            confidence= bear_w/total_w if total_w>0 else 0.5
        else:
            return

        if confidence < 0.52:
            return

        # ── ATR-based SL/TP ───────────────────────────────────────────────────
        atr_v = Ind.atr(h,l,c,14)
        atr   = float(atr_v[-1]) if not np.isnan(atr_v[-1]) else pip_sz*20
        sl_mult= rcfg.get("default_sl_atr_mult",2.0)
        rr     = rcfg.get("default_tp_rr",2.0)
        sl_dist= atr * sl_mult
        tp_dist= sl_dist * rr

        if direction == Direction.BUY:
            entry = float(ask) if ask>0 else c[-1]
            sl    = entry - sl_dist
            tp1   = entry + tp_dist
            tp2   = entry + tp_dist*1.5
            tp3   = entry + tp_dist*2.0
        else:
            entry = float(bid) if bid>0 else c[-1]
            sl    = entry + sl_dist
            tp1   = entry - tp_dist
            tp2   = entry - tp_dist*1.5
            tp3   = entry - tp_dist*2.0

        rr_actual = abs(tp1-entry)/abs(sl-entry) if abs(sl-entry)>0 else rr

        # ── Strength ──────────────────────────────────────────────────────────
        if confidence >= 0.80:   strength = Strength.VERY_STRONG
        elif confidence >= 0.70: strength = Strength.STRONG
        elif confidence >= 0.60: strength = Strength.MODERATE
        else:                    strength = Strength.WEAK

        # ── Position size from risk manager ───────────────────────────────────
        lot_size = self.risk.suggest_lot(pair, entry, sl)

        # ── Notes ─────────────────────────────────────────────────────────────
        active_notes = [v.note for v in votes
                        if v.direction==direction and v.note][:6]

        sig = TradingSignal(
            pair        = pair,
            direction   = direction,
            strength    = strength,
            entry_price = round(entry,5),
            stop_loss   = round(sl,5),
            take_profit = round(tp1,5),
            tp2         = round(tp2,5),
            tp3         = round(tp3,5),
            confidence  = round(confidence,4),
            votes_bull  = bull_n,
            votes_bear  = bear_n,
            atr         = round(atr,5),
            spread_pips = round(spread,1),
            session     = _current_sessions(),
            timeframe   = tf,
            risk_reward = round(rr_actual,2),
            lot_size    = lot_size,
            notes       = active_notes,
        )

        self._last_signal[pair] = now
        logger.info("SIGNAL %s %s  conf=%.0f%%  entry=%.5f  SL=%.5f  TP=%.5f",
                    pair, direction.name, confidence*100,
                    entry, sl, tp1)
        self._fire(sig)

    # Called by TradingEngine to optionally auto-trade signals
    def handle_signal_for_auto(self, sig: TradingSignal, engine) -> None:
        if not self.config.signal_cfg.get("auto_trade",False):
            return
        d = "BUY" if sig.direction==Direction.BUY else "SELL"
        engine.open_market(sig.pair, d, sig.lot_size,
                           sl=sig.stop_loss, tp=sig.take_profit,
                           comment=f"Auto {sig.strength_str} {sig.timeframe}",
                           is_signal=1)
