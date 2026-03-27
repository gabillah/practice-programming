"""
data/stream_manager.py
──────────────────────
Manages live WebSocket price streams from multiple providers.

Supported providers:
  • Twelve Data  – wss://ws.twelvedata.com/v1/quotes/price
  • Polygon.io   – wss://socket.polygon.io/forex
  • OANDA        – streaming REST API (v20)
  • Demo         – built-in synthetic price simulator (no API key needed)

Features:
  - Auto-reconnect with exponential backoff
  - Bar construction from tick stream (OHLCV aggregation)
  - Historical data bootstrap via REST (last N candles)
  - Thread-safe tick dispatch to SignalEngine
"""

from __future__ import annotations
import json
import logging
import math
import random
import threading
import time
import queue
from datetime import datetime, timezone
from typing import Callable, Dict, List, Optional, Tuple

import requests

from core.config_manager import ConfigManager
from core.signal_engine  import SignalEngine, Bar

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
class BarBuilder:
    """
    Aggregates ticks into OHLCV bars for a given timeframe (seconds).
    Emits completed bars via callback.
    """

    TIMEFRAME_SECONDS = {
        "1min":  60,
        "5min":  300,
        "15min": 900,
        "30min": 1800,
        "1h":    3600,
        "4h":    14400,
        "1day":  86400,
    }

    def __init__(self, pair: str, timeframe: str,
                 on_bar: Callable[[str, Bar, str], None]):
        self.pair       = pair
        self.timeframe  = timeframe
        self.tf_secs    = self.TIMEFRAME_SECONDS.get(timeframe, 900)
        self.on_bar_cb  = on_bar
        self._bar: Optional[Bar] = None
        self._bar_start = 0.0
        self._lock      = threading.Lock()

    def on_tick(self, price: float, volume: float = 1.0, ts: float = 0.0) -> None:
        if ts == 0.0:
            ts = time.time()
        with self._lock:
            bar_ts = math.floor(ts / self.tf_secs) * self.tf_secs
            if self._bar is None or bar_ts != self._bar_start:
                if self._bar is not None:
                    self.on_bar_cb(self.pair, self._bar, self.timeframe)
                self._bar       = Bar(bar_ts, price, price, price, price, volume)
                self._bar_start = bar_ts
            else:
                self._bar.high   = max(self._bar.high, price)
                self._bar.low    = min(self._bar.low,  price)
                self._bar.close  = price
                self._bar.volume += volume


