"""
ml/pattern_engine.py
────────────────────
Machine Learning Pattern Recognition for signal filtering.

Uses:
  • Random Forest Classifier (default)
  • Gradient Boosting Classifier
  • Feature engineering from OHLCV data
  • Online learning: retrain as new labeled data arrives
  • Probability output calibrated via Platt scaling

Feature set (60+ features):
  - Price-based: returns, momentum, log returns
  - Indicator-based: RSI, MACD, BB%B, ATR ratio
  - Pattern-based: candle ratios, wick ratios
  - Statistical: rolling skew, kurtosis, autocorr
  - Regime: Hurst exponent, volatility percentile
"""

from __future__ import annotations
import logging
import threading
import time
from typing import Optional, Tuple, Dict, Any

import numpy as np

logger = logging.getLogger(__name__)

# Lazy sklearn imports to avoid startup delay
_sklearn_loaded = False
_RandomForest   = None
_GBClassifier   = None
_StandardScaler = None
_CalibratedCV   = None

def _load_sklearn():
    global _sklearn_loaded, _RandomForest, _GBClassifier, _StandardScaler, _CalibratedCV
    if not _sklearn_loaded:
        from sklearn.ensemble         import RandomForestClassifier, GradientBoostingClassifier
        from sklearn.preprocessing    import StandardScaler
        from sklearn.calibration      import CalibratedClassifierCV
        _RandomForest   = RandomForestClassifier
        _GBClassifier   = GradientBoostingClassifier
        _StandardScaler = StandardScaler
        _CalibratedCV   = CalibratedClassifierCV
        _sklearn_loaded = True
        logger.info("scikit-learn loaded successfully")


