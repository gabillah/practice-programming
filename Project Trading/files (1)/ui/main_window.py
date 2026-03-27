"""
ui/main_window.py
──────────────────
Full professional desktop GUI built with Tkinter + Matplotlib.

Layout:
  ┌─────────────────────────────────────────────────────────────────┐
  │  HEADER: Logo | Status | Clock | Balance | Session              │
  ├──────────────┬──────────────────────────────────────────────────┤
  │  LEFT PANEL  │  CHART AREA (candlestick + indicators)           │
  │  • Pair list │  ├── Price Chart (OHLCV + EMA + BB + ST)         │
  │  • Watchlist │  ├── RSI Panel                                   │
  │  • Signals   │  └── MACD Panel                                  │
  ├──────────────┴──────────────────────────────────────────────────┤
  │  SIGNAL PANEL: direction | entry | SL | TP1/2/3 | conf | notes  │
  ├─────────────────────────────────────────────────────────────────┤
  │  BOTTOM: Stats | Performance | Risk Gauge | Log                  │
  └─────────────────────────────────────────────────────────────────┘

Light mode theme throughout.
"""

from __future__ import annotations
import logging
import math
import queue
import threading
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple, Any

import tkinter as tk
from tkinter import ttk, messagebox, font

import numpy  as np
import matplotlib
matplotlib.use("TkAgg")
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg, NavigationToolbar2Tk
from matplotlib.figure import Figure
import matplotlib.patches as mpatches
import matplotlib.dates  as mdates
from matplotlib.lines   import Line2D

from core.signal_engine  import TradingSignal, Direction, SignalStrength
from core.app_controller import AppController

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# Colour palette (light mode)
# ─────────────────────────────────────────────────────────────────────────────
COLOURS = {
    # App background
    "bg":           "#F5F7FA",
    "bg2":          "#FFFFFF",
    "bg3":          "#EEF0F4",
    "border":       "#D0D5DD",
    # Text
    "text":         "#1A1F36",
    "text2":        "#6B7280",
    "text3":        "#9CA3AF",
    # Accent
    "accent":       "#2563EB",
    "accent_light": "#DBEAFE",
    # Signal colours
    "buy":          "#059669",
    "buy_bg":       "#D1FAE5",
    "sell":         "#DC2626",
    "sell_bg":      "#FEE2E2",
    "neutral":      "#6B7280",
    # Chart
    "candle_up":    "#26A69A",
    "candle_dn":    "#EF5350",
    "wick_up":      "#1B7A72",
    "wick_dn":      "#B71C1C",
    "ema_fast":     "#2563EB",
    "ema_slow":     "#F59E0B",
    "ema_trend":    "#6D28D9",
    "bb_upper":     "#9CA3AF",
    "bb_lower":     "#9CA3AF",
    "bb_mid":       "#E5E7EB",
    "rsi_line":     "#7C3AED",
    "macd_line":    "#2563EB",
    "macd_signal":  "#F59E0B",
    "macd_bull":    "#10B981",
    "macd_bear":    "#EF5350",
    "supertrend_bull": "#10B981",
    "supertrend_bear": "#EF5350",
    # Grid
    "grid":         "#E5E7EB",
    # Signal row alternating
    "row_odd":      "#F9FAFB",
    "row_even":     "#FFFFFF",
}

FONTS = {
    "title":  ("Segoe UI", 16, "bold"),
    "header": ("Segoe UI", 12, "bold"),
    "body":   ("Segoe UI", 10),
    "small":  ("Segoe UI",  9),
    "mono":   ("Consolas",  10),
    "price":  ("Consolas",  14, "bold"),
    "huge":   ("Segoe UI",  24, "bold"),
}


