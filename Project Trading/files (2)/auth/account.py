"""
auth/account.py — Account manager: balance, margin, equity, swap.

Financial formulas
──────────────────
  Margin      = (Lots × ContractSize × Price) / Leverage
  Equity      = Balance + Floating_PnL
  Free Margin = Equity − Margin_Used
  Margin Level= (Equity / Margin_Used) × 100 %
  PnL BUY     = (Close − Open) / PipSize × PipValue × Lots
  PnL SELL    = (Open − Close) / PipSize × PipValue × Lots
  Swap/day    = Lots × RatePips × PipValue
  Commission  = Lots × CommissionPerLot
"""
from __future__ import annotations
import logging, threading, time, uuid
from typing import Dict, List, Optional, Tuple

from db.database import Database

logger = logging.getLogger(__name__)

# ── Instrument specs ──────────────────────────────────────────────────────────
CONTRACT  = 100_000   # units per standard lot

PIP_SIZE: Dict[str, float] = {
    "EUR/USD":0.0001,"GBP/USD":0.0001,"AUD/USD":0.0001,"NZD/USD":0.0001,
    "USD/CAD":0.0001,"USD/CHF":0.0001,"USD/JPY":0.01,
    "EUR/GBP":0.0001,"EUR/JPY":0.01,"GBP/JPY":0.01,
    "XAU/USD":0.1,   "XAG/USD":0.001,
}

PIP_VALUE: Dict[str, float] = {   # USD per pip per standard lot
    "EUR/USD":10.0,"GBP/USD":10.0,"AUD/USD":10.0,"NZD/USD":10.0,
    "USD/CAD":7.60,"USD/CHF":10.20,"USD/JPY":9.09,
    "EUR/GBP":12.50,"EUR/JPY":9.09,"GBP/JPY":9.09,
    "XAU/USD":1.0, "XAG/USD":50.0,
}

SWAP_RATES: Dict[str, Tuple[float,float]] = {  # (long, short) pips/night
    "EUR/USD":(-0.50,-0.20),"GBP/USD":(-0.40,-0.30),"USD/JPY":(0.20,-0.80),
    "USD/CHF":(0.10,-0.60), "AUD/USD":(-0.30,-0.20),"NZD/USD":(-0.40,-0.10),
    "USD/CAD":(0.30,-0.70), "EUR/GBP":(-0.30,-0.20),"EUR/JPY":(-0.30,-0.50),
    "GBP/JPY":(-0.40,-0.60),"XAU/USD":(-2.0,-1.0),  "XAG/USD":(-1.5,-0.80),
}


