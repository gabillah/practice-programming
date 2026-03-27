"""
core/app_controller.py
──────────────────────
Central application coordinator.

Responsibilities:
  * Wires all subsystems together (config, stream, signals, risk, ML, logging)
  * Provides a single start() / stop() lifecycle interface
  * Exposes a headless mode for server / VPS deployment (no GUI)
  * Forwards new signals to the trade logger
  * Runs a lightweight heartbeat thread that logs system health every 60 s
"""

from __future__ import annotations

import logging
import threading
import time
from typing import Optional

logger = logging.getLogger("app_controller")


class AppController:
    """
    Wires all subsystems and manages the application lifecycle.

    Parameters
    ----------
    config          : ConfigManager   - loaded configuration
    stream_mgr      : StreamManager   - live price feed
    signal_engine   : SignalEngine    - indicator fusion + signal emission
    risk_mgr        : RiskManager     - position sizing & risk checks
    trade_logger    : TradeLogger     - CSV / JSON signal journal
    pattern_engine  : PatternEngine   - ML probability filter
    """

    def __init__(
        self,
        config,
        stream_mgr,
        signal_engine,
        risk_mgr,
        trade_logger,
        pattern_engine,
    ) -> None:
        self.config         = config
        self.stream_mgr     = stream_mgr
        self.signal_engine  = signal_engine
        self.risk_mgr       = risk_mgr
        self.trade_logger   = trade_logger
        self.pattern_engine = pattern_engine

        self._running = False
        self._heartbeat_thread: Optional[threading.Thread] = None

        # Wire signal engine -> trade logger
        # Every TradingSignal emitted by the engine is automatically
        # forwarded to _on_signal, which writes it to the CSV journal.
        signal_engine.on_new_signal(self._on_signal)

        logger.debug("AppController initialised — subsystems wired")

    # ------------------------------------------------------------------
    # Internal signal handler
    # ------------------------------------------------------------------
    def _on_signal(self, signal) -> None:
        """Receives every new TradingSignal and forwards it to the trade logger."""
        try:
            self.trade_logger.log_signal(signal)
        except Exception as exc:
            logger.error("Trade logger error on signal %s: %s", signal.pair, exc)

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------
    def start(self) -> None:
        """
        Start all subsystems in the correct dependency order:
          1. Stream manager  (begins fetching historical bars + live ticks)
          2. Heartbeat thread (periodic health logging every 60 s)
        """
        if self._running:
            logger.warning("AppController.start() called while already running — ignored")
            return

        self._running = True
        logger.info("AppController starting subsystems...")

        # Start live data stream (also triggers historical bootstrap)
        self.stream_mgr.start()

        # Start background heartbeat
        self._heartbeat_thread = threading.Thread(
            target=self._heartbeat_loop,
            daemon=True,
            name="Heartbeat",
        )
        self._heartbeat_thread.start()

        logger.info("AppController — all systems running")

    def stop(self) -> None:
        """
        Gracefully shut down all subsystems:
          1. Signal flag cleared  (stops heartbeat loop)
          2. Stream manager stopped (WebSocket closed)
          3. Trade logger flushed  (pending CSV rows written to disk)
        """
        if not self._running:
            return

        logger.info("AppController stopping...")
        self._running = False

        try:
            self.stream_mgr.stop()
        except Exception as exc:
            logger.error("Error stopping stream manager: %s", exc)

        try:
            self.trade_logger.flush()
        except Exception as exc:
            logger.error("Error flushing trade logger: %s", exc)

        logger.info("AppController stopped cleanly")

    # ------------------------------------------------------------------
    # Headless mode
    # ------------------------------------------------------------------
    def start_headless(self) -> None:
        """
        Run without a GUI.  Blocks the calling thread indefinitely (or until
        KeyboardInterrupt / stop() is called from another thread).

        All signals are written to:
          logs/apex_forex.log
          reports/trades.csv
        """
        logger.info("Running in HEADLESS mode — press Ctrl+C to stop")
        self.start()
        try:
            while self._running:
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("KeyboardInterrupt received — shutting down")
        finally:
            self.stop()

    # ------------------------------------------------------------------
    # Heartbeat
    # ------------------------------------------------------------------
    def _heartbeat_loop(self) -> None:
        """Logs a periodic system health summary every 60 seconds."""
        interval = 60
        while self._running:
            time.sleep(interval)
            if not self._running:
                break
            try:
                tick_count = getattr(self.stream_mgr, "tick_count", "n/a")
                risk_sum   = self.risk_mgr.risk_summary()
                logger.info(
                    "Heartbeat — ticks: %s | open trades: %s | "
                    "daily P&L: $%.2f | balance: $%.2f",
                    tick_count,
                    risk_sum.get("open_trades", 0),
                    risk_sum.get("daily_pnl",   0.0),
                    risk_sum.get("balance",      0.0),
                )
            except Exception as exc:
                logger.warning("Heartbeat error: %s", exc)

    # ------------------------------------------------------------------
    # Properties
    # ------------------------------------------------------------------
    @property
    def is_running(self) -> bool:
        """True while the application is active."""
        return self._running
