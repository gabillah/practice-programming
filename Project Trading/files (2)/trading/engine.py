"""
trading/engine.py — Self-hosted order execution engine.

Supports:
  Market orders  (BUY / SELL at current bid/ask + slippage)
  Limit orders   (BUY_LIMIT / SELL_LIMIT)
  Stop orders    (BUY_STOP  / SELL_STOP)
  Modify SL/TP, partial close, close all
  Automatic SL/TP execution, trailing stop
  Pending order monitoring + expiry
  Margin call detection + stop-out
  Auto-trade from signal engine
"""
from __future__ import annotations
import logging, threading, time
from typing import Callable, Dict, List, Optional, Tuple

from db.database     import Database, Position, Order, TradeHistory
from auth.account    import AccountManager, PIP_SIZE, PIP_VALUE

logger = logging.getLogger(__name__)


class TradingEngine:
    def __init__(self, db: Database, account: AccountManager, risk_mgr, config):
        self.db      = db
        self.account = account
        self.risk    = risk_mgr
        self.config  = config
        self._lock   = threading.RLock()
        self._trade_cbs: List[Callable] = []
        self._close_cbs: List[Callable] = []
        self._error_cbs: List[Callable] = []
        self._alert_cbs: List[Callable] = []
        # Start monitor
        t = threading.Thread(target=self._monitor_loop,
                             daemon=True, name="TradeMonitor")
        t.start()
        logger.info("TradingEngine started")

    # ── Callback registration ──────────────────────────────────────────────────
    def on_trade(self,  cb): self._trade_cbs.append(cb)
    def on_close(self,  cb): self._close_cbs.append(cb)
    def on_error(self,  cb): self._error_cbs.append(cb)
    def on_alert(self,  cb): self._alert_cbs.append(cb)

    def _emit_trade(self, msg): [cb(msg) for cb in self._trade_cbs]
    def _emit_close(self, h):   [cb(h)   for cb in self._close_cbs]
    def _emit_error(self, msg): [cb(msg) for cb in self._error_cbs]
    def _emit_alert(self, msg): [cb(msg) for cb in self._alert_cbs]

    # ── Signal handler (called by SignalEngine via wiring in main.py) ─────────
    def handle_signal(self, sig) -> None:
        """Called when a new TradingSignal is emitted. Auto-trades if enabled."""
        if not self.config.signal_cfg.get("auto_trade", False):
            return
        if self.risk.daily_loss_breaker_tripped():
            logger.warning("Daily loss breaker: auto-trade blocked for %s", sig.pair)
            return
        d    = sig.direction.name   # "BUY" or "SELL"
        lots = sig.lot_size or self.config.signal_cfg.get("auto_lot", 0.01)
        ok, ticket = self.open_market(
            sig.pair, d, lots,
            sl=sig.stop_loss, tp=sig.take_profit,
            comment=f"Signal {sig.strength_str} {sig.timeframe}",
            is_signal=1)
        if ok:
            logger.info("Auto-trade: %s %s %.2fL → #%s", d, sig.pair, lots, ticket)

    # ── Price update (called every tick by main.py wiring) ────────────────────
    def on_price_update(self, pair: str, bid: float, ask: float) -> None:
        """Called on every tick. Checks SL/TP for positions on this pair."""
        positions = self.db.get_positions()
        for row in positions:
            if row["pair"] != pair:
                continue
            cur = bid if row["direction"]=="BUY" else ask
            pnl, pips = AccountManager.pnl(row["direction"], row["open_price"],
                                            cur, row["lot_size"], pair)
            net_pnl = pnl + row["swap"]
            self.db.update_position_live(row["ticket"], cur, net_pnl, pips, row["swap"])
            # SL check
            sl = row["stop_loss"]
            if sl > 0:
                if row["direction"]=="BUY"  and bid<=sl:
                    self.close_position(row["ticket"], "sl"); continue
                if row["direction"]=="SELL" and ask>=sl:
                    self.close_position(row["ticket"], "sl"); continue
            # TP check
            tp = row["take_profit"]
            if tp > 0:
                if row["direction"]=="BUY"  and bid>=tp:
                    self.close_position(row["ticket"], "tp"); continue
                if row["direction"]=="SELL" and ask<=tp:
                    self.close_position(row["ticket"], "tp"); continue
            # Trailing stop
            if (self.config.risk_cfg.get("trailing_stop",True) and
                    sl>0 and row["pnl"]>0):
                if row["direction"]=="BUY":
                    trail = cur - abs(row["open_price"]-sl)
                    if trail > sl:
                        self.db.update_position_sl_tp(row["ticket"],trail,tp)
                else:
                    trail = cur + abs(sl-row["open_price"])
                    if trail < sl:
                        self.db.update_position_sl_tp(row["ticket"],trail,tp)

    # ── Market order ──────────────────────────────────────────────────────────
    def open_market(self, pair: str, direction: str, lot_size: float,
                    sl: float=0.0, tp: float=0.0,
                    comment: str="", is_signal: int=0
                    ) -> Tuple[bool, str]:
        with self._lock:
            ok, reason = self._pre_trade_checks(pair, lot_size)
            if not ok:
                self._emit_error(reason)
                return False, reason

            bid, ask = self.account.get_price(pair)
            if bid==0 or ask==0:
                msg = f"No price for {pair}"
                self._emit_error(msg); return False, msg

            slip = self.config.trading_cfg.get("slippage_pips",1.0)
            ps   = PIP_SIZE.get(pair,0.0001)
            exec_px = (ask + slip*ps) if direction=="BUY" else (bid - slip*ps)

            margin = self.account.margin_req(pair, lot_size, exec_px)
            snap   = self.account.snapshot()
            if margin > snap["free_margin"]:
                msg = (f"Insufficient margin: need {margin:.2f} "
                       f"free {snap['free_margin']:.2f}")
                self._emit_error(msg); return False, msg

            comm   = self.account.commission(lot_size)
            ticket = AccountManager.ticket()
            pos = Position(
                ticket      = ticket, pair=pair, direction=direction,
                lot_size    = lot_size, open_price=exec_px,
                stop_loss   = sl, take_profit=tp, current_price=exec_px,
                commission  = comm, margin_used=margin,
                opened_at   = time.time(), comment=comment, is_signal=is_signal)
            self.db.insert_position(pos)
            self.db.update_balance(-comm)

            msg = (f"#{ticket} {direction} {lot_size:.2f}L {pair}"
                   f" @ {exec_px:.5f}  SL:{sl:.5f}  TP:{tp:.5f}")
            logger.info("OPEN  %s", msg)
            self._emit_trade(msg)
            return True, ticket

    # ── Pending order ─────────────────────────────────────────────────────────
    def place_pending(self, pair: str, order_type: str, lot_size: float,
                      price: float, sl: float=0.0, tp: float=0.0,
                      comment: str="", expires_in: float=0.0
                      ) -> Tuple[bool, str]:
        with self._lock:
            ok, reason = self._pre_trade_checks(pair, lot_size)
            if not ok: return False, reason
            bid, ask = self.account.get_price(pair)
            valid = ("BUY_LIMIT","SELL_LIMIT","BUY_STOP","SELL_STOP")
            if order_type not in valid:
                return False, f"Invalid type: {order_type}"
            mid = (bid+ask)/2
            if order_type=="BUY_LIMIT"  and price>=ask: return False,"BUY_LIMIT below ask"
            if order_type=="SELL_LIMIT" and price<=bid: return False,"SELL_LIMIT above bid"
            if order_type=="BUY_STOP"   and price<=ask: return False,"BUY_STOP above ask"
            if order_type=="SELL_STOP"  and price>=bid: return False,"SELL_STOP below bid"
            ticket  = AccountManager.ticket()
            expires = time.time()+expires_in if expires_in>0 else 0.0
            ord_ = Order(ticket=ticket,pair=pair,order_type=order_type,
                         lot_size=lot_size,price=price,stop_loss=sl,
                         take_profit=tp,created_at=time.time(),
                         expires_at=expires,comment=comment)
            self.db.insert_order(ord_)
            msg = f"#{ticket} {order_type} {lot_size:.2f}L {pair} @ {price:.5f}"
            logger.info("PENDING %s", msg)
            self._emit_trade(msg)
            return True, ticket

    # ── Close position ─────────────────────────────────────────────────────────
    def close_position(self, ticket: str, reason: str="manual"
                       ) -> Tuple[bool, str]:
        with self._lock:
            row = self.db.get_position(ticket)
            if not row: return False, f"Not found: {ticket}"
            pair = row["pair"]
            bid, ask = self.account.get_price(pair)
            if bid==0: bid=ask=row["current_price"]
            close_px = bid if row["direction"]=="BUY" else ask
            pnl, pips = AccountManager.pnl(row["direction"],row["open_price"],
                                             close_px,row["lot_size"],pair)
            net = pnl + row["swap"] - row["commission"]
            hist = TradeHistory(
                ticket=ticket, pair=pair, direction=row["direction"],
                lot_size=row["lot_size"], open_price=row["open_price"],
                close_price=close_px, stop_loss=row["stop_loss"],
                take_profit=row["take_profit"], pnl=round(net,2),
                pnl_pips=round(pips,1), swap=row["swap"],
                commission=row["commission"], opened_at=row["opened_at"],
                closed_at=time.time(), close_reason=reason)
            self.db.insert_history(hist)
            self.db.delete_position(ticket)
            self.db.update_balance(net)
            msg = (f"#{ticket} CLOSED {row['direction']} {row['lot_size']:.2f}L"
                   f" {pair} @ {close_px:.5f}  P&L:{net:+.2f}  "
                   f"({pips:+.1f} pips)  [{reason}]")
            logger.info("CLOSE %s", msg)
            self._emit_trade(msg); self._emit_close(hist)
            return True, msg

    def close_all(self, reason: str="manual") -> int:
        n=0
        for r in self.db.get_positions():
            ok,_ = self.close_position(r["ticket"],reason)
            if ok: n+=1
        return n

    def modify_sl_tp(self, ticket: str, sl: float, tp: float
                     ) -> Tuple[bool, str]:
        row = self.db.get_position(ticket)
        if not row: return False, f"Not found: {ticket}"
        self.db.update_position_sl_tp(ticket,sl,tp)
        msg = f"#{ticket} modified SL={sl:.5f} TP={tp:.5f}"
        logger.info(msg); self._emit_trade(msg)
        return True, msg

    def cancel_order(self, ticket: str) -> Tuple[bool, str]:
        row = self.db.get_order(ticket)
        if not row: return False, f"Not found: {ticket}"
        self.db.delete_order(ticket)
        msg = f"#{ticket} {row['order_type']} {row['pair']} CANCELLED"
        logger.info(msg); self._emit_trade(msg)
        return True, msg

    # ── Pre-trade validation ───────────────────────────────────────────────────
    def _pre_trade_checks(self, pair: str, lots: float) -> Tuple[bool,str]:
        cfg  = self.config.trading_cfg
        if lots < cfg.get("min_lot",0.01):
            return False, f"Lot {lots} below minimum {cfg['min_lot']}"
        if lots > cfg.get("max_lot",100.0):
            return False, f"Lot {lots} above maximum {cfg['max_lot']}"
        n = len(self.db.get_positions())
        if n >= cfg.get("max_open_trades",20):
            return False, f"Max open trades ({cfg['max_open_trades']}) reached"
        if self.risk.daily_loss_breaker_tripped():
            return False, "Daily loss limit reached — trading halted"
        snap = self.account.snapshot()
        mc   = self.config.account_cfg.get("margin_call_pct",50.0)
        if (snap["margin_used"]>0 and 0<snap["margin_level"]<mc):
            return False, f"Margin level {snap['margin_level']:.1f}% too low"
        return True, "OK"

    # ── Background monitor ─────────────────────────────────────────────────────
    def _monitor_loop(self) -> None:
        while True:
            try:
                self._check_pending()
                self._check_margin()
                self.account.apply_swaps()
            except Exception as e:
                logger.debug("Monitor: %s", e)
            time.sleep(1.0)

    def _check_pending(self) -> None:
        now = time.time()
        for row in self.db.get_orders():
            if row["expires_at"]>0 and now>row["expires_at"]:
                self.cancel_order(row["ticket"]); continue
            bid, ask = self.account.get_price(row["pair"])
            if bid==0: continue
            triggered=False; direction=""
            if row["order_type"]=="BUY_LIMIT"  and ask<=row["price"]: triggered=True;direction="BUY"
            elif row["order_type"]=="SELL_LIMIT" and bid>=row["price"]: triggered=True;direction="SELL"
            elif row["order_type"]=="BUY_STOP"   and ask>=row["price"]: triggered=True;direction="BUY"
            elif row["order_type"]=="SELL_STOP"  and bid<=row["price"]: triggered=True;direction="SELL"
            if triggered:
                self.db.delete_order(row["ticket"])
                self.open_market(row["pair"],direction,row["lot_size"],
                                 sl=row["stop_loss"],tp=row["take_profit"],
                                 comment=f"Triggered {row['order_type']} #{row['ticket']}")

    def _check_margin(self) -> None:
        snap    = self.account.snapshot()
        stop_out= self.config.account_cfg.get("stop_out_pct",20.0)
        mc_pct  = self.config.account_cfg.get("margin_call_pct",50.0)
        if snap["margin_used"]==0: return
        ml = snap["margin_level"]
        if ml<=0: return
        if ml<=stop_out:
            msg=f"⚠ STOP-OUT! Margin level {ml:.1f}% — ALL positions closed"
            logger.warning(msg); self._emit_alert(msg)
            self.close_all("margin_call")
        elif ml<=mc_pct:
            msg=f"⚠ MARGIN CALL! Level {ml:.1f}% (min {mc_pct}%)"
            logger.warning(msg); self._emit_alert(msg)
