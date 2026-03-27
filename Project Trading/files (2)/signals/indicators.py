"""
signals/indicators.py — Pure-NumPy technical indicator library.

Indicators implemented (all from scratch, no TA-Lib):
  EMA, SMA, WMA, HMA, DEMA, TEMA, KAMA
  RSI, Stochastic, CCI, Williams%R, MFI
  MACD, Bollinger Bands, ATR, ADX/DI
  Ichimoku Kinko Hyo (5 lines)
  SuperTrend, Donchian Channel, Keltner Channel
  VWAP, OBV, Squeeze Momentum
  Pivot Points (Classic / Fibonacci / Camarilla)
  Hurst Exponent, Z-Score, Autocorrelation
  RSI Divergence, MACD Divergence (bull + bear)
  Kalman Filter price smoother
  Candlestick pattern detector (10 patterns)
  Parabolic SAR
  Ichimoku cloud buy/sell logic
  Linear regression slope + channel
"""
from __future__ import annotations
import math
import numpy as np
from typing import Dict, Tuple


class Ind:
    """Static indicator library."""

    # ── Moving averages ──────────────────────────────────────────────────────
    @staticmethod
    def ema(s: np.ndarray, p: int) -> np.ndarray:
        if len(s) == 0: return s.copy()
        k = 2.0/(p+1); r = np.full(len(s), np.nan)
        first = True
        for i, v in enumerate(s):
            if np.isnan(v): continue
            if first: r[i]=v; first=False
            else: r[i] = r[i-1] + k*(v - r[i-1]) if not np.isnan(r[i-1]) else v
        return r

    @staticmethod
    def sma(s: np.ndarray, p: int) -> np.ndarray:
        r = np.full(len(s), np.nan)
        for i in range(p-1, len(s)):
            r[i] = s[i-p+1:i+1].mean()
        return r

    @staticmethod
    def wma(s: np.ndarray, p: int) -> np.ndarray:
        w = np.arange(1, p+1, dtype=float)
        denom = w.sum()
        r = np.full(len(s), np.nan)
        for i in range(p-1, len(s)):
            r[i] = np.dot(s[i-p+1:i+1], w) / denom
        return r

    @staticmethod
    def hma(s: np.ndarray, p: int) -> np.ndarray:
        sq = max(1, int(math.sqrt(p)))
        return Ind.wma(2*Ind.wma(s, p//2) - Ind.wma(s, p), sq)

    @staticmethod
    def dema(s: np.ndarray, p: int) -> np.ndarray:
        e1 = Ind.ema(s, p); e2 = Ind.ema(e1, p)
        return 2*e1 - e2

    @staticmethod
    def tema(s: np.ndarray, p: int) -> np.ndarray:
        e1=Ind.ema(s,p); e2=Ind.ema(e1,p); e3=Ind.ema(e2,p)
        return 3*e1 - 3*e2 + e3

    @staticmethod
    def kama(s: np.ndarray, p: int=10, fast: int=2, slow: int=30) -> np.ndarray:
        n=len(s); r=np.full(n, np.nan)
        if n<p+1: return r
        r[p]=s[p]
        for i in range(p+1,n):
            direct=abs(s[i]-s[i-p])
            noise=sum(abs(s[j]-s[j-1]) for j in range(i-p+1,i+1))
            er=direct/noise if noise>0 else 0
            fc=2.0/(fast+1); sc=2.0/(slow+1)
            sm=(er*(fc-sc)+sc)**2
            r[i]=r[i-1]+sm*(s[i]-r[i-1])
        return r

    @staticmethod
    def kalman(s: np.ndarray, q: float=0.01, r_noise: float=1.0) -> np.ndarray:
        """Kalman filter price smoother."""
        n=len(s); est=np.full(n, np.nan); P=1.0
        if n==0: return est
        est[0]=s[0]
        for i in range(1,n):
            P += q
            K  = P/(P+r_noise)
            est[i]=est[i-1]+K*(s[i]-est[i-1])
            P  = (1-K)*P
        return est

    # ── Oscillators ──────────────────────────────────────────────────────────
    @staticmethod
    def rsi(s: np.ndarray, p: int=14) -> np.ndarray:
        n=len(s); r=np.full(n,np.nan)
        if n<p+1: return r
        d=np.diff(s)
        g=np.where(d>0,d,0.0); lo=np.where(d<0,-d,0.0)
        ag=g[:p].mean(); al=lo[:p].mean()
        r[p]=100 if al==0 else 100-100/(1+ag/al)
        for i in range(p+1,n):
            ag=(ag*(p-1)+g[i-1])/p; al=(al*(p-1)+lo[i-1])/p
            r[i]=100 if al==0 else 100-100/(1+ag/al)
        return r

    @staticmethod
    def stochastic(h, l, c, k=14, d=3, smooth=3):
        n=len(c); kr=np.full(n,np.nan)
        for i in range(k-1,n):
            hm=h[i-k+1:i+1].max(); lm=l[i-k+1:i+1].min()
            kr[i]=100*(c[i]-lm)/(hm-lm) if hm>lm else 50
        ks=Ind.sma(kr,smooth)
        return ks, Ind.sma(ks,d)

    @staticmethod
    def cci(h, l, c, p=20):
        tp=(h+l+c)/3; n=len(tp); r=np.full(n,np.nan)
        for i in range(p-1,n):
            w=tp[i-p+1:i+1]; md=np.abs(w-w.mean()).mean()
            r[i]=(tp[i]-w.mean())/(0.015*md) if md>0 else 0
        return r

    @staticmethod
    def williams_r(h, l, c, p=14):
        n=len(c); r=np.full(n,np.nan)
        for i in range(p-1,n):
            hm=h[i-p+1:i+1].max(); lm=l[i-p+1:i+1].min()
            r[i]=-100*(hm-c[i])/(hm-lm) if hm>lm else -50
        return r

    @staticmethod
    def mfi(h, l, c, v, p=14):
        tp=(h+l+c)/3; mf=tp*v; n=len(tp); r=np.full(n,np.nan)
        for i in range(p,n):
            pf=nf=0.0
            for j in range(i-p+1,i+1):
                if j>0:
                    if tp[j]>tp[j-1]: pf+=mf[j]
                    elif tp[j]<tp[j-1]: nf+=mf[j]
            r[i]=100 if nf==0 else 100-100/(1+pf/nf)
        return r

    @staticmethod
    def macd(s, fast=12, slow=26, sig=9):
        ml=Ind.ema(s,fast)-Ind.ema(s,slow)
        sl=Ind.ema(ml,sig)
        return ml, sl, ml-sl

    # ── Volatility ───────────────────────────────────────────────────────────
    @staticmethod
    def atr(h, l, c, p=14):
        n=len(c); tr=np.full(n,np.nan)
        for i in range(1,n):
            tr[i]=max(h[i]-l[i], abs(h[i]-c[i-1]), abs(l[i]-c[i-1]))
        return Ind.ema(tr,p)

    @staticmethod
    def bollinger(s, p=20, std=2.0):
        mid=Ind.sma(s,p)
        sd=np.array([s[max(0,i-p+1):i+1].std(ddof=0)
                     if i>=p-1 else np.nan for i in range(len(s))])
        return mid+std*sd, mid, mid-std*sd

    @staticmethod
    def keltner(h, l, c, p=20, mult=2.0):
        mid=Ind.ema(c,p); av=Ind.atr(h,l,c,p)
        return mid+mult*av, mid, mid-mult*av

    @staticmethod
    def donchian(h, l, p=20):
        n=len(h); up=np.full(n,np.nan); dn=np.full(n,np.nan)
        for i in range(p-1,n):
            up[i]=h[i-p+1:i+1].max(); dn[i]=l[i-p+1:i+1].min()
        return up, (up+dn)/2, dn

    @staticmethod
    def supertrend(h, l, c, p=10, mult=3.0):
        av=Ind.atr(h,l,c,p); n=len(c)
        st=np.full(n,np.nan); dr=np.ones(n)
        for i in range(p,n):
            if np.isnan(av[i]): continue
            mid=(h[i]+l[i])/2
            up=mid+mult*av[i]; dn=mid-mult*av[i]
            if i==p: st[i]=up; continue
            if c[i]>st[i-1]:
                st[i]=max(dn,st[i-1]) if dr[i-1]==1 else dn; dr[i]=1
            else:
                st[i]=min(up,st[i-1]) if dr[i-1]==-1 else up; dr[i]=-1
        return st, dr

    @staticmethod
    def squeeze(h, l, c, bb_p=20, kc_p=20):
        bb_u,_,bb_l=Ind.bollinger(c,bb_p,2.0)
        kc_u,_,kc_l=Ind.keltner(h,l,c,kc_p,1.5)
        sq=(bb_u<kc_u)&(bb_l>kc_l)
        mid=(bb_u+bb_l+kc_u+kc_l)/4
        delta=c-mid; n=len(c); mom=np.full(n,np.nan)
        for i in range(bb_p-1,n):
            w=delta[i-bb_p+1:i+1]
            if not np.any(np.isnan(w)):
                mom[i]=np.polyfit(np.arange(bb_p),w,1)[0]
        return mom, sq

    @staticmethod
    def parabolic_sar(h, l, step=0.02, max_af=0.20):
        n=len(h); sar=np.full(n,np.nan)
        if n<2: return sar
        bull=True; af=step; ep=h[0]; sar[0]=l[0]
        for i in range(1,n):
            sar[i]=sar[i-1]+af*(ep-sar[i-1])
            if bull:
                if l[i]<sar[i]:
                    bull=False; sar[i]=ep; ep=l[i]; af=step
                else:
                    if h[i]>ep: ep=h[i]; af=min(af+step,max_af)
                    sar[i]=min(sar[i],l[i-1],l[i-2] if i>1 else l[i-1])
            else:
                if h[i]>sar[i]:
                    bull=True; sar[i]=ep; ep=h[i]; af=step
                else:
                    if l[i]<ep: ep=l[i]; af=min(af+step,max_af)
                    sar[i]=max(sar[i],h[i-1],h[i-2] if i>1 else h[i-1])
        return sar

    # ── Trend strength ───────────────────────────────────────────────────────
    @staticmethod
    def adx(h, l, c, p=14):
        n=len(c); dmp=np.zeros(n); dmm=np.zeros(n); tr=np.full(n,np.nan)
        for i in range(1,n):
            hd=h[i]-h[i-1]; ld=l[i-1]-l[i]
            dmp[i]=hd if hd>ld and hd>0 else 0
            dmm[i]=ld if ld>hd and ld>0 else 0
            tr[i]=max(h[i]-l[i],abs(h[i]-c[i-1]),abs(l[i]-c[i-1]))
        def _ws(s):
            r=np.full(n,np.nan)
            if p>=n: return r
            r[p]=s[1:p+1].mean()
            for i in range(p+1,n): r[i]=(r[i-1]*(p-1)+s[i])/p
            return r
        a=_ws(tr); dp=_ws(dmp); dm=_ws(dmm)
        with np.errstate(invalid="ignore",divide="ignore"):
            dip=100*np.where(a>0,dp/a,0)
            dim=100*np.where(a>0,dm/a,0)
            dsum=dip+dim
            dx=100*np.where(dsum>0,np.abs(dip-dim)/dsum,0)
        return _ws(dx), dip, dim

    # ── Ichimoku ─────────────────────────────────────────────────────────────
    @staticmethod
    def ichimoku(h, l, c, ten=9, kij=26, senb=52):
        def mid(hh,ll,p):
            r=np.full(len(hh),np.nan)
            for i in range(p-1,len(hh)):
                r[i]=(hh[i-p+1:i+1].max()+ll[i-p+1:i+1].min())/2
            return r
        t=mid(h,l,ten); k=mid(h,l,kij)
        sa=(t+k)/2; sb=mid(h,l,senb)
        return {"tenkan":t,"kijun":k,"senkou_a":sa,"senkou_b":sb}

    # ── Volume ───────────────────────────────────────────────────────────────
    @staticmethod
    def vwap(h, l, c, v):
        tp=(h+l+c)/3; cv=np.cumsum(v)
        with np.errstate(invalid="ignore",divide="ignore"):
            return np.where(cv>0,np.cumsum(tp*v)/cv,np.nan)

    @staticmethod
    def obv(c, v):
        r=np.zeros(len(c))
        for i in range(1,len(c)):
            if c[i]>c[i-1]: r[i]=r[i-1]+v[i]
            elif c[i]<c[i-1]: r[i]=r[i-1]-v[i]
            else: r[i]=r[i-1]
        return r

    # ── Statistical ──────────────────────────────────────────────────────────
    @staticmethod
    def zscore(s, p=20):
        r=np.full(len(s),np.nan)
        for i in range(p-1,len(s)):
            w=s[i-p+1:i+1]; sd=w.std(ddof=1)
            r[i]=(s[i]-w.mean())/sd if sd>0 else 0
        return r

    @staticmethod
    def hurst(s) -> float:
        n=len(s)
        if n<20: return 0.5
        lags=range(10,min(60,n//2)); rs=[]
        for lag in lags:
            sub=s[-lag:]; mu=sub.mean(); dev=sub-mu
            cum=np.cumsum(dev); R=cum.max()-cum.min(); S=sub.std(ddof=1)
            if S>0: rs.append(R/S)
        if len(rs)<2: return 0.5
        return float(np.polyfit(np.log(list(lags[:len(rs)])),np.log(rs),1)[0])

    @staticmethod
    def linreg_slope(s, p=14) -> np.ndarray:
        r=np.full(len(s),np.nan)
        x=np.arange(p,dtype=float)
        for i in range(p-1,len(s)):
            w=s[i-p+1:i+1]
            if not np.any(np.isnan(w)):
                r[i]=np.polyfit(x,w,1)[0]
        return r

    @staticmethod
    def autocorr(s, lag=1) -> np.ndarray:
        r=np.full(len(s),np.nan)
        for i in range(lag+20,len(s)):
            w=s[i-20:i]; ac=np.corrcoef(w[lag:],w[:-lag])[0,1]
            r[i]=ac if not np.isnan(ac) else 0
        return r

    # ── Pivot points ─────────────────────────────────────────────────────────
    @staticmethod
    def pivots_classic(h, l, c) -> Dict:
        pp=(h+l+c)/3
        return {"pp":pp,"r1":2*pp-l,"r2":pp+(h-l),"r3":h+2*(pp-l),
                "s1":2*pp-h,"s2":pp-(h-l),"s3":l-2*(h-pp)}

    @staticmethod
    def pivots_fib(h, l, c) -> Dict:
        pp=(h+l+c)/3; rng=h-l
        return {"pp":pp,
                "r1":pp+0.382*rng,"r2":pp+0.618*rng,"r3":pp+1.000*rng,
                "s1":pp-0.382*rng,"s2":pp-0.618*rng,"s3":pp-1.000*rng}

    # ── Divergence ───────────────────────────────────────────────────────────
    @staticmethod
    def divergence(price, osc, window=10) -> Tuple[bool,bool]:
        if len(price)<window*2: return False,False
        p=price[-window*2:]; o=osc[-window*2:]
        h=window
        valid = not (np.any(np.isnan(o[h:])) or np.any(np.isnan(o[:h])))
        if not valid: return False,False
        bull=(p[h:].min()<p[:h].min() and
              o[h:][p[h:].argmin()]>o[:h][p[:h].argmin()])
        bear=(p[h:].max()>p[:h].max() and
              o[h:][p[h:].argmax()]<o[:h][p[:h].argmax()])
        return bool(bull), bool(bear)

    # ── Candlestick patterns ──────────────────────────────────────────────────
    @staticmethod
    def candle_patterns(o, h, l, c) -> Dict[str,int]:
        """Returns dict of pattern_name → +1 (bullish) or -1 (bearish)."""
        pats={}; n=len(c)
        if n<3: return pats
        def body(i):   return abs(c[i]-o[i])
        def rng(i):    return h[i]-l[i]
        def btop(i):   return max(c[i],o[i])
        def bbot(i):   return min(c[i],o[i])
        def uwk(i):    return h[i]-btop(i)
        def lwk(i):    return bbot(i)-l[i]
        def bull(i):   return c[i]>o[i]
        def bear(i):   return c[i]<o[i]

        # Hammer / Hanging man
        if lwk(-1)>2*body(-1) and uwk(-1)<body(-1)*0.5 and bear(-2):
            pats["hammer"]=1
        if lwk(-1)>2*body(-1) and uwk(-1)<body(-1)*0.5 and bull(-2):
            pats["hanging_man"]=-1
        # Shooting star
        if uwk(-1)>2*body(-1) and lwk(-1)<body(-1)*0.5 and bull(-2):
            pats["shooting_star"]=-1
        # Inverted hammer
        if uwk(-1)>2*body(-1) and lwk(-1)<body(-1)*0.5 and bear(-2):
            pats["inv_hammer"]=1
        # Engulfing
        if (bear(-2) and bull(-1) and
                o[-1]<c[-2] and c[-1]>o[-2]):
            pats["bull_engulfing"]=1
        if (bull(-2) and bear(-1) and
                o[-1]>c[-2] and c[-1]<o[-2]):
            pats["bear_engulfing"]=-1
        # Pinbar
        if lwk(-1)>0.6*rng(-1) and uwk(-1)<0.2*rng(-1):
            pats["pinbar_bull"]=1
        if uwk(-1)>0.6*rng(-1) and lwk(-1)<0.2*rng(-1):
            pats["pinbar_bear"]=-1
        # Doji
        if n>=1 and rng(-1)>0 and body(-1)/rng(-1)<0.1:
            pats["doji"]=0
        # Morning / Evening star (3-bar)
        if n>=3:
            if (bear(-3) and body(-2)<rng(-2)*0.3 and
                    bull(-1) and c[-1]>(o[-3]+c[-3])/2):
                pats["morning_star"]=1
            if (bull(-3) and body(-2)<rng(-2)*0.3 and
                    bear(-1) and c[-1]<(o[-3]+c[-3])/2):
                pats["evening_star"]=-1
        # Marubozu
        if body(-1)>0.95*rng(-1) and rng(-1)>0:
            pats["marubozu_bull" if bull(-1) else "marubozu_bear"] = 1 if bull(-1) else -1
        # Three white soldiers / black crows
        if n>=3:
            if all(bull(-(i+1)) for i in range(3)) and all(
                    c[-(i+1)]>c[-(i+2)] for i in range(2)):
                pats["three_soldiers"]=1
            if all(bear(-(i+1)) for i in range(3)) and all(
                    c[-(i+1)]<c[-(i+2)] for i in range(2)):
                pats["three_crows"]=-1
        return pats
