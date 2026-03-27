"""
ui/signals_panel.py — Live signal cards feed with trade button.
ui/history_panel.py — Trade history table and export.
ui/analytics_panel.py — Performance analytics with equity curve.
ui/risk_panel.py — Risk dashboard with metrics.
"""

# ══════════════════════════════════════════════════════════════════════════════
# signals_panel.py
# ══════════════════════════════════════════════════════════════════════════════
import tkinter as tk
from tkinter import ttk
from datetime import datetime
from ui.theme import COLOURS as C, FONTS as F


class SignalsPanel(tk.Frame):
    def __init__(self, parent, engine, config, **kw):
        super().__init__(parent, bg=C["bg2"], **kw)
        self.engine = engine
        self.config = config
        self._cards = []
        self._build()

    def _build(self):
        tb = tk.Frame(self, bg=C["bg2"])
        tb.pack(fill="x", padx=8, pady=4)
        tk.Label(tb, text="Live Trading Signals", bg=C["bg2"],
                 fg=C["text"], font=F["bold_lg"]).pack(side="left")
        self._count_lbl = tk.Label(tb, text="Waiting for signals…",
                                    bg=C["bg2"], fg=C["text2"], font=F["small"])
        self._count_lbl.pack(side="left", padx=8)
        tk.Button(tb, text="Clear All", bg=C["bg3"], fg=C["text"],
                  font=F["bold_sm"], relief="flat", padx=8, pady=3,
                  command=self._clear).pack(side="right", padx=4)

        outer = tk.Frame(self, bg=C["bg2"])
        outer.pack(fill="both", expand=True)
        self._canvas = tk.Canvas(outer, bg=C["bg2"], highlightthickness=0)
        sb = ttk.Scrollbar(outer, orient="vertical",
                           command=self._canvas.yview)
        self._canvas.configure(yscrollcommand=sb.set)
        sb.pack(side="right", fill="y")
        self._canvas.pack(side="left", fill="both", expand=True)
        self._inner = tk.Frame(self._canvas, bg=C["bg2"])
        self._win_id = self._canvas.create_window(
            (0, 0), window=self._inner, anchor="nw")
        self._inner.bind("<Configure>",
            lambda e: self._canvas.configure(
                scrollregion=self._canvas.bbox("all")))
        self._canvas.bind("<Configure>",
            lambda e: self._canvas.itemconfig(self._win_id, width=e.width))

    def add_signal(self, sig):
        card = _SignalCard(self._inner, sig, self.engine)
        card.pack(fill="x", padx=8, pady=4)
        self._cards.insert(0, card)
        if len(self._cards) > 40:
            old = self._cards.pop()
            try: old.destroy()
            except Exception: pass
        self._count_lbl.config(text=f"{len(self._cards)} signal(s) received")

    def _clear(self):
        for c in self._cards:
            try: c.destroy()
            except Exception: pass
        self._cards.clear()
        self._count_lbl.config(text="Waiting for signals…")