class AccountManager:
    def __init__(self, db: Database, config):
        self.db     = db
        self.config = config
        self._lock  = threading.RLock()
        self._prices: Dict[str, Tuple[float,float]] = {}   # pair→(bid,ask)
        self._last_swap_day = ""
        logger.info("AccountManager ready  leverage=1:%d",
                    config.account_cfg.get("leverage",100))

    # ── Price feed ─────────────────────────────────────────────────────────
    def update_price(self, pair: str, bid: float, ask: float) -> None:
        with self._lock:
            self._prices[pair] = (bid, ask)
        self.db.upsert_price(pair, bid, ask)

    def get_price(self, pair: str) -> Tuple[float,float]:
        return self._prices.get(pair, (0.0, 0.0))

    def mid(self, pair: str) -> float:
        b, a = self.get_price(pair)
        return (b+a)/2 if b else 0.0

    def spread_pips(self, pair: str) -> float:
        b, a = self.get_price(pair)
        return (a-b) / PIP_SIZE.get(pair, 0.0001) if b else 0.0

    # ── Financial math ─────────────────────────────────────────────────────
    @staticmethod
    def pnl(direction: str, open_px: float, cur_px: float,
            lots: float, pair: str) -> Tuple[float,float]:
        """Returns (pnl_usd, pnl_pips)."""
        ps  = PIP_SIZE.get(pair, 0.0001)
        pv  = PIP_VALUE.get(pair, 10.0)
        pips = (cur_px-open_px)/ps if direction=="BUY" else (open_px-cur_px)/ps
        return round(pips*pv*lots, 2), round(pips, 1)

    def margin_req(self, pair: str, lots: float, price: float) -> float:
        lev  = self.config.account_cfg.get("leverage", 100)
        if pair in ("XAU/USD",):
            m = (lots*100*price)/lev
        elif pair in ("XAG/USD",):
            m = (lots*5000*price)/lev
        elif "JPY" in pair and "/" in pair and pair.split("/")[0]!="USD":
            usdjpy = self.mid("USD/JPY") or 150.0
            m = (lots*CONTRACT*price)/(lev*usdjpy)
        else:
            m = (lots*CONTRACT*price)/lev
        return round(m, 2)

    def commission(self, lots: float) -> float:
        return round(lots * self.config.trading_cfg.get("commission_per_lot",7.0), 2)

    @staticmethod
    def swap_daily(pair: str, direction: str, lots: float) -> float:
        rate = SWAP_RATES.get(pair,(0.0,0.0))[0 if direction=="BUY" else 1]
        return round(rate * PIP_VALUE.get(pair,10.0) * lots, 4)

    # ── Live account snapshot ───────────────────────────────────────────────
    def snapshot(self) -> Dict:
        """Computes real-time equity / margin / free-margin."""
        acc  = self.db.get_account()
        bal  = acc["balance"] if acc else 10000.0
        rows = self.db.get_positions()
        fp   = 0.0
        mu   = 0.0
        for r in rows:
            bid, ask = self.get_price(r["pair"])
            cur = bid if r["direction"]=="BUY" else ask
            if cur == 0:
                cur = r["current_price"]
            p, _ = self.pnl(r["direction"],r["open_price"],cur,r["lot_size"],r["pair"])
            fp  += p + r["swap"]
            mu  += r["margin_used"]
        eq   = bal + fp
        fm   = eq - mu
        ml   = (eq/mu*100) if mu>0 else 0.0
        self.db.snapshot_equity(bal, eq, mu)
        return {
            "balance":      round(bal,2),
            "equity":       round(eq,2),
            "floating_pnl": round(fp,2),
            "margin_used":  round(mu,2),
            "free_margin":  round(fm,2),
            "margin_level": round(ml,2),
            "open_trades":  len(rows),
            "leverage":     acc["leverage"] if acc else 100,
            "currency":     acc["currency"] if acc else "USD",
        }

    # ── Daily swap rollover ────────────────────────────────────────────────
    def apply_swaps(self) -> None:
        today = time.strftime("%Y-%m-%d")
        if today == self._last_swap_day:
            return
        self._last_swap_day = today
        total = 0.0
        for r in self.db.get_positions():
            s = self.swap_daily(r["pair"], r["direction"], r["lot_size"])
            self.db.execute("UPDATE positions SET swap=swap+? WHERE ticket=?",
                            (s, r["ticket"]))
            total += s
        if total:
            self.db.update_balance(total)
            logger.info("Swap rollover applied: %.4f USD", total)

    # ── Utility ────────────────────────────────────────────────────────────
    @staticmethod
    def ticket() -> str:
        ts  = int(time.time()*1000) % 100_000_000
        uid = uuid.uuid4().hex[:4].upper()
        return f"T{ts}{uid}"

    def deposit(self, amount: float) -> None:
        self.db.update_balance(amount)
        logger.info("Deposit +%.2f", amount)

    def withdraw(self, amount: float) -> bool:
        snap = self.snapshot()
        if amount > snap["free_margin"]:
            logger.warning("Withdraw %.2f denied — free margin %.2f",
                           amount, snap["free_margin"])
            return False
        self.db.update_balance(-amount)
        logger.info("Withdraw -%.2f", amount)
        return True
