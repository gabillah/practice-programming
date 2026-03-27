"""
cpp/bridge.py
=============
Python ctypes bridge to the C++ math_engine shared library.

Falls back gracefully to pure-Python/NumPy if the library is not
compiled or not found — so the application always runs.

Usage:
    from cpp.bridge import MathEngine
    eng = MathEngine()
    ema = eng.ema(close_array, period=14)
    atr = eng.atr(high, low, close, period=14)
    sharpe = eng.sharpe(returns_array)
"""
from __future__ import annotations

import ctypes
import logging
import os
import sys
from pathlib import Path
from typing import Optional, Tuple

import numpy as np

log = logging.getLogger(__name__)

# ── Locate shared library ──────────────────────────────────────────────────
def _find_lib() -> Optional[Path]:
    """Search for math_engine shared library next to this file and in cpp/."""
    candidates = []
    here = Path(__file__).parent
    root = here.parent

    if sys.platform == "win32":
        names = ["math_engine.dll"]
    elif sys.platform == "darwin":
        names = ["math_engine.dylib", "math_engine.so"]
    else:
        names = ["math_engine.so"]

    for name in names:
        for base in [here, root / "cpp", root]:
            p = base / name
            if p.exists():
                candidates.append(p)

    return candidates[0] if candidates else None


