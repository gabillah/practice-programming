"""ui/risk_panel.py — Risk dashboard with live metrics and margin level gauge."""
from __future__ import annotations
import tkinter as tk
from tkinter import ttk
from ui.theme import COLOURS as C, FONTS as F


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
                 fg=C["text"], font=F["bold_lg"]).pack(padx=12, pady=8, anchor="w")

        sfrm = tk.LabelFrame(self, text=" Risk Settings ",
                              bg=C["bg2"], fg=C["text2"],
                              font=F["bold_sm"], relief="groove", bd=1)
        sfrm.pack(fill="x", padx=12, pady=4)
        self._build_settings(sfrm)

        mfrm = tk.LabelFrame(self, text=" Live Risk Metrics ",
                              bg=C["bg2"], fg=C["text2"],
                              font=F["bold_sm"], relief="groove", bd=1)
        mfrm.pack(fill="x", padx=12, pady=4)
        self._build_metrics(mfrm)

        gfrm = tk.LabelFrame(self, text=" Margin Level Gauge ",
                              bg=C["bg2"], fg=C["text2"],
                              font=F["bold_sm"], relief="groove", bd=1)
        gfrm.pack(fill="x", padx=12, pady=4)
        self._build_gauge(gfrm)

        self._refresh_loop()

    def _build_settings(self, parent):
        cfg = self.config.risk_cfg
        fields = [
            ("Risk per trade (%)", "risk_per_trade_pct",  0.1, 10.0, 0.1),
            ("Max daily loss (%)", "max_daily_loss_pct",  0.5, 20.0, 0.5),
            ("SL ATR multiplier",  "default_sl_atr_mult", 0.5,  5.0, 0.5),
            ("TP Risk:Reward",     "default_tp_rr",        0.5,  5.0, 0.5),
            ("Kelly fraction",     "kelly_fraction",        0.0,  1.0, 0.05),
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
                              width=8, font=F["small"])
            sp.grid(row=row, column=col+1, padx=4, pady=4)
            def _save(k=key, v=var):
                try: self.config.set("risk", k, value=float(v.get()))
                except Exception: pass
            sp.bind("<FocusOut>", lambda e, f=_save: f())

        self._trail_var = tk.BooleanVar(value=cfg.get("trailing_stop", True))
        tk.Checkbutton(parent, text="Trailing Stop",
                       variable=self._trail_var,
                       bg=C["bg2"], fg=C["text"], font=F["small"],
                       activebackground=C["bg2"],
                       command=lambda: self.config.set(
                           "risk", "trailing_stop",
                           value=self._trail_var.get())).grid(
                       row=2, column=0, columnspan=2, padx=8, pady=4, sticky="w")

    def _build_metrics(self, parent):
        items = [
            ("Balance",       "balance",       "$"),
            ("Equity",        "equity",        "$"),
            ("Free Margin",   "free_margin",   "$"),
            ("Margin Used",   "margin_used",   "$"),
            ("Floating P&L",  "floating_pnl",  "$"),
            ("Margin Level",  "margin_level",  "%"),
            ("Daily P&L",     "daily_pnl",     "$"),
            ("Open Trades",   "open_trades",   ""),
            ("Sharpe Ratio",  "sharpe",        ""),
            ("Sortino Ratio", "sortino",       ""),
            ("Max Drawdown",  "max_drawdown",  "$"),
            ("Win Rate",      "win_rate",      "%"),
            ("Profit Factor", "profit_factor", "×"),
            ("Expectancy",    "expectancy",    "$"),
            ("VaR 95%",       "var_95",        "$"),
            ("CVaR 95%",      "cvar_95",       "$"),
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
            v = summary.get(key, 0) or 0
            if unit == "$":
                txt = (f"${v:+,.2f}" if key in
                       ("floating_pnl","daily_pnl","expectancy")
                       else f"${v:,.2f}")
            elif unit == "%":
                txt = f"{v:.1f}%"
            elif unit == "×":
                txt = f"{v:.2f}×"
            else:
                txt = str(v)
            ml = summary.get("margin_level", 0) or 0
            if key == "margin_level":
                col = (C["sell"] if 0 < ml < 50 else
                       C["warning"] if ml < 100 else C["text"])
            elif key in ("floating_pnl", "daily_pnl", "net_pnl"):
                col = C["profit"] if v >= 0 else C["loss"]
            else:
                col = C["text"]
            lbl.config(text=txt, fg=col)
        ml = summary.get("margin_level", 0) or 0
        self._draw_gauge(ml)
        self._gauge_lbl.config(
            text=f"Margin Level: {ml:.1f}%  "
                 f"(Margin Call: {self.config.account_cfg.get('margin_call_pct',50)}%  "
                 f"Stop Out: {self.config.account_cfg.get('stop_out_pct',20)}%)")

    def _draw_gauge(self, ml: float):
        c = self._gauge_canvas
        c.delete("all")
        W = c.winfo_width() or 600
        c.create_rectangle(0, 8, W, 22, fill=C["bg3"], outline=C["border"])
        pct  = min(100, max(0, ml)) / 100
        fill = int(W * pct)
        col  = (C["sell"]    if ml < 50  else
                C["warning"] if ml < 100 else
                C["buy"]     if ml < 300 else C["profit"])
        if fill > 0:
            c.create_rectangle(0, 8, fill, 22, fill=col, outline="")
        so_pct = self.config.account_cfg.get("stop_out_pct", 20) / 100
        so_x   = int(W * so_pct)
        c.create_line(so_x, 4, so_x, 26, fill=C["sell"], width=2, dash=(4, 2))
        c.create_text(so_x+2, 4, text="SO", anchor="nw",
                      fill=C["sell"], font=("Segoe UI", 7))
        mc_pct = self.config.account_cfg.get("margin_call_pct", 50) / 100
        mc_x   = int(W * mc_pct)
        c.create_line(mc_x, 4, mc_x, 26, fill=C["warning"], width=2, dash=(4, 2))
        c.create_text(mc_x+2, 4, text="MC", anchor="nw",
                      fill=C["warning"], font=("Segoe UI", 7))

    def _refresh_loop(self):
        try: self.refresh()
        except Exception: pass
        self.after(2000, self._refresh_loop)
