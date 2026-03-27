"""
data/feed.py — Live price feed.
Providers: demo (GBM+OU simulator), twelvedata, polygon, oanda.
"""
from __future__ import annotations
import json, logging, math, random, threading, time
from typing import Callable, Dict, List, Optional

logger = logging.getLogger(__name__)

BASE_PRICES = {
    "EUR/USD":1.0850,"GBP/USD":1.2650,"USD/JPY":149.50,"USD/CHF":0.8980,
    "AUD/USD":0.6540,"NZD/USD":0.5980,"USD/CAD":1.3620,"EUR/GBP":0.8570,
    "EUR/JPY":162.30,"GBP/JPY":189.10,"XAU/USD":2050.0,"XAG/USD":23.50,
}
VOLATILITY = {
    "EUR/USD":0.00005,"GBP/USD":0.00007,"USD/JPY":0.005,"USD/CHF":0.00006,
    "AUD/USD":0.00006,"NZD/USD":0.00006,"USD/CAD":0.00005,"EUR/GBP":0.00004,
    "EUR/JPY":0.007,"GBP/JPY":0.009,"XAU/USD":0.20,"XAG/USD":0.03,
}
SPREADS = {
    "EUR/USD":0.00008,"GBP/USD":0.00012,"USD/JPY":0.008,"USD/CHF":0.00014,
    "AUD/USD":0.00012,"NZD/USD":0.00015,"USD/CAD":0.00014,"EUR/GBP":0.00015,
    "EUR/JPY":0.012,"GBP/JPY":0.020,"XAU/USD":0.40,"XAG/USD":0.06,
}


class PriceFeed:
    def __init__(self, config):
        self.config     = config
        self._tick_cbs: List[Callable] = []
        self._bar_cbs:  List[Callable] = []
        self._running   = False
        provider = config.provider
        if provider == "demo":
            self._impl = _DemoSimulator(config.pairs)
        elif provider == "twelvedata":
            self._impl = _TwelveDataStream(config)
        elif provider == "polygon":
            self._impl = _PolygonStream(config)
        elif provider == "oanda":
            self._impl = _OandaStream(config)
        else:
            logger.warning("Unknown provider '%s', using demo", provider)
            self._impl = _DemoSimulator(config.pairs)
        self._impl.on_tick(self._dispatch_tick)

    def on_tick(self, cb: Callable) -> None:
        self._tick_cbs.append(cb)

    def on_bar(self, cb: Callable) -> None:
        self._bar_cbs.append(cb)

    def _dispatch_tick(self, pair: str, bid: float, ask: float) -> None:
        for cb in self._tick_cbs:
            try: cb(pair, bid, ask)
            except Exception as e: logger.debug("tick cb error: %s", e)

    def start(self) -> None:
        self._running = True
        self._impl.start()
        logger.info("PriceFeed started [%s]", self.config.provider)

    def stop(self) -> None:
        self._running = False
        self._impl.stop()


# ── Demo simulator ─────────────────────────────────────────────────────────────
class _DemoSimulator:
    def __init__(self, pairs: List[str]):
        self._pairs    = pairs
        self._prices   = {p: BASE_PRICES.get(p,1.0) for p in pairs}
        self._trend    = {p: random.choice([-1,1]) for p in pairs}
        self._trend_ttl= {p: random.randint(50,300) for p in pairs}
        self._running  = False
        self._cbs:  List[Callable] = []
        self._thread: Optional[threading.Thread] = None

    def on_tick(self, cb): self._cbs.append(cb)

    def start(self):
        self._running = True
        self._thread  = threading.Thread(target=self._loop, daemon=True,
                                         name="DemoFeed")
        self._thread.start()
        logger.info("Demo simulator started (%d pairs)", len(self._pairs))

    def stop(self): self._running = False

    def _loop(self):
        while self._running:
            for pair in self._pairs:
                self._tick(pair)
            time.sleep(1.0)

    def _tick(self, pair: str):
        vol    = VOLATILITY.get(pair, 0.0001)
        spread = SPREADS.get(pair, 0.0001)
        # Trend update
        self._trend_ttl[pair] -= 1
        if self._trend_ttl[pair] <= 0:
            self._trend[pair]    = random.choice([-1,1])
            self._trend_ttl[pair]= random.randint(50,300)
        # GBM + OU mean reversion
        drift = self._trend[pair] * vol * 0.08
        shock = random.gauss(0, vol)
        self._prices[pair] *= (1 + drift + shock)
        base  = BASE_PRICES.get(pair, self._prices[pair])
        self._prices[pair] += 0.0001 * (base - self._prices[pair])
        # Occasional news spike
        if random.random() < 0.0003:
            self._prices[pair] += random.gauss(0, vol*8)
        mid = max(self._prices[pair], 0.0001)
        bid = max(mid - spread/2, 0.0001)
        ask = bid + spread
        for cb in self._cbs:
            try: cb(pair, bid, ask)
            except Exception: pass


