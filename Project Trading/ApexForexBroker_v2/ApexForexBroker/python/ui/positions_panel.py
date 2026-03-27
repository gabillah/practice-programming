"""
ui/positions_panel.py — Open positions table with live P&L and close/modify buttons.
"""
from __future__ import annotations
import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
from datetime import datetime
from ui.theme import COLOURS as C, FONTS as F


class PositionsPanel(tk.Frame):
    COLS = ("ticket","pair","dir","lots","open","current","sl","tp",
            "pnl","pips","swap","margin","opened")
    HEADS= ("Ticket","Pair","Dir","Lots","Open","Current","SL","TP",
            "P&L","Pips","Swap","Margin","Opened")
    WIDTHS=(80,70,40,50,80,80,80,80,75,55,60,70,120)

    def __init__(self, parent, engine, db, config, **kw):
        super().__init__(parent, bg=C["bg2"], **kw)
        self.engine = engine
        self.db     = db
        self.config = config
        self._build()

    def _build(self):
        # Toolbar
        tb = tk.Frame(self, bg=C["bg2"])
        tb.pack(fill="x", padx=8, pady=4)
        tk.Label(tb, text="Open Positions", bg=C["bg2"],
                 fg=C["text"], font=F["bold_lg"]).pack(side="left")
        for text, cmd, col in [
            ("Close Selected", self._close_sel, C["sell"]),
            ("Modify SL/TP",   self._modify_sel,C["accent"]),
            ("Close All",      self._close_all, C["sell"]),
            ("Refresh",        self.refresh,    C["bg3"]),
        ]:
            tk.Button(tb, text=text, bg=col, fg="white" if col!=C["bg3"] else C["text"],
                      font=F["bold_sm"], relief="flat", padx=8, pady=4,
                      cursor="hand2", command=cmd).pack(side="right", padx=4)

        # Treeview
        frm = tk.Frame(self, bg=C["bg2"])
        frm.pack(fill="both", expand=True, padx=8, pady=4)
        self._tree = ttk.Treeview(frm, columns=self.COLS, show="headings",
                                   height=12, selectmode="extended")
        for col, head, w in zip(self.COLS, self.HEADS, self.WIDTHS):
            self._tree.heading(col, text=head)
            self._tree.column(col, width=w, anchor="center")
        sb = ttk.Scrollbar(frm, orient="vertical", command=self._tree.yview)
        self._tree.configure(yscrollcommand=sb.set)
        self._tree.pack(side="left", fill="both", expand=True)
        sb.pack(side="right", fill="y")
        self._tree.tag_configure("profit", foreground=C["profit"])
        self._tree.tag_configure("loss",   foreground=C["loss"])
        self._tree.tag_configure("buy",    foreground=C["buy"])
        self._tree.tag_configure("sell",   foreground=C["sell"])

    def refresh(self):
        self._tree.delete(*self._tree.get_children())
        rows = self.db.get_positions()
        dp   = lambda p: 3 if "JPY" in p else (2 if "XAU" in p else 5)
        for r in rows:
            d    = dp(r["pair"])
            tag  = "buy" if r["direction"]=="BUY" else "sell"
            ptag = "profit" if r["pnl"]>=0 else "loss"
            self._tree.insert("", "end", iid=r["ticket"], tags=(tag,ptag), values=(
                r["ticket"], r["pair"], r["direction"],
                f"{r['lot_size']:.2f}",
                f"{r['open_price']:.{d}f}",
                f"{r['current_price']:.{d}f}",
                f"{r['stop_loss']:.{d}f}" if r["stop_loss"]>0 else "—",
                f"{r['take_profit']:.{d}f}" if r["take_profit"]>0 else "—",
                f"{r['pnl']:+.2f}",
                f"{r['pnl_pips']:+.1f}",
                f"{r['swap']:+.4f}",
                f"{r['margin_used']:.2f}",
                datetime.fromtimestamp(r["opened_at"]).strftime("%m-%d %H:%M"),
            ))

    def _close_sel(self):
        sel = self._tree.selection()
        if not sel: messagebox.showinfo("","Select a position first"); return
        if messagebox.askyesno("Confirm",f"Close {len(sel)} position(s)?"):
            for ticket in sel:
                self.engine.close_position(ticket,"manual")
            self.refresh()

    def _close_all(self):
        if messagebox.askyesno("Confirm","Close ALL open positions?"):
            self.engine.close_all("manual"); self.refresh()

    def _modify_sel(self):
        sel = self._tree.selection()
        if not sel: messagebox.showinfo("","Select a position first"); return
        ticket = sel[0]
        row = self.db.get_position(ticket)
        if not row: return
        sl = simpledialog.askfloat("Modify SL",
                                    f"New Stop Loss for #{ticket}:",
                                    initialvalue=row["stop_loss"])
        if sl is None: return
        tp = simpledialog.askfloat("Modify TP",
                                    f"New Take Profit for #{ticket}:",
                                    initialvalue=row["take_profit"])
        if tp is None: return
        self.engine.modify_sl_tp(ticket, sl, tp)
        self.refresh()
