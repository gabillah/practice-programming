"""
risk/manager.py — Advanced risk management.

Mathematics:
  Kelly Criterion    f* = (b·p − q) / b
  Value at Risk      VaR_95 = μ − 1.645·σ  (parametric, normal dist)
  CVaR / ES          ES_95 = μ − σ·φ(Φ⁻¹(0.05))/(1−0.05)
  Sharpe             (μ_r − r_f) / σ_r × √252
  Sortino            (μ_r − r_f) / σ_down × √252
  Calmar             annualised_return / max_drawdown
  Max Drawdown       peak-to-trough equity decline
  Fixed-fractional   risk_usd = balance × pct / 100
  Lot size           lots = risk_usd / (sl_pips × pip_value_per_lot)
"""
from __future__ import annotations
import logging, threading
from typing import Dict, List, Optional

import numpy as np

from auth.account import AccountManager, PIP_SIZE, PIP_VALUE

logger = logging.getLogger(__name__)


class RiskManager:
    def __init__(self, config, account: AccountManager, db):
        self.config  = config
        self.account = account
        self.db      = db
        self._lock   = threading.Lock()
        logger.info("RiskManager ready")

    # ── Position sizing ────────────────────────────────────────────────────────
    def suggest_lot(self, pair: str, entry: float, stop_loss: float,
                    override_pct: float = 0.0) -> float:
        """
        Fixed-fractional + fractional Kelly position sizing.

        Formula:
          risk_usd = balance × risk_pct / 100
          sl_pips  = |entry - sl| / pip_size
          raw_lots = risk_usd / (sl_pips × pip_value_per_lot)
          lots     = raw_lots × kelly_fraction
        """
        cfg     = self.config.risk_cfg
        snap    = self.account.snapshot()
        balance = snap["balance"]
        if balance <= 0:
            return self.config.trading_cfg.get("min_lot", 0.01)

        risk_pct = override_pct or cfg.get("risk_per_trade_pct", 1.5)
        risk_usd = balance * risk_pct / 100.0

        pip_sz  = PIP_SIZE.get(pair, 0.0001)
        pip_val = PIP_VALUE.get(pair, 10.0)
        sl_dist = abs(entry - stop_loss)
        sl_pips = sl_dist / pip_sz if sl_dist > 0 else 20.0

        if sl_pips <= 0:
            return self.config.trading_cfg.get("min_lot", 0.01)

        raw_lots = risk_usd / (sl_pips * pip_val)

        # Kelly scaling
        kelly    = cfg.get("kelly_fraction", 0.25)
        hist_kf  = self._kelly_from_history()
        effective_kelly = min(kelly, hist_kf) if hist_kf > 0 else kelly
        lots     = raw_lots * effective_kelly

        # Clamp
        min_l = self.config.trading_cfg.get("min_lot", 0.01)
        max_l = self.config.trading_cfg.get("max_lot", 100.0)
        step  = self.config.trading_cfg.get("lot_step", 0.01)
        lots  = max(min_l, min(max_l, lots))
        lots  = round(round(lots / step) * step, 2)
        return lots

    def _kelly_from_history(self) -> float:
        """
        Full Kelly:  f* = (b·p − q) / b
        where b = avg_win / avg_loss,  p = win_rate,  q = 1 − p
        """
        stats = self.db.get_history_stats()
        total = stats.get("total", 0) or 0
        if total < 10:
            return self.config.risk_cfg.get("kelly_fraction", 0.25)
        wins     = stats.get("wins",  0) or 0
        losses   = stats.get("losses",0) or 0
        g_profit = stats.get("gross_profit",0) or 0
        g_loss   = abs(stats.get("gross_loss",0) or 0)
        p  = wins / total if total > 0 else 0.5
        q  = 1.0 - p
        avg_win  = g_profit / wins   if wins   > 0 else 0.01
        avg_loss = g_loss   / losses if losses > 0 else 0.01
        b = avg_win / avg_loss if avg_loss > 0 else 1.0
        kelly = (b*p - q) / b if b > 0 else 0.0
        kelly = max(0.0, min(1.0, kelly))
        frac  = self.config.risk_cfg.get("kelly_fraction", 0.25)
        return kelly * frac   # fractional Kelly

    # ── Daily loss circuit breaker ────────────────────────────────────────────
    def daily_loss_breaker_tripped(self) -> bool:
        """Returns True if daily loss exceeds configured maximum."""
        max_pct  = self.config.risk_cfg.get("max_daily_loss_pct", 5.0)
        snap     = self.account.snapshot()
        balance  = snap["balance"]
        daily_pnl= self.db.get_daily_pnl()
        if balance <= 0: return False
        loss_pct = abs(daily_pnl) / balance * 100 if daily_pnl < 0 else 0.0
        if loss_pct >= max_pct:
            logger.warning("Daily loss breaker tripped: %.1f%% (max %.1f%%)",
                           loss_pct, max_pct)
            return True
        return False

    # ── Performance metrics ────────────────────────────────────────────────────
    def compute_metrics(self) -> Dict:
        rows  = self.db.get_history(1000)
        pnls  = np.array([r["pnl"] for r in rows], dtype=float)
        if len(pnls) == 0:
            return self._empty_metrics()

        total    = len(pnls)
        wins     = int((pnls>0).sum())
        losses   = int((pnls<=0).sum())
        win_rate = wins/total if total>0 else 0.0
        g_profit = float(pnls[pnls>0].sum())
        g_loss   = float(abs(pnls[pnls<=0].sum()))
        net_pnl  = float(pnls.sum())
        avg_pnl  = float(pnls.mean())
        pf       = g_profit/g_loss if g_loss>0 else float("inf")
        avg_win  = float(pnls[pnls>0].mean()) if wins>0 else 0.0
        avg_loss = float(abs(pnls[pnls<=0].mean())) if losses>0 else 0.0
        expectancy = win_rate*avg_win - (1-win_rate)*avg_loss

        # Returns series (as % of initial balance)
        snap    = self.account.snapshot()
        bal0    = snap["balance"] - net_pnl
        returns = pnls / max(bal0, 1.0)
        mu_r    = float(returns.mean())
        sig_r   = float(returns.std(ddof=1)) if len(returns)>1 else 0.01
        rf      = 0.0   # risk-free rate (simplified)

        # Sharpe: (mean_ret − rf) / std × √252
        sharpe  = (mu_r - rf) / sig_r * np.sqrt(252) if sig_r > 0 else 0.0

        # Sortino: uses downside deviation only
        downside = returns[returns<0]
        sig_down = float(downside.std(ddof=1)) if len(downside)>1 else sig_r
        sortino  = (mu_r - rf) / sig_down * np.sqrt(252) if sig_down > 0 else 0.0

        # Maximum drawdown (peak-to-trough on cumulative P&L)
        cum = np.cumsum(pnls)
        peak= np.maximum.accumulate(cum)
        dd  = cum - peak
        max_dd = float(abs(dd.min())) if len(dd)>0 else 0.0
        max_dd_pct = max_dd/max(bal0,1.0)*100

        # Calmar = annualised return / max drawdown
        ann_ret = mu_r * 252
        calmar  = ann_ret / (max_dd/bal0) if max_dd>0 and bal0>0 else 0.0

        # Parametric VaR 95% and CVaR
        if len(returns) >= 10:
            mu_d  = float(returns.mean())
            sig_d = float(returns.std(ddof=1))
            var95 = -(mu_d - 1.645*sig_d) * snap["balance"]
            phi   = 0.10313
            cvar95= -(mu_d - sig_d * phi / 0.05) * snap["balance"]
        else:
            var95 = cvar95 = 0.0

        return {
            "total_trades":  total,
            "wins":          wins,
            "losses":        losses,
            "win_rate":      round(win_rate*100, 1),
            "gross_profit":  round(g_profit, 2),
            "gross_loss":    round(g_loss, 2),
            "net_pnl":       round(net_pnl, 2),
            "avg_pnl":       round(avg_pnl, 2),
            "avg_win":       round(avg_win, 2),
            "avg_loss":      round(avg_loss, 2),
            "profit_factor": round(pf, 2) if pf != float("inf") else 9999.0,
            "expectancy":    round(expectancy, 2),
            "sharpe":        round(sharpe, 3),
            "sortino":       round(sortino, 3),
            "calmar":        round(calmar, 3),
            "max_drawdown":  round(max_dd, 2),
            "max_dd_pct":    round(max_dd_pct, 1),
            "var_95":        round(var95, 2),
            "cvar_95":       round(cvar95, 2),
        }

    def _empty_metrics(self) -> Dict:
        keys = ["total_trades","wins","losses","win_rate","gross_profit",
                "gross_loss","net_pnl","avg_pnl","avg_win","avg_loss",
                "profit_factor","expectancy","sharpe","sortino","calmar",
                "max_drawdown","max_dd_pct","var_95","cvar_95"]
        return {k: 0.0 for k in keys}

    # ── Risk summary for account panel ────────────────────────────────────────
    def risk_summary(self) -> Dict:
        snap = self.account.snapshot()
        metrics = self.compute_metrics()
        return {**snap, **metrics,
                "daily_pnl": round(self.db.get_daily_pnl(), 2)}
