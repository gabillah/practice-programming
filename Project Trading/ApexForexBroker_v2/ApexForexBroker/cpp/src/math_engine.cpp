/**
 * math_engine.cpp
 * ===============
 * Apex Forex Broker v2.0 — C++ Math Engine Implementation
 *
 * All functions use raw double arrays for maximum performance and
 * direct interoperability with NumPy via ctypes.
 *
 * NaN sentinel: output arrays are initialised to NaN where insufficient
 * data exists (same behaviour as Python/NumPy indicators).
 */

#include "math_engine.h"
#include <cmath>
#include <cstring>
#include <algorithm>
#include <numeric>
#include <limits>
#include <vector>

static constexpr double NaN = std::numeric_limits<double>::quiet_NaN();
static constexpr double INF = std::numeric_limits<double>::infinity();

/* ────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────────────────────── */

static inline void fill_nan(double* dst, int n)
{
    for (int i = 0; i < n; ++i) dst[i] = NaN;
}

static inline bool is_valid(double v) { return !std::isnan(v) && !std::isinf(v); }

/* Mean of an array (ignores NaN) */
static double array_mean(const double* a, int n)
{
    double sum = 0.0; int cnt = 0;
    for (int i = 0; i < n; ++i)
        if (is_valid(a[i])) { sum += a[i]; ++cnt; }
    return cnt > 0 ? sum / cnt : NaN;
}

/* Std deviation (population) of a slice */
static double array_std(const double* a, int start, int len)
{
    double mean = 0.0;
    for (int i = start; i < start + len; ++i) mean += a[i];
    mean /= len;
    double var = 0.0;
    for (int i = start; i < start + len; ++i) {
        double d = a[i] - mean;
        var += d * d;
    }
    return std::sqrt(var / len);
}

/* ────────────────────────────────────────────────────────────────────────────
 * Version
 * ────────────────────────────────────────────────────────────────────────── */

APEX_API const char* apex_version(void)
{
    return "Apex Math Engine 2.0 (C++)";
}

/* ────────────────────────────────────────────────────────────────────────────
 * Moving Averages
 * ────────────────────────────────────────────────────────────────────────── */

APEX_API void apex_ema(const double* src, double* dst, int n, int period)
{
    fill_nan(dst, n);
    if (n <= 0 || period <= 0) return;
    double k = 2.0 / (period + 1.0);
    /* Find first valid value */
    int start = -1;
    for (int i = 0; i < n; ++i)
        if (is_valid(src[i])) { start = i; break; }
    if (start < 0) return;
    dst[start] = src[start];
    for (int i = start + 1; i < n; ++i) {
        if (!is_valid(src[i])) continue;
        if (!is_valid(dst[i-1])) dst[i] = src[i];
        else dst[i] = dst[i-1] + k * (src[i] - dst[i-1]);
    }
}

APEX_API void apex_sma(const double* src, double* dst, int n, int period)
{
    fill_nan(dst, n);
    if (n < period || period <= 0) return;
    for (int i = period - 1; i < n; ++i) {
        double s = 0.0;
        for (int j = i - period + 1; j <= i; ++j) s += src[j];
        dst[i] = s / period;
    }
}

APEX_API void apex_wma(const double* src, double* dst, int n, int period)
{
    fill_nan(dst, n);
    if (n < period || period <= 0) return;
    double denom = (double)period * (period + 1) / 2.0;
    for (int i = period - 1; i < n; ++i) {
        double s = 0.0;
        for (int j = 0; j < period; ++j)
            s += src[i - period + 1 + j] * (j + 1);
        dst[i] = s / denom;
    }
}

APEX_API void apex_hma(const double* src, double* dst, int n, int period)
{
    fill_nan(dst, n);
    if (n <= 0 || period <= 0) return;
    int half = std::max(1, period / 2);
    int sq   = std::max(1, (int)std::round(std::sqrt((double)period)));

    std::vector<double> wma_half(n), wma_full(n), diff(n);
    apex_wma(src, wma_half.data(), n, half);
    apex_wma(src, wma_full.data(), n, period);

    for (int i = 0; i < n; ++i) {
        if (is_valid(wma_half[i]) && is_valid(wma_full[i]))
            diff[i] = 2.0 * wma_half[i] - wma_full[i];
        else diff[i] = NaN;
    }
    apex_wma(diff.data(), dst, n, sq);
}

