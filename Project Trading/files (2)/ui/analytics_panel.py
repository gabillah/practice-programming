"""ui/analytics_panel.py — Performance analytics with equity curve charts."""
from __future__ import annotations
import tkinter as tk
from tkinter import ttk
import matplotlib
matplotlib.use("TkAgg")
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import numpy as np
from ui.theme import COLOURS as C, FONTS as F


class AnalyticsPanel(tk.Frame):
    def __init__(self, parent, db, risk, **kw):
        super().__init__(parent, bg=C["bg2"], **kw)
        self.db   = db
        self.risk = risk
        self._build()
        self._refresh()

    def _build(self):
        tb = tk.Frame(self, bg=C["bg2"])
        tb.pack(fill="x", padx=8, pady=4)
        tk.Label(tb, text="Performance Analytics", bg=C["bg2"],
                 fg=C["text"], font=F["bold_lg"]).pack(side="left")
        tk.Button(tb, text="Refresh", bg=C["bg3"], fg=C["text"],
                  font=F["bold_sm"], relief="flat", padx=8, pady=4,
                  command=self._refresh).pack(side="right", padx=4)

        self._metrics_frm = tk.Frame(self, bg=C["bg2"])
        self._metrics_frm.pack(fill="x", padx=8, pady=4)

        chart_frm = tk.Frame(self, bg=C["bg2"])
        chart_frm.pack(fill="both", expand=True, padx=8)
        self._fig = plt.Figure(figsize=(14, 4), dpi=88,
                                facecolor=C["chart_bg"])
        self._canvas = FigureCanvasTkAgg(self._fig, master=chart_frm)
        self._canvas.get_tk_widget().pack(fill="both", expand=True)

    def _refresh(self):
        metrics = self.risk.compute_metrics()
        for w in self._metrics_frm.winfo_children():
            w.destroy()
        items = [
            ("Total Trades",  metrics["total_trades"], ""),
            ("Win Rate",      f"{metrics['win_rate']:.1f}%", ""),
            ("Profit Factor", f"{metrics['profit_factor']:.2f}", ""),
            ("Net P&L",       f"${metrics['net_pnl']:+,.2f}",
             "profit" if metrics["net_pnl"] >= 0 else "loss"),
            ("Gross Profit",  f"${metrics['gross_profit']:,.2f}", "profit"),
            ("Gross Loss",    f"${metrics['gross_loss']:,.2f}", "loss"),
            ("Avg Win",       f"${metrics['avg_win']:,.2f}", "profit"),
            ("Avg Loss",      f"${metrics['avg_loss']:,.2f}", "loss"),
            ("Expectancy",    f"${metrics['expectancy']:+,.2f}", ""),
            ("Sharpe",        f"{metrics['sharpe']:.3f}", ""),
            ("Sortino",       f"{metrics['sortino']:.3f}", ""),
            ("Calmar",        f"{metrics['calmar']:.3f}", ""),
            ("Max Drawdown",  f"${metrics['max_drawdown']:,.2f}", "loss"),
            ("Max DD %",      f"{metrics['max_dd_pct']:.1f}%", ""),
            ("VaR 95%",       f"${metrics['var_95']:,.2f}", ""),
            ("CVaR 95%",      f"${metrics['cvar_95']:,.2f}", ""),
        ]
        for i, (label, value, tag) in enumerate(items):
            col_ = i % 8
            row_ = i // 8
            card = tk.Frame(self._metrics_frm, bg=C["card"],
                            relief="solid", bd=1, padx=10, pady=6)
            card.grid(row=row_, column=col_, padx=4, pady=4, sticky="ew")
            self._metrics_frm.columnconfigure(col_, weight=1)
            tk.Label(card, text=label, bg=C["card"],
                     fg=C["text2"], font=F["small"]).pack()
            val_col = C["profit"] if tag=="profit" else (
                      C["loss"]   if tag=="loss"   else C["text"])
            tk.Label(card, text=str(value), bg=C["card"],
                     fg=val_col, font=F["bold_lg"]).pack()
        self._draw_charts(metrics)

    def _draw_charts(self, metrics):
        self._fig.clear()
        rows = self.db.get_history(500)
        pnls = [r["pnl"] for r in rows][::-1]
        if not pnls:
            return
        cum = np.cumsum(pnls)
        xs  = np.arange(len(cum))
        ax1 = self._fig.add_subplot(1, 3, 1)
        ax2 = self._fig.add_subplot(1, 3, 2)
        ax3 = self._fig.add_subplot(1, 3, 3)
        for ax in (ax1, ax2, ax3):
            ax.set_facecolor(C["chart_bg"])
            ax.tick_params(colors=C["text2"], labelsize=7)
            ax.spines[:].set_color(C["border"])
            ax.grid(True, color=C["chart_grid"], lw=0.5)

        ax1.plot(xs, cum, color=C["accent"], lw=1.5)
        ax1.fill_between(xs, cum, 0, where=np.array(cum) >= 0,
                          alpha=0.15, color=C["profit"])
        ax1.fill_between(xs, cum, 0, where=np.array(cum) < 0,
                          alpha=0.15, color=C["loss"])
        ax1.set_title("Cumulative P&L", fontsize=8, color=C["text2"])
        ax1.axhline(0, color=C["border"], lw=0.8)

        colors = [C["profit"] if p >= 0 else C["loss"] for p in pnls]
        ax2.bar(xs, np.array(pnls), color=colors, width=0.8)
        ax2.set_title("P&L per Trade", fontsize=8, color=C["text2"])
        ax2.axhline(0, color=C["border"], lw=0.8)

        wins   = metrics.get("wins", 0) or 0
        losses = metrics.get("losses", 0) or 0
        if wins + losses > 0:
            ax3.pie([wins, losses],
                    labels=[f"Wins {wins}", f"Losses {losses}"],
                    colors=[C["profit"], C["loss"]],
                    startangle=90,
                    textprops={"fontsize": 8, "color": C["text2"]},
                    autopct="%1.0f%%")
        ax3.set_title("Win / Loss Split", fontsize=8, color=C["text2"])
        self._fig.tight_layout(pad=1.0)
        self._canvas.draw_idle()
