"""ui/trading_panel.py — Manual order entry panel (BUY/SELL + pending orders)."""
from __future__ import annotations
import tkinter as tk
from tkinter import ttk, messagebox
from ui.theme import COLOURS as C, FONTS as F
import logging

logger = logging.getLogger(__name__)


class TradingPanel(tk.Frame):
    def __init__(self, parent, engine, account, config, db, **kw):
        super().__init__(parent, bg=C["bg2"], **kw)
        self.engine  = engine
        self.account = account
        self.config  = config
        self.db      = db
        self._build()

    def _build(self):
        # ── Left: Market order ───────────────────────────────────────────────
        left = tk.LabelFrame(self, text=" Market Order ",
                              bg=C["bg2"], fg=C["text2"],
                              font=F["bold_sm"], relief="groove", bd=1)
        left.pack(side="left", fill="both", expand=True,
                  padx=8, pady=8)
        self._build_market_form(left)

        # ── Middle: Pending order ─────────────────────────────────────────────
        mid = tk.LabelFrame(self, text=" Pending Order ",
                             bg=C["bg2"], fg=C["text2"],
                             font=F["bold_sm"], relief="groove", bd=1)
        mid.pack(side="left", fill="both", expand=True,
                 padx=8, pady=8)
        self._build_pending_form(mid)

        # ── Right: Quick tools ────────────────────────────────────────────────
        right = tk.LabelFrame(self, text=" Quick Actions ",
                               bg=C["bg2"], fg=C["text2"],
                               font=F["bold_sm"], relief="groove", bd=1)
        right.pack(side="left", fill="both", expand=False,
                   padx=8, pady=8, ipadx=8)
        self._build_quick_actions(right)

    # ── Market order form ──────────────────────────────────────────────────────
    def _build_market_form(self, parent):
        pairs = self.config.pairs
        row = 0

        def lbl(text, r):
            tk.Label(parent, text=text, bg=C["bg2"], fg=C["text2"],
                     font=F["small"], anchor="w").grid(
                     row=r, column=0, sticky="w", padx=8, pady=3)

        lbl("Instrument", row)
        self._mkt_pair = ttk.Combobox(parent, values=pairs, width=14,
                                       font=F["small"])
        self._mkt_pair.set(pairs[0] if pairs else "EUR/USD")
        self._mkt_pair.grid(row=row, column=1, padx=8, pady=3)
        self._mkt_pair.bind("<<ComboboxSelected>>", self._update_mkt_price)
        row+=1

        lbl("Bid / Ask", row)
        self._mkt_price_lbl = tk.Label(parent, text="— / —",
                                        bg=C["bg2"], fg=C["text"],
                                        font=F["price"])
        self._mkt_price_lbl.grid(row=row, column=1, padx=8)
        row+=1

        lbl("Lot Size", row)
        self._mkt_lot = tk.StringVar(value="0.10")
        lot_spin = tk.Spinbox(parent, textvariable=self._mkt_lot,
                               from_=0.01, to=100.0, increment=0.01,
                               format="%.2f", width=10, font=F["small"])
        lot_spin.grid(row=row, column=1, padx=8, pady=3)
        row+=1

        lbl("Stop Loss", row)
        self._mkt_sl = tk.Entry(parent, width=14, font=F["small"],
                                 bg=C["input_bg"])
        self._mkt_sl.insert(0,"0.0")
        self._mkt_sl.grid(row=row, column=1, padx=8, pady=3)
        row+=1

        lbl("Take Profit", row)
        self._mkt_tp = tk.Entry(parent, width=14, font=F["small"],
                                  bg=C["input_bg"])
        self._mkt_tp.insert(0,"0.0")
        self._mkt_tp.grid(row=row, column=1, padx=8, pady=3)
        row+=1

        lbl("Comment", row)
        self._mkt_comment = tk.Entry(parent, width=14, font=F["small"],
                                       bg=C["input_bg"])
        self._mkt_comment.grid(row=row, column=1, padx=8, pady=3)
        row+=1

        # Margin preview
        lbl("Margin req.", row)
        self._mkt_margin_lbl = tk.Label(parent, text="—",
                                         bg=C["bg2"], fg=C["text2"],
                                         font=F["small"])
        self._mkt_margin_lbl.grid(row=row, column=1, padx=8)
        row+=1

        # BUY / SELL buttons
        btn_row = tk.Frame(parent, bg=C["bg2"])
        btn_row.grid(row=row, column=0, columnspan=2, pady=10)
        tk.Button(btn_row, text="  ▲  BUY  ", bg=C["buy"],
                  fg="white", font=F["bold_lg"],
                  relief="flat", padx=12, pady=8,
                  cursor="hand2",
                  command=lambda: self._market_order("BUY")).pack(
                  side="left", padx=8)
        tk.Button(btn_row, text="  ▼  SELL  ", bg=C["sell"],
                  fg="white", font=F["bold_lg"],
                  relief="flat", padx=12, pady=8,
                  cursor="hand2",
                  command=lambda: self._market_order("SELL")).pack(
                  side="left", padx=8)

        # Auto-update price every second
        self._update_mkt_price()

    def _update_mkt_price(self, *_):
        pair = self._mkt_pair.get()
        bid, ask = self.account.get_price(pair)
        dp = 3 if "JPY" in pair else (2 if "XAU" in pair else 5)
        if bid:
            self._mkt_price_lbl.config(text=f"{bid:.{dp}f} / {ask:.{dp}f}")
        # Margin preview
        try:
            lots  = float(self._mkt_lot.get())
            price = ask if ask>0 else bid
            if price>0:
                m = self.account.margin_req(pair, lots, price)
                self._mkt_margin_lbl.config(text=f"${m:,.2f}")
        except Exception:
            pass
        self.after(1000, self._update_mkt_price)

    def _market_order(self, direction: str):
        pair = self._mkt_pair.get()
        try:
            lots = float(self._mkt_lot.get())
            sl   = float(self._mkt_sl.get())
            tp   = float(self._mkt_tp.get())
        except ValueError:
            messagebox.showerror("Input Error", "Invalid lot/SL/TP value")
            return
        cmt = self._mkt_comment.get()
        ok, msg = self.engine.open_market(pair, direction, lots,
                                           sl=sl, tp=tp, comment=cmt)
        if not ok:
            messagebox.showerror("Order Failed", msg)

    # ── Pending order form ─────────────────────────────────────────────────────
    def _build_pending_form(self, parent):
        pairs   = self.config.pairs
        types   = ["BUY_LIMIT","SELL_LIMIT","BUY_STOP","SELL_STOP"]
        row     = 0

        def lbl(text, r):
            tk.Label(parent, text=text, bg=C["bg2"], fg=C["text2"],
                     font=F["small"], anchor="w").grid(
                     row=r, column=0, sticky="w", padx=8, pady=3)

        lbl("Instrument", row)
        self._pnd_pair = ttk.Combobox(parent, values=pairs, width=14,
                                       font=F["small"])
        self._pnd_pair.set(pairs[0] if pairs else "EUR/USD")
        self._pnd_pair.grid(row=row, column=1, padx=8, pady=3)
        row+=1

        lbl("Order Type", row)
        self._pnd_type = ttk.Combobox(parent, values=types, width=14,
                                       font=F["small"])
        self._pnd_type.set("BUY_LIMIT")
        self._pnd_type.grid(row=row, column=1, padx=8, pady=3)
        row+=1

        lbl("Lot Size", row)
        self._pnd_lot = tk.StringVar(value="0.10")
        tk.Spinbox(parent, textvariable=self._pnd_lot,
                   from_=0.01, to=100.0, increment=0.01,
                   format="%.2f", width=10, font=F["small"]).grid(
                   row=row, column=1, padx=8, pady=3)
        row+=1

        for label, attr in [("Price","_pnd_price"),
                              ("Stop Loss","_pnd_sl"),
                              ("Take Profit","_pnd_tp")]:
            lbl(label, row)
            e = tk.Entry(parent, width=14, font=F["small"], bg=C["input_bg"])
            e.insert(0,"0.0")
            e.grid(row=row, column=1, padx=8, pady=3)
            setattr(self, attr, e)
            row+=1

        lbl("Expire (sec)", row)
        self._pnd_exp = tk.Entry(parent, width=14, font=F["small"],
                                   bg=C["input_bg"])
        self._pnd_exp.insert(0,"0")
        self._pnd_exp.grid(row=row, column=1, padx=8, pady=3)
        row+=1

        btn_row = tk.Frame(parent, bg=C["bg2"])
        btn_row.grid(row=row, column=0, columnspan=2, pady=10)
        tk.Button(btn_row, text="Place Pending Order",
                  bg=C["accent"], fg="white", font=F["bold_sm"],
                  relief="flat", padx=12, pady=8, cursor="hand2",
                  command=self._place_pending).pack()

    def _place_pending(self):
        pair  = self._pnd_pair.get()
        otype = self._pnd_type.get()
        try:
            lots = float(self._pnd_lot.get())
            px   = float(self._pnd_price.get())
            sl   = float(self._pnd_sl.get())
            tp   = float(self._pnd_tp.get())
            exp  = float(self._pnd_exp.get())
        except ValueError:
            messagebox.showerror("Input Error", "Invalid numeric value")
            return
        ok, msg = self.engine.place_pending(pair, otype, lots, px,
                                             sl=sl, tp=tp, expires_in=exp)
        if not ok:
            messagebox.showerror("Order Failed", msg)

    # ── Quick actions ──────────────────────────────────────────────────────────
    def _build_quick_actions(self, parent):
        btns = [
            ("Close All Positions", self._close_all, C["sell"]),
            ("Close All Profitable",self._close_profit, C["buy"]),
            ("Close All Losing",    self._close_losing, C["warning"]),
        ]
        for i,(text,cmd,bg) in enumerate(btns):
            tk.Button(parent, text=text, bg=bg, fg="white",
                      font=F["bold_sm"], relief="flat",
                      padx=10, pady=8, cursor="hand2",
                      command=cmd).pack(padx=12, pady=6, fill="x")

        ttk.Separator(parent, orient="horizontal").pack(fill="x", pady=8)

        # Auto-trade toggle
        self._auto_var = tk.BooleanVar(
            value=self.config.signal_cfg.get("auto_trade", False))
        auto_cb = tk.Checkbutton(
            parent, text="Auto-trade signals",
            variable=self._auto_var,
            bg=C["bg2"], fg=C["text"], font=F["bold_sm"],
            activebackground=C["bg2"],
            command=self._toggle_auto)
        auto_cb.pack(padx=12, pady=4, anchor="w")

        # Lot size for auto-trade
        auto_lot_row = tk.Frame(parent, bg=C["bg2"])
        auto_lot_row.pack(fill="x", padx=12, pady=2)
        tk.Label(auto_lot_row, text="Auto lot:", bg=C["bg2"],
                 fg=C["text2"], font=F["small"]).pack(side="left")
        self._auto_lot_var = tk.StringVar(
            value=str(self.config.signal_cfg.get("auto_lot", 0.01)))
        tk.Spinbox(auto_lot_row, textvariable=self._auto_lot_var,
                   from_=0.01, to=10.0, increment=0.01,
                   format="%.2f", width=7, font=F["small"]).pack(side="left",padx=4)

        ttk.Separator(parent, orient="horizontal").pack(fill="x", pady=8)

        # Account balance display
        self._acc_lbl = tk.Label(parent, text="", bg=C["bg2"],
                                  fg=C["text2"], font=F["small"],
                                  justify="left")
        self._acc_lbl.pack(padx=12, anchor="w")
        self._refresh_acc()

    def _close_all(self):
        if messagebox.askyesno("Confirm","Close ALL open positions?"):
            n = self.engine.close_all("manual")
            messagebox.showinfo("Done", f"Closed {n} positions")

    def _close_profit(self):
        n=0
        for row in self.db.get_positions():
            if row["pnl"]>0:
                ok,_=self.engine.close_position(row["ticket"],"manual")
                if ok: n+=1
        messagebox.showinfo("Done",f"Closed {n} profitable positions")

    def _close_losing(self):
        n=0
        for row in self.db.get_positions():
            if row["pnl"]<=0:
                ok,_=self.engine.close_position(row["ticket"],"manual")
                if ok: n+=1
        messagebox.showinfo("Done",f"Closed {n} losing positions")

    def _toggle_auto(self):
        v = self._auto_var.get()
        self.config.set("signal_engine","auto_trade", value=v)
        try:
            lot = float(self._auto_lot_var.get())
            self.config.set("signal_engine","auto_lot", value=lot)
        except ValueError: pass
        logger.info("Auto-trade: %s", v)

    def _refresh_acc(self):
        snap = self.account.snapshot()
        self._acc_lbl.config(text=(
            f"Balance:    ${snap['balance']:>10,.2f}\n"
            f"Equity:     ${snap['equity']:>10,.2f}\n"
            f"Free Margin:${snap['free_margin']:>10,.2f}\n"
            f"Margin Used:${snap['margin_used']:>10,.2f}\n"
            f"Open P&L:   ${snap['floating_pnl']:>+10,.2f}\n"
            f"Open Trades: {snap['open_trades']:>9}"))
        self.after(2000, self._refresh_acc)
