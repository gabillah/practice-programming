"""
core/logger.py
──────────────
Logging configuration for the entire application.

Sets up two handlers:
  1. Console handler  — INFO level by default, with ANSI colour coding
  2. Rotating file handler — DEBUG level, logs/apex_forex.log
                             Max 5 files x 10 MB each (50 MB total)

Usage (called once at startup from main.py):
    from core.logger import setup_logging
    setup_logging(level=logging.INFO, log_file="logs/apex_forex.log")

After that, every module just does:
    import logging
    logger = logging.getLogger(__name__)
    logger.info("Hello from my module")
"""

from __future__ import annotations

import logging
import logging.handlers
import sys
from pathlib import Path


# ─────────────────────────────────────────────────────────────────────────────
def setup_logging(
    level: int = logging.INFO,
    log_file: str = "logs/apex_forex.log",
) -> None:
    """
    Configure the root logger with a console handler and a rotating file handler.

    Parameters
    ----------
    level    : Logging level for the console (e.g. logging.DEBUG or logging.INFO).
               The file handler always logs at DEBUG level regardless of this setting.
    log_file : Path to the log file.  Parent directories are created automatically.
    """
    # Create log directory if it does not exist
    log_path = Path(log_file)
    log_path.parent.mkdir(parents=True, exist_ok=True)

    # Root logger — capture everything; individual handlers filter by level
    root = logging.getLogger()
    root.setLevel(logging.DEBUG)

    # Shared format string
    fmt      = "%(asctime)s  %(levelname)-8s  %(name)-30s  %(message)s"
    date_fmt = "%Y-%m-%d %H:%M:%S"

    # ── Console handler ───────────────────────────────────────────────────────
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(_ColourFormatter(fmt, date_fmt))
    root.addHandler(console_handler)

    # ── Rotating file handler ─────────────────────────────────────────────────
    try:
        file_handler = logging.handlers.RotatingFileHandler(
            filename   = str(log_path),
            maxBytes   = 10 * 1024 * 1024,   # 10 MB per file
            backupCount= 5,                   # keep 5 old files → 50 MB max
            encoding   = "utf-8",
        )
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(logging.Formatter(fmt, date_fmt))
        root.addHandler(file_handler)
    except OSError as exc:
        # Non-fatal: continue without file logging if the path is not writable
        logging.getLogger("logger").warning(
            "Could not open log file %s: %s  (file logging disabled)", log_file, exc
        )

    # ── Suppress noisy third-party loggers ────────────────────────────────────
    for noisy_module in ("matplotlib", "PIL", "urllib3", "websocket", "requests"):
        logging.getLogger(noisy_module).setLevel(logging.WARNING)

    logging.getLogger("logger").debug("Logging initialised → %s", log_file)


# ─────────────────────────────────────────────────────────────────────────────
class _ColourFormatter(logging.Formatter):
    """
    Logging formatter that adds ANSI colour codes to console output.

    Colours by level:
      DEBUG    → grey
      INFO     → cyan
      WARNING  → yellow
      ERROR    → red
      CRITICAL → bold red
    """

    RESET    = "\033[0m"
    GREY     = "\033[90m"
    CYAN     = "\033[96m"
    YELLOW   = "\033[93m"
    RED      = "\033[91m"
    BOLD_RED = "\033[1;91m"

    LEVEL_COLOURS = {
        logging.DEBUG:    GREY,
        logging.INFO:     CYAN,
        logging.WARNING:  YELLOW,
        logging.ERROR:    RED,
        logging.CRITICAL: BOLD_RED,
    }

    def format(self, record: logging.LogRecord) -> str:
        colour      = self.LEVEL_COLOURS.get(record.levelno, self.RESET)
        message     = super().format(record)
        return f"{colour}{message}{self.RESET}"