class _SignalCard(tk.Frame):
    def __init__(self, parent, sig, engine, **kw):
        is_buy  = sig.direction.name == "BUY"
        bar_col = C["buy"] if is_buy else C["sell"]
        card_bg = C["buy_bg"] if is_buy else C["sell_bg"]
        super().__init__(parent, bg=C["card_border"], relief="flat",
                         bd=1, **kw)
        self.sig    = sig
        self.engine = engine

        # Left accent bar
        tk.Frame(self, bg=bar_col, width=6).pack(side="left", fill="y")

        # Card body
        body = tk.Frame(self, bg=card_bg)
        body.pack(side="left", fill="both", expand=True, padx=10, pady=8)

        # ── Row 1: pair, direction, strength, time ────────────────────────────
        r1 = tk.Frame(body, bg=card_bg)
        r1.pack(fill="x")
        tk.Label(r1, text=sig.pair, bg=card_bg,
                 fg=C["text"], font=F["bold_lg"]).pack(side="left")
        tk.Label(r1,
                 text=f"  {'▲ BUY' if is_buy else '▼ SELL'}  ",
                 bg=bar_col, fg="white",
                 font=F["bold_sm"]).pack(side="left", padx=6)
        strength_map = {"WEAK":"●○○○","MODERATE":"●●○○",
                        "STRONG":"●●●○","VERY STRONG":"●●●●"}
        tk.Label(r1, text=strength_map.get(sig.strength_str, "●●○○"),
                 bg=card_bg, fg=bar_col,
                 font=("Segoe UI",12)).pack(side="left", padx=4)
        tk.Label(r1, text=sig.session, bg=card_bg,
                 fg=C["text2"], font=F["small"]).pack(side="left", padx=8)
        ts_str = datetime.fromtimestamp(sig.timestamp).strftime("%H:%M:%S")
        tk.Label(r1, text=f"{sig.timeframe}  •  {ts_str}",
                 bg=card_bg, fg=C["text3"],
                 font=F["small"]).pack(side="right")

        # ── Row 2: prices ─────────────────────────────────────────────────────
        dp = 3 if "JPY" in sig.pair else (2 if "XAU" in sig.pair else 5)
        r2 = tk.Frame(body, bg=card_bg)
        r2.pack(fill="x", pady=4)
        price_items = [
            ("Entry",     sig.entry_price, C["text"]),
            ("Stop Loss", sig.stop_loss,   C["sell"]),
            ("TP 1",      sig.take_profit, C["buy"]),
            ("TP 2",      sig.tp2,         C["buy"]),
            ("TP 3",      sig.tp3,         C["buy"]),
        ]
        for label, val, col in price_items:
            col_frm = tk.Frame(r2, bg=card_bg)
            col_frm.pack(side="left", padx=8)
            tk.Label(col_frm, text=label, bg=card_bg,
                     fg=C["text3"], font=F["small"]).pack()
            tk.Label(col_frm, text=f"{val:.{dp}f}", bg=card_bg,
                     fg=col, font=F["mono_sm"]).pack()

        # ── Row 3: confidence bar + metrics ───────────────────────────────────
        r3 = tk.Frame(body, bg=card_bg)
        r3.pack(fill="x", pady=2)
        conf_pct = int(sig.confidence * 100)
        tk.Label(r3, text="Confidence:", bg=card_bg,
                 fg=C["text2"], font=F["small"]).pack(side="left")
        bar_outer = tk.Frame(r3, bg=C["border"], width=140, height=10)
        bar_outer.pack(side="left", padx=6)
        bar_outer.pack_propagate(False)
        fill_w = max(4, int(140 * sig.confidence))
        tk.Frame(bar_outer, bg=bar_col,
                 width=fill_w, height=10).place(x=0, y=0)
        tk.Label(r3, text=f"{conf_pct}%", bg=card_bg,
                 fg=bar_col, font=F["bold_sm"]).pack(side="left")
        tk.Label(r3, text=f"  R:R {sig.risk_reward:.2f}",
                 bg=card_bg, fg=C["text2"], font=F["small"]).pack(side="left",padx=8)
        tk.Label(r3, text=f"Lot: {sig.lot_size:.2f}",
                 bg=card_bg, fg=C["text2"], font=F["small"]).pack(side="left",padx=4)
        tk.Label(r3, text=f"ATR: {sig.atr:.5f}",
                 bg=card_bg, fg=C["text2"], font=F["small"]).pack(side="left",padx=4)
        tk.Label(r3, text=f"Votes: {sig.votes_bull}↑ {sig.votes_bear}↓",
                 bg=card_bg, fg=C["text2"], font=F["small"]).pack(side="left",padx=4)

        # ── Row 4: notes ──────────────────────────────────────────────────────
        if sig.notes:
            r4 = tk.Frame(body, bg=card_bg)
            r4.pack(fill="x", pady=2)
            note_txt = "  •  ".join(sig.notes[:4])
            tk.Label(r4, text=note_txt, bg=card_bg,
                     fg=C["text2"], font=F["small"],
                     wraplength=700, anchor="w").pack(side="left")

        # ── Trade button ──────────────────────────────────────────────────────
        btn_frm = tk.Frame(self, bg=card_bg)
        btn_frm.pack(side="right", fill="y", padx=8)
        tk.Button(btn_frm,
                  text=f"{'BUY' if is_buy else 'SELL'}\n{sig.lot_size:.2f}L",
                  bg=bar_col, fg="white", font=F["bold_sm"],
                  relief="flat", padx=10, pady=6, cursor="hand2",
                  command=self._trade).pack(expand=True)

    def _trade(self):
        sig = self.sig
        d   = sig.direction.name
        ok, msg = self.engine.open_market(
            sig.pair, d, sig.lot_size,
            sl=sig.stop_loss, tp=sig.take_profit,
            comment=f"From signal {sig.timeframe} {sig.strength_str}")
        from tkinter import messagebox
        if ok:
            messagebox.showinfo("Trade Opened", msg)
        else:
            messagebox.showerror("Trade Failed", msg)


