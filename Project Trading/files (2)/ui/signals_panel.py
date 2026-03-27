"""ui/signals_panel.py — Live signal cards feed."""
from __future__ import annotations
import tkinter as tk
from tkinter import ttk, messagebox
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
        sb = ttk.Scrollbar(outer, orient="vertical", command=self._canvas.yview)
        self._canvas.configure(yscrollcommand=sb.set)
        sb.pack(side="right", fill="y")
        self._canvas.pack(side="left", fill="both", expand=True)
        self._inner = tk.Frame(self._canvas, bg=C["bg2"])
        self._win_id = self._canvas.create_window((0, 0), window=self._inner, anchor="nw")
        self._inner.bind("<Configure>",
            lambda e: self._canvas.configure(scrollregion=self._canvas.bbox("all")))
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
        card_bg = C.get("buy_bg", C["bg3"]) if is_buy else C.get("sell_bg", C["bg3"])
        super().__init__(parent, bg=C.get("card_border", C["border"]), relief="flat", bd=1, **kw)
        self.sig    = sig
        self.engine = engine

        tk.Frame(self, bg=bar_col, width=6).pack(side="left", fill="y")

        body = tk.Frame(self, bg=card_bg)
        body.pack(side="left", fill="both", expand=True, padx=10, pady=8)

        # Row 1: pair, direction, strength, time
        r1 = tk.Frame(body, bg=card_bg)
        r1.pack(fill="x")
        tk.Label(r1, text=sig.pair, bg=card_bg, fg=C["text"], font=F["bold_lg"]).pack(side="left")
        tk.Label(r1, text=f"  {'▲ BUY' if is_buy else '▼ SELL'}  ",
                 bg=bar_col, fg="white", font=F["bold_sm"]).pack(side="left", padx=6)
        strength_map = {"WEAK": "●○○○", "MODERATE": "●●○○",
                        "STRONG": "●●●○", "VERY STRONG": "●●●●"}
        tk.Label(r1, text=strength_map.get(sig.strength_str, "●●○○"),
                 bg=card_bg, fg=bar_col, font=("Segoe UI", 12)).pack(side="left", padx=4)
        tk.Label(r1, text=sig.session, bg=card_bg, fg=C["text2"], font=F["small"]).pack(side="left", padx=8)
        ts_str = datetime.fromtimestamp(sig.timestamp).strftime("%H:%M:%S")
        tk.Label(r1, text=f"{sig.timeframe}  •  {ts_str}",
                 bg=card_bg, fg=C["text3"], font=F["small"]).pack(side="right")

        # Row 2: prices
        dp = 3 if "JPY" in sig.pair else (2 if "XAU" in sig.pair else 5)
        r2 = tk.Frame(body, bg=card_bg)
        r2.pack(fill="x", pady=4)
        for label, val, col in [
            ("Entry",     sig.entry_price, C["text"]),
            ("Stop Loss", sig.stop_loss,   C["sell"]),
            ("TP 1",      sig.take_profit, C["buy"]),
            ("TP 2",      sig.tp2,         C["buy"]),
            ("TP 3",      sig.tp3,         C["buy"]),
        ]:
            col_frm = tk.Frame(r2, bg=card_bg)
            col_frm.pack(side="left", padx=8)
            tk.Label(col_frm, text=label, bg=card_bg, fg=C["text3"], font=F["small"]).pack()
            tk.Label(col_frm, text=f"{val:.{dp}f}", bg=card_bg, fg=col, font=F["mono_sm"]).pack()

        # Row 3: confidence bar + metrics
        r3 = tk.Frame(body, bg=card_bg)
        r3.pack(fill="x", pady=2)
        conf_pct = int(sig.confidence * 100)
        tk.Label(r3, text="Confidence:", bg=card_bg, fg=C["text2"], font=F["small"]).pack(side="left")
        bar_outer = tk.Frame(r3, bg=C["border"], width=140, height=10)
        bar_outer.pack(side="left", padx=6)
        bar_outer.pack_propagate(False)
        fill_w = max(4, int(140 * sig.confidence))
        tk.Frame(bar_outer, bg=bar_col, width=fill_w, height=10).place(x=0, y=0)
        tk.Label(r3, text=f"{conf_pct}%", bg=card_bg, fg=bar_col, font=F["bold_sm"]).pack(side="left")
        tk.Label(r3, text=f"  R:R {sig.risk_reward:.2f}", bg=card_bg, fg=C["text2"], font=F["small"]).pack(side="left", padx=8)
        tk.Label(r3, text=f"Lot: {sig.lot_size:.2f}", bg=card_bg, fg=C["text2"], font=F["small"]).pack(side="left", padx=4)
        tk.Label(r3, text=f"ATR: {sig.atr:.5f}", bg=card_bg, fg=C["text2"], font=F["small"]).pack(side="left", padx=4)
        tk.Label(r3, text=f"Votes: {sig.votes_bull}↑ {sig.votes_bear}↓",
                 bg=card_bg, fg=C["text2"], font=F["small"]).pack(side="left", padx=4)

        # Row 4: indicator notes
        if sig.notes:
            r4 = tk.Frame(body, bg=card_bg)
            r4.pack(fill="x", pady=2)
            tk.Label(r4, text="  •  ".join(sig.notes[:4]), bg=card_bg,
                     fg=C["text2"], font=F["small"], wraplength=700, anchor="w").pack(side="left")

        # Trade button
        btn_frm = tk.Frame(self, bg=card_bg)
        btn_frm.pack(side="right", fill="y", padx=8)
        tk.Button(btn_frm,
                  text=f"{'BUY' if is_buy else 'SELL'}\n{sig.lot_size:.2f}L",
                  bg=bar_col, fg="white", font=F["bold_sm"],
                  relief="flat", padx=10, pady=6, cursor="hand2",
                  command=self._trade).pack(expand=True)

    def _trade(self):
        sig = self.sig
        ok, msg = self.engine.open_market(
            sig.pair, sig.direction.name, sig.lot_size,
            sl=sig.stop_loss, tp=sig.take_profit,
            comment=f"Signal {sig.timeframe} {sig.strength_str}")
        if ok:
            messagebox.showinfo("Trade Opened", msg)
        else:
            messagebox.showerror("Trade Failed", msg)
