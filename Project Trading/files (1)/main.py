#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════════════╗
║          APEX FOREX SIGNAL SYSTEM - Professional Trading Terminal           ║
║          Version 3.0.0 | Multi-Strategy Algorithmic Signal Engine           ║
╚══════════════════════════════════════════════════════════════════════════════╝

Main application entry point. Initializes all subsystems and launches the GUI.

Architecture:
  - Real-time price streaming via WebSocket (Polygon.io / Twelve Data / OANDA)
  - Multi-indicator signal fusion engine
  - Machine learning pattern recognition
  - Advanced risk management system
  - Full GUI desktop application (Tkinter + Matplotlib)

Author  : Apex Forex Systems
License : MIT
Python  : 3.10+
"""

import sys
import os
import logging
import argparse
import traceback
import threading
import time
from pathlib import Path

# ── Ensure local packages resolve correctly ──────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# ── Internal modules ─────────────────────────────────────────────────────────
from core.app_controller   import AppController
from core.config_manager   import ConfigManager
from core.logger           import setup_logging
from ui.main_window        import MainWindow
from data.stream_manager   import StreamManager
from core.signal_engine    import SignalEngine
from risk.risk_manager     import RiskManager
from ml.pattern_engine     import PatternEngine
from reporting.trade_log   import TradeLogger

# ── Version ───────────────────────────────────────────────────────────────────
__version__ = "3.0.0"
APP_NAME    = "Apex Forex Signal System"

# ─────────────────────────────────────────────────────────────────────────────
def parse_args() -> argparse.Namespace:
    """Parse CLI arguments for headless / debug modes."""
    p = argparse.ArgumentParser(
        description=f"{APP_NAME} v{__version__}",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py                        # Normal GUI launch
  python main.py --debug                # Enable verbose debug logging
  python main.py --config custom.json   # Load custom config file
  python main.py --headless             # Run without GUI (log signals only)
        """
    )
    p.add_argument("--debug",    action="store_true", help="Enable debug logging")
    p.add_argument("--headless", action="store_true", help="No GUI – log to stdout")
    p.add_argument("--config",   default="config.json", help="Config file path")
    p.add_argument("--version",  action="version", version=f"{APP_NAME} {__version__}")
    return p.parse_args()


# ─────────────────────────────────────────────────────────────────────────────
def check_dependencies() -> bool:
    """Verify all required packages are installed."""
    required = [
        ("tkinter",     "tkinter"),
        ("numpy",       "numpy"),
        ("pandas",      "pandas"),
        ("matplotlib",  "matplotlib"),
        ("scipy",       "scipy"),
        ("sklearn",     "scikit-learn"),
        ("websocket",   "websocket-client"),
        ("requests",    "requests"),
        ("ta",          "ta"),
        ("PIL",         "Pillow"),
    ]
    missing = []
    for module, package in required:
        try:
            __import__(module)
        except ImportError:
            missing.append(package)
    if missing:
        print("❌  Missing dependencies. Run:")
        print(f"    pip install {' '.join(missing)}")
        return False
    return True


# ─────────────────────────────────────────────────────────────────────────────
def bootstrap(args: argparse.Namespace) -> None:
    """
    Bootstrap all subsystems in dependency order:
      1. Logging
      2. Configuration
      3. Trade Logger
      4. Risk Manager
      5. Pattern Engine (ML)
      6. Signal Engine
      7. Stream Manager
      8. App Controller
      9. GUI (if not headless)
    """
    # 1 ── Logging ─────────────────────────────────────────────────────────────
    log_level = logging.DEBUG if args.debug else logging.INFO
    setup_logging(log_level, log_file="logs/apex_forex.log")
    logger = logging.getLogger("main")
    logger.info("=" * 70)
    logger.info(f"  {APP_NAME}  v{__version__}  starting up…")
    logger.info("=" * 70)

    # 2 ── Configuration ────────────────────────────────────────────────────────
    config = ConfigManager(args.config)
    logger.info(f"Config loaded: {args.config}")

    # 3 ── Trade Logger ─────────────────────────────────────────────────────────
    trade_logger = TradeLogger(config)
    logger.info("Trade logger initialised")

    # 4 ── Risk Manager ─────────────────────────────────────────────────────────
    risk_mgr = RiskManager(config)
    logger.info("Risk manager initialised")

    # 5 ── Pattern Engine (ML) ──────────────────────────────────────────────────
    pattern_engine = PatternEngine(config)
    logger.info("Pattern engine initialised")

    # 6 ── Signal Engine ────────────────────────────────────────────────────────
    signal_engine = SignalEngine(config, risk_mgr, pattern_engine)
    logger.info("Signal engine initialised")

    # 7 ── Stream Manager ───────────────────────────────────────────────────────
    stream_mgr = StreamManager(config, signal_engine)
    logger.info("Stream manager initialised")

    # 8 ── App Controller ───────────────────────────────────────────────────────
    controller = AppController(
        config        = config,
        stream_mgr    = stream_mgr,
        signal_engine = signal_engine,
        risk_mgr      = risk_mgr,
        trade_logger  = trade_logger,
        pattern_engine= pattern_engine,
    )

    # 9 ── GUI or headless ──────────────────────────────────────────────────────
    if args.headless:
        logger.info("Headless mode – streaming signals to logs …")
        controller.start_headless()
    else:
        logger.info("Launching GUI …")
        window = MainWindow(controller)
        window.run()          # blocks until window closed


# ─────────────────────────────────────────────────────────────────────────────
def main() -> None:
    args = parse_args()

    # Create required directories
    for d in ("logs", "data/history", "data/cache", "reports", "models"):
        Path(d).mkdir(parents=True, exist_ok=True)

    if not check_dependencies():
        sys.exit(1)

    try:
        bootstrap(args)
    except KeyboardInterrupt:
        print("\n\nShutdown requested by user – goodbye.")
    except Exception as exc:
        logging.getLogger("main").critical(
            "Fatal error during startup:\n%s", traceback.format_exc()
        )
        print(f"\n❌  Fatal: {exc}")
        print("    Check logs/apex_forex.log for details.")
        sys.exit(2)


# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    main()