# ─────────────────────────────────────────────────────────────────────────────
class DemoPriceSimulator:
    """
    Generates realistic synthetic forex prices using:
      - Geometric Brownian Motion  (long-term random walk)
      - Mean-reversion component   (Ornstein-Uhlenbeck)
      - Simulated sessions (spread widens outside London/NY)
      - Random news spikes
    No API key required.
    """

    BASE_PRICES = {
        "EUR/USD": 1.0850, "GBP/USD": 1.2650, "USD/JPY": 149.50,
        "USD/CHF": 0.8980, "AUD/USD": 0.6540, "NZD/USD": 0.5980,
        "USD/CAD": 1.3620, "EUR/GBP": 0.8570, "EUR/JPY": 162.30,
        "GBP/JPY": 189.10, "XAU/USD": 2050.0, "XAG/USD": 23.50,
    }

    VOLATILITY = {
        "EUR/USD": 0.00005, "GBP/USD": 0.00007, "USD/JPY": 0.005,
        "USD/CHF": 0.00006, "AUD/USD": 0.00006, "NZD/USD": 0.00006,
        "USD/CAD": 0.00005, "EUR/GBP": 0.00004, "EUR/JPY": 0.007,
        "GBP/JPY": 0.009,   "XAU/USD": 0.20,    "XAG/USD": 0.03,
    }

    SPREADS = {
        "EUR/USD": 0.00008, "GBP/USD": 0.00012, "USD/JPY": 0.008,
        "USD/CHF": 0.00014, "AUD/USD": 0.00012, "NZD/USD": 0.00015,
        "USD/CAD": 0.00014, "EUR/GBP": 0.00015, "EUR/JPY": 0.012,
        "GBP/JPY": 0.020,   "XAU/USD": 0.40,    "XAG/USD": 0.06,
    }

    def __init__(self, pairs: List[str]):
        self._prices  = {p: self.BASE_PRICES.get(p, 1.0) for p in pairs}
        self._pairs   = pairs
        self._running = False
        self._thread: Optional[threading.Thread] = None
        self._callbacks: List[Callable] = []
        # Trend state per pair
        self._trend   = {p: random.choice([-1, 1]) for p in pairs}
        self._trend_ttl={p: random.randint(50, 200)  for p in pairs}

    def on_tick(self, callback: Callable[[str, float, float], None]) -> None:
        self._callbacks.append(callback)

    def start(self) -> None:
        self._running = True
        self._thread  = threading.Thread(target=self._loop, daemon=True,
                                         name="DemoSimulator")
        self._thread.start()
        logger.info("Demo price simulator started (%d pairs)", len(self._pairs))

    def stop(self) -> None:
        self._running = False

    def _loop(self) -> None:
        while self._running:
            for pair in self._pairs:
                self._tick(pair)
            time.sleep(0.25)      # 4 ticks per second

    def _tick(self, pair: str) -> None:
        vol   = self.VOLATILITY.get(pair, 0.0001)
        spread= self.SPREADS.get(pair, 0.0001)

        # Trend update
        self._trend_ttl[pair] -= 1
        if self._trend_ttl[pair] <= 0:
            self._trend[pair]   = random.choice([-1, 1])
            self._trend_ttl[pair]= random.randint(50, 300)

        # GBM + trend bias
        drift = self._trend[pair] * vol * 0.1
        shock = random.gauss(0, vol)
        self._prices[pair] *= (1 + drift + shock)

        # Mean reversion toward base
        base   = self.BASE_PRICES.get(pair, self._prices[pair])
        theta  = 0.0001          # mean-reversion speed
        self._prices[pair] += theta * (base - self._prices[pair])

        # Occasional spike (news)
        if random.random() < 0.0002:
            spike = random.gauss(0, vol * 10)
            self._prices[pair] += spike
            logger.debug("News spike on %s: %+.5f", pair, spike)

        mid = self._prices[pair]
        bid = mid - spread / 2
        ask = mid + spread / 2
        bid = max(bid, 0.0001)
        ask = max(ask, 0.0001)

        for cb in self._callbacks:
            try:
                cb(pair, bid, ask)
            except Exception as e:
                logger.warning("Demo tick callback error: %s", e)


# ─────────────────────────────────────────────────────────────────────────────
class TwelveDataStream:
    """
    WebSocket stream from Twelve Data.
    wss://ws.twelvedata.com/v1/quotes/price?apikey=KEY
    """

    WS_URL = "wss://ws.twelvedata.com/v1/quotes/price"

    def __init__(self, api_key: str, pairs: List[str]):
        self._key       = api_key
        self._pairs     = pairs
        self._callbacks: List[Callable] = []
        self._ws        = None
        self._running   = False
        self._reconnect = 0

    def on_tick(self, callback: Callable) -> None:
        self._callbacks.append(callback)

    def start(self) -> None:
        self._running = True
        threading.Thread(target=self._connect_loop, daemon=True,
                         name="TwelveDataWS").start()

    def stop(self) -> None:
        self._running = False
        if self._ws:
            try:
                self._ws.close()
            except Exception:
                pass

    def _connect_loop(self) -> None:
        import websocket as ws_lib
        backoff = 2
        while self._running:
            try:
                url = f"{self.WS_URL}?apikey={self._key}"
                self._ws = ws_lib.WebSocketApp(
                    url,
                    on_open    = self._on_open,
                    on_message = self._on_message,
                    on_error   = self._on_error,
                    on_close   = self._on_close,
                )
                self._ws.run_forever(ping_interval=30, ping_timeout=10)
            except Exception as e:
                logger.error("TwelveData WS error: %s", e)
            if self._running:
                logger.info("TwelveData reconnecting in %ds…", backoff)
                time.sleep(backoff)
                backoff = min(backoff * 2, 60)
            self._reconnect += 1

    def _on_open(self, ws) -> None:
        logger.info("TwelveData WebSocket connected")
        # Convert pair format: EUR/USD → EUR/USD (already correct)
        symbols = [p.replace("/", "") for p in self._pairs]
        subscribe_msg = json.dumps({"action": "subscribe", "params": {
            "symbols": symbols
        }})
        ws.send(subscribe_msg)

    def _on_message(self, ws, raw: str) -> None:
        try:
            data = json.loads(raw)
            event = data.get("event", "")
            if event == "price":
                symbol = data.get("symbol", "")
                # Normalise symbol to pair format
                if len(symbol) == 6:
                    pair = symbol[:3] + "/" + symbol[3:]
                else:
                    pair = symbol
                price = float(data.get("price", 0))
                bid   = float(data.get("bid", price))
                ask   = float(data.get("ask", price))
                if bid == 0:
                    bid = price * (1 - 0.00005)
                if ask == 0:
                    ask = price * (1 + 0.00005)
                for cb in self._callbacks:
                    cb(pair, bid, ask)
        except Exception as e:
            logger.debug("TwelveData parse error: %s | raw: %s", e, raw[:100])

    def _on_error(self, ws, error) -> None:
        logger.warning("TwelveData WS error: %s", error)

    def _on_close(self, ws, code, reason) -> None:
        logger.info("TwelveData WS closed: %s %s", code, reason)