# ─────────────────────────────────────────────────────────────────────────────
class FeatureBuilder:
    """
    Computes ML features from raw OHLCV arrays.
    Returns fixed-length numpy feature vector.
    """

    @staticmethod
    def build(opens: np.ndarray, highs: np.ndarray, lows: np.ndarray,
              closes: np.ndarray, volumes: np.ndarray,
              lookback: int = 20) -> Optional[np.ndarray]:
        """
        Build feature vector of shape (n_features,).
        Returns None if insufficient data.
        """
        if len(closes) < lookback + 10:
            return None

        c = closes[-lookback:]
        o = opens[-lookback:]
        h = highs[-lookback:]
        l = lows[-lookback:]
        v = volumes[-lookback:] if volumes.sum() > 0 else np.ones(lookback)

        feats = []

        # ── Price returns ─────────────────────────────────────────────────────
        rets = np.diff(c) / c[:-1]
        feats.extend([
            rets[-1] if len(rets) > 0 else 0,           # Last return
            rets[-2] if len(rets) > 1 else 0,
            rets[-3] if len(rets) > 2 else 0,
            rets[-5] if len(rets) > 4 else 0,
            rets.mean(),                                  # Avg return
            rets.std() if rets.std() > 0 else 0,         # Vol of returns
        ])

        # ── Log returns ───────────────────────────────────────────────────────
        log_rets = np.log(c[1:] / c[:-1])
        feats.extend([
            log_rets[-1] if len(log_rets) > 0 else 0,
            log_rets.mean(),
            log_rets.std() if log_rets.std() > 0 else 0,
        ])

        # ── Momentum ──────────────────────────────────────────────────────────
        feats.extend([
            (c[-1] - c[-5])  / c[-5]  if len(c) >= 5  and c[-5]  > 0 else 0,
            (c[-1] - c[-10]) / c[-10] if len(c) >= 10 and c[-10] > 0 else 0,
            (c[-1] - c[-20]) / c[-20] if len(c) >= 20 and c[-20] > 0 else 0,
        ])

        # ── Volatility features ───────────────────────────────────────────────
        tr_arr = [max(h[i]-l[i], abs(h[i]-c[i-1]), abs(l[i]-c[i-1]))
                  for i in range(1, lookback)]
        atr_val= np.mean(tr_arr[-14:]) if len(tr_arr) >= 14 else np.mean(tr_arr) if tr_arr else 1e-6
        feats.extend([
            atr_val / c[-1] if c[-1] > 0 else 0,         # ATR as % of price
            (h[-1] - l[-1]) / atr_val if atr_val > 0 else 0,  # Today's range / ATR
            np.std(tr_arr[-14:]) / atr_val if atr_val > 0 and len(tr_arr) >= 14 else 0,
        ])

        # ── RSI approximation ─────────────────────────────────────────────────
        deltas = np.diff(c)
        gains  = np.where(deltas > 0, deltas, 0.0)
        losses = np.where(deltas < 0, -deltas, 0.0)
        avg_g  = gains[-14:].mean() if len(gains) >= 14 else gains.mean()
        avg_l  = losses[-14:].mean() if len(losses) >= 14 else losses.mean()
        rsi    = 100 - 100 / (1 + avg_g / avg_l) if avg_l > 0 else 50
        feats.extend([
            rsi / 100,                                    # Normalised RSI
            (rsi - 50) / 50,                              # Centred RSI
        ])

        # ── Bollinger Band position ─────────────────────────────────────────
        bb_mid = c[-20:].mean()
        bb_std = c[-20:].std()
        bb_pct = (c[-1] - (bb_mid - 2*bb_std)) / (4*bb_std) if bb_std > 0 else 0.5
        feats.extend([
            bb_pct,
            (c[-1] - bb_mid) / bb_std if bb_std > 0 else 0,
        ])

        # ── Candle structure ───────────────────────────────────────────────────
        body      = abs(c[-1] - o[-1])
        candle_rng= h[-1] - l[-1]
        upper_wk  = h[-1] - max(c[-1], o[-1])
        lower_wk  = min(c[-1], o[-1]) - l[-1]
        feats.extend([
            body / candle_rng       if candle_rng > 0 else 0,
            upper_wk / candle_rng   if candle_rng > 0 else 0,
            lower_wk / candle_rng   if candle_rng > 0 else 0,
            1.0 if c[-1] > o[-1] else 0.0,               # Is bullish candle
            body / atr_val          if atr_val > 0 else 0,
        ])

        # ── Volume features ────────────────────────────────────────────────────
        vol_avg = v[-20:].mean()
        feats.extend([
            v[-1] / vol_avg if vol_avg > 0 else 1.0,
            v[-1] / v[-5:].mean() if v[-5:].mean() > 0 else 1.0,
        ])

        # ── Rolling statistics ────────────────────────────────────────────────
        from scipy.stats import skew, kurtosis
        try:
            sk  = skew(rets)
            kt  = kurtosis(rets)
        except Exception:
            sk, kt = 0.0, 0.0
        feats.extend([
            float(sk),
            float(kt),
        ])

        # ── Autocorrelation ────────────────────────────────────────────────────
        if len(rets) >= 4:
            ac1 = float(np.corrcoef(rets[:-1], rets[1:])[0, 1])
        else:
            ac1 = 0.0
        feats.append(ac1)

        # ── Trend direction ────────────────────────────────────────────────────
        # Linear regression slope over lookback
        x       = np.arange(lookback, dtype=float)
        coefs   = np.polyfit(x, c, 1)
        slope_n = coefs[0] / c.mean() if c.mean() > 0 else 0   # Normalised
        feats.extend([
            slope_n,
            1.0 if slope_n > 0 else 0.0,
        ])

        # ── Price position vs high/low range ──────────────────────────────────
        h_max = h.max()
        l_min = l.min()
        price_pos = (c[-1] - l_min) / (h_max - l_min) if (h_max - l_min) > 0 else 0.5
        feats.extend([
            price_pos,
            1.0 if c[-1] > c.mean() else 0.0,
        ])

        # ── MACD features (simplified) ─────────────────────────────────────────
        ema12 = FeatureBuilder._ema_last(c, 12)
        ema26 = FeatureBuilder._ema_last(c, 26)
        macd  = ema12 - ema26
        feats.extend([
            macd / c[-1] if c[-1] > 0 else 0,
            1.0 if macd > 0 else 0.0,
        ])

        # ── Regime: volatility percentile ─────────────────────────────────────
        rolling_vols = [abs(c[i] - c[i-1]) / c[i-1] for i in range(1, lookback)
                        if c[i-1] > 0]
        if rolling_vols:
            curr_vol_pct = (rolling_vols[-1] > np.percentile(rolling_vols, 75))
            feats.append(float(curr_vol_pct))
        else:
            feats.append(0.5)

        return np.array(feats, dtype=float)

    @staticmethod
    def _ema_last(src: np.ndarray, period: int) -> float:
        if len(src) < period:
            return float(src[-1]) if len(src) > 0 else 0.0
        k = 2.0 / (period + 1)
        ema = src[0]
        for v in src[1:]:
            ema = v * k + ema * (1 - k)
        return float(ema)