# ══════════════════════════════════════════════════════════════════════════════
# history_panel.py
# ══════════════════════════════════════════════════════════════════════════════
class HistoryPanel(tk.Frame):
    COLS  = ("ticket","pair","dir","lots","open","close","sl","tp",
             "pnl","pips","swap","comm","opened","closed","reason")
    HEADS = ("Ticket","Pair","Dir","Lots","Open","Close","SL","TP",
             "P&L","Pips","Swap","Comm","Opened","Closed","Reason")
    WIDTHS= (90,70,40,50,85,85,80,80,75,55,65,55,130,130,70)

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
        for text, cmd, col in [
            ("Export CSV",    self._export,  C["accent"]),
            ("Refresh",       self._refresh, C["bg3"]),
        ]:
            tk.Button(tb, text=text, bg=col,
                      fg="white" if col != C["bg3"] else C["text"],
                      font=F["bold_sm"], relief="flat", padx=8, pady=4,
                      cursor="hand2", command=cmd).pack(side="right", padx=4)

        # Summary strip
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
        rows = self.db.get_history(500)
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
        n   = stats.get("total", 0) or 0
        wr  = (stats.get("wins", 0) or 0) / n * 100 if n > 0 else 0
        net = stats.get("net_pnl", 0) or 0
        pf  = (stats.get("gross_profit", 0) or 0) / max(abs(stats.get("gross_loss", 1) or 1), 0.01)
        self._summary_lbl.config(text=(
            f"  Total: {n}  |  Win rate: {wr:.1f}%  |  "
            f"Net P&L: ${net:+,.2f}  |  Profit Factor: {pf:.2f}  |  "
            f"Gross Profit: ${stats.get('gross_profit',0):,.2f}  |  "
            f"Gross Loss: ${abs(stats.get('gross_loss',0)):,.2f}"))

    def _sort(self, col):
        items = [(self._tree.set(k, col), k)
                 for k in self._tree.get_children("")]
        try:
            items.sort(key=lambda t: float(t[0].replace("$","").replace(",","")))
        except ValueError:
            items.sort()
        for idx, (_, k) in enumerate(items):
            self._tree.move(k, "", idx)

    def _export(self):
        path = self.reporter.export_history()
        from tkinter import messagebox
        messagebox.showinfo("Exported", f"Saved to:\n{path}")


