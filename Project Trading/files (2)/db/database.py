"""
db/database.py — SQLite persistence layer.

Tables:  accounts, positions, orders, trade_history, signals,
         price_cache, daily_stats, equity_curve
"""
from __future__ import annotations
import logging, sqlite3, threading, time
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)
DB_PATH = Path("db/broker.db")

# ── Data classes ──────────────────────────────────────────────────────────────

@dataclass
class Position:
    ticket:        str   = ""
    pair:          str   = ""
    direction:     str   = ""
    lot_size:      float = 0.01
    open_price:    float = 0.0
    stop_loss:     float = 0.0
    take_profit:   float = 0.0
    current_price: float = 0.0
    swap:          float = 0.0
    commission:    float = 0.0
    pnl:           float = 0.0
    pnl_pips:      float = 0.0
    margin_used:   float = 0.0
    opened_at:     float = field(default_factory=time.time)
    comment:       str   = ""
    is_signal:     int   = 0

@dataclass
class Order:
    ticket:      str   = ""
    pair:        str   = ""
    order_type:  str   = ""
    lot_size:    float = 0.01
    price:       float = 0.0
    stop_loss:   float = 0.0
    take_profit: float = 0.0
    created_at:  float = field(default_factory=time.time)
    expires_at:  float = 0.0
    comment:     str   = ""

@dataclass
class TradeHistory:
    ticket:       str   = ""
    pair:         str   = ""
    direction:    str   = ""
    lot_size:     float = 0.0
    open_price:   float = 0.0
    close_price:  float = 0.0
    stop_loss:    float = 0.0
    take_profit:  float = 0.0
    pnl:          float = 0.0
    pnl_pips:     float = 0.0
    swap:         float = 0.0
    commission:   float = 0.0
    opened_at:    float = 0.0
    closed_at:    float = field(default_factory=time.time)
    close_reason: str   = "manual"

@dataclass
class Signal:
    pair:           str   = ""
    direction:      str   = ""
    strength:       str   = "MODERATE"
    entry_price:    float = 0.0
    stop_loss:      float = 0.0
    take_profit:    float = 0.0
    take_profit_2:  float = 0.0
    take_profit_3:  float = 0.0
    confidence:     float = 0.0
    votes_bull:     int   = 0
    votes_bear:     int   = 0
    atr:            float = 0.0
    spread_pips:    float = 0.0
    session:        str   = ""
    timeframe:      str   = "15min"
    risk_reward:    float = 0.0
    position_size:  float = 0.0
    notes:          str   = ""
    acted_on:       int   = 0
    created_at:     float = field(default_factory=time.time)

