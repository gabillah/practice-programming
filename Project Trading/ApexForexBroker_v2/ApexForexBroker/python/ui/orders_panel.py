"""ui/orders_panel.py — Pending orders table."""
import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime
from ui.theme import COLOURS as C, FONTS as F


class OrdersPanel(tk.Frame):
    COLS  = ("ticket","pair","type","lots","price","sl","tp","created","expires")
    HEADS = ("Ticket","Pair","Type","Lots","Price","SL","TP","Created","Expires")
    WIDTHS= (90,70,90,50,90,80,80,130,130)

    def __init__(self, parent, engine, db, **kw):
        super().__init__(parent, bg=C["bg2"], **kw)
        self.engine = engine
        self.db     = db
        self._build()

    def _build(self):
        tb = tk.Frame(self, bg=C["bg2"])
        tb.pack(fill="x", padx=8, pady=4)
        tk.Label(tb, text="Pending Orders", bg=C["bg2"],
                 fg=C["text"], font=F["bold_lg"]).pack(side="left")
        for text, cmd, col in [
            ("Cancel Selected", self._cancel_sel, C["sell"]),
            ("Cancel All",      self._cancel_all, C["sell"]),
            ("Refresh",         self.refresh,     C["bg3"]),
        ]:
            tk.Button(tb, text=text, bg=col,
                      fg="white" if col!=C["bg3"] else C["text"],
                      font=F["bold_sm"], relief="flat", padx=8, pady=4,
                      cursor="hand2", command=cmd).pack(side="right", padx=4)

        frm = tk.Frame(self, bg=C["bg2"])
        frm.pack(fill="both", expand=True, padx=8, pady=4)
        self._tree = ttk.Treeview(frm, columns=self.COLS,
                                   show="headings", height=12)
        for col, head, w in zip(self.COLS, self.HEADS, self.WIDTHS):
            self._tree.heading(col, text=head)
            self._tree.column(col, width=w, anchor="center")
        sb = ttk.Scrollbar(frm, orient="vertical", command=self._tree.yview)
        self._tree.configure(yscrollcommand=sb.set)
        self._tree.pack(side="left", fill="both", expand=True)
        sb.pack(side="right", fill="y")
        self.refresh()

    def refresh(self):
        self._tree.delete(*self._tree.get_children())
        for r in self.db.get_orders():
            dp = 3 if "JPY" in r["pair"] else (2 if "XAU" in r["pair"] else 5)
            exp_str = (datetime.fromtimestamp(r["expires_at"]).strftime("%m-%d %H:%M")
                       if r["expires_at"]>0 else "GTC")
            self._tree.insert("", "end", iid=r["ticket"], values=(
                r["ticket"], r["pair"], r["order_type"],
                f"{r['lot_size']:.2f}", f"{r['price']:.{dp}f}",
                f"{r['stop_loss']:.{dp}f}" if r["stop_loss"]>0 else "—",
                f"{r['take_profit']:.{dp}f}" if r["take_profit"]>0 else "—",
                datetime.fromtimestamp(r["created_at"]).strftime("%m-%d %H:%M"),
                exp_str))

    def _cancel_sel(self):
        sel = self._tree.selection()
        if not sel: return
        for ticket in sel:
            self.engine.cancel_order(ticket)
        self.refresh()

    def _cancel_all(self):
        if messagebox.askyesno("Confirm","Cancel ALL pending orders?"):
            for r in self.db.get_orders():
                self.engine.cancel_order(r["ticket"])
            self.refresh()