# ─────────────────────────────────────────────────────────────────────────────
# Candlestick chart renderer
# ─────────────────────────────────────────────────────────────────────────────
class CandlestickChart:
    """Renders OHLCV bars on a Matplotlib axis."""

    def __init__(self, ax):
        self.ax = ax

    def draw(self, opens: np.ndarray, highs: np.ndarray,
             lows: np.ndarray, closes: np.ndarray,
             max_candles: int = 150) -> None:
        ax = self.ax
        ax.clear()
        n = min(len(closes), max_candles)
        if n == 0:
            return
        o, h, l, c = opens[-n:], highs[-n:], lows[-n:], closes[-n:]
        x = np.arange(n)

        for i in range(n):
            color  = COLOURS["candle_up"] if c[i] >= o[i] else COLOURS["candle_dn"]
            wcolor = COLOURS["wick_up"]   if c[i] >= o[i] else COLOURS["wick_dn"]
            # Wick
            ax.plot([x[i], x[i]], [l[i], h[i]], color=wcolor, linewidth=0.8, zorder=1)
            # Body
            bot = min(o[i], c[i])
            top = max(o[i], c[i])
            rect = mpatches.FancyBboxPatch(
                (x[i] - 0.35, bot), 0.70, max(top - bot, (h[i] - l[i]) * 0.01),
                boxstyle="square,pad=0",
                facecolor=color, edgecolor=wcolor, linewidth=0.5, zorder=2
            )
            ax.add_patch(rect)

        ax.set_xlim(-0.5, n + 0.5)
        ax.set_facecolor(COLOURS["bg2"])
        ax.grid(True, color=COLOURS["grid"], linewidth=0.5, alpha=0.8)
        ax.tick_params(colors=COLOURS["text2"], labelsize=8)
        for spine in ax.spines.values():
            spine.set_color(COLOURS["border"])

    def overlay_ema(self, values: np.ndarray, color: str,
                    label: str, linewidth: float = 1.5, max_candles: int = 150) -> None:
        if values is None or len(values) == 0:
            return
        n   = min(len(values), max_candles)
        arr = values[-n:]
        x   = np.arange(n)
        valid = ~np.isnan(arr)
        if valid.sum() > 1:
            self.ax.plot(x[valid], arr[valid], color=color,
                         linewidth=linewidth, label=label, zorder=3)

    def overlay_bb(self, upper: np.ndarray, mid: np.ndarray,
                   lower: np.ndarray, max_candles: int = 150) -> None:
        n = min(len(upper), max_candles)
        x = np.arange(n)
        for arr, col, ls in [
            (upper[-n:], COLOURS["bb_upper"], "--"),
            (mid[-n:],   COLOURS["bb_mid"],   "-"),
            (lower[-n:], COLOURS["bb_lower"], "--"),
        ]:
            valid = ~np.isnan(arr)
            if valid.sum() > 1:
                self.ax.plot(x[valid], arr[valid], color=col,
                             linewidth=1.0, linestyle=ls, alpha=0.7, zorder=3)
        # Fill between bands
        u_v = np.where(np.isnan(upper[-n:]), np.nan, upper[-n:])
        l_v = np.where(np.isnan(lower[-n:]), np.nan, lower[-n:])
        self.ax.fill_between(x, l_v, u_v, alpha=0.05,
                             color=COLOURS["bb_mid"], zorder=1)

    def overlay_supertrend(self, st_line: np.ndarray, st_dir: np.ndarray,
                           max_candles: int = 150) -> None:
        if st_line is None:
            return
        n = min(len(st_line), max_candles)
        x = np.arange(n)
        arr  = st_line[-n:]
        dirs = st_dir[-n:] if st_dir is not None else np.ones(n)
        for i in range(1, n):
            if np.isnan(arr[i]) or np.isnan(arr[i-1]):
                continue
            col = COLOURS["supertrend_bull"] if dirs[i] == 1 else COLOURS["supertrend_bear"]
            self.ax.plot([x[i-1], x[i]], [arr[i-1], arr[i]],
                         color=col, linewidth=2.0, zorder=4)

    def mark_signal(self, bar_index: int, direction: str,
                    price: float, sl: float, tp: float) -> None:
        """Annotate a signal on the chart."""
        if direction == "BUY":
            marker = "^"; color = COLOURS["buy"]
            vert   = "bottom"; dy = -0.001 * price
        else:
            marker = "v"; color = COLOURS["sell"]
            vert   = "top"; dy = 0.001 * price
        self.ax.scatter(bar_index, price + dy, marker=marker,
                        color=color, s=120, zorder=10)
        self.ax.axhline(sl, color=color, linewidth=0.7,
                        linestyle=":", alpha=0.7)
        self.ax.axhline(tp, color=COLOURS["buy"] if direction == "BUY"
                        else COLOURS["sell"], linewidth=0.7,
                        linestyle="--", alpha=0.7)


# ─────────────────────────────────────────────────────────────────────────────
# Signal Card Widget
# ─────────────────────────────────────────────────────────────────────────────
class SignalCard(tk.Frame):
    """A single signal card displayed in the signal panel."""

    def __init__(self, parent, signal: TradingSignal, **kwargs):
        super().__init__(parent, bg=COLOURS["bg2"], relief="flat",
                         bd=0, **kwargs)
        self._build(signal)

    def _build(self, sig: TradingSignal) -> None:
        is_buy  = sig.direction == Direction.BUY
        dir_col = COLOURS["buy"]   if is_buy else COLOURS["sell"]
        dir_bg  = COLOURS["buy_bg"]if is_buy else COLOURS["sell_bg"]
        dir_txt = "▲  BUY"        if is_buy else "▼  SELL"

        # Strength stars
        strength_map = {
            SignalStrength.WEAK:       "●○○○",
            SignalStrength.MODERATE:   "●●○○",
            SignalStrength.STRONG:     "●●●○",
            SignalStrength.VERY_STRONG:"●●●●",
        }
        stars = strength_map.get(sig.strength, "●○○○")

        # Left colour bar
        left_bar = tk.Frame(self, bg=dir_col, width=5)
        left_bar.pack(side="left", fill="y")

        # Content
        content = tk.Frame(self, bg=COLOURS["bg2"], padx=8, pady=6)
        content.pack(side="left", fill="both", expand=True)

        # Row 1: pair + direction + strength + time
        r1 = tk.Frame(content, bg=COLOURS["bg2"])
        r1.pack(fill="x", pady=(0, 3))

        tk.Label(r1, text=sig.pair, font=FONTS["header"],
                 bg=COLOURS["bg2"], fg=COLOURS["text"]).pack(side="left")

        dir_lbl = tk.Label(r1, text=f" {dir_txt} ", font=("Segoe UI", 10, "bold"),
                           bg=dir_bg, fg=dir_col, relief="flat", padx=6, pady=2)
        dir_lbl.pack(side="left", padx=8)

        tk.Label(r1, text=stars, font=("Segoe UI", 10),
                 bg=COLOURS["bg2"], fg=dir_col).pack(side="left")

        ts_str = datetime.fromtimestamp(sig.timestamp).strftime("%H:%M:%S")
        tk.Label(r1, text=ts_str, font=FONTS["small"],
                 bg=COLOURS["bg2"], fg=COLOURS["text3"]).pack(side="right")

        # Row 2: Entry / SL / TP1 / TP2 / TP3
        r2 = tk.Frame(content, bg=COLOURS["bg2"])
        r2.pack(fill="x", pady=2)

        price_items = [
            ("Entry",  f"{sig.entry_price:.5f}",  COLOURS["text"]),
            ("SL",     f"{sig.stop_loss:.5f}",    COLOURS["sell"]),
            ("TP1",    f"{sig.take_profit:.5f}",  COLOURS["buy"]),
            ("TP2",    f"{sig.take_profit_2:.5f}",COLOURS["buy"]),
            ("TP3",    f"{sig.take_profit_3:.5f}",COLOURS["buy"]),
        ]
        for label, value, fg in price_items:
            cell = tk.Frame(r2, bg=COLOURS["bg3"], padx=8, pady=3,
                            relief="flat", bd=0)
            cell.pack(side="left", padx=3)
            tk.Label(cell, text=label, font=FONTS["small"],
                     bg=COLOURS["bg3"], fg=COLOURS["text3"]).pack()
            tk.Label(cell, text=value, font=FONTS["mono"],
                     bg=COLOURS["bg3"], fg=fg).pack()

        # Row 3: Confidence bar + R:R + Session + TF
        r3 = tk.Frame(content, bg=COLOURS["bg2"])
        r3.pack(fill="x", pady=(4, 2))

        conf_pct = int(sig.confidence * 100)
        tk.Label(r3, text=f"Confidence:", font=FONTS["small"],
                 bg=COLOURS["bg2"], fg=COLOURS["text2"]).pack(side="left")
        # Confidence bar
        bar_frame = tk.Frame(r3, bg=COLOURS["bg3"], width=100, height=12,
                             relief="flat")
        bar_frame.pack(side="left", padx=4)
        bar_frame.pack_propagate(False)
        fill_w = int(100 * sig.confidence)
        fill_col = COLOURS["buy"] if sig.confidence > 0.65 else COLOURS["sell"] \
                   if sig.confidence < 0.55 else "#F59E0B"
        tk.Frame(bar_frame, bg=fill_col, width=fill_w, height=12).place(x=0, y=0)
        tk.Label(r3, text=f"{conf_pct}%", font=FONTS["small"],
                 bg=COLOURS["bg2"], fg=COLOURS["text"]).pack(side="left", padx=2)

        meta_items = [
            (f"R:R {sig.risk_reward:.1f}",  COLOURS["accent"]),
            (f"📦 {sig.position_size:.2f}L",COLOURS["text2"]),
            (f"🕐 {sig.timeframe}",          COLOURS["text2"]),
            (sig.session,                    COLOURS["text3"]),
        ]
        for txt, fg in meta_items:
            tk.Label(r3, text=txt, font=FONTS["small"],
                     bg=COLOURS["bg2"], fg=fg).pack(side="left", padx=6)

        # Row 4: Top indicator notes
        if sig.indicator_notes:
            notes_txt = " · ".join(sig.indicator_notes[:3])
            tk.Label(content, text=notes_txt, font=FONTS["small"],
                     bg=COLOURS["bg2"], fg=COLOURS["text2"],
                     wraplength=650, anchor="w").pack(fill="x", pady=(2, 0))

        # Bottom separator
        tk.Frame(self, bg=COLOURS["border"], height=1).pack(
            side="bottom", fill="x")