# ── Schema ────────────────────────────────────────────────────────────────────
_SCHEMA = """
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS accounts (
    id           INTEGER PRIMARY KEY DEFAULT 1,
    balance      REAL NOT NULL DEFAULT 10000.0,
    equity       REAL NOT NULL DEFAULT 10000.0,
    margin_used  REAL NOT NULL DEFAULT 0.0,
    free_margin  REAL NOT NULL DEFAULT 10000.0,
    margin_level REAL NOT NULL DEFAULT 0.0,
    profit       REAL NOT NULL DEFAULT 0.0,
    currency     TEXT NOT NULL DEFAULT 'USD',
    leverage     INTEGER NOT NULL DEFAULT 100,
    created_at   REAL NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS positions (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket        TEXT NOT NULL UNIQUE,
    pair          TEXT NOT NULL,
    direction     TEXT NOT NULL,
    lot_size      REAL NOT NULL DEFAULT 0.01,
    open_price    REAL NOT NULL DEFAULT 0.0,
    stop_loss     REAL NOT NULL DEFAULT 0.0,
    take_profit   REAL NOT NULL DEFAULT 0.0,
    current_price REAL NOT NULL DEFAULT 0.0,
    swap          REAL NOT NULL DEFAULT 0.0,
    commission    REAL NOT NULL DEFAULT 0.0,
    pnl           REAL NOT NULL DEFAULT 0.0,
    pnl_pips      REAL NOT NULL DEFAULT 0.0,
    margin_used   REAL NOT NULL DEFAULT 0.0,
    opened_at     REAL NOT NULL DEFAULT (unixepoch()),
    comment       TEXT NOT NULL DEFAULT '',
    is_signal     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket        TEXT NOT NULL UNIQUE,
    pair          TEXT NOT NULL,
    order_type    TEXT NOT NULL,
    lot_size      REAL NOT NULL DEFAULT 0.01,
    price         REAL NOT NULL DEFAULT 0.0,
    stop_loss     REAL NOT NULL DEFAULT 0.0,
    take_profit   REAL NOT NULL DEFAULT 0.0,
    created_at    REAL NOT NULL DEFAULT (unixepoch()),
    expires_at    REAL NOT NULL DEFAULT 0.0,
    comment       TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS trade_history (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket        TEXT NOT NULL UNIQUE,
    pair          TEXT NOT NULL,
    direction     TEXT NOT NULL,
    lot_size      REAL NOT NULL DEFAULT 0.0,
    open_price    REAL NOT NULL DEFAULT 0.0,
    close_price   REAL NOT NULL DEFAULT 0.0,
    stop_loss     REAL NOT NULL DEFAULT 0.0,
    take_profit   REAL NOT NULL DEFAULT 0.0,
    pnl           REAL NOT NULL DEFAULT 0.0,
    pnl_pips      REAL NOT NULL DEFAULT 0.0,
    swap          REAL NOT NULL DEFAULT 0.0,
    commission    REAL NOT NULL DEFAULT 0.0,
    opened_at     REAL NOT NULL DEFAULT 0.0,
    closed_at     REAL NOT NULL DEFAULT (unixepoch()),
    close_reason  TEXT NOT NULL DEFAULT 'manual'
);

CREATE TABLE IF NOT EXISTS signals (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    pair          TEXT NOT NULL,
    direction     TEXT NOT NULL,
    strength      TEXT NOT NULL DEFAULT 'MODERATE',
    entry_price   REAL NOT NULL DEFAULT 0.0,
    stop_loss     REAL NOT NULL DEFAULT 0.0,
    take_profit   REAL NOT NULL DEFAULT 0.0,
    take_profit_2 REAL NOT NULL DEFAULT 0.0,
    take_profit_3 REAL NOT NULL DEFAULT 0.0,
    confidence    REAL NOT NULL DEFAULT 0.0,
    votes_bull    INTEGER NOT NULL DEFAULT 0,
    votes_bear    INTEGER NOT NULL DEFAULT 0,
    atr           REAL NOT NULL DEFAULT 0.0,
    spread_pips   REAL NOT NULL DEFAULT 0.0,
    session       TEXT NOT NULL DEFAULT '',
    timeframe     TEXT NOT NULL DEFAULT '15min',
    risk_reward   REAL NOT NULL DEFAULT 0.0,
    position_size REAL NOT NULL DEFAULT 0.0,
    notes         TEXT NOT NULL DEFAULT '',
    acted_on      INTEGER NOT NULL DEFAULT 0,
    created_at    REAL NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS price_cache (
    pair       TEXT PRIMARY KEY,
    bid        REAL NOT NULL DEFAULT 0.0,
    ask        REAL NOT NULL DEFAULT 0.0,
    mid        REAL NOT NULL DEFAULT 0.0,
    spread     REAL NOT NULL DEFAULT 0.0,
    updated_at REAL NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS daily_stats (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    date         TEXT NOT NULL UNIQUE,
    trades_total INTEGER NOT NULL DEFAULT 0,
    trades_won   INTEGER NOT NULL DEFAULT 0,
    trades_lost  INTEGER NOT NULL DEFAULT 0,
    gross_profit REAL NOT NULL DEFAULT 0.0,
    gross_loss   REAL NOT NULL DEFAULT 0.0,
    net_pnl      REAL NOT NULL DEFAULT 0.0,
    max_drawdown REAL NOT NULL DEFAULT 0.0,
    start_bal    REAL NOT NULL DEFAULT 0.0,
    end_bal      REAL NOT NULL DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS equity_curve (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    ts         REAL NOT NULL DEFAULT (unixepoch()),
    balance    REAL NOT NULL DEFAULT 0.0,
    equity     REAL NOT NULL DEFAULT 0.0,
    margin     REAL NOT NULL DEFAULT 0.0
);

CREATE INDEX IF NOT EXISTS ix_pos_pair    ON positions(pair);
CREATE INDEX IF NOT EXISTS ix_pos_ticket  ON positions(ticket);
CREATE INDEX IF NOT EXISTS ix_hist_closed ON trade_history(closed_at);
CREATE INDEX IF NOT EXISTS ix_sig_pair    ON signals(pair);
CREATE INDEX IF NOT EXISTS ix_eq_ts       ON equity_curve(ts);
"""


