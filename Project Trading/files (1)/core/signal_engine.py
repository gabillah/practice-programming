"""
core/signal_engine.py
─────────────────────
Advanced multi-strategy signal fusion engine.

Implements:
  • Trend-following  : EMA crossovers, SuperTrend, Ichimoku, ADX
  • Momentum         : RSI, MACD, Stochastics, CCI, Williams %R, MFI
  • Volatility       : Bollinger Bands, Keltner Channels, ATR, Squeeze Momentum
  • Volume           : OBV, VWAP, MFI, Volume Profile
  • Structure        : Pivot Points, Support/Resistance, Donchian Channels
  • Price Action     : Candlestick patterns, Higher-High/Lower-Low detection
  • Mean Reversion   : Z-Score, Bollinger Band %B, RSI divergence
  • Statistical      : Hurst Exponent, Autocorrelation, Kalman Filter
  • ML               : Random Forest probability filter

Signal fusion: weighted voting with confluence threshold.
"""

from __future__ import annotations
import logging
import time
import math
from collections import defaultdict, deque
from dataclasses import dataclass, field
from enum  import Enum, auto
from typing import Dict, List, Optional, Tuple, Deque, Any

import numpy  as np
import pandas as pd

from core.config_manager import ConfigManager
from risk.risk_manager   import RiskManager
from ml.pattern_engine   import PatternEngine

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
class Direction(Enum):
    BUY  = auto()
    SELL = auto()
    FLAT = auto()


class SignalStrength(Enum):
    WEAK     = 1
    MODERATE = 2
    STRONG   = 3
    VERY_STRONG = 4


# ─────────────────────────────────────────────────────────────────────────────
@dataclass
class IndicatorVote:
    name:      str
    direction: Direction
    weight:    float = 1.0
    value:     float = 0.0
    note:      str   = ""


@dataclass
class TradingSignal:
    pair:           str
    direction:      Direction
    strength:       SignalStrength
    entry_price:    float
    stop_loss:      float
    take_profit:    float
    take_profit_2:  float
    take_profit_3:  float
    confidence:     float           # 0.0 – 1.0
    votes_bull:     int
    votes_bear:     int
    votes_total:    int
    atr:            float
    spread_pips:    float
    session:        str
    timeframe:      str
    timestamp:      float = field(default_factory=time.time)
    indicator_notes: List[str] = field(default_factory=list)
    risk_reward:    float = 0.0
    position_size:  float = 0.0     # Lots
    pip_value:      float = 0.0

    @property
    def is_actionable(self) -> bool:
        return self.direction != Direction.FLAT and self.confidence >= 0.55

    def to_dict(self) -> dict:
        return {
            "pair":         self.pair,
            "direction":    self.direction.name,
            "strength":     self.strength.name,
            "entry":        round(self.entry_price, 5),
            "sl":           round(self.stop_loss,   5),
            "tp1":          round(self.take_profit,  5),
            "tp2":          round(self.take_profit_2,5),
            "tp3":          round(self.take_profit_3,5),
            "confidence":   round(self.confidence * 100, 1),
            "votes_bull":   self.votes_bull,
            "votes_bear":   self.votes_bear,
            "risk_reward":  round(self.risk_reward, 2),
            "size_lots":    round(self.position_size, 2),
            "atr":          round(self.atr, 5),
            "session":      self.session,
            "tf":           self.timeframe,
            "timestamp":    self.timestamp,
            "notes":        self.indicator_notes,
        }


# ─────────────────────────────────────────────────────────────────────────────
# Candlestick bar
# ─────────────────────────────────────────────────────────────────────────────
@dataclass
class Bar:
    timestamp: float
    open:  float
    high:  float
    low:   float
    close: float
    volume: float = 0.0


# ─────────────────────────────────────────────────────────────────────────────
# Per-pair price buffer
# ─────────────────────────────────────────────────────────────────────────────
class PriceBuffer:
    """Rolling window of OHLCV bars + bid/ask spread."""

    MAX_BARS = 500

    def __init__(self, pair: str):
        self.pair   = pair
        self.bars:  Deque[Bar] = deque(maxlen=self.MAX_BARS)
        self.bid    = 0.0
        self.ask    = 0.0
        self.spread = 0.0

    def update_tick(self, bid: float, ask: float) -> None:
        self.bid    = bid
        self.ask    = ask
        self.spread = ask - bid
        # Update last bar's close
        if self.bars:
            self.bars[-1].close = (bid + ask) / 2

    def add_bar(self, bar: Bar) -> None:
        self.bars.append(bar)

    @property
    def mid(self) -> float:
        return (self.bid + self.ask) / 2 if self.bid and self.ask else (
            self.bars[-1].close if self.bars else 0.0
        )

    def to_series(self) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """Returns (opens, highs, lows, closes, volumes) as numpy arrays."""
        if not self.bars:
            empty = np.array([], dtype=float)
            return empty, empty, empty, empty, empty
        o = np.array([b.open   for b in self.bars], dtype=float)
        h = np.array([b.high   for b in self.bars], dtype=float)
        l = np.array([b.low    for b in self.bars], dtype=float)
        c = np.array([b.close  for b in self.bars], dtype=float)
        v = np.array([b.volume for b in self.bars], dtype=float)
        return o, h, l, c, v


