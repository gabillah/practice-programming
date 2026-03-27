"""core/config.py — Application configuration with JSON persistence."""
from __future__ import annotations
import json, os, logging
from pathlib import Path
from typing import Any, List

logger = logging.getLogger(__name__)

_DEFAULTS: dict = {
    "data_source": {
        "provider":       "demo",
        "api_key":        "",
        "reconnect_delay": 5,
        "max_reconnects":  20,
        "websocket_url":   "",
    },
    "pairs": [
        "EUR/USD","GBP/USD","USD/JPY","USD/CHF",
        "AUD/USD","NZD/USD","USD/CAD",
        "EUR/GBP","EUR/JPY","GBP/JPY",
        "XAU/USD","XAG/USD",
    ],
    "timeframes":  ["1min","5min","15min","1h","4h","1day"],
    "primary_tf":  "15min",
    "account": {
        "initial_balance": 10000.0,
        "currency":        "USD",
        "leverage":        100,
        "margin_call_pct": 50.0,
        "stop_out_pct":    20.0,
    },
    "trading": {
        "default_lot":        0.10,
        "min_lot":            0.01,
        "max_lot":            100.0,
        "lot_step":           0.01,
        "max_open_trades":    20,
        "allow_hedging":      True,
        "slippage_pips":      1.0,
        "commission_per_lot": 7.0,
    },
    "signal_engine": {
        "min_confluence":      3,
        "signal_cooldown":     300,
        "use_ml_filter":       True,
        "use_session_filter":  True,
        "auto_trade":          False,
        "auto_lot":            0.01,
        "min_confidence":      0.55,
    },
    "risk": {
        "risk_per_trade_pct":  1.5,
        "max_daily_loss_pct":  5.0,
        "default_sl_atr_mult": 2.0,
        "default_tp_rr":       2.0,
        "trailing_stop":       True,
        "trailing_atr_mult":   1.5,
        "kelly_fraction":      0.25,
        "spread_filter_pips":  3.0,
    },
    "indicators": {
        "ema_fast":9,"ema_slow":21,"ema_trend":200,
        "rsi_period":14,"rsi_ob":70,"rsi_os":30,
        "macd_fast":12,"macd_slow":26,"macd_signal":9,
        "bb_period":20,"bb_std":2.0,
        "stoch_k":14,"stoch_d":3,"stoch_smooth":3,
        "atr_period":14,"adx_period":14,"adx_thresh":25,
        "cci_period":20,"williams_period":14,"mfi_period":14,
        "supertrend_period":10,"supertrend_mult":3.0,
        "donchian_period":20,"keltner_period":20,"keltner_mult":2.0,
        "ichimoku_tenkan":9,"ichimoku_kijun":26,"ichimoku_senkou":52,
        "squeeze_bb":20,"squeeze_kc":20,
        "vwap_enabled":True,
        "pivot_method":"classic",
        "hma_period":21,
    },
    "ml": {
        "model_type":        "random_forest",
        "n_estimators":      200,
        "lookback":          20,
        "retrain_interval":  3600,
        "min_samples":       200,
        "confidence_thresh": 0.60,
        "feature_window":    60,
    },
    "ui": {
        "theme":         "light",
        "refresh_ms":    2000,
        "max_candles":   200,
        "window_width":  1820,
        "window_height": 1000,
        "font_family":   "Segoe UI",
        "font_size":     10,
    },
    "reports": {
        "csv_path":    "reports/trades.csv",
        "auto_export": True,
    },
}


class Config:
    def __init__(self, path: str = "config.json"):
        self._path = Path(path)
        self._data = _deep_merge(_DEFAULTS, self._load())
        self._apply_env()
        if not self._path.exists():
            self._save()
        logger.debug("Config loaded from %s", path)

    def _load(self) -> dict:
        if not self._path.exists():
            return {}
        try:
            return json.loads(self._path.read_text("utf-8"))
        except Exception as e:
            logger.warning("Config read error (%s): %s", self._path, e)
            return {}

    def _save(self):
        try:
            self._path.write_text(json.dumps(self._data, indent=2), "utf-8")
        except OSError as e:
            logger.warning("Config save error: %s", e)

    def _apply_env(self):
        overrides = {
            "APEX_API_KEY":  ("data_source", "api_key"),
            "APEX_PROVIDER": ("data_source", "provider"),
            "APEX_BALANCE":  ("account",     "initial_balance"),
        }
        for env, (sec, key) in overrides.items():
            v = os.environ.get(env)
            if v:
                self._data[sec][key] = v

    def get(self, *keys, default=None):
        node = self._data
        for k in keys:
            if not isinstance(node, dict) or k not in node:
                return default
            node = node[k]
        return node

    def set(self, *keys, value):
        node = self._data
        for k in keys[:-1]:
            node = node.setdefault(k, {})
        node[keys[-1]] = value
        self._save()

    # ── Convenience properties ─────────────────────────────────────────────
    @property
    def pairs(self) -> List[str]:       return self._data["pairs"]
    @property
    def provider(self) -> str:          return self._data["data_source"]["provider"]
    @property
    def api_key(self) -> str:           return self._data["data_source"]["api_key"]
    @property
    def primary_tf(self) -> str:        return self._data["primary_tf"]
    @property
    def timeframes(self) -> List[str]:  return self._data["timeframes"]
    @property
    def account_cfg(self) -> dict:      return self._data["account"]
    @property
    def trading_cfg(self) -> dict:      return self._data["trading"]
    @property
    def signal_cfg(self) -> dict:       return self._data["signal_engine"]
    @property
    def risk_cfg(self) -> dict:         return self._data["risk"]
    @property
    def ind_cfg(self) -> dict:          return self._data["indicators"]
    @property
    def ml_cfg(self) -> dict:           return self._data["ml"]
    @property
    def ui_cfg(self) -> dict:           return self._data["ui"]
    @property
    def all(self) -> dict:              return self._data


def _deep_merge(base: dict, over: dict) -> dict:
    r = base.copy()
    for k, v in over.items():
        if k in r and isinstance(r[k], dict) and isinstance(v, dict):
            r[k] = _deep_merge(r[k], v)
        else:
            r[k] = v
    return r
