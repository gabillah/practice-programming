"""
ui/app.py — Root Tkinter application window.

Layout:
  ┌──────────────────────────────────────────────────────────┐
  │  Header bar (logo, account summary, session, clock)      │
  ├────────────┬─────────────────────────────────────────────┤
  │ Watchlist  │  Chart  (candlestick + overlays)            │
  │  panel     │─────────────────────────────────────────────│
  │            │  Bottom tabs:                               │
  │            │  Trading | Positions | Orders |             │
  │            │  Signals | History | Analytics | Risk       │
  └────────────┴─────────────────────────────────────────────┘
"""
from __future__ import annotations
import logging, queue, threading, time
from datetime import datetime, timezone
from typing import Dict, List, Optional

import tkinter as tk
from tkinter import ttk, messagebox, filedialog

from ui.theme import COLOURS as C, FONTS as F

logger = logging.getLogger(__name__)


class BrokerApp:
    REFRESH_MS = 2000   # chart/panel refresh interval

    def __init__(self, *, config, db, account, bars, engine,
                 feed, signal_e, risk_mgr, reporter):
        self.config   = config
        self.db       = db
        self.account  = account
        self.bars     = bars
        self.engine   = engine
        self.feed     = feed
        self.signal_e = signal_e
        self.risk     = risk_mgr
        self.reporter = reporter

        self._q: queue.Queue = queue.Queue()
        self._selected_pair = config.pairs[0] if config.pairs else "EUR/USD"
        self._selected_tf   = config.primary_tf
        self._signals: List = []
        self._alerts:  List[str] = []

        self.root = tk.Tk()
        self._setup_root()
        self._build_ui()
        self._wire_callbacks()
        logger.info("BrokerApp UI ready")

    # ── Root window ────────────────────────────────────────────────────────────
    def _setup_root(self):
        self.root.title("Apex Forex Broker  v2.0")
        w = self.config.ui_cfg.get("window_width",  1820)
        h = self.config.ui_cfg.get("window_height", 1000)
        self.root.geometry(f"{w}x{h}")
        self.root.minsize(1280, 720)
        self.root.configure(bg=C["bg"])
        self.root.protocol("WM_DELETE_WINDOW", self._on_close)
        try:
            self.root.state("zoomed")       # Windows maximise
        except Exception:
            try: self.root.attributes("-zoomed", True)  # Linux
            except Exception: pass
        # Style
        style = ttk.Style()
        style.theme_use("clam")
        style.configure("TNotebook",       background=C["bg"],  borderwidth=0)
        style.configure("TNotebook.Tab",   background=C["bg3"], foreground=C["text"],
                         padding=[12,6],   font=F["bold_sm"])
        style.map("TNotebook.Tab",
                  background=[("selected",C["bg2"])],
                  foreground=[("selected",C["accent"])])
        style.configure("TFrame",          background=C["bg"])
        style.configure("TLabel",          background=C["bg"],  foreground=C["text"])
        style.configure("TButton",         background=C["btn"], foreground=C["btn_text"],
                         font=F["bold_sm"], relief="flat", padding=[10,5])
        style.map("TButton",
                  background=[("active",C["btn_hover"])],
                  foreground=[("active",C["btn_text"])])
        style.configure("Treeview",        background=C["bg2"], foreground=C["text"],
                         fieldbackground=C["bg2"], font=F["small"],
                         rowheight=22)
        style.configure("Treeview.Heading",background=C["bg3"], foreground=C["text2"],
                         font=F["bold_sm"])
        style.map("Treeview", background=[("selected",C["selected"])],
                  foreground=[("selected",C["accent"])])
        style.configure("Vertical.TScrollbar", background=C["bg3"], troughcolor=C["bg"])

    # ── Build UI ───────────────────────────────────────────────────────────────
    def _build_ui(self):
        # ── Header ────────────────────────────────────────────────────────────
        self._build_header()
        # ── Alert bar ─────────────────────────────────────────────────────────
        self._alert_bar = tk.Frame(self.root, bg=C["warn_bg"], height=0)
        self._alert_bar.pack(fill="x")
        self._alert_lbl = tk.Label(self._alert_bar, text="", bg=C["warn_bg"],
                                   fg=C["warning"], font=F["bold_sm"])
        self._alert_lbl.pack(side="left", padx=12, pady=2)
        # ── Main content ──────────────────────────────────────────────────────
        content = tk.Frame(self.root, bg=C["bg"])
        content.pack(fill="both", expand=True)
        # Watchlist
        self._watchlist_frame = tk.Frame(content, bg=C["sidebar"],
                                          width=200, relief="flat",
                                          bd=0)
        self._watchlist_frame.pack(side="left", fill="y")
        self._watchlist_frame.pack_propagate(False)
        self._build_watchlist()
        # Right pane
        right = tk.Frame(content, bg=C["bg"])
        right.pack(side="left", fill="both", expand=True)
        # Chart
        self._chart_frame = tk.Frame(right, bg=C["bg"], height=480)
        self._chart_frame.pack(fill="x")
        self._chart_frame.pack_propagate(False)
        self._build_chart()
        # Bottom tabs
        self._tabs = ttk.Notebook(right)
        self._tabs.pack(fill="both", expand=True, padx=4, pady=4)
        self._build_trading_tab()
        self._build_positions_tab()
        self._build_orders_tab()
        self._build_signals_tab()
        self._build_history_tab()
        self._build_analytics_tab()
        self._build_risk_tab()
        self._build_log_tab()

    # ── Header ────────────────────────────────────────────────────────────────
    def _build_header(self):
        hdr = tk.Frame(self.root, bg=C["bg_dark"], height=52)
        hdr.pack(fill="x")
        hdr.pack_propagate(False)
        # Logo
        tk.Label(hdr, text="⬡  APEX FOREX BROKER", bg=C["bg_dark"],
                 fg=C["text_inv"], font=("Segoe UI",14,"bold")).pack(
                 side="left", padx=16)
        tk.Label(hdr, text="v2.0", bg=C["bg_dark"],
                 fg="#94A3B8", font=F["small"]).pack(side="left")

        # Right side: account info
        right_hdr = tk.Frame(hdr, bg=C["bg_dark"])
        right_hdr.pack(side="right", padx=12)

        labels = [("Balance","_hdr_balance"),("Equity","_hdr_equity"),
                  ("Free Margin","_hdr_fm"),("Margin Level","_hdr_ml"),
                  ("Open P&L","_hdr_pnl")]
        for title, attr in labels:
            col = tk.Frame(right_hdr, bg=C["bg_dark"])
            col.pack(side="left", padx=10)
            tk.Label(col, text=title, bg=C["bg_dark"],
                     fg="#94A3B8", font=F["small"]).pack()
            lbl = tk.Label(col, text="—", bg=C["bg_dark"],
                           fg=C["text_inv"], font=F["bold_sm"])
            lbl.pack()
            setattr(self, attr, lbl)

        # Clock + session
        self._hdr_clock = tk.Label(hdr, text="", bg=C["bg_dark"],
                                    fg="#94A3B8", font=F["small"])
        self._hdr_clock.pack(side="right", padx=16)
        self._hdr_session = tk.Label(hdr, text="", bg=C["bg_dark"],
                                      fg="#F59E0B", font=F["bold_sm"])
        self._hdr_session.pack(side="right", padx=4)

    # ── Watchlist ──────────────────────────────────────────────────────────────
    def _build_watchlist(self):
        hdr = tk.Frame(self._watchlist_frame, bg=C["sidebar"])
        hdr.pack(fill="x", pady=(8,4))
        tk.Label(hdr, text="WATCHLIST", bg=C["sidebar"],
                 fg=C["text2"], font=F["bold_sm"]).pack(padx=8)
        self._wl_rows: Dict[str, Dict] = {}
        for pair in self.config.pairs:
            self._add_wl_row(pair)

    def _add_wl_row(self, pair: str):
        frm = tk.Frame(self._watchlist_frame, bg=C["sidebar"],
                       cursor="hand2", pady=1)
        frm.pack(fill="x", padx=4, pady=1)
        def on_click(p=pair):
            self._select_pair(p)
        frm.bind("<Button-1>", lambda e, p=pair: on_click(p))
        pair_lbl = tk.Label(frm, text=pair, bg=C["sidebar"],
                             fg=C["text"], font=F["bold_sm"],
                             anchor="w", cursor="hand2")
        pair_lbl.pack(side="left", padx=6)
        pair_lbl.bind("<Button-1>", lambda e, p=pair: on_click(p))
        bid_lbl = tk.Label(frm, text="—", bg=C["sidebar"],
                            fg=C["text2"], font=F["mono_sm"], anchor="e")
        bid_lbl.pack(side="right", padx=4)
        ask_lbl = tk.Label(frm, text="—", bg=C["sidebar"],
                            fg=C["text2"], font=F["mono_sm"], anchor="e")
        ask_lbl.pack(side="right", padx=2)
        chg_lbl = tk.Label(frm, text="", bg=C["sidebar"],
                            font=F["small"], anchor="e", width=7)
        chg_lbl.pack(side="right", padx=2)
        self._wl_rows[pair] = {
            "frame": frm, "pair": pair_lbl,
            "bid": bid_lbl, "ask": ask_lbl, "chg": chg_lbl,
            "prev_bid": 0.0,
        }

    def _select_pair(self, pair: str):
        self._selected_pair = pair
        # Highlight selected row
        for p, row in self._wl_rows.items():
            bg = C["selected"] if p==pair else C["sidebar"]
            row["frame"].configure(bg=bg)
            row["pair"].configure(bg=bg)
            row["bid"].configure(bg=bg)
            row["ask"].configure(bg=bg)
            row["chg"].configure(bg=bg)
        self._refresh_chart()

    # ── Chart ──────────────────────────────────────────────────────────────────
    def _build_chart(self):
        from ui.chart import ChartPanel
        self._chart = ChartPanel(self._chart_frame, self.bars, self.config)
        self._chart.pack(fill="both", expand=True)

    def _refresh_chart(self):
        try:
            self._chart.draw(self._selected_pair, self._selected_tf, self._signals)
        except Exception as e:
            logger.debug("Chart refresh: %s", e)

    # ── Trading tab ───────────────────────────────────────────────────────────
    def _build_trading_tab(self):
        frm = tk.Frame(self._tabs, bg=C["bg2"])
        self._tabs.add(frm, text="  📈 Trading  ")
        from ui.trading_panel import TradingPanel
        self._trading_panel = TradingPanel(
            frm, self.engine, self.account, self.config, self.db)
        self._trading_panel.pack(fill="both", expand=True)

    # ── Positions tab ─────────────────────────────────────────────────────────
    def _build_positions_tab(self):
        frm = tk.Frame(self._tabs, bg=C["bg2"])
        self._tabs.add(frm, text="  📂 Positions  ")
        from ui.positions_panel import PositionsPanel
        self._pos_panel = PositionsPanel(frm, self.engine, self.db, self.config)
        self._pos_panel.pack(fill="both", expand=True)

    # ── Orders tab ────────────────────────────────────────────────────────────
    def _build_orders_tab(self):
        frm = tk.Frame(self._tabs, bg=C["bg2"])
        self._tabs.add(frm, text="  📋 Orders  ")
        from ui.orders_panel import OrdersPanel
        self._ord_panel = OrdersPanel(frm, self.engine, self.db)
        self._ord_panel.pack(fill="both", expand=True)

    # ── Signals tab ───────────────────────────────────────────────────────────
    def _build_signals_tab(self):
        frm = tk.Frame(self._tabs, bg=C["bg2"])
        self._tabs.add(frm, text="  ⚡ Signals  ")
        from ui.signals_panel import SignalsPanel
        self._sig_panel = SignalsPanel(frm, self.engine, self.config)
        self._sig_panel.pack(fill="both", expand=True)

    # ── History tab ───────────────────────────────────────────────────────────
    def _build_history_tab(self):
        frm = tk.Frame(self._tabs, bg=C["bg2"])
        self._tabs.add(frm, text="  📊 History  ")
        from ui.history_panel import HistoryPanel
        self._hist_panel = HistoryPanel(frm, self.db, self.reporter)
        self._hist_panel.pack(fill="both", expand=True)

    # ── Analytics tab ─────────────────────────────────────────────────────────
    def _build_analytics_tab(self):
        frm = tk.Frame(self._tabs, bg=C["bg2"])
        self._tabs.add(frm, text="  📐 Analytics  ")
        from ui.analytics_panel import AnalyticsPanel
        self._analytics_panel = AnalyticsPanel(frm, self.db, self.risk)
        self._analytics_panel.pack(fill="both", expand=True)

    # ── Risk tab ──────────────────────────────────────────────────────────────
    def _build_risk_tab(self):
        frm = tk.Frame(self._tabs, bg=C["bg2"])
        self._tabs.add(frm, text="  🛡 Risk  ")
        from ui.risk_panel import RiskPanel
        self._risk_panel = RiskPanel(frm, self.risk, self.account, self.config)
        self._risk_panel.pack(fill="both", expand=True)

    # ── Log tab ───────────────────────────────────────────────────────────────
    def _build_log_tab(self):
        frm = tk.Frame(self._tabs, bg=C["bg2"])
        self._tabs.add(frm, text="  📄 Log  ")
        self._log_text = tk.Text(frm, bg=C["bg2"], fg=C["text"],
                                  font=F["mono_sm"], state="disabled",
                                  wrap="word", relief="flat")
        sb = ttk.Scrollbar(frm, orient="vertical",
                           command=self._log_text.yview)
        self._log_text.configure(yscrollcommand=sb.set)
        sb.pack(side="right", fill="y")
        self._log_text.pack(fill="both", expand=True, padx=4, pady=4)
        self._log_text.tag_configure("buy",    foreground=C["buy"])
        self._log_text.tag_configure("sell",   foreground=C["sell"])
        self._log_text.tag_configure("warn",   foreground=C["warning"])
        self._log_text.tag_configure("error",  foreground=C["danger"])
        self._log_text.tag_configure("info",   foreground=C["text2"])

    def _log(self, msg: str, tag: str="info"):
        def do():
            ts = datetime.now().strftime("%H:%M:%S")
            self._log_text.configure(state="normal")
            self._log_text.insert("end", f"[{ts}] {msg}\n", tag)
            if int(self._log_text.index("end-1c").split(".")[0]) > 500:
                self._log_text.delete("1.0","200.0")
            self._log_text.see("end")
            self._log_text.configure(state="disabled")
        self.root.after(0, do)

    # ── Callbacks ──────────────────────────────────────────────────────────────
    def _wire_callbacks(self):
        self.engine.on_trade(lambda m: self._q.put(("trade", m)))
        self.engine.on_close(lambda h: self._q.put(("close", h)))
        self.engine.on_error(lambda m: self._q.put(("error", m)))
        self.engine.on_alert(lambda m: self._q.put(("alert", m)))
        self.signal_e.on_signal(lambda s: self._q.put(("signal", s)))

    # ── Main loop ──────────────────────────────────────────────────────────────
    def run(self):
        self.root.after(200, self._process_queue)
        self.root.after(1000, self._periodic_update)
        self.root.mainloop()

    def _process_queue(self):
        while not self._q.empty():
            try:
                kind, data = self._q.get_nowait()
                if kind == "trade":
                    self._log(data, "buy" if "BUY" in data else "sell")
                elif kind == "close":
                    self._log(f"#{data.ticket} P&L: {data.pnl:+.2f}",
                              "buy" if data.pnl>0 else "sell")
                    self.reporter.append_trade(data)
                elif kind == "error":
                    self._log(data, "error")
                    self._show_alert(data, warning=True)
                elif kind == "alert":
                    self._log(data, "warn")
                    self._show_alert(data, warning=True)
                elif kind == "signal":
                    self._signals.insert(0, data)
                    self._signals = self._signals[:50]
                    if hasattr(self, "_sig_panel"):
                        self._sig_panel.add_signal(data)
                    self._log(
                        f"SIGNAL: {data.pair} {data.dir_str}  "
                        f"conf={data.confidence:.0%}  entry={data.entry_price:.5f}",
                        "buy" if data.dir_str=="BUY" else "sell")
                    self._flash_wl(data.pair, data.dir_str)
            except Exception as e:
                logger.debug("Queue process: %s", e)
        self.root.after(150, self._process_queue)

    def _periodic_update(self):
        try:
            self._update_header()
            self._update_watchlist()
            self._refresh_chart()
            if hasattr(self,"_pos_panel"):
                self._pos_panel.refresh()
            if hasattr(self,"_ord_panel"):
                self._ord_panel.refresh()
            if hasattr(self,"_risk_panel"):
                self._risk_panel.refresh()
        except Exception as e:
            logger.debug("Periodic update: %s", e)
        self.root.after(self.REFRESH_MS, self._periodic_update)

    def _update_header(self):
        snap = self.account.snapshot()
        bal  = snap["balance"]
        eq   = snap["equity"]
        fm   = snap["free_margin"]
        ml   = snap["margin_level"]
        fp   = snap["floating_pnl"]
        self._hdr_balance.config(text=f"${bal:,.2f}")
        self._hdr_equity.config(text=f"${eq:,.2f}")
        self._hdr_fm.config(text=f"${fm:,.2f}")
        self._hdr_ml.config(
            text=f"{ml:.1f}%" if ml>0 else "—",
            fg=C["sell"] if ml>0 and ml<50 else C["text_inv"])
        self._hdr_pnl.config(
            text=f"{fp:+,.2f}",
            fg=C["profit"] if fp>=0 else C["loss"])
        utc = datetime.now(timezone.utc)
        self._hdr_clock.config(
            text=f"UTC {utc.strftime('%H:%M:%S')}  {utc.strftime('%d %b %Y')}")
        # Sessions
        from signals.engine import _current_sessions
        self._hdr_session.config(text=_current_sessions())

    def _update_watchlist(self):
        prices = self.db.get_prices()
        for pair, row in self._wl_rows.items():
            p = prices.get(pair)
            if not p: continue
            bid = p["bid"]; ask = p["ask"]
            dp  = PIP_SIZES_UI.get(pair, 5)
            row["bid"].config(text=f"{bid:.{dp}f}")
            row["ask"].config(text=f"{ask:.{dp}f}")
            prev = row["prev_bid"]
            if prev > 0:
                chg  = (bid-prev)/prev*100
                col  = C["profit"] if chg>=0 else C["loss"]
                row["chg"].config(text=f"{chg:+.3f}%", fg=col)
            row["prev_bid"] = bid

    def _flash_wl(self, pair: str, direction: str):
        row = self._wl_rows.get(pair)
        if not row: return
        col = C["buy_bg"] if direction=="BUY" else C["sell_bg"]
        orig = C["selected"] if pair==self._selected_pair else C["sidebar"]
        def restore():
            for w in (row["frame"],row["pair"],row["bid"],row["ask"],row["chg"]):
                try: w.configure(bg=orig)
                except Exception: pass
        for w in (row["frame"],row["pair"],row["bid"],row["ask"],row["chg"]):
            try: w.configure(bg=col)
            except Exception: pass
        self.root.after(1200, restore)

    def _show_alert(self, msg: str, warning: bool=False):
        self._alert_lbl.config(text=f"⚠  {msg}")
        self._alert_bar.configure(height=26)
        self.root.after(8000, lambda: self._alert_bar.configure(height=0))

    def _on_close(self):
        if messagebox.askyesno("Quit", "Close Apex Forex Broker?\n"
                               "All open positions remain in the database."):
            self.root.destroy()


# Decimal places per pair for watchlist display
PIP_SIZES_UI = {
    "EUR/USD":5,"GBP/USD":5,"AUD/USD":5,"NZD/USD":5,
    "USD/CAD":5,"USD/CHF":5,"USD/JPY":3,
    "EUR/GBP":5,"EUR/JPY":3,"GBP/JPY":3,
    "XAU/USD":2,"XAG/USD":3,
}