APEX_API void apex_wilder(const double* src, double* dst, int n, int period)
{
    /* Wilder's smoothing: first value = SMA(period), then EMA with k=1/period */
    fill_nan(dst, n);
    if (n < period || period <= 0) return;
    /* first valid SMA */
    int start = period - 1;
    double s = 0.0;
    for (int i = 0; i < period; ++i) s += src[i];
    dst[start] = s / period;
    for (int i = start + 1; i < n; ++i)
        dst[i] = dst[i-1] + (src[i] - dst[i-1]) / period;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Oscillators
 * ────────────────────────────────────────────────────────────────────────── */

APEX_API void apex_rsi(const double* close, double* dst, int n, int period)
{
    fill_nan(dst, n);
    if (n < period + 1 || period <= 0) return;

    std::vector<double> gain(n, 0.0), loss(n, 0.0);
    for (int i = 1; i < n; ++i) {
        double d = close[i] - close[i-1];
        gain[i] = d > 0 ? d : 0.0;
        loss[i] = d < 0 ? -d : 0.0;
    }
    /* Initial averages (Wilder) */
    double ag = 0.0, al = 0.0;
    for (int i = 1; i <= period; ++i) { ag += gain[i]; al += loss[i]; }
    ag /= period; al /= period;
    dst[period] = al == 0.0 ? 100.0 : 100.0 - 100.0 / (1.0 + ag / al);

    for (int i = period + 1; i < n; ++i) {
        ag = (ag * (period - 1) + gain[i]) / period;
        al = (al * (period - 1) + loss[i]) / period;
        dst[i] = al == 0.0 ? 100.0 : 100.0 - 100.0 / (1.0 + ag / al);
    }
}

APEX_API void apex_macd(const double* close,
                         double* macd_line, double* signal_line,
                         double* histogram,
                         int n, int fast, int slow, int sig)
{
    fill_nan(macd_line, n);
    fill_nan(signal_line, n);
    fill_nan(histogram, n);
    if (n <= slow) return;

    std::vector<double> ema_fast(n), ema_slow(n);
    apex_ema(close, ema_fast.data(), n, fast);
    apex_ema(close, ema_slow.data(), n, slow);

    for (int i = 0; i < n; ++i) {
        if (is_valid(ema_fast[i]) && is_valid(ema_slow[i]))
            macd_line[i] = ema_fast[i] - ema_slow[i];
    }
    apex_ema(macd_line, signal_line, n, sig);
    for (int i = 0; i < n; ++i)
        if (is_valid(macd_line[i]) && is_valid(signal_line[i]))
            histogram[i] = macd_line[i] - signal_line[i];
}

APEX_API void apex_stochastic(const double* high, const double* low,
                               const double* close,
                               double* k_out, double* d_out,
                               int n, int k_period, int d_period, int smooth)
{
    fill_nan(k_out, n);
    fill_nan(d_out, n);
    if (n < k_period || k_period <= 0) return;

    std::vector<double> raw_k(n, NaN);
    for (int i = k_period - 1; i < n; ++i) {
        double hmax = high[i], lmin = low[i];
        for (int j = i - k_period + 1; j <= i; ++j) {
            hmax = std::max(hmax, high[j]);
            lmin = std::min(lmin, low[j]);
        }
        raw_k[i] = hmax > lmin ? 100.0 * (close[i] - lmin) / (hmax - lmin) : 50.0;
    }
    apex_sma(raw_k.data(), k_out, n, smooth);
    apex_sma(k_out, d_out, n, d_period);
}

/* ────────────────────────────────────────────────────────────────────────────
 * Volatility
 * ────────────────────────────────────────────────────────────────────────── */

APEX_API void apex_atr(const double* high, const double* low,
                        const double* close, double* dst, int n, int period)
{
    fill_nan(dst, n);
    if (n < 2 || period <= 0) return;

    std::vector<double> tr(n, NaN);
    tr[0] = high[0] - low[0];
    for (int i = 1; i < n; ++i) {
        double hl = high[i] - low[i];
        double hc = std::fabs(high[i] - close[i-1]);
        double lc = std::fabs(low[i]  - close[i-1]);
        tr[i] = std::max({hl, hc, lc});
    }
    apex_wilder(tr.data(), dst, n, period);
}

APEX_API void apex_bollinger(const double* close,
                              double* upper, double* middle, double* lower,
                              int n, int period, double std_mult)
{
    fill_nan(upper, n); fill_nan(middle, n); fill_nan(lower, n);
    if (n < period || period <= 0) return;

    apex_sma(close, middle, n, period);
    for (int i = period - 1; i < n; ++i) {
        double sd = array_std(close, i - period + 1, period);
        upper[i] = middle[i] + std_mult * sd;
        lower[i] = middle[i] - std_mult * sd;
    }
}

APEX_API void apex_supertrend(const double* high, const double* low,
                               const double* close,
                               double* st_out, double* dir_out,
                               int n, int period, double multiplier)
{
    fill_nan(st_out, n);
    fill_nan(dir_out, n);
    if (n < period + 1) return;

    std::vector<double> atr_buf(n);
    apex_atr(high, low, close, atr_buf.data(), n, period);

    double prev_st = NaN, prev_dir = 1.0;
    for (int i = period; i < n; ++i) {
        if (!is_valid(atr_buf[i])) continue;
        double mid = (high[i] + low[i]) / 2.0;
        double basic_up = mid + multiplier * atr_buf[i];
        double basic_dn = mid - multiplier * atr_buf[i];

        if (!is_valid(prev_st)) {
            st_out[i]  = basic_up;
            dir_out[i] = 1.0;
            prev_st = basic_up; prev_dir = 1.0;
            continue;
        }

        double new_dir;
        double new_st;
        if (close[i] > prev_st) {
            new_dir = 1.0;
            new_st  = prev_dir == 1.0 ? std::max(basic_dn, prev_st) : basic_dn;
        } else {
            new_dir = -1.0;
            new_st  = prev_dir == -1.0 ? std::min(basic_up, prev_st) : basic_up;
        }
        st_out[i]  = new_st;
        dir_out[i] = new_dir;
        prev_st = new_st; prev_dir = new_dir;
    }
}

/* ────────────────────────────────────────────────────────────────────────────
 * Trend
 * ────────────────────────────────────────────────────────────────────────── */

APEX_API void apex_adx(const double* high, const double* low,
                        const double* close,
                        double* adx_out, double* plus_di, double* minus_di,
                        int n, int period)
{
    fill_nan(adx_out, n); fill_nan(plus_di, n); fill_nan(minus_di, n);
    if (n < period * 2 || period <= 0) return;

    std::vector<double> tr(n,0), pdm(n,0), ndm(n,0);
    for (int i = 1; i < n; ++i) {
        double hl  = high[i] - low[i];
        double hpc = std::fabs(high[i]  - close[i-1]);
        double lpc = std::fabs(low[i]   - close[i-1]);
        tr[i]  = std::max({hl, hpc, lpc});
        double up   = high[i]  - high[i-1];
        double down = low[i-1] - low[i];
        pdm[i] = (up > down && up > 0.0)   ? up   : 0.0;
        ndm[i] = (down > up && down > 0.0) ? down : 0.0;
    }

    std::vector<double> atr_s(n), pdm_s(n), ndm_s(n);
    apex_wilder(tr.data(), atr_s.data(), n, period);
    apex_wilder(pdm.data(), pdm_s.data(), n, period);
    apex_wilder(ndm.data(), ndm_s.data(), n, period);

    std::vector<double> dx(n, NaN);
    for (int i = period; i < n; ++i) {
        if (!is_valid(atr_s[i]) || atr_s[i] == 0.0) continue;
        plus_di[i]  = 100.0 * pdm_s[i] / atr_s[i];
        minus_di[i] = 100.0 * ndm_s[i] / atr_s[i];
        double dsum = plus_di[i] + minus_di[i];
        dx[i] = dsum > 0.0 ? 100.0 * std::fabs(plus_di[i] - minus_di[i]) / dsum : 0.0;
    }
    apex_wilder(dx.data(), adx_out, n, period);
}

APEX_API void apex_ichimoku(const double* high, const double* low,
                             const double* close,
                             double* tenkan, double* kijun,
                             double* span_a, double* span_b, double* chikou,
                             int n)
{
    fill_nan(tenkan, n); fill_nan(kijun, n);
    fill_nan(span_a, n); fill_nan(span_b, n); fill_nan(chikou, n);

    auto mid_hl = [&](const double* h, const double* l, int idx, int period) -> double {
        double hmax = h[idx], lmin = l[idx];
        for (int j = std::max(0, idx - period + 1); j <= idx; ++j) {
            hmax = std::max(hmax, h[j]);
            lmin = std::min(lmin, l[j]);
        }
        return (hmax + lmin) / 2.0;
    };

    for (int i = 0; i < n; ++i) {
        if (i >= 8)  tenkan[i] = mid_hl(high, low, i, 9);
        if (i >= 25) kijun[i]  = mid_hl(high, low, i, 26);
        if (i >= 25) {
            span_a[i] = is_valid(tenkan[i]) && is_valid(kijun[i])
                        ? (tenkan[i] + kijun[i]) / 2.0 : NaN;
        }
        if (i >= 51) span_b[i] = mid_hl(high, low, i, 52);
        if (i + 26 < n) chikou[i + 26] = close[i];
    }
}

/* ────────────────────────────────────────────────────────────────────────────
 * Financial Math
 * ────────────────────────────────────────────────────────────────────────── */

APEX_API double apex_pnl_buy(double open_price, double close_price,
                              double lot_size, double pip_size, double pip_value)
{
    if (pip_size <= 0.0) return 0.0;
    double pips = (close_price - open_price) / pip_size;
    return pips * pip_value * lot_size;
}

APEX_API double apex_pnl_sell(double open_price, double close_price,
                               double lot_size, double pip_size, double pip_value)
{
    if (pip_size <= 0.0) return 0.0;
    double pips = (open_price - close_price) / pip_size;
    return pips * pip_value * lot_size;
}

APEX_API double apex_margin(double lot_size, double price,
                             double contract_size, double leverage)
{
    if (leverage <= 0.0) return 0.0;
    return (lot_size * contract_size * price) / leverage;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Statistics
 * ────────────────────────────────────────────────────────────────────────── */

APEX_API double apex_var95(const double* returns, int n, double balance)
{
    if (n < 2) return 0.0;
    double mu = 0.0, sig = 0.0;
    for (int i = 0; i < n; ++i) mu += returns[i];
    mu /= n;
    for (int i = 0; i < n; ++i) { double d = returns[i]-mu; sig += d*d; }
    sig = std::sqrt(sig / (n - 1));
    return -(mu - 1.645 * sig) * balance;
}

APEX_API double apex_cvar95(const double* returns, int n, double balance)
{
    if (n < 2) return 0.0;
    double mu = 0.0, sig = 0.0;
    for (int i = 0; i < n; ++i) mu += returns[i];
    mu /= n;
    for (int i = 0; i < n; ++i) { double d = returns[i]-mu; sig += d*d; }
    sig = std::sqrt(sig / (n - 1));
    /* φ(Φ⁻¹(0.05)) ≈ 0.10313 */
    static constexpr double phi = 0.10313;
    return -(mu - sig * phi / 0.05) * balance;
}

APEX_API double apex_max_drawdown(const double* cum_pnl, int n)
{
    if (n <= 0) return 0.0;
    double peak = cum_pnl[0], max_dd = 0.0;
    for (int i = 1; i < n; ++i) {
        if (cum_pnl[i] > peak) peak = cum_pnl[i];
        double dd = peak - cum_pnl[i];
        if (dd > max_dd) max_dd = dd;
    }
    return max_dd;
}

APEX_API double apex_sharpe(const double* returns, int n)
{
    if (n < 2) return 0.0;
    double mu = 0.0, sig = 0.0;
    for (int i = 0; i < n; ++i) mu += returns[i];
    mu /= n;
    for (int i = 0; i < n; ++i) { double d = returns[i]-mu; sig += d*d; }
    sig = std::sqrt(sig / (n - 1));
    return sig > 0.0 ? (mu / sig) * std::sqrt(252.0) : 0.0;
}

APEX_API double apex_sortino(const double* returns, int n)
{
    if (n < 2) return 0.0;
    double mu = 0.0;
    for (int i = 0; i < n; ++i) mu += returns[i];
    mu /= n;
    double down_var = 0.0; int cnt = 0;
    for (int i = 0; i < n; ++i)
        if (returns[i] < 0.0) { down_var += returns[i]*returns[i]; ++cnt; }
    if (cnt < 2) return 0.0;
    double down_sd = std::sqrt(down_var / cnt);
    return down_sd > 0.0 ? (mu / down_sd) * std::sqrt(252.0) : 0.0;
}
