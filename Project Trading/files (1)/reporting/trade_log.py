"""
reporting/trade_log.py – CSV/JSON trade signal journal
"""
import csv
import logging
from datetime import datetime
from pathlib  import Path
from typing   import List

logger = logging.getLogger("trade_log")

FIELDNAMES = [
    "timestamp","datetime","pair","direction","strength",
    "entry","sl","tp1","tp2","tp3","confidence_pct","risk_reward",
    "size_lots","votes_bull","votes_bear","votes_total",
    "atr","spread_pips","session","timeframe","notes"
]

class TradeLogger:
    def __init__(self, config):
        self.config = config
        path_str    = "reports/trades.csv"
        if hasattr(config, 'get'):
            path_str = config.get("reporting","csv_path", default=path_str) or path_str
        self._path  = Path(path_str)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._buffer: List[dict] = []
        self._write_header()
        logger.info("TradeLogger → %s", self._path)

    def _write_header(self):
        if not self._path.exists() or self._path.stat().st_size == 0:
            with open(self._path,"w",newline="",encoding="utf-8") as fh:
                csv.DictWriter(fh, fieldnames=FIELDNAMES).writeheader()

    def log_signal(self, signal):
        row = {
            "timestamp":      round(signal.timestamp, 3),
            "datetime":       datetime.fromtimestamp(signal.timestamp).isoformat(),
            "pair":           signal.pair,
            "direction":      signal.direction.name,
            "strength":       signal.strength.name,
            "entry":          round(signal.entry_price,   5),
            "sl":             round(signal.stop_loss,     5),
            "tp1":            round(signal.take_profit,   5),
            "tp2":            round(signal.take_profit_2, 5),
            "tp3":            round(signal.take_profit_3, 5),
            "confidence_pct": round(signal.confidence * 100, 1),
            "risk_reward":    round(signal.risk_reward, 2),
            "size_lots":      round(signal.position_size, 2),
            "votes_bull":     signal.votes_bull,
            "votes_bear":     signal.votes_bear,
            "votes_total":    signal.votes_total,
            "atr":            round(signal.atr, 5),
            "spread_pips":    round(signal.spread_pips, 2),
            "session":        signal.session,
            "timeframe":      signal.timeframe,
            "notes":          " | ".join(signal.indicator_notes[:5]),
        }
        self._buffer.append(row)
        if len(self._buffer) >= 5:
            self._flush_buffer()

    def _flush_buffer(self):
        if not self._buffer: return
        try:
            with open(self._path,"a",newline="",encoding="utf-8") as fh:
                csv.DictWriter(fh, fieldnames=FIELDNAMES).writerows(self._buffer)
            self._buffer.clear()
        except OSError as e:
            logger.error("Failed to write: %s", e)

    def flush(self):
        self._flush_buffer()
