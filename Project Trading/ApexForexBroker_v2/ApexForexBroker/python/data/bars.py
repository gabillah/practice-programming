"""data/bars.py — Tick → OHLCV bar aggregator for all timeframes."""
from __future__ import annotations
import logging, math, threading, time
from collections import defaultdict, deque
from dataclasses import dataclass
from typing import Callable, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

TF_SECS = {
    "1min":60,"5min":300,"15min":900,"30min":1800,
    "1h":3600,"4h":14400,"1day":86400,
}


@dataclass
class Bar:
    timestamp: float
    open:  float
    high:  float
    low:   float
    close: float
    volume: float = 1.0

    @property
    def body(self) -> float:   return abs(self.close - self.open)
    @property
    def range(self) -> float:  return self.high - self.low
    @property
    def bullish(self) -> bool: return self.close > self.open
    @property
    def upper_wick(self) -> float:
        return self.high - max(self.open, self.close)
    @property
    def lower_wick(self) -> float:
        return min(self.open, self.close) - self.low


class _TFBuffer:
    """Builds bars for one (pair, timeframe) combination."""
    MAX_BARS = 600

    def __init__(self, pair: str, tf: str,
                 on_bar: Callable[[str, Bar, str], None]):
        self.pair    = pair
        self.tf      = tf
        self.secs    = TF_SECS.get(tf, 900)
        self.on_bar  = on_bar
        self._bar: Optional[Bar] = None
        self._ts     = 0.0
        self._lock   = threading.Lock()
        self.bars:   deque = deque(maxlen=self.MAX_BARS)

    def tick(self, mid: float, vol: float = 1.0, ts: float = 0.0) -> None:
        if ts == 0.0: ts = time.time()
        with self._lock:
            bar_ts = math.floor(ts / self.secs) * self.secs
            if self._bar is None or bar_ts != self._ts:
                if self._bar is not None:
                    self.bars.append(self._bar)
                    self.on_bar(self.pair, self._bar, self.tf)
                self._bar = Bar(bar_ts, mid, mid, mid, mid, vol)
                self._ts  = bar_ts
            else:
                b = self._bar
                b.high   = max(b.high, mid)
                b.low    = min(b.low,  mid)
                b.close  = mid
                b.volume += vol

    def get_bars(self) -> List[Bar]:
        with self._lock:
            result = list(self.bars)
            if self._bar:
                result.append(self._bar)
            return result


class BarAggregator:
    """Maintains TF buffers for every (pair, timeframe) combination."""

    def __init__(self, config):
        self._tfs    = config.timeframes
        self._bar_cbs: List[Callable] = []
        self._buffers: Dict[Tuple[str,str], _TFBuffer] = {}
        self._lock   = threading.Lock()
        logger.debug("BarAggregator ready for %d timeframes", len(self._tfs))

    def on_bar(self, cb: Callable) -> None:
        self._bar_cbs.append(cb)

    def _get_buf(self, pair: str, tf: str) -> _TFBuffer:
        key = (pair, tf)
        with self._lock:
            if key not in self._buffers:
                self._buffers[key] = _TFBuffer(pair, tf, self._emit_bar)
            return self._buffers[key]

    def _emit_bar(self, pair: str, bar: Bar, tf: str) -> None:
        for cb in self._bar_cbs:
            try: cb(pair, bar, tf)
            except Exception as e: logger.debug("bar cb error: %s", e)

    def on_tick(self, pair: str, bid: float, ask: float) -> None:
        mid = (bid + ask) / 2
        ts  = time.time()
        for tf in self._tfs:
            self._get_buf(pair, tf).tick(mid, 1.0, ts)

    def get_bars(self, pair: str, tf: str) -> List[Bar]:
        return self._get_buf(pair, tf).get_bars()

    def to_arrays(self, pair: str, tf: str):
        """Returns (o, h, l, c, v) numpy arrays."""
        import numpy as np
        bars = self.get_bars(pair, tf)
        if not bars:
            e = np.array([], dtype=float)
            return e,e,e,e,e
        o = np.array([b.open   for b in bars], dtype=float)
        h = np.array([b.high   for b in bars], dtype=float)
        l = np.array([b.low    for b in bars], dtype=float)
        c = np.array([b.close  for b in bars], dtype=float)
        v = np.array([b.volume for b in bars], dtype=float)
        return o,h,l,c,v

    def timestamps(self, pair: str, tf: str) -> list:
        return [b.timestamp for b in self.get_bars(pair, tf)]
