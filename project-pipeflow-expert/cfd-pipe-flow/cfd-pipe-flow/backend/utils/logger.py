# =============================================================================
# utils/logger.py
# Structured logging with optional JSON output (loguru-based)
# =============================================================================

from __future__ import annotations

import logging
import sys
from typing import Optional

# ---------------------------------------------------------------------------
# Loguru is optional. If not installed we fall back to stdlib logging.
# ---------------------------------------------------------------------------
try:
    from loguru import logger as _loguru_logger
    _LOGURU_AVAILABLE = True
except ImportError:
    _LOGURU_AVAILABLE = False


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

class CFDLogger:
    """
    Thin wrapper that exposes .debug/.info/.warning/.error/.critical
    regardless of whether loguru is installed.
    """

    def __init__(self, name: str = "cfd"):
        self._name = name
        if _LOGURU_AVAILABLE:
            self._backend = "loguru"
        else:
            self._backend = "stdlib"
            self._log = logging.getLogger(name)

    def _fmt(self, message: str, **kwargs) -> str:
        if kwargs:
            kv = " ".join(f"{k}={v!r}" for k, v in kwargs.items())
            return f"[{self._name}] {message} | {kv}"
        return f"[{self._name}] {message}"

    def debug(self, message: str, **kwargs):
        msg = self._fmt(message, **kwargs)
        if self._backend == "loguru":
            _loguru_logger.debug(msg)
        else:
            self._log.debug(msg)

    def info(self, message: str, **kwargs):
        msg = self._fmt(message, **kwargs)
        if self._backend == "loguru":
            _loguru_logger.info(msg)
        else:
            self._log.info(msg)

    def warning(self, message: str, **kwargs):
        msg = self._fmt(message, **kwargs)
        if self._backend == "loguru":
            _loguru_logger.warning(msg)
        else:
            self._log.warning(msg)

    def error(self, message: str, **kwargs):
        msg = self._fmt(message, **kwargs)
        if self._backend == "loguru":
            _loguru_logger.error(msg)
        else:
            self._log.error(msg)

    def critical(self, message: str, **kwargs):
        msg = self._fmt(message, **kwargs)
        if self._backend == "loguru":
            _loguru_logger.critical(msg)
        else:
            self._log.critical(msg)

    def bind(self, **kwargs) -> "CFDLogger":
        """Return a child logger with context bound."""
        child = CFDLogger(name=self._name)
        child._ctx = kwargs
        return child


# Module-level singletons
_loggers: dict[str, CFDLogger] = {}


def get_logger(name: str = "cfd") -> CFDLogger:
    """Return a (cached) named logger."""
    if name not in _loggers:
        _loggers[name] = CFDLogger(name=name)
    return _loggers[name]


def setup_logging(
    level: str = "INFO",
    fmt: str = "text",
    log_file: Optional[str] = None,
    rotation: str = "10 MB",
    retention: str = "7 days",
) -> None:
    """
    Configure root logging. Call once at application startup (in main.py lifespan).

    Parameters
    ----------
    level    : Log level string — DEBUG / INFO / WARNING / ERROR / CRITICAL
    fmt      : 'text' for human-readable, 'json' for structured JSON
    log_file : Optional path to write rotating log file
    rotation : Loguru rotation spec (e.g. "10 MB", "1 day")
    retention: Loguru retention spec (e.g. "7 days")
    """
    if _LOGURU_AVAILABLE:
        _setup_loguru(level, fmt, log_file, rotation, retention)
    else:
        _setup_stdlib(level)


# ---------------------------------------------------------------------------
# Loguru setup
# ---------------------------------------------------------------------------

def _setup_loguru(
    level: str,
    fmt: str,
    log_file: Optional[str],
    rotation: str,
    retention: str,
) -> None:
    _loguru_logger.remove()  # remove default handler

    if fmt == "json":
        _format = (
            '{{"time":"{time:YYYY-MM-DD HH:mm:ss.SSS}",'
            '"level":"{level}",'
            '"name":"{name}",'
            '"function":"{function}",'
            '"line":{line},'
            '"message":"{message}"}}'
        )
    else:
        _format = (
            "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
            "<level>{message}</level>"
        )

    _loguru_logger.add(
        sys.stdout,
        format=_format,
        level=level.upper(),
        colorize=(fmt == "text"),
        enqueue=True,
    )

    if log_file:
        _loguru_logger.add(
            log_file,
            format=_format,
            level=level.upper(),
            rotation=rotation,
            retention=retention,
            compression="gz",
            enqueue=True,
        )

    # Intercept stdlib logging (e.g. from uvicorn, sqlalchemy)
    logging.basicConfig(handlers=[_InterceptHandler()], level=0, force=True)


class _InterceptHandler(logging.Handler):
    """Route stdlib logging records into loguru."""

    def emit(self, record: logging.LogRecord) -> None:
        try:
            level = _loguru_logger.level(record.levelname).name
        except ValueError:
            level = record.levelno  # type: ignore[assignment]

        frame, depth = logging.currentframe(), 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back  # type: ignore[assignment]
            depth += 1

        _loguru_logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )


# ---------------------------------------------------------------------------
# Stdlib fallback
# ---------------------------------------------------------------------------

def _setup_stdlib(level: str) -> None:
    numeric = getattr(logging, level.upper(), logging.INFO)
    fmt = "%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d | %(message)s"
    logging.basicConfig(
        level=numeric,
        format=fmt,
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )


# ---------------------------------------------------------------------------
# Solver-specific structured event helpers
# ---------------------------------------------------------------------------

solver_logger = get_logger("cfd.solver")
api_logger = get_logger("cfd.api")
db_logger = get_logger("cfd.db")


def log_solve_start(network_id: str, method: str, pipes: int, nodes: int) -> None:
    solver_logger.info(
        "Solve started",
        network_id=network_id,
        method=method,
        pipes=pipes,
        nodes=nodes,
    )


def log_solve_end(
    network_id: str,
    converged: bool,
    iterations: int,
    residual: float,
    elapsed_ms: float,
) -> None:
    solver_logger.info(
        "Solve finished",
        network_id=network_id,
        converged=converged,
        iterations=iterations,
        residual=f"{residual:.3e}",
        elapsed_ms=f"{elapsed_ms:.1f}",
    )


def log_api_request(method: str, path: str, status: int, elapsed_ms: float) -> None:
    api_logger.info(
        "HTTP",
        method=method,
        path=path,
        status=status,
        elapsed_ms=f"{elapsed_ms:.1f}",
    )
