#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════════════╗
║      APEX FOREX BROKER  v2.0  —  Professional Self-Hosted Broker Desktop    ║
║      Manual Trading  +  Automatic Signal System  +  Risk Management         ║
╚══════════════════════════════════════════════════════════════════════════════╝

Entry point.  Bootstraps every subsystem and launches the GUI.

Architecture overview
─────────────────────
  main.py               Bootstrap & wiring
  core/config.py        JSON configuration manager
  core/logger.py        Rotating log setup
  db/database.py        SQLite persistence (positions, history, signals)
  auth/account.py       Balance / margin / equity / swap accounting
  data/feed.py          WebSocket price feed + demo simulator
  data/bars.py          Tick → OHLCV bar builder (all timeframes)
  signals/indicators.py Pure-NumPy indicator library (30+ indicators)
  signals/engine.py     22-strategy fusion engine + ML filter
  risk/manager.py       Position sizing, Kelly, VaR, CVaR, drawdown
  trading/engine.py     Order execution, SL/TP, margin-call monitor
  reports/reporter.py   CSV export, daily stats, equity curve
  ui/app.py             Root Tkinter window, tab router
  ui/theme.py           Light-mode colour palette & fonts
  ui/watchlist.py       Live price watchlist panel
  ui/chart.py           Candlestick chart + overlays
  ui/trading_panel.py   Manual order entry panel
  ui/positions.py       Open positions & orders table
  ui/history.py         Trade history & analytics
  ui/signals_panel.py   Signal cards feed
  ui/risk_panel.py      Risk dashboard
  ui/account_panel.py   Account summary widget

Python  : 3.10+
Platform: Windows 10/11 (also macOS / Linux)
"""

import sys
import os
import logging
import argparse
import traceback
from pathlib import Path

# Make project root importable
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# ── Early dependency check ─────────────────────────────────────────────────
REQUIRED = [
    ("numpy",      "numpy"),
    ("pandas",     "pandas"),
    ("matplotlib", "matplotlib"),
    ("scipy",      "scipy"),
    ("sklearn",    "scikit-learn"),
    ("websocket",  "websocket-client"),
    ("requests",   "requests"),
    ("PIL",        "Pillow"),
]

def _check_deps() -> bool:
    missing = []
    for mod, pkg in REQUIRED:
        try:
            __import__(mod)
        except ImportError:
            missing.append(pkg)
    if missing:
        print("Missing packages.  Run:  pip install " + " ".join(missing))
        return False
    return True


def _parse_args():
    p = argparse.ArgumentParser(description="Apex Forex Broker v2.0")
    p.add_argument("--debug",    action="store_true",  help="Enable DEBUG logging")
    p.add_argument("--headless", action="store_true",  help="Run without GUI")
    p.add_argument("--config",   default="config.json",help="Path to config file")
    p.add_argument("--reset-db", action="store_true",  help="Wipe DB on startup")
    p.add_argument("--version",  action="version",     version="Apex Forex Broker 2.0")
    return p.parse_args()


def _create_dirs():
    for d in ("logs", "db", "reports", "exports", "models", "resources"):
        Path(d).mkdir(parents=True, exist_ok=True)


def bootstrap(args):
    """Build every subsystem in dependency order and start the GUI."""
    from core.logger    import setup_logging
    level = logging.DEBUG if args.debug else logging.INFO
    setup_logging(level)
    log = logging.getLogger("main")
    log.info("=" * 72)
    log.info("  Apex Forex Broker  v2.0  starting…")
    log.info("=" * 72)

    _create_dirs()

    # ── Subsystem construction ─────────────────────────────────────────────
    from core.config      import Config
    from db.database      import Database
    from auth.account     import AccountManager
    from data.bars        import BarAggregator
    from data.feed        import PriceFeed
    from signals.engine   import SignalEngine
    from risk.manager     import RiskManager
    from trading.engine   import TradingEngine
    from reports.reporter import Reporter

    config   = Config(args.config)
    db       = Database(config, reset=args.reset_db)
    account  = AccountManager(db, config)
    bars     = BarAggregator(config)
    risk_mgr = RiskManager(config, account, db)
    signal_e = SignalEngine(config, risk_mgr, db)
    engine   = TradingEngine(db, account, risk_mgr, config)
    feed     = PriceFeed(config)
    reporter = Reporter(db, account, config)

    # ── Wire the pipeline: feed → bars → signals → engine ─────────────────
    # 1. Raw ticks update account prices + bar aggregator
    feed.on_tick(account.update_price)
    feed.on_tick(bars.on_tick)
    # 2. Completed bars go to the signal engine
    bars.on_bar(signal_e.on_bar)
    # 3. New signals optionally auto-trade
    signal_e.on_signal(engine.handle_signal)
    # 4. Price feed also updates engine for SL/TP monitoring
    feed.on_tick(engine.on_price_update)

    if args.headless:
        log.info("Headless mode — press Ctrl+C to stop")
        feed.start()
        try:
            import time
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass
        finally:
            feed.stop()
        return

    # ── Launch GUI ─────────────────────────────────────────────────────────
    from ui.app import BrokerApp
    app = BrokerApp(
        config   = config,
        db       = db,
        account  = account,
        bars     = bars,
        engine   = engine,
        feed     = feed,
        signal_e = signal_e,
        risk_mgr = risk_mgr,
        reporter = reporter,
    )
    feed.start()
    app.run()
    feed.stop()
    log.info("Apex Forex Broker shutdown complete")


def main():
    args = _parse_args()
    if not _check_deps():
        sys.exit(1)
    try:
        bootstrap(args)
    except KeyboardInterrupt:
        print("\nShutdown.")
    except Exception:
        logging.getLogger("main").critical(
            "Unhandled exception:\n%s", traceback.format_exc())
        sys.exit(2)


if __name__ == "__main__":
    main()
