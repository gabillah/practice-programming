"""ui/chart.py — Live candlestick chart with EMA, BB, SuperTrend, RSI overlays."""
from __future__ import annotations
import logging, time
from datetime import datetime
from typing import List, Optional

import tkinter as tk
from tkinter import ttk

import numpy as np
import matplotlib
matplotlib.use("TkAgg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.gridspec import GridSpec

from ui.theme import COLOURS as C, FONTS as F

logger = logging.getLogger(__name__)


class ChartPanel(tk.Frame):
    TF_LABELS = ["1min","5min","15min","1h","4h","1day"]
    MAX_CANDLES = 150

    def __init__(self, parent, bars, config, **kw):
        super().__init__(parent, bg=C["bg"], **kw)
        self.bars   = bars
        self.config = config
        self._signals_cache: List = []
        self._build()

    def _build(self):
        # Toolbar
        tb = tk.Frame(self, bg=C["bg2"], height=36)
        tb.pack(fill="x", padx=0)
        tb.pack_propagate(False)

        self._pair_lbl = tk.Label(tb, text="EUR/USD", bg=C["bg2"],
                                   fg=C["text"], font=("Segoe UI",15,"bold"))
        self._pair_lbl.pack(side="left", padx=12)
        self._price_lbl = tk.Label(tb, text="—", bg=C["bg2"],
                                    fg=C["text"], font=("Consolas",15,"bold"))
        self._price_lbl.pack(side="left", padx=4)

        # TF buttons
        self._tf_var = tk.StringVar(value=self.config.primary_tf)
        for tf in self.TF_LABELS:
            btn = tk.Button(tb, text=tf, bg=C["bg3"], fg=C["text2"],
                            font=F["bold_sm"], relief="flat",
                            padx=8, pady=2,
                            command=lambda t=tf: self._set_tf(t))
            btn.pack(side="left", padx=2, pady=4)
        # Overlay toggles
        self._show_ema  = tk.BooleanVar(value=True)
        self._show_bb   = tk.BooleanVar(value=True)
        self._show_st   = tk.BooleanVar(value=True)
        self._show_vwap = tk.BooleanVar(value=False)
        for text, var in [("EMA",self._show_ema),("BB",self._show_bb),
                           ("ST",self._show_st),("VWAP",self._show_vwap)]:
            cb = tk.Checkbutton(tb, text=text, variable=var,
                                bg=C["bg2"], fg=C["text2"],
                                font=F["small"], activebackground=C["bg2"],
                                command=self._request_redraw)
            cb.pack(side="left", padx=4)

        # Matplotlib figure
        self._fig = plt.Figure(figsize=(14,5.5), dpi=96,
                                facecolor=C["chart_bg"])
        self._canvas = FigureCanvasTkAgg(self._fig, master=self)
        self._canvas.get_tk_widget().pack(fill="both", expand=True)
        self._canvas.get_tk_widget().configure(bg=C["chart_bg"])
        self._redraw_pending = False

    def _set_tf(self, tf: str):
        self._tf_var.set(tf)
        self._request_redraw()

    def _request_redraw(self):
        self._redraw_pending = True

    def draw(self, pair: str, tf: str, signals: List):
        """Called by BrokerApp._periodic_update every REFRESH_MS ms."""
        self._signals_cache = signals
        self._pair_lbl.config(text=pair)
        tf_use = self._tf_var.get()
        o, h, l, c, v = self.bars.to_arrays(pair, tf_use)
        if len(c) < 5:
            return
        # Truncate to MAX_CANDLES
        n = min(len(c), self.MAX_CANDLES)
        o,h,l,c,v = o[-n:],h[-n:],l[-n:],c[-n:],v[-n:]
        dp = self._decimal_places(pair)
        self._price_lbl.config(text=f"{c[-1]:.{dp}f}")

        self._fig.clear()
        gs = GridSpec(3, 1, figure=self._fig, height_ratios=[3.5,1,1],
                      hspace=0.04)
        ax1 = self._fig.add_subplot(gs[0])
        ax2 = self._fig.add_subplot(gs[1], sharex=ax1)
        ax3 = self._fig.add_subplot(gs[2], sharex=ax1)
        for ax in (ax1,ax2,ax3):
            ax.set_facecolor(C["chart_bg"])
            ax.tick_params(colors=C["text2"], labelsize=7)
            ax.spines[:].set_color(C["border"])
            ax.grid(True, color=C["chart_grid"], linewidth=0.5, linestyle="-")

        xs = np.arange(n)

        # Candlesticks
        w_body = 0.6; w_wick = 0.12
        for i in range(n):
            col = C["candle_bull"] if c[i]>=o[i] else C["candle_bear"]
            ax1.add_patch(mpatches.FancyBboxPatch(
                (xs[i]-w_body/2, min(o[i],c[i])), w_body,
                abs(c[i]-o[i]) or (h[i]-l[i])*0.01,
                boxstyle="square,pad=0", linewidth=0,
                facecolor=col, zorder=3))
            ax1.plot([xs[i],xs[i]],[l[i],h[i]], color=col,
                     linewidth=w_wick*8, zorder=2)

        # ── Overlays ──────────────────────────────────────────────────────────
        from signals.indicators import Ind
        # EMA
        if self._show_ema.get():
            ema9  = Ind.ema(c, 9)
            ema21 = Ind.ema(c, 21)
            ema200= Ind.ema(c, 200)
            ax1.plot(xs, ema9,   color=C["ema_fast"],  linewidth=1.2,
                     label="EMA9",   zorder=4)
            ax1.plot(xs, ema21,  color=C["ema_slow"],  linewidth=1.2,
                     label="EMA21",  zorder=4)
            ax1.plot(xs, ema200, color=C["ema_trend"], linewidth=0.9,
                     linestyle="--", label="EMA200", zorder=4)
        # Bollinger
        if self._show_bb.get():
            bb_u,bb_m,bb_l = Ind.bollinger(c,20,2.0)
            ax1.plot(xs, bb_u, color=C["bb_band"], linewidth=0.8,
                     linestyle="--", alpha=0.7)
            ax1.plot(xs, bb_l, color=C["bb_band"], linewidth=0.8,
                     linestyle="--", alpha=0.7)
            ax1.fill_between(xs, bb_u, bb_l,
                              alpha=0.04, color=C["bb_band"])
        # SuperTrend
        if self._show_st.get():
            st, dr = Ind.supertrend(h,l,c,10,3.0)
            bull_mask = dr==1; bear_mask = dr==-1
            bull_st = np.where(bull_mask, st, np.nan)
            bear_st = np.where(bear_mask, st, np.nan)
            ax1.plot(xs, bull_st, color=C["supertrend_b"], linewidth=1.5, zorder=4)
            ax1.plot(xs, bear_st, color=C["supertrend_s"], linewidth=1.5, zorder=4)
        # VWAP
        if self._show_vwap.get():
            vwap_v = Ind.vwap(h,l,c,v)
            ax1.plot(xs, vwap_v, color=C["vwap"], linewidth=1.0,
                     linestyle=":", label="VWAP")

        # Signal markers on chart
        sig_map = {}
        for sig in self._signals_cache[:20]:
            if sig.pair == pair:
                sig_map[sig.entry_price] = sig
        for price, sig in list(sig_map.items())[:5]:
            idx = np.argmin(np.abs(c - price))
            dy  = (h[idx]-l[idx])*0.3
            if sig.direction.name=="BUY":
                ax1.scatter(xs[idx], l[idx]-dy, marker="^",
                            color=C["signal_buy"], s=120, zorder=10)
                ax1.axhline(sig.stop_loss,  color=C["sell"], lw=0.7,
                            linestyle=":", alpha=0.6)
                ax1.axhline(sig.take_profit,color=C["buy"],  lw=0.7,
                            linestyle="--",alpha=0.6)
            else:
                ax1.scatter(xs[idx], h[idx]+dy, marker="v",
                            color=C["signal_sell"], s=120, zorder=10)
                ax1.axhline(sig.stop_loss,  color=C["sell"], lw=0.7,
                            linestyle=":", alpha=0.6)
                ax1.axhline(sig.take_profit,color=C["buy"],  lw=0.7,
                            linestyle="--",alpha=0.6)

        ax1.yaxis.set_major_formatter(
            plt.FuncFormatter(lambda x,_: f"{x:.{dp}f}"))
        ax1.set_xlim(-1, n+1)
        ax1.legend(fontsize=7, loc="upper left",
                   framealpha=0.7, ncol=4)

        # ── Volume bars ───────────────────────────────────────────────────────
        v_colors = [C["candle_bull"] if c[i]>=o[i] else C["candle_bear"]
                    for i in range(n)]
        ax2.bar(xs, v, color=v_colors, width=0.7, alpha=0.7)
        ax2.set_ylabel("Vol", color=C["text2"], fontsize=7)
        ax2.yaxis.set_visible(False)

        # ── RSI ───────────────────────────────────────────────────────────────
        rsi_v = Ind.rsi(c,14)
        ax3.plot(xs, rsi_v, color=C["rsi_line"], linewidth=1.0)
        ax3.axhline(70, color=C["rsi_ob"], linestyle="--", linewidth=0.7, alpha=0.7)
        ax3.axhline(30, color=C["rsi_os"], linestyle="--", linewidth=0.7, alpha=0.7)
        ax3.axhline(50, color=C["text3"],  linestyle="-",  linewidth=0.5, alpha=0.4)
        ax3.fill_between(xs, rsi_v, 70,
                          where=rsi_v>70, alpha=0.15, color=C["rsi_ob"])
        ax3.fill_between(xs, rsi_v, 30,
                          where=rsi_v<30, alpha=0.15, color=C["rsi_os"])
        ax3.set_ylim(0,100); ax3.set_ylabel("RSI",color=C["text2"],fontsize=7)
        ax3.yaxis.set_ticks([30,50,70])

        # X-axis: timestamps
        ts_list = self.bars.timestamps(pair, tf_use)
        if len(ts_list) >= n:
            ts_list = ts_list[-n:]
        step = max(1, n//10)
        ticks = list(range(0,n,step))
        lbls  = []
        for t in ticks:
            if t < len(ts_list):
                lbls.append(datetime.fromtimestamp(ts_list[t]).strftime("%H:%M"))
            else:
                lbls.append("")
        ax3.set_xticks(ticks); ax3.set_xticklabels(lbls, fontsize=7)
        plt.setp(ax1.get_xticklabels(), visible=False)
        plt.setp(ax2.get_xticklabels(), visible=False)

        self._fig.tight_layout(pad=0.5)
        self._canvas.draw_idle()

    @staticmethod
    def _decimal_places(pair: str) -> int:
        if "JPY" in pair: return 3
        if pair in ("XAU/USD",): return 2
        if pair in ("XAG/USD",): return 3
        return 5