# ─────────────────────────────────────────────────────────────────────────────
# Price Watchlist Row
# ─────────────────────────────────────────────────────────────────────────────
class WatchlistRow(tk.Frame):
    """Single row in the price watchlist."""

    def __init__(self, parent, pair: str, **kwargs):
        super().__init__(parent, bg=COLOURS["bg2"], **kwargs)
        self.pair     = pair
        self._prev_bid= 0.0
        self._prev_ask= 0.0

        self.columnconfigure(0, weight=1)
        tk.Label(self, text=pair, font=FONTS["body"],
                 bg=COLOURS["bg2"], fg=COLOURS["text"],
                 anchor="w").grid(row=0, column=0, padx=(8, 4), pady=4, sticky="w")

        self._bid_lbl = tk.Label(self, text="—", font=FONTS["mono"],
                                  bg=COLOURS["bg2"], fg=COLOURS["text"],
                                  width=10, anchor="e")
        self._bid_lbl.grid(row=0, column=1, padx=2, pady=4)

        self._ask_lbl = tk.Label(self, text="—", font=FONTS["mono"],
                                  bg=COLOURS["bg2"], fg=COLOURS["text"],
                                  width=10, anchor="e")
        self._ask_lbl.grid(row=0, column=2, padx=(2, 6), pady=4)

        self._chg_lbl = tk.Label(self, text="", font=FONTS["small"],
                                  bg=COLOURS["bg2"], fg=COLOURS["text3"],
                                  width=8, anchor="e")
        self._chg_lbl.grid(row=0, column=3, padx=(0, 8), pady=4)

        tk.Frame(self, bg=COLOURS["border"], height=1).grid(
            row=1, column=0, columnspan=4, sticky="ew")

    def update(self, bid: float, ask: float) -> None:
        # Flash on price change
        if bid != self._prev_bid:
            flash_col = COLOURS["buy"] if bid > self._prev_bid else COLOURS["sell"]
            self._bid_lbl.config(fg=flash_col)
            self.after(500, lambda: self._bid_lbl.config(fg=COLOURS["text"]))

        decimals  = 3 if "JPY" in self.pair else (1 if "XAU" in self.pair else 5)
        fmt       = f"{{:.{decimals}f}}"
        self._bid_lbl.config(text=fmt.format(bid))
        self._ask_lbl.config(text=fmt.format(ask))

        if self._prev_bid > 0:
            chg = (bid - self._prev_bid) / self._prev_bid * 100
            chg_txt = f"{chg:+.3f}%"
            chg_col = COLOURS["buy"] if chg >= 0 else COLOURS["sell"]
            self._chg_lbl.config(text=chg_txt, fg=chg_col)

        self._prev_bid = bid
        self._prev_ask = ask


