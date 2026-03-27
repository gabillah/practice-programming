"""
core/logger.py
==============
Logging setup for Apex Forex Broker.

Features:
  - Rotating file handler  (10 MB per file, keeps 5 backups)
  - Coloured console output (uses ANSI codes on Windows 10+ / macOS / Linux)
  - Per-module log level control
  - Optional JSON log format for machine-readable logs
  - get_logger() helper so every module uses a consistent name
  - Suppresses noisy third-party library output

Usage in any module:
    from core.logger import get_logger
    log = get_logger(__name__)
    log.info("Started successfully")
    log.warning("Spread too wide: %.1f pips", spread)
    log.error("Failed to open trade: %s", reason)
"""

import logging
import logging.handlers
import sys
import json
import os
from pathlib import Path
from datetime import datetime, timezone


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def setup_logging(
    level: int  = logging.INFO,
    log_file: str = "logs/broker.log",
    json_logs: bool = False,
    colour: bool = True,
) -> None:
    """
    Initialise the root logger.  Call this ONCE at application startup
    (in main.py) before importing any other module.

    Parameters
    ----------
    level     : Console log level.  Use logging.DEBUG for verbose output.
                Defaults to logging.INFO.
    log_file  : Path to the rotating log file.
                The parent directory is created automatically.
                Set to "" or None to disable file logging.
    json_logs : If True, write log file entries as JSON objects (one per line).
                Useful for log aggregators.  Default: False (plain text).
    colour    : If True, apply ANSI colour codes to console output.
                Automatically disabled when stdout is not a TTY (e.g. when
                piped to a file or run headless).  Default: True.
    """
    Path("logs").mkdir(parents=True, exist_ok=True)

    root = logging.getLogger()
    root.setLevel(logging.DEBUG)          # capture everything; handlers filter

    # Remove any handlers already attached (prevent duplicates on re-init)
    root.handlers.clear()

    # ── Console handler ───────────────────────────────────────────────────────
    use_colour = colour and _stdout_supports_colour()
    console_fmt   = "%(asctime)s  %(levelname)-8s  %(name)-28s  %(message)s"
    console_date  = "%H:%M:%S"
    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(level)
    if use_colour:
        ch.setFormatter(_ColourFormatter(console_fmt, console_date))
    else:
        ch.setFormatter(logging.Formatter(console_fmt, console_date))
    root.addHandler(ch)

    # ── Rotating file handler ─────────────────────────────────────────────────
    if log_file:
        try:
            Path(log_file).parent.mkdir(parents=True, exist_ok=True)
            fh = logging.handlers.RotatingFileHandler(
                log_file,
                maxBytes   = 10 * 1024 * 1024,   # 10 MB per file
                backupCount= 5,                   # keep broker.log.1 … .5
                encoding   = "utf-8",
            )
            fh.setLevel(logging.DEBUG)            # file always gets full detail
            if json_logs:
                fh.setFormatter(_JsonFormatter())
            else:
                file_fmt  = "%(asctime)s  %(levelname)-8s  %(name)-28s  %(message)s"
                file_date = "%Y-%m-%d %H:%M:%S"
                fh.setFormatter(logging.Formatter(file_fmt, file_date))
            root.addHandler(fh)
        except OSError as e:
            root.warning("Cannot open log file %s: %s", log_file, e)

    # ── Silence noisy third-party libraries ───────────────────────────────────
    _noisy = (
        "matplotlib", "PIL", "Pillow",
        "urllib3", "requests", "requests.packages.urllib3",
        "websocket", "websocket-client",
        "sklearn", "sklearn.utils",
        "charset_normalizer",
    )
    for name in _noisy:
        logging.getLogger(name).setLevel(logging.WARNING)

    root.info(
        "Logging initialised — level=%s  file=%s  json=%s",
        logging.getLevelName(level), log_file or "disabled", json_logs,
    )


def get_logger(name: str) -> logging.Logger:
    """
    Return a logger for the given module name.

    Recommended usage at the top of every source file:

        from core.logger import get_logger
        log = get_logger(__name__)

    This automatically uses the module's dotted path as the logger name,
    e.g. "signals.engine", "trading.engine", "ui.chart", which makes
    filtering and log analysis much easier.
    """
    return logging.getLogger(name)


def set_level(level: int) -> None:
    """
    Change the console log level at runtime without restarting.

    Example:
        import logging
        from core.logger import set_level
        set_level(logging.DEBUG)    # turn on verbose output
        set_level(logging.WARNING)  # quieten output
    """
    for handler in logging.getLogger().handlers:
        if isinstance(handler, logging.StreamHandler) and \
           not isinstance(handler, logging.FileHandler):
            handler.setLevel(level)


def get_log_path() -> str:
    """Return the path of the active rotating log file, or '' if none."""
    for handler in logging.getLogger().handlers:
        if isinstance(handler, logging.handlers.RotatingFileHandler):
            return handler.baseFilename
    return ""


# ─────────────────────────────────────────────────────────────────────────────
# Internal helpers
# ─────────────────────────────────────────────────────────────────────────────

def _stdout_supports_colour() -> bool:
    """Return True if stdout is a TTY and likely supports ANSI colour codes."""
    if not hasattr(sys.stdout, "isatty"):
        return False
    if not sys.stdout.isatty():
        return False
    # Windows: ANSI is supported on Windows 10 build 1607+ via VT mode
    if sys.platform == "win32":
        try:
            import ctypes
            kernel32 = ctypes.windll.kernel32
            kernel32.SetConsoleMode(
                kernel32.GetStdHandle(-11),
                kernel32.GetConsoleMode(kernel32.GetStdHandle(-11)) | 0x0004,
            )
            return True
        except Exception:
            return False
    return True


class _ColourFormatter(logging.Formatter):
    """
    Logging formatter that prepends ANSI colour codes to each line.

    Colour scheme:
        DEBUG    — dark grey
        INFO     — cyan
        WARNING  — yellow
        ERROR    — bright red
        CRITICAL — bold bright red
    """
    _COLOURS = {
        logging.DEBUG   : "\033[90m",
        logging.INFO    : "\033[96m",
        logging.WARNING : "\033[93m",
        logging.ERROR   : "\033[91m",
        logging.CRITICAL: "\033[1;91m",
    }
    _RESET = "\033[0m"

    def format(self, record: logging.LogRecord) -> str:
        colour = self._COLOURS.get(record.levelno, "")
        return f"{colour}{super().format(record)}{self._RESET}"


class _JsonFormatter(logging.Formatter):
    """
    Logging formatter that writes each log entry as a single JSON object.
    One JSON object per line — compatible with Splunk, Datadog, etc.

    Output fields:
        ts      — ISO-8601 UTC timestamp
        level   — level name (DEBUG / INFO / WARNING / ERROR / CRITICAL)
        logger  — logger name (module path)
        msg     — formatted message
        exc     — exception traceback string (only present on exceptions)
    """
    def format(self, record: logging.LogRecord) -> str:
        obj: dict = {
            "ts"    : datetime.fromtimestamp(
                          record.created, tz=timezone.utc
                      ).isoformat(timespec="milliseconds"),
            "level" : record.levelname,
            "logger": record.name,
            "msg"   : record.getMessage(),
        }
        if record.exc_info:
            obj["exc"] = self.formatException(record.exc_info)
        return json.dumps(obj, ensure_ascii=False)