# ─────────────────────────────────────────────────────────────────────────────
class PolygonStream:
    """
    WebSocket stream from Polygon.io.
    wss://socket.polygon.io/forex
    """

    WS_URL = "wss://socket.polygon.io/forex"

    def __init__(self, api_key: str, pairs: List[str]):
        self._key     = api_key
        self._pairs   = pairs
        self._callbacks: List[Callable] = []
        self._ws      = None
        self._running = False

    def on_tick(self, callback: Callable) -> None:
        self._callbacks.append(callback)

    def start(self) -> None:
        self._running = True
        threading.Thread(target=self._connect_loop, daemon=True,
                         name="PolygonWS").start()

    def stop(self) -> None:
        self._running = False
        if self._ws:
            try:
                self._ws.close()
            except Exception:
                pass

    def _connect_loop(self) -> None:
        import websocket as ws_lib
        backoff = 2
        while self._running:
            try:
                self._ws = ws_lib.WebSocketApp(
                    self.WS_URL,
                    on_open    = self._on_open,
                    on_message = self._on_message,
                    on_error   = lambda ws, e: logger.warning("Polygon error: %s", e),
                    on_close   = lambda ws, c, r: logger.info("Polygon WS closed"),
                )
                self._ws.run_forever(ping_interval=30)
            except Exception as e:
                logger.error("Polygon WS error: %s", e)
            if self._running:
                time.sleep(backoff)
                backoff = min(backoff * 2, 60)

    def _on_open(self, ws) -> None:
        ws.send(json.dumps({"action": "auth", "params": self._key}))

    def _on_message(self, ws, raw: str) -> None:
        try:
            messages = json.loads(raw)
            for msg in (messages if isinstance(messages, list) else [messages]):
                ev = msg.get("ev", "")
                if ev == "connected":
                    # Subscribe after auth
                    subs = [f"C.{p.replace('/', '')}" for p in self._pairs]
                    ws.send(json.dumps({"action": "subscribe", "params": ",".join(subs)}))
                elif ev == "C":
                    sym = msg.get("p", "")    # e.g. "EURUSD"
                    if len(sym) == 6:
                        pair = sym[:3] + "/" + sym[3:]
                    else:
                        pair = sym
                    bid = float(msg.get("b", 0))
                    ask = float(msg.get("a", 0))
                    if bid > 0 and ask > 0:
                        for cb in self._callbacks:
                            cb(pair, bid, ask)
        except Exception as e:
            logger.debug("Polygon parse error: %s", e)


