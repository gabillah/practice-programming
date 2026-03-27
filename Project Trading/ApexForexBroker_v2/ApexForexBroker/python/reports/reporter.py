"""reports/reporter.py — CSV export and performance reporting."""
from __future__ import annotations
import csv, logging, time
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)


class Reporter:
    def __init__(self, db, account, config):
        self.db      = db
        self.account = account
        self.config  = config
        self._csv    = Path(config.get("reports","csv_path") or "reports/trades.csv")
        self._csv.parent.mkdir(parents=True, exist_ok=True)
        if not self._csv.exists():
            self._write_header()

    def _write_header(self):
        with open(self._csv, "w", newline="") as f:
            w = csv.writer(f)
            w.writerow(["Ticket","Pair","Direction","Lots","OpenPrice","ClosePrice",
                        "StopLoss","TakeProfit","PnL","PnL_Pips","Swap","Commission",
                        "OpenTime","CloseTime","Reason"])

    def export_history(self) -> str:
        rows = self.db.get_history(10000)
        path = Path(f"exports/trades_{int(time.time())}.csv")
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", newline="") as f:
            w = csv.writer(f)
            w.writerow(["Ticket","Pair","Direction","Lots","OpenPrice","ClosePrice",
                        "StopLoss","TakeProfit","PnL","PnL_Pips","Swap","Commission",
                        "OpenTime","CloseTime","Reason"])
            for r in rows:
                w.writerow([r["ticket"],r["pair"],r["direction"],r["lot_size"],
                             r["open_price"],r["close_price"],r["stop_loss"],
                             r["take_profit"],r["pnl"],r["pnl_pips"],r["swap"],
                             r["commission"],
                             datetime.fromtimestamp(r["opened_at"]).strftime("%Y-%m-%d %H:%M:%S"),
                             datetime.fromtimestamp(r["closed_at"]).strftime("%Y-%m-%d %H:%M:%S"),
                             r["close_reason"]])
        logger.info("Exported %d trades → %s", len(rows), path)
        return str(path)

    def append_trade(self, hist):
        try:
            with open(self._csv, "a", newline="") as f:
                w = csv.writer(f)
                w.writerow([hist.ticket, hist.pair, hist.direction, hist.lot_size,
                             hist.open_price, hist.close_price, hist.stop_loss,
                             hist.take_profit, hist.pnl, hist.pnl_pips,
                             hist.swap, hist.commission,
                             datetime.fromtimestamp(hist.opened_at).strftime("%Y-%m-%d %H:%M:%S"),
                             datetime.fromtimestamp(hist.closed_at).strftime("%Y-%m-%d %H:%M:%S"),
                             hist.close_reason])
        except Exception as e:
            logger.warning("CSV append error: %s", e)
