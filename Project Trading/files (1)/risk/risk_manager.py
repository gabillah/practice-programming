"""
risk/risk_manager.py
────────────────────
Professional risk management engine.

Implements:
  • Fixed fractional position sizing
  • Kelly Criterion (fractional Kelly)
  • Pip-value–based lot calculation
  • Daily loss limit enforcement
  • Maximum concurrent positions
  • ATR-based dynamic stop loss
  • Trailing stop logic
  • Sharpe, Sortino, Calmar ratio tracking
  • Drawdown monitoring
  • Value-at-Risk (VaR) estimate (parametric)
  • Expected Shortfall (CVaR)
"""

from __future__ import annotations
import logging
import math
import time
from collections import deque
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

import numpy as np

from core.config_manager import ConfigManager

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
@dataclass
class TradeRecord:
    """Single closed trade for statistics calculation."""
    pair:       str
    direction:  str           # BUY / SELL
    entry:      float
    exit:       float
    size:       float         # lots
    pnl_pips:   float
    pnl_usd:    float
    opened_at:  float
    closed_at:  float
    duration:   float = field(init=False)

    def __post_init__(self):
        self.duration = self.closed_at - self.opened_at


# ─────────────────────────────────────────────────────────────────────────────
class PerformanceTracker:
    """
    Tracks rolling performance metrics:
      - Win rate, profit factor
      - Sharpe Ratio (annualised)
      - Sortino Ratio
      - Max Drawdown / Calmar Ratio
      - VaR (95%), CVaR (95%)
    """

    TRADING_DAYS_YEAR = 252

    def __init__(self, window: int = 100):
        self._trades:  deque[TradeRecord] = deque(maxlen=window)
        self._equity:  deque[float]       = deque(maxlen=window * 10)
        self._peak_equity   = 0.0
        self._max_drawdown  = 0.0
        self._start_equity  = 0.0

    def add_trade(self, trade: TradeRecord) -> None:
        self._trades.append(trade)

    def update_equity(self, equity: float) -> None:
        self._equity.append(equity)
        if self._start_equity == 0:
            self._start_equity = equity
        if equity > self._peak_equity:
            self._peak_equity = equity
        dd = (self._peak_equity - equity) / self._peak_equity if self._peak_equity > 0 else 0
        self._max_drawdown = max(self._max_drawdown, dd)

    @property
    def win_rate(self) -> float:
        if not self._trades:
            return 0.0
        wins = sum(1 for t in self._trades if t.pnl_usd > 0)
        return wins / len(self._trades)

    @property
    def profit_factor(self) -> float:
        gross_profit = sum(t.pnl_usd for t in self._trades if t.pnl_usd > 0)
        gross_loss   = abs(sum(t.pnl_usd for t in self._trades if t.pnl_usd < 0))
        return gross_profit / gross_loss if gross_loss > 0 else float("inf")

    @property
    def avg_pnl(self) -> float:
        if not self._trades:
            return 0.0
        return sum(t.pnl_usd for t in self._trades) / len(self._trades)

    @property
    def avg_win(self) -> float:
        wins = [t.pnl_usd for t in self._trades if t.pnl_usd > 0]
        return sum(wins) / len(wins) if wins else 0.0

    @property
    def avg_loss(self) -> float:
        losses = [t.pnl_usd for t in self._trades if t.pnl_usd < 0]
        return sum(losses) / len(losses) if losses else 0.0

    @property
    def expectancy(self) -> float:
        """Mathematical expectancy per trade in USD."""
        wr   = self.win_rate
        aw   = self.avg_win
        al   = abs(self.avg_loss)
        return wr * aw - (1 - wr) * al

    def sharpe_ratio(self, risk_free_rate: float = 0.04) -> float:
        """Annualised Sharpe Ratio from equity curve."""
        if len(self._equity) < 2:
            return 0.0
        eq     = np.array(self._equity)
        rets   = np.diff(eq) / eq[:-1]
        if rets.std() == 0:
            return 0.0
        daily_rf = risk_free_rate / self.TRADING_DAYS_YEAR
        sr = (rets.mean() - daily_rf) / rets.std()
        return float(sr * math.sqrt(self.TRADING_DAYS_YEAR))

    def sortino_ratio(self, risk_free_rate: float = 0.04) -> float:
        """Sortino Ratio – penalises only downside volatility."""
        if len(self._equity) < 2:
            return 0.0
        eq     = np.array(self._equity)
        rets   = np.diff(eq) / eq[:-1]
        daily_rf = risk_free_rate / self.TRADING_DAYS_YEAR
        excess = rets - daily_rf
        neg    = excess[excess < 0]
        if len(neg) == 0:
            return float("inf")
        downside_std = neg.std()
        if downside_std == 0:
            return 0.0
        return float((rets.mean() - daily_rf) / downside_std * math.sqrt(self.TRADING_DAYS_YEAR))

    def calmar_ratio(self) -> float:
        if self._max_drawdown == 0:
            return 0.0
        if len(self._equity) < 2:
            return 0.0
        eq      = np.array(self._equity)
        rets    = np.diff(eq) / eq[:-1]
        ann_ret = rets.mean() * self.TRADING_DAYS_YEAR
        return ann_ret / self._max_drawdown

    def var_95(self) -> float:
        """Parametric 95% Value-at-Risk (as % of equity)."""
        if len(self._equity) < 10:
            return 0.0
        eq   = np.array(self._equity)
        rets = np.diff(eq) / eq[:-1]
        mean = rets.mean(); std = rets.std()
        # 95% VaR: z = 1.645
        return float(-(mean - 1.645 * std))

    def cvar_95(self) -> float:
        """Conditional VaR (Expected Shortfall) at 95%."""
        if len(self._equity) < 10:
            return 0.0
        eq   = np.array(self._equity)
        rets = np.diff(eq) / eq[:-1]
        threshold = np.percentile(rets, 5)
        tail = rets[rets <= threshold]
        return float(-tail.mean()) if len(tail) > 0 else 0.0

    @property
    def max_drawdown(self) -> float:
        return self._max_drawdown

    def summary(self) -> Dict:
        return {
            "trades":       len(self._trades),
            "win_rate":     round(self.win_rate * 100, 1),
            "profit_factor":round(self.profit_factor, 2),
            "avg_pnl":      round(self.avg_pnl, 2),
            "avg_win":      round(self.avg_win, 2),
            "avg_loss":     round(self.avg_loss, 2),
            "expectancy":   round(self.expectancy, 2),
            "sharpe":       round(self.sharpe_ratio(), 2),
            "sortino":      round(self.sortino_ratio(), 2),
            "calmar":       round(self.calmar_ratio(), 2),
            "max_dd_pct":   round(self.max_drawdown * 100, 2),
            "var_95_pct":   round(self.var_95() * 100, 2),
            "cvar_95_pct":  round(self.cvar_95() * 100, 2),
        }