# ══════════════════════════════════════════════════════════════════════════════
# analytics_panel.py
# ══════════════════════════════════════════════════════════════════════════════
import matplotlib
matplotlib.use("TkAgg")
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import numpy as np


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

        # Top: metrics grid
        self._metrics_frm = tk.Frame(self, bg=C["bg2"])
        self._metrics_frm.pack(fill="x", padx=8, pady=4)

        # Bottom: charts
        chart_frm = tk.Frame(self, bg=C["bg2"])
        chart_frm.pack(fill="both", expand=True, padx=8)
        self._fig = plt.Figure(figsize=(14, 4), dpi=88,
                                facecolor=C["chart_bg"])
        self._canvas = FigureCanvasTkAgg(self._fig, master=chart_frm)
        self._canvas.get_tk_widget().pack(fill="both", expand=True)

    def _refresh(self):
        metrics = self.risk.compute_metrics()
        # Clear and rebuild metrics grid
        for w in self._metrics_frm.winfo_children():
            w.destroy()
        items = [
            ("Total Trades",    metrics["total_trades"], ""),
            ("Win Rate",        f"{metrics['win_rate']:.1f}%", ""),
            ("Profit Factor",   f"{metrics['profit_factor']:.2f}", ""),
            ("Net P&L",         f"${metrics['net_pnl']:+,.2f}",
             "profit" if metrics["net_pnl"] >= 0 else "loss"),
            ("Gross Profit",    f"${metrics['gross_profit']:,.2f}", "profit"),
            ("Gross Loss",      f"${metrics['gross_loss']:,.2f}", "loss"),
            ("Avg Win",         f"${metrics['avg_win']:,.2f}", "profit"),
            ("Avg Loss",        f"${metrics['avg_loss']:,.2f}", "loss"),
            ("Expectancy",      f"${metrics['expectancy']:+,.2f}", ""),
            ("Sharpe",          f"{metrics['sharpe']:.3f}", ""),
            ("Sortino",         f"{metrics['sortino']:.3f}", ""),
            ("Calmar",          f"{metrics['calmar']:.3f}", ""),
            ("Max Drawdown",    f"${metrics['max_drawdown']:,.2f}", "loss"),
            ("Max DD %",        f"{metrics['max_dd_pct']:.1f}%", ""),
            ("VaR 95%",         f"${metrics['var_95']:,.2f}", ""),
            ("CVaR 95%",        f"${metrics['cvar_95']:,.2f}", ""),
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
        pnls = [r["pnl"] for r in rows][::-1]   # chronological
        if not pnls:
            return
        cum   = np.cumsum(pnls)
        xs    = np.arange(len(cum))
        # Axes
        ax1 = self._fig.add_subplot(1, 3, 1)
        ax2 = self._fig.add_subplot(1, 3, 2)
        ax3 = self._fig.add_subplot(1, 3, 3)
        for ax in (ax1, ax2, ax3):
            ax.set_facecolor(C["chart_bg"])
            ax.tick_params(colors=C["text2"], labelsize=7)
            ax.spines[:].set_color(C["border"])
            ax.grid(True, color=C["chart_grid"], lw=0.5)

        # Equity curve
        ax1.plot(xs, cum, color=C["accent"], lw=1.5)
        ax1.fill_between(xs, cum, 0,
                          where=np.array(cum) >= 0,
                          alpha=0.15, color=C["profit"])
        ax1.fill_between(xs, cum, 0,
                          where=np.array(cum) < 0,
                          alpha=0.15, color=C["loss"])
        ax1.set_title("Cumulative P&L", fontsize=8, color=C["text2"])
        ax1.axhline(0, color=C["border"], lw=0.8)

        # P&L distribution
        arr = np.array(pnls)
        colors = [C["profit"] if p >= 0 else C["loss"] for p in pnls]
        ax2.bar(xs, arr, color=colors, width=0.8)
        ax2.set_title("P&L per Trade", fontsize=8, color=C["text2"])
        ax2.axhline(0, color=C["border"], lw=0.8)

        # Win/loss pie
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


# ══════════════════════════════════════════════════════════════════════════════
# risk_panel.py
# ══════════════════════════════════════════════════════════════════════════════
class RiskPanel(tk.Frame):
    def __init__(self, parent, risk, account, config, **kw):
        super().__init__(parent, bg=C["bg2"], **kw)
        self.risk    = risk
        self.account = account
        self.config  = config
        self._labels = {}
        self._build()

    def _build(self):
        tk.Label(self, text="Risk Dashboard", bg=C["bg2"],
                 fg=C["text"], font=F["bold_lg"]).pack(
                 padx=12, pady=8, anchor="w")

        # Settings section
        sfrm = tk.LabelFrame(self, text=" Risk Settings ",
                              bg=C["bg2"], fg=C["text2"],
                              font=F["bold_sm"], relief="groove", bd=1)
        sfrm.pack(fill="x", padx=12, pady=4)
        self._build_settings(sfrm)

        # Live metrics
        mfrm = tk.LabelFrame(self, text=" Live Risk Metrics ",
                              bg=C["bg2"], fg=C["text2"],
                              font=F["bold_sm"], relief="groove", bd=1)
        mfrm.pack(fill="x", padx=12, pady=4)
        self._build_metrics(mfrm)

        # Margin level gauge
        gfrm = tk.LabelFrame(self, text=" Margin Level Gauge ",
                              bg=C["bg2"], fg=C["text2"],
                              font=F["bold_sm"], relief="groove", bd=1)
        gfrm.pack(fill="x", padx=12, pady=4)
        self._build_gauge(gfrm)

    def _build_settings(self, parent):
        cfg = self.config.risk_cfg
        fields = [
            ("Risk per trade (%)", "risk_per_trade_pct", 0.1, 10.0, 0.1),
            ("Max daily loss (%)", "max_daily_loss_pct", 0.5, 20.0, 0.5),
            ("SL ATR multiplier",  "default_sl_atr_mult",0.5,  5.0, 0.5),
            ("TP Risk:Reward",     "default_tp_rr",       0.5,  5.0, 0.5),
            ("Kelly fraction",     "kelly_fraction",       0.0,  1.0, 0.05),
        ]
        for i, (label, key, lo, hi, step) in enumerate(fields):
            row = i // 3
            col = (i % 3) * 2
            tk.Label(parent, text=label, bg=C["bg2"],
                     fg=C["text2"], font=F["small"]).grid(
                     row=row, column=col, padx=8, pady=4, sticky="w")
            var = tk.StringVar(value=str(cfg.get(key, 1.0)))
            sp  = tk.Spinbox(parent, textvariable=var,
                              from_=lo, to=hi, increment=step,
                              width=8, font=F["small"], bg=C["input_bg"])
            sp.grid(row=row, column=col+1, padx=4, pady=4)
            def _save(k=key, v=var):
                try:
                    self.config.set("risk", k, value=float(v.get()))
                except Exception: pass
            sp.bind("<FocusOut>", lambda e, f=_save: f())

        # Trailing stop toggle
        self._trail_var = tk.BooleanVar(
            value=cfg.get("trailing_stop", True))
        tk.Checkbutton(parent, text="Trailing Stop",
                       variable=self._trail_var,
                       bg=C["bg2"], fg=C["text"], font=F["small"],
                       activebackground=C["bg2"],
                       command=lambda: self.config.set(
                           "risk","trailing_stop",
                           value=self._trail_var.get())).grid(
                       row=2, column=0, columnspan=2, padx=8, pady=4,
                       sticky="w")

    def _build_metrics(self, parent):
        items = [
            ("Balance", "balance", "$"),
            ("Equity", "equity", "$"),
            ("Free Margin", "free_margin", "$"),
            ("Margin Used", "margin_used", "$"),
            ("Floating P&L", "floating_pnl", "$"),
            ("Margin Level", "margin_level", "%"),
            ("Daily P&L", "daily_pnl", "$"),
            ("Open Trades", "open_trades", ""),
            ("Sharpe Ratio", "sharpe", ""),
            ("Sortino Ratio", "sortino", ""),
            ("Max Drawdown", "max_drawdown", "$"),
            ("Win Rate", "win_rate", "%"),
            ("Profit Factor", "profit_factor", "×"),
            ("Expectancy", "expectancy", "$"),
            ("VaR 95%", "var_95", "$"),
            ("CVaR 95%", "cvar_95", "$"),
        ]
        for i, (label, key, unit) in enumerate(items):
            row_ = i // 4
            col_ = (i % 4) * 2
            tk.Label(parent, text=label, bg=C["bg2"],
                     fg=C["text3"], font=F["small"]).grid(
                     row=row_, column=col_, padx=10, pady=3, sticky="w")
            lbl = tk.Label(parent, text="—", bg=C["bg2"],
                           fg=C["text"], font=F["bold_sm"])
            lbl.grid(row=row_, column=col_+1, padx=4, sticky="w")
            self._labels[key] = (lbl, unit)

    def _build_gauge(self, parent):
        self._gauge_canvas = tk.Canvas(parent, bg=C["bg2"],
                                        height=28, highlightthickness=0)
        self._gauge_canvas.pack(fill="x", padx=12, pady=8)
        self._gauge_lbl = tk.Label(parent, text="", bg=C["bg2"],
                                    fg=C["text2"], font=F["small"])
        self._gauge_lbl.pack()

    def refresh(self):
        summary = self.risk.risk_summary()
        for key, (lbl, unit) in self._labels.items():
            v = summary.get(key, 0)
            if unit == "$":
                txt = f"${v:+,.2f}" if key in ("floating_pnl","daily_pnl",
                                                  "expectancy") else f"${v:,.2f}"
            elif unit == "%":
                txt = f"{v:.1f}%"
            elif unit == "×":
                txt = f"{v:.2f}×"
            else:
                txt = str(v)
            ml = summary.get("margin_level", 0)
            if key == "margin_level":
                col = (C["sell"] if ml>0 and ml<50 else
                       C["warning"] if ml<100 else C["text"])
            elif key in ("floating_pnl","daily_pnl","net_pnl"):
                col = C["profit"] if v >= 0 else C["loss"]
            else:
                col = C["text"]
            lbl.config(text=txt, fg=col)
        # Gauge
        ml = summary.get("margin_level", 0)
        self._draw_gauge(ml)
        self._gauge_lbl.config(
            text=f"Margin Level: {ml:.1f}%  "
                 f"(Margin Call: {self.config.account_cfg.get('margin_call_pct',50)}%  "
                 f"Stop Out: {self.config.account_cfg.get('stop_out_pct',20)}%)")

    def _draw_gauge(self, ml: float):
        c = self._gauge_canvas
        c.delete("all")
        W = c.winfo_width() or 600
        H = 28
        # Background
        c.create_rectangle(0, 8, W, 22, fill=C["bg3"],
                            outline=C["border"])
        # Fill
        pct  = min(100, max(0, ml)) / 100
        fill = int(W * pct)
        col  = (C["sell"]    if ml < 50  else
                C["warning"] if ml < 100 else
                C["buy"]     if ml < 300 else C["profit"])
        if fill > 0:
            c.create_rectangle(0, 8, fill, 22,
                                fill=col, outline="")
        # Stop-out line
        so_pct = self.config.account_cfg.get("stop_out_pct", 20) / 100
        so_x   = int(W * so_pct)
        c.create_line(so_x, 4, so_x, 26, fill=C["sell"],
                      width=2, dash=(4, 2))
        c.create_text(so_x + 2, 4, text="SO",
                      anchor="nw", fill=C["sell"], font=("Segoe UI",7))
        # Margin call line
        mc_pct = self.config.account_cfg.get("margin_call_pct", 50) / 100
        mc_x   = int(W * mc_pct)
        c.create_line(mc_x, 4, mc_x, 26, fill=C["warning"],
                      width=2, dash=(4, 2))
        c.create_text(mc_x + 2, 4, text="MC",
                      anchor="nw", fill=C["warning"], font=("Segoe UI",7))