# ── TwelveData WebSocket ───────────────────────────────────────────────────────
class _TwelveDataStream:
    def __init__(self, config):
        self.config   = config
        self._cbs:    List[Callable] = []
        self._running = False
        self._ws      = None

    def on_tick(self, cb): self._cbs.append(cb)

    def start(self):
        self._running = True
        t = threading.Thread(target=self._connect, daemon=True, name="TDStream")
        t.start()

    def stop(self):
        self._running = False
        if self._ws:
            try: self._ws.close()
            except Exception: pass

    def _connect(self):
        import websocket
        key   = self.config.api_key
        pairs = [p.replace("/","") for p in self.config.pairs
                 if "/" in p and "XAU" not in p and "XAG" not in p]
        url   = f"wss://ws.twelvedata.com/v1/quotes/price?apikey={key}"
        retries = 0
        while self._running:
            try:
                ws = websocket.WebSocketApp(url,
                    on_open   = lambda ws: self._subscribe(ws, pairs),
                    on_message= self._on_message,
                    on_error  = lambda ws,e: logger.warning("TD WS error: %s", e),
                    on_close  = lambda ws,c,m: logger.info("TD WS closed"))
                self._ws = ws
                ws.run_forever()
                retries += 1
            except Exception as e:
                logger.warning("TD connection error: %s", e)
            if self._running:
                delay = min(60, 5 * retries)
                logger.info("TD reconnect in %ds", delay)
                time.sleep(delay)

    def _subscribe(self, ws, pairs):
        ws.send(json.dumps({"action":"subscribe","params":{"symbols":",".join(pairs)}}))

    def _on_message(self, ws, raw):
        try:
            d = json.loads(raw)
            if d.get("event") == "price":
                sym   = d.get("symbol","")
                pair  = sym[:3]+"/"+sym[3:]
                price = float(d.get("price",0))
                if price > 0:
                    spread = SPREADS.get(pair, 0.0001)
                    bid = price - spread/2; ask = bid + spread
                    for cb in self._cbs:
                        try: cb(pair, bid, ask)
                        except Exception: pass
        except Exception as e:
            logger.debug("TD message parse error: %s", e)


# ── Polygon WebSocket ──────────────────────────────────────────────────────────
class _PolygonStream:
    def __init__(self, config):
        self.config   = config
        self._cbs:    List[Callable] = []
        self._running = False
        self._authed  = False

    def on_tick(self, cb): self._cbs.append(cb)

    def start(self):
        self._running = True
        t = threading.Thread(target=self._connect, daemon=True, name="PolyStream")
        t.start()

    def stop(self): self._running = False

    def _connect(self):
        import websocket
        url = "wss://socket.polygon.io/forex"
        retries = 0
        while self._running:
            try:
                ws = websocket.WebSocketApp(url,
                    on_message= self._on_message,
                    on_open   = lambda ws: logger.info("Polygon WS opened"),
                    on_error  = lambda ws,e: logger.warning("Poly error: %s",e))
                ws.run_forever()
                retries += 1
            except Exception as e:
                logger.warning("Polygon connect error: %s", e)
            if self._running:
                time.sleep(min(60, 5*retries))

    def _on_message(self, ws, raw):
        try:
            msgs = json.loads(raw)
            for m in (msgs if isinstance(msgs,list) else [msgs]):
                ev = m.get("ev","")
                if ev == "connected":
                    ws.send(json.dumps({"action":"auth","params":self.config.api_key}))
                elif ev == "auth_success":
                    self._authed = True
                    subs = ["C."+p.replace("/","") for p in self.config.pairs]
                    ws.send(json.dumps({"action":"subscribe","params":",".join(subs)}))
                elif ev == "C" and self._authed:
                    sym  = m.get("p","")
                    pair = sym[:3]+"/"+sym[3:]
                    bid  = float(m.get("b",0)); ask = float(m.get("a",0))
                    if bid>0 and ask>0:
                        for cb in self._cbs:
                            try: cb(pair,bid,ask)
                            except Exception: pass
        except Exception as e:
            logger.debug("Polygon parse: %s", e)


# ── OANDA streaming ────────────────────────────────────────────────────────────
class _OandaStream:
    def __init__(self, config):
        self.config   = config
        self._cbs:    List[Callable] = []
        self._running = False

    def on_tick(self, cb): self._cbs.append(cb)

    def start(self):
        self._running = True
        t = threading.Thread(target=self._stream, daemon=True, name="OandaStream")
        t.start()

    def stop(self): self._running = False

    def _stream(self):
        import requests as req
        key  = self.config.api_key
        base = self.config.get("data_source","websocket_url") or \
               "https://stream-fxtrade.oanda.com"
        instruments = ",".join(p.replace("/","_") for p in self.config.pairs)
        url  = f"{base}/v3/accounts/default/pricing/stream?instruments={instruments}"
        hdrs = {"Authorization":f"Bearer {key}","Accept-Encoding":"gzip, deflate"}
        retries = 0
        while self._running:
            try:
                with req.get(url, headers=hdrs, stream=True, timeout=30) as resp:
                    for line in resp.iter_lines():
                        if not self._running: break
                        if not line: continue
                        d = json.loads(line)
                        if d.get("type") == "PRICE":
                            pair = d["instrument"].replace("_","/")
                            bid  = float(d["bids"][0]["price"])
                            ask  = float(d["asks"][0]["price"])
                            for cb in self._cbs:
                                try: cb(pair,bid,ask)
                                except Exception: pass
                retries += 1
            except Exception as e:
                logger.warning("OANDA stream error: %s", e)
                retries += 1
            if self._running:
                time.sleep(min(60, 5*retries))