# ─────────────────────────────────────────────────────────────────────────────
class RiskManager:
    """
    Central risk management engine.
    All position sizing and risk checks flow through here.
    """

    # Pip values per lot (USD) for major pairs
    # These are approximate and assume USD account base
    PIP_VALUES_PER_LOT = {
        "EUR/USD": 10.0,  "GBP/USD": 10.0, "AUD/USD": 10.0,
        "NZD/USD": 10.0,  "USD/CAD": 7.50, "USD/CHF": 10.50,
        "USD/JPY": 9.09,  "EUR/GBP": 12.50,"EUR/JPY": 9.09,
        "GBP/JPY": 9.09,  "XAU/USD": 1.0,  "XAG/USD": 50.0,
    }

    def __init__(self, config: ConfigManager):
        self.config       = config
        self._risk_cfg    = config.risk
        self._balance     = float(self._risk_cfg.get("account_balance", 10000))
        self._equity      = self._balance
        self._open_trades = 0
        self._daily_pnl   = 0.0
        self._day_start   = self._today_start()
        self._perf        = PerformanceTracker()
        self._perf.update_equity(self._balance)
        logger.info("RiskManager: balance=%.2f, risk/trade=%.1f%%",
                    self._balance, self._risk_cfg.get("risk_per_trade_pct", 1.5))

    @staticmethod
    def _today_start() -> float:
        import datetime
        now = datetime.datetime.utcnow()
        return datetime.datetime(now.year, now.month, now.day).timestamp()

    # ── Core sizing ────────────────────────────────────────────────────────────
    def position_size(self, pair: str, risk_pips: float, pip_size: float
                      ) -> float:
        """
        Calculate lot size based on risk percentage of account balance.

        Formula:
          risk_usd    = balance × risk_pct / 100
          pip_val_usd = PIP_VALUES_PER_LOT[pair]   (per standard lot)
          lots        = risk_usd / (risk_pips × pip_val_usd)

        Optionally scaled by fractional Kelly.
        """
        if risk_pips <= 0:
            return 0.01
        risk_pct    = self._risk_cfg.get("risk_per_trade_pct", 1.5)
        risk_usd    = self._balance * (risk_pct / 100)
        pip_val     = self.PIP_VALUES_PER_LOT.get(pair, 10.0)

        lots = risk_usd / (risk_pips * pip_val)

        # Apply Kelly scaling
        if self._risk_cfg.get("use_dynamic_sizing", True):
            kelly_f = self._risk_cfg.get("kelly_fraction", 0.25)
            lots   *= kelly_f

        # Clamp to sensible limits
        lots = max(0.01, min(lots, 10.0))
        return round(lots, 2)

    def kelly_position_size(self, win_rate: float, win_loss_ratio: float,
                            base_lots: float) -> float:
        """
        Kelly Criterion position sizing adjustment.
        f* = (bp - q) / b
        where b = win/loss ratio, p = win rate, q = 1 - p

        Returns adjusted lot size.
        """
        if win_loss_ratio <= 0 or not (0 < win_rate < 1):
            return base_lots
        p = win_rate
        q = 1 - p
        b = win_loss_ratio
        f_star = (b * p - q) / b
        f_star = max(0, min(f_star, 0.25))    # Cap at 25% (fractional Kelly)
        kelly_f= self._risk_cfg.get("kelly_fraction", 0.25)
        return round(base_lots * f_star * kelly_f, 2)

    # ── Risk checks ────────────────────────────────────────────────────────────
    def can_trade(self) -> Tuple[bool, str]:
        """Returns (allowed, reason)."""
        # Reset daily PnL at day start
        if time.time() - self._day_start > 86400:
            self._daily_pnl  = 0.0
            self._day_start  = self._today_start()

        max_trades  = self._risk_cfg.get("max_open_trades", 5)
        max_dd_pct  = self._risk_cfg.get("max_daily_loss_pct", 5.0)
        daily_loss  = abs(min(0, self._daily_pnl))
        daily_loss_pct = daily_loss / self._balance * 100 if self._balance > 0 else 0

        if self._open_trades >= max_trades:
            return False, f"Max concurrent trades ({max_trades}) reached"
        if daily_loss_pct >= max_dd_pct:
            return False, f"Daily loss limit {max_dd_pct:.1f}% reached ({daily_loss_pct:.1f}%)"
        return True, "OK"

    # ── Stop loss & take profit ─────────────────────────────────────────────────
    def calculate_stops(self, direction: str, entry: float, atr: float,
                        pair: str) -> Dict[str, float]:
        """
        ATR-based stop loss and multiple take-profit levels.
        Returns dict with sl, tp1, tp2, tp3 prices.
        """
        sl_mult = self._risk_cfg.get("default_sl_atr_mult", 2.0)
        rr      = self._risk_cfg.get("default_tp_rr", 2.0)
        sl_dist = atr * sl_mult
        tp1_dist= sl_dist * rr
        tp2_dist= sl_dist * rr * 1.5
        tp3_dist= sl_dist * rr * 2.5

        if direction == "BUY":
            return {
                "sl":  entry - sl_dist,
                "tp1": entry + tp1_dist,
                "tp2": entry + tp2_dist,
                "tp3": entry + tp3_dist,
            }
        else:
            return {
                "sl":  entry + sl_dist,
                "tp1": entry - tp1_dist,
                "tp2": entry - tp2_dist,
                "tp3": entry - tp3_dist,
            }

    def trailing_stop(self, direction: str, current_price: float,
                      current_sl: float, atr: float) -> float:
        """
        Returns updated trailing stop price.
        Only moves stop in the profitable direction.
        """
        mult = self._risk_cfg.get("trailing_atr_mult", 1.5)
        trail = atr * mult
        if direction == "BUY":
            new_sl = current_price - trail
            return max(current_sl, new_sl)
        else:
            new_sl = current_price + trail
            return min(current_sl, new_sl)

    # ── Trade lifecycle ────────────────────────────────────────────────────────
    def register_open(self) -> None:
        self._open_trades = max(0, self._open_trades + 1)

    def register_close(self, trade: TradeRecord) -> None:
        self._open_trades = max(0, self._open_trades - 1)
        self._daily_pnl  += trade.pnl_usd
        self._equity     += trade.pnl_usd
        self._perf.add_trade(trade)
        self._perf.update_equity(self._equity)
        logger.info("Trade closed: %s %s PnL=%.2f USD (daily: %.2f)",
                    trade.pair, trade.direction, trade.pnl_usd, self._daily_pnl)

    # ── Statistics ─────────────────────────────────────────────────────────────
    @property
    def performance(self) -> PerformanceTracker:
        return self._perf

    @property
    def balance(self) -> float:
        return self._balance

    @property
    def equity(self) -> float:
        return self._equity

    @property
    def daily_pnl(self) -> float:
        return self._daily_pnl

    @property
    def open_trades(self) -> int:
        return self._open_trades

    def update_balance(self, balance: float) -> None:
        self._balance = balance
        self._perf.update_equity(balance)

    def risk_summary(self) -> Dict:
        perf = self._perf.summary()
        return {
            "balance":    round(self._balance, 2),
            "equity":     round(self._equity, 2),
            "daily_pnl":  round(self._daily_pnl, 2),
            "open_trades":self._open_trades,
            **perf
        }