class Database:
    def __init__(self, config, reset: bool = False):
        self._path = DB_PATH
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.RLock()
        if reset and self._path.exists():
            self._path.unlink()
            logger.info("Database reset")
        self._conn = sqlite3.connect(str(self._path), check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._conn.executescript(_SCHEMA)
        self._conn.commit()
        self._seed(config)
        # Equity curve snapshot every 60 s
        self._last_eq_snap = 0.0
        logger.info("Database ready → %s", self._path)

    # ── Low-level helpers ──────────────────────────────────────────────────
    def execute(self, sql: str, p: tuple = ()) -> sqlite3.Cursor:
        with self._lock:
            cur = self._conn.execute(sql, p)
            self._conn.commit()
            return cur

    def one(self, sql: str, p: tuple = ()):
        with self._lock:
            return self._conn.execute(sql, p).fetchone()

    def all(self, sql: str, p: tuple = ()):
        with self._lock:
            return self._conn.execute(sql, p).fetchall()

    def _seed(self, config):
        with self._lock:
            row = self._conn.execute("SELECT id FROM accounts LIMIT 1").fetchone()
            if not row:
                bal = config.account_cfg.get("initial_balance", 10000.0)
                cur = config.account_cfg.get("currency", "USD")
                lev = config.account_cfg.get("leverage", 100)
                self._conn.execute(
                    "INSERT INTO accounts(balance,equity,free_margin,currency,leverage)"
                    " VALUES(?,?,?,?,?)", (bal, bal, bal, cur, lev))
                self._conn.commit()

    # ── Account ────────────────────────────────────────────────────────────
    def get_account(self):           return self.one("SELECT * FROM accounts LIMIT 1")
    def update_balance(self, delta): self.execute("UPDATE accounts SET balance=balance+? WHERE id=1",(delta,))
    def set_account_fields(self, **kw):
        sets = ", ".join(f"{k}=?" for k in kw)
        self.execute(f"UPDATE accounts SET {sets} WHERE id=1", tuple(kw.values()))

    # ── Positions ──────────────────────────────────────────────────────────
    def insert_position(self, p: Position) -> int:
        return self.execute(
            "INSERT INTO positions(ticket,pair,direction,lot_size,open_price,"
            "stop_loss,take_profit,current_price,commission,margin_used,"
            "opened_at,comment,is_signal) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (p.ticket,p.pair,p.direction,p.lot_size,p.open_price,
             p.stop_loss,p.take_profit,p.current_price,p.commission,
             p.margin_used,p.opened_at,p.comment,p.is_signal)).lastrowid

    def update_position_live(self, ticket, price, pnl, pips, swap):
        self.execute("UPDATE positions SET current_price=?,pnl=?,pnl_pips=?,swap=? WHERE ticket=?",
                     (price,pnl,pips,swap,ticket))

    def update_position_sl_tp(self, ticket, sl, tp):
        self.execute("UPDATE positions SET stop_loss=?,take_profit=? WHERE ticket=?",
                     (sl,tp,ticket))

    def delete_position(self, ticket):
        self.execute("DELETE FROM positions WHERE ticket=?",(ticket,))

    def get_positions(self):         return self.all("SELECT * FROM positions ORDER BY opened_at DESC")
    def get_position(self, ticket):  return self.one("SELECT * FROM positions WHERE ticket=?",(ticket,))

    # ── Orders ─────────────────────────────────────────────────────────────
    def insert_order(self, o: Order) -> int:
        return self.execute(
            "INSERT INTO orders(ticket,pair,order_type,lot_size,price,"
            "stop_loss,take_profit,created_at,expires_at,comment) VALUES(?,?,?,?,?,?,?,?,?,?)",
            (o.ticket,o.pair,o.order_type,o.lot_size,o.price,
             o.stop_loss,o.take_profit,o.created_at,o.expires_at,o.comment)).lastrowid

    def delete_order(self, ticket):  self.execute("DELETE FROM orders WHERE ticket=?",(ticket,))
    def get_orders(self):            return self.all("SELECT * FROM orders ORDER BY created_at DESC")
    def get_order(self, ticket):     return self.one("SELECT * FROM orders WHERE ticket=?",(ticket,))

    # ── Trade history ──────────────────────────────────────────────────────
    def insert_history(self, h: TradeHistory) -> int:
        return self.execute(
            "INSERT INTO trade_history(ticket,pair,direction,lot_size,open_price,"
            "close_price,stop_loss,take_profit,pnl,pnl_pips,swap,commission,"
            "opened_at,closed_at,close_reason) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (h.ticket,h.pair,h.direction,h.lot_size,h.open_price,h.close_price,
             h.stop_loss,h.take_profit,h.pnl,h.pnl_pips,h.swap,h.commission,
             h.opened_at,h.closed_at,h.close_reason)).lastrowid

    def get_history(self, limit=500):
        return self.all("SELECT * FROM trade_history ORDER BY closed_at DESC LIMIT ?",(limit,))

    def get_history_stats(self):
        r = self.one(
            "SELECT COUNT(*) total,"
            " SUM(CASE WHEN pnl>0 THEN 1 ELSE 0 END) wins,"
            " SUM(CASE WHEN pnl<=0 THEN 1 ELSE 0 END) losses,"
            " COALESCE(SUM(CASE WHEN pnl>0 THEN pnl ELSE 0 END),0) gross_profit,"
            " COALESCE(SUM(CASE WHEN pnl<0 THEN pnl ELSE 0 END),0) gross_loss,"
            " COALESCE(SUM(pnl),0) net_pnl,"
            " COALESCE(AVG(pnl),0) avg_pnl,"
            " COALESCE(AVG(pnl_pips),0) avg_pips"
            " FROM trade_history")
        return dict(r) if r else {}

    def get_daily_pnl(self):
        today = time.strftime("%Y-%m-%d")
        r = self.one(
            "SELECT COALESCE(SUM(pnl),0) pnl FROM trade_history"
            " WHERE date(closed_at,'unixepoch')=?",(today,))
        return r["pnl"] if r else 0.0

    # ── Signals ────────────────────────────────────────────────────────────
    def insert_signal(self, s: Signal) -> int:
        return self.execute(
            "INSERT INTO signals(pair,direction,strength,entry_price,stop_loss,"
            "take_profit,take_profit_2,take_profit_3,confidence,votes_bull,"
            "votes_bear,atr,spread_pips,session,timeframe,risk_reward,"
            "position_size,notes,acted_on,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (s.pair,s.direction,s.strength,s.entry_price,s.stop_loss,
             s.take_profit,s.take_profit_2,s.take_profit_3,s.confidence,
             s.votes_bull,s.votes_bear,s.atr,s.spread_pips,s.session,
             s.timeframe,s.risk_reward,s.position_size,s.notes,
             s.acted_on,s.created_at)).lastrowid

    def get_signals(self, limit=100):
        return self.all("SELECT * FROM signals ORDER BY created_at DESC LIMIT ?",(limit,))

    # ── Prices ─────────────────────────────────────────────────────────────
    def upsert_price(self, pair, bid, ask):
        mid=(bid+ask)/2; spread=ask-bid
        self.execute(
            "INSERT INTO price_cache(pair,bid,ask,mid,spread,updated_at)"
            " VALUES(?,?,?,?,?,?) ON CONFLICT(pair) DO UPDATE SET"
            " bid=excluded.bid,ask=excluded.ask,mid=excluded.mid,"
            " spread=excluded.spread,updated_at=excluded.updated_at",
            (pair,bid,ask,mid,spread,time.time()))

    def get_prices(self):
        return {r["pair"]: dict(r) for r in self.all("SELECT * FROM price_cache")}

    # ── Equity curve snapshot ──────────────────────────────────────────────
    def snapshot_equity(self, balance, equity, margin):
        now = time.time()
        if now - self._last_eq_snap < 60:
            return
        self._last_eq_snap = now
        self.execute("INSERT INTO equity_curve(ts,balance,equity,margin) VALUES(?,?,?,?)",
                     (now,balance,equity,margin))

    def get_equity_curve(self, limit=1000):
        return self.all("SELECT * FROM equity_curve ORDER BY ts DESC LIMIT ?",(limit,))