# ─────────────────────────────────────────────────────────────────────────────
# Pure math / indicator helpers
# ─────────────────────────────────────────────────────────────────────────────
class Indicators:
    """
    Stateless, pure-NumPy indicator calculations.
    All functions accept/return numpy arrays for speed.
    """

    # ── Moving Averages ───────────────────────────────────────────────────────
    @staticmethod
    def sma(src: np.ndarray, period: int) -> np.ndarray:
        if len(src) < period:
            return np.full(len(src), np.nan)
        result = np.full(len(src), np.nan)
        for i in range(period - 1, len(src)):
            result[i] = src[i - period + 1: i + 1].mean()
        return result

    @staticmethod
    def ema(src: np.ndarray, period: int) -> np.ndarray:
        if len(src) == 0:
            return src.copy()
        k      = 2.0 / (period + 1)
        result = np.full(len(src), np.nan)
        # Seed with first non-nan SMA
        first  = np.nan
        for i, v in enumerate(src):
            if not np.isnan(v):
                if np.isnan(first):
                    first = v
                    result[i] = v
                else:
                    result[i] = v * k + result[i - 1] * (1 - k)
        return result

    @staticmethod
    def wma(src: np.ndarray, period: int) -> np.ndarray:
        weights = np.arange(1, period + 1, dtype=float)
        result  = np.full(len(src), np.nan)
        for i in range(period - 1, len(src)):
            result[i] = np.dot(src[i - period + 1: i + 1], weights) / weights.sum()
        return result

    @staticmethod
    def hma(src: np.ndarray, period: int) -> np.ndarray:
        """Hull Moving Average."""
        half_wma = Indicators.wma(src, period // 2)
        full_wma = Indicators.wma(src, period)
        raw      = 2 * half_wma - full_wma
        return Indicators.wma(raw, int(math.sqrt(period)))

    @staticmethod
    def dema(src: np.ndarray, period: int) -> np.ndarray:
        """Double EMA."""
        e1 = Indicators.ema(src, period)
        e2 = Indicators.ema(e1, period)
        return 2 * e1 - e2

    @staticmethod
    def tema(src: np.ndarray, period: int) -> np.ndarray:
        """Triple EMA."""
        e1 = Indicators.ema(src, period)
        e2 = Indicators.ema(e1, period)
        e3 = Indicators.ema(e2, period)
        return 3 * e1 - 3 * e2 + e3

    @staticmethod
    def kama(src: np.ndarray, fast: int = 2, slow: int = 30, er_period: int = 10) -> np.ndarray:
        """Kaufman Adaptive Moving Average."""
        fast_sc = 2.0 / (fast + 1)
        slow_sc = 2.0 / (slow + 1)
        n       = len(src)
        result  = np.full(n, np.nan)
        if n < er_period + 1:
            return result
        result[er_period] = src[er_period]
        for i in range(er_period + 1, n):
            direction  = abs(src[i] - src[i - er_period])
            volatility = np.sum(np.abs(np.diff(src[i - er_period: i + 1])))
            er         = direction / volatility if volatility != 0 else 0
            sc         = (er * (fast_sc - slow_sc) + slow_sc) ** 2
            result[i]  = result[i-1] + sc * (src[i] - result[i-1])
        return result

    # ── RSI ───────────────────────────────────────────────────────────────────
    @staticmethod
    def rsi(src: np.ndarray, period: int = 14) -> np.ndarray:
        n      = len(src)
        result = np.full(n, np.nan)
        if n < period + 1:
            return result
        deltas = np.diff(src)
        gains  = np.where(deltas > 0, deltas, 0.0)
        losses = np.where(deltas < 0, -deltas, 0.0)
        avg_g  = gains[:period].mean()
        avg_l  = losses[:period].mean()
        if avg_l == 0:
            result[period] = 100
        else:
            result[period] = 100 - 100 / (1 + avg_g / avg_l)
        for i in range(period + 1, n):
            avg_g = (avg_g * (period - 1) + gains[i-1]) / period
            avg_l = (avg_l * (period - 1) + losses[i-1]) / period
            if avg_l == 0:
                result[i] = 100
            else:
                result[i] = 100 - 100 / (1 + avg_g / avg_l)
        return result

    # ── MACD ──────────────────────────────────────────────────────────────────
    @staticmethod
    def macd(src: np.ndarray, fast: int = 12, slow: int = 26, signal: int = 9
             ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        ema_fast   = Indicators.ema(src, fast)
        ema_slow   = Indicators.ema(src, slow)
        macd_line  = ema_fast - ema_slow
        signal_line= Indicators.ema(macd_line, signal)
        histogram  = macd_line - signal_line
        return macd_line, signal_line, histogram

    # ── Bollinger Bands ────────────────────────────────────────────────────────
    @staticmethod
    def bollinger(src: np.ndarray, period: int = 20, std_dev: float = 2.0
                  ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        mid   = Indicators.sma(src, period)
        std   = np.array([
            src[max(0, i-period+1):i+1].std(ddof=0) if i >= period-1 else np.nan
            for i in range(len(src))
        ])
        upper = mid + std_dev * std
        lower = mid - std_dev * std
        return upper, mid, lower

    @staticmethod
    def bb_percent_b(src: np.ndarray, period: int = 20, std_dev: float = 2.0) -> np.ndarray:
        upper, mid, lower = Indicators.bollinger(src, period, std_dev)
        width = upper - lower
        with np.errstate(invalid="ignore", divide="ignore"):
            pct_b = np.where(width > 0, (src - lower) / width, np.nan)
        return pct_b

    # ── Stochastic ─────────────────────────────────────────────────────────────
    @staticmethod
    def stochastic(high: np.ndarray, low: np.ndarray, close: np.ndarray,
                   k_period: int = 14, d_period: int = 3, smooth: int = 3
                   ) -> Tuple[np.ndarray, np.ndarray]:
        n  = len(close)
        k_raw = np.full(n, np.nan)
        for i in range(k_period - 1, n):
            h_max = high[i - k_period + 1: i + 1].max()
            l_min = low[i - k_period + 1: i + 1].min()
            rng   = h_max - l_min
            k_raw[i] = 100 * (close[i] - l_min) / rng if rng > 0 else 50.0
        k_smooth = Indicators.sma(k_raw, smooth)
        d_smooth = Indicators.sma(k_smooth, d_period)
        return k_smooth, d_smooth

    # ── ATR ────────────────────────────────────────────────────────────────────
    @staticmethod
    def atr(high: np.ndarray, low: np.ndarray, close: np.ndarray,
            period: int = 14) -> np.ndarray:
        n  = len(close)
        tr = np.full(n, np.nan)
        for i in range(1, n):
            tr[i] = max(
                high[i] - low[i],
                abs(high[i] - close[i-1]),
                abs(low[i]  - close[i-1]),
            )
        return Indicators.ema(tr, period)

    # ── ADX ────────────────────────────────────────────────────────────────────
    @staticmethod
    def adx(high: np.ndarray, low: np.ndarray, close: np.ndarray,
            period: int = 14) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        n   = len(close)
        dm_plus  = np.full(n, 0.0)
        dm_minus = np.full(n, 0.0)
        tr_arr   = np.full(n, np.nan)
        for i in range(1, n):
            h_diff = high[i]  - high[i-1]
            l_diff = low[i-1] - low[i]
            dm_plus[i]  = h_diff if h_diff > l_diff and h_diff > 0 else 0
            dm_minus[i] = l_diff if l_diff > h_diff and l_diff > 0 else 0
            tr_arr[i]   = max(high[i]-low[i], abs(high[i]-close[i-1]), abs(low[i]-close[i-1]))
        # Smoothed versions
        atr14   = Indicators._wilder_smooth(tr_arr, period)
        dmp14   = Indicators._wilder_smooth(dm_plus, period)
        dmm14   = Indicators._wilder_smooth(dm_minus, period)
        with np.errstate(invalid="ignore", divide="ignore"):
            di_plus  = 100 * np.where(atr14 > 0, dmp14 / atr14, 0)
            di_minus = 100 * np.where(atr14 > 0, dmm14 / atr14, 0)
            di_sum   = di_plus + di_minus
            dx       = 100 * np.where(di_sum > 0, np.abs(di_plus - di_minus) / di_sum, 0)
        adx_line = Indicators._wilder_smooth(dx, period)
        return adx_line, di_plus, di_minus

    @staticmethod
    def _wilder_smooth(src: np.ndarray, period: int) -> np.ndarray:
        result = np.full(len(src), np.nan)
        seed_idx = period
        if seed_idx >= len(src):
            return result
        # First value = average of first 'period' values
        valid = src[1:period+1]
        if len(valid) < period:
            return result
        result[period] = valid.mean()
        for i in range(period + 1, len(src)):
            result[i] = (result[i-1] * (period - 1) + src[i]) / period
        return result

    # ── CCI ────────────────────────────────────────────────────────────────────
    @staticmethod
    def cci(high: np.ndarray, low: np.ndarray, close: np.ndarray,
            period: int = 20) -> np.ndarray:
        tp     = (high + low + close) / 3
        n      = len(tp)
        result = np.full(n, np.nan)
        for i in range(period - 1, n):
            window   = tp[i - period + 1: i + 1]
            mean_dev = np.abs(window - window.mean()).mean()
            if mean_dev > 0:
                result[i] = (tp[i] - window.mean()) / (0.015 * mean_dev)
        return result

    # ── Williams %R ────────────────────────────────────────────────────────────
    @staticmethod
    def williams_r(high: np.ndarray, low: np.ndarray, close: np.ndarray,
                   period: int = 14) -> np.ndarray:
        n      = len(close)
        result = np.full(n, np.nan)
        for i in range(period - 1, n):
            h_max = high[i - period + 1: i + 1].max()
            l_min = low[i - period + 1: i + 1].min()
            rng   = h_max - l_min
            result[i] = -100 * (h_max - close[i]) / rng if rng > 0 else -50
        return result

    # ── Ichimoku ────────────────────────────────────────────────────────────────
    @staticmethod
    def ichimoku(high: np.ndarray, low: np.ndarray, close: np.ndarray,
                 tenkan: int = 9, kijun: int = 26, senkou_b: int = 52
                 ) -> Dict[str, np.ndarray]:
        def mid_range(h, l, p):
            n   = len(h)
            res = np.full(n, np.nan)
            for i in range(p - 1, n):
                res[i] = (h[i-p+1:i+1].max() + l[i-p+1:i+1].min()) / 2
            return res

        tenkan_sen = mid_range(high, low, tenkan)
        kijun_sen  = mid_range(high, low, kijun)
        senkou_a   = (tenkan_sen + kijun_sen) / 2
        senkou_b_l = mid_range(high, low, senkou_b)
        chikou     = np.roll(close, -kijun)
        chikou[len(chikou)-kijun:] = np.nan
        return {
            "tenkan":   tenkan_sen,
            "kijun":    kijun_sen,
            "senkou_a": senkou_a,
            "senkou_b": senkou_b_l,
            "chikou":   chikou,
        }

    # ── SuperTrend ──────────────────────────────────────────────────────────────
    @staticmethod
    def supertrend(high: np.ndarray, low: np.ndarray, close: np.ndarray,
                   period: int = 10, multiplier: float = 3.0
                   ) -> Tuple[np.ndarray, np.ndarray]:
        """Returns (supertrend_line, direction) where direction +1=bull, -1=bear."""
        atr_vals = Indicators.atr(high, low, close, period)
        n        = len(close)
        upper    = np.full(n, np.nan)
        lower    = np.full(n, np.nan)
        st       = np.full(n, np.nan)
        direction= np.full(n, 1.0)
        for i in range(period, n):
            mid       = (high[i] + low[i]) / 2
            upper[i]  = mid + multiplier * atr_vals[i]
            lower[i]  = mid - multiplier * atr_vals[i]
            if i == period:
                st[i] = upper[i]
                continue
            if close[i] > st[i-1]:
                st[i]        = max(lower[i], st[i-1]) if st[i-1] == lower[i-1] else lower[i]
                direction[i] = 1
            else:
                st[i]        = min(upper[i], st[i-1]) if st[i-1] == upper[i-1] else upper[i]
                direction[i] = -1
        return st, direction

    # ── Keltner Channel ─────────────────────────────────────────────────────────
    @staticmethod
    def keltner(high: np.ndarray, low: np.ndarray, close: np.ndarray,
                period: int = 20, atr_mult: float = 2.0
                ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        mid   = Indicators.ema(close, period)
        atr_v = Indicators.atr(high, low, close, period)
        upper = mid + atr_mult * atr_v
        lower = mid - atr_mult * atr_v
        return upper, mid, lower

    # ── Squeeze Momentum ───────────────────────────────────────────────────────
    @staticmethod
    def squeeze_momentum(high: np.ndarray, low: np.ndarray, close: np.ndarray,
                         bb_period: int = 20, kc_period: int = 20
                         ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Returns (momentum, squeeze_on) where squeeze_on=True means
        Bollinger Bands are inside Keltner Channels.
        """
        bb_upper, bb_mid, bb_lower = Indicators.bollinger(close, bb_period, 2.0)
        kc_upper, kc_mid, kc_lower = Indicators.keltner(high, low, close, kc_period, 1.5)
        squeeze_on = (bb_upper < kc_upper) & (bb_lower > kc_lower)

        # Momentum = linear regression of (close - midpoint of BB/KC)
        midpoint = (bb_mid + kc_mid) / 2
        delta    = close - midpoint
        n        = len(close)
        momentum = np.full(n, np.nan)
        period   = bb_period
        for i in range(period - 1, n):
            window = delta[i - period + 1: i + 1]
            x      = np.arange(period, dtype=float)
            if not np.any(np.isnan(window)):
                coeffs    = np.polyfit(x, window, 1)
                momentum[i] = coeffs[0]   # slope
        return momentum, squeeze_on

    # ── Donchian Channel ────────────────────────────────────────────────────────
    @staticmethod
    def donchian(high: np.ndarray, low: np.ndarray,
                 period: int = 20) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        n     = len(high)
        upper = np.full(n, np.nan)
        lower = np.full(n, np.nan)
        for i in range(period - 1, n):
            upper[i] = high[i - period + 1: i + 1].max()
            lower[i] = low[i - period + 1: i + 1].min()
        mid = (upper + lower) / 2
        return upper, mid, lower

    # ── Pivot Points ────────────────────────────────────────────────────────────
    @staticmethod
    def pivot_classic(h: float, l: float, c: float) -> Dict[str, float]:
        pp = (h + l + c) / 3
        return {
            "pp": pp,
            "r1": 2*pp - l, "r2": pp + (h - l), "r3": h + 2*(pp - l),
            "s1": 2*pp - h, "s2": pp - (h - l), "s3": l - 2*(h - pp),
        }

    @staticmethod
    def pivot_fibonacci(h: float, l: float, c: float) -> Dict[str, float]:
        pp  = (h + l + c) / 3
        rng = h - l
        return {
            "pp": pp,
            "r1": pp + 0.382 * rng, "r2": pp + 0.618 * rng, "r3": pp + 1.000 * rng,
            "s1": pp - 0.382 * rng, "s2": pp - 0.618 * rng, "s3": pp - 1.000 * rng,
        }

    @staticmethod
    def pivot_camarilla(h: float, l: float, c: float) -> Dict[str, float]:
        rng = h - l
        return {
            "pp": (h+l+c)/3,
            "r1": c + rng*1.1/12, "r2": c + rng*1.1/6,
            "r3": c + rng*1.1/4,  "r4": c + rng*1.1/2,
            "s1": c - rng*1.1/12, "s2": c - rng*1.1/6,
            "s3": c - rng*1.1/4,  "s4": c - rng*1.1/2,
        }

    # ── VWAP ───────────────────────────────────────────────────────────────────
    @staticmethod
    def vwap(high: np.ndarray, low: np.ndarray, close: np.ndarray,
             volume: np.ndarray) -> np.ndarray:
        tp       = (high + low + close) / 3
        cum_tpv  = np.cumsum(tp * volume)
        cum_vol  = np.cumsum(volume)
        with np.errstate(invalid="ignore", divide="ignore"):
            return np.where(cum_vol > 0, cum_tpv / cum_vol, np.nan)

    # ── OBV ────────────────────────────────────────────────────────────────────
    @staticmethod
    def obv(close: np.ndarray, volume: np.ndarray) -> np.ndarray:
        n      = len(close)
        result = np.zeros(n)
        for i in range(1, n):
            if close[i] > close[i-1]:
                result[i] = result[i-1] + volume[i]
            elif close[i] < close[i-1]:
                result[i] = result[i-1] - volume[i]
            else:
                result[i] = result[i-1]
        return result

    # ── MFI (Money Flow Index) ─────────────────────────────────────────────────
    @staticmethod
    def mfi(high: np.ndarray, low: np.ndarray, close: np.ndarray,
            volume: np.ndarray, period: int = 14) -> np.ndarray:
        tp        = (high + low + close) / 3
        mf        = tp * volume
        n         = len(tp)
        result    = np.full(n, np.nan)
        for i in range(period, n):
            pos_flow = 0.0
            neg_flow = 0.0
            for j in range(i - period + 1, i + 1):
                if tp[j] > tp[j-1]:
                    pos_flow += mf[j]
                elif tp[j] < tp[j-1]:
                    neg_flow += mf[j]
            if neg_flow == 0:
                result[i] = 100.0
            else:
                mfr = pos_flow / neg_flow
                result[i] = 100 - 100 / (1 + mfr)
        return result

    # ── Statistical: Z-Score ────────────────────────────────────────────────────
    @staticmethod
    def zscore(src: np.ndarray, period: int = 20) -> np.ndarray:
        n      = len(src)
        result = np.full(n, np.nan)
        for i in range(period - 1, n):
            window = src[i - period + 1: i + 1]
            std    = window.std(ddof=1)
            result[i] = (src[i] - window.mean()) / std if std > 0 else 0.0
        return result

    # ── Hurst Exponent ─────────────────────────────────────────────────────────
    @staticmethod
    def hurst_exponent(src: np.ndarray, min_lag: int = 10, max_lag: int = 100) -> float:
        """
        Hurst Exponent via R/S analysis.
        H < 0.5 → mean-reverting
        H ≈ 0.5 → random walk
        H > 0.5 → trending
        """
        n   = len(src)
        if n < max_lag:
            return 0.5
        lags = range(min_lag, min(max_lag, n // 2))
        rs_list = []
        for lag in lags:
            sub = src[-lag:]
            mean_sub = sub.mean()
            deviations = sub - mean_sub
            cumdev = np.cumsum(deviations)
            r = cumdev.max() - cumdev.min()
            s = sub.std(ddof=1)
            if s > 0:
                rs_list.append(r / s)
        if len(rs_list) < 2:
            return 0.5
        log_lags = np.log(list(lags[:len(rs_list)]))
        log_rs   = np.log(rs_list)
        # Linear regression in log-log space
        coeffs = np.polyfit(log_lags, log_rs, 1)
        return float(coeffs[0])

    # ── Autocorrelation ────────────────────────────────────────────────────────
    @staticmethod
    def autocorrelation(src: np.ndarray, lag: int = 1) -> float:
        if len(src) < lag + 2:
            return 0.0
        x = src[:-lag]
        y = src[lag:]
        corr = np.corrcoef(x, y)
        return float(corr[0, 1]) if corr.shape == (2, 2) else 0.0

    # ── Kalman Filter (price smoothing) ────────────────────────────────────────
    @staticmethod
    def kalman_filter(src: np.ndarray,
                      process_noise: float = 1e-5,
                      measurement_noise: float = 1e-2) -> np.ndarray:
        n      = len(src)
        x      = src[0]          # state estimate
        p      = 1.0             # error covariance
        result = np.full(n, np.nan)
        for i, z in enumerate(src):
            # Predict
            p += process_noise
            # Update
            k          = p / (p + measurement_noise)
            x          = x + k * (z - x)
            p          = (1 - k) * p
            result[i]  = x
        return result

    # ── Divergence detection ───────────────────────────────────────────────────
    @staticmethod
    def detect_divergence(price: np.ndarray, oscillator: np.ndarray,
                          window: int = 10) -> Tuple[bool, bool]:
        """
        Returns (bullish_divergence, bearish_divergence).
        Bullish  : price makes lower low, oscillator makes higher low
        Bearish  : price makes higher high, oscillator makes lower high
        """
        if len(price) < window * 2 or len(oscillator) < window * 2:
            return False, False
        p  = price[-window * 2:]
        o  = oscillator[-window * 2:]
        # Recent vs previous extremes
        half = window
        p_prev_low  = p[:half].min()
        p_curr_low  = p[half:].min()
        o_prev_low  = o[:half][p[:half].argmin()] if not np.isnan(o[:half][p[:half].argmin()]) else np.nan
        o_curr_low  = o[half:][p[half:].argmin()] if not np.isnan(o[half:][p[half:].argmin()]) else np.nan
        p_prev_high = p[:half].max()
        p_curr_high = p[half:].max()
        o_prev_high = o[:half][p[:half].argmax()] if not np.isnan(o[:half][p[:half].argmax()]) else np.nan
        o_curr_high = o[half:][p[half:].argmax()] if not np.isnan(o[half:][p[half:].argmax()]) else np.nan
        bullish = (p_curr_low < p_prev_low and
                   not np.isnan(o_curr_low) and not np.isnan(o_prev_low) and
                   o_curr_low > o_prev_low)
        bearish = (p_curr_high > p_prev_high and
                   not np.isnan(o_curr_high) and not np.isnan(o_prev_high) and
                   o_curr_high < o_prev_high)
        return bullish, bearish

    # ── Candlestick Patterns ───────────────────────────────────────────────────
    @staticmethod
    def detect_candle_patterns(opens: np.ndarray, highs: np.ndarray,
                               lows: np.ndarray, closes: np.ndarray
                               ) -> Dict[str, int]:
        """Returns dict of pattern_name → signal (+1 bull, -1 bear, 0 none)."""
        patterns: Dict[str, int] = {}
        n = len(closes)
        if n < 3:
            return patterns

        o, h, l, c = opens[-3:], highs[-3:], lows[-3:], closes[-3:]
        body_size  = lambda i: abs(c[i] - o[i])
        body_top   = lambda i: max(c[i], o[i])
        body_bot   = lambda i: min(c[i], o[i])
        is_bull    = lambda i: c[i] > o[i]
        is_bear    = lambda i: c[i] < o[i]
        upper_wick = lambda i: h[i] - body_top(i)
        lower_wick = lambda i: body_bot(i) - l[i]
        candle_rng = lambda i: h[i] - l[i]

        # Doji
        doji = body_size(-1) < candle_rng(-1) * 0.1
        if doji:
            patterns["doji"] = 0

        # Hammer (bullish)
        if (lower_wick(-1) > 2 * body_size(-1) and
                upper_wick(-1) < body_size(-1) * 0.3 and
                is_bear(-2)):
            patterns["hammer"] = 1

        # Shooting Star (bearish)
        if (upper_wick(-1) > 2 * body_size(-1) and
                lower_wick(-1) < body_size(-1) * 0.3 and
                is_bull(-2)):
            patterns["shooting_star"] = -1

        # Engulfing Bull
        if (is_bear(-2) and is_bull(-1) and
                c[-1] > o[-2] and o[-1] < c[-2]):
            patterns["bullish_engulfing"] = 1

        # Engulfing Bear
        if (is_bull(-2) and is_bear(-1) and
                c[-1] < o[-2] and o[-1] > c[-2]):
            patterns["bearish_engulfing"] = -1

        # Morning Star
        if n >= 3:
            if (is_bear(-3) and body_size(-2) < candle_rng(-2) * 0.3 and
                    is_bull(-1) and c[-1] > (o[-3] + c[-3]) / 2):
                patterns["morning_star"] = 1

        # Evening Star
        if n >= 3:
            if (is_bull(-3) and body_size(-2) < candle_rng(-2) * 0.3 and
                    is_bear(-1) and c[-1] < (o[-3] + c[-3]) / 2):
                patterns["evening_star"] = -1

        # Marubozu Bull
        if (is_bull(-1) and
                upper_wick(-1) < candle_rng(-1) * 0.02 and
                lower_wick(-1) < candle_rng(-1) * 0.02):
            patterns["marubozu_bull"] = 1

        # Marubozu Bear
        if (is_bear(-1) and
                upper_wick(-1) < candle_rng(-1) * 0.02 and
                lower_wick(-1) < candle_rng(-1) * 0.02):
            patterns["marubozu_bear"] = -1

        # Pinbar Bull
        if (lower_wick(-1) > 0.6 * candle_rng(-1) and
                upper_wick(-1) < 0.2 * candle_rng(-1)):
            patterns["pinbar_bull"] = 1

        # Pinbar Bear
        if (upper_wick(-1) > 0.6 * candle_rng(-1) and
                lower_wick(-1) < 0.2 * candle_rng(-1)):
            patterns["pinbar_bear"] = -1

        return patterns


# ─────────────────────────────────────────────────────────────────────────────
# Signal Engine
# ─────────────────────────────────────────────────────────────────────────────
class SignalEngine:
    """
    Fuses signals from 20+ indicator strategies via weighted voting.

    For each pair on each new bar:
      1. Compute all indicators
      2. Collect directional votes (+weight or −weight)
      3. Score = sum(bull_weights) / total_weights
      4. If |score| > threshold AND confluence ≥ min_confluence: emit TradingSignal
    """

    INDICATOR_WEIGHTS = {
        "ema_cross":          2.5,
        "ema_200_trend":      2.0,
        "macd":               2.0,
        "rsi":                1.5,
        "rsi_divergence":     2.0,
        "stochastic":         1.0,
        "cci":                1.0,
        "williams_r":         1.0,
        "mfi":                1.0,
        "bollinger":          1.5,
        "supertrend":         2.5,
        "ichimoku":           2.5,
        "adx_trend":          1.5,
        "squeeze":            1.5,
        "donchian_break":     1.5,
        "keltner":            1.0,
        "vwap":               1.0,
        "obv_trend":          1.0,
        "candle_pattern":     2.0,
        "pivot_sr":           1.5,
        "hurst_filter":       1.0,
        "zscore":             1.0,
        "ml_pattern":         3.0,
    }

    def __init__(self, config: ConfigManager, risk_mgr: RiskManager,
                 pattern_engine: PatternEngine):
        self.config         = config
        self.risk           = risk_mgr
        self.ml             = pattern_engine
        self.cfg_ind        = config.indicators
        self.cfg_sig        = config.signal_cfg

        self._buffers: Dict[str, PriceBuffer] = {}
        self._last_signal: Dict[str, float]   = {}
        self._signal_callbacks = []

        # Observer pattern: UI registers callbacks
        self._new_signal_callbacks  = []
        self._price_update_callbacks= []

        logger.info("SignalEngine initialised with %d indicator weights",
                    len(self.INDICATOR_WEIGHTS))

    # ── Pair registration ──────────────────────────────────────────────────────
    def register_pair(self, pair: str) -> None:
        if pair not in self._buffers:
            self._buffers[pair] = PriceBuffer(pair)
            self._last_signal[pair] = 0.0
            logger.debug("Registered pair: %s", pair)

    # ── Tick update ────────────────────────────────────────────────────────────
    def on_tick(self, pair: str, bid: float, ask: float) -> None:
        if pair not in self._buffers:
            self.register_pair(pair)
        buf = self._buffers[pair]
        buf.update_tick(bid, ask)
        for cb in self._price_update_callbacks:
            try:
                cb(pair, bid, ask)
            except Exception:
                pass

    # ── Bar update ─────────────────────────────────────────────────────────────
    def on_bar(self, pair: str, bar: Bar, timeframe: str) -> Optional[TradingSignal]:
        if pair not in self._buffers:
            self.register_pair(pair)
        buf = self._buffers[pair]
        buf.add_bar(bar)

        if len(buf.bars) < 50:
            return None   # Not enough data

        # Cooldown check
        cooldown = self.cfg_sig.get("signal_cooldown", 300)
        if time.time() - self._last_signal.get(pair, 0) < cooldown:
            return None

        signal = self._analyse(pair, buf, timeframe)
        if signal and signal.is_actionable:
            self._last_signal[pair] = time.time()
            for cb in self._new_signal_callbacks:
                try:
                    cb(signal)
                except Exception as e:
                    logger.warning("Signal callback error: %s", e)
            return signal
        return None

    # ── Register callbacks ─────────────────────────────────────────────────────
    def on_new_signal(self, callback) -> None:
        self._new_signal_callbacks.append(callback)

    def on_price_update(self, callback) -> None:
        self._price_update_callbacks.append(callback)

    # ── Core analysis ──────────────────────────────────────────────────────────
    def _analyse(self, pair: str, buf: PriceBuffer, timeframe: str
                 ) -> Optional[TradingSignal]:
        o, h, l, c, v = buf.to_series()
        cfg = self.cfg_ind
        votes: List[IndicatorVote] = []

        # ── 1. EMA Crossover ──────────────────────────────────────────────────
        ema_fast  = Indicators.ema(c, cfg["ema_fast"])
        ema_slow  = Indicators.ema(c, cfg["ema_slow"])
        ema_trend = Indicators.ema(c, cfg["ema_trend"])
        if not (np.isnan(ema_fast[-1]) or np.isnan(ema_slow[-1])):
            if ema_fast[-1] > ema_slow[-1] and ema_fast[-2] <= ema_slow[-2]:
                votes.append(IndicatorVote("ema_cross", Direction.BUY, 2.5,
                    ema_fast[-1], "EMA fast crossed above slow"))
            elif ema_fast[-1] < ema_slow[-1] and ema_fast[-2] >= ema_slow[-2]:
                votes.append(IndicatorVote("ema_cross", Direction.SELL, 2.5,
                    ema_fast[-1], "EMA fast crossed below slow"))
            else:
                # Trend alignment (no fresh cross, but direction bias)
                if ema_fast[-1] > ema_slow[-1]:
                    votes.append(IndicatorVote("ema_cross", Direction.BUY, 1.0,
                        ema_fast[-1], "EMA fast above slow (bullish bias)"))
                else:
                    votes.append(IndicatorVote("ema_cross", Direction.SELL, 1.0,
                        ema_fast[-1], "EMA fast below slow (bearish bias)"))

        # ── 2. EMA-200 Trend Filter ────────────────────────────────────────────
        if not np.isnan(ema_trend[-1]) and len(c) >= cfg["ema_trend"]:
            if c[-1] > ema_trend[-1]:
                votes.append(IndicatorVote("ema_200_trend", Direction.BUY, 2.0,
                    ema_trend[-1], "Price above EMA-200 (uptrend)"))
            else:
                votes.append(IndicatorVote("ema_200_trend", Direction.SELL, 2.0,
                    ema_trend[-1], "Price below EMA-200 (downtrend)"))

        # ── 3. MACD ───────────────────────────────────────────────────────────
        macd_l, macd_s, macd_h = Indicators.macd(
            c, cfg["macd_fast"], cfg["macd_slow"], cfg["macd_signal"])
        if not (np.isnan(macd_l[-1]) or np.isnan(macd_s[-1])):
            if macd_h[-1] > 0 and macd_h[-2] <= 0:
                votes.append(IndicatorVote("macd", Direction.BUY, 2.0,
                    macd_h[-1], "MACD histogram crossed above 0"))
            elif macd_h[-1] < 0 and macd_h[-2] >= 0:
                votes.append(IndicatorVote("macd", Direction.SELL, 2.0,
                    macd_h[-1], "MACD histogram crossed below 0"))
            elif macd_l[-1] > 0:
                votes.append(IndicatorVote("macd", Direction.BUY, 0.8,
                    macd_l[-1], "MACD line positive"))
            else:
                votes.append(IndicatorVote("macd", Direction.SELL, 0.8,
                    macd_l[-1], "MACD line negative"))

        # ── 4. RSI ────────────────────────────────────────────────────────────
        rsi_vals = Indicators.rsi(c, cfg["rsi_period"])
        if not np.isnan(rsi_vals[-1]):
            rsi_now = rsi_vals[-1]
            if rsi_now < cfg["rsi_oversold"]:
                votes.append(IndicatorVote("rsi", Direction.BUY, 1.5,
                    rsi_now, f"RSI oversold ({rsi_now:.1f})"))
            elif rsi_now > cfg["rsi_overbought"]:
                votes.append(IndicatorVote("rsi", Direction.SELL, 1.5,
                    rsi_now, f"RSI overbought ({rsi_now:.1f})"))
            elif rsi_now > 55:
                votes.append(IndicatorVote("rsi", Direction.BUY, 0.5,
                    rsi_now, f"RSI bullish zone ({rsi_now:.1f})"))
            elif rsi_now < 45:
                votes.append(IndicatorVote("rsi", Direction.SELL, 0.5,
                    rsi_now, f"RSI bearish zone ({rsi_now:.1f})"))

        # ── 5. RSI Divergence ─────────────────────────────────────────────────
        bull_div, bear_div = Indicators.detect_divergence(c, rsi_vals, 14)
        if bull_div:
            votes.append(IndicatorVote("rsi_divergence", Direction.BUY, 2.0,
                rsi_vals[-1], "Bullish RSI divergence detected"))
        elif bear_div:
            votes.append(IndicatorVote("rsi_divergence", Direction.SELL, 2.0,
                rsi_vals[-1], "Bearish RSI divergence detected"))

        # ── 6. Stochastic ─────────────────────────────────────────────────────
        stoch_k, stoch_d = Indicators.stochastic(
            h, l, c, cfg["stoch_k"], cfg["stoch_d"], cfg["stoch_smooth"])
        if not (np.isnan(stoch_k[-1]) or np.isnan(stoch_d[-1])):
            if stoch_k[-1] < 20 and stoch_k[-1] > stoch_d[-1] and stoch_k[-2] <= stoch_d[-2]:
                votes.append(IndicatorVote("stochastic", Direction.BUY, 1.0,
                    stoch_k[-1], "Stochastic bull cross in oversold"))
            elif stoch_k[-1] > 80 and stoch_k[-1] < stoch_d[-1] and stoch_k[-2] >= stoch_d[-2]:
                votes.append(IndicatorVote("stochastic", Direction.SELL, 1.0,
                    stoch_k[-1], "Stochastic bear cross in overbought"))

        # ── 7. CCI ────────────────────────────────────────────────────────────
        cci_vals = Indicators.cci(h, l, c, cfg["cci_period"])
        if not np.isnan(cci_vals[-1]):
            if cci_vals[-1] < -100:
                votes.append(IndicatorVote("cci", Direction.BUY, 1.0,
                    cci_vals[-1], f"CCI oversold ({cci_vals[-1]:.0f})"))
            elif cci_vals[-1] > 100:
                votes.append(IndicatorVote("cci", Direction.SELL, 1.0,
                    cci_vals[-1], f"CCI overbought ({cci_vals[-1]:.0f})"))

        # ── 8. Williams %R ────────────────────────────────────────────────────
        wr = Indicators.williams_r(h, l, c, cfg["williams_period"])
        if not np.isnan(wr[-1]):
            if wr[-1] < -80:
                votes.append(IndicatorVote("williams_r", Direction.BUY, 1.0,
                    wr[-1], f"Williams %R oversold ({wr[-1]:.1f})"))
            elif wr[-1] > -20:
                votes.append(IndicatorVote("williams_r", Direction.SELL, 1.0,
                    wr[-1], f"Williams %R overbought ({wr[-1]:.1f})"))

        # ── 9. MFI ────────────────────────────────────────────────────────────
        if v.sum() > 0:
            mfi_vals = Indicators.mfi(h, l, c, v, cfg["mfi_period"])
            if not np.isnan(mfi_vals[-1]):
                if mfi_vals[-1] < 20:
                    votes.append(IndicatorVote("mfi", Direction.BUY, 1.0,
                        mfi_vals[-1], f"MFI oversold ({mfi_vals[-1]:.0f})"))
                elif mfi_vals[-1] > 80:
                    votes.append(IndicatorVote("mfi", Direction.SELL, 1.0,
                        mfi_vals[-1], f"MFI overbought ({mfi_vals[-1]:.0f})"))

        # ── 10. Bollinger Bands ───────────────────────────────────────────────
        bb_upper, bb_mid, bb_lower = Indicators.bollinger(
            c, cfg["bb_period"], cfg["bb_std"])
        if not (np.isnan(bb_upper[-1]) or np.isnan(bb_lower[-1])):
            if c[-1] < bb_lower[-1]:
                votes.append(IndicatorVote("bollinger", Direction.BUY, 1.5,
                    bb_lower[-1], "Price below lower Bollinger Band"))
            elif c[-1] > bb_upper[-1]:
                votes.append(IndicatorVote("bollinger", Direction.SELL, 1.5,
                    bb_upper[-1], "Price above upper Bollinger Band"))
            # Bollinger Band squeeze breakout
            pct_b = Indicators.bb_percent_b(c, cfg["bb_period"], cfg["bb_std"])
            if not np.isnan(pct_b[-1]):
                if pct_b[-1] > 1.0:
                    votes.append(IndicatorVote("bollinger", Direction.SELL, 0.5,
                        pct_b[-1], "BB %B > 1 (overbought)"))
                elif pct_b[-1] < 0.0:
                    votes.append(IndicatorVote("bollinger", Direction.BUY, 0.5,
                        pct_b[-1], "BB %B < 0 (oversold)"))

        # ── 11. SuperTrend ───────────────────────────────────────────────────
        st_line, st_dir = Indicators.supertrend(
            h, l, c, cfg["supertrend_period"], cfg["supertrend_mult"])
        if not np.isnan(st_dir[-1]):
            if st_dir[-1] == 1 and st_dir[-2] == -1:
                votes.append(IndicatorVote("supertrend", Direction.BUY, 2.5,
                    st_line[-1], "SuperTrend flipped BULLISH"))
            elif st_dir[-1] == -1 and st_dir[-2] == 1:
                votes.append(IndicatorVote("supertrend", Direction.SELL, 2.5,
                    st_line[-1], "SuperTrend flipped BEARISH"))
            elif st_dir[-1] == 1:
                votes.append(IndicatorVote("supertrend", Direction.BUY, 1.0,
                    st_line[-1], "SuperTrend bullish"))
            else:
                votes.append(IndicatorVote("supertrend", Direction.SELL, 1.0,
                    st_line[-1], "SuperTrend bearish"))

        # ── 12. Ichimoku ──────────────────────────────────────────────────────
        if len(c) >= cfg["ichimoku_senkou"]:
            ichi = Indicators.ichimoku(
                h, l, c, cfg["ichimoku_tenkan"], cfg["ichimoku_kijun"],
                cfg["ichimoku_senkou"])
            t = ichi["tenkan"][-1]; k = ichi["kijun"][-1]
            sa= ichi["senkou_a"][-1]; sb= ichi["senkou_b"][-1]
            if not any(np.isnan([t, k, sa, sb])):
                cloud_top = max(sa, sb); cloud_bot = min(sa, sb)
                if c[-1] > cloud_top and t > k:
                    votes.append(IndicatorVote("ichimoku", Direction.BUY, 2.5,
                        t, "Price above Ichimoku cloud, Tenkan > Kijun"))
                elif c[-1] < cloud_bot and t < k:
                    votes.append(IndicatorVote("ichimoku", Direction.SELL, 2.5,
                        t, "Price below Ichimoku cloud, Tenkan < Kijun"))

        # ── 13. ADX Trend ─────────────────────────────────────────────────────
        adx_line, di_plus, di_minus = Indicators.adx(
            h, l, c, cfg["adx_period"])
        if not (np.isnan(adx_line[-1]) or np.isnan(di_plus[-1])):
            if adx_line[-1] > cfg["adx_threshold"]:
                if di_plus[-1] > di_minus[-1]:
                    votes.append(IndicatorVote("adx_trend", Direction.BUY, 1.5,
                        adx_line[-1], f"ADX {adx_line[-1]:.0f} strong uptrend"))
                else:
                    votes.append(IndicatorVote("adx_trend", Direction.SELL, 1.5,
                        adx_line[-1], f"ADX {adx_line[-1]:.0f} strong downtrend"))

        # ── 14. Squeeze Momentum ──────────────────────────────────────────────
        sq_mom, sq_on = Indicators.squeeze_momentum(
            h, l, c, cfg["squeeze_bb_period"], cfg["squeeze_kc_period"])
        if not np.isnan(sq_mom[-1]):
            # Momentum rising from negative = buy; falling from positive = sell
            if sq_mom[-1] > 0 and sq_mom[-2] <= 0:
                votes.append(IndicatorVote("squeeze", Direction.BUY, 1.5,
                    sq_mom[-1], "Squeeze momentum turned positive"))
            elif sq_mom[-1] < 0 and sq_mom[-2] >= 0:
                votes.append(IndicatorVote("squeeze", Direction.SELL, 1.5,
                    sq_mom[-1], "Squeeze momentum turned negative"))

        # ── 15. Donchian Breakout ─────────────────────────────────────────────
        don_upper, don_mid, don_lower = Indicators.donchian(
            h, l, cfg["donchian_period"])
        if not (np.isnan(don_upper[-1]) or np.isnan(don_lower[-1])):
            if c[-1] > don_upper[-2]:
                votes.append(IndicatorVote("donchian_break", Direction.BUY, 1.5,
                    don_upper[-1], "Donchian breakout above upper band"))
            elif c[-1] < don_lower[-2]:
                votes.append(IndicatorVote("donchian_break", Direction.SELL, 1.5,
                    don_lower[-1], "Donchian breakout below lower band"))

        # ── 16. Keltner Channel ────────────────────────────────────────────────
        kc_upper, kc_mid, kc_lower = Indicators.keltner(
            h, l, c, cfg["keltner_period"], cfg["keltner_atr_mult"])
        if not (np.isnan(kc_upper[-1]) or np.isnan(kc_lower[-1])):
            if c[-1] > kc_upper[-1]:
                votes.append(IndicatorVote("keltner", Direction.BUY, 1.0,
                    kc_upper[-1], "Price above Keltner upper channel"))
            elif c[-1] < kc_lower[-1]:
                votes.append(IndicatorVote("keltner", Direction.SELL, 1.0,
                    kc_lower[-1], "Price below Keltner lower channel"))

        # ── 17. VWAP ─────────────────────────────────────────────────────────
        if v.sum() > 0 and cfg.get("vwap_enabled", True):
            vwap_line = Indicators.vwap(h, l, c, v)
            if not np.isnan(vwap_line[-1]):
                if c[-1] > vwap_line[-1]:
                    votes.append(IndicatorVote("vwap", Direction.BUY, 1.0,
                        vwap_line[-1], "Price above VWAP"))
                else:
                    votes.append(IndicatorVote("vwap", Direction.SELL, 1.0,
                        vwap_line[-1], "Price below VWAP"))

        # ── 18. OBV Trend ────────────────────────────────────────────────────
        if v.sum() > 0:
            obv_line = Indicators.obv(c, v)
            obv_ema  = Indicators.ema(obv_line, 20)
            if not np.isnan(obv_ema[-1]):
                if obv_line[-1] > obv_ema[-1]:
                    votes.append(IndicatorVote("obv_trend", Direction.BUY, 1.0,
                        obv_line[-1], "OBV above its EMA (bullish volume)"))
                else:
                    votes.append(IndicatorVote("obv_trend", Direction.SELL, 1.0,
                        obv_line[-1], "OBV below its EMA (bearish volume)"))

        # ── 19. Candlestick Patterns ──────────────────────────────────────────
        candle_pats = Indicators.detect_candle_patterns(o, h, l, c)
        for pat_name, sig in candle_pats.items():
            if sig == 1:
                votes.append(IndicatorVote("candle_pattern", Direction.BUY, 2.0,
                    0, f"Candlestick: {pat_name.replace('_', ' ').title()}"))
            elif sig == -1:
                votes.append(IndicatorVote("candle_pattern", Direction.SELL, 2.0,
                    0, f"Candlestick: {pat_name.replace('_', ' ').title()}"))

        # ── 20. Pivot Point S/R ────────────────────────────────────────────────
        if len(h) >= 2:
            pivots = Indicators.pivot_classic(h[-2], l[-2], c[-2])
            price  = c[-1]
            near_r = min([v for k, v in pivots.items() if v > price],
                         default=None, key=lambda x: x - price)
            near_s = max([v for k, v in pivots.items() if v < price],
                         default=None, key=lambda x: price - x)
            if near_s is not None and (price - near_s) / price < 0.002:
                votes.append(IndicatorVote("pivot_sr", Direction.BUY, 1.5,
                    near_s, f"Price bouncing off pivot support {near_s:.5f}"))
            if near_r is not None and (near_r - price) / price < 0.002:
                votes.append(IndicatorVote("pivot_sr", Direction.SELL, 1.5,
                    near_r, f"Price near pivot resistance {near_r:.5f}"))

        # ── 21. Hurst Exponent Filter ─────────────────────────────────────────
        if len(c) >= 60:
            hurst = Indicators.hurst_exponent(c, min_lag=10, max_lag=50)
            if hurst > 0.55:
                # Trending market – reinforce trend direction
                if c[-1] > Indicators.ema(c, 20)[-1]:
                    votes.append(IndicatorVote("hurst_filter", Direction.BUY, 1.0,
                        hurst, f"Hurst={hurst:.2f} trending market (bullish)"))
                else:
                    votes.append(IndicatorVote("hurst_filter", Direction.SELL, 1.0,
                        hurst, f"Hurst={hurst:.2f} trending market (bearish)"))
            elif hurst < 0.45:
                # Mean-reverting market
                zscore_v = Indicators.zscore(c, 20)
                if not np.isnan(zscore_v[-1]):
                    if zscore_v[-1] < -2:
                        votes.append(IndicatorVote("zscore", Direction.BUY, 1.0,
                            zscore_v[-1], f"Z-Score={zscore_v[-1]:.2f} mean revert up"))
                    elif zscore_v[-1] > 2:
                        votes.append(IndicatorVote("zscore", Direction.SELL, 1.0,
                            zscore_v[-1], f"Z-Score={zscore_v[-1]:.2f} mean revert down"))

        # ── 22. ML Pattern Filter ─────────────────────────────────────────────
        if self.cfg_sig.get("use_ml_filter", True):
            ml_prob_bull, ml_prob_bear = self.ml.predict(pair, o, h, l, c, v)
            confidence_thresh = self.config.ml_cfg.get("confidence_thresh", 0.60)
            if ml_prob_bull > confidence_thresh:
                votes.append(IndicatorVote("ml_pattern", Direction.BUY, 3.0,
                    ml_prob_bull, f"ML bullish probability: {ml_prob_bull:.0%}"))
            elif ml_prob_bear > confidence_thresh:
                votes.append(IndicatorVote("ml_pattern", Direction.SELL, 3.0,
                    ml_prob_bear, f"ML bearish probability: {ml_prob_bear:.0%}"))

        # ── Tally votes ───────────────────────────────────────────────────────
        return self._tally_and_emit(pair, buf, votes, timeframe, h, l, c, v)

    # ── Vote tallying and signal emission ──────────────────────────────────────
    def _tally_and_emit(self, pair: str, buf: PriceBuffer,
                        votes: List[IndicatorVote], timeframe: str,
                        h: np.ndarray, l: np.ndarray, c: np.ndarray,
                        v: np.ndarray) -> Optional[TradingSignal]:

        bull_weight = sum(vote.weight for vote in votes if vote.direction == Direction.BUY)
        bear_weight = sum(vote.weight for vote in votes if vote.direction == Direction.SELL)
        total_weight= bull_weight + bear_weight

        if total_weight == 0:
            return None

        bull_votes = sum(1 for v2 in votes if v2.direction == Direction.BUY)
        bear_votes = sum(1 for v2 in votes if v2.direction == Direction.SELL)
        min_conf   = self.cfg_sig.get("min_confluence", 3)

        if bull_votes >= min_conf and bull_weight > bear_weight:
            direction   = Direction.BUY
            confidence  = bull_weight / total_weight
            vote_count  = (bull_votes, bear_votes)
        elif bear_votes >= min_conf and bear_weight > bull_weight:
            direction   = Direction.SELL
            confidence  = bear_weight / total_weight
            vote_count  = (bull_votes, bear_votes)
        else:
            return None

        # Skip low-confidence signals
        if confidence < 0.52:
            return None

        # ATR-based stops & targets
        atr_val  = Indicators.atr(h, l, c, self.cfg_ind["atr_period"])
        atr_now  = atr_val[-1] if not np.isnan(atr_val[-1]) else (h[-1] - l[-1])
        sl_mult  = self.config.risk.get("default_sl_atr_mult", 2.0)
        rr       = self.config.risk.get("default_tp_rr", 2.0)
        entry    = buf.mid

        spread_pips = buf.spread / self._get_pip_size(pair)

        # Filter high spread
        max_spread = self.config.risk.get("spread_filter_pips", 3.0)
        if spread_pips > max_spread:
            logger.debug("Signal filtered: spread %.1f > %.1f pips", spread_pips, max_spread)
            return None

        if direction == Direction.BUY:
            sl  = entry - atr_now * sl_mult
            tp1 = entry + atr_now * sl_mult * rr
            tp2 = entry + atr_now * sl_mult * rr * 1.5
            tp3 = entry + atr_now * sl_mult * rr * 2.0
        else:
            sl  = entry + atr_now * sl_mult
            tp1 = entry - atr_now * sl_mult * rr
            tp2 = entry - atr_now * sl_mult * rr * 1.5
            tp3 = entry - atr_now * sl_mult * rr * 2.0

        rr_actual    = abs(tp1 - entry) / abs(sl - entry) if abs(sl - entry) > 0 else 0
        pip_size     = self._get_pip_size(pair)
        risk_pips    = abs(entry - sl) / pip_size
        pos_size     = self.risk.position_size(pair, risk_pips, pip_size)
        session      = self._current_session()

        # Strength classification
        if confidence > 0.80:
            strength = SignalStrength.VERY_STRONG
        elif confidence > 0.70:
            strength = SignalStrength.STRONG
        elif confidence > 0.60:
            strength = SignalStrength.MODERATE
        else:
            strength = SignalStrength.WEAK

        notes = [v2.note for v2 in votes if v2.direction == direction and v2.note]

        return TradingSignal(
            pair           = pair,
            direction      = direction,
            strength       = strength,
            entry_price    = entry,
            stop_loss      = sl,
            take_profit    = tp1,
            take_profit_2  = tp2,
            take_profit_3  = tp3,
            confidence     = confidence,
            votes_bull     = vote_count[0],
            votes_bear     = vote_count[1],
            votes_total    = len(votes),
            atr            = atr_now,
            spread_pips    = spread_pips,
            session        = session,
            timeframe      = timeframe,
            indicator_notes= notes,
            risk_reward    = rr_actual,
            position_size  = pos_size,
            pip_value      = pip_size,
        )

    @staticmethod
    def _get_pip_size(pair: str) -> float:
        """Return pip size for the given pair."""
        if "JPY" in pair:
            return 0.01
        if pair in ("XAU/USD", "XAUUSD"):
            return 0.1
        if pair in ("XAG/USD", "XAGUSD"):
            return 0.001
        return 0.0001

    def _current_session(self) -> str:
        import datetime
        now_utc = datetime.datetime.utcnow()
        hour    = now_utc.hour + now_utc.minute / 60
        sessions = {
            "Sydney":   (21, 6),
            "Tokyo":    (0, 9),
            "London":   (8, 17),
            "New York": (13, 22),
        }
        active = []
        for name, (start, end) in sessions.items():
            if start > end:  # crosses midnight
                if hour >= start or hour < end:
                    active.append(name)
            else:
                if start <= hour < end:
                    active.append(name)
        return "/".join(active) if active else "Off-Hours"

    # ── Public accessors ──────────────────────────────────────────────────────
    def get_buffer(self, pair: str) -> Optional[PriceBuffer]:
        return self._buffers.get(pair)

    def get_indicator_data(self, pair: str) -> Dict[str, Any]:
        """Compute and return all indicators for charting."""
        buf = self._buffers.get(pair)
        if not buf or len(buf.bars) < 30:
            return {}
        o, h, l, c, v = buf.to_series()
        cfg = self.cfg_ind
        result = {}
        try:
            result["ema_fast"]  = Indicators.ema(c, cfg["ema_fast"])
            result["ema_slow"]  = Indicators.ema(c, cfg["ema_slow"])
            result["ema_trend"] = Indicators.ema(c, cfg["ema_trend"])
            result["rsi"]       = Indicators.rsi(c, cfg["rsi_period"])
            result["macd_line"], result["macd_signal"], result["macd_hist"] = Indicators.macd(
                c, cfg["macd_fast"], cfg["macd_slow"], cfg["macd_signal"])
            result["bb_upper"], result["bb_mid"], result["bb_lower"] = Indicators.bollinger(
                c, cfg["bb_period"], cfg["bb_std"])
            result["atr"]       = Indicators.atr(h, l, c, cfg["atr_period"])
            result["st_line"], result["st_dir"] = Indicators.supertrend(
                h, l, c, cfg["supertrend_period"], cfg["supertrend_mult"])
            result["adx"], result["di_plus"], result["di_minus"] = Indicators.adx(
                h, l, c, cfg["adx_period"])
            result["stoch_k"], result["stoch_d"] = Indicators.stochastic(
                h, l, c, cfg["stoch_k"], cfg["stoch_d"])
            result["closes"]    = c
            result["highs"]     = h
            result["lows"]      = l
            result["opens"]     = o
            result["volumes"]   = v
        except Exception as e:
            logger.warning("Indicator computation error: %s", e)
        return result