# ─────────────────────────────────────────────────────────────────────────────
# Main Application Window
# ─────────────────────────────────────────────────────────────────────────────
class MainWindow:
    """
    Primary application window.
    All UI updates must happen on the main thread (Tkinter requirement).
    Background events are queued and processed by the Tkinter event loop.
    """

    UPDATE_INTERVAL_MS  = 1000       # Chart/watchlist refresh
    LOG_MAX_LINES       = 500
    SIGNAL_MAX_CARDS    = 30

    def __init__(self, controller: AppController):
        self.controller   = controller
        self._update_queue: queue.Queue = queue.Queue()
        self._signals:    List[TradingSignal] = []
        self._active_pair = controller.config.pairs[0] if controller.config.pairs else "EUR/USD"
        self._watchlist_rows: Dict[str, WatchlistRow] = {}
        self._chart_needs_refresh = False
        self._current_ind_data: Dict = {}

        # Register callbacks
        self.controller.signal_engine.on_new_signal(self._queue_signal)
        self.controller.signal_engine.on_price_update(self._queue_price_update)
        self.controller.stream_mgr.on_status(self._queue_status)

        self._build_root()
        self._build_ui()
        logger.info("MainWindow constructed")

    # ── Root window ───────────────────────────────────────────────────────────
    def _build_root(self) -> None:
        self.root = tk.Tk()
        self.root.title("Apex Forex Signal System  v3.0")
        w = self.controller.config.ui.get("window_width",  1600)
        h = self.controller.config.ui.get("window_height",  950)
        self.root.geometry(f"{w}x{h}")
        self.root.minsize(1200, 700)
        self.root.configure(bg=COLOURS["bg"])
        self.root.protocol("WM_DELETE_WINDOW", self._on_close)

        # Custom style
        style = ttk.Style()
        style.theme_use("clam")
        style.configure("TNotebook",       background=COLOURS["bg"],   borderwidth=0)
        style.configure("TNotebook.Tab",   background=COLOURS["bg3"],  padding=(12, 5),
                         font=FONTS["body"])
        style.map("TNotebook.Tab",         background=[("selected", COLOURS["accent_light"])],
                   foreground=[("selected", COLOURS["accent"])])
        style.configure("TScrollbar",      background=COLOURS["bg3"],  troughcolor=COLOURS["bg"])
        style.configure("Vertical.TScrollbar", arrowsize=10)

    # ── UI Layout ─────────────────────────────────────────────────────────────
    def _build_ui(self) -> None:
        self._build_header()
        # Main paned layout
        main_pane = tk.PanedWindow(self.root, orient="horizontal",
                                   bg=COLOURS["bg"], sashwidth=4,
                                   sashrelief="flat", sashpad=2)
        main_pane.pack(fill="both", expand=True, padx=8, pady=(0, 8))
        # Left panel
        left = self._build_left_panel(main_pane)
        main_pane.add(left, minsize=240, width=260)
        # Right content
        right = self._build_right_panel(main_pane)
        main_pane.add(right, minsize=800)

    # ── Header ────────────────────────────────────────────────────────────────
    def _build_header(self) -> None:
        hdr = tk.Frame(self.root, bg=COLOURS["bg2"], height=58,
                       relief="flat", bd=0)
        hdr.pack(fill="x", padx=8, pady=(8, 4))
        hdr.pack_propagate(False)
        # Logo
        tk.Label(hdr, text="⬡ APEX FOREX", font=FONTS["title"],
                 bg=COLOURS["bg2"], fg=COLOURS["accent"]).pack(side="left", padx=16)
        tk.Label(hdr, text="Signal System", font=("Segoe UI", 11),
                 bg=COLOURS["bg2"], fg=COLOURS["text2"]).pack(side="left")
        # Right: clock + status + balance
        right_hdr = tk.Frame(hdr, bg=COLOURS["bg2"])
        right_hdr.pack(side="right", padx=12)
        self._balance_lbl = tk.Label(right_hdr, text="Balance: —",
                                      font=FONTS["body"], bg=COLOURS["bg2"],
                                      fg=COLOURS["text"])
        self._balance_lbl.pack(side="right", padx=12)
        self._session_lbl = tk.Label(right_hdr, text="Session: —",
                                      font=FONTS["body"], bg=COLOURS["bg2"],
                                      fg=COLOURS["accent"])
        self._session_lbl.pack(side="right", padx=12)
        self._status_lbl  = tk.Label(right_hdr, text="● Connecting…",
                                      font=FONTS["body"], bg=COLOURS["bg2"],
                                      fg=COLOURS["text2"])
        self._status_lbl.pack(side="right", padx=12)
        self._clock_lbl   = tk.Label(right_hdr, text="—", font=FONTS["mono"],
                                      bg=COLOURS["bg2"], fg=COLOURS["text"])
        self._clock_lbl.pack(side="right", padx=12)

    # ── Left panel ────────────────────────────────────────────────────────────
    def _build_left_panel(self, parent) -> tk.Frame:
        frame = tk.Frame(parent, bg=COLOURS["bg"])
        # Pair selector
        hdr = tk.Frame(frame, bg=COLOURS["bg3"], pady=6)
        hdr.pack(fill="x")
        tk.Label(hdr, text="WATCHLIST", font=("Segoe UI", 9, "bold"),
                 bg=COLOURS["bg3"], fg=COLOURS["text2"], padx=10).pack(side="left")

        # Column headers
        col_hdr = tk.Frame(frame, bg=COLOURS["bg3"])
        col_hdr.pack(fill="x")
        for txt, w in [("Pair", 80), ("Bid", 72), ("Ask", 72), ("Chg", 56)]:
            tk.Label(col_hdr, text=txt, font=("Segoe UI", 8, "bold"),
                     bg=COLOURS["bg3"], fg=COLOURS["text3"],
                     width=w//7, anchor="w" if txt == "Pair" else "e"
                     ).pack(side="left", padx=2 if txt == "Pair" else 0)

        # Watchlist scroll
        scroll_frame = tk.Frame(frame, bg=COLOURS["bg2"])
        scroll_frame.pack(fill="both", expand=True)
        canvas = tk.Canvas(scroll_frame, bg=COLOURS["bg2"],
                           highlightthickness=0)
        vsb    = ttk.Scrollbar(scroll_frame, orient="vertical",
                                command=canvas.yview)
        canvas.configure(yscrollcommand=vsb.set)
        vsb.pack(side="right", fill="y")
        canvas.pack(side="left", fill="both", expand=True)
        self._wl_inner = tk.Frame(canvas, bg=COLOURS["bg2"])
        win_id = canvas.create_window(0, 0, anchor="nw", window=self._wl_inner)
        self._wl_inner.bind("<Configure>",
                            lambda e: canvas.configure(
                                scrollregion=canvas.bbox("all")))
        canvas.bind("<Configure>",
                    lambda e: canvas.itemconfig(win_id, width=e.width))

        # Build watchlist rows
        for i, pair in enumerate(self.controller.config.pairs):
            row = WatchlistRow(self._wl_inner, pair)
            row.pack(fill="x")
            row.bind("<Button-1>", lambda e, p=pair: self._select_pair(p))
            for child in row.winfo_children():
                child.bind("<Button-1>", lambda e, p=pair: self._select_pair(p))
            self._watchlist_rows[pair] = row

        # Highlight first pair
        self._update_pair_highlight()
        return frame

    # ── Right panel ───────────────────────────────────────────────────────────
    def _build_right_panel(self, parent) -> tk.Frame:
        frame  = tk.Frame(parent, bg=COLOURS["bg"])
        # Vertical paned: chart on top, signals + stats on bottom
        vpane  = tk.PanedWindow(frame, orient="vertical",
                                bg=COLOURS["bg"], sashwidth=4)
        vpane.pack(fill="both", expand=True)
        # Chart area
        chart_frame = self._build_chart_area(vpane)
        vpane.add(chart_frame, minsize=400, height=480)
        # Bottom tabbed area
        bottom = self._build_bottom_tabs(vpane)
        vpane.add(bottom, minsize=180)
        return frame

    # ── Chart area ────────────────────────────────────────────────────────────
    def _build_chart_area(self, parent) -> tk.Frame:
        frame = tk.Frame(parent, bg=COLOURS["bg2"])

        # Toolbar frame
        tb_frame = tk.Frame(frame, bg=COLOURS["bg3"], pady=4)
        tb_frame.pack(fill="x")

        self._pair_title = tk.Label(tb_frame, text=self._active_pair,
                                     font=FONTS["header"], bg=COLOURS["bg3"],
                                     fg=COLOURS["text"])
        self._pair_title.pack(side="left", padx=12)

        self._live_price_lbl = tk.Label(tb_frame, text="—", font=FONTS["price"],
                                         bg=COLOURS["bg3"], fg=COLOURS["text"])
        self._live_price_lbl.pack(side="left", padx=8)

        # TF buttons
        tf_frame = tk.Frame(tb_frame, bg=COLOURS["bg3"])
        tf_frame.pack(side="left", padx=12)
        self._tf_var = tk.StringVar(value=self.controller.config.primary_tf)
        for tf in ["1min","5min","15min","1h","4h","1day"]:
            btn = tk.Radiobutton(tf_frame, text=tf, variable=self._tf_var,
                                  value=tf, font=FONTS["small"],
                                  bg=COLOURS["bg3"], fg=COLOURS["text"],
                                  selectcolor=COLOURS["accent_light"],
                                  indicatoron=False, padx=6, pady=2,
                                  relief="flat", bd=1,
                                  command=self._chart_needs_update)
            btn.pack(side="left", padx=2)

        # Indicator toggles
        ind_frame = tk.Frame(tb_frame, bg=COLOURS["bg3"])
        ind_frame.pack(side="right", padx=12)
        self._show_ema   = tk.BooleanVar(value=True)
        self._show_bb    = tk.BooleanVar(value=True)
        self._show_st    = tk.BooleanVar(value=True)
        for label, var in [("EMA", self._show_ema),
                            ("BB",  self._show_bb),
                            ("ST",  self._show_st)]:
            tk.Checkbutton(ind_frame, text=label, variable=var,
                           bg=COLOURS["bg3"], fg=COLOURS["text"],
                           font=FONTS["small"], selectcolor=COLOURS["bg2"],
                           command=self._chart_needs_update
                           ).pack(side="left", padx=2)

        # Matplotlib figure
        self._fig = Figure(figsize=(12, 6), facecolor=COLOURS["bg2"],
                           tight_layout=True)
        self._ax_price = self._fig.add_subplot(3, 1, (1, 2))
        self._ax_rsi   = self._fig.add_subplot(3, 1, 3)
        self._fig.subplots_adjust(hspace=0.05, left=0.06, right=0.98,
                                   top=0.97, bottom=0.06)

        self._canvas = FigureCanvasTkAgg(self._fig, master=frame)
        self._canvas.get_tk_widget().pack(fill="both", expand=True)
        self._chart = CandlestickChart(self._ax_price)
        self._draw_empty_chart()
        return frame

    def _draw_empty_chart(self) -> None:
        for ax in (self._ax_price, self._ax_rsi):
            ax.clear()
            ax.set_facecolor(COLOURS["bg2"])
            ax.tick_params(colors=COLOURS["text2"], labelsize=8)
            for s in ax.spines.values():
                s.set_color(COLOURS["border"])
        self._ax_price.text(0.5, 0.5, "Loading market data…",
                             transform=self._ax_price.transAxes,
                             ha="center", va="center",
                             fontsize=14, color=COLOURS["text3"])
        self._canvas.draw_idle()

    # ── Bottom tabs ────────────────────────────────────────────────────────────
    def _build_bottom_tabs(self, parent) -> tk.Frame:
        frame    = tk.Frame(parent, bg=COLOURS["bg"])
        notebook = ttk.Notebook(frame)
        notebook.pack(fill="both", expand=True)

        # Tab 1: Live Signals
        sig_frame = self._build_signal_tab(notebook)
        notebook.add(sig_frame, text=" 📡 Signals ")

        # Tab 2: Performance
        perf_frame = self._build_performance_tab(notebook)
        notebook.add(perf_frame, text=" 📊 Performance ")

        # Tab 3: Risk
        risk_frame = self._build_risk_tab(notebook)
        notebook.add(risk_frame, text=" 🛡  Risk ")

        # Tab 4: Log
        log_frame = self._build_log_tab(notebook)
        notebook.add(log_frame, text=" 📋 Log ")
        return frame

    # ── Signals tab ────────────────────────────────────────────────────────────
    def _build_signal_tab(self, parent) -> tk.Frame:
        frame = tk.Frame(parent, bg=COLOURS["bg2"])
        # Signals summary bar
        summary = tk.Frame(frame, bg=COLOURS["bg3"], pady=4)
        summary.pack(fill="x")
        self._sig_count_lbl = tk.Label(
            summary, text="Signals today: 0  |  Buy: 0  |  Sell: 0",
            font=FONTS["small"], bg=COLOURS["bg3"], fg=COLOURS["text2"])
        self._sig_count_lbl.pack(side="left", padx=12)
        tk.Button(summary, text="Clear", font=FONTS["small"],
                  bg=COLOURS["bg3"], fg=COLOURS["text2"],
                  relief="flat", bd=0,
                  command=self._clear_signals).pack(side="right", padx=8)
        # Scrollable signal cards
        canvas = tk.Canvas(frame, bg=COLOURS["bg2"], highlightthickness=0)
        vsb    = ttk.Scrollbar(frame, orient="vertical", command=canvas.yview)
        canvas.configure(yscrollcommand=vsb.set)
        vsb.pack(side="right", fill="y")
        canvas.pack(side="left", fill="both", expand=True)
        self._sig_inner = tk.Frame(canvas, bg=COLOURS["bg2"])
        win_id = canvas.create_window(0, 0, anchor="nw", window=self._sig_inner)
        self._sig_inner.bind("<Configure>",
                              lambda e: canvas.configure(
                                  scrollregion=canvas.bbox("all")))
        canvas.bind("<Configure>",
                    lambda e: canvas.itemconfig(win_id, width=e.width))
        self._sig_canvas = canvas
        return frame

    # ── Performance tab ────────────────────────────────────────────────────────
    def _build_performance_tab(self, parent) -> tk.Frame:
        frame = tk.Frame(parent, bg=COLOURS["bg2"], padx=12, pady=8)

        stats = [
            ("Win Rate",       "win_rate",     "%"),
            ("Profit Factor",  "profit_factor",""),
            ("Expectancy",     "expectancy",   "$"),
            ("Sharpe Ratio",   "sharpe",       ""),
            ("Sortino Ratio",  "sortino",      ""),
            ("Max Drawdown",   "max_dd_pct",   "%"),
            ("VaR 95%",        "var_95_pct",   "%"),
            ("CVaR 95%",       "cvar_95_pct",  "%"),
            ("Total Trades",   "trades",       ""),
        ]
        self._perf_labels: Dict[str, tk.Label] = {}
        cols = 3
        for i, (label, key, unit) in enumerate(stats):
            col = i % cols * 2
            row = i // cols
            cell = tk.Frame(frame, bg=COLOURS["bg3"], padx=10, pady=6,
                            relief="flat")
            cell.grid(row=row, column=col, padx=6, pady=4, sticky="nsew")
            frame.columnconfigure(col, weight=1)
            tk.Label(cell, text=label, font=FONTS["small"],
                     bg=COLOURS["bg3"], fg=COLOURS["text3"]).pack()
            val_lbl = tk.Label(cell, text="—", font=FONTS["header"],
                               bg=COLOURS["bg3"], fg=COLOURS["text"])
            val_lbl.pack()
            self._perf_labels[key] = (val_lbl, unit)
        return frame

    # ── Risk tab ───────────────────────────────────────────────────────────────
    def _build_risk_tab(self, parent) -> tk.Frame:
        frame = tk.Frame(parent, bg=COLOURS["bg2"], padx=12, pady=8)
        risk_items = [
            ("Account Balance",  "_bal_lbl"),
            ("Equity",           "_eq_lbl"),
            ("Daily P&L",        "_dpnl_lbl"),
            ("Open Trades",      "_ot_lbl"),
            ("Daily Loss Limit", "_dll_lbl"),
            ("Risk / Trade",     "_rpt_lbl"),
        ]
        for i, (label, attr) in enumerate(risk_items):
            col = i % 3 * 2
            row = i // 3
            cell = tk.Frame(frame, bg=COLOURS["bg3"], padx=10, pady=6)
            cell.grid(row=row, column=col, padx=6, pady=4, sticky="nsew")
            frame.columnconfigure(col, weight=1)
            tk.Label(cell, text=label, font=FONTS["small"],
                     bg=COLOURS["bg3"], fg=COLOURS["text3"]).pack()
            lbl = tk.Label(cell, text="—", font=FONTS["header"],
                           bg=COLOURS["bg3"], fg=COLOURS["text"])
            lbl.pack()
            setattr(self, attr, lbl)
        return frame

    # ── Log tab ────────────────────────────────────────────────────────────────
    def _build_log_tab(self, parent) -> tk.Frame:
        frame = tk.Frame(parent, bg=COLOURS["bg2"])
        self._log_text = tk.Text(frame, font=FONTS["mono"],
                                  bg=COLOURS["bg2"], fg=COLOURS["text"],
                                  state="disabled", wrap="none",
                                  relief="flat", bd=0)
        vsb = ttk.Scrollbar(frame, orient="vertical",
                             command=self._log_text.yview)
        hsb = ttk.Scrollbar(frame, orient="horizontal",
                             command=self._log_text.xview)
        self._log_text.configure(yscrollcommand=vsb.set,
                                  xscrollcommand=hsb.set)
        vsb.pack(side="right", fill="y")
        hsb.pack(side="bottom", fill="x")
        self._log_text.pack(fill="both", expand=True)
        # Tag colours
        self._log_text.tag_config("BUY",   foreground=COLOURS["buy"])
        self._log_text.tag_config("SELL",  foreground=COLOURS["sell"])
        self._log_text.tag_config("INFO",  foreground=COLOURS["text2"])
        self._log_text.tag_config("WARN",  foreground="#F59E0B")
        self._log_text.tag_config("ERROR", foreground=COLOURS["sell"])
        return frame

    # ── Event queuing (thread-safe) ────────────────────────────────────────────
    def _queue_signal(self, signal: TradingSignal) -> None:
        self._update_queue.put(("signal", signal))

    def _queue_price_update(self, pair: str, bid: float, ask: float) -> None:
        self._update_queue.put(("price", pair, bid, ask))

    def _queue_status(self, msg: str) -> None:
        self._update_queue.put(("status", msg))

    # ── Queue processor (runs on main thread) ─────────────────────────────────
    def _process_queue(self) -> None:
        try:
            while True:
                item = self._update_queue.get_nowait()
                kind = item[0]
                if kind == "signal":
                    self._handle_signal(item[1])
                elif kind == "price":
                    self._handle_price_update(item[1], item[2], item[3])
                elif kind == "status":
                    self._handle_status(item[1])
        except queue.Empty:
            pass
        finally:
            self.root.after(100, self._process_queue)

    # ── Signal handler ────────────────────────────────────────────────────────
    def _handle_signal(self, signal: TradingSignal) -> None:
        self._signals.insert(0, signal)
        if len(self._signals) > self.SIGNAL_MAX_CARDS:
            self._signals = self._signals[:self.SIGNAL_MAX_CARDS]

        # Refresh signal cards
        for widget in self._sig_inner.winfo_children():
            widget.destroy()
        for sig in self._signals:
            card = SignalCard(self._sig_inner, sig)
            card.pack(fill="x", padx=4, pady=2)

        # Update summary
        buy_count  = sum(1 for s in self._signals if s.direction == Direction.BUY)
        sell_count = len(self._signals) - buy_count
        self._sig_count_lbl.config(
            text=f"Signals: {len(self._signals)}  |  "
                 f"Buy: {buy_count}  |  Sell: {sell_count}")

        # Log entry
        d  = signal.direction.name
        tag= "BUY" if d == "BUY" else "SELL"
        ts = datetime.fromtimestamp(signal.timestamp).strftime("%H:%M:%S")
        self._log(f"[{ts}] SIGNAL {signal.pair} {d} "
                  f"Entry:{signal.entry_price:.5f} "
                  f"SL:{signal.stop_loss:.5f} "
                  f"TP:{signal.take_profit:.5f} "
                  f"Conf:{signal.confidence:.0%}", tag)

        # Flash watchlist row
        row = self._watchlist_rows.get(signal.pair)
        if row:
            orig = row.cget("bg")
            flash= COLOURS["buy_bg"] if d == "BUY" else COLOURS["sell_bg"]
            row.config(bg=flash)
            self.root.after(1200, lambda: row.config(bg=orig))

        # Mark chart
        self._chart_needs_refresh = True

    # ── Price handler ─────────────────────────────────────────────────────────
    def _handle_price_update(self, pair: str, bid: float, ask: float) -> None:
        row = self._watchlist_rows.get(pair)
        if row:
            row.update(bid, ask)
        # Update live price label
        if pair == self._active_pair:
            decimals = 3 if "JPY" in pair else (1 if "XAU" in pair else 5)
            fmt      = f"{{:.{decimals}f}}"
            mid_str  = fmt.format((bid + ask) / 2)
            self._live_price_lbl.config(text=mid_str)

    # ── Status handler ────────────────────────────────────────────────────────
    def _handle_status(self, msg: str) -> None:
        if "✓" in msg or "started" in msg.lower():
            icon  = "●"; col = COLOURS["buy"]
        elif "error" in msg.lower() or "fail" in msg.lower():
            icon  = "●"; col = COLOURS["sell"]
        else:
            icon  = "○"; col = COLOURS["text2"]
        self._status_lbl.config(text=f"{icon} {msg}", fg=col)
        self._log(f"[STATUS] {msg}", "INFO")

    # ── Periodic updates ──────────────────────────────────────────────────────
    def _periodic_update(self) -> None:
        # Clock
        now = datetime.now()
        self._clock_lbl.config(text=now.strftime("UTC %H:%M:%S"))

        # Session
        from core.signal_engine import SignalEngine
        session = SignalEngine._get_session_static() if hasattr(
            SignalEngine, "_get_session_static") else "—"

        # Balance / Risk
        risk = self.controller.risk_mgr.risk_summary()
        self._balance_lbl.config(
            text=f"Balance: ${risk['balance']:,.2f}  Equity: ${risk['equity']:,.2f}")

        # Update risk tab
        dpnl     = risk["daily_pnl"]
        dpnl_col = COLOURS["buy"] if dpnl >= 0 else COLOURS["sell"]
        self._bal_lbl.config(text=f"${risk['balance']:,.2f}")
        self._eq_lbl.config(text=f"${risk['equity']:,.2f}")
        self._dpnl_lbl.config(text=f"${dpnl:+,.2f}", fg=dpnl_col)
        self._ot_lbl.config(text=str(risk["open_trades"]))
        max_dl = self.controller.config.risk.get("max_daily_loss_pct", 5.0)
        self._dll_lbl.config(text=f"{max_dl:.1f}%")
        rpt    = self.controller.config.risk.get("risk_per_trade_pct", 1.5)
        self._rpt_lbl.config(text=f"{rpt:.1f}%")

        # Update performance
        for key, (lbl, unit) in self._perf_labels.items():
            val = risk.get(key, "—")
            txt = f"{val}{unit}" if isinstance(val, (int, float)) else str(val)
            lbl.config(text=txt)

        # Refresh chart if needed
        if self._chart_needs_refresh:
            self._chart_needs_refresh = False
            self._refresh_chart()

        self.root.after(self.UPDATE_INTERVAL_MS, self._periodic_update)

    # ── Chart refresh ─────────────────────────────────────────────────────────
    def _chart_needs_update(self) -> None:
        self._chart_needs_refresh = True

    def _refresh_chart(self) -> None:
        ind_data = self.controller.signal_engine.get_indicator_data(self._active_pair)
        if not ind_data or "closes" not in ind_data:
            return
        MAX = 150
        closes = ind_data.get("closes", np.array([]))
        if len(closes) == 0:
            return

        # Price chart
        self._chart.draw(
            ind_data.get("opens", closes),
            ind_data.get("highs", closes),
            ind_data.get("lows", closes),
            closes, MAX)

        # EMA overlays
        if self._show_ema.get():
            for key, col, lbl, lw in [
                ("ema_fast",  COLOURS["ema_fast"],  "EMA-9",  1.5),
                ("ema_slow",  COLOURS["ema_slow"],  "EMA-21", 1.5),
                ("ema_trend", COLOURS["ema_trend"], "EMA-200",1.0),
            ]:
                self._chart.overlay_ema(ind_data.get(key), col, lbl, lw, MAX)

        # Bollinger Bands
        if self._show_bb.get():
            ub = ind_data.get("bb_upper"); lb = ind_data.get("bb_lower")
            mb = ind_data.get("bb_mid")
            if ub is not None:
                self._chart.overlay_bb(ub, mb, lb, MAX)

        # SuperTrend
        if self._show_st.get():
            st_l = ind_data.get("st_line"); st_d = ind_data.get("st_dir")
            if st_l is not None:
                self._chart.overlay_supertrend(st_l, st_d, MAX)

        # Mark recent signals for active pair
        for sig in self._signals[:5]:
            if sig.pair == self._active_pair:
                n = min(len(closes), MAX)
                self._chart.mark_signal(n - 1, sig.direction.name,
                                         sig.entry_price, sig.stop_loss,
                                         sig.take_profit)
        # Legend
        handles = [
            Line2D([0], [0], color=COLOURS["ema_fast"],  lw=1.5, label="EMA-9"),
            Line2D([0], [0], color=COLOURS["ema_slow"],  lw=1.5, label="EMA-21"),
            Line2D([0], [0], color=COLOURS["ema_trend"], lw=1.0, label="EMA-200"),
        ]
        self._ax_price.legend(handles=handles, loc="upper left",
                               fontsize=7, framealpha=0.7)
        self._ax_price.set_title(
            f"{self._active_pair}  —  {self._tf_var.get()}",
            fontsize=9, color=COLOURS["text2"], loc="right")

        # RSI sub-chart
        self._ax_rsi.clear()
        rsi_arr = ind_data.get("rsi")
        if rsi_arr is not None:
            n   = min(len(rsi_arr), MAX)
            arr = rsi_arr[-n:]
            x   = np.arange(n)
            self._ax_rsi.plot(x, arr, color=COLOURS["rsi_line"],
                               linewidth=1.2, label="RSI-14")
            self._ax_rsi.axhline(70, color=COLOURS["sell"],   lw=0.7,
                                  linestyle="--", alpha=0.6)
            self._ax_rsi.axhline(50, color=COLOURS["text3"],  lw=0.5,
                                  linestyle="--", alpha=0.4)
            self._ax_rsi.axhline(30, color=COLOURS["buy"],    lw=0.7,
                                  linestyle="--", alpha=0.6)
            self._ax_rsi.fill_between(x, arr, 70, where=(arr > 70),
                                       color=COLOURS["sell"], alpha=0.1)
            self._ax_rsi.fill_between(x, arr, 30, where=(arr < 30),
                                       color=COLOURS["buy"],  alpha=0.1)
            self._ax_rsi.set_ylim(0, 100)
            self._ax_rsi.set_ylabel("RSI", fontsize=8, color=COLOURS["text2"])
        self._ax_rsi.set_facecolor(COLOURS["bg2"])
        self._ax_rsi.tick_params(colors=COLOURS["text2"], labelsize=8)
        for s in self._ax_rsi.spines.values():
            s.set_color(COLOURS["border"])
        self._ax_rsi.grid(True, color=COLOURS["grid"], linewidth=0.5, alpha=0.7)

        self._canvas.draw_idle()

    # ── Pair selection ─────────────────────────────────────────────────────────
    def _select_pair(self, pair: str) -> None:
        self._active_pair = pair
        self._pair_title.config(text=pair)
        self._update_pair_highlight()
        self._chart_needs_refresh = True

    def _update_pair_highlight(self) -> None:
        for pair, row in self._watchlist_rows.items():
            bg = COLOURS["accent_light"] if pair == self._active_pair \
                 else COLOURS["bg2"]
            row.config(bg=bg)
            for child in row.winfo_children():
                if isinstance(child, tk.Label):
                    child.config(bg=bg)

    # ── Log helper ─────────────────────────────────────────────────────────────
    def _log(self, msg: str, tag: str = "INFO") -> None:
        self._log_text.config(state="normal")
        timestamp = datetime.now().strftime("%H:%M:%S")
        self._log_text.insert("end", f"{timestamp}  {msg}\n", tag)
        # Keep max lines
        lines = int(self._log_text.index("end").split(".")[0])
        if lines > self.LOG_MAX_LINES:
            self._log_text.delete("1.0", f"{lines - self.LOG_MAX_LINES}.0")
        self._log_text.see("end")
        self._log_text.config(state="disabled")

    # ── Signals ────────────────────────────────────────────────────────────────
    def _clear_signals(self) -> None:
        self._signals.clear()
        for widget in self._sig_inner.winfo_children():
            widget.destroy()
        self._sig_count_lbl.config(text="Signals: 0  |  Buy: 0  |  Sell: 0")

    # ── Close ──────────────────────────────────────────────────────────────────
    def _on_close(self) -> None:
        if messagebox.askyesno("Quit", "Exit Apex Forex Signal System?"):
            logger.info("Application closing…")
            self.controller.stop()
            self.root.destroy()

    # ── Run ────────────────────────────────────────────────────────────────────
    def run(self) -> None:
        """Start background systems then launch the Tkinter main loop."""
        self.controller.start()
        # Start queue processor
        self.root.after(100, self._process_queue)
        # Start periodic update
        self.root.after(1000, self._periodic_update)
        # Log welcome
        self._log("Apex Forex Signal System started", "INFO")
        self._log(f"Monitoring {len(self.controller.config.pairs)} pairs", "INFO")
        self._log("Waiting for live data stream…", "INFO")
        self.root.mainloop()
