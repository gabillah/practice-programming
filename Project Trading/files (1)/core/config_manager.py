"""
core/config_manager.py
─────────────────────
Loads, validates and provides typed access to application configuration.
Supports JSON config files + environment variable overrides.
"""

import json
import os
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# ── Default configuration ─────────────────────────────────────────────────────
DEFAULT_CONFIG: Dict[str, Any] = {

    # ── Data source ──────────────────────────────────────────────────────────
    "data_source": {
        "provider":        "twelvedata",        # twelvedata | polygon | oanda | demo
        "api_key":         "",                  # Set your API key here or in env APEX_API_KEY
        "websocket_url":   "",                  # Auto-resolved from provider
        "rest_base_url":   "",
        "reconnect_delay": 5,
        "max_reconnects":  20,
    },

    # ── Instruments to monitor ────────────────────────────────────────────────
    "pairs": [
        "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF",
        "AUD/USD", "NZD/USD", "USD/CAD",
        "EUR/GBP", "EUR/JPY", "GBP/JPY",
        "XAU/USD", "XAG/USD",               # Gold & Silver
    ],

    # ── Primary timeframes ────────────────────────────────────────────────────
    "timeframes": ["1min", "5min", "15min", "1h", "4h", "1day"],
    "primary_tf":  "15min",

    # ── Signal engine ─────────────────────────────────────────────────────────
    "signal_engine": {
        "min_confluence":    3,        # Minimum indicator agreement to fire signal
        "signal_cooldown":   300,      # Seconds between same-pair signals
        "require_trend_confirm": True,
        "use_ml_filter":     True,
        "use_volume_filter": True,
        "use_session_filter":True,
    },

    # ── Indicators (enable/disable) ───────────────────────────────────────────
    "indicators": {
        "ema_fast":          9,
        "ema_slow":          21,
        "ema_trend":         200,
        "rsi_period":        14,
        "rsi_overbought":    70,
        "rsi_oversold":      30,
        "macd_fast":         12,
        "macd_slow":         26,
        "macd_signal":       9,
        "bb_period":         20,
        "bb_std":            2.0,
        "stoch_k":           14,
        "stoch_d":           3,
        "stoch_smooth":      3,
        "atr_period":        14,
        "adx_period":        14,
        "adx_threshold":     25,
        "cci_period":        20,
        "williams_period":   14,
        "mfi_period":        14,
        "ichimoku_tenkan":   9,
        "ichimoku_kijun":    26,
        "ichimoku_senkou":   52,
        "pivot_method":      "classic",    # classic | fibonacci | camarilla
        "vwap_enabled":      True,
        "supertrend_period": 10,
        "supertrend_mult":   3.0,
        "hma_period":        21,
        "dema_period":       21,
        "tema_period":       21,
        "keltner_period":    20,
        "keltner_atr_mult":  2.0,
        "donchian_period":   20,
        "squeeze_bb_period": 20,
        "squeeze_kc_period": 20,
    },

    # ── Risk management ───────────────────────────────────────────────────────
    "risk": {
        "account_balance":   10000.0,
        "risk_per_trade_pct":1.5,
        "max_open_trades":   5,
        "max_daily_loss_pct":5.0,
        "default_sl_atr_mult":2.0,
        "default_tp_rr":     2.0,        # Risk:Reward ratio
        "trailing_stop":     True,
        "trailing_atr_mult": 1.5,
        "kelly_fraction":    0.25,       # Fractional Kelly
        "use_dynamic_sizing":True,
        "spread_filter_pips":3.0,
    },

    # ── Machine learning ──────────────────────────────────────────────────────
    "ml": {
        "model_type":        "random_forest",  # random_forest | gradient_boost | svm
        "lookback_candles":  100,
        "retrain_interval":  3600,             # seconds
        "min_train_samples": 500,
        "confidence_thresh": 0.60,
        "feature_set":       "full",           # full | basic
    },

    # ── Sessions (UTC) ────────────────────────────────────────────────────────
    "sessions": {
        "sydney":  {"open": "21:00", "close": "06:00"},
        "tokyo":   {"open": "00:00", "close": "09:00"},
        "london":  {"open": "08:00", "close": "17:00"},
        "newyork": {"open": "13:00", "close": "22:00"},
        "active_only": True,                   # Only signal during active sessions
    },

    # ── Notifications ─────────────────────────────────────────────────────────
    "notifications": {
        "sound_enabled": True,
        "popup_enabled": True,
        "log_all":       True,
    },

    # ── UI preferences ────────────────────────────────────────────────────────
    "ui": {
        "theme":            "light",
        "chart_style":      "candle",
        "refresh_ms":       1000,
        "max_candles":      300,
        "show_signals":     True,
        "show_indicators":  True,
        "window_width":     1600,
        "window_height":    950,
    },

    # ── Reporting ─────────────────────────────────────────────────────────────
    "reporting": {
        "csv_path":    "reports/trades.csv",
        "html_path":   "reports/performance.html",
        "auto_export": True,
    },
}