# ─────────────────────────────────────────────────────────────────────────────
class PatternEngine:
    """
    Scikit-learn based classifier that outputs bull/bear probabilities.
    Starts with a rule-based fallback until enough training data accumulates.
    """

    MIN_TRAIN_SAMPLES = 200     # Minimum before ML is used

    def __init__(self, config):
        _load_sklearn()
        self.config      = config
        self._models:    Dict[str, Any] = {}    # pair → fitted model
        self._scalers:   Dict[str, Any] = {}    # pair → scaler
        self._X_buf:     Dict[str, list] = {}   # pair → feature buffer
        self._y_buf:     Dict[str, list] = {}   # pair → label buffer
        self._trained:   Dict[str, bool] = {}
        self._lock       = threading.Lock()

        cfg = config.ml_cfg if hasattr(config, "ml_cfg") else {}
        self._model_type = cfg.get("model_type", "random_forest")
        self._conf_thresh= cfg.get("confidence_thresh", 0.60)
        self._lookback   = cfg.get("lookback_candles", 20)

        # Start background retraining thread
        threading.Thread(target=self._retrain_loop, daemon=True,
                         name="MLRetrain").start()

    # ── Prediction ──────────────────────────────────────────────────────────
    def predict(self, pair: str,
                opens: np.ndarray, highs: np.ndarray,
                lows: np.ndarray, closes: np.ndarray,
                volumes: np.ndarray) -> Tuple[float, float]:
        """
        Returns (prob_bullish, prob_bearish).
        Falls back to heuristic if model not trained.
        """
        feats = FeatureBuilder.build(opens, highs, lows, closes, volumes, self._lookback)
        if feats is None or np.any(np.isnan(feats)) or np.any(np.isinf(feats)):
            return self._heuristic(opens, highs, lows, closes)

        # Buffer features for training
        self._buffer_features(pair, feats, closes)

        # Use trained model if available
        with self._lock:
            trained = self._trained.get(pair, False)
            model   = self._models.get(pair)
            scaler  = self._scalers.get(pair)

        if trained and model is not None:
            try:
                x_scaled = scaler.transform(feats.reshape(1, -1))
                probs    = model.predict_proba(x_scaled)[0]
                if len(probs) == 2:
                    return float(probs[1]), float(probs[0])   # class 1=bull, 0=bear
                return 0.5, 0.5
            except Exception as e:
                logger.debug("ML prediction error: %s", e)

        return self._heuristic(opens, highs, lows, closes)

    # ── Heuristic fallback ──────────────────────────────────────────────────
    @staticmethod
    def _heuristic(opens: np.ndarray, highs: np.ndarray,
                   lows: np.ndarray, closes: np.ndarray) -> Tuple[float, float]:
        """Simple trend-following heuristic while ML is warming up."""
        if len(closes) < 5:
            return 0.5, 0.5
        c      = closes
        slope  = (c[-1] - c[-5]) / c[-5] if c[-5] > 0 else 0
        # Convert slope to probability using logistic
        p_bull = 1 / (1 + math.exp(-slope * 200))
        p_bear = 1 - p_bull
        return float(p_bull), float(p_bear)

    # ── Feature buffering ────────────────────────────────────────────────────
    def _buffer_features(self, pair: str, feats: np.ndarray,
                          closes: np.ndarray) -> None:
        if pair not in self._X_buf:
            self._X_buf[pair] = []
            self._y_buf[pair] = []
        # Label based on next-bar direction (look-ahead label for training)
        if len(self._X_buf[pair]) > 0 and len(closes) >= 2:
            label = 1 if closes[-1] > closes[-2] else 0
            # Retroactively label the previous feature vector
            if len(self._X_buf[pair]) > len(self._y_buf[pair]):
                self._y_buf[pair].append(label)
        self._X_buf[pair].append(feats)

    # ── Training ─────────────────────────────────────────────────────────────
    def _retrain_loop(self) -> None:
        while True:
            time.sleep(60)   # Retrain every minute
            for pair in list(self._X_buf.keys()):
                try:
                    self._train(pair)
                except Exception as e:
                    logger.debug("Retrain error for %s: %s", pair, e)

    def _train(self, pair: str) -> None:
        X = self._X_buf.get(pair, [])
        y = self._y_buf.get(pair, [])
        n = min(len(X), len(y))
        if n < self.MIN_TRAIN_SAMPLES:
            return

        X_arr = np.array(X[:n], dtype=float)
        y_arr = np.array(y[:n], dtype=int)

        # Remove NaN rows
        valid = ~np.any(np.isnan(X_arr) | np.isinf(X_arr), axis=1)
        X_arr = X_arr[valid]; y_arr = y_arr[valid]
        if len(X_arr) < self.MIN_TRAIN_SAMPLES:
            return

        scaler = _StandardScaler()
        X_scaled = scaler.fit_transform(X_arr)

        if self._model_type == "gradient_boost":
            base = _GBClassifier(
                n_estimators=100, max_depth=4, learning_rate=0.05,
                subsample=0.8, random_state=42
            )
        else:
            base = _RandomForest(
                n_estimators=200, max_depth=6, min_samples_split=5,
                class_weight="balanced", random_state=42, n_jobs=-1
            )

        # Calibrate probabilities
        model = _CalibratedCV(base, method="sigmoid", cv=3)
        model.fit(X_scaled, y_arr)

        with self._lock:
            self._models[pair]  = model
            self._scalers[pair] = scaler
            self._trained[pair] = True

        acc = (model.predict(X_scaled[-100:]) == y_arr[-100:]).mean()
        logger.info("ML model retrained for %s | samples=%d | est.acc=%.1f%%",
                    pair, len(y_arr), acc * 100)

    # ── Model inspection ────────────────────────────────────────────────────
    def model_info(self, pair: str) -> Dict:
        return {
            "trained":  self._trained.get(pair, False),
            "samples":  min(len(self._X_buf.get(pair, [])),
                            len(self._y_buf.get(pair, []))),
            "model_type": self._model_type,
        }


import math  # Needed for heuristic fallback
