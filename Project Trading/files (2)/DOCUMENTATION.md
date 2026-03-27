# Apex Forex Broker v2.0 — Complete User Documentation

**Self-Hosted Desktop Forex Trading Platform**  
Manual Trading · Automatic Signal System · Live Streamed Global Market Prices

| | |
|---|---|
| **Document version** | 2.0 |
| **Last updated** | 2026 |
| **Platform** | Windows 10 / 11 (also macOS, Linux) |
| **Python** | 3.10 or later |
| **License** | Personal use / self-hosted |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Requirements](#2-requirements)
3. [Installation — Running from Python source](#3-installation--running-from-python-source)
4. [Installation — Building the Windows EXE](#4-installation--building-the-windows-exe)
5. [Running with Live Market Data](#5-running-with-live-market-data)
6. [GUI Layout and Navigation](#6-gui-layout-and-navigation)
7. [Watchlist Panel](#7-watchlist-panel)
8. [Candlestick Chart](#8-candlestick-chart)
9. [Manual Trading — Market Orders](#9-manual-trading--market-orders)
10. [Manual Trading — Pending Orders](#10-manual-trading--pending-orders)
11. [Positions Manager](#11-positions-manager)
12. [Orders Manager](#12-orders-manager)
13. [Signal System — How It Works](#13-signal-system--how-it-works)
14. [Signal Indicator Reference (22 strategies)](#14-signal-indicator-reference-22-strategies)
15. [Signal Panel](#15-signal-panel)
16. [Risk Management System](#16-risk-management-system)
17. [Trade History and Analytics](#17-trade-history-and-analytics)
18. [Risk Dashboard](#18-risk-dashboard)
19. [Configuration Reference (config.json)](#19-configuration-reference-configjson)
20. [Data Provider Setup](#20-data-provider-setup)
21. [Financial Mathematics Reference](#21-financial-mathematics-reference)
22. [Troubleshooting](#22-troubleshooting)
23. [FAQ](#23-faq)
24. [File Structure](#file-structure)

---

## 1. Overview

Apex Forex Broker is a fully self-hosted desktop forex trading platform. You are the broker. All order execution, position management, margin calculation, and trade journaling happen locally on your machine. No third-party broker, no cloud dependency, no subscription.

**Key capabilities:**

- 12 forex pairs + Gold + Silver streamed live via WebSocket
- Full manual trading: market orders, limit orders, stop orders
- Modify stop-loss / take-profit on open positions
- Trailing stop system (ATR-based)
- Automatic signal system: 22 indicators fused into BUY/SELL signals
- Machine-learning filter (Random Forest / Gradient Boosting)
- Risk management: Kelly criterion, VaR, CVaR, Sharpe, Sortino, Calmar
- Margin monitoring with margin call and stop-out protection
- Full trade history with CSV export
- Performance analytics with equity curve, win-rate, profit factor
- 30+ technical indicators: EMA, MACD, RSI, Ichimoku, SuperTrend, BB...
- Light-mode professional GUI

---

## 2. Requirements

| | |
|---|---|
| **Operating System** | Windows 10 or 11 (64-bit recommended); macOS 11+ and Ubuntu 20.04+ also work |
| **Python** | 3.10, 3.11, or 3.12 |
| **RAM** | 512 MB minimum, 2 GB recommended |
| **Disk** | 500 MB (includes ML libraries) |
| **Internet** | Required only for live price data — Demo mode works fully offline |

**Python packages required** (all free, open-source):

| Package | Version | Purpose |
|---|---|---|
| numpy | ≥ 1.24 | Indicator calculations, array math |
| pandas | ≥ 2.0 | Data manipulation |
| matplotlib | ≥ 3.7 | Candlestick chart rendering |
| scipy | ≥ 1.10 | Statistics: VaR, normal distribution |
| scikit-learn | ≥ 1.3 | ML pattern filter (Random Forest) |
| websocket-client | ≥ 1.6 | Live WebSocket price feed |
| requests | ≥ 2.31 | OANDA REST streaming |
| Pillow | ≥ 9.5 | Image utilities |
| tkinter | built-in | GUI framework (included with Python) |

---

## 3. Installation — Running from Python source

**Step 1 — Install Python**

Download Python 3.11 from https://www.python.org/downloads/  
During installation, check **"Add Python to PATH"**

**Step 2 — Extract the project**

Unzip or copy the `ApexForexBroker` folder to any location, e.g. `C:\ApexForexBroker\`

**Step 3 — Open a terminal in the project folder**

On Windows: Right-click in the folder → *"Open in Terminal"*, or press `Win+R`, type `cmd`, then:
```
cd C:\ApexForexBroker
```

**Step 4 — Install dependencies**

```bash
pip install -r requirements.txt
```

If pip is not found:
```bash
python -m pip install -r requirements.txt
```

On systems with multiple Python versions:
```bash
py -3.11 -m pip install -r requirements.txt
```

**Step 5 — Run the application**

```bash
python main.py                # Normal launch
python main.py --debug        # With verbose debug logging
python main.py --headless     # No GUI — signals only to log
python main.py --reset-db     # Reset database and clear all trades
```

The application starts in **DEMO mode** by default. Demo mode uses a built-in price simulator — no API key needed. Prices update every second and the chart refreshes every 2 seconds.

---

## 4. Installation — Building the Windows EXE

To create a standalone `.exe` that runs without Python installed:

### Method A — Double-click build script (easiest)

1. Make sure Python 3.10+ is installed and on PATH
2. Double-click `build_exe.bat` in the project folder
3. Wait 2–5 minutes while PyInstaller packages everything
4. Find your EXE at: `dist\ApexForexBroker.exe`

### Method B — Manual build

```bash
pip install pyinstaller
pyinstaller --onefile --windowed --name "ApexForexBroker" ^
    --hidden-import sklearn.ensemble ^
    --hidden-import sklearn.calibration ^
    --hidden-import matplotlib.backends.backend_tkagg ^
    --hidden-import scipy.stats ^
    --collect-all sklearn ^
    main.py
```

Output: `dist\ApexForexBroker.exe` (typically 60–120 MB)

### Distributing the EXE

Copy `dist\ApexForexBroker.exe` to any Windows 10/11 machine. The exe is self-contained — no Python or packages needed on the target machine. On first run it creates `config.json` and `db\broker.db` in the same folder.

---

## 5. Running with Live Market Data

Apex Forex Broker supports four price feed modes.

### Mode 1: Demo (Default — No API key required)

The built-in simulator generates realistic synthetic prices using:
- **Geometric Brownian Motion (GBM)** — realistic random walk
- **Ornstein-Uhlenbeck mean reversion** — prices drift back to fair value
- **Trend injection** — random trending periods of 50–300 ticks
- **News spike simulation** — rare random spikes in volatility

Tick rate: 1 tick/second per pair (12 pairs = 12 ticks/sec total)

```json
"data_source": { "provider": "demo" }
```

Just run `python main.py` or double-click the EXE.

---

### Mode 2: Twelve Data (WebSocket — Free tier available)

Twelve Data provides real-time forex prices via WebSocket. Free plan: 8 symbols, 1 connection. Sign up at https://twelvedata.com/

```json
"data_source": {
  "provider": "twelvedata",
  "api_key":  "YOUR_API_KEY_HERE"
}
```

Or via environment variables:
```bat
set APEX_API_KEY=YOUR_API_KEY_HERE
set APEX_PROVIDER=twelvedata
python main.py
```

Reconnects automatically with exponential backoff (5s, 10s, 20s…)

---

### Mode 3: Polygon.io (WebSocket — Free tier available)

Free plan: end-of-day data only. Starter plan: real-time. Sign up at https://polygon.io/

```json
"data_source": {
  "provider": "polygon",
  "api_key":  "YOUR_API_KEY_HERE"
}
```

---

### Mode 4: OANDA (REST Streaming — Requires account)

OANDA is a major retail forex broker with an open REST API. Requires a demo or live account.

```json
"data_source": {
  "provider":      "oanda",
  "api_key":       "YOUR_OANDA_TOKEN",
  "websocket_url": "https://stream-fxtrade.oanda.com"
}
```

For OANDA practice accounts use: `https://stream-fxpractice.oanda.com`

---

### Keeping prices live while running locally

As long as the application is running, the price feed runs in a background thread receiving WebSocket data continuously. No web server, no cloud, no VPS required.

To change the refresh rate:
```json
"ui": { "refresh_ms": 1000 }   // 1 second — higher CPU usage
"ui": { "refresh_ms": 5000 }   // 5 seconds — lower CPU usage
```

---

## 6. GUI Layout and Navigation

```
┌──────────────────────────────────────────────────────────────────────┐
│  HEADER BAR  [Logo] [Balance] [Equity] [Free Margin] [Level] [P&L]  │
│              [Alert bar — margin call / stop out warnings]           │
├──────────────┬───────────────────────────────────────────────────────┤
│  WATCHLIST   │  TOOLBAR  [Pair] [Price] [TF buttons] [Overlays]     │
│              ├───────────────────────────────────────────────────────┤
│  EUR/USD     │                                                       │
│  GBP/USD     │  CANDLESTICK CHART  (OHLC bars + EMA + BB + ST)      │
│  USD/JPY     │  ─────────────────────────────────────────────────── │
│  USD/CHF     │  VOLUME BARS                                          │
│  AUD/USD     │  ─────────────────────────────────────────────────── │
│  NZD/USD     │  RSI (14)                                             │
│  USD/CAD     ├───────────────────────────────────────────────────────┤
│  EUR/GBP     │  TABS:                                                │
│  EUR/JPY     │  📈Trading │ 📂Positions │ 📋Orders │ ⚡Signals      │
│  GBP/JPY     │  📊History │ 📐Analytics │ 🛡Risk   │ 📄Log          │
│  XAU/USD     │                                                       │
│  XAG/USD     │  [Active tab content]                                 │
└──────────────┴───────────────────────────────────────────────────────┘
```

| Area | Description |
|---|---|
| **Header bar** | Live balance, equity, free margin, margin level, open P&L, UTC clock, active session |
| **Alert bar** | Red/orange banner for margin calls, stop-outs, and errors |
| **Watchlist** | Click any pair to select it and load its chart |
| **Chart** | Candlestick chart with selectable overlays and timeframe |
| **Tab bar** | All panels accessible as tabs at the bottom |

---

## 7. Watchlist Panel

The watchlist on the left side shows all 12 instruments:

```
EUR/USD  GBP/USD  USD/JPY  USD/CHF
AUD/USD  NZD/USD  USD/CAD  EUR/GBP
EUR/JPY  GBP/JPY  XAU/USD  XAG/USD
```

Each row displays: **Pair name | Change % | Bid price | Ask price**

**Colour coding:**

| Colour | Meaning |
|---|---|
| Green change | Price moved up since last refresh |
| Red change | Price moved down since last refresh |
| Blue highlight | Currently selected pair |
| Green flash | New BUY signal on this pair |
| Red flash | New SELL signal on this pair |

Click any row to select that pair and load its chart.

---

## 8. Candlestick Chart

The chart shows up to 150 candlesticks for the selected pair and timeframe.

**Timeframe buttons:** `1min` `5min` `15min` `1h` `4h` `1day`

**Overlay toggles:**

| Toggle | Description |
|---|---|
| **EMA** | EMA9 (blue), EMA21 (amber), EMA200 (purple dashed) |
| **BB** | Bollinger Bands (20, 2σ) with shaded fill between bands |
| **ST** | SuperTrend (10 period, 3.0× ATR) — green = bull line, red = bear line |
| **VWAP** | Volume-Weighted Average Price (orange dotted line) |

**Sub-charts:**
- **Volume bars** — green for bullish candle, red for bearish candle
- **RSI (14)** — with 70 (overbought) and 30 (oversold) reference lines, shaded fill in extreme zones

**Signal markers on the chart:**

| Marker | Meaning |
|---|---|
| Green triangle ▲ below candle | BUY signal at that price level |
| Red triangle ▼ above candle | SELL signal at that price level |
| Dotted line | Stop Loss level |
| Dashed line | Take Profit level |

**Live candle behaviour:** The rightmost candle updates its close price every second as new ticks arrive. Its body grows or shrinks in real time. When the timeframe period ends, the bar is finalised and a new candle opens.

---

## 9. Manual Trading — Market Orders

Go to the **📈 Trading** tab. The left column is the Market Order panel.

**Fields:**

| Field | Description |
|---|---|
| Instrument | Select the forex pair from the dropdown |
| Bid / Ask | Live current prices — updates every second |
| Lot Size | Trade size in lots. Min: 0.01, Step: 0.01 |
| Stop Loss | Stop-loss price level. Enter `0` for no SL |
| Take Profit | Take-profit price level. Enter `0` for no TP |
| Comment | Optional text label for this trade |
| Margin req. | Calculated margin requirement (shown live) |

Click **▲ BUY** to open a long position at current ASK + slippage.  
Click **▼ SELL** to open a short position at current BID − slippage.

**What happens on execution:**
1. Pre-trade checks: lot size, max positions, margin level, daily loss limit
2. Slippage applied: 1 pip by default (configurable)
3. Margin requirement calculated and checked against free margin
4. Commission deducted: $7.00 per standard lot (configurable)
5. Position opened and stored in the database
6. Entry appears in the Positions tab immediately
7. Confirmation message appears in the Log tab

**Lot size reference:**

| Size | Value per pip (major pairs) |
|---|---|
| 0.01 lots (1 micro lot) | $0.10 / pip |
| 0.10 lots (1 mini lot) | $1.00 / pip |
| 1.00 lots (1 standard lot) | $10.00 / pip |

---

## 10. Manual Trading — Pending Orders

The middle column of the Trading tab handles pending orders.

**Order types:**

| Type | Description |
|---|---|
| `BUY_LIMIT` | Buy when price *falls* to your price (must be below current ask) |
| `SELL_LIMIT` | Sell when price *rises* to your price (must be above current bid) |
| `BUY_STOP` | Buy when price *rises* to your price (must be above current ask) |
| `SELL_STOP` | Sell when price *falls* to your price (must be below current bid) |

**Fields:** Instrument, Order Type, Lot Size, Price (trigger), Stop Loss, Take Profit, Expire (seconds — `0` = GTC, never expires)

The system monitors pending orders every second. When the price reaches the trigger level, the order executes automatically. Expired orders are cancelled automatically.

---

## 11. Positions Manager

The **📂 Positions** tab shows all currently open trades.

**Columns:**

| Column | Description |
|---|---|
| Ticket | Unique trade identifier (e.g. `T123456ABCD`) |
| Pair | Instrument |
| Dir | BUY or SELL |
| Lots | Position size |
| Open | Entry price |
| Current | Current bid/ask price (updates every 2 seconds) |
| SL | Stop loss level (— if no SL) |
| TP | Take profit level (— if no TP) |
| P&L | Floating profit/loss in USD (includes swap) |
| Pips | Floating profit/loss in pips |
| Swap | Overnight swap cost/income accrued so far |
| Margin | Margin in use for this position |
| Opened | Date and time the position was opened |

**Colour coding:** Green rows = profitable · Red rows = losing · Blue = BUY · Orange/red = SELL

**Buttons:** Close Selected · Modify SL/TP · Close All · Refresh

**Automatic events:**
- **Stop Loss hit** — position closes automatically when bid/ask crosses SL
- **Take Profit hit** — position closes automatically when bid/ask crosses TP
- **Trailing stop** — SL moves automatically to lock in profits as price moves in your favour (if enabled)

---

## 12. Orders Manager

The **📋 Orders** tab lists all pending orders waiting to be triggered.

**Columns:** Ticket · Pair · Type · Lots · Price · SL · TP · Created · Expires (or `GTC`)

**Buttons:** Cancel Selected · Cancel All

---

## 13. Signal System — How It Works

The signal engine runs continuously in the background, analysing price bars for every pair on the primary timeframe (default: 15min).

**Pipeline:**

1. Price ticks → `BarAggregator` → OHLCV bars (per timeframe)
2. On each completed bar → `SignalEngine.on_bar()`
3. 22 indicator strategies each cast a **VOTE** (BUY, SELL, or ABSTAIN)
4. Each vote has a **WEIGHT** (see Section 14)
5. Bull weight and bear weight are summed
6. If `bull_weight > bear_weight` AND `bull_votes ≥ min_confluence (3)` → direction = BUY
7. If `bear_weight > bull_weight` AND `bear_votes ≥ min_confluence` → direction = SELL
8. If `confidence < 0.52` → signal discarded (too weak)
9. Cooldown check: minimum 300 seconds between signals per pair
10. Spread filter: signal blocked if spread > 3 pips (configurable)
11. SL/TP calculated from ATR:
    - Stop Loss = entry ± 2.0 × ATR(14)
    - Take Profit 1 = entry ± 4.0 × ATR(14) *(2:1 R:R)*
    - Take Profit 2 = entry ± 6.0 × ATR(14)
    - Take Profit 3 = entry ± 8.0 × ATR(14)
12. Position size calculated by Kelly-adjusted fixed-fraction sizing
13. Signal saved to database and displayed in the Signals panel
14. If auto-trade is ON → trade opened automatically

**Signal strength levels:**

| Strength | Confidence | Dots |
|---|---|---|
| WEAK | 52–60% | ●○○○ |
| MODERATE | 60–70% | ●●○○ |
| STRONG | 70–80% | ●●●○ |
| VERY STRONG | ≥ 80% | ●●●● |

---

## 14. Signal Indicator Reference (22 Strategies)

| # | Strategy | Weight | Signal Condition |
|---|---|---|---|
| 1 | EMA Crossover (9/21) | 2.5 | EMA9 crosses above/below EMA21 |
| 2 | EMA-200 Trend Filter | 2.0 | Price above/below EMA200 |
| 3 | MACD Histogram Cross | 2.0 | Histogram crosses zero line |
| 4 | RSI Oversold/Overbought | 1.5 | RSI < 30 (buy) or > 70 (sell) |
| 5 | RSI Divergence | 2.0 | Price makes new extreme but RSI does not confirm |
| 6 | Stochastic Cross | 1.0 | %K crosses %D in OB/OS zone |
| 7 | CCI ±100 | 1.0 | CCI below −100 or above +100 |
| 8 | Williams %R | 1.0 | %R below −80 or above −20 |
| 9 | MFI | 1.0 | MFI below 20 or above 80 |
| 10 | Bollinger Bands %B | 1.5 | Price at lower (buy) or upper (sell) band |
| 11 | SuperTrend Flip | 2.5 | SuperTrend changes direction (10 period, 3.0× ATR) |
| 12 | Ichimoku Cloud | 2.5 | Price above/below cloud AND Tenkan > / < Kijun |
| 13 | ADX Trend Strength | 1.5 | ADX > 25 with DI+ / DI− alignment |
| 14 | Squeeze Momentum | 1.5 | Bollinger inside Keltner squeeze releases with momentum |
| 15 | Donchian Channel Breakout | 1.5 | Price breaks above/below 20-period high or low |
| 16 | Keltner Channel | 1.0 | Price outside Keltner bands |
| 17 | VWAP Position | 1.0 | Price above or below VWAP |
| 18 | OBV vs EMA | 1.0 | OBV above/below its 20-period EMA |
| 19 | Candlestick Patterns | 2.0 | Hammer, engulfing, pin bar, morning/evening star, marubozu, three soldiers/crows, doji |
| 20 | Pivot Point S/R | 1.5 | Price within tolerance of classic pivot support/resistance |
| 21 | Hurst + Z-Score Regime | 1.0 | Hurst > 0.55 → trending; Hurst < 0.45 → mean-reversion via Z-Score |
| 22 | ML Pattern Filter | 3.0 | Random Forest trained on 23 features from price, momentum, and volatility data |

**Total maximum weight:** ~36.0 units  
**Minimum confluence votes:** 3 (configurable)  
**Minimum confidence:** 52% (configurable)

> **Note:** The ML weight of 3.0 means a strong machine-learning prediction contributes as much as EMA + SuperTrend + Ichimoku combined. The model trains on your live data and improves over time.

---

## 15. Signal Panel

Click the **⚡ Signals** tab to see all recent trading signals.

**Each signal card shows:**
- Pair name and direction (▲ BUY / ▼ SELL) with strength dots
- Trading session at signal time (London / New York / Tokyo)
- Timeframe and exact time
- Entry price, Stop Loss, TP1, TP2, TP3
- Confidence bar (visual fill) and percentage
- Risk:Reward ratio and suggested lot size
- ATR value (volatility measure)
- Vote count: bull ↑ and bear ↓
- Up to 4 indicator notes explaining why the signal was generated
- **BUY** or **SELL** button to act on the signal immediately

**Colour coding:** Green card border = BUY · Red card border = SELL

**Auto-trade:** In the Trading tab, check *"Auto-trade signals"* to have the system open trades automatically for every generated signal. Set the *"Auto lot"* size (default 0.01 lots).

> ⚠️ **Warning:** Auto-trade requires careful risk management. Use small lot sizes and ensure the daily loss breaker is configured.

---

## 16. Risk Management System

The risk system runs several protective mechanisms simultaneously.

### Position Sizing (Kelly-Adjusted Fixed Fraction)

```
risk_usd   = Balance × risk_per_trade_pct / 100
sl_pips    = |entry_price − stop_loss| / pip_size
raw_lots   = risk_usd / (sl_pips × pip_value_per_lot)
final_lots = raw_lots × kelly_fraction
```

Kelly fraction is further adjusted by historical performance:

```
Kelly f* = (b × p − q) / b

  p = historical win rate
  q = 1 − p
  b = average_win / average_loss
```

Position sizes automatically shrink after a losing streak and grow conservatively during winning periods.

### Stop Loss / Take Profit

Automatic SL and TP are calculated using ATR:

```
SL distance = ATR(14) × sl_atr_multiplier   (default: 2.0)
TP distance = SL distance × tp_risk_reward   (default: 2.0)
```

This gives a minimum **2:1 risk-to-reward ratio** on every signal.

### Trailing Stop

When enabled (default: on), the stop loss automatically moves in the direction of the trade as profit increases, preserving the original SL distance from the current price. Once the price moves 1× your SL distance in your favour, the trade is essentially risk-free.

### Daily Loss Breaker

If total closed losses for the day exceed `max_daily_loss_pct` of balance, all new trade entries are blocked (including auto-trades). Resets at midnight UTC.

### Margin Call Warning

**Default trigger:** Margin Level falls below 50%  
Warning appears in the alert bar. New trades are blocked.

### Stop-Out (Forced Close)

**Default trigger:** Margin Level falls below 20%  
ALL open positions are automatically closed to prevent the account going negative.

---

## 17. Trade History and Analytics

### History Tab (📊)

Shows all closed trades with columns for ticket, pair, direction, lot size, entry/exit prices, SL, TP, P&L in USD and pips, swap, commission, open time, close time, and close reason (`manual` / `sl` / `tp` / `margin_call`). Click any column header to sort. **Export** button saves all history to a timestamped CSV in the `exports/` folder.

### Analytics Tab (📐)

Shows 16 performance metrics:

| | | | |
|---|---|---|---|
| Total Trades | Win Rate | Profit Factor | Net P&L |
| Gross Profit | Gross Loss | Avg Win | Avg Loss |
| Expectancy | Sharpe Ratio | Sortino Ratio | Calmar Ratio |
| Max Drawdown | Max DD % | VaR 95% | CVaR 95% |

**Charts (3 panels):**
- **Cumulative P&L curve** — equity curve across all closed trades
- **P&L per Trade** — bar chart with green/red bars per trade
- **Win / Loss Pie** — pie chart with win and loss split

---

## 18. Risk Dashboard

The **🛡 Risk** tab shows:

**Risk Settings** (editable live):

| Setting | Description |
|---|---|
| Risk per trade (%) | Percentage of balance risked per trade |
| Max daily loss (%) | Stops trading after this daily loss |
| SL ATR multiplier | Stop loss distance in ATR units |
| TP Risk:Reward | Take profit to stop loss ratio |
| Kelly fraction | Scaling factor for Kelly position sizing |
| Trailing Stop | Enable/disable automatic trailing stop |

**Live Risk Metrics** (updates every 2 seconds):  
Balance · Equity · Free Margin · Margin Used · Floating P&L · Margin Level · Daily P&L · Open Trades · Sharpe · Sortino · Max Drawdown · Win Rate · Profit Factor · Expectancy · VaR 95% · CVaR 95%

**Margin Level Gauge:**  
Visual bar showing current margin level. Orange dashed line = Margin Call threshold (50%). Red dashed line = Stop Out threshold (20%). Bar colour transitions green → orange → red as level falls.

---

## 19. Configuration Reference (config.json)

`config.json` is created automatically on first run. Edit it with any text editor while the application is stopped.

### `data_source`

| Key | Default | Description |
|---|---|---|
| `provider` | `"demo"` | `"demo"` \| `"twelvedata"` \| `"polygon"` \| `"oanda"` |
| `api_key` | `""` | Your API key (leave blank for demo) |
| `reconnect_delay` | `5` | Seconds between reconnect attempts |
| `max_reconnects` | `20` | Max reconnect attempts before giving up |
| `websocket_url` | `""` | Custom WebSocket URL (used for OANDA endpoint) |

### `pairs`

List of instruments to stream and analyse. Default:
```json
["EUR/USD","GBP/USD","USD/JPY","USD/CHF","AUD/USD",
 "NZD/USD","USD/CAD","EUR/GBP","EUR/JPY","GBP/JPY",
 "XAU/USD","XAG/USD"]
```

### `account`

| Key | Default | Description |
|---|---|---|
| `initial_balance` | `10000.0` | Starting account balance in USD |
| `currency` | `"USD"` | Account currency |
| `leverage` | `100` | Leverage ratio (100 = 1:100) |
| `margin_call_pct` | `50.0` | Margin level % that triggers margin call |
| `stop_out_pct` | `20.0` | Margin level % that triggers stop-out |

### `trading`

| Key | Default | Description |
|---|---|---|
| `default_lot` | `0.10` | Default lot size in the trading panel |
| `min_lot` | `0.01` | Minimum allowed lot size |
| `max_lot` | `100.0` | Maximum allowed lot size |
| `lot_step` | `0.01` | Lot size increment step |
| `max_open_trades` | `20` | Maximum simultaneous open positions |
| `allow_hedging` | `true` | Allow BUY and SELL on same pair simultaneously |
| `slippage_pips` | `1.0` | Simulated execution slippage in pips |
| `commission_per_lot` | `7.0` | Commission charged per standard lot (USD) |

### `signal_engine`

| Key | Default | Description |
|---|---|---|
| `min_confluence` | `3` | Minimum indicator votes needed for a signal |
| `signal_cooldown` | `300` | Minimum seconds between signals per pair |
| `use_ml_filter` | `true` | Enable Random Forest ML filter |
| `use_session_filter` | `true` | Filter signals to active sessions |
| `auto_trade` | `false` | Automatically open trades on signals |
| `auto_lot` | `0.01` | Lot size to use for auto-trades |
| `min_confidence` | `0.55` | Minimum confidence to emit a signal |

### `risk`

| Key | Default | Description |
|---|---|---|
| `risk_per_trade_pct` | `1.5` | Percentage of balance to risk per trade |
| `max_daily_loss_pct` | `5.0` | Daily loss limit as % of balance |
| `default_sl_atr_mult` | `2.0` | ATR multiplier for stop loss distance |
| `default_tp_rr` | `2.0` | Risk:Reward ratio for take profit |
| `trailing_stop` | `true` | Enable trailing stop |
| `trailing_atr_mult` | `1.5` | ATR multiplier for trailing stop |
| `kelly_fraction` | `0.25` | Fraction of Kelly criterion to apply |
| `spread_filter_pips` | `3.0` | Block signals when spread exceeds this |

### `ml`

| Key | Default | Description |
|---|---|---|
| `model_type` | `"random_forest"` | `"random_forest"` \| `"gradient_boost"` |
| `n_estimators` | `200` | Number of trees in the forest |
| `retrain_interval` | `3600` | Seconds between model retraining |
| `min_samples` | `200` | Minimum training samples before ML activates |
| `confidence_thresh` | `0.60` | ML probability threshold to cast a vote |

### `ui`

| Key | Default | Description |
|---|---|---|
| `theme` | `"light"` | Theme (light mode only) |
| `refresh_ms` | `2000` | Refresh interval for chart and panels (ms) |
| `max_candles` | `150` | Maximum candles to display on chart |
| `window_width` | `1820` | Initial window width (px) |
| `window_height` | `1000` | Initial window height (px) |

---

## 20. Data Provider Setup

### Twelve Data — Step by step

1. Go to https://twelvedata.com/ and click **Sign Up Free**
2. Verify your email
3. Go to Dashboard → API Keys and copy your key
4. Open `config.json` and set:
```json
"provider": "twelvedata",
"api_key":  "abc123def456..."
```
5. Save and start the application

> **Free plan limit:** 8 WebSocket connections per minute. Reduce the `pairs` list to 8 items if needed.

### Polygon.io — Step by step

1. Go to https://polygon.io/ and create a free account
2. Navigate to Dashboard → API Keys and copy your key
3. Set in `config.json`: `"provider": "polygon", "api_key": "YOUR_KEY"`

> **Free plan limit:** Delayed data only. Upgrade to Starter for real-time.

### OANDA — Step by step

1. Go to https://www.oanda.com/ and open a practice account (free)
2. Log in → My Account → Manage API Access
3. Click **Generate** to create a Personal Access Token (shown only once — save it)
4. Edit `config.json`:
```json
"provider":      "oanda",
"api_key":       "YOUR_PERSONAL_ACCESS_TOKEN",
"websocket_url": "https://stream-fxpractice.oanda.com"
```

For a live OANDA account use: `https://stream-fxtrade.oanda.com`

---

## 21. Financial Mathematics Reference

All calculations are performed locally. No external calculation service.

### Account Calculations

```
Margin Required  = (Lots × Contract_size × Price) / Leverage
                   Contract size = 100,000 units for forex
                   XAU = 100 oz/lot, XAG = 5,000 oz/lot

Equity           = Balance + Floating_PnL
Free Margin      = Equity − Margin_Used
Margin Level     = (Equity / Margin_Used) × 100 %

PnL (BUY)        = (Close − Open) / Pip_size × Pip_value × Lots
PnL (SELL)       = (Open − Close) / Pip_size × Pip_value × Lots

Daily swap       = Lots × Swap_rate_pips/night × Pip_value
Commission       = Lots × Commission_per_lot  (default $7/lot)
```

### Position Sizing

```
Risk USD   = Balance × Risk_pct / 100
SL pips    = |entry − stop_loss| / pip_size
Raw lots   = Risk_USD / (SL_pips × pip_value_per_lot)
Kelly f*   = (b × p − q) / b
             b = avg_win / avg_loss,  p = win_rate,  q = 1 − win_rate
Final lots = Raw_lots × (Kelly_f* × kelly_fraction)
             Clamped to [min_lot, max_lot] with lot_step rounding
```

### Performance Metrics

```
Sharpe Ratio  = (μ_r − r_f) / σ_r × √252
Sortino Ratio = (μ_r − r_f) / σ_down × √252   (downside deviation only)
Calmar Ratio  = Annualised_return / Max_drawdown_fraction
Profit Factor = Gross_profit / Gross_loss
Expectancy    = Win_rate × Avg_win − Loss_rate × Avg_loss
Max Drawdown  = Maximum peak-to-trough decline in cumulative P&L
```

### Value at Risk (Parametric, 95% confidence)

```
VaR_95   = −(μ − 1.645 × σ) × Balance
CVaR_95  = −(μ − σ × φ(Φ⁻¹(0.05)) / (1 − 0.05)) × Balance
           = Expected Shortfall — average loss in worst 5% of cases
           φ = PDF of standard normal ≈ 0.10313
```

### Indicator Mathematics

```
EMA(n)        = (price − prev_EMA) × k + prev_EMA   k = 2/(n+1)
SMA(n)        = mean of last n closes
WMA(n)        = weighted mean, weights = 1, 2, …, n
HMA(n)        = WMA(2×WMA(n/2) − WMA(n), √n)
KAMA          = Adaptive MA using Efficiency Ratio
Kalman        = Optimal linear state estimator (noise reduction)
RSI(n)        = 100 − 100 / (1 + avg_gain/avg_loss)
MACD          = EMA(fast) − EMA(slow),  Signal = EMA(MACD, sig)
BB            = SMA(n) ± std_multiplier × σ(n)
ATR           = EMA(True_Range, n)
ADX           = Smoothed(DX),  DX = |DI+ − DI−| / (DI+ + DI−)
Stochastic %K = 100 × (Close − Low_n) / (High_n − Low_n)
CCI           = (TP − SMA(TP)) / (0.015 × MAD)
Williams %R   = −100 × (High_n − Close) / (High_n − Low_n)
SuperTrend    = (High+Low)/2 ± ATR × multiplier  with flip logic
Ichimoku      = Tenkan=(H+L)/9, Kijun=(H+L)/26, Senkou=(H+L)/52
VWAP          = Σ(TP×V) / Σ(V)  (cumulative from bar open)
OBV           = Σ (volume if up, −volume if down)
Squeeze       = Bollinger inside Keltner detection
Hurst         = R/S analysis  (> 0.5 = trending, < 0.5 = reverting)
Z-Score       = (price − mean_n) / std_n
```

---

## 22. Troubleshooting

**`ModuleNotFoundError: No module named 'numpy'`**  
Open a terminal *inside* the project folder (where `main.py` lives) and run:
```bash
pip install -r requirements.txt
```
Verify you're using the same Python that pip installed to: `python --version` and `pip --version`.

---

**`ModuleNotFoundError: No module named 'core'`**  
You are not running from the project root directory. The terminal must be in the folder that contains `main.py`:
```
cd C:\ApexForexBroker
python main.py
```

---

**GUI window is blank / chart doesn't appear**  
matplotlib may not have the TkAgg backend:
```bash
pip install --upgrade matplotlib Pillow
# On Linux:
sudo apt-get install python3-tk
```

---

**"No price available for EUR/USD"**  
The price feed hasn't started yet. Wait 3–5 seconds for the first ticks to arrive. In demo mode this is automatic. In live mode, check your API key in `config.json`.

---

**WebSocket keeps disconnecting**  
This is normal on unstable connections — auto-reconnect handles it. In `config.json` you can increase `"reconnect_delay"` to `10` to avoid hammering the server.

---

**Signals never appear**  
At least 50 completed bars are needed before analysis begins. On the 15min chart in demo mode that means waiting ~50 minutes. For faster testing:
```json
"primary_tf": "1min"
```
Signals may then appear within ~50 minutes of starting.

---

**ML filter never votes**  
The ML model requires `min_samples` (default 200) completed bars before training. On 15min timeframe this takes ~50 hours. To speed this up:
```json
"primary_tf": "1min",
"ml": { "min_samples": 100 }
```

---

**The EXE shows a Windows security warning**  
This is normal for unsigned executables. Click *"More info"* → *"Run anyway"* on the SmartScreen dialog, or right-click the EXE → Properties → Unblock.

---

**EXE crashes immediately / black window closes**  
Run from Python source to see the error:
```bash
python main.py --debug
```
Also check `logs/broker.log` for error details.

---

**Very high CPU usage**  
Reduce refresh rate and/or the number of pairs:
```json
"ui": { "refresh_ms": 5000 },
"pairs": ["EUR/USD", "GBP/USD", "USD/JPY"]
```

---

## 23. FAQ

**Q: Is this real trading with real money?**  
A: No. Apex Forex Broker is a self-hosted simulation/paper trading system. All orders are executed internally against the price feed. No real broker is involved, no real money moves, no real trades are placed. It is a decision support and training tool.

**Q: Can I connect it to a real broker?**  
A: The OANDA price feed provides real market prices, but order execution is still local. To place real orders you would need to integrate the OANDA v20 REST API order endpoints into the trading engine.

**Q: Where is my data stored?**  
A: Everything is local. SQLite database: `db/broker.db`. Trade history CSV: `reports/trades.csv`. Log files: `logs/broker.log`. No data leaves your machine.

**Q: How do I reset my account balance?**  
A: Option 1: `python main.py --reset-db` (wipes ALL data). Option 2: Edit `db/broker.db` with SQLite Browser: `UPDATE accounts SET balance=10000, equity=10000, free_margin=10000;`. Option 3: Delete `db/broker.db` and restart.

**Q: How do I change my starting balance?**  
A: In `config.json`: `"account": { "initial_balance": 50000 }`. This only takes effect the first time you run (when the DB is created). For an existing database, use `--reset-db`.

**Q: What happens to my positions if I close the app?**  
A: Open positions are saved in the database and still there on restart. However, P&L changes while the app was closed are not tracked. Prices will update to current levels on restart.

**Q: The signals look too frequent / not frequent enough. How do I tune this?**  
A: In `config.json`:
- Increase `"min_confluence"` to 4 or 5 for fewer, higher-quality signals
- Increase `"signal_cooldown"` to 600 or 900 for signals further apart
- Increase `"min_confidence"` to 0.65 for only strong signals
- Change `"primary_tf"` to `"1h"` or `"4h"` for a higher timeframe

**Q: Why does the last candlestick keep changing shape?**  
A: This is normal. The rightmost candle is the "live" candle for the current period. Its close price updates with every tick. When the period ends, the candle is finalised and a new one begins.

**Q: How do I add more currency pairs?**  
A: Add them to the `"pairs"` list in `config.json`. Make sure your data provider supports those pairs. The demo simulator supports only the 12 default pairs.

**Q: Can I run multiple instances?**  
A: Yes, but they must use different database files:
```bash
python main.py --config my_second_account.json
```

**Q: How do I increase leverage?**  
A: `"account": { "leverage": 500 }` in `config.json`. The margin requirement and risk calculations adjust automatically.

---

## File Structure

```
ApexForexBroker/
├── main.py                   ← Entry point — run this
├── config.json               ← Auto-generated configuration
├── requirements.txt          ← Python package list
├── build_exe.bat             ← Windows EXE build script
├── DOCUMENTATION.md          ← This file
│
├── core/
│   ├── config.py             ← Configuration manager
│   └── logger.py             ← Logging setup
│
├── db/
│   └── database.py           ← SQLite database layer
│
├── auth/
│   └── account.py            ← Account: margin, PnL, swap calculations
│
├── data/
│   ├── feed.py               ← WebSocket price feed (4 providers)
│   └── bars.py               ← Tick → OHLCV bar aggregator
│
├── signals/
│   ├── indicators.py         ← 30+ technical indicators (pure NumPy)
│   └── engine.py             ← 22-strategy signal fusion + ML filter
│
├── risk/
│   └── manager.py            ← Kelly, VaR, CVaR, Sharpe, drawdown
│
├── trading/
│   └── engine.py             ← Order execution, SL/TP, margin monitoring
│
├── reports/
│   └── reporter.py           ← CSV export, performance reporting
│
├── ui/
│   ├── app.py                ← Root window, layout, header, watchlist
│   ├── chart.py              ← Candlestick chart with overlays
│   ├── theme.py              ← Light-mode colour palette
│   ├── trading_panel.py      ← Market and pending order entry forms
│   ├── positions_panel.py    ← Open positions table
│   ├── orders_panel.py       ← Pending orders table
│   └── panels.py             ← Signals, history, analytics, risk panels
│
├── db/
│   └── broker.db             ← SQLite database (auto-created)
├── logs/
│   └── broker.log            ← Application log (auto-created)
├── reports/
│   └── trades.csv            ← Trade history CSV (auto-created)
└── exports/
    └── trades_TIMESTAMP.csv  ← Manual CSV exports
```