# ─────────────────────────────────────────────────────────────────────────────
class ConfigManager:
    """
    Loads configuration from a JSON file, merges with defaults,
    and applies environment variable overrides.

    Environment variable priority (highest → lowest):
      1. ENV vars (APEX_API_KEY, APEX_PROVIDER, …)
      2. config.json values
      3. DEFAULT_CONFIG
    """

    def __init__(self, path: str = "config.json"):
        self._path   = Path(path)
        self._config = self._deep_merge(DEFAULT_CONFIG, self._load_file())
        self._apply_env_overrides()
        self._validate()
        logger.debug("Configuration ready: %d top-level keys", len(self._config))

    # ── File loading ──────────────────────────────────────────────────────────
    def _load_file(self) -> Dict[str, Any]:
        if not self._path.exists():
            logger.warning("Config file not found: %s  (using defaults)", self._path)
            self._write_defaults()
            return {}
        try:
            with open(self._path, "r", encoding="utf-8") as fh:
                return json.load(fh)
        except json.JSONDecodeError as exc:
            logger.error("Malformed JSON in %s: %s  (using defaults)", self._path, exc)
            return {}

    def _write_defaults(self) -> None:
        try:
            self._path.write_text(
                json.dumps(DEFAULT_CONFIG, indent=2), encoding="utf-8"
            )
            logger.info("Wrote default config → %s", self._path)
        except OSError as exc:
            logger.warning("Could not write default config: %s", exc)

    # ── Deep merge helper ─────────────────────────────────────────────────────
    @staticmethod
    def _deep_merge(base: Dict, override: Dict) -> Dict:
        result = base.copy()
        for k, v in override.items():
            if k in result and isinstance(result[k], dict) and isinstance(v, dict):
                result[k] = ConfigManager._deep_merge(result[k], v)
            else:
                result[k] = v
        return result

    # ── Environment overrides ─────────────────────────────────────────────────
    def _apply_env_overrides(self) -> None:
        mapping = {
            "APEX_API_KEY":   ("data_source", "api_key"),
            "APEX_PROVIDER":  ("data_source", "provider"),
            "APEX_BALANCE":   ("risk",         "account_balance"),
        }
        for env_var, key_path in mapping.items():
            val = os.environ.get(env_var)
            if val is not None:
                section, key = key_path
                if section == "__root__":
                    self._config[key] = val
                else:
                    self._config[section][key] = val
                logger.debug("Env override: %s → %s.%s", env_var, section, key)

    # ── Validation ────────────────────────────────────────────────────────────
    def _validate(self) -> None:
        ds = self._config["data_source"]
        if ds["provider"] not in ("twelvedata", "polygon", "oanda", "demo"):
            logger.warning("Unknown provider '%s' – defaulting to demo", ds["provider"])
            ds["provider"] = "demo"

        risk = self._config["risk"]
        if not (0 < risk["risk_per_trade_pct"] <= 10):
            logger.warning("risk_per_trade_pct out of range – clamping to 1.5")
            risk["risk_per_trade_pct"] = 1.5

    # ── Public accessors ──────────────────────────────────────────────────────
    def get(self, *keys: str, default: Any = None) -> Any:
        """Dot-path access: config.get('risk', 'account_balance')"""
        node = self._config
        for k in keys:
            if not isinstance(node, dict) or k not in node:
                return default
            node = node[k]
        return node

    def set(self, *keys: str, value: Any) -> None:
        """Set a nested value at runtime."""
        node = self._config
        for k in keys[:-1]:
            node = node.setdefault(k, {})
        node[keys[-1]] = value

    def save(self) -> None:
        """Persist current config back to file."""
        try:
            self._path.write_text(
                json.dumps(self._config, indent=2), encoding="utf-8"
            )
            logger.info("Config saved → %s", self._path)
        except OSError as exc:
            logger.error("Failed to save config: %s", exc)

    # ── Convenience properties ────────────────────────────────────────────────
    @property
    def pairs(self) -> List[str]:
        return self._config["pairs"]

    @property
    def provider(self) -> str:
        return self._config["data_source"]["provider"]

    @property
    def api_key(self) -> str:
        return self._config["data_source"]["api_key"]

    @property
    def primary_tf(self) -> str:
        return self._config["primary_tf"]

    @property
    def risk(self) -> Dict[str, Any]:
        return self._config["risk"]

    @property
    def indicators(self) -> Dict[str, Any]:
        return self._config["indicators"]

    @property
    def signal_cfg(self) -> Dict[str, Any]:
        return self._config["signal_engine"]

    @property
    def ml_cfg(self) -> Dict[str, Any]:
        return self._config["ml"]

    @property
    def ui(self) -> Dict[str, Any]:
        return self._config["ui"]

    @property
    def sessions(self) -> Dict[str, Any]:
        return self._config["sessions"]

    @property
    def all(self) -> Dict[str, Any]:
        return self._config