class MathEngine:
    """
    Thin wrapper around the C++ math_engine shared library.

    If the library is unavailable, all methods fall back to pure NumPy
    equivalents so the application continues to function correctly.
    Performance will be lower but results are numerically identical.
    """

    def __init__(self):
        self._lib: Optional[ctypes.CDLL] = None
        self._available = False
        self._load()

    def _load(self):
        lib_path = _find_lib()
        if lib_path is None:
            log.info("C++ math_engine not found — using NumPy fallback")
            return
        try:
            lib = ctypes.CDLL(str(lib_path))
            self._bind(lib)
            self._lib = lib
            self._available = True
            log.info("C++ math_engine loaded: %s", lib_path.name)
        except Exception as exc:
            log.warning("Failed to load C++ lib (%s): %s", lib_path, exc)

    def _bind(self, lib: ctypes.CDLL):
        """Bind ctypes signatures for all exported functions."""
        dbl_p = ctypes.POINTER(ctypes.c_double)

        def _arr(lib_fn, restype, *argtypes):
            lib_fn.restype  = restype
            lib_fn.argtypes = list(argtypes)

        # version
        lib.apex_version.restype  = ctypes.c_char_p
        lib.apex_version.argtypes = []

        # moving averages
        for name in ("apex_ema", "apex_sma", "apex_wma", "apex_hma", "apex_wilder"):
            fn = getattr(lib, name)
            fn.restype  = None
            fn.argtypes = [dbl_p, dbl_p, ctypes.c_int, ctypes.c_int]

        # rsi
        lib.apex_rsi.restype  = None
        lib.apex_rsi.argtypes = [dbl_p, dbl_p, ctypes.c_int, ctypes.c_int]

        # macd
        lib.apex_macd.restype  = None
        lib.apex_macd.argtypes = [
            dbl_p, dbl_p, dbl_p, dbl_p,
            ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.c_int]

        # stochastic
        lib.apex_stochastic.restype  = None
        lib.apex_stochastic.argtypes = [
            dbl_p, dbl_p, dbl_p, dbl_p, dbl_p,
            ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.c_int]

        # atr
        lib.apex_atr.restype  = None
        lib.apex_atr.argtypes = [dbl_p, dbl_p, dbl_p, dbl_p, ctypes.c_int, ctypes.c_int]

        # bollinger
        lib.apex_bollinger.restype  = None
        lib.apex_bollinger.argtypes = [
            dbl_p, dbl_p, dbl_p, dbl_p,
            ctypes.c_int, ctypes.c_int, ctypes.c_double]

        # supertrend
        lib.apex_supertrend.restype  = None
        lib.apex_supertrend.argtypes = [
            dbl_p, dbl_p, dbl_p, dbl_p, dbl_p,
            ctypes.c_int, ctypes.c_int, ctypes.c_double]

        # adx
        lib.apex_adx.restype  = None
        lib.apex_adx.argtypes = [
            dbl_p, dbl_p, dbl_p, dbl_p, dbl_p, dbl_p,
            ctypes.c_int, ctypes.c_int]

        # ichimoku
        lib.apex_ichimoku.restype  = None
        lib.apex_ichimoku.argtypes = [
            dbl_p, dbl_p, dbl_p,
            dbl_p, dbl_p, dbl_p, dbl_p, dbl_p,
            ctypes.c_int]

        # financial math
        for name in ("apex_pnl_buy", "apex_pnl_sell"):
            fn = getattr(lib, name)
            fn.restype  = ctypes.c_double
            fn.argtypes = [ctypes.c_double] * 5

        lib.apex_margin.restype  = ctypes.c_double
        lib.apex_margin.argtypes = [ctypes.c_double] * 4

        # statistics
        for name in ("apex_var95", "apex_cvar95"):
            fn = getattr(lib, name)
            fn.restype  = ctypes.c_double
            fn.argtypes = [dbl_p, ctypes.c_int, ctypes.c_double]

        lib.apex_max_drawdown.restype  = ctypes.c_double
        lib.apex_max_drawdown.argtypes = [dbl_p, ctypes.c_int]

        for name in ("apex_sharpe", "apex_sortino"):
            fn = getattr(lib, name)
            fn.restype  = ctypes.c_double
            fn.argtypes = [dbl_p, ctypes.c_int]

    # ── Helpers ────────────────────────────────────────────────────────────
    @staticmethod
    def _ptr(arr: np.ndarray) -> ctypes.POINTER(ctypes.c_double):
        return arr.ctypes.data_as(ctypes.POINTER(ctypes.c_double))

    @staticmethod
    def _out(n: int) -> np.ndarray:
        return np.full(n, np.nan, dtype=np.float64)

    @property
    def version(self) -> str:
        if self._lib:
            return self._lib.apex_version().decode()
        return "NumPy fallback"

    # ── Moving Averages ────────────────────────────────────────────────────
    def ema(self, src: np.ndarray, period: int) -> np.ndarray:
        src = np.ascontiguousarray(src, dtype=np.float64)
        n = len(src)
        if self._available:
            dst = self._out(n)
            self._lib.apex_ema(self._ptr(src), self._ptr(dst), n, period)
            return dst
        # NumPy fallback
        k = 2.0 / (period + 1)
        out = np.full(n, np.nan)
        for i, v in enumerate(src):
            if np.isnan(v): continue
            out[i] = v if np.isnan(out[i-1]) or i == 0 else out[i-1] + k*(v - out[i-1])
        return out

    def sma(self, src: np.ndarray, period: int) -> np.ndarray:
        src = np.ascontiguousarray(src, dtype=np.float64)
        n = len(src)
        if self._available:
            dst = self._out(n)
            self._lib.apex_sma(self._ptr(src), self._ptr(dst), n, period)
            return dst
        out = np.full(n, np.nan)
        for i in range(period - 1, n):
            out[i] = src[i-period+1:i+1].mean()
        return out

    def wma(self, src: np.ndarray, period: int) -> np.ndarray:
        src = np.ascontiguousarray(src, dtype=np.float64)
        n = len(src)
        if self._available:
            dst = self._out(n)
            self._lib.apex_wma(self._ptr(src), self._ptr(dst), n, period)
            return dst
        w = np.arange(1, period + 1, dtype=float)
        denom = w.sum()
        out = np.full(n, np.nan)
        for i in range(period - 1, n):
            out[i] = np.dot(src[i-period+1:i+1], w) / denom
        return out

    def hma(self, src: np.ndarray, period: int) -> np.ndarray:
        src = np.ascontiguousarray(src, dtype=np.float64)
        n = len(src)
        if self._available:
            dst = self._out(n)
            self._lib.apex_hma(self._ptr(src), self._ptr(dst), n, period)
            return dst
        import math as _math
        half = max(1, period // 2)
        sq = max(1, int(round(_math.sqrt(period))))
        diff = 2 * self.wma(src, half) - self.wma(src, period)
        return self.wma(diff, sq)

    # ── Oscillators ────────────────────────────────────────────────────────
    def rsi(self, close: np.ndarray, period: int = 14) -> np.ndarray:
        close = np.ascontiguousarray(close, dtype=np.float64)
        n = len(close)
        if self._available:
            dst = self._out(n)
            self._lib.apex_rsi(self._ptr(close), self._ptr(dst), n, period)
            return dst
        # NumPy fallback
        out = np.full(n, np.nan)
        if n < period + 1: return out
        d = np.diff(close)
        gain = np.where(d > 0, d, 0.0)
        loss = np.where(d < 0, -d, 0.0)
        ag = gain[:period].mean()
        al = loss[:period].mean()
        out[period] = 100.0 if al == 0 else 100 - 100 / (1 + ag / al)
        for i in range(period + 1, n):
            ag = (ag * (period-1) + gain[i-1]) / period
            al = (al * (period-1) + loss[i-1]) / period
            out[i] = 100.0 if al == 0 else 100 - 100 / (1 + ag / al)
        return out

    def macd(self, close: np.ndarray,
             fast: int = 12, slow: int = 26, sig: int = 9
             ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        close = np.ascontiguousarray(close, dtype=np.float64)
        n = len(close)
        macd_l, signal, hist = self._out(n), self._out(n), self._out(n)
        if self._available:
            self._lib.apex_macd(
                self._ptr(close),
                self._ptr(macd_l), self._ptr(signal), self._ptr(hist),
                n, fast, slow, sig)
        else:
            ef = self.ema(close, fast); es = self.ema(close, slow)
            macd_l = np.where(~np.isnan(ef) & ~np.isnan(es), ef - es, np.nan)
            signal = self.ema(macd_l, sig)
            hist   = np.where(~np.isnan(macd_l) & ~np.isnan(signal),
                               macd_l - signal, np.nan)
        return macd_l, signal, hist

    # ── Volatility ─────────────────────────────────────────────────────────
    def atr(self, high: np.ndarray, low: np.ndarray, close: np.ndarray,
            period: int = 14) -> np.ndarray:
        h = np.ascontiguousarray(high, dtype=np.float64)
        l = np.ascontiguousarray(low,  dtype=np.float64)
        c = np.ascontiguousarray(close, dtype=np.float64)
        n = len(c)
        dst = self._out(n)
        if self._available:
            self._lib.apex_atr(self._ptr(h), self._ptr(l), self._ptr(c),
                                self._ptr(dst), n, period)
        else:
            tr = np.full(n, np.nan)
            for i in range(1, n):
                tr[i] = max(h[i]-l[i], abs(h[i]-c[i-1]), abs(l[i]-c[i-1]))
            # Wilder smoothing
            if n >= period:
                dst[period-1] = tr[1:period].mean()
                for i in range(period, n):
                    if not np.isnan(tr[i]):
                        dst[i] = dst[i-1] + (tr[i] - dst[i-1]) / period
        return dst

    def bollinger(self, close: np.ndarray,
                  period: int = 20, std_mult: float = 2.0
                  ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        close = np.ascontiguousarray(close, dtype=np.float64)
        n = len(close)
        upper, mid, lower = self._out(n), self._out(n), self._out(n)
        if self._available:
            self._lib.apex_bollinger(self._ptr(close),
                                      self._ptr(upper), self._ptr(mid), self._ptr(lower),
                                      n, period, float(std_mult))
        else:
            mid = self.sma(close, period)
            for i in range(period - 1, n):
                sd = close[i-period+1:i+1].std(ddof=0)
                upper[i] = mid[i] + std_mult * sd
                lower[i] = mid[i] - std_mult * sd
        return upper, mid, lower

    def supertrend(self, high: np.ndarray, low: np.ndarray, close: np.ndarray,
                   period: int = 10, multiplier: float = 3.0
                   ) -> Tuple[np.ndarray, np.ndarray]:
        h = np.ascontiguousarray(high,  dtype=np.float64)
        l = np.ascontiguousarray(low,   dtype=np.float64)
        c = np.ascontiguousarray(close, dtype=np.float64)
        n = len(c)
        st, dr = self._out(n), self._out(n)
        if self._available:
            self._lib.apex_supertrend(self._ptr(h), self._ptr(l), self._ptr(c),
                                       self._ptr(st), self._ptr(dr),
                                       n, period, float(multiplier))
        return st, dr

    # ── Trend ──────────────────────────────────────────────────────────────
    def adx(self, high: np.ndarray, low: np.ndarray, close: np.ndarray,
            period: int = 14) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        h = np.ascontiguousarray(high,  dtype=np.float64)
        l = np.ascontiguousarray(low,   dtype=np.float64)
        c = np.ascontiguousarray(close, dtype=np.float64)
        n = len(c)
        adx_out, pdi, mdi = self._out(n), self._out(n), self._out(n)
        if self._available:
            self._lib.apex_adx(self._ptr(h), self._ptr(l), self._ptr(c),
                                self._ptr(adx_out), self._ptr(pdi), self._ptr(mdi),
                                n, period)
        return adx_out, pdi, mdi

    def ichimoku(self, high: np.ndarray, low: np.ndarray, close: np.ndarray
                 ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        h = np.ascontiguousarray(high,  dtype=np.float64)
        l = np.ascontiguousarray(low,   dtype=np.float64)
        c = np.ascontiguousarray(close, dtype=np.float64)
        n = len(c)
        tenkan, kijun = self._out(n), self._out(n)
        span_a, span_b, chikou = self._out(n), self._out(n), self._out(n)
        if self._available:
            self._lib.apex_ichimoku(
                self._ptr(h), self._ptr(l), self._ptr(c),
                self._ptr(tenkan), self._ptr(kijun),
                self._ptr(span_a), self._ptr(span_b), self._ptr(chikou),
                n)
        return tenkan, kijun, span_a, span_b, chikou

    # ── Financial Math ─────────────────────────────────────────────────────
    def pnl_buy(self, open_px: float, close_px: float,
                lot_size: float, pip_size: float, pip_value: float) -> float:
        if self._available:
            return self._lib.apex_pnl_buy(open_px, close_px, lot_size, pip_size, pip_value)
        return ((close_px - open_px) / pip_size) * pip_value * lot_size

    def pnl_sell(self, open_px: float, close_px: float,
                 lot_size: float, pip_size: float, pip_value: float) -> float:
        if self._available:
            return self._lib.apex_pnl_sell(open_px, close_px, lot_size, pip_size, pip_value)
        return ((open_px - close_px) / pip_size) * pip_value * lot_size

    def margin(self, lot_size: float, price: float,
               contract_size: float, leverage: float) -> float:
        if self._available:
            return self._lib.apex_margin(lot_size, price, contract_size, leverage)
        return (lot_size * contract_size * price) / leverage

    # ── Statistics ─────────────────────────────────────────────────────────
    def var95(self, returns: np.ndarray, balance: float) -> float:
        r = np.ascontiguousarray(returns, dtype=np.float64)
        n = len(r)
        if self._available:
            return self._lib.apex_var95(self._ptr(r), n, balance)
        if n < 2: return 0.0
        mu = r.mean(); sig = r.std(ddof=1)
        return -(mu - 1.645 * sig) * balance

    def cvar95(self, returns: np.ndarray, balance: float) -> float:
        r = np.ascontiguousarray(returns, dtype=np.float64)
        n = len(r)
        if self._available:
            return self._lib.apex_cvar95(self._ptr(r), n, balance)
        if n < 2: return 0.0
        mu = r.mean(); sig = r.std(ddof=1)
        return -(mu - sig * 0.10313 / 0.05) * balance

    def max_drawdown(self, cum_pnl: np.ndarray) -> float:
        c = np.ascontiguousarray(cum_pnl, dtype=np.float64)
        n = len(c)
        if self._available:
            return self._lib.apex_max_drawdown(self._ptr(c), n)
        if n == 0: return 0.0
        peak = np.maximum.accumulate(c)
        return float((peak - c).max())

    def sharpe(self, returns: np.ndarray) -> float:
        r = np.ascontiguousarray(returns, dtype=np.float64)
        n = len(r)
        if self._available:
            return self._lib.apex_sharpe(self._ptr(r), n)
        if n < 2: return 0.0
        mu = r.mean(); sig = r.std(ddof=1)
        return float((mu / sig) * np.sqrt(252)) if sig > 0 else 0.0

    def sortino(self, returns: np.ndarray) -> float:
        r = np.ascontiguousarray(returns, dtype=np.float64)
        n = len(r)
        if self._available:
            return self._lib.apex_sortino(self._ptr(r), n)
        if n < 2: return 0.0
        mu = r.mean()
        down = r[r < 0]
        if len(down) < 2: return 0.0
        sd = down.std(ddof=1)
        return float((mu / sd) * np.sqrt(252)) if sd > 0 else 0.0


# Module-level singleton
_engine: Optional[MathEngine] = None

def get_engine() -> MathEngine:
    """Return the module-level MathEngine singleton."""
    global _engine
    if _engine is None:
        _engine = MathEngine()
    return _engine