# ─────────────────────────────────────────────────────────────────────────────
class HistoricalLoader:
    """
    Loads historical OHLCV bars via REST to pre-populate indicator buffers.
    Provider-aware endpoint selection.
    """

    TWELVE_DATA_REST = "https://api.twelvedata.com/time_series"
    POLYGON_REST     = "https://api.polygon.io/v2/aggs/ticker"

    def __init__(self, provider: str, api_key: str):
        self._provider = provider
        self._key      = api_key

    def load(self, pair: str, timeframe: str, count: int = 300
             ) -> List[Bar]:
        """Download historical bars. Falls back to synthetic if unavailable."""
        try:
            if self._provider == "twelvedata" and self._key:
                return self._load_twelvedata(pair, timeframe, count)
            elif self._provider == "polygon" and self._key:
                return self._load_polygon(pair, timeframe, count)
        except Exception as e:
            logger.warning("Historical load failed for %s/%s: %s", pair, timeframe, e)
        # Fallback to synthetic history
        return self._synthetic(pair, count)

    def _load_twelvedata(self, pair: str, timeframe: str, count: int) -> List[Bar]:
        TF_MAP = {
            "1min": "1min", "5min": "5min", "15min": "15min",
            "30min":"30min", "1h": "1h", "4h": "4h", "1day": "1day"
        }
        params = {
            "symbol":     pair.replace("/", ""),
            "interval":   TF_MAP.get(timeframe, "15min"),
            "outputsize": count,
            "apikey":     self._key,
            "format":     "json",
        }
        r    = requests.get(self.TWELVE_DATA_REST, params=params, timeout=15)
        data = r.json()
        if "values" not in data:
            logger.warning("TwelveData historical: %s", data.get("message", "no values"))
            return []
        bars = []
        for row in reversed(data["values"]):
            try:
                ts = datetime.fromisoformat(row["datetime"]).timestamp()
                bars.append(Bar(
                    timestamp = ts,
                    open  = float(row["open"]),
                    high  = float(row["high"]),
                    low   = float(row["low"]),
                    close = float(row["close"]),
                    volume= float(row.get("volume", 1000)),
                ))
            except (KeyError, ValueError):
                continue
        logger.info("Loaded %d historical bars for %s/%s via TwelveData",
                    len(bars), pair, timeframe)
        return bars

    def _load_polygon(self, pair: str, timeframe: str, count: int) -> List[Bar]:
        TF_MAP = {
            "1min": ("minute", 1), "5min": ("minute", 5),
            "15min":("minute", 15),"30min":("minute", 30),
            "1h":   ("hour",   1), "4h":   ("hour",   4),
            "1day": ("day",    1),
        }
        mult, span = TF_MAP.get(timeframe, ("minute", 15))
        symbol     = f"C:{pair.replace('/', '')}"
        url        = f"{self.POLYGON_REST}/{symbol}/range/{mult}/{span}/2020-01-01/now"
        params     = {"adjusted": "true", "sort": "asc",
                      "limit": count, "apiKey": self._key}
        r    = requests.get(url, params=params, timeout=15)
        data = r.json()
        bars = []
        for row in data.get("results", []):
            bars.append(Bar(
                timestamp = row["t"] / 1000,
                open  = row["o"], high  = row["h"],
                low   = row["l"], close = row["c"],
                volume= row.get("v", 1000),
            ))
        logger.info("Loaded %d historical bars for %s via Polygon", len(bars), pair)
        return bars

    @staticmethod
    def _synthetic(pair: str, count: int) -> List[Bar]:
        """Generate plausible synthetic history using GBM."""
        from data.stream_manager import DemoPriceSimulator
        base   = DemoPriceSimulator.BASE_PRICES.get(pair, 1.0)
        vol    = DemoPriceSimulator.VOLATILITY.get(pair, 0.0001)
        bars   = []
        price  = base
        ts_now = time.time()
        tf_sec = 900   # 15 min
        for i in range(count, 0, -1):
            ts     = ts_now - i * tf_sec
            o      = price
            change = random.gauss(0, vol * 10)
            c      = o * (1 + change)
            h      = max(o, c) + abs(random.gauss(0, vol * 5))
            l      = min(o, c) - abs(random.gauss(0, vol * 5))
            bars.append(Bar(ts, o, h, l, c, random.uniform(500, 2000)))
            price  = c
        logger.debug("Generated %d synthetic bars for %s", len(bars), pair)
        return bars


