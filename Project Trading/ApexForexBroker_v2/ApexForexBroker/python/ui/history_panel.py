"""ui/history_panel.py — Closed trade history table with CSV export."""
from __future__ import annotations
import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime
from ui.theme import COLOURS as C, FONTS as F


class HistoryPanel(tk.Frame):
    COLS   = ("ticket","pair","dir","lots","open","close","sl","tp",
               "pnl","pips","swap","comm","opened","closed","reason")
    HEADS  = ("Ticket","Pair","Dir","Lots","Open","Close","SL","TP",
               "P&L","Pips","Swap","Comm","Opened","Closed","Reason")
    WIDTHS = (90,70,40,50,85,85,80,80,75,55,65,55,130,130,70)

    def __init__(self, parent, db, reporter, **kw):
        super().__init__(parent, bg=C["bg2"], **kw)
        self.db       = db
        self.reporter = reporter
        self._build()

    def _build(self):
        tb = tk.Frame(self, bg=C["bg2"])
        tb.pack(fill="x", padx=8, pady=4)
        tk.Label(tb, text="Trade History", bg=C["bg2"],
                 fg=C["text"], font=F["bold_lg"]).pack(side="left")
        tk.Button(tb, text="Export CSV", bg=C["accent"], fg="white",
                  font=F["bold_sm"], relief="flat", padx=8, pady=4,
                  cursor="hand2", command=self._export).pack(side="right", padx=4)
        tk.Button(tb, text="Refresh", bg=C["bg3"], fg=C["text"],
                  font=F["bold_sm"], relief="flat", padx=8, pady=4,
                  cursor="hand2", command=self._refresh).pack(side="right", padx=4)

        self._summary_lbl = tk.Label(self, text="", bg=C["bg3"],
                                      fg=C["text"], font=F["small"],
                                      anchor="w", padx=10)
        self._summary_lbl.pack(fill="x", padx=8)

        frm = tk.Frame(self, bg=C["bg2"])
        frm.pack(fill="both", expand=True, padx=8, pady=4)
        self._tree = ttk.Treeview(frm, columns=self.COLS,
                                   show="headings", height=16)
        for col, head, w in zip(self.COLS, self.HEADS, self.WIDTHS):
            self._tree.heading(col, text=head,
                               command=lambda c=col: self._sort(c))
            self._tree.column(col, width=w, anchor="center")
        sb = ttk.Scrollbar(frm, orient="vertical", command=self._tree.yview)
        self._tree.configure(yscrollcommand=sb.set)
        self._tree.pack(side="left", fill="both", expand=True)
        sb.pack(side="right", fill="y")
        self._tree.tag_configure("profit", foreground=C["profit"])
        self._tree.tag_configure("loss",   foreground=C["loss"])
        self._refresh()

    def _refresh(self):
        self._tree.delete(*self._tree.get_children())
        rows  = self.db.get_history(500)
        stats = self.db.get_history_stats()
        for r in rows:
            dp  = 3 if "JPY" in r["pair"] else (2 if "XAU" in r["pair"] else 5)
            tag = "profit" if r["pnl"] >= 0 else "loss"
            self._tree.insert("", "end", tags=(tag,), values=(
                r["ticket"], r["pair"], r["direction"],
                f"{r['lot_size']:.2f}",
                f"{r['open_price']:.{dp}f}",
                f"{r['close_price']:.{dp}f}",
                f"{r['stop_loss']:.{dp}f}" if r["stop_loss"] > 0 else "—",
                f"{r['take_profit']:.{dp}f}" if r["take_profit"] > 0 else "—",
                f"{r['pnl']:+.2f}",
                f"{r['pnl_pips']:+.1f}",
                f"{r['swap']:+.4f}",
                f"{r['commission']:.2f}",
                datetime.fromtimestamp(r["opened_at"]).strftime("%m-%d %H:%M"),
                datetime.fromtimestamp(r["closed_at"]).strftime("%m-%d %H:%M"),
                r["close_reason"],
            ))
        n   = stats.get("total",  0) or 0
        wr  = (stats.get("wins",  0) or 0) / n * 100 if n > 0 else 0
        net = stats.get("net_pnl", 0) or 0
        gp  = stats.get("gross_profit", 0) or 0
        gl  = abs(stats.get("gross_loss", 1) or 1)
        pf  = gp / max(gl, 0.01)
        self._summary_lbl.config(text=(
            f"  Total: {n}  |  Win rate: {wr:.1f}%  |  "
            f"Net P&L: ${net:+,.2f}  |  Profit Factor: {pf:.2f}  |  "
            f"Gross Profit: ${gp:,.2f}  |  Gross Loss: ${gl:,.2f}"))

    def _sort(self, col):
        items = [(self._tree.set(k, col), k)
                 for k in self._tree.get_children("")]
        try:    items.sort(key=lambda t: float(t[0].replace("$","").replace(",","")))
        except ValueError: items.sort()
        for idx, (_, k) in enumerate(items):
            self._tree.move(k, "", idx)

    def _export(self):
        path = self.reporter.export_history()
        messagebox.showinfo("Exported", f"Saved to:\n{path}")
