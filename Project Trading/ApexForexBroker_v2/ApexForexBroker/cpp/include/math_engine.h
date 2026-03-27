/**
 * math_engine.h
 * =============
 * Apex Forex Broker v2.0 — C++ High-Performance Math Engine
 *
 * Provides optimised indicator calculations and financial math routines
 * callable from Python via ctypes / cffi with zero-copy double arrays.
 *
 * Compile to shared library:
 *   Windows : cl /O2 /LD /Fe:math_engine.dll math_engine.cpp
 *   Linux   : g++ -O3 -shared -fPIC -o math_engine.so math_engine.cpp -lm
 *   macOS   : g++ -O3 -shared -fPIC -o math_engine.dylib math_engine.cpp -lm
 *
 * Python usage (via bridge.py):
 *   from cpp.bridge import MathEngine
 *   eng = MathEngine()
 *   ema = eng.ema(close_array, period=14)
 */

#pragma once
#ifdef _WIN32
  #define APEX_API __declspec(dllexport)
#else
  #define APEX_API __attribute__((visibility("default")))
#endif

#ifdef __cplusplus
extern "C" {
#endif

/* ── Version ───────────────────────────────────────────────────── */
APEX_API const char* apex_version(void);

/* ── Moving Averages ───────────────────────────────────────────── */
APEX_API void apex_ema(const double* src, double* dst, int n, int period);
APEX_API void apex_sma(const double* src, double* dst, int n, int period);
APEX_API void apex_wma(const double* src, double* dst, int n, int period);
APEX_API void apex_hma(const double* src, double* dst, int n, int period);
APEX_API void apex_wilder(const double* src, double* dst, int n, int period);

/* ── Oscillators ───────────────────────────────────────────────── */
APEX_API void apex_rsi(const double* close, double* dst, int n, int period);
APEX_API void apex_macd(const double* close,
                         double* macd_line, double* signal_line,
                         double* histogram,
                         int n, int fast, int slow, int sig);
APEX_API void apex_stochastic(const double* high, const double* low,
                               const double* close,
                               double* k_out, double* d_out,
                               int n, int k_period, int d_period, int smooth);

/* ── Volatility ────────────────────────────────────────────────── */
APEX_API void apex_atr(const double* high, const double* low,
                        const double* close,
                        double* dst, int n, int period);
APEX_API void apex_bollinger(const double* close,
                              double* upper, double* middle, double* lower,
                              int n, int period, double std_mult);
APEX_API void apex_supertrend(const double* high, const double* low,
                               const double* close,
                               double* st_out, double* dir_out,
                               int n, int period, double multiplier);

/* ── Trend ─────────────────────────────────────────────────────── */
APEX_API void apex_adx(const double* high, const double* low,
                        const double* close,
                        double* adx_out, double* plus_di, double* minus_di,
                        int n, int period);
APEX_API void apex_ichimoku(const double* high, const double* low,
                             const double* close,
                             double* tenkan, double* kijun,
                             double* span_a,  double* span_b, double* chikou,
                             int n);

/* ── Financial Math ────────────────────────────────────────────── */
APEX_API double apex_pnl_buy(double open_price, double close_price,
                              double lot_size, double pip_size, double pip_value);
APEX_API double apex_pnl_sell(double open_price, double close_price,
                               double lot_size, double pip_size, double pip_value);
APEX_API double apex_margin(double lot_size, double price,
                             double contract_size, double leverage);

/* ── Statistics ────────────────────────────────────────────────── */
APEX_API double apex_var95(const double* returns, int n, double balance);
APEX_API double apex_cvar95(const double* returns, int n, double balance);
APEX_API double apex_max_drawdown(const double* cum_pnl, int n);
APEX_API double apex_sharpe(const double* returns, int n);
APEX_API double apex_sortino(const double* returns, int n);

#ifdef __cplusplus
}
#endif