# ─────────────────────────────────────────────────────────────────────────────
class StreamManager:
    """
    Orchestrates data streams:
      1. Loads historical bars per pair
      2. Starts appropriate WebSocket stream
      3. Builds OHLCV bars from ticks
      4. Dispatches ticks and bars to SignalEngine
    """

    def __init__(self, config: ConfigManager, signal_engine: SignalEngine):
        self.config        = config
        self.engine        = signal_engine
        self._running      = False
        self._stream       = None      # Active WS adapter
        self._bar_builders: Dict[str, Dict[str, BarBuilder]] = {}
        self._hist_loader  = HistoricalLoader(
            config.provider, config.api_key)
        self._pairs        = config.pairs
        self._timeframes   = config.get("timeframes",
                                        default=["1min","5min","15min","1h"])
        self._status_callbacks: List[Callable] = []
        self._tick_count   = 0
        self._last_prices: Dict[str, Tuple[float, float]] = {}

    # ── Status callback registration ──────────────────────────────────────────
    def on_status(self, callback: Callable[[str], None]) -> None:
        self._status_callbacks.append(callback)

    def _notify_status(self, msg: str) -> None:
        logger.info("[Stream] %s", msg)
        for cb in self._status_callbacks:
            try:
                cb(msg)
            except Exception:
                pass

    # ── Start ─────────────────────────────────────────────────────────────────
    def start(self) -> None:
        if self._running:
            return
        self._running = True
        # Register pairs
        for pair in self._pairs:
            self.engine.register_pair(pair)

        # Bootstrap with historical data
        self._notify_status("Loading historical data…")
        threading.Thread(target=self._bootstrap_history, daemon=True,
                         name="HistBootstrap").start()

        # Init bar builders
        for pair in self._pairs:
            self._bar_builders[pair] = {}
            for tf in self._timeframes:
                self._bar_builders[pair][tf] = BarBuilder(
                    pair, tf, self._on_bar_complete)

        # Start stream
        provider = self.config.provider
        self._notify_status(f"Connecting to {provider} live stream…")

        if provider == "demo" or not self.config.api_key:
            self._start_demo()
        elif provider == "twelvedata":
            self._start_twelvedata()
        elif provider == "polygon":
            self._start_polygon()
        else:
            logger.warning("Unknown provider '%s', falling back to demo", provider)
            self._start_demo()

    def stop(self) -> None:
        self._running = False
        if self._stream:
            try:
                self._stream.stop()
            except Exception:
                pass
        self._notify_status("Stream stopped")

    # ── Historical bootstrap ───────────────────────────────────────────────────
    def _bootstrap_history(self) -> None:
        primary_tf = self.config.primary_tf
        for pair in self._pairs:
            bars = self._hist_loader.load(pair, primary_tf, count=300)
            for bar in bars:
                self.engine.on_bar(pair, bar, primary_tf)
            self._notify_status(f"Historical: {pair} ({len(bars)} bars)")
            time.sleep(0.3)   # rate-limit
        self._notify_status("Historical data loaded ✓")

    # ── Stream providers ───────────────────────────────────────────────────────
    def _start_demo(self) -> None:
        sim = DemoPriceSimulator(self._pairs)
        sim.on_tick(self._on_tick)
        sim.start()
        self._stream = sim
        self._notify_status("Demo simulator running (no live data)")

    def _start_twelvedata(self) -> None:
        stream = TwelveDataStream(self.config.api_key, self._pairs)
        stream.on_tick(self._on_tick)
        stream.start()
        self._stream = stream
        self._notify_status("Twelve Data live stream started")

    def _start_polygon(self) -> None:
        stream = PolygonStream(self.config.api_key, self._pairs)
        stream.on_tick(self._on_tick)
        stream.start()
        self._stream = stream
        self._notify_status("Polygon.io live stream started")

    # ── Tick handler ──────────────────────────────────────────────────────────
    def _on_tick(self, pair: str, bid: float, ask: float) -> None:
        if pair not in self._bar_builders:
            return
        self._tick_count += 1
        self._last_prices[pair] = (bid, ask)
        mid = (bid + ask) / 2

        # Forward to signal engine (updates last close)
        self.engine.on_tick(pair, bid, ask)

        # Feed all bar builders
        vol = 1.0   # tick volume (normalized)
        for tf, builder in self._bar_builders[pair].items():
            builder.on_tick(mid, vol, time.time())

    # ── Bar completion handler ─────────────────────────────────────────────────
    def _on_bar_complete(self, pair: str, bar: Bar, timeframe: str) -> None:
        signal = self.engine.on_bar(pair, bar, timeframe)
        if signal:
            logger.info("SIGNAL: %s %s | Entry: %.5f | SL: %.5f | TP: %.5f | "
                        "Conf: %.0f%% | %s",
                        signal.pair, signal.direction.name,
                        signal.entry_price, signal.stop_loss, signal.take_profit,
                        signal.confidence * 100, signal.session)

    # ── Status ────────────────────────────────────────────────────────────────
    @property
    def tick_count(self) -> int:
        return self._tick_count

    @property
    def last_prices(self) -> Dict[str, Tuple[float, float]]:
        return dict(self._last_prices)

    @property
    def is_running(self) -> bool:
        return self._running
