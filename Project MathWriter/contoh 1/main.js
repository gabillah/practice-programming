!function(e) {
    function t(r) {
        if (n[r])
            return n[r].exports;
        var o = n[r] = {
            i: r,
            l: !1,
            exports: {}
        };
        return e[r].call(o.exports, o, o.exports, t),
        o.l = !0,
        o.exports
    }
    var n = {};
    t.m = e,
    t.c = n,
    t.d = function(e, n, r) {
        t.o(e, n) || Object.defineProperty(e, n, {
            configurable: !1,
            enumerable: !0,
            get: r
        })
    }
    ,
    t.n = function(e) {
        var n = e && e.__esModule ? function() {
            return e.default
        }
        : function() {
            return e
        }
        ;
        return t.d(n, "a", n),
        n
    }
    ,
    t.o = function(e, t) {
        return Object.prototype.hasOwnProperty.call(e, t)
    }
    ,
    t.p = "/",
    t(t.s = 535)
}([function(e, t, n) {
    "use strict";
    e.exports = n(140)
}
, function(e, t, n) {
    (function(e, r) {
        var o;
        (function() {
            function i(e, t) {
                return e.set(t[0], t[1]),
                e
            }
            function a(e, t) {
                return e.add(t),
                e
            }
            function u(e, t, n) {
                switch (n.length) {
                case 0:
                    return e.call(t);
                case 1:
                    return e.call(t, n[0]);
                case 2:
                    return e.call(t, n[0], n[1]);
                case 3:
                    return e.call(t, n[0], n[1], n[2])
                }
                return e.apply(t, n)
            }
            function l(e, t, n, r) {
                for (var o = -1, i = null == e ? 0 : e.length; ++o < i; ) {
                    var a = e[o];
                    t(r, a, n(a), e)
                }
                return r
            }
            function s(e, t) {
                for (var n = -1, r = null == e ? 0 : e.length; ++n < r && !1 !== t(e[n], n, e); )
                    ;
                return e
            }
            function c(e, t) {
                for (var n = null == e ? 0 : e.length; n-- && !1 !== t(e[n], n, e); )
                    ;
                return e
            }
            function f(e, t) {
                for (var n = -1, r = null == e ? 0 : e.length; ++n < r; )
                    if (!t(e[n], n, e))
                        return !1;
                return !0
            }
            function d(e, t) {
                for (var n = -1, r = null == e ? 0 : e.length, o = 0, i = []; ++n < r; ) {
                    var a = e[n];
                    t(a, n, e) && (i[o++] = a)
                }
                return i
            }
            function p(e, t) {
                return !!(null == e ? 0 : e.length) && k(e, t, 0) > -1
            }
            function h(e, t, n) {
                for (var r = -1, o = null == e ? 0 : e.length; ++r < o; )
                    if (n(t, e[r]))
                        return !0;
                return !1
            }
            function y(e, t) {
                for (var n = -1, r = null == e ? 0 : e.length, o = Array(r); ++n < r; )
                    o[n] = t(e[n], n, e);
                return o
            }
            function m(e, t) {
                for (var n = -1, r = t.length, o = e.length; ++n < r; )
                    e[o + n] = t[n];
                return e
            }
            function v(e, t, n, r) {
                var o = -1
                  , i = null == e ? 0 : e.length;
                for (r && i && (n = e[++o]); ++o < i; )
                    n = t(n, e[o], o, e);
                return n
            }
            function g(e, t, n, r) {
                var o = null == e ? 0 : e.length;
                for (r && o && (n = e[--o]); o--; )
                    n = t(n, e[o], o, e);
                return n
            }
            function b(e, t) {
                for (var n = -1, r = null == e ? 0 : e.length; ++n < r; )
                    if (t(e[n], n, e))
                        return !0;
                return !1
            }
            function x(e) {
                return e.split("")
            }
            function w(e) {
                return e.match(Ut) || []
            }
            function C(e, t, n) {
                var r;
                return n(e, function(e, n, o) {
                    if (t(e, n, o))
                        return r = n,
                        !1
                }),
                r
            }
            function E(e, t, n, r) {
                for (var o = e.length, i = n + (r ? 1 : -1); r ? i-- : ++i < o; )
                    if (t(e[i], i, e))
                        return i;
                return -1
            }
            function k(e, t, n) {
                return t === t ? X(e, t, n) : E(e, A, n)
            }
            function _(e, t, n, r) {
                for (var o = n - 1, i = e.length; ++o < i; )
                    if (r(e[o], t))
                        return o;
                return -1
            }
            function A(e) {
                return e !== e
            }
            function S(e, t) {
                var n = null == e ? 0 : e.length;
                return n ? D(e, t) / n : je
            }
            function O(e) {
                return function(t) {
                    return null == t ? oe : t[e]
                }
            }
            function P(e) {
                return function(t) {
                    return null == e ? oe : e[t]
                }
            }
            function M(e, t, n, r, o) {
                return o(e, function(e, o, i) {
                    n = r ? (r = !1,
                    e) : t(n, e, o, i)
                }),
                n
            }
            function I(e, t) {
                var n = e.length;
                for (e.sort(t); n--; )
                    e[n] = e[n].value;
                return e
            }
            function D(e, t) {
                for (var n, r = -1, o = e.length; ++r < o; ) {
                    var i = t(e[r]);
                    i !== oe && (n = n === oe ? i : n + i)
                }
                return n
            }
            function T(e, t) {
                for (var n = -1, r = Array(e); ++n < e; )
                    r[n] = t(n);
                return r
            }
            function B(e, t) {
                return y(t, function(t) {
                    return [t, e[t]]
                })
            }
            function j(e) {
                return function(t) {
                    return e(t)
                }
            }
            function L(e, t) {
                return y(t, function(t) {
                    return e[t]
                })
            }
            function R(e, t) {
                return e.has(t)
            }
            function F(e, t) {
                for (var n = -1, r = e.length; ++n < r && k(t, e[n], 0) > -1; )
                    ;
                return n
            }
            function N(e, t) {
                for (var n = e.length; n-- && k(t, e[n], 0) > -1; )
                    ;
                return n
            }
            function U(e, t) {
                for (var n = e.length, r = 0; n--; )
                    e[n] === t && ++r;
                return r
            }
            function z(e) {
                return "\\" + On[e]
            }
            function H(e, t) {
                return null == e ? oe : e[t]
            }
            function W(e) {
                return bn.test(e)
            }
            function q(e) {
                return xn.test(e)
            }
            function G(e) {
                for (var t, n = []; !(t = e.next()).done; )
                    n.push(t.value);
                return n
            }
            function V(e) {
                var t = -1
                  , n = Array(e.size);
                return e.forEach(function(e, r) {
                    n[++t] = [r, e]
                }),
                n
            }
            function K(e, t) {
                return function(n) {
                    return e(t(n))
                }
            }
            function Q(e, t) {
                for (var n = -1, r = e.length, o = 0, i = []; ++n < r; ) {
                    var a = e[n];
                    a !== t && a !== ce || (e[n] = ce,
                    i[o++] = n)
                }
                return i
            }
            function J(e) {
                var t = -1
                  , n = Array(e.size);
                return e.forEach(function(e) {
                    n[++t] = e
                }),
                n
            }
            function Y(e) {
                var t = -1
                  , n = Array(e.size);
                return e.forEach(function(e) {
                    n[++t] = [e, e]
                }),
                n
            }
            function X(e, t, n) {
                for (var r = n - 1, o = e.length; ++r < o; )
                    if (e[r] === t)
                        return r;
                return -1
            }
            function Z(e, t, n) {
                for (var r = n + 1; r--; )
                    if (e[r] === t)
                        return r;
                return r
            }
            function $(e) {
                return W(e) ? te(e) : Gn(e)
            }
            function ee(e) {
                return W(e) ? ne(e) : x(e)
            }
            function te(e) {
                for (var t = vn.lastIndex = 0; vn.test(e); )
                    ++t;
                return t
            }
            function ne(e) {
                return e.match(vn) || []
            }
            function re(e) {
                return e.match(gn) || []
            }
            var oe, ie = 200, ae = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", ue = "Expected a function", le = "__lodash_hash_undefined__", se = 500, ce = "__lodash_placeholder__", fe = 1, de = 2, pe = 4, he = 1, ye = 2, me = 1, ve = 2, ge = 4, be = 8, xe = 16, we = 32, Ce = 64, Ee = 128, ke = 256, _e = 512, Ae = 30, Se = "...", Oe = 800, Pe = 16, Me = 1, Ie = 2, De = 1 / 0, Te = 9007199254740991, Be = 1.7976931348623157e308, je = NaN, Le = 4294967295, Re = Le - 1, Fe = Le >>> 1, Ne = [["ary", Ee], ["bind", me], ["bindKey", ve], ["curry", be], ["curryRight", xe], ["flip", _e], ["partial", we], ["partialRight", Ce], ["rearg", ke]], Ue = "[object Arguments]", ze = "[object Array]", He = "[object AsyncFunction]", We = "[object Boolean]", qe = "[object Date]", Ge = "[object DOMException]", Ve = "[object Error]", Ke = "[object Function]", Qe = "[object GeneratorFunction]", Je = "[object Map]", Ye = "[object Number]", Xe = "[object Null]", Ze = "[object Object]", $e = "[object Proxy]", et = "[object RegExp]", tt = "[object Set]", nt = "[object String]", rt = "[object Symbol]", ot = "[object Undefined]", it = "[object WeakMap]", at = "[object WeakSet]", ut = "[object ArrayBuffer]", lt = "[object DataView]", st = "[object Float32Array]", ct = "[object Float64Array]", ft = "[object Int8Array]", dt = "[object Int16Array]", pt = "[object Int32Array]", ht = "[object Uint8Array]", yt = "[object Uint8ClampedArray]", mt = "[object Uint16Array]", vt = "[object Uint32Array]", gt = /\b__p \+= '';/g, bt = /\b(__p \+=) '' \+/g, xt = /(__e\(.*?\)|\b__t\)) \+\n'';/g, wt = /&(?:amp|lt|gt|quot|#39);/g, Ct = /[&<>"']/g, Et = RegExp(wt.source), kt = RegExp(Ct.source), _t = /<%-([\s\S]+?)%>/g, At = /<%([\s\S]+?)%>/g, St = /<%=([\s\S]+?)%>/g, Ot = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, Pt = /^\w*$/, Mt = /^\./, It = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, Dt = /[\\^$.*+?()[\]{}|]/g, Tt = RegExp(Dt.source), Bt = /^\s+|\s+$/g, jt = /^\s+/, Lt = /\s+$/, Rt = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, Ft = /\{\n\/\* \[wrapped with (.+)\] \*/, Nt = /,? & /, Ut = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g, zt = /\\(\\)?/g, Ht = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, Wt = /\w*$/, qt = /^[-+]0x[0-9a-f]+$/i, Gt = /^0b[01]+$/i, Vt = /^\[object .+?Constructor\]$/, Kt = /^0o[0-7]+$/i, Qt = /^(?:0|[1-9]\d*)$/, Jt = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g, Yt = /($^)/, Xt = /['\n\r\u2028\u2029\\]/g, Zt = "\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff", $t = "\\xac\\xb1\\xd7\\xf7\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf\\u2000-\\u206f \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", en = "[" + $t + "]", tn = "[" + Zt + "]", nn = "[a-z\\xdf-\\xf6\\xf8-\\xff]", rn = "[^\\ud800-\\udfff" + $t + "\\d+\\u2700-\\u27bfa-z\\xdf-\\xf6\\xf8-\\xffA-Z\\xc0-\\xd6\\xd8-\\xde]", on = "\\ud83c[\\udffb-\\udfff]", an = "(?:\\ud83c[\\udde6-\\uddff]){2}", un = "[\\ud800-\\udbff][\\udc00-\\udfff]", ln = "[A-Z\\xc0-\\xd6\\xd8-\\xde]", sn = "(?:" + nn + "|" + rn + ")", cn = "(?:[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]|\\ud83c[\\udffb-\\udfff])?", fn = "(?:\\u200d(?:" + ["[^\\ud800-\\udfff]", an, un].join("|") + ")[\\ufe0e\\ufe0f]?" + cn + ")*", dn = "[\\ufe0e\\ufe0f]?" + cn + fn, pn = "(?:" + ["[\\u2700-\\u27bf]", an, un].join("|") + ")" + dn, hn = "(?:" + ["[^\\ud800-\\udfff]" + tn + "?", tn, an, un, "[\\ud800-\\udfff]"].join("|") + ")", yn = RegExp("['’]", "g"), mn = RegExp(tn, "g"), vn = RegExp(on + "(?=" + on + ")|" + hn + dn, "g"), gn = RegExp([ln + "?" + nn + "+(?:['’](?:d|ll|m|re|s|t|ve))?(?=" + [en, ln, "$"].join("|") + ")", "(?:[A-Z\\xc0-\\xd6\\xd8-\\xde]|[^\\ud800-\\udfff\\xac\\xb1\\xd7\\xf7\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf\\u2000-\\u206f \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000\\d+\\u2700-\\u27bfa-z\\xdf-\\xf6\\xf8-\\xffA-Z\\xc0-\\xd6\\xd8-\\xde])+(?:['’](?:D|LL|M|RE|S|T|VE))?(?=" + [en, ln + sn, "$"].join("|") + ")", ln + "?" + sn + "+(?:['’](?:d|ll|m|re|s|t|ve))?", ln + "+(?:['’](?:D|LL|M|RE|S|T|VE))?", "\\d*(?:(?:1ST|2ND|3RD|(?![123])\\dTH)\\b)", "\\d*(?:(?:1st|2nd|3rd|(?![123])\\dth)\\b)", "\\d+", pn].join("|"), "g"), bn = RegExp("[\\u200d\\ud800-\\udfff" + Zt + "\\ufe0e\\ufe0f]"), xn = /[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/, wn = ["Array", "Buffer", "DataView", "Date", "Error", "Float32Array", "Float64Array", "Function", "Int8Array", "Int16Array", "Int32Array", "Map", "Math", "Object", "Promise", "RegExp", "Set", "String", "Symbol", "TypeError", "Uint8Array", "Uint8ClampedArray", "Uint16Array", "Uint32Array", "WeakMap", "_", "clearTimeout", "isFinite", "parseInt", "setTimeout"], Cn = -1, En = {};
            En[st] = En[ct] = En[ft] = En[dt] = En[pt] = En[ht] = En[yt] = En[mt] = En[vt] = !0,
            En[Ue] = En[ze] = En[ut] = En[We] = En[lt] = En[qe] = En[Ve] = En[Ke] = En[Je] = En[Ye] = En[Ze] = En[et] = En[tt] = En[nt] = En[it] = !1;
            var kn = {};
            kn[Ue] = kn[ze] = kn[ut] = kn[lt] = kn[We] = kn[qe] = kn[st] = kn[ct] = kn[ft] = kn[dt] = kn[pt] = kn[Je] = kn[Ye] = kn[Ze] = kn[et] = kn[tt] = kn[nt] = kn[rt] = kn[ht] = kn[yt] = kn[mt] = kn[vt] = !0,
            kn[Ve] = kn[Ke] = kn[it] = !1;
            var _n = {
                "À": "A",
                "Á": "A",
                "Â": "A",
                "Ã": "A",
                "Ä": "A",
                "Å": "A",
                "à": "a",
                "á": "a",
                "â": "a",
                "ã": "a",
                "ä": "a",
                "å": "a",
                "Ç": "C",
                "ç": "c",
                "Ð": "D",
                "ð": "d",
                "È": "E",
                "É": "E",
                "Ê": "E",
                "Ë": "E",
                "è": "e",
                "é": "e",
                "ê": "e",
                "ë": "e",
                "Ì": "I",
                "Í": "I",
                "Î": "I",
                "Ï": "I",
                "ì": "i",
                "í": "i",
                "î": "i",
                "ï": "i",
                "Ñ": "N",
                "ñ": "n",
                "Ò": "O",
                "Ó": "O",
                "Ô": "O",
                "Õ": "O",
                "Ö": "O",
                "Ø": "O",
                "ò": "o",
                "ó": "o",
                "ô": "o",
                "õ": "o",
                "ö": "o",
                "ø": "o",
                "Ù": "U",
                "Ú": "U",
                "Û": "U",
                "Ü": "U",
                "ù": "u",
                "ú": "u",
                "û": "u",
                "ü": "u",
                "Ý": "Y",
                "ý": "y",
                "ÿ": "y",
                "Æ": "Ae",
                "æ": "ae",
                "Þ": "Th",
                "þ": "th",
                "ß": "ss",
                "Ā": "A",
                "Ă": "A",
                "Ą": "A",
                "ā": "a",
                "ă": "a",
                "ą": "a",
                "Ć": "C",
                "Ĉ": "C",
                "Ċ": "C",
                "Č": "C",
                "ć": "c",
                "ĉ": "c",
                "ċ": "c",
                "č": "c",
                "Ď": "D",
                "Đ": "D",
                "ď": "d",
                "đ": "d",
                "Ē": "E",
                "Ĕ": "E",
                "Ė": "E",
                "Ę": "E",
                "Ě": "E",
                "ē": "e",
                "ĕ": "e",
                "ė": "e",
                "ę": "e",
                "ě": "e",
                "Ĝ": "G",
                "Ğ": "G",
                "Ġ": "G",
                "Ģ": "G",
                "ĝ": "g",
                "ğ": "g",
                "ġ": "g",
                "ģ": "g",
                "Ĥ": "H",
                "Ħ": "H",
                "ĥ": "h",
                "ħ": "h",
                "Ĩ": "I",
                "Ī": "I",
                "Ĭ": "I",
                "Į": "I",
                "İ": "I",
                "ĩ": "i",
                "ī": "i",
                "ĭ": "i",
                "į": "i",
                "ı": "i",
                "Ĵ": "J",
                "ĵ": "j",
                "Ķ": "K",
                "ķ": "k",
                "ĸ": "k",
                "Ĺ": "L",
                "Ļ": "L",
                "Ľ": "L",
                "Ŀ": "L",
                "Ł": "L",
                "ĺ": "l",
                "ļ": "l",
                "ľ": "l",
                "ŀ": "l",
                "ł": "l",
                "Ń": "N",
                "Ņ": "N",
                "Ň": "N",
                "Ŋ": "N",
                "ń": "n",
                "ņ": "n",
                "ň": "n",
                "ŋ": "n",
                "Ō": "O",
                "Ŏ": "O",
                "Ő": "O",
                "ō": "o",
                "ŏ": "o",
                "ő": "o",
                "Ŕ": "R",
                "Ŗ": "R",
                "Ř": "R",
                "ŕ": "r",
                "ŗ": "r",
                "ř": "r",
                "Ś": "S",
                "Ŝ": "S",
                "Ş": "S",
                "Š": "S",
                "ś": "s",
                "ŝ": "s",
                "ş": "s",
                "š": "s",
                "Ţ": "T",
                "Ť": "T",
                "Ŧ": "T",
                "ţ": "t",
                "ť": "t",
                "ŧ": "t",
                "Ũ": "U",
                "Ū": "U",
                "Ŭ": "U",
                "Ů": "U",
                "Ű": "U",
                "Ų": "U",
                "ũ": "u",
                "ū": "u",
                "ŭ": "u",
                "ů": "u",
                "ű": "u",
                "ų": "u",
                "Ŵ": "W",
                "ŵ": "w",
                "Ŷ": "Y",
                "ŷ": "y",
                "Ÿ": "Y",
                "Ź": "Z",
                "Ż": "Z",
                "Ž": "Z",
                "ź": "z",
                "ż": "z",
                "ž": "z",
                "Ĳ": "IJ",
                "ĳ": "ij",
                "Œ": "Oe",
                "œ": "oe",
                "ŉ": "'n",
                "ſ": "s"
            }
              , An = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }
              , Sn = {
                "&amp;": "&",
                "&lt;": "<",
                "&gt;": ">",
                "&quot;": '"',
                "&#39;": "'"
            }
              , On = {
                "\\": "\\",
                "'": "'",
                "\n": "n",
                "\r": "r",
                "\u2028": "u2028",
                "\u2029": "u2029"
            }
              , Pn = parseFloat
              , Mn = parseInt
              , In = "object" == typeof e && e && e.Object === Object && e
              , Dn = "object" == typeof self && self && self.Object === Object && self
              , Tn = In || Dn || Function("return this")()
              , Bn = "object" == typeof t && t && !t.nodeType && t
              , jn = Bn && "object" == typeof r && r && !r.nodeType && r
              , Ln = jn && jn.exports === Bn
              , Rn = Ln && In.process
              , Fn = function() {
                try {
                    return Rn && Rn.binding && Rn.binding("util")
                } catch (e) {}
            }()
              , Nn = Fn && Fn.isArrayBuffer
              , Un = Fn && Fn.isDate
              , zn = Fn && Fn.isMap
              , Hn = Fn && Fn.isRegExp
              , Wn = Fn && Fn.isSet
              , qn = Fn && Fn.isTypedArray
              , Gn = O("length")
              , Vn = P(_n)
              , Kn = P(An)
              , Qn = P(Sn)
              , Jn = function e(t) {
                function n(e) {
                    if (il(e) && !vd(e) && !(e instanceof x)) {
                        if (e instanceof o)
                            return e;
                        if (mc.call(e, "__wrapped__"))
                            return na(e)
                    }
                    return new o(e)
                }
                function r() {}
                function o(e, t) {
                    this.__wrapped__ = e,
                    this.__actions__ = [],
                    this.__chain__ = !!t,
                    this.__index__ = 0,
                    this.__values__ = oe
                }
                function x(e) {
                    this.__wrapped__ = e,
                    this.__actions__ = [],
                    this.__dir__ = 1,
                    this.__filtered__ = !1,
                    this.__iteratees__ = [],
                    this.__takeCount__ = Le,
                    this.__views__ = []
                }
                function P() {
                    var e = new x(this.__wrapped__);
                    return e.__actions__ = Fo(this.__actions__),
                    e.__dir__ = this.__dir__,
                    e.__filtered__ = this.__filtered__,
                    e.__iteratees__ = Fo(this.__iteratees__),
                    e.__takeCount__ = this.__takeCount__,
                    e.__views__ = Fo(this.__views__),
                    e
                }
                function X() {
                    if (this.__filtered__) {
                        var e = new x(this);
                        e.__dir__ = -1,
                        e.__filtered__ = !0
                    } else
                        e = this.clone(),
                        e.__dir__ *= -1;
                    return e
                }
                function te() {
                    var e = this.__wrapped__.value()
                      , t = this.__dir__
                      , n = vd(e)
                      , r = t < 0
                      , o = n ? e.length : 0
                      , i = Si(0, o, this.__views__)
                      , a = i.start
                      , u = i.end
                      , l = u - a
                      , s = r ? u : a - 1
                      , c = this.__iteratees__
                      , f = c.length
                      , d = 0
                      , p = Vc(l, this.__takeCount__);
                    if (!n || !r && o == l && p == l)
                        return bo(e, this.__actions__);
                    var h = [];
                    e: for (; l-- && d < p; ) {
                        s += t;
                        for (var y = -1, m = e[s]; ++y < f; ) {
                            var v = c[y]
                              , g = v.iteratee
                              , b = v.type
                              , x = g(m);
                            if (b == Ie)
                                m = x;
                            else if (!x) {
                                if (b == Me)
                                    continue e;
                                break e
                            }
                        }
                        h[d++] = m
                    }
                    return h
                }
                function ne(e) {
                    var t = -1
                      , n = null == e ? 0 : e.length;
                    for (this.clear(); ++t < n; ) {
                        var r = e[t];
                        this.set(r[0], r[1])
                    }
                }
                function Ut() {
                    this.__data__ = nf ? nf(null) : {},
                    this.size = 0
                }
                function Zt(e) {
                    var t = this.has(e) && delete this.__data__[e];
                    return this.size -= t ? 1 : 0,
                    t
                }
                function $t(e) {
                    var t = this.__data__;
                    if (nf) {
                        var n = t[e];
                        return n === le ? oe : n
                    }
                    return mc.call(t, e) ? t[e] : oe
                }
                function en(e) {
                    var t = this.__data__;
                    return nf ? t[e] !== oe : mc.call(t, e)
                }
                function tn(e, t) {
                    var n = this.__data__;
                    return this.size += this.has(e) ? 0 : 1,
                    n[e] = nf && t === oe ? le : t,
                    this
                }
                function nn(e) {
                    var t = -1
                      , n = null == e ? 0 : e.length;
                    for (this.clear(); ++t < n; ) {
                        var r = e[t];
                        this.set(r[0], r[1])
                    }
                }
                function rn() {
                    this.__data__ = [],
                    this.size = 0
                }
                function on(e) {
                    var t = this.__data__
                      , n = Yn(t, e);
                    return !(n < 0) && (n == t.length - 1 ? t.pop() : Mc.call(t, n, 1),
                    --this.size,
                    !0)
                }
                function an(e) {
                    var t = this.__data__
                      , n = Yn(t, e);
                    return n < 0 ? oe : t[n][1]
                }
                function un(e) {
                    return Yn(this.__data__, e) > -1
                }
                function ln(e, t) {
                    var n = this.__data__
                      , r = Yn(n, e);
                    return r < 0 ? (++this.size,
                    n.push([e, t])) : n[r][1] = t,
                    this
                }
                function sn(e) {
                    var t = -1
                      , n = null == e ? 0 : e.length;
                    for (this.clear(); ++t < n; ) {
                        var r = e[t];
                        this.set(r[0], r[1])
                    }
                }
                function cn() {
                    this.size = 0,
                    this.__data__ = {
                        hash: new ne,
                        map: new (Zc || nn),
                        string: new ne
                    }
                }
                function fn(e) {
                    var t = Ei(this, e).delete(e);
                    return this.size -= t ? 1 : 0,
                    t
                }
                function dn(e) {
                    return Ei(this, e).get(e)
                }
                function pn(e) {
                    return Ei(this, e).has(e)
                }
                function hn(e, t) {
                    var n = Ei(this, e)
                      , r = n.size;
                    return n.set(e, t),
                    this.size += n.size == r ? 0 : 1,
                    this
                }
                function vn(e) {
                    var t = -1
                      , n = null == e ? 0 : e.length;
                    for (this.__data__ = new sn; ++t < n; )
                        this.add(e[t])
                }
                function gn(e) {
                    return this.__data__.set(e, le),
                    this
                }
                function bn(e) {
                    return this.__data__.has(e)
                }
                function xn(e) {
                    this.size = (this.__data__ = new nn(e)).size
                }
                function _n() {
                    this.__data__ = new nn,
                    this.size = 0
                }
                function An(e) {
                    var t = this.__data__
                      , n = t.delete(e);
                    return this.size = t.size,
                    n
                }
                function Sn(e) {
                    return this.__data__.get(e)
                }
                function On(e) {
                    return this.__data__.has(e)
                }
                function In(e, t) {
                    var n = this.__data__;
                    if (n instanceof nn) {
                        var r = n.__data__;
                        if (!Zc || r.length < ie - 1)
                            return r.push([e, t]),
                            this.size = ++n.size,
                            this;
                        n = this.__data__ = new sn(r)
                    }
                    return n.set(e, t),
                    this.size = n.size,
                    this
                }
                function Dn(e, t) {
                    var n = vd(e)
                      , r = !n && md(e)
                      , o = !n && !r && bd(e)
                      , i = !n && !r && !o && kd(e)
                      , a = n || r || o || i
                      , u = a ? T(e.length, sc) : []
                      , l = u.length;
                    for (var s in e)
                        !t && !mc.call(e, s) || a && ("length" == s || o && ("offset" == s || "parent" == s) || i && ("buffer" == s || "byteLength" == s || "byteOffset" == s) || ji(s, l)) || u.push(s);
                    return u
                }
                function Bn(e) {
                    var t = e.length;
                    return t ? e[$r(0, t - 1)] : oe
                }
                function jn(e, t) {
                    return Zi(Fo(e), nr(t, 0, e.length))
                }
                function Rn(e) {
                    return Zi(Fo(e))
                }
                function Fn(e, t, n) {
                    (n === oe || Gu(e[t], n)) && (n !== oe || t in e) || er(e, t, n)
                }
                function Gn(e, t, n) {
                    var r = e[t];
                    mc.call(e, t) && Gu(r, n) && (n !== oe || t in e) || er(e, t, n)
                }
                function Yn(e, t) {
                    for (var n = e.length; n--; )
                        if (Gu(e[n][0], t))
                            return n;
                    return -1
                }
                function Xn(e, t, n, r) {
                    return yf(e, function(e, o, i) {
                        t(r, e, n(e), i)
                    }),
                    r
                }
                function Zn(e, t) {
                    return e && No(t, Ul(t), e)
                }
                function $n(e, t) {
                    return e && No(t, zl(t), e)
                }
                function er(e, t, n) {
                    "__proto__" == t && Bc ? Bc(e, t, {
                        configurable: !0,
                        enumerable: !0,
                        value: n,
                        writable: !0
                    }) : e[t] = n
                }
                function tr(e, t) {
                    for (var n = -1, r = t.length, o = nc(r), i = null == e; ++n < r; )
                        o[n] = i ? oe : Rl(e, t[n]);
                    return o
                }
                function nr(e, t, n) {
                    return e === e && (n !== oe && (e = e <= n ? e : n),
                    t !== oe && (e = e >= t ? e : t)),
                    e
                }
                function rr(e, t, n, r, o, i) {
                    var a, u = t & fe, l = t & de, c = t & pe;
                    if (n && (a = o ? n(e, r, o, i) : n(e)),
                    a !== oe)
                        return a;
                    if (!ol(e))
                        return e;
                    var f = vd(e);
                    if (f) {
                        if (a = Mi(e),
                        !u)
                            return Fo(e, a)
                    } else {
                        var d = Sf(e)
                          , p = d == Ke || d == Qe;
                        if (bd(e))
                            return Ao(e, u);
                        if (d == Ze || d == Ue || p && !o) {
                            if (a = l || p ? {} : Ii(e),
                            !u)
                                return l ? zo(e, $n(a, e)) : Uo(e, Zn(a, e))
                        } else {
                            if (!kn[d])
                                return o ? e : {};
                            a = Di(e, d, rr, u)
                        }
                    }
                    i || (i = new xn);
                    var h = i.get(e);
                    if (h)
                        return h;
                    i.set(e, a);
                    var y = c ? l ? bi : gi : l ? zl : Ul
                      , m = f ? oe : y(e);
                    return s(m || e, function(r, o) {
                        m && (o = r,
                        r = e[o]),
                        Gn(a, o, rr(r, t, n, o, e, i))
                    }),
                    a
                }
                function or(e) {
                    var t = Ul(e);
                    return function(n) {
                        return ir(n, e, t)
                    }
                }
                function ir(e, t, n) {
                    var r = n.length;
                    if (null == e)
                        return !r;
                    for (e = uc(e); r--; ) {
                        var o = n[r]
                          , i = t[o]
                          , a = e[o];
                        if (a === oe && !(o in e) || !i(a))
                            return !1
                    }
                    return !0
                }
                function ar(e, t, n) {
                    if ("function" != typeof e)
                        throw new cc(ue);
                    return Mf(function() {
                        e.apply(oe, n)
                    }, t)
                }
                function ur(e, t, n, r) {
                    var o = -1
                      , i = p
                      , a = !0
                      , u = e.length
                      , l = []
                      , s = t.length;
                    if (!u)
                        return l;
                    n && (t = y(t, j(n))),
                    r ? (i = h,
                    a = !1) : t.length >= ie && (i = R,
                    a = !1,
                    t = new vn(t));
                    e: for (; ++o < u; ) {
                        var c = e[o]
                          , f = null == n ? c : n(c);
                        if (c = r || 0 !== c ? c : 0,
                        a && f === f) {
                            for (var d = s; d--; )
                                if (t[d] === f)
                                    continue e;
                            l.push(c)
                        } else
                            i(t, f, r) || l.push(c)
                    }
                    return l
                }
                function lr(e, t) {
                    var n = !0;
                    return yf(e, function(e, r, o) {
                        return n = !!t(e, r, o)
                    }),
                    n
                }
                function sr(e, t, n) {
                    for (var r = -1, o = e.length; ++r < o; ) {
                        var i = e[r]
                          , a = t(i);
                        if (null != a && (u === oe ? a === a && !ml(a) : n(a, u)))
                            var u = a
                              , l = i
                    }
                    return l
                }
                function cr(e, t, n, r) {
                    var o = e.length;
                    for (n = Cl(n),
                    n < 0 && (n = -n > o ? 0 : o + n),
                    r = r === oe || r > o ? o : Cl(r),
                    r < 0 && (r += o),
                    r = n > r ? 0 : El(r); n < r; )
                        e[n++] = t;
                    return e
                }
                function fr(e, t) {
                    var n = [];
                    return yf(e, function(e, r, o) {
                        t(e, r, o) && n.push(e)
                    }),
                    n
                }
                function dr(e, t, n, r, o) {
                    var i = -1
                      , a = e.length;
                    for (n || (n = Bi),
                    o || (o = []); ++i < a; ) {
                        var u = e[i];
                        t > 0 && n(u) ? t > 1 ? dr(u, t - 1, n, r, o) : m(o, u) : r || (o[o.length] = u)
                    }
                    return o
                }
                function pr(e, t) {
                    return e && vf(e, t, Ul)
                }
                function hr(e, t) {
                    return e && gf(e, t, Ul)
                }
                function yr(e, t) {
                    return d(t, function(t) {
                        return tl(e[t])
                    })
                }
                function mr(e, t) {
                    t = ko(t, e);
                    for (var n = 0, r = t.length; null != e && n < r; )
                        e = e[$i(t[n++])];
                    return n && n == r ? e : oe
                }
                function vr(e, t, n) {
                    var r = t(e);
                    return vd(e) ? r : m(r, n(e))
                }
                function gr(e) {
                    return null == e ? e === oe ? ot : Xe : Tc && Tc in uc(e) ? Ai(e) : Vi(e)
                }
                function br(e, t) {
                    return e > t
                }
                function xr(e, t) {
                    return null != e && mc.call(e, t)
                }
                function wr(e, t) {
                    return null != e && t in uc(e)
                }
                function Cr(e, t, n) {
                    return e >= Vc(t, n) && e < Gc(t, n)
                }
                function Er(e, t, n) {
                    for (var r = n ? h : p, o = e[0].length, i = e.length, a = i, u = nc(i), l = 1 / 0, s = []; a--; ) {
                        var c = e[a];
                        a && t && (c = y(c, j(t))),
                        l = Vc(c.length, l),
                        u[a] = !n && (t || o >= 120 && c.length >= 120) ? new vn(a && c) : oe
                    }
                    c = e[0];
                    var f = -1
                      , d = u[0];
                    e: for (; ++f < o && s.length < l; ) {
                        var m = c[f]
                          , v = t ? t(m) : m;
                        if (m = n || 0 !== m ? m : 0,
                        !(d ? R(d, v) : r(s, v, n))) {
                            for (a = i; --a; ) {
                                var g = u[a];
                                if (!(g ? R(g, v) : r(e[a], v, n)))
                                    continue e
                            }
                            d && d.push(v),
                            s.push(m)
                        }
                    }
                    return s
                }
                function kr(e, t, n, r) {
                    return pr(e, function(e, o, i) {
                        t(r, n(e), o, i)
                    }),
                    r
                }
                function _r(e, t, n) {
                    t = ko(t, e),
                    e = Qi(e, t);
                    var r = null == e ? e : e[$i(wa(t))];
                    return null == r ? oe : u(r, e, n)
                }
                function Ar(e) {
                    return il(e) && gr(e) == Ue
                }
                function Sr(e) {
                    return il(e) && gr(e) == ut
                }
                function Or(e) {
                    return il(e) && gr(e) == qe
                }
                function Pr(e, t, n, r, o) {
                    return e === t || (null == e || null == t || !il(e) && !il(t) ? e !== e && t !== t : Mr(e, t, n, r, Pr, o))
                }
                function Mr(e, t, n, r, o, i) {
                    var a = vd(e)
                      , u = vd(t)
                      , l = a ? ze : Sf(e)
                      , s = u ? ze : Sf(t);
                    l = l == Ue ? Ze : l,
                    s = s == Ue ? Ze : s;
                    var c = l == Ze
                      , f = s == Ze
                      , d = l == s;
                    if (d && bd(e)) {
                        if (!bd(t))
                            return !1;
                        a = !0,
                        c = !1
                    }
                    if (d && !c)
                        return i || (i = new xn),
                        a || kd(e) ? hi(e, t, n, r, o, i) : yi(e, t, l, n, r, o, i);
                    if (!(n & he)) {
                        var p = c && mc.call(e, "__wrapped__")
                          , h = f && mc.call(t, "__wrapped__");
                        if (p || h) {
                            var y = p ? e.value() : e
                              , m = h ? t.value() : t;
                            return i || (i = new xn),
                            o(y, m, n, r, i)
                        }
                    }
                    return !!d && (i || (i = new xn),
                    mi(e, t, n, r, o, i))
                }
                function Ir(e) {
                    return il(e) && Sf(e) == Je
                }
                function Dr(e, t, n, r) {
                    var o = n.length
                      , i = o
                      , a = !r;
                    if (null == e)
                        return !i;
                    for (e = uc(e); o--; ) {
                        var u = n[o];
                        if (a && u[2] ? u[1] !== e[u[0]] : !(u[0]in e))
                            return !1
                    }
                    for (; ++o < i; ) {
                        u = n[o];
                        var l = u[0]
                          , s = e[l]
                          , c = u[1];
                        if (a && u[2]) {
                            if (s === oe && !(l in e))
                                return !1
                        } else {
                            var f = new xn;
                            if (r)
                                var d = r(s, c, l, e, t, f);
                            if (!(d === oe ? Pr(c, s, he | ye, r, f) : d))
                                return !1
                        }
                    }
                    return !0
                }
                function Tr(e) {
                    return !(!ol(e) || Ui(e)) && (tl(e) ? Cc : Vt).test(ea(e))
                }
                function Br(e) {
                    return il(e) && gr(e) == et
                }
                function jr(e) {
                    return il(e) && Sf(e) == tt
                }
                function Lr(e) {
                    return il(e) && rl(e.length) && !!En[gr(e)]
                }
                function Rr(e) {
                    return "function" == typeof e ? e : null == e ? Ms : "object" == typeof e ? vd(e) ? Wr(e[0], e[1]) : Hr(e) : Fs(e)
                }
                function Fr(e) {
                    if (!zi(e))
                        return qc(e);
                    var t = [];
                    for (var n in uc(e))
                        mc.call(e, n) && "constructor" != n && t.push(n);
                    return t
                }
                function Nr(e) {
                    if (!ol(e))
                        return Gi(e);
                    var t = zi(e)
                      , n = [];
                    for (var r in e)
                        ("constructor" != r || !t && mc.call(e, r)) && n.push(r);
                    return n
                }
                function Ur(e, t) {
                    return e < t
                }
                function zr(e, t) {
                    var n = -1
                      , r = Vu(e) ? nc(e.length) : [];
                    return yf(e, function(e, o, i) {
                        r[++n] = t(e, o, i)
                    }),
                    r
                }
                function Hr(e) {
                    var t = ki(e);
                    return 1 == t.length && t[0][2] ? Wi(t[0][0], t[0][1]) : function(n) {
                        return n === e || Dr(n, e, t)
                    }
                }
                function Wr(e, t) {
                    return Ri(e) && Hi(t) ? Wi($i(e), t) : function(n) {
                        var r = Rl(n, e);
                        return r === oe && r === t ? Nl(n, e) : Pr(t, r, he | ye)
                    }
                }
                function qr(e, t, n, r, o) {
                    e !== t && vf(t, function(i, a) {
                        if (ol(i))
                            o || (o = new xn),
                            Gr(e, t, a, n, qr, r, o);
                        else {
                            var u = r ? r(e[a], i, a + "", e, t, o) : oe;
                            u === oe && (u = i),
                            Fn(e, a, u)
                        }
                    }, zl)
                }
                function Gr(e, t, n, r, o, i, a) {
                    var u = e[n]
                      , l = t[n]
                      , s = a.get(l);
                    if (s)
                        return void Fn(e, n, s);
                    var c = i ? i(u, l, n + "", e, t, a) : oe
                      , f = c === oe;
                    if (f) {
                        var d = vd(l)
                          , p = !d && bd(l)
                          , h = !d && !p && kd(l);
                        c = l,
                        d || p || h ? vd(u) ? c = u : Ku(u) ? c = Fo(u) : p ? (f = !1,
                        c = Ao(l, !0)) : h ? (f = !1,
                        c = To(l, !0)) : c = [] : pl(l) || md(l) ? (c = u,
                        md(u) ? c = _l(u) : (!ol(u) || r && tl(u)) && (c = Ii(l))) : f = !1
                    }
                    f && (a.set(l, c),
                    o(c, l, r, i, a),
                    a.delete(l)),
                    Fn(e, n, c)
                }
                function Vr(e, t) {
                    var n = e.length;
                    if (n)
                        return t += t < 0 ? n : 0,
                        ji(t, n) ? e[t] : oe
                }
                function Kr(e, t, n) {
                    var r = -1;
                    return t = y(t.length ? t : [Ms], j(Ci())),
                    I(zr(e, function(e, n, o) {
                        return {
                            criteria: y(t, function(t) {
                                return t(e)
                            }),
                            index: ++r,
                            value: e
                        }
                    }), function(e, t) {
                        return jo(e, t, n)
                    })
                }
                function Qr(e, t) {
                    return Jr(e, t, function(t, n) {
                        return Nl(e, n)
                    })
                }
                function Jr(e, t, n) {
                    for (var r = -1, o = t.length, i = {}; ++r < o; ) {
                        var a = t[r]
                          , u = mr(e, a);
                        n(u, a) && io(i, ko(a, e), u)
                    }
                    return i
                }
                function Yr(e) {
                    return function(t) {
                        return mr(t, e)
                    }
                }
                function Xr(e, t, n, r) {
                    var o = r ? _ : k
                      , i = -1
                      , a = t.length
                      , u = e;
                    for (e === t && (t = Fo(t)),
                    n && (u = y(e, j(n))); ++i < a; )
                        for (var l = 0, s = t[i], c = n ? n(s) : s; (l = o(u, c, l, r)) > -1; )
                            u !== e && Mc.call(u, l, 1),
                            Mc.call(e, l, 1);
                    return e
                }
                function Zr(e, t) {
                    for (var n = e ? t.length : 0, r = n - 1; n--; ) {
                        var o = t[n];
                        if (n == r || o !== i) {
                            var i = o;
                            ji(o) ? Mc.call(e, o, 1) : mo(e, o)
                        }
                    }
                    return e
                }
                function $r(e, t) {
                    return e + Nc(Jc() * (t - e + 1))
                }
                function eo(e, t, n, r) {
                    for (var o = -1, i = Gc(Fc((t - e) / (n || 1)), 0), a = nc(i); i--; )
                        a[r ? i : ++o] = e,
                        e += n;
                    return a
                }
                function to(e, t) {
                    var n = "";
                    if (!e || t < 1 || t > Te)
                        return n;
                    do {
                        t % 2 && (n += e),
                        (t = Nc(t / 2)) && (e += e)
                    } while (t);return n
                }
                function no(e, t) {
                    return If(Ki(e, t, Ms), e + "")
                }
                function ro(e) {
                    return Bn($l(e))
                }
                function oo(e, t) {
                    var n = $l(e);
                    return Zi(n, nr(t, 0, n.length))
                }
                function io(e, t, n, r) {
                    if (!ol(e))
                        return e;
                    t = ko(t, e);
                    for (var o = -1, i = t.length, a = i - 1, u = e; null != u && ++o < i; ) {
                        var l = $i(t[o])
                          , s = n;
                        if (o != a) {
                            var c = u[l];
                            s = r ? r(c, l, u) : oe,
                            s === oe && (s = ol(c) ? c : ji(t[o + 1]) ? [] : {})
                        }
                        Gn(u, l, s),
                        u = u[l]
                    }
                    return e
                }
                function ao(e) {
                    return Zi($l(e))
                }
                function uo(e, t, n) {
                    var r = -1
                      , o = e.length;
                    t < 0 && (t = -t > o ? 0 : o + t),
                    n = n > o ? o : n,
                    n < 0 && (n += o),
                    o = t > n ? 0 : n - t >>> 0,
                    t >>>= 0;
                    for (var i = nc(o); ++r < o; )
                        i[r] = e[r + t];
                    return i
                }
                function lo(e, t) {
                    var n;
                    return yf(e, function(e, r, o) {
                        return !(n = t(e, r, o))
                    }),
                    !!n
                }
                function so(e, t, n) {
                    var r = 0
                      , o = null == e ? r : e.length;
                    if ("number" == typeof t && t === t && o <= Fe) {
                        for (; r < o; ) {
                            var i = r + o >>> 1
                              , a = e[i];
                            null !== a && !ml(a) && (n ? a <= t : a < t) ? r = i + 1 : o = i
                        }
                        return o
                    }
                    return co(e, t, Ms, n)
                }
                function co(e, t, n, r) {
                    t = n(t);
                    for (var o = 0, i = null == e ? 0 : e.length, a = t !== t, u = null === t, l = ml(t), s = t === oe; o < i; ) {
                        var c = Nc((o + i) / 2)
                          , f = n(e[c])
                          , d = f !== oe
                          , p = null === f
                          , h = f === f
                          , y = ml(f);
                        if (a)
                            var m = r || h;
                        else
                            m = s ? h && (r || d) : u ? h && d && (r || !p) : l ? h && d && !p && (r || !y) : !p && !y && (r ? f <= t : f < t);
                        m ? o = c + 1 : i = c
                    }
                    return Vc(i, Re)
                }
                function fo(e, t) {
                    for (var n = -1, r = e.length, o = 0, i = []; ++n < r; ) {
                        var a = e[n]
                          , u = t ? t(a) : a;
                        if (!n || !Gu(u, l)) {
                            var l = u;
                            i[o++] = 0 === a ? 0 : a
                        }
                    }
                    return i
                }
                function po(e) {
                    return "number" == typeof e ? e : ml(e) ? je : +e
                }
                function ho(e) {
                    if ("string" == typeof e)
                        return e;
                    if (vd(e))
                        return y(e, ho) + "";
                    if (ml(e))
                        return pf ? pf.call(e) : "";
                    var t = e + "";
                    return "0" == t && 1 / e == -De ? "-0" : t
                }
                function yo(e, t, n) {
                    var r = -1
                      , o = p
                      , i = e.length
                      , a = !0
                      , u = []
                      , l = u;
                    if (n)
                        a = !1,
                        o = h;
                    else if (i >= ie) {
                        var s = t ? null : Ef(e);
                        if (s)
                            return J(s);
                        a = !1,
                        o = R,
                        l = new vn
                    } else
                        l = t ? [] : u;
                    e: for (; ++r < i; ) {
                        var c = e[r]
                          , f = t ? t(c) : c;
                        if (c = n || 0 !== c ? c : 0,
                        a && f === f) {
                            for (var d = l.length; d--; )
                                if (l[d] === f)
                                    continue e;
                            t && l.push(f),
                            u.push(c)
                        } else
                            o(l, f, n) || (l !== u && l.push(f),
                            u.push(c))
                    }
                    return u
                }
                function mo(e, t) {
                    return t = ko(t, e),
                    null == (e = Qi(e, t)) || delete e[$i(wa(t))]
                }
                function vo(e, t, n, r) {
                    return io(e, t, n(mr(e, t)), r)
                }
                function go(e, t, n, r) {
                    for (var o = e.length, i = r ? o : -1; (r ? i-- : ++i < o) && t(e[i], i, e); )
                        ;
                    return n ? uo(e, r ? 0 : i, r ? i + 1 : o) : uo(e, r ? i + 1 : 0, r ? o : i)
                }
                function bo(e, t) {
                    var n = e;
                    return n instanceof x && (n = n.value()),
                    v(t, function(e, t) {
                        return t.func.apply(t.thisArg, m([e], t.args))
                    }, n)
                }
                function xo(e, t, n) {
                    var r = e.length;
                    if (r < 2)
                        return r ? yo(e[0]) : [];
                    for (var o = -1, i = nc(r); ++o < r; )
                        for (var a = e[o], u = -1; ++u < r; )
                            u != o && (i[o] = ur(i[o] || a, e[u], t, n));
                    return yo(dr(i, 1), t, n)
                }
                function wo(e, t, n) {
                    for (var r = -1, o = e.length, i = t.length, a = {}; ++r < o; ) {
                        n(a, e[r], r < i ? t[r] : oe)
                    }
                    return a
                }
                function Co(e) {
                    return Ku(e) ? e : []
                }
                function Eo(e) {
                    return "function" == typeof e ? e : Ms
                }
                function ko(e, t) {
                    return vd(e) ? e : Ri(e, t) ? [e] : Df(Sl(e))
                }
                function _o(e, t, n) {
                    var r = e.length;
                    return n = n === oe ? r : n,
                    !t && n >= r ? e : uo(e, t, n)
                }
                function Ao(e, t) {
                    if (t)
                        return e.slice();
                    var n = e.length
                      , r = Ac ? Ac(n) : new e.constructor(n);
                    return e.copy(r),
                    r
                }
                function So(e) {
                    var t = new e.constructor(e.byteLength);
                    return new _c(t).set(new _c(e)),
                    t
                }
                function Oo(e, t) {
                    return new e.constructor(t ? So(e.buffer) : e.buffer,e.byteOffset,e.byteLength)
                }
                function Po(e, t, n) {
                    return v(t ? n(V(e), fe) : V(e), i, new e.constructor)
                }
                function Mo(e) {
                    var t = new e.constructor(e.source,Wt.exec(e));
                    return t.lastIndex = e.lastIndex,
                    t
                }
                function Io(e, t, n) {
                    return v(t ? n(J(e), fe) : J(e), a, new e.constructor)
                }
                function Do(e) {
                    return df ? uc(df.call(e)) : {}
                }
                function To(e, t) {
                    return new e.constructor(t ? So(e.buffer) : e.buffer,e.byteOffset,e.length)
                }
                function Bo(e, t) {
                    if (e !== t) {
                        var n = e !== oe
                          , r = null === e
                          , o = e === e
                          , i = ml(e)
                          , a = t !== oe
                          , u = null === t
                          , l = t === t
                          , s = ml(t);
                        if (!u && !s && !i && e > t || i && a && l && !u && !s || r && a && l || !n && l || !o)
                            return 1;
                        if (!r && !i && !s && e < t || s && n && o && !r && !i || u && n && o || !a && o || !l)
                            return -1
                    }
                    return 0
                }
                function jo(e, t, n) {
                    for (var r = -1, o = e.criteria, i = t.criteria, a = o.length, u = n.length; ++r < a; ) {
                        var l = Bo(o[r], i[r]);
                        if (l) {
                            if (r >= u)
                                return l;
                            return l * ("desc" == n[r] ? -1 : 1)
                        }
                    }
                    return e.index - t.index
                }
                function Lo(e, t, n, r) {
                    for (var o = -1, i = e.length, a = n.length, u = -1, l = t.length, s = Gc(i - a, 0), c = nc(l + s), f = !r; ++u < l; )
                        c[u] = t[u];
                    for (; ++o < a; )
                        (f || o < i) && (c[n[o]] = e[o]);
                    for (; s--; )
                        c[u++] = e[o++];
                    return c
                }
                function Ro(e, t, n, r) {
                    for (var o = -1, i = e.length, a = -1, u = n.length, l = -1, s = t.length, c = Gc(i - u, 0), f = nc(c + s), d = !r; ++o < c; )
                        f[o] = e[o];
                    for (var p = o; ++l < s; )
                        f[p + l] = t[l];
                    for (; ++a < u; )
                        (d || o < i) && (f[p + n[a]] = e[o++]);
                    return f
                }
                function Fo(e, t) {
                    var n = -1
                      , r = e.length;
                    for (t || (t = nc(r)); ++n < r; )
                        t[n] = e[n];
                    return t
                }
                function No(e, t, n, r) {
                    var o = !n;
                    n || (n = {});
                    for (var i = -1, a = t.length; ++i < a; ) {
                        var u = t[i]
                          , l = r ? r(n[u], e[u], u, n, e) : oe;
                        l === oe && (l = e[u]),
                        o ? er(n, u, l) : Gn(n, u, l)
                    }
                    return n
                }
                function Uo(e, t) {
                    return No(e, _f(e), t)
                }
                function zo(e, t) {
                    return No(e, Af(e), t)
                }
                function Ho(e, t) {
                    return function(n, r) {
                        var o = vd(n) ? l : Xn
                          , i = t ? t() : {};
                        return o(n, e, Ci(r, 2), i)
                    }
                }
                function Wo(e) {
                    return no(function(t, n) {
                        var r = -1
                          , o = n.length
                          , i = o > 1 ? n[o - 1] : oe
                          , a = o > 2 ? n[2] : oe;
                        for (i = e.length > 3 && "function" == typeof i ? (o--,
                        i) : oe,
                        a && Li(n[0], n[1], a) && (i = o < 3 ? oe : i,
                        o = 1),
                        t = uc(t); ++r < o; ) {
                            var u = n[r];
                            u && e(t, u, r, i)
                        }
                        return t
                    })
                }
                function qo(e, t) {
                    return function(n, r) {
                        if (null == n)
                            return n;
                        if (!Vu(n))
                            return e(n, r);
                        for (var o = n.length, i = t ? o : -1, a = uc(n); (t ? i-- : ++i < o) && !1 !== r(a[i], i, a); )
                            ;
                        return n
                    }
                }
                function Go(e) {
                    return function(t, n, r) {
                        for (var o = -1, i = uc(t), a = r(t), u = a.length; u--; ) {
                            var l = a[e ? u : ++o];
                            if (!1 === n(i[l], l, i))
                                break
                        }
                        return t
                    }
                }
                function Vo(e, t, n) {
                    function r() {
                        return (this && this !== Tn && this instanceof r ? i : e).apply(o ? n : this, arguments)
                    }
                    var o = t & me
                      , i = Jo(e);
                    return r
                }
                function Ko(e) {
                    return function(t) {
                        t = Sl(t);
                        var n = W(t) ? ee(t) : oe
                          , r = n ? n[0] : t.charAt(0)
                          , o = n ? _o(n, 1).join("") : t.slice(1);
                        return r[e]() + o
                    }
                }
                function Qo(e) {
                    return function(t) {
                        return v(_s(is(t).replace(yn, "")), e, "")
                    }
                }
                function Jo(e) {
                    return function() {
                        var t = arguments;
                        switch (t.length) {
                        case 0:
                            return new e;
                        case 1:
                            return new e(t[0]);
                        case 2:
                            return new e(t[0],t[1]);
                        case 3:
                            return new e(t[0],t[1],t[2]);
                        case 4:
                            return new e(t[0],t[1],t[2],t[3]);
                        case 5:
                            return new e(t[0],t[1],t[2],t[3],t[4]);
                        case 6:
                            return new e(t[0],t[1],t[2],t[3],t[4],t[5]);
                        case 7:
                            return new e(t[0],t[1],t[2],t[3],t[4],t[5],t[6])
                        }
                        var n = hf(e.prototype)
                          , r = e.apply(n, t);
                        return ol(r) ? r : n
                    }
                }
                function Yo(e, t, n) {
                    function r() {
                        for (var i = arguments.length, a = nc(i), l = i, s = wi(r); l--; )
                            a[l] = arguments[l];
                        var c = i < 3 && a[0] !== s && a[i - 1] !== s ? [] : Q(a, s);
                        return (i -= c.length) < n ? ui(e, t, $o, r.placeholder, oe, a, c, oe, oe, n - i) : u(this && this !== Tn && this instanceof r ? o : e, this, a)
                    }
                    var o = Jo(e);
                    return r
                }
                function Xo(e) {
                    return function(t, n, r) {
                        var o = uc(t);
                        if (!Vu(t)) {
                            var i = Ci(n, 3);
                            t = Ul(t),
                            n = function(e) {
                                return i(o[e], e, o)
                            }
                        }
                        var a = e(t, n, r);
                        return a > -1 ? o[i ? t[a] : a] : oe
                    }
                }
                function Zo(e) {
                    return vi(function(t) {
                        var n = t.length
                          , r = n
                          , i = o.prototype.thru;
                        for (e && t.reverse(); r--; ) {
                            var a = t[r];
                            if ("function" != typeof a)
                                throw new cc(ue);
                            if (i && !u && "wrapper" == xi(a))
                                var u = new o([],!0)
                        }
                        for (r = u ? r : n; ++r < n; ) {
                            a = t[r];
                            var l = xi(a)
                              , s = "wrapper" == l ? kf(a) : oe;
                            u = s && Ni(s[0]) && s[1] == (Ee | be | we | ke) && !s[4].length && 1 == s[9] ? u[xi(s[0])].apply(u, s[3]) : 1 == a.length && Ni(a) ? u[l]() : u.thru(a)
                        }
                        return function() {
                            var e = arguments
                              , r = e[0];
                            if (u && 1 == e.length && vd(r))
                                return u.plant(r).value();
                            for (var o = 0, i = n ? t[o].apply(this, e) : r; ++o < n; )
                                i = t[o].call(this, i);
                            return i
                        }
                    })
                }
                function $o(e, t, n, r, o, i, a, u, l, s) {
                    function c() {
                        for (var v = arguments.length, g = nc(v), b = v; b--; )
                            g[b] = arguments[b];
                        if (h)
                            var x = wi(c)
                              , w = U(g, x);
                        if (r && (g = Lo(g, r, o, h)),
                        i && (g = Ro(g, i, a, h)),
                        v -= w,
                        h && v < s) {
                            var C = Q(g, x);
                            return ui(e, t, $o, c.placeholder, n, g, C, u, l, s - v)
                        }
                        var E = d ? n : this
                          , k = p ? E[e] : e;
                        return v = g.length,
                        u ? g = Ji(g, u) : y && v > 1 && g.reverse(),
                        f && l < v && (g.length = l),
                        this && this !== Tn && this instanceof c && (k = m || Jo(k)),
                        k.apply(E, g)
                    }
                    var f = t & Ee
                      , d = t & me
                      , p = t & ve
                      , h = t & (be | xe)
                      , y = t & _e
                      , m = p ? oe : Jo(e);
                    return c
                }
                function ei(e, t) {
                    return function(n, r) {
                        return kr(n, e, t(r), {})
                    }
                }
                function ti(e, t) {
                    return function(n, r) {
                        var o;
                        if (n === oe && r === oe)
                            return t;
                        if (n !== oe && (o = n),
                        r !== oe) {
                            if (o === oe)
                                return r;
                            "string" == typeof n || "string" == typeof r ? (n = ho(n),
                            r = ho(r)) : (n = po(n),
                            r = po(r)),
                            o = e(n, r)
                        }
                        return o
                    }
                }
                function ni(e) {
                    return vi(function(t) {
                        return t = y(t, j(Ci())),
                        no(function(n) {
                            var r = this;
                            return e(t, function(e) {
                                return u(e, r, n)
                            })
                        })
                    })
                }
                function ri(e, t) {
                    t = t === oe ? " " : ho(t);
                    var n = t.length;
                    if (n < 2)
                        return n ? to(t, e) : t;
                    var r = to(t, Fc(e / $(t)));
                    return W(t) ? _o(ee(r), 0, e).join("") : r.slice(0, e)
                }
                function oi(e, t, n, r) {
                    function o() {
                        for (var t = -1, l = arguments.length, s = -1, c = r.length, f = nc(c + l), d = this && this !== Tn && this instanceof o ? a : e; ++s < c; )
                            f[s] = r[s];
                        for (; l--; )
                            f[s++] = arguments[++t];
                        return u(d, i ? n : this, f)
                    }
                    var i = t & me
                      , a = Jo(e);
                    return o
                }
                function ii(e) {
                    return function(t, n, r) {
                        return r && "number" != typeof r && Li(t, n, r) && (n = r = oe),
                        t = wl(t),
                        n === oe ? (n = t,
                        t = 0) : n = wl(n),
                        r = r === oe ? t < n ? 1 : -1 : wl(r),
                        eo(t, n, r, e)
                    }
                }
                function ai(e) {
                    return function(t, n) {
                        return "string" == typeof t && "string" == typeof n || (t = kl(t),
                        n = kl(n)),
                        e(t, n)
                    }
                }
                function ui(e, t, n, r, o, i, a, u, l, s) {
                    var c = t & be
                      , f = c ? a : oe
                      , d = c ? oe : a
                      , p = c ? i : oe
                      , h = c ? oe : i;
                    t |= c ? we : Ce,
                    (t &= ~(c ? Ce : we)) & ge || (t &= ~(me | ve));
                    var y = [e, t, o, p, f, h, d, u, l, s]
                      , m = n.apply(oe, y);
                    return Ni(e) && Pf(m, y),
                    m.placeholder = r,
                    Yi(m, e, t)
                }
                function li(e) {
                    var t = ac[e];
                    return function(e, n) {
                        if (e = kl(e),
                        n = null == n ? 0 : Vc(Cl(n), 292)) {
                            var r = (Sl(e) + "e").split("e");
                            return r = (Sl(t(r[0] + "e" + (+r[1] + n))) + "e").split("e"),
                            +(r[0] + "e" + (+r[1] - n))
                        }
                        return t(e)
                    }
                }
                function si(e) {
                    return function(t) {
                        var n = Sf(t);
                        return n == Je ? V(t) : n == tt ? Y(t) : B(t, e(t))
                    }
                }
                function ci(e, t, n, r, o, i, a, u) {
                    var l = t & ve;
                    if (!l && "function" != typeof e)
                        throw new cc(ue);
                    var s = r ? r.length : 0;
                    if (s || (t &= ~(we | Ce),
                    r = o = oe),
                    a = a === oe ? a : Gc(Cl(a), 0),
                    u = u === oe ? u : Cl(u),
                    s -= o ? o.length : 0,
                    t & Ce) {
                        var c = r
                          , f = o;
                        r = o = oe
                    }
                    var d = l ? oe : kf(e)
                      , p = [e, t, n, r, o, c, f, i, a, u];
                    if (d && qi(p, d),
                    e = p[0],
                    t = p[1],
                    n = p[2],
                    r = p[3],
                    o = p[4],
                    u = p[9] = p[9] === oe ? l ? 0 : e.length : Gc(p[9] - s, 0),
                    !u && t & (be | xe) && (t &= ~(be | xe)),
                    t && t != me)
                        h = t == be || t == xe ? Yo(e, t, u) : t != we && t != (me | we) || o.length ? $o.apply(oe, p) : oi(e, t, n, r);
                    else
                        var h = Vo(e, t, n);
                    return Yi((d ? bf : Pf)(h, p), e, t)
                }
                function fi(e, t, n, r) {
                    return e === oe || Gu(e, pc[n]) && !mc.call(r, n) ? t : e
                }
                function di(e, t, n, r, o, i) {
                    return ol(e) && ol(t) && (i.set(t, e),
                    qr(e, t, oe, di, i),
                    i.delete(t)),
                    e
                }
                function pi(e) {
                    return pl(e) ? oe : e
                }
                function hi(e, t, n, r, o, i) {
                    var a = n & he
                      , u = e.length
                      , l = t.length;
                    if (u != l && !(a && l > u))
                        return !1;
                    var s = i.get(e);
                    if (s && i.get(t))
                        return s == t;
                    var c = -1
                      , f = !0
                      , d = n & ye ? new vn : oe;
                    for (i.set(e, t),
                    i.set(t, e); ++c < u; ) {
                        var p = e[c]
                          , h = t[c];
                        if (r)
                            var y = a ? r(h, p, c, t, e, i) : r(p, h, c, e, t, i);
                        if (y !== oe) {
                            if (y)
                                continue;
                            f = !1;
                            break
                        }
                        if (d) {
                            if (!b(t, function(e, t) {
                                if (!R(d, t) && (p === e || o(p, e, n, r, i)))
                                    return d.push(t)
                            })) {
                                f = !1;
                                break
                            }
                        } else if (p !== h && !o(p, h, n, r, i)) {
                            f = !1;
                            break
                        }
                    }
                    return i.delete(e),
                    i.delete(t),
                    f
                }
                function yi(e, t, n, r, o, i, a) {
                    switch (n) {
                    case lt:
                        if (e.byteLength != t.byteLength || e.byteOffset != t.byteOffset)
                            return !1;
                        e = e.buffer,
                        t = t.buffer;
                    case ut:
                        return !(e.byteLength != t.byteLength || !i(new _c(e), new _c(t)));
                    case We:
                    case qe:
                    case Ye:
                        return Gu(+e, +t);
                    case Ve:
                        return e.name == t.name && e.message == t.message;
                    case et:
                    case nt:
                        return e == t + "";
                    case Je:
                        var u = V;
                    case tt:
                        var l = r & he;
                        if (u || (u = J),
                        e.size != t.size && !l)
                            return !1;
                        var s = a.get(e);
                        if (s)
                            return s == t;
                        r |= ye,
                        a.set(e, t);
                        var c = hi(u(e), u(t), r, o, i, a);
                        return a.delete(e),
                        c;
                    case rt:
                        if (df)
                            return df.call(e) == df.call(t)
                    }
                    return !1
                }
                function mi(e, t, n, r, o, i) {
                    var a = n & he
                      , u = gi(e)
                      , l = u.length;
                    if (l != gi(t).length && !a)
                        return !1;
                    for (var s = l; s--; ) {
                        var c = u[s];
                        if (!(a ? c in t : mc.call(t, c)))
                            return !1
                    }
                    var f = i.get(e);
                    if (f && i.get(t))
                        return f == t;
                    var d = !0;
                    i.set(e, t),
                    i.set(t, e);
                    for (var p = a; ++s < l; ) {
                        c = u[s];
                        var h = e[c]
                          , y = t[c];
                        if (r)
                            var m = a ? r(y, h, c, t, e, i) : r(h, y, c, e, t, i);
                        if (!(m === oe ? h === y || o(h, y, n, r, i) : m)) {
                            d = !1;
                            break
                        }
                        p || (p = "constructor" == c)
                    }
                    if (d && !p) {
                        var v = e.constructor
                          , g = t.constructor;
                        v != g && "constructor"in e && "constructor"in t && !("function" == typeof v && v instanceof v && "function" == typeof g && g instanceof g) && (d = !1)
                    }
                    return i.delete(e),
                    i.delete(t),
                    d
                }
                function vi(e) {
                    return If(Ki(e, oe, pa), e + "")
                }
                function gi(e) {
                    return vr(e, Ul, _f)
                }
                function bi(e) {
                    return vr(e, zl, Af)
                }
                function xi(e) {
                    for (var t = e.name + "", n = of[t], r = mc.call(of, t) ? n.length : 0; r--; ) {
                        var o = n[r]
                          , i = o.func;
                        if (null == i || i == e)
                            return o.name
                    }
                    return t
                }
                function wi(e) {
                    return (mc.call(n, "placeholder") ? n : e).placeholder
                }
                function Ci() {
                    var e = n.iteratee || Is;
                    return e = e === Is ? Rr : e,
                    arguments.length ? e(arguments[0], arguments[1]) : e
                }
                function Ei(e, t) {
                    var n = e.__data__;
                    return Fi(t) ? n["string" == typeof t ? "string" : "hash"] : n.map
                }
                function ki(e) {
                    for (var t = Ul(e), n = t.length; n--; ) {
                        var r = t[n]
                          , o = e[r];
                        t[n] = [r, o, Hi(o)]
                    }
                    return t
                }
                function _i(e, t) {
                    var n = H(e, t);
                    return Tr(n) ? n : oe
                }
                function Ai(e) {
                    var t = mc.call(e, Tc)
                      , n = e[Tc];
                    try {
                        e[Tc] = oe;
                        var r = !0
                    } catch (e) {}
                    var o = bc.call(e);
                    return r && (t ? e[Tc] = n : delete e[Tc]),
                    o
                }
                function Si(e, t, n) {
                    for (var r = -1, o = n.length; ++r < o; ) {
                        var i = n[r]
                          , a = i.size;
                        switch (i.type) {
                        case "drop":
                            e += a;
                            break;
                        case "dropRight":
                            t -= a;
                            break;
                        case "take":
                            t = Vc(t, e + a);
                            break;
                        case "takeRight":
                            e = Gc(e, t - a)
                        }
                    }
                    return {
                        start: e,
                        end: t
                    }
                }
                function Oi(e) {
                    var t = e.match(Ft);
                    return t ? t[1].split(Nt) : []
                }
                function Pi(e, t, n) {
                    t = ko(t, e);
                    for (var r = -1, o = t.length, i = !1; ++r < o; ) {
                        var a = $i(t[r]);
                        if (!(i = null != e && n(e, a)))
                            break;
                        e = e[a]
                    }
                    return i || ++r != o ? i : !!(o = null == e ? 0 : e.length) && rl(o) && ji(a, o) && (vd(e) || md(e))
                }
                function Mi(e) {
                    var t = e.length
                      , n = e.constructor(t);
                    return t && "string" == typeof e[0] && mc.call(e, "index") && (n.index = e.index,
                    n.input = e.input),
                    n
                }
                function Ii(e) {
                    return "function" != typeof e.constructor || zi(e) ? {} : hf(Sc(e))
                }
                function Di(e, t, n, r) {
                    var o = e.constructor;
                    switch (t) {
                    case ut:
                        return So(e);
                    case We:
                    case qe:
                        return new o(+e);
                    case lt:
                        return Oo(e, r);
                    case st:
                    case ct:
                    case ft:
                    case dt:
                    case pt:
                    case ht:
                    case yt:
                    case mt:
                    case vt:
                        return To(e, r);
                    case Je:
                        return Po(e, r, n);
                    case Ye:
                    case nt:
                        return new o(e);
                    case et:
                        return Mo(e);
                    case tt:
                        return Io(e, r, n);
                    case rt:
                        return Do(e)
                    }
                }
                function Ti(e, t) {
                    var n = t.length;
                    if (!n)
                        return e;
                    var r = n - 1;
                    return t[r] = (n > 1 ? "& " : "") + t[r],
                    t = t.join(n > 2 ? ", " : " "),
                    e.replace(Rt, "{\n/* [wrapped with " + t + "] */\n")
                }
                function Bi(e) {
                    return vd(e) || md(e) || !!(Ic && e && e[Ic])
                }
                function ji(e, t) {
                    return !!(t = null == t ? Te : t) && ("number" == typeof e || Qt.test(e)) && e > -1 && e % 1 == 0 && e < t
                }
                function Li(e, t, n) {
                    if (!ol(n))
                        return !1;
                    var r = typeof t;
                    return !!("number" == r ? Vu(n) && ji(t, n.length) : "string" == r && t in n) && Gu(n[t], e)
                }
                function Ri(e, t) {
                    if (vd(e))
                        return !1;
                    var n = typeof e;
                    return !("number" != n && "symbol" != n && "boolean" != n && null != e && !ml(e)) || (Pt.test(e) || !Ot.test(e) || null != t && e in uc(t))
                }
                function Fi(e) {
                    var t = typeof e;
                    return "string" == t || "number" == t || "symbol" == t || "boolean" == t ? "__proto__" !== e : null === e
                }
                function Ni(e) {
                    var t = xi(e)
                      , r = n[t];
                    if ("function" != typeof r || !(t in x.prototype))
                        return !1;
                    if (e === r)
                        return !0;
                    var o = kf(r);
                    return !!o && e === o[0]
                }
                function Ui(e) {
                    return !!gc && gc in e
                }
                function zi(e) {
                    var t = e && e.constructor;
                    return e === ("function" == typeof t && t.prototype || pc)
                }
                function Hi(e) {
                    return e === e && !ol(e)
                }
                function Wi(e, t) {
                    return function(n) {
                        return null != n && (n[e] === t && (t !== oe || e in uc(n)))
                    }
                }
                function qi(e, t) {
                    var n = e[1]
                      , r = t[1]
                      , o = n | r
                      , i = o < (me | ve | Ee)
                      , a = r == Ee && n == be || r == Ee && n == ke && e[7].length <= t[8] || r == (Ee | ke) && t[7].length <= t[8] && n == be;
                    if (!i && !a)
                        return e;
                    r & me && (e[2] = t[2],
                    o |= n & me ? 0 : ge);
                    var u = t[3];
                    if (u) {
                        var l = e[3];
                        e[3] = l ? Lo(l, u, t[4]) : u,
                        e[4] = l ? Q(e[3], ce) : t[4]
                    }
                    return u = t[5],
                    u && (l = e[5],
                    e[5] = l ? Ro(l, u, t[6]) : u,
                    e[6] = l ? Q(e[5], ce) : t[6]),
                    u = t[7],
                    u && (e[7] = u),
                    r & Ee && (e[8] = null == e[8] ? t[8] : Vc(e[8], t[8])),
                    null == e[9] && (e[9] = t[9]),
                    e[0] = t[0],
                    e[1] = o,
                    e
                }
                function Gi(e) {
                    var t = [];
                    if (null != e)
                        for (var n in uc(e))
                            t.push(n);
                    return t
                }
                function Vi(e) {
                    return bc.call(e)
                }
                function Ki(e, t, n) {
                    return t = Gc(t === oe ? e.length - 1 : t, 0),
                    function() {
                        for (var r = arguments, o = -1, i = Gc(r.length - t, 0), a = nc(i); ++o < i; )
                            a[o] = r[t + o];
                        o = -1;
                        for (var l = nc(t + 1); ++o < t; )
                            l[o] = r[o];
                        return l[t] = n(a),
                        u(e, this, l)
                    }
                }
                function Qi(e, t) {
                    return t.length < 2 ? e : mr(e, uo(t, 0, -1))
                }
                function Ji(e, t) {
                    for (var n = e.length, r = Vc(t.length, n), o = Fo(e); r--; ) {
                        var i = t[r];
                        e[r] = ji(i, n) ? o[i] : oe
                    }
                    return e
                }
                function Yi(e, t, n) {
                    var r = t + "";
                    return If(e, Ti(r, ta(Oi(r), n)))
                }
                function Xi(e) {
                    var t = 0
                      , n = 0;
                    return function() {
                        var r = Kc()
                          , o = Pe - (r - n);
                        if (n = r,
                        o > 0) {
                            if (++t >= Oe)
                                return arguments[0]
                        } else
                            t = 0;
                        return e.apply(oe, arguments)
                    }
                }
                function Zi(e, t) {
                    var n = -1
                      , r = e.length
                      , o = r - 1;
                    for (t = t === oe ? r : t; ++n < t; ) {
                        var i = $r(n, o)
                          , a = e[i];
                        e[i] = e[n],
                        e[n] = a
                    }
                    return e.length = t,
                    e
                }
                function $i(e) {
                    if ("string" == typeof e || ml(e))
                        return e;
                    var t = e + "";
                    return "0" == t && 1 / e == -De ? "-0" : t
                }
                function ea(e) {
                    if (null != e) {
                        try {
                            return yc.call(e)
                        } catch (e) {}
                        try {
                            return e + ""
                        } catch (e) {}
                    }
                    return ""
                }
                function ta(e, t) {
                    return s(Ne, function(n) {
                        var r = "_." + n[0];
                        t & n[1] && !p(e, r) && e.push(r)
                    }),
                    e.sort()
                }
                function na(e) {
                    if (e instanceof x)
                        return e.clone();
                    var t = new o(e.__wrapped__,e.__chain__);
                    return t.__actions__ = Fo(e.__actions__),
                    t.__index__ = e.__index__,
                    t.__values__ = e.__values__,
                    t
                }
                function ra(e, t, n) {
                    t = (n ? Li(e, t, n) : t === oe) ? 1 : Gc(Cl(t), 0);
                    var r = null == e ? 0 : e.length;
                    if (!r || t < 1)
                        return [];
                    for (var o = 0, i = 0, a = nc(Fc(r / t)); o < r; )
                        a[i++] = uo(e, o, o += t);
                    return a
                }
                function oa(e) {
                    for (var t = -1, n = null == e ? 0 : e.length, r = 0, o = []; ++t < n; ) {
                        var i = e[t];
                        i && (o[r++] = i)
                    }
                    return o
                }
                function ia() {
                    var e = arguments.length;
                    if (!e)
                        return [];
                    for (var t = nc(e - 1), n = arguments[0], r = e; r--; )
                        t[r - 1] = arguments[r];
                    return m(vd(n) ? Fo(n) : [n], dr(t, 1))
                }
                function aa(e, t, n) {
                    var r = null == e ? 0 : e.length;
                    return r ? (t = n || t === oe ? 1 : Cl(t),
                    uo(e, t < 0 ? 0 : t, r)) : []
                }
                function ua(e, t, n) {
                    var r = null == e ? 0 : e.length;
                    return r ? (t = n || t === oe ? 1 : Cl(t),
                    t = r - t,
                    uo(e, 0, t < 0 ? 0 : t)) : []
                }
                function la(e, t) {
                    return e && e.length ? go(e, Ci(t, 3), !0, !0) : []
                }
                function sa(e, t) {
                    return e && e.length ? go(e, Ci(t, 3), !0) : []
                }
                function ca(e, t, n, r) {
                    var o = null == e ? 0 : e.length;
                    return o ? (n && "number" != typeof n && Li(e, t, n) && (n = 0,
                    r = o),
                    cr(e, t, n, r)) : []
                }
                function fa(e, t, n) {
                    var r = null == e ? 0 : e.length;
                    if (!r)
                        return -1;
                    var o = null == n ? 0 : Cl(n);
                    return o < 0 && (o = Gc(r + o, 0)),
                    E(e, Ci(t, 3), o)
                }
                function da(e, t, n) {
                    var r = null == e ? 0 : e.length;
                    if (!r)
                        return -1;
                    var o = r - 1;
                    return n !== oe && (o = Cl(n),
                    o = n < 0 ? Gc(r + o, 0) : Vc(o, r - 1)),
                    E(e, Ci(t, 3), o, !0)
                }
                function pa(e) {
                    return (null == e ? 0 : e.length) ? dr(e, 1) : []
                }
                function ha(e) {
                    return (null == e ? 0 : e.length) ? dr(e, De) : []
                }
                function ya(e, t) {
                    return (null == e ? 0 : e.length) ? (t = t === oe ? 1 : Cl(t),
                    dr(e, t)) : []
                }
                function ma(e) {
                    for (var t = -1, n = null == e ? 0 : e.length, r = {}; ++t < n; ) {
                        var o = e[t];
                        r[o[0]] = o[1]
                    }
                    return r
                }
                function va(e) {
                    return e && e.length ? e[0] : oe
                }
                function ga(e, t, n) {
                    var r = null == e ? 0 : e.length;
                    if (!r)
                        return -1;
                    var o = null == n ? 0 : Cl(n);
                    return o < 0 && (o = Gc(r + o, 0)),
                    k(e, t, o)
                }
                function ba(e) {
                    return (null == e ? 0 : e.length) ? uo(e, 0, -1) : []
                }
                function xa(e, t) {
                    return null == e ? "" : Wc.call(e, t)
                }
                function wa(e) {
                    var t = null == e ? 0 : e.length;
                    return t ? e[t - 1] : oe
                }
                function Ca(e, t, n) {
                    var r = null == e ? 0 : e.length;
                    if (!r)
                        return -1;
                    var o = r;
                    return n !== oe && (o = Cl(n),
                    o = o < 0 ? Gc(r + o, 0) : Vc(o, r - 1)),
                    t === t ? Z(e, t, o) : E(e, A, o, !0)
                }
                function Ea(e, t) {
                    return e && e.length ? Vr(e, Cl(t)) : oe
                }
                function ka(e, t) {
                    return e && e.length && t && t.length ? Xr(e, t) : e
                }
                function _a(e, t, n) {
                    return e && e.length && t && t.length ? Xr(e, t, Ci(n, 2)) : e
                }
                function Aa(e, t, n) {
                    return e && e.length && t && t.length ? Xr(e, t, oe, n) : e
                }
                function Sa(e, t) {
                    var n = [];
                    if (!e || !e.length)
                        return n;
                    var r = -1
                      , o = []
                      , i = e.length;
                    for (t = Ci(t, 3); ++r < i; ) {
                        var a = e[r];
                        t(a, r, e) && (n.push(a),
                        o.push(r))
                    }
                    return Zr(e, o),
                    n
                }
                function Oa(e) {
                    return null == e ? e : Yc.call(e)
                }
                function Pa(e, t, n) {
                    var r = null == e ? 0 : e.length;
                    return r ? (n && "number" != typeof n && Li(e, t, n) ? (t = 0,
                    n = r) : (t = null == t ? 0 : Cl(t),
                    n = n === oe ? r : Cl(n)),
                    uo(e, t, n)) : []
                }
                function Ma(e, t) {
                    return so(e, t)
                }
                function Ia(e, t, n) {
                    return co(e, t, Ci(n, 2))
                }
                function Da(e, t) {
                    var n = null == e ? 0 : e.length;
                    if (n) {
                        var r = so(e, t);
                        if (r < n && Gu(e[r], t))
                            return r
                    }
                    return -1
                }
                function Ta(e, t) {
                    return so(e, t, !0)
                }
                function Ba(e, t, n) {
                    return co(e, t, Ci(n, 2), !0)
                }
                function ja(e, t) {
                    if (null == e ? 0 : e.length) {
                        var n = so(e, t, !0) - 1;
                        if (Gu(e[n], t))
                            return n
                    }
                    return -1
                }
                function La(e) {
                    return e && e.length ? fo(e) : []
                }
                function Ra(e, t) {
                    return e && e.length ? fo(e, Ci(t, 2)) : []
                }
                function Fa(e) {
                    var t = null == e ? 0 : e.length;
                    return t ? uo(e, 1, t) : []
                }
                function Na(e, t, n) {
                    return e && e.length ? (t = n || t === oe ? 1 : Cl(t),
                    uo(e, 0, t < 0 ? 0 : t)) : []
                }
                function Ua(e, t, n) {
                    var r = null == e ? 0 : e.length;
                    return r ? (t = n || t === oe ? 1 : Cl(t),
                    t = r - t,
                    uo(e, t < 0 ? 0 : t, r)) : []
                }
                function za(e, t) {
                    return e && e.length ? go(e, Ci(t, 3), !1, !0) : []
                }
                function Ha(e, t) {
                    return e && e.length ? go(e, Ci(t, 3)) : []
                }
                function Wa(e) {
                    return e && e.length ? yo(e) : []
                }
                function qa(e, t) {
                    return e && e.length ? yo(e, Ci(t, 2)) : []
                }
                function Ga(e, t) {
                    return t = "function" == typeof t ? t : oe,
                    e && e.length ? yo(e, oe, t) : []
                }
                function Va(e) {
                    if (!e || !e.length)
                        return [];
                    var t = 0;
                    return e = d(e, function(e) {
                        if (Ku(e))
                            return t = Gc(e.length, t),
                            !0
                    }),
                    T(t, function(t) {
                        return y(e, O(t))
                    })
                }
                function Ka(e, t) {
                    if (!e || !e.length)
                        return [];
                    var n = Va(e);
                    return null == t ? n : y(n, function(e) {
                        return u(t, oe, e)
                    })
                }
                function Qa(e, t) {
                    return wo(e || [], t || [], Gn)
                }
                function Ja(e, t) {
                    return wo(e || [], t || [], io)
                }
                function Ya(e) {
                    var t = n(e);
                    return t.__chain__ = !0,
                    t
                }
                function Xa(e, t) {
                    return t(e),
                    e
                }
                function Za(e, t) {
                    return t(e)
                }
                function $a() {
                    return Ya(this)
                }
                function eu() {
                    return new o(this.value(),this.__chain__)
                }
                function tu() {
                    this.__values__ === oe && (this.__values__ = xl(this.value()));
                    var e = this.__index__ >= this.__values__.length;
                    return {
                        done: e,
                        value: e ? oe : this.__values__[this.__index__++]
                    }
                }
                function nu() {
                    return this
                }
                function ru(e) {
                    for (var t, n = this; n instanceof r; ) {
                        var o = na(n);
                        o.__index__ = 0,
                        o.__values__ = oe,
                        t ? i.__wrapped__ = o : t = o;
                        var i = o;
                        n = n.__wrapped__
                    }
                    return i.__wrapped__ = e,
                    t
                }
                function ou() {
                    var e = this.__wrapped__;
                    if (e instanceof x) {
                        var t = e;
                        return this.__actions__.length && (t = new x(this)),
                        t = t.reverse(),
                        t.__actions__.push({
                            func: Za,
                            args: [Oa],
                            thisArg: oe
                        }),
                        new o(t,this.__chain__)
                    }
                    return this.thru(Oa)
                }
                function iu() {
                    return bo(this.__wrapped__, this.__actions__)
                }
                function au(e, t, n) {
                    var r = vd(e) ? f : lr;
                    return n && Li(e, t, n) && (t = oe),
                    r(e, Ci(t, 3))
                }
                function uu(e, t) {
                    return (vd(e) ? d : fr)(e, Ci(t, 3))
                }
                function lu(e, t) {
                    return dr(hu(e, t), 1)
                }
                function su(e, t) {
                    return dr(hu(e, t), De)
                }
                function cu(e, t, n) {
                    return n = n === oe ? 1 : Cl(n),
                    dr(hu(e, t), n)
                }
                function fu(e, t) {
                    return (vd(e) ? s : yf)(e, Ci(t, 3))
                }
                function du(e, t) {
                    return (vd(e) ? c : mf)(e, Ci(t, 3))
                }
                function pu(e, t, n, r) {
                    e = Vu(e) ? e : $l(e),
                    n = n && !r ? Cl(n) : 0;
                    var o = e.length;
                    return n < 0 && (n = Gc(o + n, 0)),
                    yl(e) ? n <= o && e.indexOf(t, n) > -1 : !!o && k(e, t, n) > -1
                }
                function hu(e, t) {
                    return (vd(e) ? y : zr)(e, Ci(t, 3))
                }
                function yu(e, t, n, r) {
                    return null == e ? [] : (vd(t) || (t = null == t ? [] : [t]),
                    n = r ? oe : n,
                    vd(n) || (n = null == n ? [] : [n]),
                    Kr(e, t, n))
                }
                function mu(e, t, n) {
                    var r = vd(e) ? v : M
                      , o = arguments.length < 3;
                    return r(e, Ci(t, 4), n, o, yf)
                }
                function vu(e, t, n) {
                    var r = vd(e) ? g : M
                      , o = arguments.length < 3;
                    return r(e, Ci(t, 4), n, o, mf)
                }
                function gu(e, t) {
                    return (vd(e) ? d : fr)(e, Du(Ci(t, 3)))
                }
                function bu(e) {
                    return (vd(e) ? Bn : ro)(e)
                }
                function xu(e, t, n) {
                    return t = (n ? Li(e, t, n) : t === oe) ? 1 : Cl(t),
                    (vd(e) ? jn : oo)(e, t)
                }
                function wu(e) {
                    return (vd(e) ? Rn : ao)(e)
                }
                function Cu(e) {
                    if (null == e)
                        return 0;
                    if (Vu(e))
                        return yl(e) ? $(e) : e.length;
                    var t = Sf(e);
                    return t == Je || t == tt ? e.size : Fr(e).length
                }
                function Eu(e, t, n) {
                    var r = vd(e) ? b : lo;
                    return n && Li(e, t, n) && (t = oe),
                    r(e, Ci(t, 3))
                }
                function ku(e, t) {
                    if ("function" != typeof t)
                        throw new cc(ue);
                    return e = Cl(e),
                    function() {
                        if (--e < 1)
                            return t.apply(this, arguments)
                    }
                }
                function _u(e, t, n) {
                    return t = n ? oe : t,
                    t = e && null == t ? e.length : t,
                    ci(e, Ee, oe, oe, oe, oe, t)
                }
                function Au(e, t) {
                    var n;
                    if ("function" != typeof t)
                        throw new cc(ue);
                    return e = Cl(e),
                    function() {
                        return --e > 0 && (n = t.apply(this, arguments)),
                        e <= 1 && (t = oe),
                        n
                    }
                }
                function Su(e, t, n) {
                    t = n ? oe : t;
                    var r = ci(e, be, oe, oe, oe, oe, oe, t);
                    return r.placeholder = Su.placeholder,
                    r
                }
                function Ou(e, t, n) {
                    t = n ? oe : t;
                    var r = ci(e, xe, oe, oe, oe, oe, oe, t);
                    return r.placeholder = Ou.placeholder,
                    r
                }
                function Pu(e, t, n) {
                    function r(t) {
                        var n = d
                          , r = p;
                        return d = p = oe,
                        g = t,
                        y = e.apply(r, n)
                    }
                    function o(e) {
                        return g = e,
                        m = Mf(u, t),
                        b ? r(e) : y
                    }
                    function i(e) {
                        var n = e - v
                          , r = e - g
                          , o = t - n;
                        return x ? Vc(o, h - r) : o
                    }
                    function a(e) {
                        var n = e - v
                          , r = e - g;
                        return v === oe || n >= t || n < 0 || x && r >= h
                    }
                    function u() {
                        var e = id();
                        if (a(e))
                            return l(e);
                        m = Mf(u, i(e))
                    }
                    function l(e) {
                        return m = oe,
                        w && d ? r(e) : (d = p = oe,
                        y)
                    }
                    function s() {
                        m !== oe && Cf(m),
                        g = 0,
                        d = v = p = m = oe
                    }
                    function c() {
                        return m === oe ? y : l(id())
                    }
                    function f() {
                        var e = id()
                          , n = a(e);
                        if (d = arguments,
                        p = this,
                        v = e,
                        n) {
                            if (m === oe)
                                return o(v);
                            if (x)
                                return m = Mf(u, t),
                                r(v)
                        }
                        return m === oe && (m = Mf(u, t)),
                        y
                    }
                    var d, p, h, y, m, v, g = 0, b = !1, x = !1, w = !0;
                    if ("function" != typeof e)
                        throw new cc(ue);
                    return t = kl(t) || 0,
                    ol(n) && (b = !!n.leading,
                    x = "maxWait"in n,
                    h = x ? Gc(kl(n.maxWait) || 0, t) : h,
                    w = "trailing"in n ? !!n.trailing : w),
                    f.cancel = s,
                    f.flush = c,
                    f
                }
                function Mu(e) {
                    return ci(e, _e)
                }
                function Iu(e, t) {
                    if ("function" != typeof e || null != t && "function" != typeof t)
                        throw new cc(ue);
                    var n = function() {
                        var r = arguments
                          , o = t ? t.apply(this, r) : r[0]
                          , i = n.cache;
                        if (i.has(o))
                            return i.get(o);
                        var a = e.apply(this, r);
                        return n.cache = i.set(o, a) || i,
                        a
                    };
                    return n.cache = new (Iu.Cache || sn),
                    n
                }
                function Du(e) {
                    if ("function" != typeof e)
                        throw new cc(ue);
                    return function() {
                        var t = arguments;
                        switch (t.length) {
                        case 0:
                            return !e.call(this);
                        case 1:
                            return !e.call(this, t[0]);
                        case 2:
                            return !e.call(this, t[0], t[1]);
                        case 3:
                            return !e.call(this, t[0], t[1], t[2])
                        }
                        return !e.apply(this, t)
                    }
                }
                function Tu(e) {
                    return Au(2, e)
                }
                function Bu(e, t) {
                    if ("function" != typeof e)
                        throw new cc(ue);
                    return t = t === oe ? t : Cl(t),
                    no(e, t)
                }
                function ju(e, t) {
                    if ("function" != typeof e)
                        throw new cc(ue);
                    return t = null == t ? 0 : Gc(Cl(t), 0),
                    no(function(n) {
                        var r = n[t]
                          , o = _o(n, 0, t);
                        return r && m(o, r),
                        u(e, this, o)
                    })
                }
                function Lu(e, t, n) {
                    var r = !0
                      , o = !0;
                    if ("function" != typeof e)
                        throw new cc(ue);
                    return ol(n) && (r = "leading"in n ? !!n.leading : r,
                    o = "trailing"in n ? !!n.trailing : o),
                    Pu(e, t, {
                        leading: r,
                        maxWait: t,
                        trailing: o
                    })
                }
                function Ru(e) {
                    return _u(e, 1)
                }
                function Fu(e, t) {
                    return fd(Eo(t), e)
                }
                function Nu() {
                    if (!arguments.length)
                        return [];
                    var e = arguments[0];
                    return vd(e) ? e : [e]
                }
                function Uu(e) {
                    return rr(e, pe)
                }
                function zu(e, t) {
                    return t = "function" == typeof t ? t : oe,
                    rr(e, pe, t)
                }
                function Hu(e) {
                    return rr(e, fe | pe)
                }
                function Wu(e, t) {
                    return t = "function" == typeof t ? t : oe,
                    rr(e, fe | pe, t)
                }
                function qu(e, t) {
                    return null == t || ir(e, t, Ul(t))
                }
                function Gu(e, t) {
                    return e === t || e !== e && t !== t
                }
                function Vu(e) {
                    return null != e && rl(e.length) && !tl(e)
                }
                function Ku(e) {
                    return il(e) && Vu(e)
                }
                function Qu(e) {
                    return !0 === e || !1 === e || il(e) && gr(e) == We
                }
                function Ju(e) {
                    return il(e) && 1 === e.nodeType && !pl(e)
                }
                function Yu(e) {
                    if (null == e)
                        return !0;
                    if (Vu(e) && (vd(e) || "string" == typeof e || "function" == typeof e.splice || bd(e) || kd(e) || md(e)))
                        return !e.length;
                    var t = Sf(e);
                    if (t == Je || t == tt)
                        return !e.size;
                    if (zi(e))
                        return !Fr(e).length;
                    for (var n in e)
                        if (mc.call(e, n))
                            return !1;
                    return !0
                }
                function Xu(e, t) {
                    return Pr(e, t)
                }
                function Zu(e, t, n) {
                    n = "function" == typeof n ? n : oe;
                    var r = n ? n(e, t) : oe;
                    return r === oe ? Pr(e, t, oe, n) : !!r
                }
                function $u(e) {
                    if (!il(e))
                        return !1;
                    var t = gr(e);
                    return t == Ve || t == Ge || "string" == typeof e.message && "string" == typeof e.name && !pl(e)
                }
                function el(e) {
                    return "number" == typeof e && Hc(e)
                }
                function tl(e) {
                    if (!ol(e))
                        return !1;
                    var t = gr(e);
                    return t == Ke || t == Qe || t == He || t == $e
                }
                function nl(e) {
                    return "number" == typeof e && e == Cl(e)
                }
                function rl(e) {
                    return "number" == typeof e && e > -1 && e % 1 == 0 && e <= Te
                }
                function ol(e) {
                    var t = typeof e;
                    return null != e && ("object" == t || "function" == t)
                }
                function il(e) {
                    return null != e && "object" == typeof e
                }
                function al(e, t) {
                    return e === t || Dr(e, t, ki(t))
                }
                function ul(e, t, n) {
                    return n = "function" == typeof n ? n : oe,
                    Dr(e, t, ki(t), n)
                }
                function ll(e) {
                    return dl(e) && e != +e
                }
                function sl(e) {
                    if (Of(e))
                        throw new oc(ae);
                    return Tr(e)
                }
                function cl(e) {
                    return null === e
                }
                function fl(e) {
                    return null == e
                }
                function dl(e) {
                    return "number" == typeof e || il(e) && gr(e) == Ye
                }
                function pl(e) {
                    if (!il(e) || gr(e) != Ze)
                        return !1;
                    var t = Sc(e);
                    if (null === t)
                        return !0;
                    var n = mc.call(t, "constructor") && t.constructor;
                    return "function" == typeof n && n instanceof n && yc.call(n) == xc
                }
                function hl(e) {
                    return nl(e) && e >= -Te && e <= Te
                }
                function yl(e) {
                    return "string" == typeof e || !vd(e) && il(e) && gr(e) == nt
                }
                function ml(e) {
                    return "symbol" == typeof e || il(e) && gr(e) == rt
                }
                function vl(e) {
                    return e === oe
                }
                function gl(e) {
                    return il(e) && Sf(e) == it
                }
                function bl(e) {
                    return il(e) && gr(e) == at
                }
                function xl(e) {
                    if (!e)
                        return [];
                    if (Vu(e))
                        return yl(e) ? ee(e) : Fo(e);
                    if (Dc && e[Dc])
                        return G(e[Dc]());
                    var t = Sf(e);
                    return (t == Je ? V : t == tt ? J : $l)(e)
                }
                function wl(e) {
                    if (!e)
                        return 0 === e ? e : 0;
                    if ((e = kl(e)) === De || e === -De) {
                        return (e < 0 ? -1 : 1) * Be
                    }
                    return e === e ? e : 0
                }
                function Cl(e) {
                    var t = wl(e)
                      , n = t % 1;
                    return t === t ? n ? t - n : t : 0
                }
                function El(e) {
                    return e ? nr(Cl(e), 0, Le) : 0
                }
                function kl(e) {
                    if ("number" == typeof e)
                        return e;
                    if (ml(e))
                        return je;
                    if (ol(e)) {
                        var t = "function" == typeof e.valueOf ? e.valueOf() : e;
                        e = ol(t) ? t + "" : t
                    }
                    if ("string" != typeof e)
                        return 0 === e ? e : +e;
                    e = e.replace(Bt, "");
                    var n = Gt.test(e);
                    return n || Kt.test(e) ? Mn(e.slice(2), n ? 2 : 8) : qt.test(e) ? je : +e
                }
                function _l(e) {
                    return No(e, zl(e))
                }
                function Al(e) {
                    return e ? nr(Cl(e), -Te, Te) : 0 === e ? e : 0
                }
                function Sl(e) {
                    return null == e ? "" : ho(e)
                }
                function Ol(e, t) {
                    var n = hf(e);
                    return null == t ? n : Zn(n, t)
                }
                function Pl(e, t) {
                    return C(e, Ci(t, 3), pr)
                }
                function Ml(e, t) {
                    return C(e, Ci(t, 3), hr)
                }
                function Il(e, t) {
                    return null == e ? e : vf(e, Ci(t, 3), zl)
                }
                function Dl(e, t) {
                    return null == e ? e : gf(e, Ci(t, 3), zl)
                }
                function Tl(e, t) {
                    return e && pr(e, Ci(t, 3))
                }
                function Bl(e, t) {
                    return e && hr(e, Ci(t, 3))
                }
                function jl(e) {
                    return null == e ? [] : yr(e, Ul(e))
                }
                function Ll(e) {
                    return null == e ? [] : yr(e, zl(e))
                }
                function Rl(e, t, n) {
                    var r = null == e ? oe : mr(e, t);
                    return r === oe ? n : r
                }
                function Fl(e, t) {
                    return null != e && Pi(e, t, xr)
                }
                function Nl(e, t) {
                    return null != e && Pi(e, t, wr)
                }
                function Ul(e) {
                    return Vu(e) ? Dn(e) : Fr(e)
                }
                function zl(e) {
                    return Vu(e) ? Dn(e, !0) : Nr(e)
                }
                function Hl(e, t) {
                    var n = {};
                    return t = Ci(t, 3),
                    pr(e, function(e, r, o) {
                        er(n, t(e, r, o), e)
                    }),
                    n
                }
                function Wl(e, t) {
                    var n = {};
                    return t = Ci(t, 3),
                    pr(e, function(e, r, o) {
                        er(n, r, t(e, r, o))
                    }),
                    n
                }
                function ql(e, t) {
                    return Gl(e, Du(Ci(t)))
                }
                function Gl(e, t) {
                    if (null == e)
                        return {};
                    var n = y(bi(e), function(e) {
                        return [e]
                    });
                    return t = Ci(t),
                    Jr(e, n, function(e, n) {
                        return t(e, n[0])
                    })
                }
                function Vl(e, t, n) {
                    t = ko(t, e);
                    var r = -1
                      , o = t.length;
                    for (o || (o = 1,
                    e = oe); ++r < o; ) {
                        var i = null == e ? oe : e[$i(t[r])];
                        i === oe && (r = o,
                        i = n),
                        e = tl(i) ? i.call(e) : i
                    }
                    return e
                }
                function Kl(e, t, n) {
                    return null == e ? e : io(e, t, n)
                }
                function Ql(e, t, n, r) {
                    return r = "function" == typeof r ? r : oe,
                    null == e ? e : io(e, t, n, r)
                }
                function Jl(e, t, n) {
                    var r = vd(e)
                      , o = r || bd(e) || kd(e);
                    if (t = Ci(t, 4),
                    null == n) {
                        var i = e && e.constructor;
                        n = o ? r ? new i : [] : ol(e) && tl(i) ? hf(Sc(e)) : {}
                    }
                    return (o ? s : pr)(e, function(e, r, o) {
                        return t(n, e, r, o)
                    }),
                    n
                }
                function Yl(e, t) {
                    return null == e || mo(e, t)
                }
                function Xl(e, t, n) {
                    return null == e ? e : vo(e, t, Eo(n))
                }
                function Zl(e, t, n, r) {
                    return r = "function" == typeof r ? r : oe,
                    null == e ? e : vo(e, t, Eo(n), r)
                }
                function $l(e) {
                    return null == e ? [] : L(e, Ul(e))
                }
                function es(e) {
                    return null == e ? [] : L(e, zl(e))
                }
                function ts(e, t, n) {
                    return n === oe && (n = t,
                    t = oe),
                    n !== oe && (n = kl(n),
                    n = n === n ? n : 0),
                    t !== oe && (t = kl(t),
                    t = t === t ? t : 0),
                    nr(kl(e), t, n)
                }
                function ns(e, t, n) {
                    return t = wl(t),
                    n === oe ? (n = t,
                    t = 0) : n = wl(n),
                    e = kl(e),
                    Cr(e, t, n)
                }
                function rs(e, t, n) {
                    if (n && "boolean" != typeof n && Li(e, t, n) && (t = n = oe),
                    n === oe && ("boolean" == typeof t ? (n = t,
                    t = oe) : "boolean" == typeof e && (n = e,
                    e = oe)),
                    e === oe && t === oe ? (e = 0,
                    t = 1) : (e = wl(e),
                    t === oe ? (t = e,
                    e = 0) : t = wl(t)),
                    e > t) {
                        var r = e;
                        e = t,
                        t = r
                    }
                    if (n || e % 1 || t % 1) {
                        var o = Jc();
                        return Vc(e + o * (t - e + Pn("1e-" + ((o + "").length - 1))), t)
                    }
                    return $r(e, t)
                }
                function os(e) {
                    return Yd(Sl(e).toLowerCase())
                }
                function is(e) {
                    return (e = Sl(e)) && e.replace(Jt, Vn).replace(mn, "")
                }
                function as(e, t, n) {
                    e = Sl(e),
                    t = ho(t);
                    var r = e.length;
                    n = n === oe ? r : nr(Cl(n), 0, r);
                    var o = n;
                    return (n -= t.length) >= 0 && e.slice(n, o) == t
                }
                function us(e) {
                    return e = Sl(e),
                    e && kt.test(e) ? e.replace(Ct, Kn) : e
                }
                function ls(e) {
                    return e = Sl(e),
                    e && Tt.test(e) ? e.replace(Dt, "\\$&") : e
                }
                function ss(e, t, n) {
                    e = Sl(e),
                    t = Cl(t);
                    var r = t ? $(e) : 0;
                    if (!t || r >= t)
                        return e;
                    var o = (t - r) / 2;
                    return ri(Nc(o), n) + e + ri(Fc(o), n)
                }
                function cs(e, t, n) {
                    e = Sl(e),
                    t = Cl(t);
                    var r = t ? $(e) : 0;
                    return t && r < t ? e + ri(t - r, n) : e
                }
                function fs(e, t, n) {
                    e = Sl(e),
                    t = Cl(t);
                    var r = t ? $(e) : 0;
                    return t && r < t ? ri(t - r, n) + e : e
                }
                function ds(e, t, n) {
                    return n || null == t ? t = 0 : t && (t = +t),
                    Qc(Sl(e).replace(jt, ""), t || 0)
                }
                function ps(e, t, n) {
                    return t = (n ? Li(e, t, n) : t === oe) ? 1 : Cl(t),
                    to(Sl(e), t)
                }
                function hs() {
                    var e = arguments
                      , t = Sl(e[0]);
                    return e.length < 3 ? t : t.replace(e[1], e[2])
                }
                function ys(e, t, n) {
                    return n && "number" != typeof n && Li(e, t, n) && (t = n = oe),
                    (n = n === oe ? Le : n >>> 0) ? (e = Sl(e),
                    e && ("string" == typeof t || null != t && !Cd(t)) && !(t = ho(t)) && W(e) ? _o(ee(e), 0, n) : e.split(t, n)) : []
                }
                function ms(e, t, n) {
                    return e = Sl(e),
                    n = null == n ? 0 : nr(Cl(n), 0, e.length),
                    t = ho(t),
                    e.slice(n, n + t.length) == t
                }
                function vs(e, t, r) {
                    var o = n.templateSettings;
                    r && Li(e, t, r) && (t = oe),
                    e = Sl(e),
                    t = Pd({}, t, o, fi);
                    var i, a, u = Pd({}, t.imports, o.imports, fi), l = Ul(u), s = L(u, l), c = 0, f = t.interpolate || Yt, d = "__p += '", p = lc((t.escape || Yt).source + "|" + f.source + "|" + (f === St ? Ht : Yt).source + "|" + (t.evaluate || Yt).source + "|$", "g"), h = "//# sourceURL=" + ("sourceURL"in t ? t.sourceURL : "lodash.templateSources[" + ++Cn + "]") + "\n";
                    e.replace(p, function(t, n, r, o, u, l) {
                        return r || (r = o),
                        d += e.slice(c, l).replace(Xt, z),
                        n && (i = !0,
                        d += "' +\n__e(" + n + ") +\n'"),
                        u && (a = !0,
                        d += "';\n" + u + ";\n__p += '"),
                        r && (d += "' +\n((__t = (" + r + ")) == null ? '' : __t) +\n'"),
                        c = l + t.length,
                        t
                    }),
                    d += "';\n";
                    var y = t.variable;
                    y || (d = "with (obj) {\n" + d + "\n}\n"),
                    d = (a ? d.replace(gt, "") : d).replace(bt, "$1").replace(xt, "$1;"),
                    d = "function(" + (y || "obj") + ") {\n" + (y ? "" : "obj || (obj = {});\n") + "var __t, __p = ''" + (i ? ", __e = _.escape" : "") + (a ? ", __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\n" : ";\n") + d + "return __p\n}";
                    var m = Xd(function() {
                        return ic(l, h + "return " + d).apply(oe, s)
                    });
                    if (m.source = d,
                    $u(m))
                        throw m;
                    return m
                }
                function gs(e) {
                    return Sl(e).toLowerCase()
                }
                function bs(e) {
                    return Sl(e).toUpperCase()
                }
                function xs(e, t, n) {
                    if ((e = Sl(e)) && (n || t === oe))
                        return e.replace(Bt, "");
                    if (!e || !(t = ho(t)))
                        return e;
                    var r = ee(e)
                      , o = ee(t);
                    return _o(r, F(r, o), N(r, o) + 1).join("")
                }
                function ws(e, t, n) {
                    if ((e = Sl(e)) && (n || t === oe))
                        return e.replace(Lt, "");
                    if (!e || !(t = ho(t)))
                        return e;
                    var r = ee(e);
                    return _o(r, 0, N(r, ee(t)) + 1).join("")
                }
                function Cs(e, t, n) {
                    if ((e = Sl(e)) && (n || t === oe))
                        return e.replace(jt, "");
                    if (!e || !(t = ho(t)))
                        return e;
                    var r = ee(e);
                    return _o(r, F(r, ee(t))).join("")
                }
                function Es(e, t) {
                    var n = Ae
                      , r = Se;
                    if (ol(t)) {
                        var o = "separator"in t ? t.separator : o;
                        n = "length"in t ? Cl(t.length) : n,
                        r = "omission"in t ? ho(t.omission) : r
                    }
                    e = Sl(e);
                    var i = e.length;
                    if (W(e)) {
                        var a = ee(e);
                        i = a.length
                    }
                    if (n >= i)
                        return e;
                    var u = n - $(r);
                    if (u < 1)
                        return r;
                    var l = a ? _o(a, 0, u).join("") : e.slice(0, u);
                    if (o === oe)
                        return l + r;
                    if (a && (u += l.length - u),
                    Cd(o)) {
                        if (e.slice(u).search(o)) {
                            var s, c = l;
                            for (o.global || (o = lc(o.source, Sl(Wt.exec(o)) + "g")),
                            o.lastIndex = 0; s = o.exec(c); )
                                var f = s.index;
                            l = l.slice(0, f === oe ? u : f)
                        }
                    } else if (e.indexOf(ho(o), u) != u) {
                        var d = l.lastIndexOf(o);
                        d > -1 && (l = l.slice(0, d))
                    }
                    return l + r
                }
                function ks(e) {
                    return e = Sl(e),
                    e && Et.test(e) ? e.replace(wt, Qn) : e
                }
                function _s(e, t, n) {
                    return e = Sl(e),
                    t = n ? oe : t,
                    t === oe ? q(e) ? re(e) : w(e) : e.match(t) || []
                }
                function As(e) {
                    var t = null == e ? 0 : e.length
                      , n = Ci();
                    return e = t ? y(e, function(e) {
                        if ("function" != typeof e[1])
                            throw new cc(ue);
                        return [n(e[0]), e[1]]
                    }) : [],
                    no(function(n) {
                        for (var r = -1; ++r < t; ) {
                            var o = e[r];
                            if (u(o[0], this, n))
                                return u(o[1], this, n)
                        }
                    })
                }
                function Ss(e) {
                    return or(rr(e, fe))
                }
                function Os(e) {
                    return function() {
                        return e
                    }
                }
                function Ps(e, t) {
                    return null == e || e !== e ? t : e
                }
                function Ms(e) {
                    return e
                }
                function Is(e) {
                    return Rr("function" == typeof e ? e : rr(e, fe))
                }
                function Ds(e) {
                    return Hr(rr(e, fe))
                }
                function Ts(e, t) {
                    return Wr(e, rr(t, fe))
                }
                function Bs(e, t, n) {
                    var r = Ul(t)
                      , o = yr(t, r);
                    null != n || ol(t) && (o.length || !r.length) || (n = t,
                    t = e,
                    e = this,
                    o = yr(t, Ul(t)));
                    var i = !(ol(n) && "chain"in n && !n.chain)
                      , a = tl(e);
                    return s(o, function(n) {
                        var r = t[n];
                        e[n] = r,
                        a && (e.prototype[n] = function() {
                            var t = this.__chain__;
                            if (i || t) {
                                var n = e(this.__wrapped__);
                                return (n.__actions__ = Fo(this.__actions__)).push({
                                    func: r,
                                    args: arguments,
                                    thisArg: e
                                }),
                                n.__chain__ = t,
                                n
                            }
                            return r.apply(e, m([this.value()], arguments))
                        }
                        )
                    }),
                    e
                }
                function js() {
                    return Tn._ === this && (Tn._ = wc),
                    this
                }
                function Ls() {}
                function Rs(e) {
                    return e = Cl(e),
                    no(function(t) {
                        return Vr(t, e)
                    })
                }
                function Fs(e) {
                    return Ri(e) ? O($i(e)) : Yr(e)
                }
                function Ns(e) {
                    return function(t) {
                        return null == e ? oe : mr(e, t)
                    }
                }
                function Us() {
                    return []
                }
                function zs() {
                    return !1
                }
                function Hs() {
                    return {}
                }
                function Ws() {
                    return ""
                }
                function qs() {
                    return !0
                }
                function Gs(e, t) {
                    if ((e = Cl(e)) < 1 || e > Te)
                        return [];
                    var n = Le
                      , r = Vc(e, Le);
                    t = Ci(t),
                    e -= Le;
                    for (var o = T(r, t); ++n < e; )
                        t(n);
                    return o
                }
                function Vs(e) {
                    return vd(e) ? y(e, $i) : ml(e) ? [e] : Fo(Df(Sl(e)))
                }
                function Ks(e) {
                    var t = ++vc;
                    return Sl(e) + t
                }
                function Qs(e) {
                    return e && e.length ? sr(e, Ms, br) : oe
                }
                function Js(e, t) {
                    return e && e.length ? sr(e, Ci(t, 2), br) : oe
                }
                function Ys(e) {
                    return S(e, Ms)
                }
                function Xs(e, t) {
                    return S(e, Ci(t, 2))
                }
                function Zs(e) {
                    return e && e.length ? sr(e, Ms, Ur) : oe
                }
                function $s(e, t) {
                    return e && e.length ? sr(e, Ci(t, 2), Ur) : oe
                }
                function ec(e) {
                    return e && e.length ? D(e, Ms) : 0
                }
                function tc(e, t) {
                    return e && e.length ? D(e, Ci(t, 2)) : 0
                }
                t = null == t ? Tn : Jn.defaults(Tn.Object(), t, Jn.pick(Tn, wn));
                var nc = t.Array
                  , rc = t.Date
                  , oc = t.Error
                  , ic = t.Function
                  , ac = t.Math
                  , uc = t.Object
                  , lc = t.RegExp
                  , sc = t.String
                  , cc = t.TypeError
                  , fc = nc.prototype
                  , dc = ic.prototype
                  , pc = uc.prototype
                  , hc = t["__core-js_shared__"]
                  , yc = dc.toString
                  , mc = pc.hasOwnProperty
                  , vc = 0
                  , gc = function() {
                    var e = /[^.]+$/.exec(hc && hc.keys && hc.keys.IE_PROTO || "");
                    return e ? "Symbol(src)_1." + e : ""
                }()
                  , bc = pc.toString
                  , xc = yc.call(uc)
                  , wc = Tn._
                  , Cc = lc("^" + yc.call(mc).replace(Dt, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$")
                  , Ec = Ln ? t.Buffer : oe
                  , kc = t.Symbol
                  , _c = t.Uint8Array
                  , Ac = Ec ? Ec.allocUnsafe : oe
                  , Sc = K(uc.getPrototypeOf, uc)
                  , Oc = uc.create
                  , Pc = pc.propertyIsEnumerable
                  , Mc = fc.splice
                  , Ic = kc ? kc.isConcatSpreadable : oe
                  , Dc = kc ? kc.iterator : oe
                  , Tc = kc ? kc.toStringTag : oe
                  , Bc = function() {
                    try {
                        var e = _i(uc, "defineProperty");
                        return e({}, "", {}),
                        e
                    } catch (e) {}
                }()
                  , jc = t.clearTimeout !== Tn.clearTimeout && t.clearTimeout
                  , Lc = rc && rc.now !== Tn.Date.now && rc.now
                  , Rc = t.setTimeout !== Tn.setTimeout && t.setTimeout
                  , Fc = ac.ceil
                  , Nc = ac.floor
                  , Uc = uc.getOwnPropertySymbols
                  , zc = Ec ? Ec.isBuffer : oe
                  , Hc = t.isFinite
                  , Wc = fc.join
                  , qc = K(uc.keys, uc)
                  , Gc = ac.max
                  , Vc = ac.min
                  , Kc = rc.now
                  , Qc = t.parseInt
                  , Jc = ac.random
                  , Yc = fc.reverse
                  , Xc = _i(t, "DataView")
                  , Zc = _i(t, "Map")
                  , $c = _i(t, "Promise")
                  , ef = _i(t, "Set")
                  , tf = _i(t, "WeakMap")
                  , nf = _i(uc, "create")
                  , rf = tf && new tf
                  , of = {}
                  , af = ea(Xc)
                  , uf = ea(Zc)
                  , lf = ea($c)
                  , sf = ea(ef)
                  , cf = ea(tf)
                  , ff = kc ? kc.prototype : oe
                  , df = ff ? ff.valueOf : oe
                  , pf = ff ? ff.toString : oe
                  , hf = function() {
                    function e() {}
                    return function(t) {
                        if (!ol(t))
                            return {};
                        if (Oc)
                            return Oc(t);
                        e.prototype = t;
                        var n = new e;
                        return e.prototype = oe,
                        n
                    }
                }();
                n.templateSettings = {
                    escape: _t,
                    evaluate: At,
                    interpolate: St,
                    variable: "",
                    imports: {
                        _: n
                    }
                },
                n.prototype = r.prototype,
                n.prototype.constructor = n,
                o.prototype = hf(r.prototype),
                o.prototype.constructor = o,
                x.prototype = hf(r.prototype),
                x.prototype.constructor = x,
                ne.prototype.clear = Ut,
                ne.prototype.delete = Zt,
                ne.prototype.get = $t,
                ne.prototype.has = en,
                ne.prototype.set = tn,
                nn.prototype.clear = rn,
                nn.prototype.delete = on,
                nn.prototype.get = an,
                nn.prototype.has = un,
                nn.prototype.set = ln,
                sn.prototype.clear = cn,
                sn.prototype.delete = fn,
                sn.prototype.get = dn,
                sn.prototype.has = pn,
                sn.prototype.set = hn,
                vn.prototype.add = vn.prototype.push = gn,
                vn.prototype.has = bn,
                xn.prototype.clear = _n,
                xn.prototype.delete = An,
                xn.prototype.get = Sn,
                xn.prototype.has = On,
                xn.prototype.set = In;
                var yf = qo(pr)
                  , mf = qo(hr, !0)
                  , vf = Go()
                  , gf = Go(!0)
                  , bf = rf ? function(e, t) {
                    return rf.set(e, t),
                    e
                }
                : Ms
                  , xf = Bc ? function(e, t) {
                    return Bc(e, "toString", {
                        configurable: !0,
                        enumerable: !1,
                        value: Os(t),
                        writable: !0
                    })
                }
                : Ms
                  , wf = no
                  , Cf = jc || function(e) {
                    return Tn.clearTimeout(e)
                }
                  , Ef = ef && 1 / J(new ef([, -0]))[1] == De ? function(e) {
                    return new ef(e)
                }
                : Ls
                  , kf = rf ? function(e) {
                    return rf.get(e)
                }
                : Ls
                  , _f = Uc ? function(e) {
                    return null == e ? [] : (e = uc(e),
                    d(Uc(e), function(t) {
                        return Pc.call(e, t)
                    }))
                }
                : Us
                  , Af = Uc ? function(e) {
                    for (var t = []; e; )
                        m(t, _f(e)),
                        e = Sc(e);
                    return t
                }
                : Us
                  , Sf = gr;
                (Xc && Sf(new Xc(new ArrayBuffer(1))) != lt || Zc && Sf(new Zc) != Je || $c && "[object Promise]" != Sf($c.resolve()) || ef && Sf(new ef) != tt || tf && Sf(new tf) != it) && (Sf = function(e) {
                    var t = gr(e)
                      , n = t == Ze ? e.constructor : oe
                      , r = n ? ea(n) : "";
                    if (r)
                        switch (r) {
                        case af:
                            return lt;
                        case uf:
                            return Je;
                        case lf:
                            return "[object Promise]";
                        case sf:
                            return tt;
                        case cf:
                            return it
                        }
                    return t
                }
                );
                var Of = hc ? tl : zs
                  , Pf = Xi(bf)
                  , Mf = Rc || function(e, t) {
                    return Tn.setTimeout(e, t)
                }
                  , If = Xi(xf)
                  , Df = function(e) {
                    var t = Iu(e, function(e) {
                        return n.size === se && n.clear(),
                        e
                    })
                      , n = t.cache;
                    return t
                }(function(e) {
                    var t = [];
                    return Mt.test(e) && t.push(""),
                    e.replace(It, function(e, n, r, o) {
                        t.push(r ? o.replace(zt, "$1") : n || e)
                    }),
                    t
                })
                  , Tf = no(function(e, t) {
                    return Ku(e) ? ur(e, dr(t, 1, Ku, !0)) : []
                })
                  , Bf = no(function(e, t) {
                    var n = wa(t);
                    return Ku(n) && (n = oe),
                    Ku(e) ? ur(e, dr(t, 1, Ku, !0), Ci(n, 2)) : []
                })
                  , jf = no(function(e, t) {
                    var n = wa(t);
                    return Ku(n) && (n = oe),
                    Ku(e) ? ur(e, dr(t, 1, Ku, !0), oe, n) : []
                })
                  , Lf = no(function(e) {
                    var t = y(e, Co);
                    return t.length && t[0] === e[0] ? Er(t) : []
                })
                  , Rf = no(function(e) {
                    var t = wa(e)
                      , n = y(e, Co);
                    return t === wa(n) ? t = oe : n.pop(),
                    n.length && n[0] === e[0] ? Er(n, Ci(t, 2)) : []
                })
                  , Ff = no(function(e) {
                    var t = wa(e)
                      , n = y(e, Co);
                    return t = "function" == typeof t ? t : oe,
                    t && n.pop(),
                    n.length && n[0] === e[0] ? Er(n, oe, t) : []
                })
                  , Nf = no(ka)
                  , Uf = vi(function(e, t) {
                    var n = null == e ? 0 : e.length
                      , r = tr(e, t);
                    return Zr(e, y(t, function(e) {
                        return ji(e, n) ? +e : e
                    }).sort(Bo)),
                    r
                })
                  , zf = no(function(e) {
                    return yo(dr(e, 1, Ku, !0))
                })
                  , Hf = no(function(e) {
                    var t = wa(e);
                    return Ku(t) && (t = oe),
                    yo(dr(e, 1, Ku, !0), Ci(t, 2))
                })
                  , Wf = no(function(e) {
                    var t = wa(e);
                    return t = "function" == typeof t ? t : oe,
                    yo(dr(e, 1, Ku, !0), oe, t)
                })
                  , qf = no(function(e, t) {
                    return Ku(e) ? ur(e, t) : []
                })
                  , Gf = no(function(e) {
                    return xo(d(e, Ku))
                })
                  , Vf = no(function(e) {
                    var t = wa(e);
                    return Ku(t) && (t = oe),
                    xo(d(e, Ku), Ci(t, 2))
                })
                  , Kf = no(function(e) {
                    var t = wa(e);
                    return t = "function" == typeof t ? t : oe,
                    xo(d(e, Ku), oe, t)
                })
                  , Qf = no(Va)
                  , Jf = no(function(e) {
                    var t = e.length
                      , n = t > 1 ? e[t - 1] : oe;
                    return n = "function" == typeof n ? (e.pop(),
                    n) : oe,
                    Ka(e, n)
                })
                  , Yf = vi(function(e) {
                    var t = e.length
                      , n = t ? e[0] : 0
                      , r = this.__wrapped__
                      , i = function(t) {
                        return tr(t, e)
                    };
                    return !(t > 1 || this.__actions__.length) && r instanceof x && ji(n) ? (r = r.slice(n, +n + (t ? 1 : 0)),
                    r.__actions__.push({
                        func: Za,
                        args: [i],
                        thisArg: oe
                    }),
                    new o(r,this.__chain__).thru(function(e) {
                        return t && !e.length && e.push(oe),
                        e
                    })) : this.thru(i)
                })
                  , Xf = Ho(function(e, t, n) {
                    mc.call(e, n) ? ++e[n] : er(e, n, 1)
                })
                  , Zf = Xo(fa)
                  , $f = Xo(da)
                  , ed = Ho(function(e, t, n) {
                    mc.call(e, n) ? e[n].push(t) : er(e, n, [t])
                })
                  , td = no(function(e, t, n) {
                    var r = -1
                      , o = "function" == typeof t
                      , i = Vu(e) ? nc(e.length) : [];
                    return yf(e, function(e) {
                        i[++r] = o ? u(t, e, n) : _r(e, t, n)
                    }),
                    i
                })
                  , nd = Ho(function(e, t, n) {
                    er(e, n, t)
                })
                  , rd = Ho(function(e, t, n) {
                    e[n ? 0 : 1].push(t)
                }, function() {
                    return [[], []]
                })
                  , od = no(function(e, t) {
                    if (null == e)
                        return [];
                    var n = t.length;
                    return n > 1 && Li(e, t[0], t[1]) ? t = [] : n > 2 && Li(t[0], t[1], t[2]) && (t = [t[0]]),
                    Kr(e, dr(t, 1), [])
                })
                  , id = Lc || function() {
                    return Tn.Date.now()
                }
                  , ad = no(function(e, t, n) {
                    var r = me;
                    if (n.length) {
                        var o = Q(n, wi(ad));
                        r |= we
                    }
                    return ci(e, r, t, n, o)
                })
                  , ud = no(function(e, t, n) {
                    var r = me | ve;
                    if (n.length) {
                        var o = Q(n, wi(ud));
                        r |= we
                    }
                    return ci(t, r, e, n, o)
                })
                  , ld = no(function(e, t) {
                    return ar(e, 1, t)
                })
                  , sd = no(function(e, t, n) {
                    return ar(e, kl(t) || 0, n)
                });
                Iu.Cache = sn;
                var cd = wf(function(e, t) {
                    t = 1 == t.length && vd(t[0]) ? y(t[0], j(Ci())) : y(dr(t, 1), j(Ci()));
                    var n = t.length;
                    return no(function(r) {
                        for (var o = -1, i = Vc(r.length, n); ++o < i; )
                            r[o] = t[o].call(this, r[o]);
                        return u(e, this, r)
                    })
                })
                  , fd = no(function(e, t) {
                    var n = Q(t, wi(fd));
                    return ci(e, we, oe, t, n)
                })
                  , dd = no(function(e, t) {
                    var n = Q(t, wi(dd));
                    return ci(e, Ce, oe, t, n)
                })
                  , pd = vi(function(e, t) {
                    return ci(e, ke, oe, oe, oe, t)
                })
                  , hd = ai(br)
                  , yd = ai(function(e, t) {
                    return e >= t
                })
                  , md = Ar(function() {
                    return arguments
                }()) ? Ar : function(e) {
                    return il(e) && mc.call(e, "callee") && !Pc.call(e, "callee")
                }
                  , vd = nc.isArray
                  , gd = Nn ? j(Nn) : Sr
                  , bd = zc || zs
                  , xd = Un ? j(Un) : Or
                  , wd = zn ? j(zn) : Ir
                  , Cd = Hn ? j(Hn) : Br
                  , Ed = Wn ? j(Wn) : jr
                  , kd = qn ? j(qn) : Lr
                  , _d = ai(Ur)
                  , Ad = ai(function(e, t) {
                    return e <= t
                })
                  , Sd = Wo(function(e, t) {
                    if (zi(t) || Vu(t))
                        return void No(t, Ul(t), e);
                    for (var n in t)
                        mc.call(t, n) && Gn(e, n, t[n])
                })
                  , Od = Wo(function(e, t) {
                    No(t, zl(t), e)
                })
                  , Pd = Wo(function(e, t, n, r) {
                    No(t, zl(t), e, r)
                })
                  , Md = Wo(function(e, t, n, r) {
                    No(t, Ul(t), e, r)
                })
                  , Id = vi(tr)
                  , Dd = no(function(e) {
                    return e.push(oe, fi),
                    u(Pd, oe, e)
                })
                  , Td = no(function(e) {
                    return e.push(oe, di),
                    u(Fd, oe, e)
                })
                  , Bd = ei(function(e, t, n) {
                    e[t] = n
                }, Os(Ms))
                  , jd = ei(function(e, t, n) {
                    mc.call(e, t) ? e[t].push(n) : e[t] = [n]
                }, Ci)
                  , Ld = no(_r)
                  , Rd = Wo(function(e, t, n) {
                    qr(e, t, n)
                })
                  , Fd = Wo(function(e, t, n, r) {
                    qr(e, t, n, r)
                })
                  , Nd = vi(function(e, t) {
                    var n = {};
                    if (null == e)
                        return n;
                    var r = !1;
                    t = y(t, function(t) {
                        return t = ko(t, e),
                        r || (r = t.length > 1),
                        t
                    }),
                    No(e, bi(e), n),
                    r && (n = rr(n, fe | de | pe, pi));
                    for (var o = t.length; o--; )
                        mo(n, t[o]);
                    return n
                })
                  , Ud = vi(function(e, t) {
                    return null == e ? {} : Qr(e, t)
                })
                  , zd = si(Ul)
                  , Hd = si(zl)
                  , Wd = Qo(function(e, t, n) {
                    return t = t.toLowerCase(),
                    e + (n ? os(t) : t)
                })
                  , qd = Qo(function(e, t, n) {
                    return e + (n ? "-" : "") + t.toLowerCase()
                })
                  , Gd = Qo(function(e, t, n) {
                    return e + (n ? " " : "") + t.toLowerCase()
                })
                  , Vd = Ko("toLowerCase")
                  , Kd = Qo(function(e, t, n) {
                    return e + (n ? "_" : "") + t.toLowerCase()
                })
                  , Qd = Qo(function(e, t, n) {
                    return e + (n ? " " : "") + Yd(t)
                })
                  , Jd = Qo(function(e, t, n) {
                    return e + (n ? " " : "") + t.toUpperCase()
                })
                  , Yd = Ko("toUpperCase")
                  , Xd = no(function(e, t) {
                    try {
                        return u(e, oe, t)
                    } catch (e) {
                        return $u(e) ? e : new oc(e)
                    }
                })
                  , Zd = vi(function(e, t) {
                    return s(t, function(t) {
                        t = $i(t),
                        er(e, t, ad(e[t], e))
                    }),
                    e
                })
                  , $d = Zo()
                  , ep = Zo(!0)
                  , tp = no(function(e, t) {
                    return function(n) {
                        return _r(n, e, t)
                    }
                })
                  , np = no(function(e, t) {
                    return function(n) {
                        return _r(e, n, t)
                    }
                })
                  , rp = ni(y)
                  , op = ni(f)
                  , ip = ni(b)
                  , ap = ii()
                  , up = ii(!0)
                  , lp = ti(function(e, t) {
                    return e + t
                }, 0)
                  , sp = li("ceil")
                  , cp = ti(function(e, t) {
                    return e / t
                }, 1)
                  , fp = li("floor")
                  , dp = ti(function(e, t) {
                    return e * t
                }, 1)
                  , pp = li("round")
                  , hp = ti(function(e, t) {
                    return e - t
                }, 0);
                return n.after = ku,
                n.ary = _u,
                n.assign = Sd,
                n.assignIn = Od,
                n.assignInWith = Pd,
                n.assignWith = Md,
                n.at = Id,
                n.before = Au,
                n.bind = ad,
                n.bindAll = Zd,
                n.bindKey = ud,
                n.castArray = Nu,
                n.chain = Ya,
                n.chunk = ra,
                n.compact = oa,
                n.concat = ia,
                n.cond = As,
                n.conforms = Ss,
                n.constant = Os,
                n.countBy = Xf,
                n.create = Ol,
                n.curry = Su,
                n.curryRight = Ou,
                n.debounce = Pu,
                n.defaults = Dd,
                n.defaultsDeep = Td,
                n.defer = ld,
                n.delay = sd,
                n.difference = Tf,
                n.differenceBy = Bf,
                n.differenceWith = jf,
                n.drop = aa,
                n.dropRight = ua,
                n.dropRightWhile = la,
                n.dropWhile = sa,
                n.fill = ca,
                n.filter = uu,
                n.flatMap = lu,
                n.flatMapDeep = su,
                n.flatMapDepth = cu,
                n.flatten = pa,
                n.flattenDeep = ha,
                n.flattenDepth = ya,
                n.flip = Mu,
                n.flow = $d,
                n.flowRight = ep,
                n.fromPairs = ma,
                n.functions = jl,
                n.functionsIn = Ll,
                n.groupBy = ed,
                n.initial = ba,
                n.intersection = Lf,
                n.intersectionBy = Rf,
                n.intersectionWith = Ff,
                n.invert = Bd,
                n.invertBy = jd,
                n.invokeMap = td,
                n.iteratee = Is,
                n.keyBy = nd,
                n.keys = Ul,
                n.keysIn = zl,
                n.map = hu,
                n.mapKeys = Hl,
                n.mapValues = Wl,
                n.matches = Ds,
                n.matchesProperty = Ts,
                n.memoize = Iu,
                n.merge = Rd,
                n.mergeWith = Fd,
                n.method = tp,
                n.methodOf = np,
                n.mixin = Bs,
                n.negate = Du,
                n.nthArg = Rs,
                n.omit = Nd,
                n.omitBy = ql,
                n.once = Tu,
                n.orderBy = yu,
                n.over = rp,
                n.overArgs = cd,
                n.overEvery = op,
                n.overSome = ip,
                n.partial = fd,
                n.partialRight = dd,
                n.partition = rd,
                n.pick = Ud,
                n.pickBy = Gl,
                n.property = Fs,
                n.propertyOf = Ns,
                n.pull = Nf,
                n.pullAll = ka,
                n.pullAllBy = _a,
                n.pullAllWith = Aa,
                n.pullAt = Uf,
                n.range = ap,
                n.rangeRight = up,
                n.rearg = pd,
                n.reject = gu,
                n.remove = Sa,
                n.rest = Bu,
                n.reverse = Oa,
                n.sampleSize = xu,
                n.set = Kl,
                n.setWith = Ql,
                n.shuffle = wu,
                n.slice = Pa,
                n.sortBy = od,
                n.sortedUniq = La,
                n.sortedUniqBy = Ra,
                n.split = ys,
                n.spread = ju,
                n.tail = Fa,
                n.take = Na,
                n.takeRight = Ua,
                n.takeRightWhile = za,
                n.takeWhile = Ha,
                n.tap = Xa,
                n.throttle = Lu,
                n.thru = Za,
                n.toArray = xl,
                n.toPairs = zd,
                n.toPairsIn = Hd,
                n.toPath = Vs,
                n.toPlainObject = _l,
                n.transform = Jl,
                n.unary = Ru,
                n.union = zf,
                n.unionBy = Hf,
                n.unionWith = Wf,
                n.uniq = Wa,
                n.uniqBy = qa,
                n.uniqWith = Ga,
                n.unset = Yl,
                n.unzip = Va,
                n.unzipWith = Ka,
                n.update = Xl,
                n.updateWith = Zl,
                n.values = $l,
                n.valuesIn = es,
                n.without = qf,
                n.words = _s,
                n.wrap = Fu,
                n.xor = Gf,
                n.xorBy = Vf,
                n.xorWith = Kf,
                n.zip = Qf,
                n.zipObject = Qa,
                n.zipObjectDeep = Ja,
                n.zipWith = Jf,
                n.entries = zd,
                n.entriesIn = Hd,
                n.extend = Od,
                n.extendWith = Pd,
                Bs(n, n),
                n.add = lp,
                n.attempt = Xd,
                n.camelCase = Wd,
                n.capitalize = os,
                n.ceil = sp,
                n.clamp = ts,
                n.clone = Uu,
                n.cloneDeep = Hu,
                n.cloneDeepWith = Wu,
                n.cloneWith = zu,
                n.conformsTo = qu,
                n.deburr = is,
                n.defaultTo = Ps,
                n.divide = cp,
                n.endsWith = as,
                n.eq = Gu,
                n.escape = us,
                n.escapeRegExp = ls,
                n.every = au,
                n.find = Zf,
                n.findIndex = fa,
                n.findKey = Pl,
                n.findLast = $f,
                n.findLastIndex = da,
                n.findLastKey = Ml,
                n.floor = fp,
                n.forEach = fu,
                n.forEachRight = du,
                n.forIn = Il,
                n.forInRight = Dl,
                n.forOwn = Tl,
                n.forOwnRight = Bl,
                n.get = Rl,
                n.gt = hd,
                n.gte = yd,
                n.has = Fl,
                n.hasIn = Nl,
                n.head = va,
                n.identity = Ms,
                n.includes = pu,
                n.indexOf = ga,
                n.inRange = ns,
                n.invoke = Ld,
                n.isArguments = md,
                n.isArray = vd,
                n.isArrayBuffer = gd,
                n.isArrayLike = Vu,
                n.isArrayLikeObject = Ku,
                n.isBoolean = Qu,
                n.isBuffer = bd,
                n.isDate = xd,
                n.isElement = Ju,
                n.isEmpty = Yu,
                n.isEqual = Xu,
                n.isEqualWith = Zu,
                n.isError = $u,
                n.isFinite = el,
                n.isFunction = tl,
                n.isInteger = nl,
                n.isLength = rl,
                n.isMap = wd,
                n.isMatch = al,
                n.isMatchWith = ul,
                n.isNaN = ll,
                n.isNative = sl,
                n.isNil = fl,
                n.isNull = cl,
                n.isNumber = dl,
                n.isObject = ol,
                n.isObjectLike = il,
                n.isPlainObject = pl,
                n.isRegExp = Cd,
                n.isSafeInteger = hl,
                n.isSet = Ed,
                n.isString = yl,
                n.isSymbol = ml,
                n.isTypedArray = kd,
                n.isUndefined = vl,
                n.isWeakMap = gl,
                n.isWeakSet = bl,
                n.join = xa,
                n.kebabCase = qd,
                n.last = wa,
                n.lastIndexOf = Ca,
                n.lowerCase = Gd,
                n.lowerFirst = Vd,
                n.lt = _d,
                n.lte = Ad,
                n.max = Qs,
                n.maxBy = Js,
                n.mean = Ys,
                n.meanBy = Xs,
                n.min = Zs,
                n.minBy = $s,
                n.stubArray = Us,
                n.stubFalse = zs,
                n.stubObject = Hs,
                n.stubString = Ws,
                n.stubTrue = qs,
                n.multiply = dp,
                n.nth = Ea,
                n.noConflict = js,
                n.noop = Ls,
                n.now = id,
                n.pad = ss,
                n.padEnd = cs,
                n.padStart = fs,
                n.parseInt = ds,
                n.random = rs,
                n.reduce = mu,
                n.reduceRight = vu,
                n.repeat = ps,
                n.replace = hs,
                n.result = Vl,
                n.round = pp,
                n.runInContext = e,
                n.sample = bu,
                n.size = Cu,
                n.snakeCase = Kd,
                n.some = Eu,
                n.sortedIndex = Ma,
                n.sortedIndexBy = Ia,
                n.sortedIndexOf = Da,
                n.sortedLastIndex = Ta,
                n.sortedLastIndexBy = Ba,
                n.sortedLastIndexOf = ja,
                n.startCase = Qd,
                n.startsWith = ms,
                n.subtract = hp,
                n.sum = ec,
                n.sumBy = tc,
                n.template = vs,
                n.times = Gs,
                n.toFinite = wl,
                n.toInteger = Cl,
                n.toLength = El,
                n.toLower = gs,
                n.toNumber = kl,
                n.toSafeInteger = Al,
                n.toString = Sl,
                n.toUpper = bs,
                n.trim = xs,
                n.trimEnd = ws,
                n.trimStart = Cs,
                n.truncate = Es,
                n.unescape = ks,
                n.uniqueId = Ks,
                n.upperCase = Jd,
                n.upperFirst = Yd,
                n.each = fu,
                n.eachRight = du,
                n.first = va,
                Bs(n, function() {
                    var e = {};
                    return pr(n, function(t, r) {
                        mc.call(n.prototype, r) || (e[r] = t)
                    }),
                    e
                }(), {
                    chain: !1
                }),
                n.VERSION = "4.17.4",
                s(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(e) {
                    n[e].placeholder = n
                }),
                s(["drop", "take"], function(e, t) {
                    x.prototype[e] = function(n) {
                        n = n === oe ? 1 : Gc(Cl(n), 0);
                        var r = this.__filtered__ && !t ? new x(this) : this.clone();
                        return r.__filtered__ ? r.__takeCount__ = Vc(n, r.__takeCount__) : r.__views__.push({
                            size: Vc(n, Le),
                            type: e + (r.__dir__ < 0 ? "Right" : "")
                        }),
                        r
                    }
                    ,
                    x.prototype[e + "Right"] = function(t) {
                        return this.reverse()[e](t).reverse()
                    }
                }),
                s(["filter", "map", "takeWhile"], function(e, t) {
                    var n = t + 1
                      , r = n == Me || 3 == n;
                    x.prototype[e] = function(e) {
                        var t = this.clone();
                        return t.__iteratees__.push({
                            iteratee: Ci(e, 3),
                            type: n
                        }),
                        t.__filtered__ = t.__filtered__ || r,
                        t
                    }
                }),
                s(["head", "last"], function(e, t) {
                    var n = "take" + (t ? "Right" : "");
                    x.prototype[e] = function() {
                        return this[n](1).value()[0]
                    }
                }),
                s(["initial", "tail"], function(e, t) {
                    var n = "drop" + (t ? "" : "Right");
                    x.prototype[e] = function() {
                        return this.__filtered__ ? new x(this) : this[n](1)
                    }
                }),
                x.prototype.compact = function() {
                    return this.filter(Ms)
                }
                ,
                x.prototype.find = function(e) {
                    return this.filter(e).head()
                }
                ,
                x.prototype.findLast = function(e) {
                    return this.reverse().find(e)
                }
                ,
                x.prototype.invokeMap = no(function(e, t) {
                    return "function" == typeof e ? new x(this) : this.map(function(n) {
                        return _r(n, e, t)
                    })
                }),
                x.prototype.reject = function(e) {
                    return this.filter(Du(Ci(e)))
                }
                ,
                x.prototype.slice = function(e, t) {
                    e = Cl(e);
                    var n = this;
                    return n.__filtered__ && (e > 0 || t < 0) ? new x(n) : (e < 0 ? n = n.takeRight(-e) : e && (n = n.drop(e)),
                    t !== oe && (t = Cl(t),
                    n = t < 0 ? n.dropRight(-t) : n.take(t - e)),
                    n)
                }
                ,
                x.prototype.takeRightWhile = function(e) {
                    return this.reverse().takeWhile(e).reverse()
                }
                ,
                x.prototype.toArray = function() {
                    return this.take(Le)
                }
                ,
                pr(x.prototype, function(e, t) {
                    var r = /^(?:filter|find|map|reject)|While$/.test(t)
                      , i = /^(?:head|last)$/.test(t)
                      , a = n[i ? "take" + ("last" == t ? "Right" : "") : t]
                      , u = i || /^find/.test(t);
                    a && (n.prototype[t] = function() {
                        var t = this.__wrapped__
                          , l = i ? [1] : arguments
                          , s = t instanceof x
                          , c = l[0]
                          , f = s || vd(t)
                          , d = function(e) {
                            var t = a.apply(n, m([e], l));
                            return i && p ? t[0] : t
                        };
                        f && r && "function" == typeof c && 1 != c.length && (s = f = !1);
                        var p = this.__chain__
                          , h = !!this.__actions__.length
                          , y = u && !p
                          , v = s && !h;
                        if (!u && f) {
                            t = v ? t : new x(this);
                            var g = e.apply(t, l);
                            return g.__actions__.push({
                                func: Za,
                                args: [d],
                                thisArg: oe
                            }),
                            new o(g,p)
                        }
                        return y && v ? e.apply(this, l) : (g = this.thru(d),
                        y ? i ? g.value()[0] : g.value() : g)
                    }
                    )
                }),
                s(["pop", "push", "shift", "sort", "splice", "unshift"], function(e) {
                    var t = fc[e]
                      , r = /^(?:push|sort|unshift)$/.test(e) ? "tap" : "thru"
                      , o = /^(?:pop|shift)$/.test(e);
                    n.prototype[e] = function() {
                        var e = arguments;
                        if (o && !this.__chain__) {
                            var n = this.value();
                            return t.apply(vd(n) ? n : [], e)
                        }
                        return this[r](function(n) {
                            return t.apply(vd(n) ? n : [], e)
                        })
                    }
                }),
                pr(x.prototype, function(e, t) {
                    var r = n[t];
                    if (r) {
                        var o = r.name + "";
                        (of[o] || (of[o] = [])).push({
                            name: t,
                            func: r
                        })
                    }
                }),
                of[$o(oe, ve).name] = [{
                    name: "wrapper",
                    func: oe
                }],
                x.prototype.clone = P,
                x.prototype.reverse = X,
                x.prototype.value = te,
                n.prototype.at = Yf,
                n.prototype.chain = $a,
                n.prototype.commit = eu,
                n.prototype.next = tu,
                n.prototype.plant = ru,
                n.prototype.reverse = ou,
                n.prototype.toJSON = n.prototype.valueOf = n.prototype.value = iu,
                n.prototype.first = n.prototype.head,
                Dc && (n.prototype[Dc] = nu),
                n
            }();
            Tn._ = Jn,
            (o = function() {
                return Jn
            }
            .call(t, n, t, r)) !== oe && (r.exports = o)
        }
        ).call(this)
    }
    ).call(t, n(82), n(162)(e))
}
, function(e, t, n) {
    var r = n(15)
      , o = n(83)
      , i = n(57)
      , a = n(58)
      , u = n(84)
      , l = function(e, t, n) {
        var s, c, f, d, p = e & l.F, h = e & l.G, y = e & l.S, m = e & l.P, v = e & l.B, g = h ? r : y ? r[t] || (r[t] = {}) : (r[t] || {}).prototype, b = h ? o : o[t] || (o[t] = {}), x = b.prototype || (b.prototype = {});
        h && (n = t);
        for (s in n)
            c = !p && g && void 0 !== g[s],
            f = (c ? g : n)[s],
            d = v && c ? u(f, r) : m && "function" == typeof f ? u(Function.call, f) : f,
            g && a(g, s, f, e & l.U),
            b[s] != f && i(b, s, d),
            m && x[s] != f && (x[s] = f)
    };
    r.core = o,
    l.F = 1,
    l.G = 2,
    l.S = 4,
    l.P = 8,
    l.B = 16,
    l.W = 32,
    l.U = 64,
    l.R = 128,
    e.exports = l
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var i = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , a = n(7)
      , u = r(a)
      , l = n(1)
      , s = r(l)
      , c = n(400)
      , f = r(c)
      , d = n(50)
      , p = r(d)
      , h = n(11)
      , y = r(h);
    t.default = new (function() {
        function e() {
            o(this, e)
        }
        return i(e, [{
            key: "getTopBottomInludeMargin",
            value: function(e) {
                var t = this.n__fh(e);
                return {
                    top: t.top - this.getComputedStyleAsNumber(e, "marginTop"),
                    bottom: t.bottom + this.getComputedStyleAsNumber(e, "marginBottom")
                }
            }
        }, {
            key: "mergeTopBottom",
            value: function(e, t) {
                return {
                    top: Math.min(e.top, t.top),
                    bottom: Math.max(e.bottom, t.bottom)
                }
            }
        }, {
            key: "getReactInternalInstance",
            value: function(e) {
                return e.reactInstance
            }
        }, {
            key: "isEditArea",
            value: function(e) {
                return e.tagName == f.default.editarea
            }
        }, {
            key: "n__eb",
            value: function(e) {
                return (0,
                u.default)(e).hasClass("main-container") || e.tagName == f.default.composite
            }
        }, {
            key: "isRoot",
            value: function(e) {
                return e.tagName == f.default.mathType
            }
        }, {
            key: "n__ec",
            value: function(e) {
                return e.tagName == f.default.line
            }
        }, {
            key: "childrenArr",
            value: function(e) {
                return Array.prototype.slice.call(e.children)
            }
        }, {
            key: "n__ed",
            value: function(e) {
                return e.tagName == f.default.blocks && e.parentElement.tagName == f.default.line
            }
        }, {
            key: "isPositionInBlockGap",
            value: function(e, t) {}
        }, {
            key: "isPrefix",
            value: function(e) {
                return e.tagName == f.default.prefix
            }
        }, {
            key: "isComposite",
            value: function(e) {
                return e.tagName == f.default.composite
            }
        }, {
            key: "hasChildEditor",
            value: function(e) {
                return !!this.isComposite(e) && e.reactInstance.hasEditor()
            }
        }, {
            key: "shouldNotMoveNestedEditor",
            value: function(e) {
                return e.reactInstance.shouldNotMoveInNestedEditor && e.reactInstance.shouldNotMoveInNestedEditor()
            }
        }, {
            key: "shouldNotMoveOutsideEditor",
            value: function(e) {
                return e.reactInstance.shouldNotMoveOutsideEditor && e.reactInstance.shouldNotMoveOutsideEditor()
            }
        }, {
            key: "n__ee",
            value: function(e) {
                return (0,
                u.default)(e).hasClass("math-container-symbol")
            }
        }, {
            key: "n__ef",
            value: function(e) {
                return (0,
                u.default)(e).hasClass("math-container-symbol") && (0,
                u.default)(e).hasClass("inline")
            }
        }, {
            key: "isNonChar",
            value: function(e) {
                return !this.isChar(e)
            }
        }, {
            key: "isChar",
            value: function(e) {
                return e.tagName == f.default.block
            }
        }, {
            key: "n__eg",
            value: function(e) {
                return e.className && e.className.indexOf("constant-text") >= 0
            }
        }, {
            key: "isEmptyBlock",
            value: function(e) {
                return e.tagName == f.default.emptyblock
            }
        }, {
            key: "isBlock",
            value: function(e) {
                return e.tagName == f.default.block || e.tagName == f.default.closesymbolblock || e.tagName == f.default.composite || e.tagName == f.default.emptyblock || e.tagName == f.default.singleblock
            }
        }, {
            key: "n__eh",
            value: function(e) {
                return !(0,
                u.default)(e).hasClass("no-editor")
            }
        }, {
            key: "n__ei",
            value: function(e) {
                return e.tagName == f.default.opensymbolblock || e.tagName == f.default.closesymbolblock
            }
        }, {
            key: "n__ej",
            value: function(e) {
                return e.tagName == f.default.opensymbolblock
            }
        }, {
            key: "n__ek",
            value: function(e) {
                return this.n__em(e) && "MIDDLE-BASE" == e.lastElementChild.tagName
            }
        }, {
            key: "n__el",
            value: function(e) {
                return this.n__em(e) && "MIDDLE-BASE" == e.firstElementChild.tagName
            }
        }, {
            key: "isSqrtSymbol",
            value: function(e) {
                return (0,
                u.default)(e).hasClass("sqrt-symbol")
            }
        }, {
            key: "n__em",
            value: function(e) {
                return (0,
                u.default)(e).hasClass("power-index-symbol-container")
            }
        }, {
            key: "n__en",
            value: function(e) {
                var t = (0,
                u.default)(e).parent().closest(f.default.composite + ", math-type");
                return t.length > 0 ? t.get(0) : null
            }
        }, {
            key: "n__eo",
            value: function(e) {
                return (0,
                u.default)(e).parent().closest(f.default.editarea).get(0)
            }
        }, {
            key: "n__ep",
            value: function(e) {
                return (0,
                u.default)(e).parent().closest(f.default.line).get(0)
            }
        }, {
            key: "n__eq",
            value: function(e) {
                return (0,
                u.default)(e).parent().closest(f.default.block + ", " + f.default.opensymbolblock + ", " + f.default.closesymbolblock + ", " + f.default.composite).get(0)
            }
        }, {
            key: "n__er",
            value: function(e) {
                var t = this.getAreaContainer(e);
                return s.default.toArray(t ? t.childNodes : e.childNodes)
            }
        }, {
            key: "n__es",
            value: function(e) {
                var t = this.getAreaContainer(e);
                return t ? t.firstElementChild : e.firstElementChild
            }
        }, {
            key: "getAreaContainer",
            value: function(e) {
                var t = e.lastElementChild;
                return t.tagName == f.default.refTag && (t = t.previousElementSibling),
                t.tagName == f.default.areaContainer ? t : null
            }
        }, {
            key: "n__et",
            value: function(e, t) {
                for (var n = this.n__es(e), r = 0; null != n && r != t; )
                    r++,
                    n = n.nextElementSibling;
                return n
            }
        }, {
            key: "n__eu",
            value: function(e, t) {
                for (var n = this.n__es(e), r = 0; null != n; ) {
                    if (n == t)
                        return r;
                    n = n.nextElementSibling,
                    r++
                }
                return -1
            }
        }, {
            key: "n__ev",
            value: function(e) {
                return this.n__ex(e) ? this.n__ev(this.n__ft(e)) : e.firstElementChild
            }
        }, {
            key: "n__ew",
            value: function(e) {
                return this.isEmptyLine(e) ? [] : this.n__ex(e) ? this.n__ew(this.n__ft(e)) : (0,
                u.default)(e).children(":not(baselineblock):not(prefix):not(ref-tag)").toArray()
            }
        }, {
            key: "n__ex",
            value: function(e) {
                return (0,
                u.default)(e).hasClass("root")
            }
        }, {
            key: "isTextEditLine",
            value: function(e) {
                return (0,
                u.default)(e).hasClass("root") || (0,
                u.default)(e).hasClass("text-mode")
            }
        }, {
            key: "n__ey",
            value: function(e) {
                return (0,
                u.default)(e).hasClass("math-container")
            }
        }, {
            key: "n__ez",
            value: function(e) {
                return this.n__ex(e) && !this.n__ey(e)
            }
        }, {
            key: "n__dl",
            value: function(e) {
                return (0,
                u.default)(e).hasClass("single-block")
            }
        }, {
            key: "n__fb",
            value: function(e) {
                var t = []
                  , n = e;
                for (t.push(e); null != n.nextElementSibling && !this.n__fj(n, n.nextElementSibling); )
                    t.push(n.nextElementSibling),
                    n = n.nextElementSibling;
                return t
            }
        }, {
            key: "n__fc",
            value: function(e) {
                var t = e.getBoundingClientRect();
                return {
                    left: this.roundTo2Decimal(t.left),
                    top: this.roundTo2Decimal(t.top),
                    right: this.roundTo2Decimal(t.right),
                    bottom: this.roundTo2Decimal(t.bottom),
                    width: this.roundTo2Decimal(t.width),
                    height: this.roundTo2Decimal(t.height)
                }
            }
        }, {
            key: "n__n",
            value: function(e, t) {
                return this.n__o(e, this.n__ct(e, t))
            }
        }, {
            key: "n__o",
            value: function(e, t) {
                var n = this.n__fh(t)
                  , r = this.n__fg(e, n.height);
                return {
                    range: t,
                    rangeRect: n,
                    dy: r,
                    computedRangeRect: p.default.n__hu(n, r)
                }
            }
        }, {
            key: "n__ct",
            value: function(e, t) {
                var n = document.createRange();
                return n.setStart(e.firstChild, t),
                n.collapse(!0),
                n
            }
        }, {
            key: "getLineHeight",
            value: function(e) {
                var t = getComputedStyle(e)["line-height"];
                if ("normal" != t) {
                    var n = Number.parseFloat(t);
                    if (Number.isFinite(n))
                        return n
                }
                return null
            }
        }, {
            key: "getLineHeightOrFontSize",
            value: function(e) {
                var t = getComputedStyle(e)["line-height"];
                if ("normal" != t) {
                    var n = Number.parseFloat(t);
                    if (Number.isFinite(n))
                        return n
                }
                return this.getComputedFontSize(e)
            }
        }, {
            key: "n__fg",
            value: function(e, t) {
                var n = getComputedStyle(e)["line-height"];
                if ("normal" != n) {
                    var r = Number.parseFloat(n);
                    if (Number.isFinite(r))
                        return (r - t) / 2
                }
                return 0
            }
        }, {
            key: "n__fh",
            value: function(e) {
                return y.default.isNoBoundingClientRectSupportForRange() && e instanceof Range ? e.getClientRects()[0] : e.getBoundingClientRect()
            }
        }, {
            key: "getElementHeight",
            value: function(e) {
                return e.getBoundingClientRect().height
            }
        }, {
            key: "roundTo2Decimal",
            value: function(e) {
                return Math.round(100 * e) / 100
            }
        }, {
            key: "getElementHeightRound2Dec",
            value: function(e) {
                return this.roundTo2Decimal(e.getBoundingClientRect().height)
            }
        }, {
            key: "n__fi",
            value: function(e) {
                return this.n__fo(e.firstElementChild.firstElementChild, e).top
            }
        }, {
            key: "n__fj",
            value: function(e, t) {
                return e.getBoundingClientRect().left > t.getBoundingClientRect().left + 3
            }
        }, {
            key: "n__fk",
            value: function(e, t) {
                return t.getBoundingClientRect().left > e.getBoundingClientRect().left + 3
            }
        }, {
            key: "n__fl",
            value: function(e, t) {
                var n = e.getBoundingClientRect()
                  , r = t.getBoundingClientRect();
                return n.bottom <= r.top + 3 || r.bottom <= n.top + 3
            }
        }, {
            key: "n__fm",
            value: function(e) {
                return e.previousElementSibling
            }
        }, {
            key: "findNextChar",
            value: function(e) {
                return e.nextElementSibling
            }
        }, {
            key: "findNextLine",
            value: function(e) {
                return e.nextElementSibling
            }
        }, {
            key: "findPreviousLine",
            value: function(e) {
                return e.previousElementSibling
            }
        }, {
            key: "n__fn",
            value: function(e, t) {
                var n = e.getBoundingClientRect()
                  , r = t.getBoundingClientRect();
                return {
                    left: this.roundTo2Decimal(n.left) - this.roundTo2Decimal(r.left),
                    top: this.roundTo2Decimal(n.top) - this.roundTo2Decimal(r.top)
                }
            }
        }, {
            key: "n__fo",
            value: function(e, t) {
                var n = this.n__fh(e)
                  , r = this.n__fh(t);
                return {
                    left: n.left - r.left,
                    top: n.top - r.top
                }
            }
        }, {
            key: "findRectToRect",
            value: function(e, t) {
                return {
                    left: e.left - t.left,
                    top: e.top - t.top,
                    width: e.width,
                    height: e.height,
                    right: e.left - t.left + e.width,
                    bottom: e.top - t.top + e.height
                }
            }
        }, {
            key: "findRectElementToRect",
            value: function(e, t) {
                return this.findRectToRect(this.n__fh(e), t)
            }
        }, {
            key: "findRectElementToElement",
            value: function(e, t) {
                return this.findRectElementToRect(e, this.n__fh(t))
            }
        }, {
            key: "n__fp",
            value: function(e) {
                if (this.isEmptyLine(e))
                    return e.firstElementChild.getBoundingClientRect();
                var t = e.firstElementChild.getBoundingClientRect();
                return {
                    left: t.left - .1,
                    right: t.left + .1,
                    top: t.top,
                    bottom: t.bottom,
                    width: .2,
                    height: t.height
                }
            }
        }, {
            key: "isEmptyLine",
            value: function(e) {
                return this.n__ex(e) ? this.isEmptyLine(this.n__ft(e)) : e.firstElementChild.nextElementSibling.tagName == f.default.emptyblock
            }
        }, {
            key: "n__fq",
            value: function(e) {
                return this.n__ex(e) ? this.n__fq(this.n__ft(e)) : e.firstElementChild.nextElementSibling
            }
        }, {
            key: "n__fr",
            value: function(e) {
                return this.n__ex(e) ? this.n__fr(this.n__ft(e)) : "REF-TAG" == e.firstElementChild.nextElementSibling.tagName ? e.firstElementChild.nextElementSibling.nextElementSibling : e.firstElementChild.nextElementSibling
            }
        }, {
            key: "n__fs",
            value: function(e) {
                return e.firstElementChild && e.firstElementChild.tagName == f.default.baseLineIndicator ? e.firstElementChild : null
            }
        }, {
            key: "n__ft",
            value: function(e) {
                return e.firstElementChild.nextElementSibling
            }
        }, {
            key: "hasNextLine",
            value: function(e) {
                return null != e.nextElementSibling
            }
        }, {
            key: "getNextLine",
            value: function(e) {
                return e.nextElementSibling
            }
        }, {
            key: "hasPreviousLine",
            value: function(e) {
                return null != e.previousElementSibling
            }
        }, {
            key: "getPreviousLine",
            value: function(e) {
                return e.previousElementSibling
            }
        }, {
            key: "getElementMiddleTopBottom",
            value: function(e) {
                var t = this.n__fh(e);
                return t.top + t.height / 2
            }
        }, {
            key: "n__fu",
            value: function(e) {
                return this.n__ex(e) ? this.n__fu(this.n__ft(e)) : e.firstElementChild
            }
        }, {
            key: "n__fv",
            value: function(e) {
                return e.tagName == f.default.baseLineBlock
            }
        }, {
            key: "n__fw",
            value: function(e, t) {
                return e ? e.getBoundingClientRect() : this.n__fp(t)
            }
        }, {
            key: "findEditors",
            value: function(e) {
                return e.reactInstance.getEditorDoms()
            }
        }, {
            key: "toRectWrapper",
            value: function(e, t) {
                return {
                    element: e,
                    rect: t
                }
            }
        }, {
            key: "n__fx",
            value: function(e) {
                return this.toRectWrapper(e, e.getBoundingClientRect())
            }
        }, {
            key: "n__fy",
            value: function(e) {
                return s.default.map(e, function(e) {
                    return {
                        element: e,
                        rect: e.getBoundingClientRect()
                    }
                })
            }
        }, {
            key: "n__fz",
            value: function(e) {
                return s.default.map(e, function(e) {
                    return {
                        data: e,
                        rect: e.element.getBoundingClientRect()
                    }
                })
            }
        }, {
            key: "n__ga",
            value: function(e) {
                var t = this.n__fh(e.mathTypeElement);
                return {
                    left: e.relativeGeoPosition.left + t.left,
                    top: e.relativeGeoPosition.top + t.top
                }
            }
        }, {
            key: "n__gb",
            value: function(e) {
                var t = this.n__fh(e.mathTypeElement);
                return {
                    left: e.maxRelativeXAxisPosition.left + t.left,
                    top: e.maxRelativeXAxisPosition.top + t.top
                }
            }
        }, {
            key: "setHeightAsBoundingHeight",
            value: function(e) {
                this.setCss(e, "height", e.getBoundingClientRect().height)
            }
        }, {
            key: "setCssEmRound",
            value: function(e, t, n) {
                var r = this.getComputedFontSize(e);
                (0,
                u.default)(e).css(t, Math.round(r * n) / r + "em")
            }
        }, {
            key: "getEmRound",
            value: function(e, t) {
                return Math.round(e * t) / t
            }
        }, {
            key: "setCss",
            value: function(e, t, n) {
                var r = (0,
                u.default)(e).css(t)
                  , o = null == n ? "" : n;
                o = s.default.isNumber(o) ? o + "px" : o,
                r != o && (0,
                u.default)(e).css(t, o)
            }
        }, {
            key: "setHeightEm",
            value: function(e, t, n) {
                n = n || this.getComputedFontSize(e),
                this.setCss(e, "height", t / n + "em")
            }
        }, {
            key: "setHeight",
            value: function(e, t) {
                this.setCss(e, "height", t)
            }
        }, {
            key: "setWidth",
            value: function(e, t) {
                this.setCss(e, "width", t)
            }
        }, {
            key: "setMinWidth",
            value: function(e, t) {
                this.setCss(e, "min-width", t)
            }
        }, {
            key: "getCssHeight",
            value: function(e) {
                return Number.parseFloat(getComputedStyle(e).height)
            }
        }, {
            key: "getComputedStyleAsNumber",
            value: function(e, t) {
                return Number.parseFloat(getComputedStyle(e)[t])
            }
        }, {
            key: "getComputedFontSize",
            value: function(e) {
                return this.getComputedStyleAsNumber(e, "font-size")
            }
        }, {
            key: "getComputedCharHeight",
            value: function(e) {
                var t = this.getComputedFontSize(e);
                return Math.round(t + t / 5)
            }
        }, {
            key: "setMarginTopEm",
            value: function(e, t, n) {
                n = n || this.getComputedFontSize(e),
                this.setCss(e, "margin-top", t / n + "em")
            }
        }, {
            key: "setMarginTop",
            value: function(e, t) {
                this.setCss(e, "margin-top", t)
            }
        }, {
            key: "n__gc",
            value: function(e) {
                return e.tagName == f.default.opensymbolblock ? {
                    bracketPosition: "open",
                    bracketType: e.getAttribute("type"),
                    element: e
                } : e.tagName == f.default.closesymbolblock ? {
                    bracketPosition: "close",
                    bracketType: e.getAttribute("type"),
                    element: e
                } : null
            }
        }, {
            key: "n__gd",
            value: function(e, t) {
                return e.getBoundingClientRect().right <= t.getBoundingClientRect().left
            }
        }, {
            key: "isStillInDomeTree",
            value: function(e) {
                return null != e.offsetParent
            }
        }, {
            key: "notInDomeTree",
            value: function(e) {
                return null == e.offsetParent
            }
        }]),
        e
    }())
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var i = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , a = n(1)
      , u = r(a)
      , l = n(843)
      , s = r(l);
    t.default = new (function() {
        function e() {
            o(this, e)
        }
        return i(e, [{
            key: "replaceArrayItemBy",
            value: function(e, t) {
                for (var n = [], r = 0; r < e.length; r++) {
                    var o = e[r]
                      , i = t(o);
                    i = i || o,
                    n.push(i)
                }
                return n
            }
        }, {
            key: "update",
            value: function(e, t) {
                return u.default.assign(u.default.clone(e), t)
            }
        }, {
            key: "setProp",
            value: function(e, t, n) {
                return this.set(e, t, n)
            }
        }, {
            key: "setIndex",
            value: function(e, t, n) {
                return this.set(e, t, n)
            }
        }, {
            key: "set",
            value: function(e, t, n) {
                return this.setFromPropsInner(e, t.toString().split("."), 0, n)
            }
        }, {
            key: "insert",
            value: function(e, t, n) {
                return null == e && (e = []),
                (0,
                s.default)(e, {
                    $splice: [[t, 0, n]]
                })
            }
        }, {
            key: "remove",
            value: function(e, t) {
                return (0,
                s.default)(e, {
                    $splice: [[t, 1]]
                })
            }
        }, {
            key: "splice",
            value: function(e, t, n) {
                for (var r = arguments.length, o = Array(r > 3 ? r - 3 : 0), i = 3; i < r; i++)
                    o[i - 3] = arguments[i];
                return (0,
                s.default)(e, {
                    $splice: [[t, n].concat(o)]
                })
            }
        }, {
            key: "replaceWithArray",
            value: function(e, t, n, r) {
                return e.slice(0, t).concat(r).concat(e.slice(t + n))
            }
        }, {
            key: "setFromProps",
            value: function(e, t, n) {
                return this.setFromPropsInner(e, t, 0, n)
            }
        }, {
            key: "setFromPropsInner",
            value: function(e, t, n, r) {
                var o = t[n];
                if (n == t.length - 1) {
                    if (e[o] == r)
                        return e;
                    var i = {};
                    return i[o] = {
                        $set: r
                    },
                    (0,
                    s.default)(e, i)
                }
                var a = this.setFromPropsInner(e[o], t, n + 1, r);
                if (a == e[o])
                    return e;
                var i = {};
                return i[o] = {
                    $set: a
                },
                (0,
                s.default)(e, i)
            }
        }]),
        e
    }())
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var i = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , a = n(1)
      , u = r(a)
      , l = n(4)
      , s = r(l)
      , c = n(52)
      , f = r(c)
      , d = n(51)
      , p = r(d)
      , h = n(6)
      , y = r(h)
      , m = n(119)
      , v = r(m);
    t.default = new (function() {
        function e() {
            o(this, e)
        }
        return i(e, [{
            key: "isControlledSelected",
            value: function(e) {
                return !!e && (!!e.controlled || !!e.selected && this.isControlledSelected(e.selected))
            }
        }, {
            key: "setLineTag",
            value: function(e, t) {
                return t && null == t.tagId && (t = s.default.setProp(t, "tagId", "tid" + Math.random())),
                s.default.setProp(e, "tagInfo", t)
            }
        }, {
            key: "getSelectedBlockFromRoot",
            value: function(e, t) {
                var n = t.lineIndex
                  , r = t.charIndex
                  , o = this.n__dx(e.lines[n], r);
                return t.selected ? this.getSelectedBlockFromRoot(o.block.elements[t.key], t.selected) : o ? o.block : null
            }
        }, {
            key: "getSelectedLineFromRoot",
            value: function(e, t) {
                var n = t.lineIndex;
                return t.selected ? this.getSelectedLineFromRoot(this.n__dx(e.lines[n], t.charIndex).block.elements[t.key], t.selected) : e.lines[n]
            }
        }, {
            key: "getSelectedEditor",
            value: function(e, t) {
                var n = t.lineIndex;
                return t.selected ? this.getSelectedEditor(this.n__dx(e.lines[n], t.charIndex).block.elements[t.key], t.selected) : e
            }
        }, {
            key: "findTabularBlock",
            value: function(e, t) {
                var n = t.lineIndex;
                if (!t.selected)
                    return null;
                var r = t.charIndex
                  , o = this.n__dx(e.lines[n], r)
                  , i = o.block.elements[t.key]
                  , a = this.findTabularBlock(i, t.selected);
                return a || (t.key && this.n__dd(t.key) ? o.block : null)
            }
        }, {
            key: "nextTagId",
            value: function() {
                return "tid" + Math.random()
            }
        }, {
            key: "findLeafSelected",
            value: function(e) {
                return e ? e.selected ? this.findLeafSelected(e.selected) : e : null
            }
        }, {
            key: "findLeafParentSelected",
            value: function(e) {
                return e && e.selected ? e.selected.selected ? this.findLeafParentSelected(e.selected) : e : null
            }
        }, {
            key: "isAnyLowerBigLastLine",
            value: function(e) {
                var t = u.default.last(e.lines);
                return u.default.some(t.blocks, function(e) {
                    return f.default.isTextBlock(e) ? v.default.isAnyLowerBig(e.text) : !!f.default.isNonTextBlock(e) || void 0
                })
            }
        }, {
            key: "isAnyUpperBigFirstLine",
            value: function(e) {
                var t = u.default.first(e.lines);
                return u.default.some(t.blocks, function(e) {
                    return f.default.isTextBlock(e) ? v.default.isAnyUpperBig(e.text) : !!f.default.isNonTextBlock(e) || void 0
                })
            }
        }, {
            key: "n__da",
            value: function(e) {
                return e.type && "composite" == e.type && ("\\math-container" == e.text && e.displayMode || "\\align" == e.text || "gather" == e.text)
            }
        }, {
            key: "isDiagramBlock",
            value: function(e) {
                return e && "composite" == e.type && "\\diagram" == e.text
            }
        }, {
            key: "isImageContainerBlock",
            value: function(e) {
                return e && "composite" == e.type && "\\image-container" == e.text
            }
        }, {
            key: "isInlineImageBlock",
            value: function(e) {
                return e && "composite" == e.type && "\\inline-image" == e.text
            }
        }, {
            key: "n__db",
            value: function(e) {
                var t = u.default.clone(e);
                return t.elements = u.default.clone(e.elements),
                t
            }
        }, {
            key: "cloneCompositeBlockWithEmptyElements",
            value: function(e) {
                var t = u.default.clone(e);
                return t.elements = {},
                t
            }
        }, {
            key: "n__dc",
            value: function(e) {
                return "\\binom" != e.text && this.n__dd(u.default.keys(e.elements)[0])
            }
        }, {
            key: "isTable",
            value: function(e) {
                return f.default.isComposite(e) && "\\table" == e.text
            }
        }, {
            key: "isBinom",
            value: function(e) {
                return f.default.isComposite(e) && ("\\binom" == e.text || "\\tbinom" == e.text || "\\dbinom" == e.text)
            }
        }, {
            key: "n__dd",
            value: function(e) {
                return /^[0-9]+_[0-9]+$/.test(e)
            }
        }, {
            key: "n__de",
            value: function(e) {
                var t = this.n__dj(e);
                return this.getKeyFromRowCol(Math.max(0, t.row - 1), t.column)
            }
        }, {
            key: "n__df",
            value: function(e) {
                var t = this.n__dj(e);
                return this.getKeyFromRowCol(t.row + 1, t.column)
            }
        }, {
            key: "n__dg",
            value: function(e, t) {
                var n = this;
                return u.default.filter(u.default.keys(e.elements), function(e) {
                    return n.n__dj(e).row == t
                })
            }
        }, {
            key: "n__dh",
            value: function(e, t) {
                var n = this.n__dj(e)
                  , r = this.n__dj(t)
                  , o = {
                    row: Math.min(n.row, r.row),
                    column: Math.min(n.column, r.column)
                };
                return o.row + "_" + o.column
            }
        }, {
            key: "getKeyFromRowCol",
            value: function(e, t) {
                return e + "_" + t
            }
        }, {
            key: "n__di",
            value: function(e) {
                var t = this
                  , n = {
                    minRow: 999,
                    minCol: 999,
                    maxRow: 0,
                    maxCol: 0
                };
                return e.forEach(function(e) {
                    var r = t.n__dj(e);
                    n = {
                        minRow: Math.min(r.row, n.minRow),
                        minCol: Math.min(r.column, n.minCol),
                        maxRow: Math.max(r.row, n.maxRow),
                        maxCol: Math.max(r.column, n.maxCol)
                    }
                }),
                n
            }
        }, {
            key: "n__dj",
            value: function(e) {
                var t = e.split("_");
                return {
                    row: Number.parseInt(t[0]),
                    column: Number.parseInt(t[1])
                }
            }
        }, {
            key: "n__dk",
            value: function(e) {
                return u.default.keys(e.elements)
            }
        }, {
            key: "n__dl",
            value: function(e) {
                return e.singleBlock
            }
        }, {
            key: "n__dm",
            value: function(e) {
                return {
                    id: y.default.nextId(),
                    text: e
                }
            }
        }, {
            key: "n__dn",
            value: function(e) {
                return s.default.setProp(e, "style", void 0)
            }
        }, {
            key: "n__do",
            value: function() {
                return {
                    id: y.default.nextId(),
                    blocks: []
                }
            }
        }, {
            key: "n__dp",
            value: function(e) {
                return {
                    id: y.default.nextId(),
                    text: e,
                    type: "composite",
                    elements: {}
                }
            }
        }, {
            key: "n__dq",
            value: function(e) {
                return {
                    id: y.default.nextId(),
                    blocks: [e]
                }
            }
        }, {
            key: "n__dr",
            value: function(e) {
                return {
                    id: y.default.nextId(),
                    blocks: e
                }
            }
        }, {
            key: "n__ds",
            value: function(e) {
                return e ? {
                    id: y.default.nextId(),
                    blocks: [{
                        id: y.default.nextId(),
                        text: e
                    }]
                } : {
                    id: y.default.nextId(),
                    blocks: []
                }
            }
        }, {
            key: "n__dt",
            value: function(e) {
                return {
                    id: e || y.default.nextId(),
                    lines: [{
                        id: y.default.nextId(),
                        blocks: []
                    }]
                }
            }
        }, {
            key: "createEmptyEditorWithElements",
            value: function() {
                return {
                    id: y.default.nextId(),
                    lines: [{
                        id: y.default.nextId(),
                        blocks: []
                    }]
                }
            }
        }, {
            key: "isEmptyLine",
            value: function(e) {
                return 0 == e.blocks.length
            }
        }, {
            key: "n__du",
            value: function(e) {
                return null == e ? this.n__dt() : u.default.isString(e) ? this.n__dv(e) : 0 == e.length ? this.n__dt() : (e.text && (e = [this.n__dq(e)]),
                {
                    id: y.default.nextId(),
                    lines: e
                })
            }
        }, {
            key: "n__dv",
            value: function(e, t) {
                var n = this.n__dt(t);
                return n.lines[0].blocks = [{
                    id: y.default.nextId(),
                    text: e
                }],
                n
            }
        }, {
            key: "blockEach",
            value: function(e, t) {
                for (var n = 0, r = 0; r < e.blocks.length; r++) {
                    var o = e.blocks[r]
                      , i = n
                      , a = n + f.default.getCharCount(o) - 1
                      , u = t(o, r, i, a);
                    if (u)
                        return u;
                    n += f.default.getCharCount(o)
                }
            }
        }, {
            key: "getTotalChar",
            value: function(e) {
                return u.default.sumBy(e, function(e) {
                    return f.default.getCharCount(e)
                })
            }
        }, {
            key: "n__dw",
            value: function(e) {
                return this.getTotalChar(u.default.last(e.lines).blocks)
            }
        }, {
            key: "n__dx",
            value: function(e, t) {
                return this.blockEach(e, function(e, n, r, o) {
                    if (t >= r && t <= o)
                        return {
                            block: e,
                            blockIndex: n,
                            startIndex: r,
                            endIndex: o
                        }
                })
            }
        }, {
            key: "n__dy",
            value: function(e, t, n) {
                var r = e.lines[t]
                  , o = this.n__dx(r, n);
                return o ? o.block : null
            }
        }, {
            key: "n__dz",
            value: function(e, t) {
                for (var n = 0, r = 0; r < e.blocks.length; r++) {
                    var o = e.blocks[r]
                      , i = n
                      , a = n + f.default.getCharCount(o) - 1;
                    if (t >= i && t <= a)
                        return r;
                    n += f.default.getCharCount(o)
                }
                return e.blocks.length - 1
            }
        }, {
            key: "n__ea",
            value: function(e, t) {
                if (f.default.isNonTextBlock(e)) {
                    var n = this.n__dk(e);
                    return n.length > 0 ? s.default.update(t, {
                        key: n[0],
                        selected: {
                            lineIndex: 0,
                            charIndex: 0
                        }
                    }) : s.default.update(t, {
                        charIndex: t.charIndex + 1,
                        selected: null
                    })
                }
                return s.default.update(t, {
                    charIndex: t.charIndex + p.default.lengthByCache(e),
                    selected: null
                })
            }
        }]),
        e
    }())
}
, function(e, t, n) {
    "use strict";
    function r(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var o = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , i = n(1)
      , a = function(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }(i);
    t.default = new (function() {
        function e() {
            r(this, e)
        }
        return o(e, [{
            key: "nextId",
            value: function() {
                return "n" + Math.random()
            }
        }, {
            key: "nextDiagramEditorId",
            value: function() {
                return "de" + Math.random().toString().substr(2)
            }
        }, {
            key: "nextDiagramConnectionId",
            value: function() {
                return "dc" + Math.random().toString().substr(2)
            }
        }, {
            key: "nextDiagramArrowId",
            value: function() {
                return "da" + Math.random().toString().substr(2)
            }
        }, {
            key: "nextDiagramLabelEditorId",
            value: function() {
                return "dl" + Math.random().toString().substr(2)
            }
        }, {
            key: "nextDiagramShapeId",
            value: function() {
                return "ds" + Math.random().toString().substr(2)
            }
        }, {
            key: "nextDiagramIntersectionId",
            value: function() {
                return "di" + Math.random().toString().substr(2)
            }
        }, {
            key: "nextDiagramCompositeShapeId",
            value: function() {
                return "dp" + Math.random().toString().substr(2)
            }
        }, {
            key: "nextTemporaryEntity",
            value: function() {
                return "temp" + Math.random().toString().substr(2)
            }
        }, {
            key: "isDiagramArrowId",
            value: function(e) {
                return a.default.startsWith(e, "da")
            }
        }, {
            key: "isDiagramConnectionId",
            value: function(e) {
                return a.default.startsWith(e, "dc")
            }
        }, {
            key: "isDiagramEditorId",
            value: function(e) {
                return a.default.startsWith(e, "de")
            }
        }, {
            key: "isDiagramLabelEditorId",
            value: function(e) {
                return a.default.startsWith(e, "dl")
            }
        }, {
            key: "isDiagramShapeId",
            value: function(e) {
                return a.default.startsWith(e, "ds")
            }
        }, {
            key: "isDiagramShapeOrArrowOrCompositeId",
            value: function(e) {
                return this.isDiagramShapeId(e) || this.isDiagramArrowId(e) || this.isDiagramCompositeShapeId(e)
            }
        }, {
            key: "isDiagramIntersectionId",
            value: function(e) {
                return a.default.startsWith(e, "di")
            }
        }, {
            key: "isDiagramCompositeShapeId",
            value: function(e) {
                return a.default.startsWith(e, "dp")
            }
        }, {
            key: "isTemporaryEntity",
            value: function(e) {
                return a.default.startsWith(e, "temp")
            }
        }]),
        e
    }())
}
, function(e, t, n) {
    var r, o;
    !function(t, n) {
        "use strict";
        "object" == typeof e && "object" == typeof e.exports ? e.exports = t.document ? n(t, !0) : function(e) {
            if (!e.document)
                throw new Error("jQuery requires a window with a document");
            return n(e)
        }
        : n(t)
    }("undefined" != typeof window ? window : this, function(n, i) {
        "use strict";
        function a(e, t) {
            t = t || ae;
            var n = t.createElement("script");
            n.text = e,
            t.head.appendChild(n).parentNode.removeChild(n)
        }
        function u(e) {
            var t = !!e && "length"in e && e.length
              , n = ge.type(e);
            return "function" !== n && !ge.isWindow(e) && ("array" === n || 0 === t || "number" == typeof t && t > 0 && t - 1 in e)
        }
        function l(e, t) {
            return e.nodeName && e.nodeName.toLowerCase() === t.toLowerCase()
        }
        function s(e, t, n) {
            return ge.isFunction(t) ? ge.grep(e, function(e, r) {
                return !!t.call(e, r, e) !== n
            }) : t.nodeType ? ge.grep(e, function(e) {
                return e === t !== n
            }) : "string" != typeof t ? ge.grep(e, function(e) {
                return fe.call(t, e) > -1 !== n
            }) : Oe.test(t) ? ge.filter(t, e, n) : (t = ge.filter(t, e),
            ge.grep(e, function(e) {
                return fe.call(t, e) > -1 !== n && 1 === e.nodeType
            }))
        }
        function c(e, t) {
            for (; (e = e[t]) && 1 !== e.nodeType; )
                ;
            return e
        }
        function f(e) {
            var t = {};
            return ge.each(e.match(Te) || [], function(e, n) {
                t[n] = !0
            }),
            t
        }
        function d(e) {
            return e
        }
        function p(e) {
            throw e
        }
        function h(e, t, n, r) {
            var o;
            try {
                e && ge.isFunction(o = e.promise) ? o.call(e).done(t).fail(n) : e && ge.isFunction(o = e.then) ? o.call(e, t, n) : t.apply(void 0, [e].slice(r))
            } catch (e) {
                n.apply(void 0, [e])
            }
        }
        function y() {
            ae.removeEventListener("DOMContentLoaded", y),
            n.removeEventListener("load", y),
            ge.ready()
        }
        function m() {
            this.expando = ge.expando + m.uid++
        }
        function v(e) {
            return "true" === e || "false" !== e && ("null" === e ? null : e === +e + "" ? +e : Ue.test(e) ? JSON.parse(e) : e)
        }
        function g(e, t, n) {
            var r;
            if (void 0 === n && 1 === e.nodeType)
                if (r = "data-" + t.replace(ze, "-$&").toLowerCase(),
                "string" == typeof (n = e.getAttribute(r))) {
                    try {
                        n = v(n)
                    } catch (e) {}
                    Ne.set(e, t, n)
                } else
                    n = void 0;
            return n
        }
        function b(e, t, n, r) {
            var o, i = 1, a = 20, u = r ? function() {
                return r.cur()
            }
            : function() {
                return ge.css(e, t, "")
            }
            , l = u(), s = n && n[3] || (ge.cssNumber[t] ? "" : "px"), c = (ge.cssNumber[t] || "px" !== s && +l) && We.exec(ge.css(e, t));
            if (c && c[3] !== s) {
                s = s || c[3],
                n = n || [],
                c = +l || 1;
                do {
                    i = i || ".5",
                    c /= i,
                    ge.style(e, t, c + s)
                } while (i !== (i = u() / l) && 1 !== i && --a)
            }
            return n && (c = +c || +l || 0,
            o = n[1] ? c + (n[1] + 1) * n[2] : +n[2],
            r && (r.unit = s,
            r.start = c,
            r.end = o)),
            o
        }
        function x(e) {
            var t, n = e.ownerDocument, r = e.nodeName, o = Ke[r];
            return o || (t = n.body.appendChild(n.createElement(r)),
            o = ge.css(t, "display"),
            t.parentNode.removeChild(t),
            "none" === o && (o = "block"),
            Ke[r] = o,
            o)
        }
        function w(e, t) {
            for (var n, r, o = [], i = 0, a = e.length; i < a; i++)
                r = e[i],
                r.style && (n = r.style.display,
                t ? ("none" === n && ((o[i] = Fe.get(r, "display") || null) || (r.style.display = "")),
                "" === r.style.display && Ge(r) && (o[i] = x(r))) : "none" !== n && (o[i] = "none",
                Fe.set(r, "display", n)));
            for (i = 0; i < a; i++)
                null != o[i] && (e[i].style.display = o[i]);
            return e
        }
        function C(e, t) {
            var n;
            return n = void 0 !== e.getElementsByTagName ? e.getElementsByTagName(t || "*") : void 0 !== e.querySelectorAll ? e.querySelectorAll(t || "*") : [],
            void 0 === t || t && l(e, t) ? ge.merge([e], n) : n
        }
        function E(e, t) {
            for (var n = 0, r = e.length; n < r; n++)
                Fe.set(e[n], "globalEval", !t || Fe.get(t[n], "globalEval"))
        }
        function k(e, t, n, r, o) {
            for (var i, a, u, l, s, c, f = t.createDocumentFragment(), d = [], p = 0, h = e.length; p < h; p++)
                if ((i = e[p]) || 0 === i)
                    if ("object" === ge.type(i))
                        ge.merge(d, i.nodeType ? [i] : i);
                    else if (Ze.test(i)) {
                        for (a = a || f.appendChild(t.createElement("div")),
                        u = (Je.exec(i) || ["", ""])[1].toLowerCase(),
                        l = Xe[u] || Xe._default,
                        a.innerHTML = l[1] + ge.htmlPrefilter(i) + l[2],
                        c = l[0]; c--; )
                            a = a.lastChild;
                        ge.merge(d, a.childNodes),
                        a = f.firstChild,
                        a.textContent = ""
                    } else
                        d.push(t.createTextNode(i));
            for (f.textContent = "",
            p = 0; i = d[p++]; )
                if (r && ge.inArray(i, r) > -1)
                    o && o.push(i);
                else if (s = ge.contains(i.ownerDocument, i),
                a = C(f.appendChild(i), "script"),
                s && E(a),
                n)
                    for (c = 0; i = a[c++]; )
                        Ye.test(i.type || "") && n.push(i);
            return f
        }
        function _() {
            return !0
        }
        function A() {
            return !1
        }
        function S() {
            try {
                return ae.activeElement
            } catch (e) {}
        }
        function O(e, t, n, r, o, i) {
            var a, u;
            if ("object" == typeof t) {
                "string" != typeof n && (r = r || n,
                n = void 0);
                for (u in t)
                    O(e, u, n, r, t[u], i);
                return e
            }
            if (null == r && null == o ? (o = n,
            r = n = void 0) : null == o && ("string" == typeof n ? (o = r,
            r = void 0) : (o = r,
            r = n,
            n = void 0)),
            !1 === o)
                o = A;
            else if (!o)
                return e;
            return 1 === i && (a = o,
            o = function(e) {
                return ge().off(e),
                a.apply(this, arguments)
            }
            ,
            o.guid = a.guid || (a.guid = ge.guid++)),
            e.each(function() {
                ge.event.add(this, t, o, r, n)
            })
        }
        function P(e, t) {
            return l(e, "table") && l(11 !== t.nodeType ? t : t.firstChild, "tr") ? ge(">tbody", e)[0] || e : e
        }
        function M(e) {
            return e.type = (null !== e.getAttribute("type")) + "/" + e.type,
            e
        }
        function I(e) {
            var t = at.exec(e.type);
            return t ? e.type = t[1] : e.removeAttribute("type"),
            e
        }
        function D(e, t) {
            var n, r, o, i, a, u, l, s;
            if (1 === t.nodeType) {
                if (Fe.hasData(e) && (i = Fe.access(e),
                a = Fe.set(t, i),
                s = i.events)) {
                    delete a.handle,
                    a.events = {};
                    for (o in s)
                        for (n = 0,
                        r = s[o].length; n < r; n++)
                            ge.event.add(t, o, s[o][n])
                }
                Ne.hasData(e) && (u = Ne.access(e),
                l = ge.extend({}, u),
                Ne.set(t, l))
            }
        }
        function T(e, t) {
            var n = t.nodeName.toLowerCase();
            "input" === n && Qe.test(e.type) ? t.checked = e.checked : "input" !== n && "textarea" !== n || (t.defaultValue = e.defaultValue)
        }
        function B(e, t, n, r) {
            t = se.apply([], t);
            var o, i, u, l, s, c, f = 0, d = e.length, p = d - 1, h = t[0], y = ge.isFunction(h);
            if (y || d > 1 && "string" == typeof h && !ve.checkClone && it.test(h))
                return e.each(function(o) {
                    var i = e.eq(o);
                    y && (t[0] = h.call(this, o, i.html())),
                    B(i, t, n, r)
                });
            if (d && (o = k(t, e[0].ownerDocument, !1, e, r),
            i = o.firstChild,
            1 === o.childNodes.length && (o = i),
            i || r)) {
                for (u = ge.map(C(o, "script"), M),
                l = u.length; f < d; f++)
                    s = o,
                    f !== p && (s = ge.clone(s, !0, !0),
                    l && ge.merge(u, C(s, "script"))),
                    n.call(e[f], s, f);
                if (l)
                    for (c = u[u.length - 1].ownerDocument,
                    ge.map(u, I),
                    f = 0; f < l; f++)
                        s = u[f],
                        Ye.test(s.type || "") && !Fe.access(s, "globalEval") && ge.contains(c, s) && (s.src ? ge._evalUrl && ge._evalUrl(s.src) : a(s.textContent.replace(ut, ""), c))
            }
            return e
        }
        function j(e, t, n) {
            for (var r, o = t ? ge.filter(t, e) : e, i = 0; null != (r = o[i]); i++)
                n || 1 !== r.nodeType || ge.cleanData(C(r)),
                r.parentNode && (n && ge.contains(r.ownerDocument, r) && E(C(r, "script")),
                r.parentNode.removeChild(r));
            return e
        }
        function L(e, t, n) {
            var r, o, i, a, u = e.style;
            return n = n || ct(e),
            n && (a = n.getPropertyValue(t) || n[t],
            "" !== a || ge.contains(e.ownerDocument, e) || (a = ge.style(e, t)),
            !ve.pixelMarginRight() && st.test(a) && lt.test(t) && (r = u.width,
            o = u.minWidth,
            i = u.maxWidth,
            u.minWidth = u.maxWidth = u.width = a,
            a = n.width,
            u.width = r,
            u.minWidth = o,
            u.maxWidth = i)),
            void 0 !== a ? a + "" : a
        }
        function R(e, t) {
            return {
                get: function() {
                    return e() ? void delete this.get : (this.get = t).apply(this, arguments)
                }
            }
        }
        function F(e) {
            if (e in mt)
                return e;
            for (var t = e[0].toUpperCase() + e.slice(1), n = yt.length; n--; )
                if ((e = yt[n] + t)in mt)
                    return e
        }
        function N(e) {
            var t = ge.cssProps[e];
            return t || (t = ge.cssProps[e] = F(e) || e),
            t
        }
        function U(e, t, n) {
            var r = We.exec(t);
            return r ? Math.max(0, r[2] - (n || 0)) + (r[3] || "px") : t
        }
        function z(e, t, n, r, o) {
            var i, a = 0;
            for (i = n === (r ? "border" : "content") ? 4 : "width" === t ? 1 : 0; i < 4; i += 2)
                "margin" === n && (a += ge.css(e, n + qe[i], !0, o)),
                r ? ("content" === n && (a -= ge.css(e, "padding" + qe[i], !0, o)),
                "margin" !== n && (a -= ge.css(e, "border" + qe[i] + "Width", !0, o))) : (a += ge.css(e, "padding" + qe[i], !0, o),
                "padding" !== n && (a += ge.css(e, "border" + qe[i] + "Width", !0, o)));
            return a
        }
        function H(e, t, n) {
            var r, o = ct(e), i = L(e, t, o), a = "border-box" === ge.css(e, "boxSizing", !1, o);
            return st.test(i) ? i : (r = a && (ve.boxSizingReliable() || i === e.style[t]),
            "auto" === i && (i = e["offset" + t[0].toUpperCase() + t.slice(1)]),
            (i = parseFloat(i) || 0) + z(e, t, n || (a ? "border" : "content"), r, o) + "px")
        }
        function W(e, t, n, r, o) {
            return new W.prototype.init(e,t,n,r,o)
        }
        function q() {
            gt && (!1 === ae.hidden && n.requestAnimationFrame ? n.requestAnimationFrame(q) : n.setTimeout(q, ge.fx.interval),
            ge.fx.tick())
        }
        function G() {
            return n.setTimeout(function() {
                vt = void 0
            }),
            vt = ge.now()
        }
        function V(e, t) {
            var n, r = 0, o = {
                height: e
            };
            for (t = t ? 1 : 0; r < 4; r += 2 - t)
                n = qe[r],
                o["margin" + n] = o["padding" + n] = e;
            return t && (o.opacity = o.width = e),
            o
        }
        function K(e, t, n) {
            for (var r, o = (Y.tweeners[t] || []).concat(Y.tweeners["*"]), i = 0, a = o.length; i < a; i++)
                if (r = o[i].call(n, t, e))
                    return r
        }
        function Q(e, t, n) {
            var r, o, i, a, u, l, s, c, f = "width"in t || "height"in t, d = this, p = {}, h = e.style, y = e.nodeType && Ge(e), m = Fe.get(e, "fxshow");
            n.queue || (a = ge._queueHooks(e, "fx"),
            null == a.unqueued && (a.unqueued = 0,
            u = a.empty.fire,
            a.empty.fire = function() {
                a.unqueued || u()
            }
            ),
            a.unqueued++,
            d.always(function() {
                d.always(function() {
                    a.unqueued--,
                    ge.queue(e, "fx").length || a.empty.fire()
                })
            }));
            for (r in t)
                if (o = t[r],
                bt.test(o)) {
                    if (delete t[r],
                    i = i || "toggle" === o,
                    o === (y ? "hide" : "show")) {
                        if ("show" !== o || !m || void 0 === m[r])
                            continue;
                        y = !0
                    }
                    p[r] = m && m[r] || ge.style(e, r)
                }
            if ((l = !ge.isEmptyObject(t)) || !ge.isEmptyObject(p)) {
                f && 1 === e.nodeType && (n.overflow = [h.overflow, h.overflowX, h.overflowY],
                s = m && m.display,
                null == s && (s = Fe.get(e, "display")),
                c = ge.css(e, "display"),
                "none" === c && (s ? c = s : (w([e], !0),
                s = e.style.display || s,
                c = ge.css(e, "display"),
                w([e]))),
                ("inline" === c || "inline-block" === c && null != s) && "none" === ge.css(e, "float") && (l || (d.done(function() {
                    h.display = s
                }),
                null == s && (c = h.display,
                s = "none" === c ? "" : c)),
                h.display = "inline-block")),
                n.overflow && (h.overflow = "hidden",
                d.always(function() {
                    h.overflow = n.overflow[0],
                    h.overflowX = n.overflow[1],
                    h.overflowY = n.overflow[2]
                })),
                l = !1;
                for (r in p)
                    l || (m ? "hidden"in m && (y = m.hidden) : m = Fe.access(e, "fxshow", {
                        display: s
                    }),
                    i && (m.hidden = !y),
                    y && w([e], !0),
                    d.done(function() {
                        y || w([e]),
                        Fe.remove(e, "fxshow");
                        for (r in p)
                            ge.style(e, r, p[r])
                    })),
                    l = K(y ? m[r] : 0, r, d),
                    r in m || (m[r] = l.start,
                    y && (l.end = l.start,
                    l.start = 0))
            }
        }
        function J(e, t) {
            var n, r, o, i, a;
            for (n in e)
                if (r = ge.camelCase(n),
                o = t[r],
                i = e[n],
                Array.isArray(i) && (o = i[1],
                i = e[n] = i[0]),
                n !== r && (e[r] = i,
                delete e[n]),
                (a = ge.cssHooks[r]) && "expand"in a) {
                    i = a.expand(i),
                    delete e[r];
                    for (n in i)
                        n in e || (e[n] = i[n],
                        t[n] = o)
                } else
                    t[r] = o
        }
        function Y(e, t, n) {
            var r, o, i = 0, a = Y.prefilters.length, u = ge.Deferred().always(function() {
                delete l.elem
            }), l = function() {
                if (o)
                    return !1;
                for (var t = vt || G(), n = Math.max(0, s.startTime + s.duration - t), r = n / s.duration || 0, i = 1 - r, a = 0, l = s.tweens.length; a < l; a++)
                    s.tweens[a].run(i);
                return u.notifyWith(e, [s, i, n]),
                i < 1 && l ? n : (l || u.notifyWith(e, [s, 1, 0]),
                u.resolveWith(e, [s]),
                !1)
            }, s = u.promise({
                elem: e,
                props: ge.extend({}, t),
                opts: ge.extend(!0, {
                    specialEasing: {},
                    easing: ge.easing._default
                }, n),
                originalProperties: t,
                originalOptions: n,
                startTime: vt || G(),
                duration: n.duration,
                tweens: [],
                createTween: function(t, n) {
                    var r = ge.Tween(e, s.opts, t, n, s.opts.specialEasing[t] || s.opts.easing);
                    return s.tweens.push(r),
                    r
                },
                stop: function(t) {
                    var n = 0
                      , r = t ? s.tweens.length : 0;
                    if (o)
                        return this;
                    for (o = !0; n < r; n++)
                        s.tweens[n].run(1);
                    return t ? (u.notifyWith(e, [s, 1, 0]),
                    u.resolveWith(e, [s, t])) : u.rejectWith(e, [s, t]),
                    this
                }
            }), c = s.props;
            for (J(c, s.opts.specialEasing); i < a; i++)
                if (r = Y.prefilters[i].call(s, e, c, s.opts))
                    return ge.isFunction(r.stop) && (ge._queueHooks(s.elem, s.opts.queue).stop = ge.proxy(r.stop, r)),
                    r;
            return ge.map(c, K, s),
            ge.isFunction(s.opts.start) && s.opts.start.call(e, s),
            s.progress(s.opts.progress).done(s.opts.done, s.opts.complete).fail(s.opts.fail).always(s.opts.always),
            ge.fx.timer(ge.extend(l, {
                elem: e,
                anim: s,
                queue: s.opts.queue
            })),
            s
        }
        function X(e) {
            return (e.match(Te) || []).join(" ")
        }
        function Z(e) {
            return e.getAttribute && e.getAttribute("class") || ""
        }
        function $(e, t, n, r) {
            var o;
            if (Array.isArray(t))
                ge.each(t, function(t, o) {
                    n || Mt.test(e) ? r(e, o) : $(e + "[" + ("object" == typeof o && null != o ? t : "") + "]", o, n, r)
                });
            else if (n || "object" !== ge.type(t))
                r(e, t);
            else
                for (o in t)
                    $(e + "[" + o + "]", t[o], n, r)
        }
        function ee(e) {
            return function(t, n) {
                "string" != typeof t && (n = t,
                t = "*");
                var r, o = 0, i = t.toLowerCase().match(Te) || [];
                if (ge.isFunction(n))
                    for (; r = i[o++]; )
                        "+" === r[0] ? (r = r.slice(1) || "*",
                        (e[r] = e[r] || []).unshift(n)) : (e[r] = e[r] || []).push(n)
            }
        }
        function te(e, t, n, r) {
            function o(u) {
                var l;
                return i[u] = !0,
                ge.each(e[u] || [], function(e, u) {
                    var s = u(t, n, r);
                    return "string" != typeof s || a || i[s] ? a ? !(l = s) : void 0 : (t.dataTypes.unshift(s),
                    o(s),
                    !1)
                }),
                l
            }
            var i = {}
              , a = e === Ht;
            return o(t.dataTypes[0]) || !i["*"] && o("*")
        }
        function ne(e, t) {
            var n, r, o = ge.ajaxSettings.flatOptions || {};
            for (n in t)
                void 0 !== t[n] && ((o[n] ? e : r || (r = {}))[n] = t[n]);
            return r && ge.extend(!0, e, r),
            e
        }
        function re(e, t, n) {
            for (var r, o, i, a, u = e.contents, l = e.dataTypes; "*" === l[0]; )
                l.shift(),
                void 0 === r && (r = e.mimeType || t.getResponseHeader("Content-Type"));
            if (r)
                for (o in u)
                    if (u[o] && u[o].test(r)) {
                        l.unshift(o);
                        break
                    }
            if (l[0]in n)
                i = l[0];
            else {
                for (o in n) {
                    if (!l[0] || e.converters[o + " " + l[0]]) {
                        i = o;
                        break
                    }
                    a || (a = o)
                }
                i = i || a
            }
            if (i)
                return i !== l[0] && l.unshift(i),
                n[i]
        }
        function oe(e, t, n, r) {
            var o, i, a, u, l, s = {}, c = e.dataTypes.slice();
            if (c[1])
                for (a in e.converters)
                    s[a.toLowerCase()] = e.converters[a];
            for (i = c.shift(); i; )
                if (e.responseFields[i] && (n[e.responseFields[i]] = t),
                !l && r && e.dataFilter && (t = e.dataFilter(t, e.dataType)),
                l = i,
                i = c.shift())
                    if ("*" === i)
                        i = l;
                    else if ("*" !== l && l !== i) {
                        if (!(a = s[l + " " + i] || s["* " + i]))
                            for (o in s)
                                if (u = o.split(" "),
                                u[1] === i && (a = s[l + " " + u[0]] || s["* " + u[0]])) {
                                    !0 === a ? a = s[o] : !0 !== s[o] && (i = u[0],
                                    c.unshift(u[1]));
                                    break
                                }
                        if (!0 !== a)
                            if (a && e.throws)
                                t = a(t);
                            else
                                try {
                                    t = a(t)
                                } catch (e) {
                                    return {
                                        state: "parsererror",
                                        error: a ? e : "No conversion from " + l + " to " + i
                                    }
                                }
                    }
            return {
                state: "success",
                data: t
            }
        }
        var ie = []
          , ae = n.document
          , ue = Object.getPrototypeOf
          , le = ie.slice
          , se = ie.concat
          , ce = ie.push
          , fe = ie.indexOf
          , de = {}
          , pe = de.toString
          , he = de.hasOwnProperty
          , ye = he.toString
          , me = ye.call(Object)
          , ve = {}
          , ge = function(e, t) {
            return new ge.fn.init(e,t)
        }
          , be = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g
          , xe = /^-ms-/
          , we = /-([a-z])/g
          , Ce = function(e, t) {
            return t.toUpperCase()
        };
        ge.fn = ge.prototype = {
            jquery: "3.2.1",
            constructor: ge,
            length: 0,
            toArray: function() {
                return le.call(this)
            },
            get: function(e) {
                return null == e ? le.call(this) : e < 0 ? this[e + this.length] : this[e]
            },
            pushStack: function(e) {
                var t = ge.merge(this.constructor(), e);
                return t.prevObject = this,
                t
            },
            each: function(e) {
                return ge.each(this, e)
            },
            map: function(e) {
                return this.pushStack(ge.map(this, function(t, n) {
                    return e.call(t, n, t)
                }))
            },
            slice: function() {
                return this.pushStack(le.apply(this, arguments))
            },
            first: function() {
                return this.eq(0)
            },
            last: function() {
                return this.eq(-1)
            },
            eq: function(e) {
                var t = this.length
                  , n = +e + (e < 0 ? t : 0);
                return this.pushStack(n >= 0 && n < t ? [this[n]] : [])
            },
            end: function() {
                return this.prevObject || this.constructor()
            },
            push: ce,
            sort: ie.sort,
            splice: ie.splice
        },
        ge.extend = ge.fn.extend = function() {
            var e, t, n, r, o, i, a = arguments[0] || {}, u = 1, l = arguments.length, s = !1;
            for ("boolean" == typeof a && (s = a,
            a = arguments[u] || {},
            u++),
            "object" == typeof a || ge.isFunction(a) || (a = {}),
            u === l && (a = this,
            u--); u < l; u++)
                if (null != (e = arguments[u]))
                    for (t in e)
                        n = a[t],
                        r = e[t],
                        a !== r && (s && r && (ge.isPlainObject(r) || (o = Array.isArray(r))) ? (o ? (o = !1,
                        i = n && Array.isArray(n) ? n : []) : i = n && ge.isPlainObject(n) ? n : {},
                        a[t] = ge.extend(s, i, r)) : void 0 !== r && (a[t] = r));
            return a
        }
        ,
        ge.extend({
            expando: "jQuery" + ("3.2.1" + Math.random()).replace(/\D/g, ""),
            isReady: !0,
            error: function(e) {
                throw new Error(e)
            },
            noop: function() {},
            isFunction: function(e) {
                return "function" === ge.type(e)
            },
            isWindow: function(e) {
                return null != e && e === e.window
            },
            isNumeric: function(e) {
                var t = ge.type(e);
                return ("number" === t || "string" === t) && !isNaN(e - parseFloat(e))
            },
            isPlainObject: function(e) {
                var t, n;
                return !(!e || "[object Object]" !== pe.call(e)) && (!(t = ue(e)) || "function" == typeof (n = he.call(t, "constructor") && t.constructor) && ye.call(n) === me)
            },
            isEmptyObject: function(e) {
                var t;
                for (t in e)
                    return !1;
                return !0
            },
            type: function(e) {
                return null == e ? e + "" : "object" == typeof e || "function" == typeof e ? de[pe.call(e)] || "object" : typeof e
            },
            globalEval: function(e) {
                a(e)
            },
            camelCase: function(e) {
                return e.replace(xe, "ms-").replace(we, Ce)
            },
            each: function(e, t) {
                var n, r = 0;
                if (u(e))
                    for (n = e.length; r < n && !1 !== t.call(e[r], r, e[r]); r++)
                        ;
                else
                    for (r in e)
                        if (!1 === t.call(e[r], r, e[r]))
                            break;
                return e
            },
            trim: function(e) {
                return null == e ? "" : (e + "").replace(be, "")
            },
            makeArray: function(e, t) {
                var n = t || [];
                return null != e && (u(Object(e)) ? ge.merge(n, "string" == typeof e ? [e] : e) : ce.call(n, e)),
                n
            },
            inArray: function(e, t, n) {
                return null == t ? -1 : fe.call(t, e, n)
            },
            merge: function(e, t) {
                for (var n = +t.length, r = 0, o = e.length; r < n; r++)
                    e[o++] = t[r];
                return e.length = o,
                e
            },
            grep: function(e, t, n) {
                for (var r = [], o = 0, i = e.length, a = !n; o < i; o++)
                    !t(e[o], o) !== a && r.push(e[o]);
                return r
            },
            map: function(e, t, n) {
                var r, o, i = 0, a = [];
                if (u(e))
                    for (r = e.length; i < r; i++)
                        null != (o = t(e[i], i, n)) && a.push(o);
                else
                    for (i in e)
                        null != (o = t(e[i], i, n)) && a.push(o);
                return se.apply([], a)
            },
            guid: 1,
            proxy: function(e, t) {
                var n, r, o;
                if ("string" == typeof t && (n = e[t],
                t = e,
                e = n),
                ge.isFunction(e))
                    return r = le.call(arguments, 2),
                    o = function() {
                        return e.apply(t || this, r.concat(le.call(arguments)))
                    }
                    ,
                    o.guid = e.guid = e.guid || ge.guid++,
                    o
            },
            now: Date.now,
            support: ve
        }),
        "function" == typeof Symbol && (ge.fn[Symbol.iterator] = ie[Symbol.iterator]),
        ge.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "), function(e, t) {
            de["[object " + t + "]"] = t.toLowerCase()
        });
        var Ee = function(e) {
            function t(e, t, n, r) {
                var o, i, a, u, l, c, d, p = t && t.ownerDocument, h = t ? t.nodeType : 9;
                if (n = n || [],
                "string" != typeof e || !e || 1 !== h && 9 !== h && 11 !== h)
                    return n;
                if (!r && ((t ? t.ownerDocument || t : N) !== I && M(t),
                t = t || I,
                T)) {
                    if (11 !== h && (l = ye.exec(e)))
                        if (o = l[1]) {
                            if (9 === h) {
                                if (!(a = t.getElementById(o)))
                                    return n;
                                if (a.id === o)
                                    return n.push(a),
                                    n
                            } else if (p && (a = p.getElementById(o)) && R(t, a) && a.id === o)
                                return n.push(a),
                                n
                        } else {
                            if (l[2])
                                return Y.apply(n, t.getElementsByTagName(e)),
                                n;
                            if ((o = l[3]) && x.getElementsByClassName && t.getElementsByClassName)
                                return Y.apply(n, t.getElementsByClassName(o)),
                                n
                        }
                    if (x.qsa && !q[e + " "] && (!B || !B.test(e))) {
                        if (1 !== h)
                            p = t,
                            d = e;
                        else if ("object" !== t.nodeName.toLowerCase()) {
                            for ((u = t.getAttribute("id")) ? u = u.replace(be, xe) : t.setAttribute("id", u = F),
                            c = k(e),
                            i = c.length; i--; )
                                c[i] = "#" + u + " " + f(c[i]);
                            d = c.join(","),
                            p = me.test(e) && s(t.parentNode) || t
                        }
                        if (d)
                            try {
                                return Y.apply(n, p.querySelectorAll(d)),
                                n
                            } catch (e) {} finally {
                                u === F && t.removeAttribute("id")
                            }
                    }
                }
                return A(e.replace(ie, "$1"), t, n, r)
            }
            function n() {
                function e(n, r) {
                    return t.push(n + " ") > w.cacheLength && delete e[t.shift()],
                    e[n + " "] = r
                }
                var t = [];
                return e
            }
            function r(e) {
                return e[F] = !0,
                e
            }
            function o(e) {
                var t = I.createElement("fieldset");
                try {
                    return !!e(t)
                } catch (e) {
                    return !1
                } finally {
                    t.parentNode && t.parentNode.removeChild(t),
                    t = null
                }
            }
            function i(e, t) {
                for (var n = e.split("|"), r = n.length; r--; )
                    w.attrHandle[n[r]] = t
            }
            function a(e, t) {
                var n = t && e
                  , r = n && 1 === e.nodeType && 1 === t.nodeType && e.sourceIndex - t.sourceIndex;
                if (r)
                    return r;
                if (n)
                    for (; n = n.nextSibling; )
                        if (n === t)
                            return -1;
                return e ? 1 : -1
            }
            function u(e) {
                return function(t) {
                    return "form"in t ? t.parentNode && !1 === t.disabled ? "label"in t ? "label"in t.parentNode ? t.parentNode.disabled === e : t.disabled === e : t.isDisabled === e || t.isDisabled !== !e && Ce(t) === e : t.disabled === e : "label"in t && t.disabled === e
                }
            }
            function l(e) {
                return r(function(t) {
                    return t = +t,
                    r(function(n, r) {
                        for (var o, i = e([], n.length, t), a = i.length; a--; )
                            n[o = i[a]] && (n[o] = !(r[o] = n[o]))
                    })
                })
            }
            function s(e) {
                return e && void 0 !== e.getElementsByTagName && e
            }
            function c() {}
            function f(e) {
                for (var t = 0, n = e.length, r = ""; t < n; t++)
                    r += e[t].value;
                return r
            }
            function d(e, t, n) {
                var r = t.dir
                  , o = t.next
                  , i = o || r
                  , a = n && "parentNode" === i
                  , u = z++;
                return t.first ? function(t, n, o) {
                    for (; t = t[r]; )
                        if (1 === t.nodeType || a)
                            return e(t, n, o);
                    return !1
                }
                : function(t, n, l) {
                    var s, c, f, d = [U, u];
                    if (l) {
                        for (; t = t[r]; )
                            if ((1 === t.nodeType || a) && e(t, n, l))
                                return !0
                    } else
                        for (; t = t[r]; )
                            if (1 === t.nodeType || a)
                                if (f = t[F] || (t[F] = {}),
                                c = f[t.uniqueID] || (f[t.uniqueID] = {}),
                                o && o === t.nodeName.toLowerCase())
                                    t = t[r] || t;
                                else {
                                    if ((s = c[i]) && s[0] === U && s[1] === u)
                                        return d[2] = s[2];
                                    if (c[i] = d,
                                    d[2] = e(t, n, l))
                                        return !0
                                }
                    return !1
                }
            }
            function p(e) {
                return e.length > 1 ? function(t, n, r) {
                    for (var o = e.length; o--; )
                        if (!e[o](t, n, r))
                            return !1;
                    return !0
                }
                : e[0]
            }
            function h(e, n, r) {
                for (var o = 0, i = n.length; o < i; o++)
                    t(e, n[o], r);
                return r
            }
            function y(e, t, n, r, o) {
                for (var i, a = [], u = 0, l = e.length, s = null != t; u < l; u++)
                    (i = e[u]) && (n && !n(i, r, o) || (a.push(i),
                    s && t.push(u)));
                return a
            }
            function m(e, t, n, o, i, a) {
                return o && !o[F] && (o = m(o)),
                i && !i[F] && (i = m(i, a)),
                r(function(r, a, u, l) {
                    var s, c, f, d = [], p = [], m = a.length, v = r || h(t || "*", u.nodeType ? [u] : u, []), g = !e || !r && t ? v : y(v, d, e, u, l), b = n ? i || (r ? e : m || o) ? [] : a : g;
                    if (n && n(g, b, u, l),
                    o)
                        for (s = y(b, p),
                        o(s, [], u, l),
                        c = s.length; c--; )
                            (f = s[c]) && (b[p[c]] = !(g[p[c]] = f));
                    if (r) {
                        if (i || e) {
                            if (i) {
                                for (s = [],
                                c = b.length; c--; )
                                    (f = b[c]) && s.push(g[c] = f);
                                i(null, b = [], s, l)
                            }
                            for (c = b.length; c--; )
                                (f = b[c]) && (s = i ? Z(r, f) : d[c]) > -1 && (r[s] = !(a[s] = f))
                        }
                    } else
                        b = y(b === a ? b.splice(m, b.length) : b),
                        i ? i(null, a, b, l) : Y.apply(a, b)
                })
            }
            function v(e) {
                for (var t, n, r, o = e.length, i = w.relative[e[0].type], a = i || w.relative[" "], u = i ? 1 : 0, l = d(function(e) {
                    return e === t
                }, a, !0), s = d(function(e) {
                    return Z(t, e) > -1
                }, a, !0), c = [function(e, n, r) {
                    var o = !i && (r || n !== S) || ((t = n).nodeType ? l(e, n, r) : s(e, n, r));
                    return t = null,
                    o
                }
                ]; u < o; u++)
                    if (n = w.relative[e[u].type])
                        c = [d(p(c), n)];
                    else {
                        if (n = w.filter[e[u].type].apply(null, e[u].matches),
                        n[F]) {
                            for (r = ++u; r < o && !w.relative[e[r].type]; r++)
                                ;
                            return m(u > 1 && p(c), u > 1 && f(e.slice(0, u - 1).concat({
                                value: " " === e[u - 2].type ? "*" : ""
                            })).replace(ie, "$1"), n, u < r && v(e.slice(u, r)), r < o && v(e = e.slice(r)), r < o && f(e))
                        }
                        c.push(n)
                    }
                return p(c)
            }
            function g(e, n) {
                var o = n.length > 0
                  , i = e.length > 0
                  , a = function(r, a, u, l, s) {
                    var c, f, d, p = 0, h = "0", m = r && [], v = [], g = S, b = r || i && w.find.TAG("*", s), x = U += null == g ? 1 : Math.random() || .1, C = b.length;
                    for (s && (S = a === I || a || s); h !== C && null != (c = b[h]); h++) {
                        if (i && c) {
                            for (f = 0,
                            a || c.ownerDocument === I || (M(c),
                            u = !T); d = e[f++]; )
                                if (d(c, a || I, u)) {
                                    l.push(c);
                                    break
                                }
                            s && (U = x)
                        }
                        o && ((c = !d && c) && p--,
                        r && m.push(c))
                    }
                    if (p += h,
                    o && h !== p) {
                        for (f = 0; d = n[f++]; )
                            d(m, v, a, u);
                        if (r) {
                            if (p > 0)
                                for (; h--; )
                                    m[h] || v[h] || (v[h] = Q.call(l));
                            v = y(v)
                        }
                        Y.apply(l, v),
                        s && !r && v.length > 0 && p + n.length > 1 && t.uniqueSort(l)
                    }
                    return s && (U = x,
                    S = g),
                    m
                };
                return o ? r(a) : a
            }
            var b, x, w, C, E, k, _, A, S, O, P, M, I, D, T, B, j, L, R, F = "sizzle" + 1 * new Date, N = e.document, U = 0, z = 0, H = n(), W = n(), q = n(), G = function(e, t) {
                return e === t && (P = !0),
                0
            }, V = {}.hasOwnProperty, K = [], Q = K.pop, J = K.push, Y = K.push, X = K.slice, Z = function(e, t) {
                for (var n = 0, r = e.length; n < r; n++)
                    if (e[n] === t)
                        return n;
                return -1
            }, $ = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped", ee = "[\\x20\\t\\r\\n\\f]", te = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+", ne = "\\[" + ee + "*(" + te + ")(?:" + ee + "*([*^$|!~]?=)" + ee + "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + te + "))|)" + ee + "*\\]", re = ":(" + te + ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" + ne + ")*)|.*)\\)|)", oe = new RegExp(ee + "+","g"), ie = new RegExp("^" + ee + "+|((?:^|[^\\\\])(?:\\\\.)*)" + ee + "+$","g"), ae = new RegExp("^" + ee + "*," + ee + "*"), ue = new RegExp("^" + ee + "*([>+~]|" + ee + ")" + ee + "*"), le = new RegExp("=" + ee + "*([^\\]'\"]*?)" + ee + "*\\]","g"), se = new RegExp(re), ce = new RegExp("^" + te + "$"), fe = {
                ID: new RegExp("^#(" + te + ")"),
                CLASS: new RegExp("^\\.(" + te + ")"),
                TAG: new RegExp("^(" + te + "|[*])"),
                ATTR: new RegExp("^" + ne),
                PSEUDO: new RegExp("^" + re),
                CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + ee + "*(even|odd|(([+-]|)(\\d*)n|)" + ee + "*(?:([+-]|)" + ee + "*(\\d+)|))" + ee + "*\\)|)","i"),
                bool: new RegExp("^(?:" + $ + ")$","i"),
                needsContext: new RegExp("^" + ee + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + ee + "*((?:-\\d)?\\d*)" + ee + "*\\)|)(?=[^-]|$)","i")
            }, de = /^(?:input|select|textarea|button)$/i, pe = /^h\d$/i, he = /^[^{]+\{\s*\[native \w/, ye = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, me = /[+~]/, ve = new RegExp("\\\\([\\da-f]{1,6}" + ee + "?|(" + ee + ")|.)","ig"), ge = function(e, t, n) {
                var r = "0x" + t - 65536;
                return r !== r || n ? t : r < 0 ? String.fromCharCode(r + 65536) : String.fromCharCode(r >> 10 | 55296, 1023 & r | 56320)
            }, be = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g, xe = function(e, t) {
                return t ? "\0" === e ? "�" : e.slice(0, -1) + "\\" + e.charCodeAt(e.length - 1).toString(16) + " " : "\\" + e
            }, we = function() {
                M()
            }, Ce = d(function(e) {
                return !0 === e.disabled && ("form"in e || "label"in e)
            }, {
                dir: "parentNode",
                next: "legend"
            });
            try {
                Y.apply(K = X.call(N.childNodes), N.childNodes)
            } catch (e) {
                Y = {
                    apply: K.length ? function(e, t) {
                        J.apply(e, X.call(t))
                    }
                    : function(e, t) {
                        for (var n = e.length, r = 0; e[n++] = t[r++]; )
                            ;
                        e.length = n - 1
                    }
                }
            }
            x = t.support = {},
            E = t.isXML = function(e) {
                var t = e && (e.ownerDocument || e).documentElement;
                return !!t && "HTML" !== t.nodeName
            }
            ,
            M = t.setDocument = function(e) {
                var t, n, r = e ? e.ownerDocument || e : N;
                return r !== I && 9 === r.nodeType && r.documentElement ? (I = r,
                D = I.documentElement,
                T = !E(I),
                N !== I && (n = I.defaultView) && n.top !== n && (n.addEventListener ? n.addEventListener("unload", we, !1) : n.attachEvent && n.attachEvent("onunload", we)),
                x.attributes = o(function(e) {
                    return e.className = "i",
                    !e.getAttribute("className")
                }),
                x.getElementsByTagName = o(function(e) {
                    return e.appendChild(I.createComment("")),
                    !e.getElementsByTagName("*").length
                }),
                x.getElementsByClassName = he.test(I.getElementsByClassName),
                x.getById = o(function(e) {
                    return D.appendChild(e).id = F,
                    !I.getElementsByName || !I.getElementsByName(F).length
                }),
                x.getById ? (w.filter.ID = function(e) {
                    var t = e.replace(ve, ge);
                    return function(e) {
                        return e.getAttribute("id") === t
                    }
                }
                ,
                w.find.ID = function(e, t) {
                    if (void 0 !== t.getElementById && T) {
                        var n = t.getElementById(e);
                        return n ? [n] : []
                    }
                }
                ) : (w.filter.ID = function(e) {
                    var t = e.replace(ve, ge);
                    return function(e) {
                        var n = void 0 !== e.getAttributeNode && e.getAttributeNode("id");
                        return n && n.value === t
                    }
                }
                ,
                w.find.ID = function(e, t) {
                    if (void 0 !== t.getElementById && T) {
                        var n, r, o, i = t.getElementById(e);
                        if (i) {
                            if ((n = i.getAttributeNode("id")) && n.value === e)
                                return [i];
                            for (o = t.getElementsByName(e),
                            r = 0; i = o[r++]; )
                                if ((n = i.getAttributeNode("id")) && n.value === e)
                                    return [i]
                        }
                        return []
                    }
                }
                ),
                w.find.TAG = x.getElementsByTagName ? function(e, t) {
                    return void 0 !== t.getElementsByTagName ? t.getElementsByTagName(e) : x.qsa ? t.querySelectorAll(e) : void 0
                }
                : function(e, t) {
                    var n, r = [], o = 0, i = t.getElementsByTagName(e);
                    if ("*" === e) {
                        for (; n = i[o++]; )
                            1 === n.nodeType && r.push(n);
                        return r
                    }
                    return i
                }
                ,
                w.find.CLASS = x.getElementsByClassName && function(e, t) {
                    if (void 0 !== t.getElementsByClassName && T)
                        return t.getElementsByClassName(e)
                }
                ,
                j = [],
                B = [],
                (x.qsa = he.test(I.querySelectorAll)) && (o(function(e) {
                    D.appendChild(e).innerHTML = "<a id='" + F + "'></a><select id='" + F + "-\r\\' msallowcapture=''><option selected=''></option></select>",
                    e.querySelectorAll("[msallowcapture^='']").length && B.push("[*^$]=" + ee + "*(?:''|\"\")"),
                    e.querySelectorAll("[selected]").length || B.push("\\[" + ee + "*(?:value|" + $ + ")"),
                    e.querySelectorAll("[id~=" + F + "-]").length || B.push("~="),
                    e.querySelectorAll(":checked").length || B.push(":checked"),
                    e.querySelectorAll("a#" + F + "+*").length || B.push(".#.+[+~]")
                }),
                o(function(e) {
                    e.innerHTML = "<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";
                    var t = I.createElement("input");
                    t.setAttribute("type", "hidden"),
                    e.appendChild(t).setAttribute("name", "D"),
                    e.querySelectorAll("[name=d]").length && B.push("name" + ee + "*[*^$|!~]?="),
                    2 !== e.querySelectorAll(":enabled").length && B.push(":enabled", ":disabled"),
                    D.appendChild(e).disabled = !0,
                    2 !== e.querySelectorAll(":disabled").length && B.push(":enabled", ":disabled"),
                    e.querySelectorAll("*,:x"),
                    B.push(",.*:")
                })),
                (x.matchesSelector = he.test(L = D.matches || D.webkitMatchesSelector || D.mozMatchesSelector || D.oMatchesSelector || D.msMatchesSelector)) && o(function(e) {
                    x.disconnectedMatch = L.call(e, "*"),
                    L.call(e, "[s!='']:x"),
                    j.push("!=", re)
                }),
                B = B.length && new RegExp(B.join("|")),
                j = j.length && new RegExp(j.join("|")),
                t = he.test(D.compareDocumentPosition),
                R = t || he.test(D.contains) ? function(e, t) {
                    var n = 9 === e.nodeType ? e.documentElement : e
                      , r = t && t.parentNode;
                    return e === r || !(!r || 1 !== r.nodeType || !(n.contains ? n.contains(r) : e.compareDocumentPosition && 16 & e.compareDocumentPosition(r)))
                }
                : function(e, t) {
                    if (t)
                        for (; t = t.parentNode; )
                            if (t === e)
                                return !0;
                    return !1
                }
                ,
                G = t ? function(e, t) {
                    if (e === t)
                        return P = !0,
                        0;
                    var n = !e.compareDocumentPosition - !t.compareDocumentPosition;
                    return n || (n = (e.ownerDocument || e) === (t.ownerDocument || t) ? e.compareDocumentPosition(t) : 1,
                    1 & n || !x.sortDetached && t.compareDocumentPosition(e) === n ? e === I || e.ownerDocument === N && R(N, e) ? -1 : t === I || t.ownerDocument === N && R(N, t) ? 1 : O ? Z(O, e) - Z(O, t) : 0 : 4 & n ? -1 : 1)
                }
                : function(e, t) {
                    if (e === t)
                        return P = !0,
                        0;
                    var n, r = 0, o = e.parentNode, i = t.parentNode, u = [e], l = [t];
                    if (!o || !i)
                        return e === I ? -1 : t === I ? 1 : o ? -1 : i ? 1 : O ? Z(O, e) - Z(O, t) : 0;
                    if (o === i)
                        return a(e, t);
                    for (n = e; n = n.parentNode; )
                        u.unshift(n);
                    for (n = t; n = n.parentNode; )
                        l.unshift(n);
                    for (; u[r] === l[r]; )
                        r++;
                    return r ? a(u[r], l[r]) : u[r] === N ? -1 : l[r] === N ? 1 : 0
                }
                ,
                I) : I
            }
            ,
            t.matches = function(e, n) {
                return t(e, null, null, n)
            }
            ,
            t.matchesSelector = function(e, n) {
                if ((e.ownerDocument || e) !== I && M(e),
                n = n.replace(le, "='$1']"),
                x.matchesSelector && T && !q[n + " "] && (!j || !j.test(n)) && (!B || !B.test(n)))
                    try {
                        var r = L.call(e, n);
                        if (r || x.disconnectedMatch || e.document && 11 !== e.document.nodeType)
                            return r
                    } catch (e) {}
                return t(n, I, null, [e]).length > 0
            }
            ,
            t.contains = function(e, t) {
                return (e.ownerDocument || e) !== I && M(e),
                R(e, t)
            }
            ,
            t.attr = function(e, t) {
                (e.ownerDocument || e) !== I && M(e);
                var n = w.attrHandle[t.toLowerCase()]
                  , r = n && V.call(w.attrHandle, t.toLowerCase()) ? n(e, t, !T) : void 0;
                return void 0 !== r ? r : x.attributes || !T ? e.getAttribute(t) : (r = e.getAttributeNode(t)) && r.specified ? r.value : null
            }
            ,
            t.escape = function(e) {
                return (e + "").replace(be, xe)
            }
            ,
            t.error = function(e) {
                throw new Error("Syntax error, unrecognized expression: " + e)
            }
            ,
            t.uniqueSort = function(e) {
                var t, n = [], r = 0, o = 0;
                if (P = !x.detectDuplicates,
                O = !x.sortStable && e.slice(0),
                e.sort(G),
                P) {
                    for (; t = e[o++]; )
                        t === e[o] && (r = n.push(o));
                    for (; r--; )
                        e.splice(n[r], 1)
                }
                return O = null,
                e
            }
            ,
            C = t.getText = function(e) {
                var t, n = "", r = 0, o = e.nodeType;
                if (o) {
                    if (1 === o || 9 === o || 11 === o) {
                        if ("string" == typeof e.textContent)
                            return e.textContent;
                        for (e = e.firstChild; e; e = e.nextSibling)
                            n += C(e)
                    } else if (3 === o || 4 === o)
                        return e.nodeValue
                } else
                    for (; t = e[r++]; )
                        n += C(t);
                return n
            }
            ,
            w = t.selectors = {
                cacheLength: 50,
                createPseudo: r,
                match: fe,
                attrHandle: {},
                find: {},
                relative: {
                    ">": {
                        dir: "parentNode",
                        first: !0
                    },
                    " ": {
                        dir: "parentNode"
                    },
                    "+": {
                        dir: "previousSibling",
                        first: !0
                    },
                    "~": {
                        dir: "previousSibling"
                    }
                },
                preFilter: {
                    ATTR: function(e) {
                        return e[1] = e[1].replace(ve, ge),
                        e[3] = (e[3] || e[4] || e[5] || "").replace(ve, ge),
                        "~=" === e[2] && (e[3] = " " + e[3] + " "),
                        e.slice(0, 4)
                    },
                    CHILD: function(e) {
                        return e[1] = e[1].toLowerCase(),
                        "nth" === e[1].slice(0, 3) ? (e[3] || t.error(e[0]),
                        e[4] = +(e[4] ? e[5] + (e[6] || 1) : 2 * ("even" === e[3] || "odd" === e[3])),
                        e[5] = +(e[7] + e[8] || "odd" === e[3])) : e[3] && t.error(e[0]),
                        e
                    },
                    PSEUDO: function(e) {
                        var t, n = !e[6] && e[2];
                        return fe.CHILD.test(e[0]) ? null : (e[3] ? e[2] = e[4] || e[5] || "" : n && se.test(n) && (t = k(n, !0)) && (t = n.indexOf(")", n.length - t) - n.length) && (e[0] = e[0].slice(0, t),
                        e[2] = n.slice(0, t)),
                        e.slice(0, 3))
                    }
                },
                filter: {
                    TAG: function(e) {
                        var t = e.replace(ve, ge).toLowerCase();
                        return "*" === e ? function() {
                            return !0
                        }
                        : function(e) {
                            return e.nodeName && e.nodeName.toLowerCase() === t
                        }
                    },
                    CLASS: function(e) {
                        var t = H[e + " "];
                        return t || (t = new RegExp("(^|" + ee + ")" + e + "(" + ee + "|$)")) && H(e, function(e) {
                            return t.test("string" == typeof e.className && e.className || void 0 !== e.getAttribute && e.getAttribute("class") || "")
                        })
                    },
                    ATTR: function(e, n, r) {
                        return function(o) {
                            var i = t.attr(o, e);
                            return null == i ? "!=" === n : !n || (i += "",
                            "=" === n ? i === r : "!=" === n ? i !== r : "^=" === n ? r && 0 === i.indexOf(r) : "*=" === n ? r && i.indexOf(r) > -1 : "$=" === n ? r && i.slice(-r.length) === r : "~=" === n ? (" " + i.replace(oe, " ") + " ").indexOf(r) > -1 : "|=" === n && (i === r || i.slice(0, r.length + 1) === r + "-"))
                        }
                    },
                    CHILD: function(e, t, n, r, o) {
                        var i = "nth" !== e.slice(0, 3)
                          , a = "last" !== e.slice(-4)
                          , u = "of-type" === t;
                        return 1 === r && 0 === o ? function(e) {
                            return !!e.parentNode
                        }
                        : function(t, n, l) {
                            var s, c, f, d, p, h, y = i !== a ? "nextSibling" : "previousSibling", m = t.parentNode, v = u && t.nodeName.toLowerCase(), g = !l && !u, b = !1;
                            if (m) {
                                if (i) {
                                    for (; y; ) {
                                        for (d = t; d = d[y]; )
                                            if (u ? d.nodeName.toLowerCase() === v : 1 === d.nodeType)
                                                return !1;
                                        h = y = "only" === e && !h && "nextSibling"
                                    }
                                    return !0
                                }
                                if (h = [a ? m.firstChild : m.lastChild],
                                a && g) {
                                    for (d = m,
                                    f = d[F] || (d[F] = {}),
                                    c = f[d.uniqueID] || (f[d.uniqueID] = {}),
                                    s = c[e] || [],
                                    p = s[0] === U && s[1],
                                    b = p && s[2],
                                    d = p && m.childNodes[p]; d = ++p && d && d[y] || (b = p = 0) || h.pop(); )
                                        if (1 === d.nodeType && ++b && d === t) {
                                            c[e] = [U, p, b];
                                            break
                                        }
                                } else if (g && (d = t,
                                f = d[F] || (d[F] = {}),
                                c = f[d.uniqueID] || (f[d.uniqueID] = {}),
                                s = c[e] || [],
                                p = s[0] === U && s[1],
                                b = p),
                                !1 === b)
                                    for (; (d = ++p && d && d[y] || (b = p = 0) || h.pop()) && ((u ? d.nodeName.toLowerCase() !== v : 1 !== d.nodeType) || !++b || (g && (f = d[F] || (d[F] = {}),
                                    c = f[d.uniqueID] || (f[d.uniqueID] = {}),
                                    c[e] = [U, b]),
                                    d !== t)); )
                                        ;
                                return (b -= o) === r || b % r == 0 && b / r >= 0
                            }
                        }
                    },
                    PSEUDO: function(e, n) {
                        var o, i = w.pseudos[e] || w.setFilters[e.toLowerCase()] || t.error("unsupported pseudo: " + e);
                        return i[F] ? i(n) : i.length > 1 ? (o = [e, e, "", n],
                        w.setFilters.hasOwnProperty(e.toLowerCase()) ? r(function(e, t) {
                            for (var r, o = i(e, n), a = o.length; a--; )
                                r = Z(e, o[a]),
                                e[r] = !(t[r] = o[a])
                        }) : function(e) {
                            return i(e, 0, o)
                        }
                        ) : i
                    }
                },
                pseudos: {
                    not: r(function(e) {
                        var t = []
                          , n = []
                          , o = _(e.replace(ie, "$1"));
                        return o[F] ? r(function(e, t, n, r) {
                            for (var i, a = o(e, null, r, []), u = e.length; u--; )
                                (i = a[u]) && (e[u] = !(t[u] = i))
                        }) : function(e, r, i) {
                            return t[0] = e,
                            o(t, null, i, n),
                            t[0] = null,
                            !n.pop()
                        }
                    }),
                    has: r(function(e) {
                        return function(n) {
                            return t(e, n).length > 0
                        }
                    }),
                    contains: r(function(e) {
                        return e = e.replace(ve, ge),
                        function(t) {
                            return (t.textContent || t.innerText || C(t)).indexOf(e) > -1
                        }
                    }),
                    lang: r(function(e) {
                        return ce.test(e || "") || t.error("unsupported lang: " + e),
                        e = e.replace(ve, ge).toLowerCase(),
                        function(t) {
                            var n;
                            do {
                                if (n = T ? t.lang : t.getAttribute("xml:lang") || t.getAttribute("lang"))
                                    return (n = n.toLowerCase()) === e || 0 === n.indexOf(e + "-")
                            } while ((t = t.parentNode) && 1 === t.nodeType);return !1
                        }
                    }),
                    target: function(t) {
                        var n = e.location && e.location.hash;
                        return n && n.slice(1) === t.id
                    },
                    root: function(e) {
                        return e === D
                    },
                    focus: function(e) {
                        return e === I.activeElement && (!I.hasFocus || I.hasFocus()) && !!(e.type || e.href || ~e.tabIndex)
                    },
                    enabled: u(!1),
                    disabled: u(!0),
                    checked: function(e) {
                        var t = e.nodeName.toLowerCase();
                        return "input" === t && !!e.checked || "option" === t && !!e.selected
                    },
                    selected: function(e) {
                        return !0 === e.selected
                    },
                    empty: function(e) {
                        for (e = e.firstChild; e; e = e.nextSibling)
                            if (e.nodeType < 6)
                                return !1;
                        return !0
                    },
                    parent: function(e) {
                        return !w.pseudos.empty(e)
                    },
                    header: function(e) {
                        return pe.test(e.nodeName)
                    },
                    input: function(e) {
                        return de.test(e.nodeName)
                    },
                    button: function(e) {
                        var t = e.nodeName.toLowerCase();
                        return "input" === t && "button" === e.type || "button" === t
                    },
                    text: function(e) {
                        var t;
                        return "input" === e.nodeName.toLowerCase() && "text" === e.type && (null == (t = e.getAttribute("type")) || "text" === t.toLowerCase())
                    },
                    first: l(function() {
                        return [0]
                    }),
                    last: l(function(e, t) {
                        return [t - 1]
                    }),
                    eq: l(function(e, t, n) {
                        return [n < 0 ? n + t : n]
                    }),
                    even: l(function(e, t) {
                        for (var n = 0; n < t; n += 2)
                            e.push(n);
                        return e
                    }),
                    odd: l(function(e, t) {
                        for (var n = 1; n < t; n += 2)
                            e.push(n);
                        return e
                    }),
                    lt: l(function(e, t, n) {
                        for (var r = n < 0 ? n + t : n; --r >= 0; )
                            e.push(r);
                        return e
                    }),
                    gt: l(function(e, t, n) {
                        for (var r = n < 0 ? n + t : n; ++r < t; )
                            e.push(r);
                        return e
                    })
                }
            },
            w.pseudos.nth = w.pseudos.eq;
            for (b in {
                radio: !0,
                checkbox: !0,
                file: !0,
                password: !0,
                image: !0
            })
                w.pseudos[b] = function(e) {
                    return function(t) {
                        return "input" === t.nodeName.toLowerCase() && t.type === e
                    }
                }(b);
            for (b in {
                submit: !0,
                reset: !0
            })
                w.pseudos[b] = function(e) {
                    return function(t) {
                        var n = t.nodeName.toLowerCase();
                        return ("input" === n || "button" === n) && t.type === e
                    }
                }(b);
            return c.prototype = w.filters = w.pseudos,
            w.setFilters = new c,
            k = t.tokenize = function(e, n) {
                var r, o, i, a, u, l, s, c = W[e + " "];
                if (c)
                    return n ? 0 : c.slice(0);
                for (u = e,
                l = [],
                s = w.preFilter; u; ) {
                    r && !(o = ae.exec(u)) || (o && (u = u.slice(o[0].length) || u),
                    l.push(i = [])),
                    r = !1,
                    (o = ue.exec(u)) && (r = o.shift(),
                    i.push({
                        value: r,
                        type: o[0].replace(ie, " ")
                    }),
                    u = u.slice(r.length));
                    for (a in w.filter)
                        !(o = fe[a].exec(u)) || s[a] && !(o = s[a](o)) || (r = o.shift(),
                        i.push({
                            value: r,
                            type: a,
                            matches: o
                        }),
                        u = u.slice(r.length));
                    if (!r)
                        break
                }
                return n ? u.length : u ? t.error(e) : W(e, l).slice(0)
            }
            ,
            _ = t.compile = function(e, t) {
                var n, r = [], o = [], i = q[e + " "];
                if (!i) {
                    for (t || (t = k(e)),
                    n = t.length; n--; )
                        i = v(t[n]),
                        i[F] ? r.push(i) : o.push(i);
                    i = q(e, g(o, r)),
                    i.selector = e
                }
                return i
            }
            ,
            A = t.select = function(e, t, n, r) {
                var o, i, a, u, l, c = "function" == typeof e && e, d = !r && k(e = c.selector || e);
                if (n = n || [],
                1 === d.length) {
                    if (i = d[0] = d[0].slice(0),
                    i.length > 2 && "ID" === (a = i[0]).type && 9 === t.nodeType && T && w.relative[i[1].type]) {
                        if (!(t = (w.find.ID(a.matches[0].replace(ve, ge), t) || [])[0]))
                            return n;
                        c && (t = t.parentNode),
                        e = e.slice(i.shift().value.length)
                    }
                    for (o = fe.needsContext.test(e) ? 0 : i.length; o-- && (a = i[o],
                    !w.relative[u = a.type]); )
                        if ((l = w.find[u]) && (r = l(a.matches[0].replace(ve, ge), me.test(i[0].type) && s(t.parentNode) || t))) {
                            if (i.splice(o, 1),
                            !(e = r.length && f(i)))
                                return Y.apply(n, r),
                                n;
                            break
                        }
                }
                return (c || _(e, d))(r, t, !T, n, !t || me.test(e) && s(t.parentNode) || t),
                n
            }
            ,
            x.sortStable = F.split("").sort(G).join("") === F,
            x.detectDuplicates = !!P,
            M(),
            x.sortDetached = o(function(e) {
                return 1 & e.compareDocumentPosition(I.createElement("fieldset"))
            }),
            o(function(e) {
                return e.innerHTML = "<a href='#'></a>",
                "#" === e.firstChild.getAttribute("href")
            }) || i("type|href|height|width", function(e, t, n) {
                if (!n)
                    return e.getAttribute(t, "type" === t.toLowerCase() ? 1 : 2)
            }),
            x.attributes && o(function(e) {
                return e.innerHTML = "<input/>",
                e.firstChild.setAttribute("value", ""),
                "" === e.firstChild.getAttribute("value")
            }) || i("value", function(e, t, n) {
                if (!n && "input" === e.nodeName.toLowerCase())
                    return e.defaultValue
            }),
            o(function(e) {
                return null == e.getAttribute("disabled")
            }) || i($, function(e, t, n) {
                var r;
                if (!n)
                    return !0 === e[t] ? t.toLowerCase() : (r = e.getAttributeNode(t)) && r.specified ? r.value : null
            }),
            t
        }(n);
        ge.find = Ee,
        ge.expr = Ee.selectors,
        ge.expr[":"] = ge.expr.pseudos,
        ge.uniqueSort = ge.unique = Ee.uniqueSort,
        ge.text = Ee.getText,
        ge.isXMLDoc = Ee.isXML,
        ge.contains = Ee.contains,
        ge.escapeSelector = Ee.escape;
        var ke = function(e, t, n) {
            for (var r = [], o = void 0 !== n; (e = e[t]) && 9 !== e.nodeType; )
                if (1 === e.nodeType) {
                    if (o && ge(e).is(n))
                        break;
                    r.push(e)
                }
            return r
        }
          , _e = function(e, t) {
            for (var n = []; e; e = e.nextSibling)
                1 === e.nodeType && e !== t && n.push(e);
            return n
        }
          , Ae = ge.expr.match.needsContext
          , Se = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i
          , Oe = /^.[^:#\[\.,]*$/;
        ge.filter = function(e, t, n) {
            var r = t[0];
            return n && (e = ":not(" + e + ")"),
            1 === t.length && 1 === r.nodeType ? ge.find.matchesSelector(r, e) ? [r] : [] : ge.find.matches(e, ge.grep(t, function(e) {
                return 1 === e.nodeType
            }))
        }
        ,
        ge.fn.extend({
            find: function(e) {
                var t, n, r = this.length, o = this;
                if ("string" != typeof e)
                    return this.pushStack(ge(e).filter(function() {
                        for (t = 0; t < r; t++)
                            if (ge.contains(o[t], this))
                                return !0
                    }));
                for (n = this.pushStack([]),
                t = 0; t < r; t++)
                    ge.find(e, o[t], n);
                return r > 1 ? ge.uniqueSort(n) : n
            },
            filter: function(e) {
                return this.pushStack(s(this, e || [], !1))
            },
            not: function(e) {
                return this.pushStack(s(this, e || [], !0))
            },
            is: function(e) {
                return !!s(this, "string" == typeof e && Ae.test(e) ? ge(e) : e || [], !1).length
            }
        });
        var Pe, Me = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;
        (ge.fn.init = function(e, t, n) {
            var r, o;
            if (!e)
                return this;
            if (n = n || Pe,
            "string" == typeof e) {
                if (!(r = "<" === e[0] && ">" === e[e.length - 1] && e.length >= 3 ? [null, e, null] : Me.exec(e)) || !r[1] && t)
                    return !t || t.jquery ? (t || n).find(e) : this.constructor(t).find(e);
                if (r[1]) {
                    if (t = t instanceof ge ? t[0] : t,
                    ge.merge(this, ge.parseHTML(r[1], t && t.nodeType ? t.ownerDocument || t : ae, !0)),
                    Se.test(r[1]) && ge.isPlainObject(t))
                        for (r in t)
                            ge.isFunction(this[r]) ? this[r](t[r]) : this.attr(r, t[r]);
                    return this
                }
                return o = ae.getElementById(r[2]),
                o && (this[0] = o,
                this.length = 1),
                this
            }
            return e.nodeType ? (this[0] = e,
            this.length = 1,
            this) : ge.isFunction(e) ? void 0 !== n.ready ? n.ready(e) : e(ge) : ge.makeArray(e, this)
        }
        ).prototype = ge.fn,
        Pe = ge(ae);
        var Ie = /^(?:parents|prev(?:Until|All))/
          , De = {
            children: !0,
            contents: !0,
            next: !0,
            prev: !0
        };
        ge.fn.extend({
            has: function(e) {
                var t = ge(e, this)
                  , n = t.length;
                return this.filter(function() {
                    for (var e = 0; e < n; e++)
                        if (ge.contains(this, t[e]))
                            return !0
                })
            },
            closest: function(e, t) {
                var n, r = 0, o = this.length, i = [], a = "string" != typeof e && ge(e);
                if (!Ae.test(e))
                    for (; r < o; r++)
                        for (n = this[r]; n && n !== t; n = n.parentNode)
                            if (n.nodeType < 11 && (a ? a.index(n) > -1 : 1 === n.nodeType && ge.find.matchesSelector(n, e))) {
                                i.push(n);
                                break
                            }
                return this.pushStack(i.length > 1 ? ge.uniqueSort(i) : i)
            },
            index: function(e) {
                return e ? "string" == typeof e ? fe.call(ge(e), this[0]) : fe.call(this, e.jquery ? e[0] : e) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1
            },
            add: function(e, t) {
                return this.pushStack(ge.uniqueSort(ge.merge(this.get(), ge(e, t))))
            },
            addBack: function(e) {
                return this.add(null == e ? this.prevObject : this.prevObject.filter(e))
            }
        }),
        ge.each({
            parent: function(e) {
                var t = e.parentNode;
                return t && 11 !== t.nodeType ? t : null
            },
            parents: function(e) {
                return ke(e, "parentNode")
            },
            parentsUntil: function(e, t, n) {
                return ke(e, "parentNode", n)
            },
            next: function(e) {
                return c(e, "nextSibling")
            },
            prev: function(e) {
                return c(e, "previousSibling")
            },
            nextAll: function(e) {
                return ke(e, "nextSibling")
            },
            prevAll: function(e) {
                return ke(e, "previousSibling")
            },
            nextUntil: function(e, t, n) {
                return ke(e, "nextSibling", n)
            },
            prevUntil: function(e, t, n) {
                return ke(e, "previousSibling", n)
            },
            siblings: function(e) {
                return _e((e.parentNode || {}).firstChild, e)
            },
            children: function(e) {
                return _e(e.firstChild)
            },
            contents: function(e) {
                return l(e, "iframe") ? e.contentDocument : (l(e, "template") && (e = e.content || e),
                ge.merge([], e.childNodes))
            }
        }, function(e, t) {
            ge.fn[e] = function(n, r) {
                var o = ge.map(this, t, n);
                return "Until" !== e.slice(-5) && (r = n),
                r && "string" == typeof r && (o = ge.filter(r, o)),
                this.length > 1 && (De[e] || ge.uniqueSort(o),
                Ie.test(e) && o.reverse()),
                this.pushStack(o)
            }
        });
        var Te = /[^\x20\t\r\n\f]+/g;
        ge.Callbacks = function(e) {
            e = "string" == typeof e ? f(e) : ge.extend({}, e);
            var t, n, r, o, i = [], a = [], u = -1, l = function() {
                for (o = o || e.once,
                r = t = !0; a.length; u = -1)
                    for (n = a.shift(); ++u < i.length; )
                        !1 === i[u].apply(n[0], n[1]) && e.stopOnFalse && (u = i.length,
                        n = !1);
                e.memory || (n = !1),
                t = !1,
                o && (i = n ? [] : "")
            }, s = {
                add: function() {
                    return i && (n && !t && (u = i.length - 1,
                    a.push(n)),
                    function t(n) {
                        ge.each(n, function(n, r) {
                            ge.isFunction(r) ? e.unique && s.has(r) || i.push(r) : r && r.length && "string" !== ge.type(r) && t(r)
                        })
                    }(arguments),
                    n && !t && l()),
                    this
                },
                remove: function() {
                    return ge.each(arguments, function(e, t) {
                        for (var n; (n = ge.inArray(t, i, n)) > -1; )
                            i.splice(n, 1),
                            n <= u && u--
                    }),
                    this
                },
                has: function(e) {
                    return e ? ge.inArray(e, i) > -1 : i.length > 0
                },
                empty: function() {
                    return i && (i = []),
                    this
                },
                disable: function() {
                    return o = a = [],
                    i = n = "",
                    this
                },
                disabled: function() {
                    return !i
                },
                lock: function() {
                    return o = a = [],
                    n || t || (i = n = ""),
                    this
                },
                locked: function() {
                    return !!o
                },
                fireWith: function(e, n) {
                    return o || (n = n || [],
                    n = [e, n.slice ? n.slice() : n],
                    a.push(n),
                    t || l()),
                    this
                },
                fire: function() {
                    return s.fireWith(this, arguments),
                    this
                },
                fired: function() {
                    return !!r
                }
            };
            return s
        }
        ,
        ge.extend({
            Deferred: function(e) {
                var t = [["notify", "progress", ge.Callbacks("memory"), ge.Callbacks("memory"), 2], ["resolve", "done", ge.Callbacks("once memory"), ge.Callbacks("once memory"), 0, "resolved"], ["reject", "fail", ge.Callbacks("once memory"), ge.Callbacks("once memory"), 1, "rejected"]]
                  , r = "pending"
                  , o = {
                    state: function() {
                        return r
                    },
                    always: function() {
                        return i.done(arguments).fail(arguments),
                        this
                    },
                    catch: function(e) {
                        return o.then(null, e)
                    },
                    pipe: function() {
                        var e = arguments;
                        return ge.Deferred(function(n) {
                            ge.each(t, function(t, r) {
                                var o = ge.isFunction(e[r[4]]) && e[r[4]];
                                i[r[1]](function() {
                                    var e = o && o.apply(this, arguments);
                                    e && ge.isFunction(e.promise) ? e.promise().progress(n.notify).done(n.resolve).fail(n.reject) : n[r[0] + "With"](this, o ? [e] : arguments)
                                })
                            }),
                            e = null
                        }).promise()
                    },
                    then: function(e, r, o) {
                        function i(e, t, r, o) {
                            return function() {
                                var u = this
                                  , l = arguments
                                  , s = function() {
                                    var n, s;
                                    if (!(e < a)) {
                                        if ((n = r.apply(u, l)) === t.promise())
                                            throw new TypeError("Thenable self-resolution");
                                        s = n && ("object" == typeof n || "function" == typeof n) && n.then,
                                        ge.isFunction(s) ? o ? s.call(n, i(a, t, d, o), i(a, t, p, o)) : (a++,
                                        s.call(n, i(a, t, d, o), i(a, t, p, o), i(a, t, d, t.notifyWith))) : (r !== d && (u = void 0,
                                        l = [n]),
                                        (o || t.resolveWith)(u, l))
                                    }
                                }
                                  , c = o ? s : function() {
                                    try {
                                        s()
                                    } catch (n) {
                                        ge.Deferred.exceptionHook && ge.Deferred.exceptionHook(n, c.stackTrace),
                                        e + 1 >= a && (r !== p && (u = void 0,
                                        l = [n]),
                                        t.rejectWith(u, l))
                                    }
                                }
                                ;
                                e ? c() : (ge.Deferred.getStackHook && (c.stackTrace = ge.Deferred.getStackHook()),
                                n.setTimeout(c))
                            }
                        }
                        var a = 0;
                        return ge.Deferred(function(n) {
                            t[0][3].add(i(0, n, ge.isFunction(o) ? o : d, n.notifyWith)),
                            t[1][3].add(i(0, n, ge.isFunction(e) ? e : d)),
                            t[2][3].add(i(0, n, ge.isFunction(r) ? r : p))
                        }).promise()
                    },
                    promise: function(e) {
                        return null != e ? ge.extend(e, o) : o
                    }
                }
                  , i = {};
                return ge.each(t, function(e, n) {
                    var a = n[2]
                      , u = n[5];
                    o[n[1]] = a.add,
                    u && a.add(function() {
                        r = u
                    }, t[3 - e][2].disable, t[0][2].lock),
                    a.add(n[3].fire),
                    i[n[0]] = function() {
                        return i[n[0] + "With"](this === i ? void 0 : this, arguments),
                        this
                    }
                    ,
                    i[n[0] + "With"] = a.fireWith
                }),
                o.promise(i),
                e && e.call(i, i),
                i
            },
            when: function(e) {
                var t = arguments.length
                  , n = t
                  , r = Array(n)
                  , o = le.call(arguments)
                  , i = ge.Deferred()
                  , a = function(e) {
                    return function(n) {
                        r[e] = this,
                        o[e] = arguments.length > 1 ? le.call(arguments) : n,
                        --t || i.resolveWith(r, o)
                    }
                };
                if (t <= 1 && (h(e, i.done(a(n)).resolve, i.reject, !t),
                "pending" === i.state() || ge.isFunction(o[n] && o[n].then)))
                    return i.then();
                for (; n--; )
                    h(o[n], a(n), i.reject);
                return i.promise()
            }
        });
        var Be = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;
        ge.Deferred.exceptionHook = function(e, t) {
            n.console && n.console.warn && e && Be.test(e.name) && n.console.warn("jQuery.Deferred exception: " + e.message, e.stack, t)
        }
        ,
        ge.readyException = function(e) {
            n.setTimeout(function() {
                throw e
            })
        }
        ;
        var je = ge.Deferred();
        ge.fn.ready = function(e) {
            return je.then(e).catch(function(e) {
                ge.readyException(e)
            }),
            this
        }
        ,
        ge.extend({
            isReady: !1,
            readyWait: 1,
            ready: function(e) {
                (!0 === e ? --ge.readyWait : ge.isReady) || (ge.isReady = !0,
                !0 !== e && --ge.readyWait > 0 || je.resolveWith(ae, [ge]))
            }
        }),
        ge.ready.then = je.then,
        "complete" === ae.readyState || "loading" !== ae.readyState && !ae.documentElement.doScroll ? n.setTimeout(ge.ready) : (ae.addEventListener("DOMContentLoaded", y),
        n.addEventListener("load", y));
        var Le = function(e, t, n, r, o, i, a) {
            var u = 0
              , l = e.length
              , s = null == n;
            if ("object" === ge.type(n)) {
                o = !0;
                for (u in n)
                    Le(e, t, u, n[u], !0, i, a)
            } else if (void 0 !== r && (o = !0,
            ge.isFunction(r) || (a = !0),
            s && (a ? (t.call(e, r),
            t = null) : (s = t,
            t = function(e, t, n) {
                return s.call(ge(e), n)
            }
            )),
            t))
                for (; u < l; u++)
                    t(e[u], n, a ? r : r.call(e[u], u, t(e[u], n)));
            return o ? e : s ? t.call(e) : l ? t(e[0], n) : i
        }
          , Re = function(e) {
            return 1 === e.nodeType || 9 === e.nodeType || !+e.nodeType
        };
        m.uid = 1,
        m.prototype = {
            cache: function(e) {
                var t = e[this.expando];
                return t || (t = {},
                Re(e) && (e.nodeType ? e[this.expando] = t : Object.defineProperty(e, this.expando, {
                    value: t,
                    configurable: !0
                }))),
                t
            },
            set: function(e, t, n) {
                var r, o = this.cache(e);
                if ("string" == typeof t)
                    o[ge.camelCase(t)] = n;
                else
                    for (r in t)
                        o[ge.camelCase(r)] = t[r];
                return o
            },
            get: function(e, t) {
                return void 0 === t ? this.cache(e) : e[this.expando] && e[this.expando][ge.camelCase(t)]
            },
            access: function(e, t, n) {
                return void 0 === t || t && "string" == typeof t && void 0 === n ? this.get(e, t) : (this.set(e, t, n),
                void 0 !== n ? n : t)
            },
            remove: function(e, t) {
                var n, r = e[this.expando];
                if (void 0 !== r) {
                    if (void 0 !== t) {
                        Array.isArray(t) ? t = t.map(ge.camelCase) : (t = ge.camelCase(t),
                        t = t in r ? [t] : t.match(Te) || []),
                        n = t.length;
                        for (; n--; )
                            delete r[t[n]]
                    }
                    (void 0 === t || ge.isEmptyObject(r)) && (e.nodeType ? e[this.expando] = void 0 : delete e[this.expando])
                }
            },
            hasData: function(e) {
                var t = e[this.expando];
                return void 0 !== t && !ge.isEmptyObject(t)
            }
        };
        var Fe = new m
          , Ne = new m
          , Ue = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/
          , ze = /[A-Z]/g;
        ge.extend({
            hasData: function(e) {
                return Ne.hasData(e) || Fe.hasData(e)
            },
            data: function(e, t, n) {
                return Ne.access(e, t, n)
            },
            removeData: function(e, t) {
                Ne.remove(e, t)
            },
            _data: function(e, t, n) {
                return Fe.access(e, t, n)
            },
            _removeData: function(e, t) {
                Fe.remove(e, t)
            }
        }),
        ge.fn.extend({
            data: function(e, t) {
                var n, r, o, i = this[0], a = i && i.attributes;
                if (void 0 === e) {
                    if (this.length && (o = Ne.get(i),
                    1 === i.nodeType && !Fe.get(i, "hasDataAttrs"))) {
                        for (n = a.length; n--; )
                            a[n] && (r = a[n].name,
                            0 === r.indexOf("data-") && (r = ge.camelCase(r.slice(5)),
                            g(i, r, o[r])));
                        Fe.set(i, "hasDataAttrs", !0)
                    }
                    return o
                }
                return "object" == typeof e ? this.each(function() {
                    Ne.set(this, e)
                }) : Le(this, function(t) {
                    var n;
                    if (i && void 0 === t) {
                        if (void 0 !== (n = Ne.get(i, e)))
                            return n;
                        if (void 0 !== (n = g(i, e)))
                            return n
                    } else
                        this.each(function() {
                            Ne.set(this, e, t)
                        })
                }, null, t, arguments.length > 1, null, !0)
            },
            removeData: function(e) {
                return this.each(function() {
                    Ne.remove(this, e)
                })
            }
        }),
        ge.extend({
            queue: function(e, t, n) {
                var r;
                if (e)
                    return t = (t || "fx") + "queue",
                    r = Fe.get(e, t),
                    n && (!r || Array.isArray(n) ? r = Fe.access(e, t, ge.makeArray(n)) : r.push(n)),
                    r || []
            },
            dequeue: function(e, t) {
                t = t || "fx";
                var n = ge.queue(e, t)
                  , r = n.length
                  , o = n.shift()
                  , i = ge._queueHooks(e, t)
                  , a = function() {
                    ge.dequeue(e, t)
                };
                "inprogress" === o && (o = n.shift(),
                r--),
                o && ("fx" === t && n.unshift("inprogress"),
                delete i.stop,
                o.call(e, a, i)),
                !r && i && i.empty.fire()
            },
            _queueHooks: function(e, t) {
                var n = t + "queueHooks";
                return Fe.get(e, n) || Fe.access(e, n, {
                    empty: ge.Callbacks("once memory").add(function() {
                        Fe.remove(e, [t + "queue", n])
                    })
                })
            }
        }),
        ge.fn.extend({
            queue: function(e, t) {
                var n = 2;
                return "string" != typeof e && (t = e,
                e = "fx",
                n--),
                arguments.length < n ? ge.queue(this[0], e) : void 0 === t ? this : this.each(function() {
                    var n = ge.queue(this, e, t);
                    ge._queueHooks(this, e),
                    "fx" === e && "inprogress" !== n[0] && ge.dequeue(this, e)
                })
            },
            dequeue: function(e) {
                return this.each(function() {
                    ge.dequeue(this, e)
                })
            },
            clearQueue: function(e) {
                return this.queue(e || "fx", [])
            },
            promise: function(e, t) {
                var n, r = 1, o = ge.Deferred(), i = this, a = this.length, u = function() {
                    --r || o.resolveWith(i, [i])
                };
                for ("string" != typeof e && (t = e,
                e = void 0),
                e = e || "fx"; a--; )
                    (n = Fe.get(i[a], e + "queueHooks")) && n.empty && (r++,
                    n.empty.add(u));
                return u(),
                o.promise(t)
            }
        });
        var He = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source
          , We = new RegExp("^(?:([+-])=|)(" + He + ")([a-z%]*)$","i")
          , qe = ["Top", "Right", "Bottom", "Left"]
          , Ge = function(e, t) {
            return e = t || e,
            "none" === e.style.display || "" === e.style.display && ge.contains(e.ownerDocument, e) && "none" === ge.css(e, "display")
        }
          , Ve = function(e, t, n, r) {
            var o, i, a = {};
            for (i in t)
                a[i] = e.style[i],
                e.style[i] = t[i];
            o = n.apply(e, r || []);
            for (i in t)
                e.style[i] = a[i];
            return o
        }
          , Ke = {};
        ge.fn.extend({
            show: function() {
                return w(this, !0)
            },
            hide: function() {
                return w(this)
            },
            toggle: function(e) {
                return "boolean" == typeof e ? e ? this.show() : this.hide() : this.each(function() {
                    Ge(this) ? ge(this).show() : ge(this).hide()
                })
            }
        });
        var Qe = /^(?:checkbox|radio)$/i
          , Je = /<([a-z][^\/\0>\x20\t\r\n\f]+)/i
          , Ye = /^$|\/(?:java|ecma)script/i
          , Xe = {
            option: [1, "<select multiple='multiple'>", "</select>"],
            thead: [1, "<table>", "</table>"],
            col: [2, "<table><colgroup>", "</colgroup></table>"],
            tr: [2, "<table><tbody>", "</tbody></table>"],
            td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
            _default: [0, "", ""]
        };
        Xe.optgroup = Xe.option,
        Xe.tbody = Xe.tfoot = Xe.colgroup = Xe.caption = Xe.thead,
        Xe.th = Xe.td;
        var Ze = /<|&#?\w+;/;
        !function() {
            var e = ae.createDocumentFragment()
              , t = e.appendChild(ae.createElement("div"))
              , n = ae.createElement("input");
            n.setAttribute("type", "radio"),
            n.setAttribute("checked", "checked"),
            n.setAttribute("name", "t"),
            t.appendChild(n),
            ve.checkClone = t.cloneNode(!0).cloneNode(!0).lastChild.checked,
            t.innerHTML = "<textarea>x</textarea>",
            ve.noCloneChecked = !!t.cloneNode(!0).lastChild.defaultValue
        }();
        var $e = ae.documentElement
          , et = /^key/
          , tt = /^(?:mouse|pointer|contextmenu|drag|drop)|click/
          , nt = /^([^.]*)(?:\.(.+)|)/;
        ge.event = {
            global: {},
            add: function(e, t, n, r, o) {
                var i, a, u, l, s, c, f, d, p, h, y, m = Fe.get(e);
                if (m)
                    for (n.handler && (i = n,
                    n = i.handler,
                    o = i.selector),
                    o && ge.find.matchesSelector($e, o),
                    n.guid || (n.guid = ge.guid++),
                    (l = m.events) || (l = m.events = {}),
                    (a = m.handle) || (a = m.handle = function(t) {
                        return void 0 !== ge && ge.event.triggered !== t.type ? ge.event.dispatch.apply(e, arguments) : void 0
                    }
                    ),
                    t = (t || "").match(Te) || [""],
                    s = t.length; s--; )
                        u = nt.exec(t[s]) || [],
                        p = y = u[1],
                        h = (u[2] || "").split(".").sort(),
                        p && (f = ge.event.special[p] || {},
                        p = (o ? f.delegateType : f.bindType) || p,
                        f = ge.event.special[p] || {},
                        c = ge.extend({
                            type: p,
                            origType: y,
                            data: r,
                            handler: n,
                            guid: n.guid,
                            selector: o,
                            needsContext: o && ge.expr.match.needsContext.test(o),
                            namespace: h.join(".")
                        }, i),
                        (d = l[p]) || (d = l[p] = [],
                        d.delegateCount = 0,
                        f.setup && !1 !== f.setup.call(e, r, h, a) || e.addEventListener && e.addEventListener(p, a)),
                        f.add && (f.add.call(e, c),
                        c.handler.guid || (c.handler.guid = n.guid)),
                        o ? d.splice(d.delegateCount++, 0, c) : d.push(c),
                        ge.event.global[p] = !0)
            },
            remove: function(e, t, n, r, o) {
                var i, a, u, l, s, c, f, d, p, h, y, m = Fe.hasData(e) && Fe.get(e);
                if (m && (l = m.events)) {
                    for (t = (t || "").match(Te) || [""],
                    s = t.length; s--; )
                        if (u = nt.exec(t[s]) || [],
                        p = y = u[1],
                        h = (u[2] || "").split(".").sort(),
                        p) {
                            for (f = ge.event.special[p] || {},
                            p = (r ? f.delegateType : f.bindType) || p,
                            d = l[p] || [],
                            u = u[2] && new RegExp("(^|\\.)" + h.join("\\.(?:.*\\.|)") + "(\\.|$)"),
                            a = i = d.length; i--; )
                                c = d[i],
                                !o && y !== c.origType || n && n.guid !== c.guid || u && !u.test(c.namespace) || r && r !== c.selector && ("**" !== r || !c.selector) || (d.splice(i, 1),
                                c.selector && d.delegateCount--,
                                f.remove && f.remove.call(e, c));
                            a && !d.length && (f.teardown && !1 !== f.teardown.call(e, h, m.handle) || ge.removeEvent(e, p, m.handle),
                            delete l[p])
                        } else
                            for (p in l)
                                ge.event.remove(e, p + t[s], n, r, !0);
                    ge.isEmptyObject(l) && Fe.remove(e, "handle events")
                }
            },
            dispatch: function(e) {
                var t, n, r, o, i, a, u = ge.event.fix(e), l = new Array(arguments.length), s = (Fe.get(this, "events") || {})[u.type] || [], c = ge.event.special[u.type] || {};
                for (l[0] = u,
                t = 1; t < arguments.length; t++)
                    l[t] = arguments[t];
                if (u.delegateTarget = this,
                !c.preDispatch || !1 !== c.preDispatch.call(this, u)) {
                    for (a = ge.event.handlers.call(this, u, s),
                    t = 0; (o = a[t++]) && !u.isPropagationStopped(); )
                        for (u.currentTarget = o.elem,
                        n = 0; (i = o.handlers[n++]) && !u.isImmediatePropagationStopped(); )
                            u.rnamespace && !u.rnamespace.test(i.namespace) || (u.handleObj = i,
                            u.data = i.data,
                            void 0 !== (r = ((ge.event.special[i.origType] || {}).handle || i.handler).apply(o.elem, l)) && !1 === (u.result = r) && (u.preventDefault(),
                            u.stopPropagation()));
                    return c.postDispatch && c.postDispatch.call(this, u),
                    u.result
                }
            },
            handlers: function(e, t) {
                var n, r, o, i, a, u = [], l = t.delegateCount, s = e.target;
                if (l && s.nodeType && !("click" === e.type && e.button >= 1))
                    for (; s !== this; s = s.parentNode || this)
                        if (1 === s.nodeType && ("click" !== e.type || !0 !== s.disabled)) {
                            for (i = [],
                            a = {},
                            n = 0; n < l; n++)
                                r = t[n],
                                o = r.selector + " ",
                                void 0 === a[o] && (a[o] = r.needsContext ? ge(o, this).index(s) > -1 : ge.find(o, this, null, [s]).length),
                                a[o] && i.push(r);
                            i.length && u.push({
                                elem: s,
                                handlers: i
                            })
                        }
                return s = this,
                l < t.length && u.push({
                    elem: s,
                    handlers: t.slice(l)
                }),
                u
            },
            addProp: function(e, t) {
                Object.defineProperty(ge.Event.prototype, e, {
                    enumerable: !0,
                    configurable: !0,
                    get: ge.isFunction(t) ? function() {
                        if (this.originalEvent)
                            return t(this.originalEvent)
                    }
                    : function() {
                        if (this.originalEvent)
                            return this.originalEvent[e]
                    }
                    ,
                    set: function(t) {
                        Object.defineProperty(this, e, {
                            enumerable: !0,
                            configurable: !0,
                            writable: !0,
                            value: t
                        })
                    }
                })
            },
            fix: function(e) {
                return e[ge.expando] ? e : new ge.Event(e)
            },
            special: {
                load: {
                    noBubble: !0
                },
                focus: {
                    trigger: function() {
                        if (this !== S() && this.focus)
                            return this.focus(),
                            !1
                    },
                    delegateType: "focusin"
                },
                blur: {
                    trigger: function() {
                        if (this === S() && this.blur)
                            return this.blur(),
                            !1
                    },
                    delegateType: "focusout"
                },
                click: {
                    trigger: function() {
                        if ("checkbox" === this.type && this.click && l(this, "input"))
                            return this.click(),
                            !1
                    },
                    _default: function(e) {
                        return l(e.target, "a")
                    }
                },
                beforeunload: {
                    postDispatch: function(e) {
                        void 0 !== e.result && e.originalEvent && (e.originalEvent.returnValue = e.result)
                    }
                }
            }
        },
        ge.removeEvent = function(e, t, n) {
            e.removeEventListener && e.removeEventListener(t, n)
        }
        ,
        ge.Event = function(e, t) {
            if (!(this instanceof ge.Event))
                return new ge.Event(e,t);
            e && e.type ? (this.originalEvent = e,
            this.type = e.type,
            this.isDefaultPrevented = e.defaultPrevented || void 0 === e.defaultPrevented && !1 === e.returnValue ? _ : A,
            this.target = e.target && 3 === e.target.nodeType ? e.target.parentNode : e.target,
            this.currentTarget = e.currentTarget,
            this.relatedTarget = e.relatedTarget) : this.type = e,
            t && ge.extend(this, t),
            this.timeStamp = e && e.timeStamp || ge.now(),
            this[ge.expando] = !0
        }
        ,
        ge.Event.prototype = {
            constructor: ge.Event,
            isDefaultPrevented: A,
            isPropagationStopped: A,
            isImmediatePropagationStopped: A,
            isSimulated: !1,
            preventDefault: function() {
                var e = this.originalEvent;
                this.isDefaultPrevented = _,
                e && !this.isSimulated && e.preventDefault()
            },
            stopPropagation: function() {
                var e = this.originalEvent;
                this.isPropagationStopped = _,
                e && !this.isSimulated && e.stopPropagation()
            },
            stopImmediatePropagation: function() {
                var e = this.originalEvent;
                this.isImmediatePropagationStopped = _,
                e && !this.isSimulated && e.stopImmediatePropagation(),
                this.stopPropagation()
            }
        },
        ge.each({
            altKey: !0,
            bubbles: !0,
            cancelable: !0,
            changedTouches: !0,
            ctrlKey: !0,
            detail: !0,
            eventPhase: !0,
            metaKey: !0,
            pageX: !0,
            pageY: !0,
            shiftKey: !0,
            view: !0,
            char: !0,
            charCode: !0,
            key: !0,
            keyCode: !0,
            button: !0,
            buttons: !0,
            clientX: !0,
            clientY: !0,
            offsetX: !0,
            offsetY: !0,
            pointerId: !0,
            pointerType: !0,
            screenX: !0,
            screenY: !0,
            targetTouches: !0,
            toElement: !0,
            touches: !0,
            which: function(e) {
                var t = e.button;
                return null == e.which && et.test(e.type) ? null != e.charCode ? e.charCode : e.keyCode : !e.which && void 0 !== t && tt.test(e.type) ? 1 & t ? 1 : 2 & t ? 3 : 4 & t ? 2 : 0 : e.which
            }
        }, ge.event.addProp),
        ge.each({
            mouseenter: "mouseover",
            mouseleave: "mouseout",
            pointerenter: "pointerover",
            pointerleave: "pointerout"
        }, function(e, t) {
            ge.event.special[e] = {
                delegateType: t,
                bindType: t,
                handle: function(e) {
                    var n, r = this, o = e.relatedTarget, i = e.handleObj;
                    return o && (o === r || ge.contains(r, o)) || (e.type = i.origType,
                    n = i.handler.apply(this, arguments),
                    e.type = t),
                    n
                }
            }
        }),
        ge.fn.extend({
            on: function(e, t, n, r) {
                return O(this, e, t, n, r)
            },
            one: function(e, t, n, r) {
                return O(this, e, t, n, r, 1)
            },
            off: function(e, t, n) {
                var r, o;
                if (e && e.preventDefault && e.handleObj)
                    return r = e.handleObj,
                    ge(e.delegateTarget).off(r.namespace ? r.origType + "." + r.namespace : r.origType, r.selector, r.handler),
                    this;
                if ("object" == typeof e) {
                    for (o in e)
                        this.off(o, t, e[o]);
                    return this
                }
                return !1 !== t && "function" != typeof t || (n = t,
                t = void 0),
                !1 === n && (n = A),
                this.each(function() {
                    ge.event.remove(this, e, n, t)
                })
            }
        });
        var rt = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi
          , ot = /<script|<style|<link/i
          , it = /checked\s*(?:[^=]|=\s*.checked.)/i
          , at = /^true\/(.*)/
          , ut = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;
        ge.extend({
            htmlPrefilter: function(e) {
                return e.replace(rt, "<$1></$2>")
            },
            clone: function(e, t, n) {
                var r, o, i, a, u = e.cloneNode(!0), l = ge.contains(e.ownerDocument, e);
                if (!(ve.noCloneChecked || 1 !== e.nodeType && 11 !== e.nodeType || ge.isXMLDoc(e)))
                    for (a = C(u),
                    i = C(e),
                    r = 0,
                    o = i.length; r < o; r++)
                        T(i[r], a[r]);
                if (t)
                    if (n)
                        for (i = i || C(e),
                        a = a || C(u),
                        r = 0,
                        o = i.length; r < o; r++)
                            D(i[r], a[r]);
                    else
                        D(e, u);
                return a = C(u, "script"),
                a.length > 0 && E(a, !l && C(e, "script")),
                u
            },
            cleanData: function(e) {
                for (var t, n, r, o = ge.event.special, i = 0; void 0 !== (n = e[i]); i++)
                    if (Re(n)) {
                        if (t = n[Fe.expando]) {
                            if (t.events)
                                for (r in t.events)
                                    o[r] ? ge.event.remove(n, r) : ge.removeEvent(n, r, t.handle);
                            n[Fe.expando] = void 0
                        }
                        n[Ne.expando] && (n[Ne.expando] = void 0)
                    }
            }
        }),
        ge.fn.extend({
            detach: function(e) {
                return j(this, e, !0)
            },
            remove: function(e) {
                return j(this, e)
            },
            text: function(e) {
                return Le(this, function(e) {
                    return void 0 === e ? ge.text(this) : this.empty().each(function() {
                        1 !== this.nodeType && 11 !== this.nodeType && 9 !== this.nodeType || (this.textContent = e)
                    })
                }, null, e, arguments.length)
            },
            append: function() {
                return B(this, arguments, function(e) {
                    if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                        P(this, e).appendChild(e)
                    }
                })
            },
            prepend: function() {
                return B(this, arguments, function(e) {
                    if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                        var t = P(this, e);
                        t.insertBefore(e, t.firstChild)
                    }
                })
            },
            before: function() {
                return B(this, arguments, function(e) {
                    this.parentNode && this.parentNode.insertBefore(e, this)
                })
            },
            after: function() {
                return B(this, arguments, function(e) {
                    this.parentNode && this.parentNode.insertBefore(e, this.nextSibling)
                })
            },
            empty: function() {
                for (var e, t = 0; null != (e = this[t]); t++)
                    1 === e.nodeType && (ge.cleanData(C(e, !1)),
                    e.textContent = "");
                return this
            },
            clone: function(e, t) {
                return e = null != e && e,
                t = null == t ? e : t,
                this.map(function() {
                    return ge.clone(this, e, t)
                })
            },
            html: function(e) {
                return Le(this, function(e) {
                    var t = this[0] || {}
                      , n = 0
                      , r = this.length;
                    if (void 0 === e && 1 === t.nodeType)
                        return t.innerHTML;
                    if ("string" == typeof e && !ot.test(e) && !Xe[(Je.exec(e) || ["", ""])[1].toLowerCase()]) {
                        e = ge.htmlPrefilter(e);
                        try {
                            for (; n < r; n++)
                                t = this[n] || {},
                                1 === t.nodeType && (ge.cleanData(C(t, !1)),
                                t.innerHTML = e);
                            t = 0
                        } catch (e) {}
                    }
                    t && this.empty().append(e)
                }, null, e, arguments.length)
            },
            replaceWith: function() {
                var e = [];
                return B(this, arguments, function(t) {
                    var n = this.parentNode;
                    ge.inArray(this, e) < 0 && (ge.cleanData(C(this)),
                    n && n.replaceChild(t, this))
                }, e)
            }
        }),
        ge.each({
            appendTo: "append",
            prependTo: "prepend",
            insertBefore: "before",
            insertAfter: "after",
            replaceAll: "replaceWith"
        }, function(e, t) {
            ge.fn[e] = function(e) {
                for (var n, r = [], o = ge(e), i = o.length - 1, a = 0; a <= i; a++)
                    n = a === i ? this : this.clone(!0),
                    ge(o[a])[t](n),
                    ce.apply(r, n.get());
                return this.pushStack(r)
            }
        });
        var lt = /^margin/
          , st = new RegExp("^(" + He + ")(?!px)[a-z%]+$","i")
          , ct = function(e) {
            var t = e.ownerDocument.defaultView;
            return t && t.opener || (t = n),
            t.getComputedStyle(e)
        };
        !function() {
            function e() {
                if (u) {
                    u.style.cssText = "box-sizing:border-box;position:relative;display:block;margin:auto;border:1px;padding:1px;top:1%;width:50%",
                    u.innerHTML = "",
                    $e.appendChild(a);
                    var e = n.getComputedStyle(u);
                    t = "1%" !== e.top,
                    i = "2px" === e.marginLeft,
                    r = "4px" === e.width,
                    u.style.marginRight = "50%",
                    o = "4px" === e.marginRight,
                    $e.removeChild(a),
                    u = null
                }
            }
            var t, r, o, i, a = ae.createElement("div"), u = ae.createElement("div");
            u.style && (u.style.backgroundClip = "content-box",
            u.cloneNode(!0).style.backgroundClip = "",
            ve.clearCloneStyle = "content-box" === u.style.backgroundClip,
            a.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;padding:0;margin-top:1px;position:absolute",
            a.appendChild(u),
            ge.extend(ve, {
                pixelPosition: function() {
                    return e(),
                    t
                },
                boxSizingReliable: function() {
                    return e(),
                    r
                },
                pixelMarginRight: function() {
                    return e(),
                    o
                },
                reliableMarginLeft: function() {
                    return e(),
                    i
                }
            }))
        }();
        var ft = /^(none|table(?!-c[ea]).+)/
          , dt = /^--/
          , pt = {
            position: "absolute",
            visibility: "hidden",
            display: "block"
        }
          , ht = {
            letterSpacing: "0",
            fontWeight: "400"
        }
          , yt = ["Webkit", "Moz", "ms"]
          , mt = ae.createElement("div").style;
        ge.extend({
            cssHooks: {
                opacity: {
                    get: function(e, t) {
                        if (t) {
                            var n = L(e, "opacity");
                            return "" === n ? "1" : n
                        }
                    }
                }
            },
            cssNumber: {
                animationIterationCount: !0,
                columnCount: !0,
                fillOpacity: !0,
                flexGrow: !0,
                flexShrink: !0,
                fontWeight: !0,
                lineHeight: !0,
                opacity: !0,
                order: !0,
                orphans: !0,
                widows: !0,
                zIndex: !0,
                zoom: !0
            },
            cssProps: {
                float: "cssFloat"
            },
            style: function(e, t, n, r) {
                if (e && 3 !== e.nodeType && 8 !== e.nodeType && e.style) {
                    var o, i, a, u = ge.camelCase(t), l = dt.test(t), s = e.style;
                    if (l || (t = N(u)),
                    a = ge.cssHooks[t] || ge.cssHooks[u],
                    void 0 === n)
                        return a && "get"in a && void 0 !== (o = a.get(e, !1, r)) ? o : s[t];
                    i = typeof n,
                    "string" === i && (o = We.exec(n)) && o[1] && (n = b(e, t, o),
                    i = "number"),
                    null != n && n === n && ("number" === i && (n += o && o[3] || (ge.cssNumber[u] ? "" : "px")),
                    ve.clearCloneStyle || "" !== n || 0 !== t.indexOf("background") || (s[t] = "inherit"),
                    a && "set"in a && void 0 === (n = a.set(e, n, r)) || (l ? s.setProperty(t, n) : s[t] = n))
                }
            },
            css: function(e, t, n, r) {
                var o, i, a, u = ge.camelCase(t);
                return dt.test(t) || (t = N(u)),
                a = ge.cssHooks[t] || ge.cssHooks[u],
                a && "get"in a && (o = a.get(e, !0, n)),
                void 0 === o && (o = L(e, t, r)),
                "normal" === o && t in ht && (o = ht[t]),
                "" === n || n ? (i = parseFloat(o),
                !0 === n || isFinite(i) ? i || 0 : o) : o
            }
        }),
        ge.each(["height", "width"], function(e, t) {
            ge.cssHooks[t] = {
                get: function(e, n, r) {
                    if (n)
                        return !ft.test(ge.css(e, "display")) || e.getClientRects().length && e.getBoundingClientRect().width ? H(e, t, r) : Ve(e, pt, function() {
                            return H(e, t, r)
                        })
                },
                set: function(e, n, r) {
                    var o, i = r && ct(e), a = r && z(e, t, r, "border-box" === ge.css(e, "boxSizing", !1, i), i);
                    return a && (o = We.exec(n)) && "px" !== (o[3] || "px") && (e.style[t] = n,
                    n = ge.css(e, t)),
                    U(e, n, a)
                }
            }
        }),
        ge.cssHooks.marginLeft = R(ve.reliableMarginLeft, function(e, t) {
            if (t)
                return (parseFloat(L(e, "marginLeft")) || e.getBoundingClientRect().left - Ve(e, {
                    marginLeft: 0
                }, function() {
                    return e.getBoundingClientRect().left
                })) + "px"
        }),
        ge.each({
            margin: "",
            padding: "",
            border: "Width"
        }, function(e, t) {
            ge.cssHooks[e + t] = {
                expand: function(n) {
                    for (var r = 0, o = {}, i = "string" == typeof n ? n.split(" ") : [n]; r < 4; r++)
                        o[e + qe[r] + t] = i[r] || i[r - 2] || i[0];
                    return o
                }
            },
            lt.test(e) || (ge.cssHooks[e + t].set = U)
        }),
        ge.fn.extend({
            css: function(e, t) {
                return Le(this, function(e, t, n) {
                    var r, o, i = {}, a = 0;
                    if (Array.isArray(t)) {
                        for (r = ct(e),
                        o = t.length; a < o; a++)
                            i[t[a]] = ge.css(e, t[a], !1, r);
                        return i
                    }
                    return void 0 !== n ? ge.style(e, t, n) : ge.css(e, t)
                }, e, t, arguments.length > 1)
            }
        }),
        ge.Tween = W,
        W.prototype = {
            constructor: W,
            init: function(e, t, n, r, o, i) {
                this.elem = e,
                this.prop = n,
                this.easing = o || ge.easing._default,
                this.options = t,
                this.start = this.now = this.cur(),
                this.end = r,
                this.unit = i || (ge.cssNumber[n] ? "" : "px")
            },
            cur: function() {
                var e = W.propHooks[this.prop];
                return e && e.get ? e.get(this) : W.propHooks._default.get(this)
            },
            run: function(e) {
                var t, n = W.propHooks[this.prop];
                return this.pos = t = this.options.duration ? ge.easing[this.easing](e, this.options.duration * e, 0, 1, this.options.duration) : e,
                this.now = (this.end - this.start) * t + this.start,
                this.options.step && this.options.step.call(this.elem, this.now, this),
                n && n.set ? n.set(this) : W.propHooks._default.set(this),
                this
            }
        },
        W.prototype.init.prototype = W.prototype,
        W.propHooks = {
            _default: {
                get: function(e) {
                    var t;
                    return 1 !== e.elem.nodeType || null != e.elem[e.prop] && null == e.elem.style[e.prop] ? e.elem[e.prop] : (t = ge.css(e.elem, e.prop, ""),
                    t && "auto" !== t ? t : 0)
                },
                set: function(e) {
                    ge.fx.step[e.prop] ? ge.fx.step[e.prop](e) : 1 !== e.elem.nodeType || null == e.elem.style[ge.cssProps[e.prop]] && !ge.cssHooks[e.prop] ? e.elem[e.prop] = e.now : ge.style(e.elem, e.prop, e.now + e.unit)
                }
            }
        },
        W.propHooks.scrollTop = W.propHooks.scrollLeft = {
            set: function(e) {
                e.elem.nodeType && e.elem.parentNode && (e.elem[e.prop] = e.now)
            }
        },
        ge.easing = {
            linear: function(e) {
                return e
            },
            swing: function(e) {
                return .5 - Math.cos(e * Math.PI) / 2
            },
            _default: "swing"
        },
        ge.fx = W.prototype.init,
        ge.fx.step = {};
        var vt, gt, bt = /^(?:toggle|show|hide)$/, xt = /queueHooks$/;
        ge.Animation = ge.extend(Y, {
            tweeners: {
                "*": [function(e, t) {
                    var n = this.createTween(e, t);
                    return b(n.elem, e, We.exec(t), n),
                    n
                }
                ]
            },
            tweener: function(e, t) {
                ge.isFunction(e) ? (t = e,
                e = ["*"]) : e = e.match(Te);
                for (var n, r = 0, o = e.length; r < o; r++)
                    n = e[r],
                    Y.tweeners[n] = Y.tweeners[n] || [],
                    Y.tweeners[n].unshift(t)
            },
            prefilters: [Q],
            prefilter: function(e, t) {
                t ? Y.prefilters.unshift(e) : Y.prefilters.push(e)
            }
        }),
        ge.speed = function(e, t, n) {
            var r = e && "object" == typeof e ? ge.extend({}, e) : {
                complete: n || !n && t || ge.isFunction(e) && e,
                duration: e,
                easing: n && t || t && !ge.isFunction(t) && t
            };
            return ge.fx.off ? r.duration = 0 : "number" != typeof r.duration && (r.duration = r.duration in ge.fx.speeds ? ge.fx.speeds[r.duration] : ge.fx.speeds._default),
            null != r.queue && !0 !== r.queue || (r.queue = "fx"),
            r.old = r.complete,
            r.complete = function() {
                ge.isFunction(r.old) && r.old.call(this),
                r.queue && ge.dequeue(this, r.queue)
            }
            ,
            r
        }
        ,
        ge.fn.extend({
            fadeTo: function(e, t, n, r) {
                return this.filter(Ge).css("opacity", 0).show().end().animate({
                    opacity: t
                }, e, n, r)
            },
            animate: function(e, t, n, r) {
                var o = ge.isEmptyObject(e)
                  , i = ge.speed(t, n, r)
                  , a = function() {
                    var t = Y(this, ge.extend({}, e), i);
                    (o || Fe.get(this, "finish")) && t.stop(!0)
                };
                return a.finish = a,
                o || !1 === i.queue ? this.each(a) : this.queue(i.queue, a)
            },
            stop: function(e, t, n) {
                var r = function(e) {
                    var t = e.stop;
                    delete e.stop,
                    t(n)
                };
                return "string" != typeof e && (n = t,
                t = e,
                e = void 0),
                t && !1 !== e && this.queue(e || "fx", []),
                this.each(function() {
                    var t = !0
                      , o = null != e && e + "queueHooks"
                      , i = ge.timers
                      , a = Fe.get(this);
                    if (o)
                        a[o] && a[o].stop && r(a[o]);
                    else
                        for (o in a)
                            a[o] && a[o].stop && xt.test(o) && r(a[o]);
                    for (o = i.length; o--; )
                        i[o].elem !== this || null != e && i[o].queue !== e || (i[o].anim.stop(n),
                        t = !1,
                        i.splice(o, 1));
                    !t && n || ge.dequeue(this, e)
                })
            },
            finish: function(e) {
                return !1 !== e && (e = e || "fx"),
                this.each(function() {
                    var t, n = Fe.get(this), r = n[e + "queue"], o = n[e + "queueHooks"], i = ge.timers, a = r ? r.length : 0;
                    for (n.finish = !0,
                    ge.queue(this, e, []),
                    o && o.stop && o.stop.call(this, !0),
                    t = i.length; t--; )
                        i[t].elem === this && i[t].queue === e && (i[t].anim.stop(!0),
                        i.splice(t, 1));
                    for (t = 0; t < a; t++)
                        r[t] && r[t].finish && r[t].finish.call(this);
                    delete n.finish
                })
            }
        }),
        ge.each(["toggle", "show", "hide"], function(e, t) {
            var n = ge.fn[t];
            ge.fn[t] = function(e, r, o) {
                return null == e || "boolean" == typeof e ? n.apply(this, arguments) : this.animate(V(t, !0), e, r, o)
            }
        }),
        ge.each({
            slideDown: V("show"),
            slideUp: V("hide"),
            slideToggle: V("toggle"),
            fadeIn: {
                opacity: "show"
            },
            fadeOut: {
                opacity: "hide"
            },
            fadeToggle: {
                opacity: "toggle"
            }
        }, function(e, t) {
            ge.fn[e] = function(e, n, r) {
                return this.animate(t, e, n, r)
            }
        }),
        ge.timers = [],
        ge.fx.tick = function() {
            var e, t = 0, n = ge.timers;
            for (vt = ge.now(); t < n.length; t++)
                (e = n[t])() || n[t] !== e || n.splice(t--, 1);
            n.length || ge.fx.stop(),
            vt = void 0
        }
        ,
        ge.fx.timer = function(e) {
            ge.timers.push(e),
            ge.fx.start()
        }
        ,
        ge.fx.interval = 13,
        ge.fx.start = function() {
            gt || (gt = !0,
            q())
        }
        ,
        ge.fx.stop = function() {
            gt = null
        }
        ,
        ge.fx.speeds = {
            slow: 600,
            fast: 200,
            _default: 400
        },
        ge.fn.delay = function(e, t) {
            return e = ge.fx ? ge.fx.speeds[e] || e : e,
            t = t || "fx",
            this.queue(t, function(t, r) {
                var o = n.setTimeout(t, e);
                r.stop = function() {
                    n.clearTimeout(o)
                }
            })
        }
        ,
        function() {
            var e = ae.createElement("input")
              , t = ae.createElement("select")
              , n = t.appendChild(ae.createElement("option"));
            e.type = "checkbox",
            ve.checkOn = "" !== e.value,
            ve.optSelected = n.selected,
            e = ae.createElement("input"),
            e.value = "t",
            e.type = "radio",
            ve.radioValue = "t" === e.value
        }();
        var wt, Ct = ge.expr.attrHandle;
        ge.fn.extend({
            attr: function(e, t) {
                return Le(this, ge.attr, e, t, arguments.length > 1)
            },
            removeAttr: function(e) {
                return this.each(function() {
                    ge.removeAttr(this, e)
                })
            }
        }),
        ge.extend({
            attr: function(e, t, n) {
                var r, o, i = e.nodeType;
                if (3 !== i && 8 !== i && 2 !== i)
                    return void 0 === e.getAttribute ? ge.prop(e, t, n) : (1 === i && ge.isXMLDoc(e) || (o = ge.attrHooks[t.toLowerCase()] || (ge.expr.match.bool.test(t) ? wt : void 0)),
                    void 0 !== n ? null === n ? void ge.removeAttr(e, t) : o && "set"in o && void 0 !== (r = o.set(e, n, t)) ? r : (e.setAttribute(t, n + ""),
                    n) : o && "get"in o && null !== (r = o.get(e, t)) ? r : (r = ge.find.attr(e, t),
                    null == r ? void 0 : r))
            },
            attrHooks: {
                type: {
                    set: function(e, t) {
                        if (!ve.radioValue && "radio" === t && l(e, "input")) {
                            var n = e.value;
                            return e.setAttribute("type", t),
                            n && (e.value = n),
                            t
                        }
                    }
                }
            },
            removeAttr: function(e, t) {
                var n, r = 0, o = t && t.match(Te);
                if (o && 1 === e.nodeType)
                    for (; n = o[r++]; )
                        e.removeAttribute(n)
            }
        }),
        wt = {
            set: function(e, t, n) {
                return !1 === t ? ge.removeAttr(e, n) : e.setAttribute(n, n),
                n
            }
        },
        ge.each(ge.expr.match.bool.source.match(/\w+/g), function(e, t) {
            var n = Ct[t] || ge.find.attr;
            Ct[t] = function(e, t, r) {
                var o, i, a = t.toLowerCase();
                return r || (i = Ct[a],
                Ct[a] = o,
                o = null != n(e, t, r) ? a : null,
                Ct[a] = i),
                o
            }
        });
        var Et = /^(?:input|select|textarea|button)$/i
          , kt = /^(?:a|area)$/i;
        ge.fn.extend({
            prop: function(e, t) {
                return Le(this, ge.prop, e, t, arguments.length > 1)
            },
            removeProp: function(e) {
                return this.each(function() {
                    delete this[ge.propFix[e] || e]
                })
            }
        }),
        ge.extend({
            prop: function(e, t, n) {
                var r, o, i = e.nodeType;
                if (3 !== i && 8 !== i && 2 !== i)
                    return 1 === i && ge.isXMLDoc(e) || (t = ge.propFix[t] || t,
                    o = ge.propHooks[t]),
                    void 0 !== n ? o && "set"in o && void 0 !== (r = o.set(e, n, t)) ? r : e[t] = n : o && "get"in o && null !== (r = o.get(e, t)) ? r : e[t]
            },
            propHooks: {
                tabIndex: {
                    get: function(e) {
                        var t = ge.find.attr(e, "tabindex");
                        return t ? parseInt(t, 10) : Et.test(e.nodeName) || kt.test(e.nodeName) && e.href ? 0 : -1
                    }
                }
            },
            propFix: {
                for: "htmlFor",
                class: "className"
            }
        }),
        ve.optSelected || (ge.propHooks.selected = {
            get: function(e) {
                return null
            },
            set: function(e) {}
        }),
        ge.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function() {
            ge.propFix[this.toLowerCase()] = this
        }),
        ge.fn.extend({
            addClass: function(e) {
                var t, n, r, o, i, a, u, l = 0;
                if (ge.isFunction(e))
                    return this.each(function(t) {
                        ge(this).addClass(e.call(this, t, Z(this)))
                    });
                if ("string" == typeof e && e)
                    for (t = e.match(Te) || []; n = this[l++]; )
                        if (o = Z(n),
                        r = 1 === n.nodeType && " " + X(o) + " ") {
                            for (a = 0; i = t[a++]; )
                                r.indexOf(" " + i + " ") < 0 && (r += i + " ");
                            u = X(r),
                            o !== u && n.setAttribute("class", u)
                        }
                return this
            },
            removeClass: function(e) {
                var t, n, r, o, i, a, u, l = 0;
                if (ge.isFunction(e))
                    return this.each(function(t) {
                        ge(this).removeClass(e.call(this, t, Z(this)))
                    });
                if (!arguments.length)
                    return this.attr("class", "");
                if ("string" == typeof e && e)
                    for (t = e.match(Te) || []; n = this[l++]; )
                        if (o = Z(n),
                        r = 1 === n.nodeType && " " + X(o) + " ") {
                            for (a = 0; i = t[a++]; )
                                for (; r.indexOf(" " + i + " ") > -1; )
                                    r = r.replace(" " + i + " ", " ");
                            u = X(r),
                            o !== u && n.setAttribute("class", u)
                        }
                return this
            },
            toggleClass: function(e, t) {
                var n = typeof e;
                return "boolean" == typeof t && "string" === n ? t ? this.addClass(e) : this.removeClass(e) : this.each(ge.isFunction(e) ? function(n) {
                    ge(this).toggleClass(e.call(this, n, Z(this), t), t)
                }
                : function() {
                    var t, r, o, i;
                    if ("string" === n)
                        for (r = 0,
                        o = ge(this),
                        i = e.match(Te) || []; t = i[r++]; )
                            o.hasClass(t) ? o.removeClass(t) : o.addClass(t);
                    else
                        void 0 !== e && "boolean" !== n || (t = Z(this),
                        t && Fe.set(this, "__className__", t),
                        this.setAttribute && this.setAttribute("class", t || !1 === e ? "" : Fe.get(this, "__className__") || ""))
                }
                )
            },
            hasClass: function(e) {
                var t, n, r = 0;
                for (t = " " + e + " "; n = this[r++]; )
                    if (1 === n.nodeType && (" " + X(Z(n)) + " ").indexOf(t) > -1)
                        return !0;
                return !1
            }
        });
        var _t = /\r/g;
        ge.fn.extend({
            val: function(e) {
                var t, n, r, o = this[0];
                {
                    if (arguments.length)
                        return r = ge.isFunction(e),
                        this.each(function(n) {
                            var o;
                            1 === this.nodeType && (o = r ? e.call(this, n, ge(this).val()) : e,
                            null == o ? o = "" : "number" == typeof o ? o += "" : Array.isArray(o) && (o = ge.map(o, function(e) {
                                return null == e ? "" : e + ""
                            })),
                            (t = ge.valHooks[this.type] || ge.valHooks[this.nodeName.toLowerCase()]) && "set"in t && void 0 !== t.set(this, o, "value") || (this.value = o))
                        });
                    if (o)
                        return (t = ge.valHooks[o.type] || ge.valHooks[o.nodeName.toLowerCase()]) && "get"in t && void 0 !== (n = t.get(o, "value")) ? n : (n = o.value,
                        "string" == typeof n ? n.replace(_t, "") : null == n ? "" : n)
                }
            }
        }),
        ge.extend({
            valHooks: {
                option: {
                    get: function(e) {
                        var t = ge.find.attr(e, "value");
                        return null != t ? t : X(ge.text(e))
                    }
                },
                select: {
                    get: function(e) {
                        var t, n, r, o = e.options, i = e.selectedIndex, a = "select-one" === e.type, u = a ? null : [], s = a ? i + 1 : o.length;
                        for (r = i < 0 ? s : a ? i : 0; r < s; r++)
                            if (n = o[r],
                            (n.selected || r === i) && !n.disabled && (!n.parentNode.disabled || !l(n.parentNode, "optgroup"))) {
                                if (t = ge(n).val(),
                                a)
                                    return t;
                                u.push(t)
                            }
                        return u
                    },
                    set: function(e, t) {
                        for (var n, r, o = e.options, i = ge.makeArray(t), a = o.length; a--; )
                            r = o[a],
                            (r.selected = ge.inArray(ge.valHooks.option.get(r), i) > -1) && (n = !0);
                        return n || (e.selectedIndex = -1),
                        i
                    }
                }
            }
        }),
        ge.each(["radio", "checkbox"], function() {
            ge.valHooks[this] = {
                set: function(e, t) {
                    if (Array.isArray(t))
                        return e.checked = ge.inArray(ge(e).val(), t) > -1
                }
            },
            ve.checkOn || (ge.valHooks[this].get = function(e) {
                return null === e.getAttribute("value") ? "on" : e.value
            }
            )
        });
        var At = /^(?:focusinfocus|focusoutblur)$/;
        ge.extend(ge.event, {
            trigger: function(e, t, r, o) {
                var i, a, u, l, s, c, f, d = [r || ae], p = he.call(e, "type") ? e.type : e, h = he.call(e, "namespace") ? e.namespace.split(".") : [];
                if (a = u = r = r || ae,
                3 !== r.nodeType && 8 !== r.nodeType && !At.test(p + ge.event.triggered) && (p.indexOf(".") > -1 && (h = p.split("."),
                p = h.shift(),
                h.sort()),
                s = p.indexOf(":") < 0 && "on" + p,
                e = e[ge.expando] ? e : new ge.Event(p,"object" == typeof e && e),
                e.isTrigger = o ? 2 : 3,
                e.namespace = h.join("."),
                e.rnamespace = e.namespace ? new RegExp("(^|\\.)" + h.join("\\.(?:.*\\.|)") + "(\\.|$)") : null,
                e.result = void 0,
                e.target || (e.target = r),
                t = null == t ? [e] : ge.makeArray(t, [e]),
                f = ge.event.special[p] || {},
                o || !f.trigger || !1 !== f.trigger.apply(r, t))) {
                    if (!o && !f.noBubble && !ge.isWindow(r)) {
                        for (l = f.delegateType || p,
                        At.test(l + p) || (a = a.parentNode); a; a = a.parentNode)
                            d.push(a),
                            u = a;
                        u === (r.ownerDocument || ae) && d.push(u.defaultView || u.parentWindow || n)
                    }
                    for (i = 0; (a = d[i++]) && !e.isPropagationStopped(); )
                        e.type = i > 1 ? l : f.bindType || p,
                        c = (Fe.get(a, "events") || {})[e.type] && Fe.get(a, "handle"),
                        c && c.apply(a, t),
                        (c = s && a[s]) && c.apply && Re(a) && !1 === (e.result = c.apply(a, t)) && e.preventDefault();
                    return e.type = p,
                    o || e.isDefaultPrevented() || f._default && !1 !== f._default.apply(d.pop(), t) || !Re(r) || s && ge.isFunction(r[p]) && !ge.isWindow(r) && (u = r[s],
                    u && (r[s] = null),
                    ge.event.triggered = p,
                    r[p](),
                    ge.event.triggered = void 0,
                    u && (r[s] = u)),
                    e.result
                }
            },
            simulate: function(e, t, n) {
                var r = ge.extend(new ge.Event, n, {
                    type: e,
                    isSimulated: !0
                });
                ge.event.trigger(r, null, t)
            }
        }),
        ge.fn.extend({
            trigger: function(e, t) {
                return this.each(function() {
                    ge.event.trigger(e, t, this)
                })
            },
            triggerHandler: function(e, t) {
                var n = this[0];
                if (n)
                    return ge.event.trigger(e, t, n, !0)
            }
        }),
        ge.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "), function(e, t) {
            ge.fn[t] = function(e, n) {
                return arguments.length > 0 ? this.on(t, null, e, n) : this.trigger(t)
            }
        }),
        ge.fn.extend({
            hover: function(e, t) {
                return this.mouseenter(e).mouseleave(t || e)
            }
        }),
        (ve.focusin = "onfocusin"in n) || ge.each({
            focus: "focusin",
            blur: "focusout"
        }, function(e, t) {
            var n = function(e) {
                ge.event.simulate(t, e.target, ge.event.fix(e))
            };
            ge.event.special[t] = {
                setup: function() {
                    var r = this.ownerDocument || this
                      , o = Fe.access(r, t);
                    o || r.addEventListener(e, n, !0),
                    Fe.access(r, t, (o || 0) + 1)
                },
                teardown: function() {
                    var r = this.ownerDocument || this
                      , o = Fe.access(r, t) - 1;
                    o ? Fe.access(r, t, o) : (r.removeEventListener(e, n, !0),
                    Fe.remove(r, t))
                }
            }
        });
        var St = n.location
          , Ot = ge.now()
          , Pt = /\?/;
        ge.parseXML = function(e) {
            var t;
            if (!e || "string" != typeof e)
                return null;
            try {
                t = (new n.DOMParser).parseFromString(e, "text/xml")
            } catch (e) {
                t = void 0
            }
            return t && !t.getElementsByTagName("parsererror").length || ge.error("Invalid XML: " + e),
            t
        }
        ;
        var Mt = /\[\]$/
          , It = /\r?\n/g
          , Dt = /^(?:submit|button|image|reset|file)$/i
          , Tt = /^(?:input|select|textarea|keygen)/i;
        ge.param = function(e, t) {
            var n, r = [], o = function(e, t) {
                var n = ge.isFunction(t) ? t() : t;
                r[r.length] = encodeURIComponent(e) + "=" + encodeURIComponent(null == n ? "" : n)
            };
            if (Array.isArray(e) || e.jquery && !ge.isPlainObject(e))
                ge.each(e, function() {
                    o(this.name, this.value)
                });
            else
                for (n in e)
                    $(n, e[n], t, o);
            return r.join("&")
        }
        ,
        ge.fn.extend({
            serialize: function() {
                return ge.param(this.serializeArray())
            },
            serializeArray: function() {
                return this.map(function() {
                    var e = ge.prop(this, "elements");
                    return e ? ge.makeArray(e) : this
                }).filter(function() {
                    var e = this.type;
                    return this.name && !ge(this).is(":disabled") && Tt.test(this.nodeName) && !Dt.test(e) && (this.checked || !Qe.test(e))
                }).map(function(e, t) {
                    var n = ge(this).val();
                    return null == n ? null : Array.isArray(n) ? ge.map(n, function(e) {
                        return {
                            name: t.name,
                            value: e.replace(It, "\r\n")
                        }
                    }) : {
                        name: t.name,
                        value: n.replace(It, "\r\n")
                    }
                }).get()
            }
        });
        var Bt = /%20/g
          , jt = /#.*$/
          , Lt = /([?&])_=[^&]*/
          , Rt = /^(.*?):[ \t]*([^\r\n]*)$/gm
          , Ft = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/
          , Nt = /^(?:GET|HEAD)$/
          , Ut = /^\/\//
          , zt = {}
          , Ht = {}
          , Wt = "*/".concat("*")
          , qt = ae.createElement("a");
        qt.href = St.href,
        ge.extend({
            active: 0,
            lastModified: {},
            etag: {},
            ajaxSettings: {
                url: St.href,
                type: "GET",
                isLocal: Ft.test(St.protocol),
                global: !0,
                processData: !0,
                async: !0,
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                accepts: {
                    "*": Wt,
                    text: "text/plain",
                    html: "text/html",
                    xml: "application/xml, text/xml",
                    json: "application/json, text/javascript"
                },
                contents: {
                    xml: /\bxml\b/,
                    html: /\bhtml/,
                    json: /\bjson\b/
                },
                responseFields: {
                    xml: "responseXML",
                    text: "responseText",
                    json: "responseJSON"
                },
                converters: {
                    "* text": String,
                    "text html": !0,
                    "text json": JSON.parse,
                    "text xml": ge.parseXML
                },
                flatOptions: {
                    url: !0,
                    context: !0
                }
            },
            ajaxSetup: function(e, t) {
                return t ? ne(ne(e, ge.ajaxSettings), t) : ne(ge.ajaxSettings, e)
            },
            ajaxPrefilter: ee(zt),
            ajaxTransport: ee(Ht),
            ajax: function(e, t) {
                function r(e, t, r, u) {
                    var s, d, p, x, w, C = t;
                    c || (c = !0,
                    l && n.clearTimeout(l),
                    o = void 0,
                    a = u || "",
                    E.readyState = e > 0 ? 4 : 0,
                    s = e >= 200 && e < 300 || 304 === e,
                    r && (x = re(h, E, r)),
                    x = oe(h, x, E, s),
                    s ? (h.ifModified && (w = E.getResponseHeader("Last-Modified"),
                    w && (ge.lastModified[i] = w),
                    (w = E.getResponseHeader("etag")) && (ge.etag[i] = w)),
                    204 === e || "HEAD" === h.type ? C = "nocontent" : 304 === e ? C = "notmodified" : (C = x.state,
                    d = x.data,
                    p = x.error,
                    s = !p)) : (p = C,
                    !e && C || (C = "error",
                    e < 0 && (e = 0))),
                    E.status = e,
                    E.statusText = (t || C) + "",
                    s ? v.resolveWith(y, [d, C, E]) : v.rejectWith(y, [E, C, p]),
                    E.statusCode(b),
                    b = void 0,
                    f && m.trigger(s ? "ajaxSuccess" : "ajaxError", [E, h, s ? d : p]),
                    g.fireWith(y, [E, C]),
                    f && (m.trigger("ajaxComplete", [E, h]),
                    --ge.active || ge.event.trigger("ajaxStop")))
                }
                "object" == typeof e && (t = e,
                e = void 0),
                t = t || {};
                var o, i, a, u, l, s, c, f, d, p, h = ge.ajaxSetup({}, t), y = h.context || h, m = h.context && (y.nodeType || y.jquery) ? ge(y) : ge.event, v = ge.Deferred(), g = ge.Callbacks("once memory"), b = h.statusCode || {}, x = {}, w = {}, C = "canceled", E = {
                    readyState: 0,
                    getResponseHeader: function(e) {
                        var t;
                        if (c) {
                            if (!u)
                                for (u = {}; t = Rt.exec(a); )
                                    u[t[1].toLowerCase()] = t[2];
                            t = u[e.toLowerCase()]
                        }
                        return null == t ? null : t
                    },
                    getAllResponseHeaders: function() {
                        return c ? a : null
                    },
                    setRequestHeader: function(e, t) {
                        return null == c && (e = w[e.toLowerCase()] = w[e.toLowerCase()] || e,
                        x[e] = t),
                        this
                    },
                    overrideMimeType: function(e) {
                        return null == c && (h.mimeType = e),
                        this
                    },
                    statusCode: function(e) {
                        var t;
                        if (e)
                            if (c)
                                E.always(e[E.status]);
                            else
                                for (t in e)
                                    b[t] = [b[t], e[t]];
                        return this
                    },
                    abort: function(e) {
                        var t = e || C;
                        return o && o.abort(t),
                        r(0, t),
                        this
                    }
                };
                if (v.promise(E),
                h.url = ((e || h.url || St.href) + "").replace(Ut, St.protocol + "//"),
                h.type = t.method || t.type || h.method || h.type,
                h.dataTypes = (h.dataType || "*").toLowerCase().match(Te) || [""],
                null == h.crossDomain) {
                    s = ae.createElement("a");
                    try {
                        s.href = h.url,
                        s.href = s.href,
                        h.crossDomain = qt.protocol + "//" + qt.host != s.protocol + "//" + s.host
                    } catch (e) {
                        h.crossDomain = !0
                    }
                }
                if (h.data && h.processData && "string" != typeof h.data && (h.data = ge.param(h.data, h.traditional)),
                te(zt, h, t, E),
                c)
                    return E;
                f = ge.event && h.global,
                f && 0 == ge.active++ && ge.event.trigger("ajaxStart"),
                h.type = h.type.toUpperCase(),
                h.hasContent = !Nt.test(h.type),
                i = h.url.replace(jt, ""),
                h.hasContent ? h.data && h.processData && 0 === (h.contentType || "").indexOf("application/x-www-form-urlencoded") && (h.data = h.data.replace(Bt, "+")) : (p = h.url.slice(i.length),
                h.data && (i += (Pt.test(i) ? "&" : "?") + h.data,
                delete h.data),
                !1 === h.cache && (i = i.replace(Lt, "$1"),
                p = (Pt.test(i) ? "&" : "?") + "_=" + Ot++ + p),
                h.url = i + p),
                h.ifModified && (ge.lastModified[i] && E.setRequestHeader("If-Modified-Since", ge.lastModified[i]),
                ge.etag[i] && E.setRequestHeader("If-None-Match", ge.etag[i])),
                (h.data && h.hasContent && !1 !== h.contentType || t.contentType) && E.setRequestHeader("Content-Type", h.contentType),
                E.setRequestHeader("Accept", h.dataTypes[0] && h.accepts[h.dataTypes[0]] ? h.accepts[h.dataTypes[0]] + ("*" !== h.dataTypes[0] ? ", " + Wt + "; q=0.01" : "") : h.accepts["*"]);
                for (d in h.headers)
                    E.setRequestHeader(d, h.headers[d]);
                if (h.beforeSend && (!1 === h.beforeSend.call(y, E, h) || c))
                    return E.abort();
                if (C = "abort",
                g.add(h.complete),
                E.done(h.success),
                E.fail(h.error),
                o = te(Ht, h, t, E)) {
                    if (E.readyState = 1,
                    f && m.trigger("ajaxSend", [E, h]),
                    c)
                        return E;
                    h.async && h.timeout > 0 && (l = n.setTimeout(function() {
                        E.abort("timeout")
                    }, h.timeout));
                    try {
                        c = !1,
                        o.send(x, r)
                    } catch (e) {
                        if (c)
                            throw e;
                        r(-1, e)
                    }
                } else
                    r(-1, "No Transport");
                return E
            },
            getJSON: function(e, t, n) {
                return ge.get(e, t, n, "json")
            },
            getScript: function(e, t) {
                return ge.get(e, void 0, t, "script")
            }
        }),
        ge.each(["get", "post"], function(e, t) {
            ge[t] = function(e, n, r, o) {
                return ge.isFunction(n) && (o = o || r,
                r = n,
                n = void 0),
                ge.ajax(ge.extend({
                    url: e,
                    type: t,
                    dataType: o,
                    data: n,
                    success: r
                }, ge.isPlainObject(e) && e))
            }
        }),
        ge._evalUrl = function(e) {
            return ge.ajax({
                url: e,
                type: "GET",
                dataType: "script",
                cache: !0,
                async: !1,
                global: !1,
                throws: !0
            })
        }
        ,
        ge.fn.extend({
            wrapAll: function(e) {
                var t;
                return this[0] && (ge.isFunction(e) && (e = e.call(this[0])),
                t = ge(e, this[0].ownerDocument).eq(0).clone(!0),
                this[0].parentNode && t.insertBefore(this[0]),
                t.map(function() {
                    for (var e = this; e.firstElementChild; )
                        e = e.firstElementChild;
                    return e
                }).append(this)),
                this
            },
            wrapInner: function(e) {
                return this.each(ge.isFunction(e) ? function(t) {
                    ge(this).wrapInner(e.call(this, t))
                }
                : function() {
                    var t = ge(this)
                      , n = t.contents();
                    n.length ? n.wrapAll(e) : t.append(e)
                }
                )
            },
            wrap: function(e) {
                var t = ge.isFunction(e);
                return this.each(function(n) {
                    ge(this).wrapAll(t ? e.call(this, n) : e)
                })
            },
            unwrap: function(e) {
                return this.parent(e).not("body").each(function() {
                    ge(this).replaceWith(this.childNodes)
                }),
                this
            }
        }),
        ge.expr.pseudos.hidden = function(e) {
            return !ge.expr.pseudos.visible(e)
        }
        ,
        ge.expr.pseudos.visible = function(e) {
            return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length)
        }
        ,
        ge.ajaxSettings.xhr = function() {
            try {
                return new n.XMLHttpRequest
            } catch (e) {}
        }
        ;
        var Gt = {
            0: 200,
            1223: 204
        }
          , Vt = ge.ajaxSettings.xhr();
        ve.cors = !!Vt && "withCredentials"in Vt,
        ve.ajax = Vt = !!Vt,
        ge.ajaxTransport(function(e) {
            var t, r;
            if (ve.cors || Vt && !e.crossDomain)
                return {
                    send: function(o, i) {
                        var a, u = e.xhr();
                        if (u.open(e.type, e.url, e.async, e.username, e.password),
                        e.xhrFields)
                            for (a in e.xhrFields)
                                u[a] = e.xhrFields[a];
                        e.mimeType && u.overrideMimeType && u.overrideMimeType(e.mimeType),
                        e.crossDomain || o["X-Requested-With"] || (o["X-Requested-With"] = "XMLHttpRequest");
                        for (a in o)
                            u.setRequestHeader(a, o[a]);
                        t = function(e) {
                            return function() {
                                t && (t = r = u.onload = u.onerror = u.onabort = u.onreadystatechange = null,
                                "abort" === e ? u.abort() : "error" === e ? "number" != typeof u.status ? i(0, "error") : i(u.status, u.statusText) : i(Gt[u.status] || u.status, u.statusText, "text" !== (u.responseType || "text") || "string" != typeof u.responseText ? {
                                    binary: u.response
                                } : {
                                    text: u.responseText
                                }, u.getAllResponseHeaders()))
                            }
                        }
                        ,
                        u.onload = t(),
                        r = u.onerror = t("error"),
                        void 0 !== u.onabort ? u.onabort = r : u.onreadystatechange = function() {
                            4 === u.readyState && n.setTimeout(function() {
                                t && r()
                            })
                        }
                        ,
                        t = t("abort");
                        try {
                            u.send(e.hasContent && e.data || null)
                        } catch (e) {
                            if (t)
                                throw e
                        }
                    },
                    abort: function() {
                        t && t()
                    }
                }
        }),
        ge.ajaxPrefilter(function(e) {
            e.crossDomain && (e.contents.script = !1)
        }),
        ge.ajaxSetup({
            accepts: {
                script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
            },
            contents: {
                script: /\b(?:java|ecma)script\b/
            },
            converters: {
                "text script": function(e) {
                    return ge.globalEval(e),
                    e
                }
            }
        }),
        ge.ajaxPrefilter("script", function(e) {
            void 0 === e.cache && (e.cache = !1),
            e.crossDomain && (e.type = "GET")
        }),
        ge.ajaxTransport("script", function(e) {
            if (e.crossDomain) {
                var t, n;
                return {
                    send: function(r, o) {
                        t = ge("<script>").prop({
                            charset: e.scriptCharset,
                            src: e.url
                        }).on("load error", n = function(e) {
                            t.remove(),
                            n = null,
                            e && o("error" === e.type ? 404 : 200, e.type)
                        }
                        ),
                        ae.head.appendChild(t[0])
                    },
                    abort: function() {
                        n && n()
                    }
                }
            }
        });
        var Kt = []
          , Qt = /(=)\?(?=&|$)|\?\?/;
        ge.ajaxSetup({
            jsonp: "callback",
            jsonpCallback: function() {
                var e = Kt.pop() || ge.expando + "_" + Ot++;
                return this[e] = !0,
                e
            }
        }),
        ge.ajaxPrefilter("json jsonp", function(e, t, r) {
            var o, i, a, u = !1 !== e.jsonp && (Qt.test(e.url) ? "url" : "string" == typeof e.data && 0 === (e.contentType || "").indexOf("application/x-www-form-urlencoded") && Qt.test(e.data) && "data");
            if (u || "jsonp" === e.dataTypes[0])
                return o = e.jsonpCallback = ge.isFunction(e.jsonpCallback) ? e.jsonpCallback() : e.jsonpCallback,
                u ? e[u] = e[u].replace(Qt, "$1" + o) : !1 !== e.jsonp && (e.url += (Pt.test(e.url) ? "&" : "?") + e.jsonp + "=" + o),
                e.converters["script json"] = function() {
                    return a || ge.error(o + " was not called"),
                    a[0]
                }
                ,
                e.dataTypes[0] = "json",
                i = n[o],
                n[o] = function() {
                    a = arguments
                }
                ,
                r.always(function() {
                    void 0 === i ? ge(n).removeProp(o) : n[o] = i,
                    e[o] && (e.jsonpCallback = t.jsonpCallback,
                    Kt.push(o)),
                    a && ge.isFunction(i) && i(a[0]),
                    a = i = void 0
                }),
                "script"
        }),
        ve.createHTMLDocument = function() {
            var e = ae.implementation.createHTMLDocument("").body;
            return e.innerHTML = "<form></form><form></form>",
            2 === e.childNodes.length
        }(),
        ge.parseHTML = function(e, t, n) {
            if ("string" != typeof e)
                return [];
            "boolean" == typeof t && (n = t,
            t = !1);
            var r, o, i;
            return t || (ve.createHTMLDocument ? (t = ae.implementation.createHTMLDocument(""),
            r = t.createElement("base"),
            r.href = ae.location.href,
            t.head.appendChild(r)) : t = ae),
            o = Se.exec(e),
            i = !n && [],
            o ? [t.createElement(o[1])] : (o = k([e], t, i),
            i && i.length && ge(i).remove(),
            ge.merge([], o.childNodes))
        }
        ,
        ge.fn.load = function(e, t, n) {
            var r, o, i, a = this, u = e.indexOf(" ");
            return u > -1 && (r = X(e.slice(u)),
            e = e.slice(0, u)),
            ge.isFunction(t) ? (n = t,
            t = void 0) : t && "object" == typeof t && (o = "POST"),
            a.length > 0 && ge.ajax({
                url: e,
                type: o || "GET",
                dataType: "html",
                data: t
            }).done(function(e) {
                i = arguments,
                a.html(r ? ge("<div>").append(ge.parseHTML(e)).find(r) : e)
            }).always(n && function(e, t) {
                a.each(function() {
                    n.apply(this, i || [e.responseText, t, e])
                })
            }
            ),
            this
        }
        ,
        ge.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function(e, t) {
            ge.fn[t] = function(e) {
                return this.on(t, e)
            }
        }),
        ge.expr.pseudos.animated = function(e) {
            return ge.grep(ge.timers, function(t) {
                return e === t.elem
            }).length
        }
        ,
        ge.offset = {
            setOffset: function(e, t, n) {
                var r, o, i, a, u, l, s, c = ge.css(e, "position"), f = ge(e), d = {};
                "static" === c && (e.style.position = "relative"),
                u = f.offset(),
                i = ge.css(e, "top"),
                l = ge.css(e, "left"),
                s = ("absolute" === c || "fixed" === c) && (i + l).indexOf("auto") > -1,
                s ? (r = f.position(),
                a = r.top,
                o = r.left) : (a = parseFloat(i) || 0,
                o = parseFloat(l) || 0),
                ge.isFunction(t) && (t = t.call(e, n, ge.extend({}, u))),
                null != t.top && (d.top = t.top - u.top + a),
                null != t.left && (d.left = t.left - u.left + o),
                "using"in t ? t.using.call(e, d) : f.css(d)
            }
        },
        ge.fn.extend({
            offset: function(e) {
                if (arguments.length)
                    return void 0 === e ? this : this.each(function(t) {
                        ge.offset.setOffset(this, e, t)
                    });
                var t, n, r, o, i = this[0];
                if (i)
                    return i.getClientRects().length ? (r = i.getBoundingClientRect(),
                    t = i.ownerDocument,
                    n = t.documentElement,
                    o = t.defaultView,
                    {
                        top: r.top + o.pageYOffset - n.clientTop,
                        left: r.left + o.pageXOffset - n.clientLeft
                    }) : {
                        top: 0,
                        left: 0
                    }
            },
            position: function() {
                if (this[0]) {
                    var e, t, n = this[0], r = {
                        top: 0,
                        left: 0
                    };
                    return "fixed" === ge.css(n, "position") ? t = n.getBoundingClientRect() : (e = this.offsetParent(),
                    t = this.offset(),
                    l(e[0], "html") || (r = e.offset()),
                    r = {
                        top: r.top + ge.css(e[0], "borderTopWidth", !0),
                        left: r.left + ge.css(e[0], "borderLeftWidth", !0)
                    }),
                    {
                        top: t.top - r.top - ge.css(n, "marginTop", !0),
                        left: t.left - r.left - ge.css(n, "marginLeft", !0)
                    }
                }
            },
            offsetParent: function() {
                return this.map(function() {
                    for (var e = this.offsetParent; e && "static" === ge.css(e, "position"); )
                        e = e.offsetParent;
                    return e || $e
                })
            }
        }),
        ge.each({
            scrollLeft: "pageXOffset",
            scrollTop: "pageYOffset"
        }, function(e, t) {
            var n = "pageYOffset" === t;
            ge.fn[e] = function(r) {
                return Le(this, function(e, r, o) {
                    var i;
                    if (ge.isWindow(e) ? i = e : 9 === e.nodeType && (i = e.defaultView),
                    void 0 === o)
                        return i ? i[t] : e[r];
                    i ? i.scrollTo(n ? i.pageXOffset : o, n ? o : i.pageYOffset) : e[r] = o
                }, e, r, arguments.length)
            }
        }),
        ge.each(["top", "left"], function(e, t) {
            ge.cssHooks[t] = R(ve.pixelPosition, function(e, n) {
                if (n)
                    return n = L(e, t),
                    st.test(n) ? ge(e).position()[t] + "px" : n
            })
        }),
        ge.each({
            Height: "height",
            Width: "width"
        }, function(e, t) {
            ge.each({
                padding: "inner" + e,
                content: t,
                "": "outer" + e
            }, function(n, r) {
                ge.fn[r] = function(o, i) {
                    var a = arguments.length && (n || "boolean" != typeof o)
                      , u = n || (!0 === o || !0 === i ? "margin" : "border");
                    return Le(this, function(t, n, o) {
                        var i;
                        return ge.isWindow(t) ? 0 === r.indexOf("outer") ? t["inner" + e] : t.document.documentElement["client" + e] : 9 === t.nodeType ? (i = t.documentElement,
                        Math.max(t.body["scroll" + e], i["scroll" + e], t.body["offset" + e], i["offset" + e], i["client" + e])) : void 0 === o ? ge.css(t, n, u) : ge.style(t, n, o, u)
                    }, t, a ? o : void 0, a)
                }
            })
        }),
        ge.fn.extend({
            bind: function(e, t, n) {
                return this.on(e, null, t, n)
            },
            unbind: function(e, t) {
                return this.off(e, null, t)
            },
            delegate: function(e, t, n, r) {
                return this.on(t, e, n, r)
            },
            undelegate: function(e, t, n) {
                return 1 === arguments.length ? this.off(e, "**") : this.off(t, e || "**", n)
            }
        }),
        ge.holdReady = function(e) {
            e ? ge.readyWait++ : ge.ready(!0)
        }
        ,
        ge.isArray = Array.isArray,
        ge.parseJSON = JSON.parse,
        ge.nodeName = l,
        r = [],
        void 0 !== (o = function() {
            return ge
        }
        .apply(t, r)) && (e.exports = o);
        var Jt = n.jQuery
          , Yt = n.$;
        return ge.noConflict = function(e) {
            return n.$ === ge && (n.$ = Yt),
            e && n.jQuery === ge && (n.jQuery = Jt),
            ge
        }
        ,
        i || (n.jQuery = n.$ = ge),
        ge
    })
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.ReactCSS = t.loop = t.handleActive = t.handleHover = t.hover = void 0;
    var o = n(1184)
      , i = r(o)
      , a = n(1256)
      , u = r(a)
      , l = n(1281)
      , s = r(l)
      , c = n(1282)
      , f = r(c)
      , d = n(1283)
      , p = r(d)
      , h = n(1284)
      , y = r(h);
    t.hover = f.default,
    t.handleHover = f.default,
    t.handleActive = p.default,
    t.loop = y.default,
    t.default = t.ReactCSS = function(e) {
        for (var t = arguments.length, n = Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++)
            n[r - 1] = arguments[r];
        var o = (0,
        i.default)(n)
          , a = (0,
        u.default)(e, o);
        return (0,
        s.default)(a)
    }
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function i(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
    function a(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.ConstantTextSc = t.ConstantText = void 0;
    var u = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , l = function e(t, n, r) {
        null === t && (t = Function.prototype);
        var o = Object.getOwnPropertyDescriptor(t, n);
        if (void 0 === o) {
            var i = Object.getPrototypeOf(t);
            return null === i ? void 0 : e(i, n, r)
        }
        if ("value"in o)
            return o.value;
        var a = o.get;
        if (void 0 !== a)
            return a.call(r)
    }
      , s = n(0)
      , c = r(s)
      , f = n(30)
      , d = r(f)
      , p = n(280)
      , h = r(p)
      , y = n(24)
      , m = r(y)
      , v = n(5)
      , g = r(v)
      , b = n(409)
      , x = r(b);
    n(435);
    var w = function(e) {
        function t(e) {
            o(this, t);
            var n = i(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e));
            return n.containerClassName = "constant-text",
            n.requestUpperHandled = !0,
            n
        }
        return a(t, e),
        u(t, [{
            key: "shouldComponentUpdate",
            value: function(e, n) {
                var r = l(t.prototype.__proto__ || Object.getPrototypeOf(t.prototype), "shouldComponentUpdate", this).call(this, e, n);
                return r = r || e.customDataStr != this.props.customDataStr
            }
        }, {
            key: "useCustomBaseLine",
            value: function() {
                return !1
            }
        }, {
            key: "renderText",
            value: function(e) {
                var t = x.default.fillMetricsForTextBlock(e, null)
                  , n = {};
                return !t.haveUpperChar && this.props.stripInfo && this.props.stripInfo.stripUp && (n.marginTop = this.getRoundEmStr(h.default.upperSmallMarginTopEm)),
                !t.haveLowerChar && this.props.stripInfo && this.props.stripInfo.stripDown && (n.marginBottom = this.getRoundEmStr(h.default.lowerSmallMarginBottomEm)),
                c.default.createElement("constant-text", {
                    style: n,
                    class: this.props.customDataStr
                }, e)
            }
        }, {
            key: "renderComponent",
            value: function() {
                return this.renderText(this.props.data.text.substr(1))
            }
        }]),
        t
    }(d.default)
      , C = function(e) {
        function t() {
            o(this, t);
            var e = i(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this));
            return e.isConstantText = !0,
            e.isOperatorName = !0,
            e.categoryChar = "OpOrFn",
            e
        }
        return a(t, e),
        u(t, [{
            key: "getViewComponent",
            value: function() {
                return w
            }
        }, {
            key: "getLatextName",
            value: function() {
                return "\\text"
            }
        }, {
            key: "getSymbol",
            value: function() {
                return "text"
            }
        }, {
            key: "getModel",
            value: function() {
                return this.getModelFromStructure({}, this.getLatextName())
            }
        }, {
            key: "getSymbolInfo",
            value: function() {
                return this.fillSymbolInfo({
                    type: "composite",
                    names: [this.getLatextName(), this.getSymbol()],
                    symbol: this.getSymbol()
                })
            }
        }, {
            key: "toModel",
            value: function(e, t, n) {
                if (n && 0 == n.length)
                    return {
                        text: ""
                    };
                var r = this.getModel();
                return r.elements.value = g.default.n__du(n),
                r
            }
        }, {
            key: "toLatex",
            value: function() {
                return this.getLatextName()
            }
        }]),
        t
    }(m.default);
    t.default = new C,
    t.ConstantText = w,
    t.ConstantTextSc = C
}
, function(e, t, n) {
    "use strict";
    function r(e, t, n, r, i, a, u, l) {
        if (o(t),
        !e) {
            var s;
            if (void 0 === t)
                s = new Error("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");
            else {
                var c = [n, r, i, a, u, l]
                  , f = 0;
                s = new Error(t.replace(/%s/g, function() {
                    return c[f++]
                })),
                s.name = "Invariant Violation"
            }
            throw s.framesToPop = 1,
            s
        }
    }
    var o = function(e) {};
    e.exports = r
}
, function(e, t, n) {
    "use strict";
    function r(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var o = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , i = n(401)
      , a = function(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }(i);
    t.default = new (function() {
        function e() {
            r(this, e);
            var t = new a.default;
            t.sniff(window.navigator.userAgent),
            this.sniffr = t,
            this.browserName = this.sniffr.browser.name,
            this.browserMajorVersion = Number.parseInt(this.sniffr.browser.version[0]),
            this._shouldMoveHiddenInputOnFocus = this.isMobileOrTablet() || this.isFirefox() || this.isSafari() || this.isChrome() && this.getBrowserMajorVersion() <= 54;
            var n = new a.default;
            n.sniff("Mozilla/5.0 (Android 5.1; Tablet; rv:55.0) Gecko/55.0 Firefox/55.0")
        }
        return o(e, [{
            key: "getOsName",
            value: function() {
                return this.sniffr.os.name
            }
        }, {
            key: "isFirefoxOs",
            value: function() {
                return "firefoxos" == this.sniffr.os.name
            }
        }, {
            key: "isMac",
            value: function() {
                return "macos" == this.getOsName()
            }
        }, {
            key: "isFirefox",
            value: function() {
                return "firefox" == this.browserName
            }
        }, {
            key: "isSafari",
            value: function() {
                return "safari" == this.browserName
            }
        }, {
            key: "isChrome",
            value: function() {
                return "chrome" == this.browserName
            }
        }, {
            key: "isNoBoundingClientRectSupportForRange",
            value: function() {
                return this.isSafari() || this.isIos()
            }
        }, {
            key: "shouldMoveHiddenInputOnFocus",
            value: function() {
                return this._shouldMoveHiddenInputOnFocus
            }
        }, {
            key: "isDevEnv",
            value: function() {
                return window.mathGlobal && "dev" == window.mathGlobal.environment
            }
        }, {
            key: "isEdge",
            value: function() {
                return "edge" == this.browserName
            }
        }, {
            key: "shouldRangeDetach",
            value: function() {
                return !this.isEdge()
            }
        }, {
            key: "getBrowserMajorVersion",
            value: function() {
                return this.browserMajorVersion
            }
        }, {
            key: "isMobileOrTablet",
            value: function() {
                return "Unknown" !== this.sniffr.device.name || this.isIos() || this.isAndroid() || this.isFirefoxOs()
            }
        }, {
            key: "getScreenWidth",
            value: function() {
                return window.screen.width
            }
        }, {
            key: "shouldUseSmallLayout",
            value: function() {
                return this.isMobileOrTablet() && this.getScreenWidth() < 900
            }
        }, {
            key: "isIos",
            value: function() {
                return "ios" == this.sniffr.os.name
            }
        }, {
            key: "isAndroid",
            value: function() {
                return "android" == this.sniffr.os.name
            }
        }]),
        e
    }())
}
, function(e, t, n) {
    var r = n(23);
    e.exports = function(e) {
        if (!r(e))
            throw TypeError(e + " is not an object!");
        return e
    }
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function i(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
    function a(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var u = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , l = n(0)
      , s = r(l)
      , c = n(1)
      , f = r(c)
      , d = n(4)
      , p = r(d);
    n(911);
    var h = n(3)
      , y = r(h)
      , m = n(5)
      , v = r(m)
      , g = n(65)
      , b = r(g)
      , x = n(408)
      , w = r(x)
      , C = n(40)
      , E = r(C)
      , k = n(281)
      , _ = r(k);
    String.prototype.replaceAt = function(e, t) {
        return this.substr(0, e) + t + this.substr(e + t.length)
    }
    ;
    var A = function(e) {
        function t(e) {
            o(this, t);
            var n = i(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e));
            return n.onTagInfoChanged = n.onTagInfoChanged.bind(n),
            n
        }
        return a(t, e),
        u(t, [{
            key: "shouldComponentUpdate",
            value: function(e) {
                return e.data != this.props.data || e.className != this.props.className || e.style != this.props.style || e.selected != this.props.selected || e.showBorder != this.props.showBorder || e.fontSize != this.props.fontSize || e.borderIfEmpty != this.props.borderIfEmpty
            }
        }, {
            key: "componentDidMount",
            value: function() {
                this.props.data.tagInfo && this.context.notifyLineTagRender()
            }
        }, {
            key: "componentWillUnmount",
            value: function() {
                this.props.data.tagInfo && this.context.notifyLineTagRender()
            }
        }, {
            key: "componentDidUpdate",
            value: function(e) {
                e.data.tagInfo != this.props.data.tagInfo && this.context.notifyLineTagRender()
            }
        }, {
            key: "getData",
            value: function() {
                return this.props.data
            }
        }, {
            key: "showCursor",
            value: function() {
                this.props.needShowCursor()
            }
        }, {
            key: "select",
            value: function(e, t, n) {
                this.props.onSelectedChanged({
                    lineIndex: e.lineIndex,
                    charIndex: e.charIndex
                }, {
                    cursorAccumulatedInfo: f.default.assign({}, t, e, {
                        editor: this.editor
                    }),
                    isExtendingSelection: !!n
                })
            }
        }, {
            key: "selectCursorFromPosition",
            value: function(e, t, n, r) {
                var o = b.default.n__ck(this.editor, e, {
                    left: t,
                    top: n
                });
                if (!o)
                    return null;
                this.select(o, null, r)
            }
        }, {
            key: "onChildDataChanged",
            value: function(e, t, n, r, o) {
                var i = p.default.set(this.props.data.lines[e].blocks, t, r);
                this.props.onDataChanged(p.default.set(this.props.data, "lines", p.default.set(this.props.data.lines, e + ".blocks", i)), o)
            }
        }, {
            key: "onDataChanged",
            value: function(e, t, n) {
                this.props.onDataChanged(p.default.set(this.props.data, "lines", p.default.setIndex(this.props.data.lines, e, t)), n)
            }
        }, {
            key: "onChildSelectedChanged",
            value: function(e, t, n, r, o) {
                r.lineIndex = e,
                r.charIndex = n,
                null == o && (o = {});
                var i = v.default.findLeafSelected(r);
                null == o.cursorAccumulatedInfo && (o.cursorAccumulatedInfo = {
                    lineIndex: i.lineIndex,
                    charIndex: i.charIndex
                },
                r.selected || (o.editor = this.editor)),
                this.props.onSelectedChanged(r, o)
            }
        }, {
            key: "isLineImmediatelySelected",
            value: function(e) {
                if (null == this.props.selected)
                    return !1;
                var t = this.props.selected;
                return t.lineIndex == e && null == t.selected || void 0
            }
        }, {
            key: "componentWillUpdate",
            value: function(e) {
                e.ignoreFindingMovingBlocks || (!this.props.optimizeForOneLine || e.data.lines.length >= 2 && this.props.data.lines.length >= 2) && e.data.lines.length != this.props.data.lines.length && (this.movingBlocksInfo = this.findMovedBlocks(this.props.data.lines, e.data.lines))
            }
        }, {
            key: "findReactBlockChildren",
            value: function(e) {
                return y.default.n__ex(e.getHostNode()) ? e._renderedComponent._renderedChildren[".1"]._renderedChildren : e._renderedComponent._renderedChildren
            }
        }, {
            key: "findDomMovingBlocks",
            value: function(e) {
                var t = this.findDomByKey(e.changedLine.id)
                  , n = {};
                return f.default.forEach(this.findReactBlockChildren(t), function(t, r) {
                    f.default.some(e.movingBlocks, function(e) {
                        return r.endsWith("$" + e.id)
                    }) && (n[r] = t)
                }),
                e.movingDomBlocks = n,
                t._instance.keepRemovedBlocks = n,
                e
            }
        }, {
            key: "findDomByKey",
            value: function(e) {
                return this.props.noAreaContainer || this.props.isTextMode ? f.default.find(this._reactInternalInstance._renderedComponent._renderedChildren, function(t, n) {
                    return n.endsWith("$" + e)
                }) : f.default.find(this._reactInternalInstance._renderedComponent._renderedChildren[".1"]._renderedChildren, function(t, n) {
                    return n.endsWith("$" + e)
                })
            }
        }, {
            key: "findMovedBlocks",
            value: function(e, t) {
                var n = f.default.difference(e, t)
                  , r = f.default.difference(t, e)
                  , o = null;
                if (r.forEach(function(e) {
                    n.forEach(function(t) {
                        if (!o && e.id != t.id) {
                            var n = f.default.intersectionBy(e.blocks, t.blocks, "id");
                            n.length > 0 && (o = {
                                lastNewLine: e,
                                changedLine: t,
                                movingBlocks: n
                            })
                        }
                    })
                }),
                o)
                    return this.findDomMovingBlocks(o)
            }
        }, {
            key: "getLineSelected",
            value: function(e) {
                if (null == this.props.selected)
                    return null;
                var t = this.props.selected;
                return t.lineIndex == e ? t : void 0
            }
        }, {
            key: "clearNestedLevelListItems",
            value: function(e, t) {
                for (var n = t + 1; n <= E.default.getMaxNestedListLevel(); n++)
                    e.indents[n] = null;
                return e
            }
        }, {
            key: "clearNestedLevelSectionItems",
            value: function(e, t) {
                for (var n = t + 1; n <= E.default.getMaxNestedSectionLevel(); n++)
                    e.sectionIndents[n] = null;
                return e
            }
        }, {
            key: "getAndModifyIndentIfIndentLevelIsSoDeep",
            value: function(e, t, n) {
                var r = E.default.getLineStyle(e, "indentIndex", 0);
                return r > n + 1 ? (r = n + 1,
                e.___tempIndentIndex = r) : e.___tempIndentIndex = void 0,
                r
            }
        }, {
            key: "handleLineInfo",
            value: function(e, t) {
                t = t || {
                    indents: f.default.times(E.default.getMaxNestedListLevel() + 1, function() {
                        return null
                    }),
                    sectionIndents: f.default.times(E.default.getMaxNestedSectionLevel() + 1, function() {
                        return null
                    }),
                    emptyObj: {},
                    lastIndent: -1,
                    lastSectionIndent: -1,
                    clearAllOrderIndent: !1
                };
                var n = E.default.getLineStyle(e, "listType")
                  , r = t.emptyObj;
                if ("order" == n) {
                    var o = this.getAndModifyIndentIfIndentLevelIsSoDeep(e, t, t.lastIndent);
                    this.clearNestedLevelListItems(t, o),
                    t.indents[o] = null == t.indents[o] ? 0 : t.indents[o] + 1,
                    r = {},
                    r.listIndex = t.indents[o],
                    r.indentIndex = o,
                    t.lastIndent = o,
                    t.clearAllOrderIndent = !1
                } else if ("unorder" == n) {
                    var o = this.getAndModifyIndentIfIndentLevelIsSoDeep(e, t, t.lastIndent);
                    this.clearNestedLevelListItems(t, o),
                    t.lastIndent = o,
                    r = {},
                    r.indentIndex = o,
                    t.clearAllOrderIndent = !1
                } else if ("section" == n) {
                    var o = this.getAndModifyIndentIfIndentLevelIsSoDeep(e, t, t.lastSectionIndent);
                    this.clearNestedLevelSectionItems(t, o),
                    t.lastSectionIndent = o,
                    t.clearAllOrderIndent = !1,
                    t.sectionIndents[o] = null == t.sectionIndents[o] ? 0 : t.sectionIndents[o] + 1,
                    r = {},
                    r.indents = f.default.clone(t.sectionIndents),
                    t.indents = f.default.times(E.default.getMaxNestedListLevel() + 1, function() {
                        return null
                    }),
                    r.indentIndex = o,
                    r.sectionIndents = t.sectionIndents
                } else
                    t.clearAllOrderIndent || (this.clearNestedLevelListItems(t, -1),
                    t.clearAllOrderIndent = !0,
                    t.lastIndent = -1);
                return !n && e.___tempIndentIndex && (e.___tempIndentIndex = void 0),
                t.lineInfo = r,
                t
            }
        }, {
            key: "getEditClss",
            value: function() {
                return w.default
            }
        }, {
            key: "renderLines",
            value: function(e) {
                for (var t = null, n = [], r = e.length, o = 0; o < r; o++) {
                    var i = e[o];
                    t = this.handleLineInfo(i, t);
                    var a = null
                      , u = null;
                    this.movingBlocksInfo && (i.id == this.movingBlocksInfo.changedLine.id && (a = this.movingBlocksInfo.movingDomBlocks),
                    i.id == this.movingBlocksInfo.lastNewLine.id && (u = this.movingBlocksInfo.movingDomBlocks));
                    var l = this.getLineSelected(o)
                      , c = this.getEditClss();
                    n.push(s.default.createElement(c, {
                        isTextMode: this.props.isTextMode,
                        isFirstMathModeLevel: this.props.isFirstMathModeLevel,
                        allowTag: this.props.allowTag,
                        isFirstLine: this.props.rootLevel ? void 0 : 0 == o,
                        isLastLine: this.props.rootLevel ? void 0 : o == r - 1,
                        stripInfo: this.props.stripInfo,
                        fontSize: this.getFontSize(),
                        fracLevel: this.props.fracLevel,
                        lineInfo: t.lineInfo,
                        keepRemovedBlocks: a,
                        movingBlocks: u,
                        key: i.id,
                        line: i,
                        lineIndex: o,
                        noSpacingRule: this.props.noSpacingRule,
                        renderAsPlainText: this.props.renderAsPlainText,
                        rootLevel: this.props.rootLevel,
                        selected: l,
                        displayMode: this.props.displayMode,
                        onChildDataChanged: this.onChildDataChanged.bind(this, o),
                        onDataChanged: this.onDataChanged.bind(this, o),
                        onChildSelectedChanged: this.onChildSelectedChanged.bind(this, o)
                    }))
                }
                return n
            }
        }, {
            key: "getKeyName",
            value: function() {
                return this.props.keyName
            }
        }, {
            key: "isEditorEmpty",
            value: function() {
                return 1 == this.props.data.lines.length && 0 == this.props.data.lines[0].blocks.length
            }
        }, {
            key: "getFontSize",
            value: function() {
                return this.props.fontSize
            }
        }, {
            key: "renderAreaBaseLine",
            value: function() {
                if (!this.props.isTextMode && !this.props.noAreaContainer && !this.isOneLineEditor())
                    return s.default.createElement("area-baseline", null, "a")
            }
        }, {
            key: "isOneLineEditor",
            value: function() {
                return 1 == this.props.data.lines.length
            }
        }, {
            key: "isOptmizeForOneLine",
            value: function() {
                return this.props.optimizeForOneLine && this.isOneLineEditor()
            }
        }, {
            key: "renderLinesContainer",
            value: function() {
                return this.props.isTextMode || this.props.noAreaContainer || this.isOptmizeForOneLine() ? this.renderLines(this.props.data.lines) : s.default.createElement("area-container", null, this.renderLines(this.props.data.lines))
            }
        }, {
            key: "onTagInfoChanged",
            value: function(e, t) {
                this.props.onDataChanged(p.default.setProp(this.props.data, "tagInfo", e), t)
            }
        }, {
            key: "renderTag",
            value: function() {
                if (this.props.allowEditorTag)
                    return s.default.createElement(_.default, {
                        onTagInfoChanged: this.onTagInfoChanged,
                        tagInfo: this.props.data.tagInfo
                    })
            }
        }, {
            key: "render",
            value: function() {
                var e = this
                  , t = this.props.className;
                return t = t || "",
                (this.props.showBorder || this.props.borderIfEmpty && this.isEditorEmpty()) && (t += " selected"),
                (this.props.noAreaContainer || this.isOptmizeForOneLine()) && (t += " no-area-container"),
                this.props.highZOrderIndexOfEmpty && this.isEditorEmpty() && (t += " high-order"),
                this.props.isTextMode && (t += " text-mode"),
                s.default.createElement("editarea", {
                    ref: function(t) {
                        t && (e.editor = t,
                        t.reactInstance = e)
                    },
                    className: t,
                    style: this.props.style
                }, this.renderAreaBaseLine(), this.renderLinesContainer(), this.renderTag())
            }
        }]),
        t
    }(s.default.Component);
    A.contextTypes = {
        notifyLineTagRender: s.default.PropTypes.any
    },
    t.default = A
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var i = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , a = n(1003)
      , u = r(a)
      , l = n(1020)
      , s = r(l)
      , c = n(1)
      , f = r(c)
      , d = n(4)
      , p = r(d)
      , h = n(1022)
      , y = n(1023)
      , m = y.intersect
      , v = y.shape;
    m.plugin(n(1029)),
    t.default = new (function() {
        function e() {
            o(this, e)
        }
        return i(e, [{
            key: "snapLinePoint",
            value: function(e, t) {
                var n = this.angleFrom2Points360(e.x, e.y, t.x, t.y)
                  , r = this.nearToNumer(n, 45);
                return this.pointRotate({
                    x: e.x + this.distance2Points(e, t),
                    y: e.y
                }, e, r)
            }
        }, {
            key: "snapToGridSize",
            value: function(e, t, n) {
                return n = n || 10,
                {
                    x: this.nearToNumer(e.x, t, n),
                    y: this.nearToNumer(e.y, t, n)
                }
            }
        }, {
            key: "nearToNumer",
            value: function(e, t, n) {
                var r = Math.round(e / t) * t;
                return void 0 !== n && Math.abs(r - e) > n ? e : r
            }
        }, {
            key: "addNewPointToPoints",
            value: function(e, t) {
                t = void 0 === t ? e.length - 1 : t;
                var n = (f.default.last(e),
                e[t]);
                return p.default.insert(e, t + 1, {
                    x: n.x + 50,
                    y: n.y + 50
                })
            }
        }, {
            key: "removePointFromPoints",
            value: function(e, t) {
                return p.default.remove(e, t)
            }
        }, {
            key: "addNewBeizer",
            value: function(e, t, n, r) {
                if ((n = r ? void 0 === n ? e.length - 1 : n : void 0 === n ? e.length : n) > e.length - 1) {
                    var o = e[e.length - 1]
                      , i = {
                        p1: o.p2,
                        p2: this.addPoint(o.p2, {
                            x: 50,
                            y: 10
                        }),
                        cp: {
                            dx: 25,
                            dy: -25
                        },
                        cp2: {
                            dx: -25,
                            dy: 25
                        }
                    };
                    return c = p.default.insert(e, n + 1, i),
                    t ? this.smoothBeziers(c) : c
                }
                var o = e[n]
                  , a = this.toAbsoluteControlPointCubic(o)
                  , u = this.splitBezier(a, .5)
                  , l = this.toRelativeControlPointCubic(u[0])
                  , s = this.toRelativeControlPointCubic(u[1])
                  , c = p.default.setIndex(e, n, l);
                return c = p.default.insert(c, n + 1, s),
                t ? this.smoothBeziers(c) : c
            }
        }, {
            key: "removeBezier",
            value: function(e, t, n) {
                return 0 == t ? e = p.default.remove(e, t) : t > e.length - 1 ? e = p.default.remove(e, t - 1) : (e = p.default.setIndex(e, t - 1, {
                    p1: e[t - 1].p1,
                    p2: e[t].p2,
                    cp: e[t - 1].cp,
                    cp2: e[t - 1].cp2
                }),
                e = p.default.remove(e, t)),
                n ? this.smoothBeziers(e) : e
            }
        }, {
            key: "removeBezierClosed",
            value: function(e, t, n) {
                var r = this.previousIndexLoop(t, e.length);
                return e = p.default.setIndex(e, r, {
                    p1: e[r].p1,
                    p2: e[t].p2,
                    cp: e[r].cp,
                    cp2: e[r].cp2
                }),
                e = p.default.remove(e, t),
                n ? this.smoothBeziers(e, !0) : e
            }
        }, {
            key: "closePointFromPath",
            value: function(e, t) {
                if (this.isLineData(e))
                    var n = new s.default(e.p1,e.p2,e.p1,e.p2);
                else if (this.isCubicBezierData(e))
                    var n = new s.default(e.p1,e.cp,e.cp2,e.p2);
                else
                    var n = new s.default(e.p1,e.cp,e.p2);
                return n.project(t)
            }
        }, {
            key: "insertBreakForPaths",
            value: function(e, t, n, r) {
                var o = this
                  , i = f.default.sumBy(e, function(e) {
                    return e.length || o.pathLength(e)
                })
                  , a = i * n
                  , u = this.round2(Math.max(0, a - t / 2))
                  , l = this.round2(Math.min(i, a + t / 2))
                  , s = []
                  , c = 0;
                r = r || "distance";
                for (var d = 0; d < e.length; d++) {
                    var p = e[d]
                      , h = p.length || this.pathLength(p);
                    if (c + h <= u)
                        s.push(p);
                    else if (c < u && u < c + h) {
                        if (this.isLineData(p) || "distance" != r)
                            var y = (u - c) / h;
                        else
                            var y = this.bezierRatioFromDistance(p, u - c);
                        s.push(this.splitPath(p, y)[0])
                    }
                    if (c >= l)
                        s.push(p);
                    else if (c < l && l < c + h) {
                        if (this.isLineData(p) || "distance" != r)
                            var y = (l - c) / h;
                        else
                            var y = this.bezierRatioFromDistance(p, l - c);
                        s.push(this.splitPath(p, y)[1])
                    }
                    c += h
                }
                return s
            }
        }, {
            key: "jointParallelLines",
            value: function(e, t) {
                if (e.length <= 1)
                    return {
                        lines1: e,
                        lines2: t
                    };
                for (var n = 0, r = 0, o = [e[0]], i = [t[0]], a = 0; a < e.length - 1; a++) {
                    var u = o[n]
                      , l = i[r]
                      , s = e[a + 1]
                      , c = t[a + 1]
                      , f = this.jointNextLine(u, s)
                      , d = this.jointNextLine(l, c);
                    f.parallel || d.parallel ? (o.push(s),
                    i.push(c)) : (o[n] = f.line,
                    f.middleLine && (n++,
                    o.push(f.middleLine)),
                    o.push(f.nextLine),
                    i[r] = d.line,
                    d.middleLine && (r++,
                    i.push(d.middleLine)),
                    i.push(d.nextLine)),
                    n++,
                    r++
                }
                return {
                    lines1: o,
                    lines2: i
                }
            }
        }, {
            key: "jointNextLine",
            value: function(e, t) {
                var n = null
                  , r = this.lineToFSegment(e)
                  , o = this.lineToFSegment(t)
                  , i = r.intersect(o);
                if (i.length > 0) {
                    var a = {
                        p1: e.p1,
                        p2: i[0],
                        original: e.original || e,
                        startPointScale: e.startPointScale
                    }
                      , u = {
                        p1: i[0],
                        p2: t.p2,
                        original: t.original || t,
                        startPointScale: "reduce"
                    };
                    return {
                        parallel: !1,
                        line: a,
                        nextLine: u,
                        middleLine: n
                    }
                }
                var l = this.lineToFLine(e)
                  , s = this.lineToFLine(t)
                  , i = l.intersect(s);
                if (0 == i.length)
                    return {
                        parallel: !0,
                        line: e,
                        nextLine: t,
                        middleLine: n
                    };
                var c = this.angleDifferentFrom3Points180(e.p1, t.p2, i[0]);
                if (180 == Number.parseInt(c))
                    return {
                        parallel: !0,
                        line: e,
                        nextLine: t,
                        middleLine: n
                    };
                if (c < 90)
                    return n = {
                        p1: e.p2,
                        p2: t.p1
                    },
                    {
                        parallel: !1,
                        line: e,
                        nextLine: t,
                        middleLine: n
                    };
                var a = {
                    p1: e.p1,
                    p2: i[0],
                    original: e.original || e,
                    startPointScale: e.startPointScale
                }
                  , u = {
                    p1: i[0],
                    p2: t.p2,
                    original: t.original || t,
                    startPointScale: "extend"
                };
                return {
                    parallel: !1,
                    line: a,
                    nextLine: u,
                    middleLine: n
                }
            }
        }, {
            key: "lineToFSegment",
            value: function(e) {
                return new u.default.Segment(this.toFlattenPoint(e.p1),this.toFlattenPoint(e.p2))
            }
        }, {
            key: "lineToFLine",
            value: function(e) {
                return new u.default.Line(this.toFlattenPoint(e.p1),this.toFlattenPoint(e.p2))
            }
        }, {
            key: "isQuadraticBezierPath",
            value: function(e) {
                return null != e.cp && null == e.cp2
            }
        }, {
            key: "pointInsidePolygonLines",
            value: function(e, t) {
                for (var n = e.x, r = e.y, o = !1, i = 0, a = t.length - 1; i < t.length; a = i++) {
                    var u = t[i].p1.x
                      , l = t[i].p1.y
                      , s = t[a].p1.x
                      , c = t[a].p1.y;
                    l > r != c > r && n < (s - u) * (r - l) / (c - l) + u && (o = !o)
                }
                return o
            }
        }, {
            key: "pointInsidePolygon",
            value: function(e, t) {
                for (var n = e.x, r = e.y, o = !1, i = 0, a = t.length - 1; i < t.length; a = i++) {
                    var u = t[i].x
                      , l = t[i].y
                      , s = t[a].x
                      , c = t[a].y;
                    l > r != c > r && n < (s - u) * (r - l) / (c - l) + u && (o = !o)
                }
                return o
            }
        }, {
            key: "quadraticToCubic",
            value: function(e) {
                var t = e.p1
                  , n = e.cp
                  , r = e.p2;
                return {
                    p1: t,
                    cp: {
                        x: t.x + 2 / 3 * (n.x - t.x),
                        y: t.y + 2 / 3 * (n.y - t.y)
                    },
                    cp2: {
                        x: r.x + 2 / 3 * (n.x - r.x),
                        y: r.y + 2 / 3 * (n.y - r.y)
                    },
                    p2: r
                }
            }
        }, {
            key: "getCenterPoint",
            value: function(e, t) {
                if (e.p1)
                    var n = e.p1
                      , r = e.p2;
                else
                    var n = e
                      , r = t;
                return {
                    x: (n.x + r.x) / 2,
                    y: (n.y + r.y) / 2
                }
            }
        }, {
            key: "splitBezierByLine",
            value: function(e, t) {
                var n = new s.default(e.p1,e.cp,e.cp2,e.p2)
                  , r = n.intersects(t);
                if (0 == r.length)
                    return [];
                if (1 == r.length) {
                    var o = n.split(r[0]);
                    return [this.pointsToCubicBezier(o.left.points), this.pointsToCubicBezier(o.right.points)]
                }
                throw new Error("not supported")
            }
        }, {
            key: "splitBezier",
            value: function(e, t) {
                var n = new s.default(e.p1,e.cp,e.cp2,e.p2)
                  , r = n.split(t);
                return [this.pointsToCubicBezier(r.left.points), this.pointsToCubicBezier(r.right.points)]
            }
        }, {
            key: "splitBezierByLineGetFirstPart",
            value: function(e, t) {
                var n = new s.default(e.p1,e.cp,e.cp2,e.p2)
                  , r = n.intersects(t);
                if (r.length > 0) {
                    return this.pointsToCubicBezier(n.split(r[0]).left.points)
                }
                return null
            }
        }, {
            key: "splitBezierByVerticalLines",
            value: function(e, t, n) {
                var r = new s.default(e.p1,e.cp,e.cp2,e.p2)
                  , o = r.intersects(t)
                  , i = r.intersects(n);
                if (o.length <= 0 && i.length <= 0)
                    return e;
                if (o.length > 0 && i.length > 0 && (r = r.split(o[0], i[0])),
                o.length <= 0) {
                    var a = r.split(i[0]);
                    r = a.left
                }
                if (i.length <= 0) {
                    var a = r.split(o[0]);
                    r = a.right
                }
                return this.pointsToCubicBezier(r.points)
            }
        }, {
            key: "pointsToCubicBezier",
            value: function(e) {
                return {
                    p1: e[0],
                    cp: e[1],
                    cp2: e[2],
                    p2: e[3]
                }
            }
        }, {
            key: "pointRotate",
            value: function(e, t, n) {
                if (!n)
                    return e;
                var r = this.toFlattenPoint(t);
                return this.toFlattenPoint(e).rotate(this.toRadians(n), r)
            }
        }, {
            key: "bezierRotate",
            value: function(e, t, n) {
                return {
                    p1: this.pointRotate(e.p1, t, n),
                    cp: this.pointRotate(e.cp, t, n),
                    cp2: this.pointRotate(e.cp2, t, n),
                    p2: this.pointRotate(e.p2, t, n)
                }
            }
        }, {
            key: "quadraticBezierRotate",
            value: function(e, t, n) {
                return {
                    p1: this.pointRotate(e.p1, t, n),
                    cp: this.pointRotate(e.cp, t, n),
                    p2: this.pointRotate(e.p2, t, n)
                }
            }
        }, {
            key: "lineRotate",
            value: function(e, t, n) {
                return {
                    p1: this.pointRotate(e.p1, t, n),
                    p2: this.pointRotate(e.p2, t, n)
                }
            }
        }, {
            key: "transformCubicBezier",
            value: function(e, t, n, r, o) {
                var i = e.p1
                  , a = e.cp
                  , u = e.cp2
                  , l = e.p2;
                return t = t || 1,
                n = n || 1,
                r = r || 0,
                o = o || 0,
                {
                    p1: {
                        x: i.x * t + r,
                        y: i.y * n + o
                    },
                    cp: {
                        x: a.x * t + r,
                        y: a.y * n + o
                    },
                    cp2: {
                        x: u.x * t + r,
                        y: u.y * n + o
                    },
                    p2: {
                        x: l.x * t + r,
                        y: l.y * n + o
                    }
                }
            }
        }, {
            key: "keepPointInRect",
            value: function(e, t) {
                return {
                    x: Math.max(t.p1.x, Math.min(e.x, t.p2.x)),
                    y: Math.max(t.p1.y, Math.min(e.y, t.p2.y))
                }
            }
        }, {
            key: "keepBetween",
            value: function(e, t, n) {
                return Math.max(t, Math.min(e, n))
            }
        }, {
            key: "keepPointInX",
            value: function(e, t, n) {
                return {
                    x: Math.max(t, Math.min(e.x, n)),
                    y: e.y
                }
            }
        }, {
            key: "keepPointInY",
            value: function(e, t, n) {
                return {
                    x: e.x,
                    y: Math.max(t, Math.min(e.y, n))
                }
            }
        }, {
            key: "pointInsideRect",
            value: function(e, t) {
                return t = this.normalizePointTupple(t),
                e.x >= t.p1.x && e.x <= t.p2.x && e.y >= t.p1.y && e.y <= t.p2.y
            }
        }, {
            key: "segmentsFromPoints",
            value: function(e) {
                for (var t = [], n = 0; n < e.length - 1; n++)
                    t.push({
                        p1: e[n],
                        p2: e[n + 1]
                    });
                return t
            }
        }, {
            key: "normalizePointTupple",
            value: function(e) {
                return {
                    p1: {
                        x: Math.min(e.p1.x, e.p2.x),
                        y: Math.min(e.p1.y, e.p2.y)
                    },
                    p2: {
                        x: Math.max(e.p1.x, e.p2.x),
                        y: Math.max(e.p1.y, e.p2.y)
                    }
                }
            }
        }, {
            key: "getClientRect",
            value: function(e) {
                var t = this.normalizePointTupple(e)
                  , n = t.p1
                  , r = t.p2
                  , o = Math.abs(r.x - n.x)
                  , i = Math.abs(r.y - n.y);
                return {
                    left: n.x,
                    top: n.y,
                    width: o,
                    height: i,
                    bottom: n.y + i,
                    right: n.x + o
                }
            }
        }, {
            key: "getPointsRect",
            value: function(e) {
                var e = this.normalizePointTupple(e);
                return [e.p1, {
                    x: e.p2.x,
                    y: e.p1.y
                }, e.p2, {
                    x: e.p1.x,
                    y: e.p2.y
                }, e.p1]
            }
        }, {
            key: "getPointsFromPointTupple",
            value: function(e) {
                return [e.p1, {
                    x: e.p2.x,
                    y: e.p1.y
                }, e.p2, {
                    x: e.p1.x,
                    y: e.p2.y
                }]
            }
        }, {
            key: "getLeftTopArc",
            value: function(e, t, n) {
                var r = e.x
                  , o = e.y
                  , i = .5522848 * t
                  , a = .5522848 * n;
                return {
                    p1: {
                        x: r - t,
                        y: o
                    },
                    p2: {
                        x: r,
                        y: o - n
                    },
                    cp: {
                        x: r - t,
                        y: o - a
                    },
                    cp2: {
                        x: r - i,
                        y: o - n
                    }
                }
            }
        }, {
            key: "getRightTopArc",
            value: function(e, t, n) {
                var r = e.x
                  , o = e.y
                  , i = .5522848 * t
                  , a = .5522848 * n
                  , u = r + t;
                return {
                    p1: {
                        x: r,
                        y: o - n
                    },
                    p2: {
                        x: u,
                        y: o
                    },
                    cp: {
                        x: r + i,
                        y: o - n
                    },
                    cp2: {
                        x: u,
                        y: o - a
                    }
                }
            }
        }, {
            key: "getRightBottomArc",
            value: function(e, t, n) {
                var r = e.x
                  , o = e.y
                  , i = .5522848 * t
                  , a = .5522848 * n
                  , u = r + t
                  , l = o + n;
                return {
                    p1: {
                        x: u,
                        y: o
                    },
                    p2: {
                        x: r,
                        y: l
                    },
                    cp: {
                        x: u,
                        y: o + a
                    },
                    cp2: {
                        x: r + i,
                        y: l
                    }
                }
            }
        }, {
            key: "getLeftBottomArc",
            value: function(e, t, n) {
                var r = e.x
                  , o = e.y
                  , i = .5522848 * t
                  , a = .5522848 * n
                  , u = o + n;
                return {
                    p1: {
                        x: r,
                        y: u
                    },
                    p2: {
                        x: r - t,
                        y: o
                    },
                    cp: {
                        x: r - i,
                        y: u
                    },
                    cp2: {
                        x: r - t,
                        y: o + a
                    }
                }
            }
        }, {
            key: "ellipseToCubicBeziers",
            value: function(e, t) {
                var n = Math.abs(t.x - e.x)
                  , r = Math.abs(t.y - e.y)
                  , o = n / 2
                  , i = r / 2
                  , a = e.x + n / 2
                  , u = e.y + r / 2
                  , l = .5522848 * o
                  , s = .5522848 * i
                  , c = a + o
                  , f = u + i;
                return [{
                    p1: {
                        x: a - o,
                        y: u
                    },
                    p2: {
                        x: a,
                        y: u - i
                    },
                    cp: {
                        x: a - o,
                        y: u - s
                    },
                    cp2: {
                        x: a - l,
                        y: u - i
                    }
                }, {
                    p1: {
                        x: a,
                        y: u - i
                    },
                    p2: {
                        x: c,
                        y: u
                    },
                    cp: {
                        x: a + l,
                        y: u - i
                    },
                    cp2: {
                        x: c,
                        y: u - s
                    }
                }, {
                    p1: {
                        x: c,
                        y: u
                    },
                    p2: {
                        x: a,
                        y: f
                    },
                    cp: {
                        x: c,
                        y: u + s
                    },
                    cp2: {
                        x: a + l,
                        y: f
                    }
                }, {
                    p1: {
                        x: a,
                        y: f
                    },
                    p2: {
                        x: a - o,
                        y: u
                    },
                    cp: {
                        x: a - l,
                        y: f
                    },
                    cp2: {
                        x: a - o,
                        y: u + s
                    }
                }]
            }
        }, {
            key: "smoothBeziers",
            value: function(e, t) {
                for (var n = [], r = 0; r < e.length; r++)
                    if (0 != r || t) {
                        var o = e[r]
                          , i = this.toAbsoluteControlPointCubic(o)
                          , a = e[this.previousIndexLoop(r, e.length)]
                          , u = this.toAbsoluteControlPointCubic(a);
                        i.cp = this.reflectPoint(u.cp2, o.p1),
                        n.push(this.toRelativeControlPointCubic(i))
                    } else
                        n.push(e[r]);
                return n
            }
        }, {
            key: "previousIndexLoop",
            value: function(e, t) {
                return e <= 0 ? t - 1 : e - 1
            }
        }, {
            key: "nextIndexLoop",
            value: function(e, t) {
                return e >= t - 1 ? 0 : e + 1
            }
        }, {
            key: "smoothBeziersFromCurrentPoint",
            value: function(e, t) {
                for (var n = [], r = 0; r < e.length; r++)
                    if (r != e.length - 1 || t) {
                        var o = e[r]
                          , i = this.toAbsoluteControlPointCubic(o)
                          , a = e[this.nextIndexLoop(r, e.length)]
                          , u = this.toAbsoluteControlPointCubic(a);
                        i.cp2 = this.reflectPoint(u.cp, a.p1),
                        n.push(this.toRelativeControlPointCubic(i))
                    } else
                        n.push(e[e.length - 1]);
                return n
            }
        }, {
            key: "reflectPoint",
            value: function(e, t) {
                var n = new u.default.Point(e.x,e.y);
                return n = n.rotate(Math.PI, new u.default.Point(t.x,t.y)),
                {
                    x: n.x,
                    y: n.y
                }
            }
        }, {
            key: "moveCubicBeizerPoint",
            value: function(e, t, n, r) {
                if (0 == t && !r)
                    return p.default.setIndex(e, t, {
                        p1: n,
                        p2: e[0].p2,
                        cp: e[0].cp,
                        cp2: e[0].cp2
                    });
                if (t >= e.length && !r)
                    return t = e.length - 1,
                    p.default.setIndex(e, t, {
                        p1: e[t].p1,
                        p2: n,
                        cp: e[t].cp,
                        cp2: e[t].cp2
                    });
                var o = {
                    p1: n,
                    p2: e[t].p2,
                    cp: e[t].cp,
                    cp2: e[t].cp2
                }
                  , i = this.previousIndexLoop(t, e.length)
                  , a = {
                    p1: e[i].p1,
                    p2: n,
                    cp: e[i].cp,
                    cp2: e[i].cp2
                }
                  , u = p.default.setIndex(e, t, o);
                return p.default.setIndex(u, i, a)
            }
        }, {
            key: "addPoint",
            value: function(e, t) {
                return {
                    x: e.x + t.x,
                    y: e.y + t.y
                }
            }
        }, {
            key: "substractPoint",
            value: function(e, t) {
                return {
                    x: e.x - t.x,
                    y: e.y - t.y
                }
            }
        }, {
            key: "distance2Points",
            value: function(e, t) {
                var n = e.x - t.x
                  , r = e.y - t.y;
                return Math.sqrt(n * n + r * r)
            }
        }, {
            key: "quadraticBezierLength",
            value: function(e) {
                return new s.default(e.p1,e.cp,e.p2).length()
            }
        }, {
            key: "cubicBezierLength",
            value: function(e) {
                return new s.default(e.p1,e.cp,e.cp2,e.p2).length()
            }
        }, {
            key: "getMiddlePointLine",
            value: function(e, t, n, r) {
                var o = {
                    dx: 0,
                    dy: 0
                };
                if (r) {
                    var o = this.calcTranslationExact(r, e, t);
                    e = this.addToPoint(e, o),
                    t = this.addToPoint(t, o)
                }
                return {
                    x: e.x + (t.x - e.x) * n,
                    y: e.y + (t.y - e.y) * n
                }
            }
        }, {
            key: "pointEquals",
            value: function(e, t) {
                return e.x == t.x && e.y == t.y
            }
        }, {
            key: "splitPath",
            value: function(e, t) {
                if (this.isLineData(e)) {
                    var n = this.distance2Points(e.p1, e.p2) * t
                      , r = this.pointAtDistance(e.p1, e.p2, n);
                    return [{
                        p1: e.p1,
                        p2: r
                    }, {
                        p1: r,
                        p2: e.p2
                    }]
                }
                if (this.isQuadraticBezierData(e) && (e = this.quadraticToCubic(e)),
                this.isCubicBezierData(e))
                    return this.splitBezier(e, t)
            }
        }, {
            key: "pathLength",
            value: function(e) {
                return this.isLineData(e) ? this.distance2Points(e.p1, e.p2) : this.isCubicBezierData(e) ? this.cubicBezierLength(e) : this.isQuadraticBezierData(e) ? this.quadraticBezierLength(e) : void 0
            }
        }, {
            key: "isLineData",
            value: function(e) {
                return e.p1 && e.p2 && !e.cp
            }
        }, {
            key: "isEllipseData",
            value: function(e) {
                return e.rx && e.ry
            }
        }, {
            key: "isCubicBezierData",
            value: function(e) {
                return e.cp && e.cp2
            }
        }, {
            key: "isQuadraticBezierData",
            value: function(e) {
                return e.cp && !e.cp2
            }
        }, {
            key: "pointAtDistance",
            value: function(e, t, n, r) {
                if (r = r || 0) {
                    var o = this.calcTranslationExact(r, e, t);
                    e = this.addToPoint(e, o),
                    t = this.addToPoint(t, o)
                }
                var i = this.distance2Points(e, t)
                  , a = n / i;
                return {
                    x: (1 - a) * e.x + a * t.x,
                    y: (1 - a) * e.y + a * t.y
                }
            }
        }, {
            key: "pointAtDistanceFromSecondPoint",
            value: function(e, t, n, r) {
                return this.pointAtDistance(e, t, this.distance2Points(e, t) - n, r)
            }
        }, {
            key: "pointAtDistanceQuadratic",
            value: function(e, t, n) {
                return this.pointAtDistanceCubic(this.quadraticToCubic(e), t, n)
            }
        }, {
            key: "pointAtDistanceCubic",
            value: function(e, t, n) {
                if (n = n || 0,
                t <= 0) {
                    var r = new s.default(e.p1,e.cp,e.cp2,e.p2);
                    return r.offset(t / r.length(), -n)
                }
                var r = new s.default(e.p1,e.cp,e.cp2,e.p2);
                return t >= r.length() ? r.offset(t / r.length(), -n) : r.offset(jsBezier.locationAlongCurveFrom([e.p2, e.cp2, e.cp, e.p1], 0, t), -n)
            }
        }, {
            key: "ratioFromDistance",
            value: function(e, t, n) {
                return this.isLineData(e) ? (n = n || this.distance2Points(e.p1, e.p2),
                t / n) : this.bezierRatioFromDistance(e, t, n)
            }
        }, {
            key: "bezierRatioFromDistance",
            value: function(e, t, n) {
                return this.isCubicBezierData(e) ? jsBezier.locationAlongCurveFrom([e.p2, e.cp2, e.cp, e.p1], 0, t) : jsBezier.locationAlongCurveFrom([e.p2, e.cp, e.p1], 0, t)
            }
        }, {
            key: "pointAtDistanceFromSecondPointCubic",
            value: function(e, t, n) {
                return this.pointAtDistanceCubic(e, this.cubicBezierLength(e) - t, n)
            }
        }, {
            key: "angleFrom2Points",
            value: function(e, t, n, r) {
                var o = r - t
                  , i = n - e
                  , a = Math.atan2(o, i);
                return a *= 180 / Math.PI
            }
        }, {
            key: "angleFrom2Points360",
            value: function(e, t, n, r) {
                var o = this.angleFrom2Points(e, t, n, r);
                return o < 0 && (o = 360 + o),
                this.round2(o)
            }
        }, {
            key: "angleEndPointOfQuadraticLine360",
            value: function(e, t, n) {
                var r = new s.default(e,t,n)
                  , o = r.derivative(1)
                  , i = 180 * Math.atan2(o.y, o.x) / Math.PI;
                return i < 0 && (i = 360 + i),
                this.round2(i)
            }
        }, {
            key: "angleStartPointOfQuadraticLine360",
            value: function(e, t, n) {
                var r = new s.default(e,t,n)
                  , o = r.derivative(0)
                  , i = 180 * Math.atan2(o.y, o.x) / Math.PI;
                return i < 0 && (i = 360 + i),
                this.round2(i)
            }
        }, {
            key: "angleEndPointOfCubicLine360",
            value: function(e) {
                var t = new s.default(e.p1,e.cp,e.cp2,e.p2)
                  , n = t.derivative(1)
                  , r = 180 * Math.atan2(n.y, n.x) / Math.PI;
                return r < 0 && (r = 360 + r),
                this.round2(r)
            }
        }, {
            key: "angleStartPointOfCubicLine360",
            value: function(e) {
                var t = new s.default(e.p1,e.cp,e.cp2,e.p2)
                  , n = t.derivative(0)
                  , r = 180 * Math.atan2(n.y, n.x) / Math.PI;
                return r < 0 && (r = 360 + r),
                this.round2(r)
            }
        }, {
            key: "round2",
            value: function(e) {
                return Math.round(100 * e) / 100
            }
        }, {
            key: "toRadians",
            value: function(e) {
                return e * (Math.PI / 180)
            }
        }, {
            key: "angleFrom3Points360",
            value: function(e, t, n) {
                var r = this.angleFrom2Points360(n.x, n.y, e.x, e.y);
                r = 0 == r ? 360 : r;
                var o = this.angleFrom2Points360(n.x, n.y, t.x, t.y);
                o = 0 == o ? 360 : o;
                var i = o - r;
                return i < 0 && (i = 360 + i),
                i
            }
        }, {
            key: "angleDifferentFrom3Points180",
            value: function(e, t, n) {
                var r = this.angleFrom3Points360(e, t, n);
                return r > 180 && (r = 360 - r),
                r
            }
        }, {
            key: "parallelLine",
            value: function(e, t, n) {
                var r = this.calcTranslationExact(n, e, t);
                return {
                    p1: this.addToPoint(e, r),
                    p2: this.addToPoint(t, r)
                }
            }
        }, {
            key: "toRelativeControlPointCubic",
            value: function(e) {
                return p.default.update(e, {
                    cp: {
                        dx: e.cp.x - e.p1.x,
                        dy: e.cp.y - e.p1.y
                    },
                    cp2: {
                        dx: e.cp2.x - e.p2.x,
                        dy: e.cp2.y - e.p2.y
                    }
                })
            }
        }, {
            key: "toAbsoluteControlPointCubic",
            value: function(e) {
                return p.default.update(e, {
                    cp: {
                        x: e.cp.dx + e.p1.x,
                        y: e.cp.dy + e.p1.y
                    },
                    cp2: {
                        x: e.cp2.dx + e.p2.x,
                        y: e.cp2.dy + e.p2.y
                    }
                })
            }
        }, {
            key: "toAbsoluteControlPointCubics",
            value: function(e) {
                var t = this;
                return f.default.map(e, function(e) {
                    return t.toAbsoluteControlPointCubic(e)
                })
            }
        }, {
            key: "setAbsoluteCpForBezier",
            value: function(e, t, n) {
                return t && (e = p.default.setProp(e, "cp", {
                    dx: t.x - e.p1.x,
                    dy: t.y - e.p1.y
                })),
                n && (e = p.default.setProp(e, "cp2", {
                    dx: n.x - e.p2.x,
                    dy: n.y - e.p2.y
                })),
                e
            }
        }, {
            key: "toRelativeControlPoint",
            value: function(e, t, n) {
                var r = this.angleFrom3Points360(e, n, t)
                  , o = this.distance2Points(t, e)
                  , i = this.distance2Points(t, n);
                return {
                    dh: Math.sin(this.toRadians(r)) * o,
                    df: Math.cos(this.toRadians(r)) * o / i
                }
            }
        }, {
            key: "toAbsoluteConnectionControlPoint",
            value: function(e, t, n) {
                var r = e.df * this.distance2Points(t, n)
                  , o = Math.sqrt(e.dh * e.dh + r * r)
                  , i = this.angleFrom2Points360(t.x, t.y, n.x, n.y)
                  , a = Math.atan2(e.dh, r)
                  , u = this.toRadians(i) - a
                  , l = +(t.x + Math.cos(u) * o).toFixed(5)
                  , s = +(t.y + Math.sin(u) * o).toFixed(5);
                return {
                    x: this.round2(l),
                    y: this.round2(s)
                }
            }
        }, {
            key: "parallelCubicBezier",
            value: function(e, t) {
                var n = new s.default(e.p1,e.cp,e.cp2,e.p2).offset(-t);
                return f.default.map(n, function(e) {
                    return {
                        p1: e.points[0],
                        cp: e.points[1],
                        cp2: e.points[2],
                        p2: e.points[3]
                    }
                })
            }
        }, {
            key: "roundPoint",
            value: function(e) {
                return {
                    x: this.round2(e.x),
                    y: this.round2(e.y)
                }
            }
        }, {
            key: "roundLine",
            value: function(e) {
                return {
                    p1: this.roundPoint(e.p1),
                    p2: this.roundPoint(e.p2)
                }
            }
        }, {
            key: "roundQuadraticBezier",
            value: function(e) {
                return {
                    p1: this.roundPoint(e.p1),
                    cp: this.roundPoint(e.cp),
                    p2: this.roundPoint(e.p2)
                }
            }
        }, {
            key: "roundCubicBezier",
            value: function(e) {
                return {
                    p1: this.roundPoint(e.p1),
                    cp: this.roundPoint(e.cp),
                    cp2: this.roundPoint(e.cp2),
                    p2: this.roundPoint(e.p2)
                }
            }
        }, {
            key: "roundPath",
            value: function(e) {
                var t = {
                    p1: this.roundPoint(e.p1),
                    p2: this.roundPoint(e.p2)
                };
                return e.cp && (t.cp = this.roundPoint(e.cp)),
                e.cp2 && (t.cp2 = this.roundPoint(e.cp2)),
                t
            }
        }, {
            key: "addToPoint",
            value: function(e, t) {
                return {
                    x: e.x + t.dx,
                    y: e.y + t.dy
                }
            }
        }, {
            key: "calcTranslationExact",
            value: function(e, t, n) {
                var r, o, i = n.x - t.x, a = n.y - t.y;
                if (0 === a)
                    t.x < n.x ? (r = 0,
                    o = -e) : (r = 0,
                    o = e);
                else if (t.x == n.x && t.y < n.y)
                    r = e,
                    o = 0;
                else if (t.y < n.y && t.x < n.x) {
                    var u = Math.atan(i / a);
                    r = e * Math.cos(u),
                    o = -e * Math.sin(u)
                } else if (t.y < n.y && t.x > n.x) {
                    var l = Math.atan(i / a);
                    r = e * Math.cos(l),
                    o = -e * Math.sin(l)
                } else {
                    var s = Math.atan(i / a);
                    r = -e * Math.cos(s),
                    o = e * Math.sin(s)
                }
                return {
                    dx: r,
                    dy: o
                }
            }
        }, {
            key: "getSegmentsFromRect",
            value: function(e) {
                var t = [new u.default.Point(e.left,e.top), new u.default.Point(e.right,e.top), new u.default.Point(e.right,e.bottom), new u.default.Point(e.left,e.bottom)];
                return [new u.default.Segment(t[0],t[1]), new u.default.Segment(t[1],t[2]), new u.default.Segment(t[2],t[3]), new u.default.Segment(t[3],t[0])]
            }
        }, {
            key: "intersect2PointToRect",
            value: function(e, t, n) {
                return this.intersectSegmentToRect(this.getSegmentFromPoints(e, t), n)
            }
        }, {
            key: "intersectBezierLineToRect",
            value: function(e, t, n, r) {
                return m(v("path", {
                    d: "M" + e.x + "," + e.y + " Q" + n.x + "," + n.y + " " + t.x + "," + t.y + " "
                }), v("rect", {
                    x: r.left,
                    y: r.top,
                    width: r.width,
                    height: r.height
                })).points[0]
            }
        }, {
            key: "intersectLineToLine",
            value: function(e, t) {
                var n = h.Intersection.intersectLineLine(this.pointToPoint2D(e.p1), this.pointToPoint2D(e.p2), this.pointToPoint2D(t.p1), this.pointToPoint2D(t.p2));
                return n ? n.points : []
            }
        }, {
            key: "intersectLineToEllipse",
            value: function(e, t) {
                var n = h.Intersection.intersectEllipseLine(this.pointToPoint2D(t.cp), t.rx, t.ry, this.pointToPoint2D(e.p1), this.pointToPoint2D(e.p2));
                return n ? n.points : []
            }
        }, {
            key: "intersectBezierToEllipse",
            value: function(e, t) {
                var n = h.Intersection.intersectBezier3Ellipse(this.pointToPoint2D(e.p1), this.pointToPoint2D(e.cp), this.pointToPoint2D(e.cp2), this.pointToPoint2D(e.p2), this.pointToPoint2D(t.cp), t.rx, t.ry);
                return n ? n.points : []
            }
        }, {
            key: "intersectEllipseToEllipse",
            value: function(e, t) {
                var n = h.Intersection.intersectEllipseEllipse(this.pointToPoint2D(e.cp), e.rx, e.ry, this.pointToPoint2D(t.cp), t.rx, t.ry);
                return n ? n.points : []
            }
        }, {
            key: "intersectCubicBezierLineToLine",
            value: function(e, t) {
                var n = h.Intersection.intersectBezier3Line(this.pointToPoint2D(e.p1), this.pointToPoint2D(e.cp), this.pointToPoint2D(e.cp2), this.pointToPoint2D(e.p2), this.pointToPoint2D(t.p1), this.pointToPoint2D(t.p2));
                return n ? n.points : []
            }
        }, {
            key: "pointToPoint2D",
            value: function(e) {
                return new h.Point2D(e.x,e.y)
            }
        }, {
            key: "intersectCubicBezierLineToCubicBezier",
            value: function(e, t) {
                var n = h.Intersection.intersectBezier3Bezier3(this.pointToPoint2D(e.p1), this.pointToPoint2D(e.cp), this.pointToPoint2D(e.cp2), this.pointToPoint2D(e.p2), this.pointToPoint2D(t.p1), this.pointToPoint2D(t.cp), this.pointToPoint2D(t.cp2), this.pointToPoint2D(t.p2));
                return n ? n.points : []
            }
        }, {
            key: "intersectSegmentToRect",
            value: function(e, t) {
                for (var n = this.getSegmentsFromRect(t), r = 0; r < n.length; r++) {
                    var o = n[r]
                      , i = u.default.Segment.intersectSegment2Segment(e, o);
                    if (i && i.length > 0)
                        return i[0]
                }
            }
        }, {
            key: "findPointsIntercepting2PointsToRect",
            value: function(e, t, n) {
                return this.findPointsInterceptingSegmentToRect(this.getSegmentFromPoints(e, t), n)
            }
        }, {
            key: "findPointsInterceptingSegmentToRect",
            value: function(e, t) {
                for (var n = this.getSegmentsFromRect(t), r = [], o = 0; o < n.length; o++) {
                    var i = n[o]
                      , a = u.default.Segment.intersectSegment2Segment(e, i);
                    a && a.length > 0 && r.push(a[0])
                }
                return r
            }
        }, {
            key: "extendRect",
            value: function(e, t) {
                return {
                    left: e.left - t,
                    top: e.top - t,
                    width: e.width + 2 * t,
                    height: e.height + 2 * t,
                    right: e.right + t,
                    bottom: e.bottom + t
                }
            }
        }, {
            key: "extendRectDown",
            value: function(e, t) {
                return {
                    left: e.left,
                    top: e.top,
                    width: e.width,
                    height: e.height + t,
                    right: e.right,
                    bottom: e.bottom + t
                }
            }
        }, {
            key: "reflectPointOverLine",
            value: function(e, t, n) {
                var r, o, i, a, u, l;
                return r = n.x - t.x,
                o = n.y - t.y,
                i = (r * r - o * o) / (r * r + o * o),
                a = 2 * r * o / (r * r + o * o),
                u = Math.round(i * (e.x - t.x) + a * (e.y - t.y) + t.x),
                l = Math.round(a * (e.x - t.x) - i * (e.y - t.y) + t.y),
                {
                    x: u,
                    y: l
                }
            }
        }, {
            key: "getMiddlePointQuadraticLine",
            value: function(e, t, n, r, o) {
                return new s.default(e,t,n).offset(r, -o)
            }
        }, {
            key: "interceptLineToRectHorizontalLines",
            value: function(e, t, n) {
                var r = new u.default.Line(this.toFlattenPoint(e),this.toFlattenPoint(t))
                  , o = new u.default.Line(new u.default.Point(n.left,n.top),new u.default.Point(n.right,n.top))
                  , i = new u.default.Line(new u.default.Point(n.left,n.bottom),new u.default.Point(n.right,n.bottom));
                return {
                    p1: r.intersect(o)[0],
                    p2: r.intersect(i)[0]
                }
            }
        }, {
            key: "interceptLineToRectVerticlelLines",
            value: function(e, t, n) {
                var r = new u.default.Line(this.toFlattenPoint(e),this.toFlattenPoint(t))
                  , o = new u.default.Line(new u.default.Point(n.left,n.top),new u.default.Point(n.left,n.bottom))
                  , i = new u.default.Line(new u.default.Point(n.right,n.top),new u.default.Point(n.right,n.bottom));
                return {
                    p1: r.intersect(o)[0],
                    p2: r.intersect(i)[0]
                }
            }
        }, {
            key: "angleDxDY",
            value: function(e, t) {
                return Math.abs(e.x - t.x) / Math.abs(e.y - t.y)
            }
        }, {
            key: "angleDyDx",
            value: function(e, t) {
                return Math.abs(e.y - t.y) / Math.abs(e.x - t.x)
            }
        }, {
            key: "moveCenterRectWithXY",
            value: function(e, t, n) {
                return this.moveCenterRect(e, {
                    x: t,
                    y: n
                })
            }
        }, {
            key: "moveCenterRect",
            value: function(e, t) {
                return {
                    left: t.x - e.width / 2,
                    top: t.y - e.height / 2,
                    right: t.x + e.width / 2,
                    bottom: t.y + e.height / 2,
                    width: e.width,
                    height: e.height
                }
            }
        }, {
            key: "moveRectWithXY",
            value: function(e, t, n) {
                return this.moveRect(e, {
                    x: t,
                    y: n
                })
            }
        }, {
            key: "moveRect",
            value: function(e, t) {
                return {
                    left: t.x,
                    right: t.x + e.width,
                    top: t.y,
                    bottom: t.y + e.height,
                    width: e.width,
                    height: e.height
                }
            }
        }, {
            key: "getSegmentFromPoints",
            value: function(e, t) {
                return new u.default.Segment(this.toFlattenPoint(e),this.toFlattenPoint(t))
            }
        }, {
            key: "toFlattenPoint",
            value: function(e) {
                return e instanceof u.default.Point ? e : new u.default.Point(e.x,e.y)
            }
        }]),
        e
    }())
}
, function(e, t) {
    var n = e.exports = "undefined" != typeof window && window.Math == Math ? window : "undefined" != typeof self && self.Math == Math ? self : Function("return this")();
    "number" == typeof __g && (__g = n)
}
, function(e, t, n) {
    "use strict";
    var r = n(64)
      , o = r;
    e.exports = o
}
, function(e, t, n) {
    e.exports = n(749)()
}
, function(e, t, n) {
    "use strict";
    e.exports = n(765)
}
, function(e, t) {
    e.exports = function(e) {
        try {
            return !!e()
        } catch (e) {
            return !0
        }
    }
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        for (var t = arguments.length - 1, n = "Minified React error #" + e + "; visit http://facebook.github.io/react/docs/error-decoder.html?invariant=" + e, r = 0; r < t; r++)
            n += "&args[]=" + encodeURIComponent(arguments[r + 1]);
        n += " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
        var o = new Error(n);
        throw o.name = "Invariant Violation",
        o.framesToPop = 1,
        o
    }
    e.exports = r
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function i(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
    function a(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var u = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , l = n(24)
      , s = r(l)
      , c = n(6)
      , f = r(c);
    t.default = function(e) {
        function t() {
            o(this, t);
            var e = i(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this));
            return e.isBracket = !0,
            e
        }
        return a(t, e),
        u(t, [{
            key: "toLatex",
            value: function() {
                return this.getLatextName() + " "
            }
        }, {
            key: "getModel",
            value: function() {
                return {
                    id: f.default.nextId(),
                    type: "single",
                    text: this.getLatextName()
                }
            }
        }, {
            key: "getSymbolInfo",
            value: function() {
                return this.fillSymbolInfo({
                    type: "single",
                    description: "Height adjust automatically by its content",
                    names: [this.getLatextName()],
                    symbol: this.getSymbol()
                })
            }
        }]),
        t
    }(s.default)
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var i = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , a = n(1)
      , u = r(a)
      , l = n(4)
      , s = r(l)
      , c = n(14)
      , f = r(c)
      , d = n(3)
      , p = r(d)
      , h = n(6)
      , y = r(h)
      , m = n(288)
      , v = r(m)
      , g = n(1175).mt
      , b = n(1342).mt
      , x = n(1344).mt
      , w = n(1345).mt
      , C = n(1346).mt
      , E = n(1347).mt
      , k = n(1348).mt
      , _ = n(1349).mt
      , A = n(1350).mt
      , S = n(1351).mt
      , O = n(1352).mt
      , P = n(1353).mt
      , M = n(1354).mt
      , I = n(1355).mt
      , D = n(1356).mt
      , T = n(1357).mt
      , B = n(1358).mt
      , j = n(1359).mt
      , L = [g, b, x, w, C, E, k, _, A, S, O, P, M, I, D, T, B, j]
      , R = {};
    L.forEach(function(e) {
        return R[e.getInfo().type] = e
    }),
    t.default = new (function() {
        function e() {
            o(this, e)
        }
        return i(e, [{
            key: "addNewConnection",
            value: function(e, t) {
                var n = this
                  , r = [];
                if (t.connections.forEach(function(t, o) {
                    n.isConnectTheSame2Editor(t, e) && r.push({
                        c: t,
                        index: o
                    })
                }),
                r.length >= 2)
                    return t;
                var o = t.connections;
                if (1 == r.length) {
                    o = u.default.clone(o);
                    var i = r[0];
                    o[i.index] = this.setSetting(i.c, "perpendicularDistance", 5);
                    return o = o.concat(this.setSetting(e, "perpendicularDistance", i.c.fromEditorId == e.fromEditorId ? -5 : 5)),
                    s.default.setProp(t, "connections", o)
                }
                return o = o.concat(e),
                s.default.setProp(t, "connections", o)
            }
        }, {
            key: "setSetting",
            value: function(e, t, n) {
                var r = e.settings || {}
                  , o = s.default.setProp(r, t, n);
                return s.default.setProp(e, "settings", o)
            }
        }, {
            key: "getShapeManagement",
            value: function(e) {
                if ("shape-composite" == this.getEntityType(e))
                    return this.getCompositeShapeManagementFromType(e.type)
            }
        }, {
            key: "getCompositesMts",
            value: function() {
                return L
            }
        }, {
            key: "getCompositeShapeManagementFromType",
            value: function(e) {
                return R[e]
            }
        }, {
            key: "changeEntityInData",
            value: function(e, t) {
                var n = this.getEntityType(t);
                if ("diagram" == n)
                    return t;
                if ("connection" == n)
                    return this.setConnectionInData(e, t);
                if ("shape-arrow" == n)
                    return this.setArrowInData(e, t);
                if ("shape-object" == n || "shape-composite" == n)
                    return this.setShapeInData(e, t);
                if ("text" == n || "label" == n)
                    return this.setEditorInData(e, t);
                if ("intersection" == n)
                    return s.default.setProp(e, "intersections", t);
                throw new Error("not supported")
            }
        }, {
            key: "changeEntitiesInData",
            value: function(e, t) {
                var n = this;
                return t.forEach(function(t) {
                    e = n.changeEntityInData(e, t)
                }),
                e
            }
        }, {
            key: "changeConnection",
            value: function(e, t, n, r) {
                var o = u.default.findIndex(e, function(e) {
                    return e.id == t
                })
                  , i = e[o]
                  , a = s.default.setProp(i, n, r);
                return s.default.setIndex(e, o, a)
            }
        }, {
            key: "changeConnectionObj",
            value: function(e, t, n) {
                var r = u.default.findIndex(e, function(e) {
                    return e.id == t
                })
                  , o = e[r]
                  , i = s.default.update(o, n);
                return s.default.setIndex(e, r, i)
            }
        }, {
            key: "changeConnectionInData",
            value: function(e, t, n, r) {
                return s.default.setProp(e, "connections", this.changeConnection(e.connections, t, n, r))
            }
        }, {
            key: "setConnectionInData",
            value: function(e, t) {
                var n = u.default.findIndex(e.connections, function(e) {
                    return e.id == t.id
                });
                return s.default.set(e, "connections." + n, t)
            }
        }, {
            key: "setArrowInData",
            value: function(e, t) {
                var n = u.default.findIndex(e.shapes, function(e) {
                    return e.id == t.id
                });
                return s.default.set(e, "shapes." + n, t)
            }
        }, {
            key: "setShapeInData",
            value: function(e, t) {
                var n = u.default.findIndex(e.shapes, function(e) {
                    return e.id == t.id
                });
                return s.default.set(e, "shapes." + n, t)
            }
        }, {
            key: "replaceShape",
            value: function(e, t) {
                var n = u.default.findIndex(e, function(e) {
                    return e.id == t.id
                });
                return s.default.setIndex(e, n, t)
            }
        }, {
            key: "setShapesInData",
            value: function(e, t) {
                if (!t || !t.length)
                    return e;
                var n = this.replaceShapes(e.shapes, t);
                return s.default.set(e, "shapes", n)
            }
        }, {
            key: "replaceShapes",
            value: function(e, t) {
                for (var n = u.default.clone(e), r = 0; r < e.length; r++) {
                    var o = e[r]
                      , i = u.default.find(t, function(e) {
                        return e.id == o.id
                    });
                    i && (n[r] = i)
                }
                return n
            }
        }, {
            key: "setEditorsInData",
            value: function(e, t) {
                if (!t || !t.length)
                    return e;
                var n = u.default.clone(e.elements);
                return t.forEach(function(e) {
                    return n[e.id] = e
                }),
                s.default.set(e, "elements", n)
            }
        }, {
            key: "setEditorInData",
            value: function(e, t) {
                return s.default.set(e, "elements." + t.id, t)
            }
        }, {
            key: "getConnectionPoints",
            value: function(e, t) {
                var n = this.getConnection(e, t);
                return {
                    from: e.elements[n.fromEditorId].shape.data.p,
                    to: e.elements[n.toEditorId].shape.data.p
                }
            }
        }, {
            key: "getConnectionRects",
            value: function(e, t, n) {
                return {
                    fromRect: p.default.findRectElementToRect(e[t.fromEditorId].editor.parentElement, n),
                    toRect: p.default.findRectElementToRect(e[t.toEditorId].editor.parentElement, n)
                }
            }
        }, {
            key: "getFullConnectionInfo",
            value: function(e, t, n, r) {
                var o = this.getConnection(e, n)
                  , i = this.getConnectionPoints(e, o)
                  , a = i.from
                  , u = i.to
                  , l = this.getConnectionRects(t, o, r);
                return {
                    connection: o,
                    fromPos: a,
                    toPos: u,
                    fromRect: l.fromRect,
                    toRect: l.toRect
                }
            }
        }, {
            key: "deleteEntities",
            value: function(e, t) {
                var n = this;
                return t = u.default.sortBy(t, function(e) {
                    switch (n.getEntityType(e)) {
                    case "label":
                        return 1;
                    case "connection":
                        return 2;
                    case "text":
                        return 10
                    }
                }),
                t.forEach(function(t) {
                    return e = n.deleteEntity(e, t)
                }),
                e
            }
        }, {
            key: "deleteConnection",
            value: function(e, t) {
                var n = this
                  , r = u.default.findIndex(e.connections, function(e) {
                    return e.id == t.id
                })
                  , o = s.default.remove(e.connections, r)
                  , i = u.default.findIndex(o, function(e) {
                    return n.isConnectTheSame2Editor(e, t)
                });
                return i >= 0 && (o = s.default.setIndex(o, i, this.setSetting(o[i], "perpendicularDistance", 0))),
                s.default.setProp(e, "connections", o)
            }
        }, {
            key: "isConnectTheSame2Editor",
            value: function(e, t) {
                return e.fromEditorId == t.fromEditorId && e.toEditorId == t.toEditorId || e.fromEditorId == t.toEditorId && e.toEditorId == t.fromEditorId
            }
        }, {
            key: "getEntityById",
            value: function(e, t) {
                return y.default.isDiagramShapeOrArrowOrCompositeId(t) ? u.default.find(e.shapes, function(e) {
                    return e.id == t
                }) : y.default.isDiagramEditorId(t) || y.default.isDiagramLabelEditorId(t) ? e.elements[t] : y.default.isDiagramConnectionId(t) ? u.default.find(e.connections, function(e) {
                    return e.id == t
                }) : void 0
            }
        }, {
            key: "getEntities",
            value: function(e, t) {
                var n = this;
                return u.default.map(t, function(t) {
                    return n.getEntityById(e, t)
                })
            }
        }, {
            key: "deleteEntity",
            value: function(e, t) {
                if (y.default.isDiagramShapeOrArrowOrCompositeId(t.id)) {
                    var n = u.default.findIndex(e.shapes, function(e) {
                        return e.id == t.id
                    })
                      , r = s.default.remove(e.shapes, n)
                      , o = s.default.setProp(e, "shapes", r)
                      , i = v.default.removeEntity(e.intersections, t);
                    return o = s.default.setProp(o, "intersections", i)
                }
                if (y.default.isDiagramConnectionId(t.id))
                    return this.deleteConnection(e, t);
                if (y.default.isDiagramEditorId(t.id)) {
                    var a = u.default.clone(e.elements);
                    delete a[t.id];
                    var l = this.findDAllConnectionsLinkToEditor(e.connections, t.id, a);
                    return s.default.update(e, {
                        connections: l.connections,
                        elements: a
                    })
                }
            }
        }, {
            key: "isShapeArrow",
            value: function(e) {
                return y.default.isDiagramArrowId(e.id)
            }
        }, {
            key: "isShapeComposite",
            value: function(e) {
                return y.default.isDiagramCompositeShapeId(e.id)
            }
        }, {
            key: "isShape",
            value: function(e) {
                return y.default.isDiagramShapeId(e.id)
            }
        }, {
            key: "getEntityType",
            value: function(e) {
                return y.default.isTemporaryEntity(e.id) ? "temporary" : y.default.isDiagramEditorId(e.id) ? "text" : y.default.isDiagramLabelEditorId(e.id) ? "label" : y.default.isDiagramConnectionId(e.id) ? "connection" : y.default.isDiagramArrowId(e.id) ? "shape-arrow" : y.default.isDiagramShapeId(e.id) ? "shape-object" : y.default.isDiagramCompositeShapeId(e.id) ? "shape-composite" : y.default.isDiagramIntersectionId(e.id) ? "intersection" : "diagram"
            }
        }, {
            key: "findDAllConnectionsLinkToEditor",
            value: function(e, t, n) {
                var r = {
                    deletedConnections: [],
                    connections: []
                };
                return e.forEach(function(e) {
                    e.fromEditorId != t && e.toEditorId != t ? r.connections.push(e) : r.deletedConnections.push(e)
                }),
                r
            }
        }, {
            key: "getConnection",
            value: function(e, t) {
                return u.default.isString(t) ? u.default.find(e.connections, function(e) {
                    return e.id == t
                }) : t
            }
        }, {
            key: "getQuadraticAbsoluteControlPoint",
            value: function(e, t) {
                var n = this.getConnection(e, t)
                  , r = this.getConnectionPoints(e, n);
                return f.default.toAbsoluteConnectionControlPoint(n.data.cp, r.from, r.to)
            }
        }, {
            key: "getCubicAbsoluteControlPoints",
            value: function(e, t) {
                var n = this.getConnection(e, t)
                  , r = this.getConnectionPoints(e, n)
                  , o = r.from
                  , i = r.to;
                return [f.default.toAbsoluteConnectionControlPoint(n.data.cp, o, i), f.default.toAbsoluteConnectionControlPoint(n.data.cp2, o, i)]
            }
        }, {
            key: "isStraigtLineArrow",
            value: function(e) {
                return !e.type
            }
        }, {
            key: "isQuadraticLineArrow",
            value: function(e) {
                return "quadratic" == e.type
            }
        }, {
            key: "isCubicLineArrow",
            value: function(e) {
                return "cubic" == e.type
            }
        }, {
            key: "isEllipse",
            value: function(e) {
                return "ellipse" == e.type
            }
        }, {
            key: "isRectangle",
            value: function(e) {
                return "rectangle" == e.type
            }
        }, {
            key: "isSquare",
            value: function(e) {
                return "square" == e.type
            }
        }, {
            key: "isPolygon",
            value: function(e) {
                return "polygon" == e.type
            }
        }, {
            key: "isCompositeShape",
            value: function(e) {
                return y.default.isDiagramCompositeShapeId(e.id)
            }
        }, {
            key: "isConnection",
            value: function(e) {
                return y.default.isDiagramConnectionId(e.id)
            }
        }, {
            key: "isPolygonCurve",
            value: function(e) {
                return "polygon-curve" == e.type
            }
        }, {
            key: "isAxis2d",
            value: function(e) {
                return "axis2d" == e.type
            }
        }, {
            key: "getEntityStyle",
            value: function(e, t) {
                return y.default.isDiagramEditorId(e.id) ? this.getEditorStyle(e, t) : this.getStyle(e.style, t)
            }
        }, {
            key: "getEditorStyle",
            value: function(e, t) {
                return this.getStyle(e.shape.style, t)
            }
        }, {
            key: "getStyle",
            value: function(e, t) {
                return e = e || {},
                "thickness" == t ? e[t] || 1 : "strokeColor" == t || "textColor" == t ? this.getColorStyle(e, t, "#000") : "fillColor" == t ? this.getColorStyle(e, t, "none") : "strokeType" == t ? e[t] || "-" : void 0
            }
        }, {
            key: "getColorStyle",
            value: function(e, t, n) {
                if (!e[t])
                    return n;
                var r = e[t];
                return u.default.isString(r) ? r : "rgba(" + r[0] + "," + r[1] + "," + r[2] + "," + r[3] + ")"
            }
        }, {
            key: "isRullerArrow",
            value: function(e) {
                return "|" == e.shaft
            }
        }, {
            key: "getArrowOrConnectionSettings",
            value: function(e, t) {
                return e = e || {},
                void 0 != e[t] ? e[t] : this.getArrowSettingDefault(t)
            }
        }, {
            key: "getIntersectionDefault",
            value: function(e) {
                return "shapeType" == e ? "o" : "radius" == e ? 5 : void 0
            }
        }, {
            key: "getArrowSettingDefault",
            value: function(e) {
                if ("isControlPointBreak" == e)
                    return !1;
                if ("separatorDistance" == e)
                    return 10;
                if ("separatorLength" == e)
                    return 8;
                if ("breakWidth" != e)
                    return "breakPositionPercentage" == e ? .5 : "perpendicularDistance" == e ? 0 : void 0
            }
        }, {
            key: "getDataValue",
            value: function(e, t, n) {
                if (y.default.isDiagramEditorId(e.id))
                    var r = e.shape.data[t];
                else
                    var r = e.data[t];
                return void 0 === r ? n : r
            }
        }, {
            key: "getSettings",
            value: function(e, t) {
                if (y.default.isDiagramEditorId(e.id)) {
                    var n = e.shape.settings || {};
                    if (void 0 != n[t])
                        return n[t];
                    if ("fontSize" == t)
                        return "\\normalsize"
                } else
                    var n = e.settings || {};
                if (void 0 != n[t])
                    return n[t];
                if ("cornerRadius" == t)
                    return 0;
                if (y.default.isDiagramArrowId(e.id) || y.default.isDiagramConnectionId(e.id))
                    return this.getArrowSettingDefault(t);
                if (y.default.isDiagramIntersectionId(e.id))
                    return this.getIntersectionDefault(t);
                if (this.isCompositeShape(e)) {
                    var r = this.getShapeManagement(e);
                    if (null != r && r.getSettingDefaultValue)
                        return r.getSettingDefaultValue(t)
                }
                return "grid" != t && ("textSnapToGrid" != t && ("onlyShowOnEditing" != t && ("gridSize" == t ? 10 : "diagramHeight" == t ? 300 : void 0)))
            }
        }]),
        e
    }())
}
, function(e, t) {
    e.exports = function(e) {
        return "object" == typeof e ? null !== e : "function" == typeof e
    }
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var i = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , a = n(1)
      , u = r(a)
      , l = n(51)
      , s = r(l)
      , c = n(6)
      , f = r(c)
      , d = n(5)
      , p = r(d);
    t.default = function() {
        function e() {
            o(this, e)
        }
        return i(e, [{
            key: "getModelFromStructure",
            value: function(e, t) {
                var n = this;
                if ("editor" == e)
                    return {
                        id: f.default.nextId(),
                        lines: [{
                            id: f.default.nextId(),
                            blocks: []
                        }]
                    };
                var r = {
                    id: f.default.nextId(),
                    type: "composite",
                    text: t,
                    elements: {}
                };
                return u.default.keys(e).forEach(function(t) {
                    r.elements[t] = n.getModelFromStructure(e[t], void 0)
                }),
                r
            }
        }, {
            key: "getModel",
            value: function(e) {
                var t = this.getModelMeta()
                  , n = p.default.n__dp(t.text);
                return u.default.keys(t.elements).forEach(function(r) {
                    var o = t.elements[r];
                    e && !e.isExpanded && (e.isExpanded || o.defaultHide) || (n.elements[r] = p.default.n__dt())
                }),
                n
            }
        }, {
            key: "fillSymbolInfo",
            value: function(e) {
                return null == e.searchText && (e.searchText = e.names.join(" "),
                e.description && (e.searchText += " " + e.description)),
                e
            }
        }, {
            key: "isEmptyOrOneCharEditor",
            value: function(e) {
                return this.isEmptyEditor(e) || this.isOneCharacterEditor(e)
            }
        }, {
            key: "isOneCharacterEditor",
            value: function(e) {
                return 1 == e.lines.length && 1 == e.lines[0].blocks.length && null == e.lines[0].blocks[0].type && s.default.isSingleChar(e.lines[0].blocks[0].text)
            }
        }, {
            key: "isNotExistOrEmptyEditor",
            value: function(e) {
                return null == e || this.isEmptyEditor(e)
            }
        }, {
            key: "isEmptyEditor",
            value: function(e) {
                return !e || 1 == e.lines.length && 0 == e.lines[0].blocks.length
            }
        }]),
        e
    }()
}
, function(e, t, n) {
    "use strict";
    t.__esModule = !0,
    t.default = function(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
}
, function(e, t, n) {
    var r = n(186)("wks")
      , o = n(109)
      , i = n(15).Symbol
      , a = "function" == typeof i;
    (e.exports = function(e) {
        return r[e] || (r[e] = a && i[e] || (a ? i : o)("Symbol." + e))
    }
    ).store = r
}
, function(e, t, n) {
    var r, o;
    !function() {
        "use strict";
        function n() {
            for (var e = [], t = 0; t < arguments.length; t++) {
                var r = arguments[t];
                if (r) {
                    var o = typeof r;
                    if ("string" === o || "number" === o)
                        e.push(r);
                    else if (Array.isArray(r))
                        e.push(n.apply(null, r));
                    else if ("object" === o)
                        for (var a in r)
                            i.call(r, a) && r[a] && e.push(a)
                }
            }
            return e.join(" ")
        }
        var i = {}.hasOwnProperty;
        void 0 !== e && e.exports ? e.exports = n : (r = [],
        void 0 !== (o = function() {
            return n
        }
        .apply(t, r)) && (e.exports = o))
    }()
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var o = n(1285);
    Object.defineProperty(t, "Alpha", {
        enumerable: !0,
        get: function() {
            return r(o).default
        }
    });
    var i = n(471);
    Object.defineProperty(t, "Checkboard", {
        enumerable: !0,
        get: function() {
            return r(i).default
        }
    });
    var a = n(1288);
    Object.defineProperty(t, "EditableInput", {
        enumerable: !0,
        get: function() {
            return r(a).default
        }
    });
    var u = n(1289);
    Object.defineProperty(t, "Hue", {
        enumerable: !0,
        get: function() {
            return r(u).default
        }
    });
    var l = n(1291);
    Object.defineProperty(t, "Saturation", {
        enumerable: !0,
        get: function() {
            return r(l).default
        }
    });
    var s = n(473);
    Object.defineProperty(t, "ColorWrap", {
        enumerable: !0,
        get: function() {
            return r(s).default
        }
    });
    var c = n(1299);
    Object.defineProperty(t, "Swatch", {
        enumerable: !0,
        get: function() {
            return r(c).default
        }
    })
}
, function(e, t, n) {
    "use strict";
    t.__esModule = !0;
    var r = n(1412)
      , o = function(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }(r);
    t.default = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                (0,
                o.default)(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function i(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
    function a(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var u = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , l = n(0)
      , s = r(l)
      , c = n(18)
      , f = r(c)
      , d = n(1)
      , p = r(d)
      , h = n(7)
      , y = r(h)
      , m = n(4)
      , v = r(m)
      , g = n(52)
      , b = r(g)
      , x = n(3)
      , w = r(x)
      , C = n(53)
      , E = r(C)
      , k = n(46)
      , _ = r(k)
      , A = n(40)
      , S = r(A)
      , O = n(119)
      , P = r(O)
      , M = n(6)
      , I = r(M);
    n(870);
    var D = function(e) {
        function t(e) {
            o(this, t);
            var n = i(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e));
            return n.refMap = {},
            n.updateBaseLine = n.updateBaseLine.bind(n),
            n.updateBaseLine.displayName = "symbol_base",
            n.elementMethodsCache = {},
            n.getCompositeInstance = n.getCompositeInstance.bind(n),
            n.willComponentUnmount = !1,
            n.cacheRefMethod = {},
            n.selfManageBaseLine = !1,
            n
        }
        return a(t, e),
        u(t, [{
            key: "getLatexName",
            value: function() {
                return this.props.data.text
            }
        }, {
            key: "getModel",
            value: function() {
                return this.props.data
            }
        }, {
            key: "shouldComponentUpdate",
            value: function(e, t) {
                return e.data != this.props.data || e.selected != this.props.selected || e.fontSize != this.props.fontSize || this.state != t
            }
        }, {
            key: "fromString",
            value: function(e) {
                return p.default.map(e.split(""), function(e) {
                    return {
                        id: I.default.nextId(),
                        char: e
                    }
                })
            }
        }, {
            key: "getEditors",
            value: function() {
                var e = this;
                return p.default.map(p.default.keys(this.refMap), function(t) {
                    return e.refMap[t]
                })
            }
        }, {
            key: "hasEditor",
            value: function() {
                return p.default.keys(this.refMap).length > 0
            }
        }, {
            key: "hasElementsData",
            value: function() {
                return p.default.keys(this.props.data.elements).length > 0
            }
        }, {
            key: "getEditorDoms",
            value: function() {
                var e = this;
                return p.default.map(p.default.keys(this.refMap), function(t) {
                    return e.refMap[t].editor
                })
            }
        }, {
            key: "getEditorDomByKey",
            value: function(e) {
                return this.refMap[e] ? this.refMap[e].editor : null
            }
        }, {
            key: "getRootDom",
            value: function() {
                return f.default.findDOMNode(this)
            }
        }, {
            key: "selectDefault",
            value: function() {
                this.getEditors()[0].select()
            }
        }, {
            key: "isSelected",
            value: function() {
                return null != this.props.selected
            }
        }, {
            key: "isChildSelected",
            value: function() {
                return null != this.props.selected && null != this.props.selected.key
            }
        }, {
            key: "isDirectSelected",
            value: function() {
                return this.isSelected() && (null == this.props.selected.selected || null == this.props.selected.selected.selected)
            }
        }, {
            key: "isDirectSelectedNoSelectionMode",
            value: function() {
                return this.isDirectSelected() && !this.isInSelectionMode()
            }
        }, {
            key: "isSelectModeOnly",
            value: function() {
                return this.context.getEditorInfo().selectOnly
            }
        }, {
            key: "isDirectAndChildSelected",
            value: function() {
                return this.isDirectSelected() && this.isChildSelected()
            }
        }, {
            key: "isEditorEmpty",
            value: function(e) {
                return !e || 1 == e.lines.length && 0 == e.lines[0].blocks.length
            }
        }, {
            key: "isOneLineEditor",
            value: function(e) {
                return 1 == e.lines.length
            }
        }, {
            key: "isMultiline",
            value: function(e) {
                return !this.isOneLineEditor(e)
            }
        }, {
            key: "isLastLineAllTextBlocksSingleOrPower",
            value: function(e) {
                var t = p.default.last(e.lines);
                return p.default.every(t.blocks, function(e) {
                    return b.default.isTextBlock(e) || b.default.n__da(e) || b.default.isPower(e)
                })
            }
        }, {
            key: "isOneTextBlock",
            value: function(e) {
                if (1 != e.lines.length)
                    return !1;
                var t = e.lines[0].blocks;
                return 1 == t.length && b.default.isTextBlock(t[0])
            }
        }, {
            key: "isOneOr2Char",
            value: function(e) {
                return this.isOneTextBlock(e) && e.lines[0].blocks[0].text.length <= 2
            }
        }, {
            key: "isEmptyOrOneChar",
            value: function(e) {
                return this.isEditorEmpty(e) || this.isOneChar(e)
            }
        }, {
            key: "isOneChar",
            value: function(e) {
                return this.isOneTextBlock(e) && 1 == e.lines[0].blocks[0].text.length
            }
        }, {
            key: "isLineAllNormalText",
            value: function(e) {
                return p.default.every(e.blocks, function(e) {
                    return b.default.isTextBlock(e)
                })
            }
        }, {
            key: "isFirstTextBlock",
            value: function(e) {
                return e.blocks[0] && b.default.isTextBlock(e.blocks[0])
            }
        }, {
            key: "getClassName",
            value: function() {
                return this.containerClassName || ""
            }
        }, {
            key: "isFirstMathModeLevel",
            value: function() {
                return this.props.isFirstMathModeLevel
            }
        }, {
            key: "isInlineMode",
            value: function() {
                return !(!this.props.data.style || "\\textstyle" != this.props.data.style.mathModeType) || (!this.props.data.style || "\\displaystyle" != this.props.data.style.mathModeType) && !this.props.displayMode
            }
        }, {
            key: "isInSelectionMode",
            value: function() {
                return this.getEditorInfo().isSelectionMode
            }
        }, {
            key: "getEditorInfo",
            value: function() {
                return this.context.getEditorInfo()
            }
        }, {
            key: "isSingleTextBlockAndUperSmall",
            value: function(e) {
                return this.isEditorEmpty(e) || this.isOneTextBlock(e) && P.default.isUpperSmall(e.lines[0].blocks[0].text)
            }
        }, {
            key: "isSingleTextBlockLeftUpperSign",
            value: function(e) {
                return this.isOneTextBlock(e) && P.default.isUpperLeftSign(e.lines[0].blocks[0].text)
            }
        }, {
            key: "isSingleTextBlockRightUpperSign",
            value: function(e) {
                return this.isOneTextBlock(e) && P.default.isUpperRightSign(e.lines[0].blocks[0].text)
            }
        }, {
            key: "isSingleTextBlockAndOneChar",
            value: function(e) {
                return this.isOneTextBlock(e) && 1 == e.lines[0].blocks[0].text.length
            }
        }, {
            key: "getRoundEm",
            value: function(e, t) {
                return t = t || 1,
                w.default.getEmRound(e, this.getFontSizePixel(t))
            }
        }, {
            key: "getRoundEmStr",
            value: function(e, t) {
                return this.getRoundEm(e, t) + "em"
            }
        }, {
            key: "isSingleTextBlockFirstLine",
            value: function(e) {
                if (this.isEditorEmpty(e))
                    return !0;
                var t = e.lines[0];
                return 1 == t.blocks.length && b.default.isTextBlock(t.blocks[0])
            }
        }, {
            key: "isFirstCharOfLastLineLowerSmall",
            value: function(e) {
                if (this.isEditorEmpty(e))
                    return !0;
                var t = p.default.last(e.lines);
                return !!b.default.isTextBlock(t.blocks[0]) && P.default.isLowerSmall(t.blocks[0].text[0])
            }
        }, {
            key: "isSingleTextBlockAndLowerSmall",
            value: function(e) {
                return !!this.isEditorEmpty(e) || p.default.every(p.default.last(e.lines).blocks, function(e) {
                    return b.default.isTextBlock(e) && P.default.isLowerSmall(e.text) || b.default.isPower(e)
                })
            }
        }, {
            key: "componentDidUpdate",
            value: function(e, t) {
                this.afterReactRenderBase(e, t),
                !this.useCustomBaseLine() || e.data == this.props.data && e.fontSize == this.props.fontSize || E.default.push(this.updateBaseLine, this)
            }
        }, {
            key: "componentDidMount",
            value: function() {
                this.useCustomBaseLine() && E.default.push(this.updateBaseLine, this),
                this.afterReactRenderBase({}, {})
            }
        }, {
            key: "afterReactRenderBase",
            value: function(e, t) {
                this.afterReactRender(e, t),
                e.data == this.props.data && e.fontSize == this.props.fontSize && e.fracLevel == this.props.fracLevel && e.displayMode == this.props.displayMode || this.afterReactRenderWhenDataChanged(e, t)
            }
        }, {
            key: "getCachedRefMethod",
            value: function(e, t) {
                return this.cacheRefMethod[e] || (this.cacheRefMethod[e] = t.bind(this)),
                this.cacheRefMethod[e]
            }
        }, {
            key: "afterReactRender",
            value: function() {}
        }, {
            key: "afterReactRenderWhenDataChanged",
            value: function() {}
        }, {
            key: "componentWillUnmount",
            value: function() {
                this.willComponentUnmount = !0
            }
        }, {
            key: "getBaseLineEditor",
            value: function(e, t) {
                if (this.isOneLineEditor(t)) {
                    return w.default.n__fi(e)
                }
                return Math.round(w.default.getElementHeightRound2Dec(e) / 2 + .3 * w.default.getComputedFontSize(this.compositeBlock))
            }
        }, {
            key: "updateBaseLine",
            value: function() {
                if (this.getBaseLine) {
                    var e = w.default.getComputedFontSize(this.compositeBlock);
                    (0,
                    y.default)(this.baseline).css("margin-top", this.getBaseLine() / e + "em")
                }
            }
        }, {
            key: "useCustomBaseLine",
            value: function() {
                return !1
            }
        }, {
            key: "renderBaseLine",
            value: function() {
                var e = this;
                if (this.useCustomBaseLine() || this.selfManageBaseLine)
                    return s.default.createElement("base-line-indicator", {
                        class: this.baselineClass,
                        ref: function(t) {
                            return e.baseline = t
                        }
                    }, "a")
            }
        }, {
            key: "getFracLevel",
            value: function() {
                return this.props.fracLevel || 0
            }
        }, {
            key: "setStripInfo",
            value: function(e) {
                return e.stripUp && e.stripDown ? e : (e.stripUp ? e.stripDown = this.props.stripInfo && this.props.stripInfo.stripDown : e.stripUp = this.props.stripInfo && this.props.stripInfo.stripUp,
                e)
            }
        }, {
            key: "renderBaseSetting",
            value: function() {}
        }, {
            key: "__renderIcons",
            value: function(e) {
                var t = this;
                return p.default.map(e, function(e) {
                    var n = _.default.getCustomSymbolComponent(e).getSymbolInfo();
                    return p.default.isArray(n) && (n = n[0]),
                    s.default.createElement("latex-symbol-icon", {
                        key: e,
                        class: t.props.data.text == e ? " selected" : "",
                        onClick: function() {
                            t.props.onDataChanged(v.default.set(t.props.data, "text", e))
                        }
                    }, n.renderSymbol())
                })
            }
        }, {
            key: "getCompositeBlockStyle",
            value: function() {}
        }, {
            key: "getFontSizePixel",
            value: function(e) {
                return e = e || 1,
                this.context.fontSizeBase * this.props.fontSize * e
            }
        }, {
            key: "renderComponentBase",
            value: function() {
                return this.renderComponent()
            }
        }, {
            key: "getCompositeInstance",
            value: function(e) {
                e && (e.reactInstance = this,
                this.compositeBlock = e)
            }
        }, {
            key: "render",
            value: function() {
                var e = this.getClassName();
                return e = e || "",
                e += this.isDirectSelected() && this.isChildSelected() ? " selected" : "",
                e += this.isInlineMode() ? " inline" : "",
                e += this.baselineClass ? " " + this.baselineClass : "",
                e += " " + S.default.getClassFromStyle(this.props.data),
                s.default.createElement("compositeblock", {
                    id: this.props.id,
                    style: this.getCompositeBlockStyle(),
                    ref: this.getCompositeInstance,
                    className: e
                }, this.renderBaseLine(), this.renderComponentBase())
            }
        }, {
            key: "getFontSize",
            value: function() {
                return this.props.data.style && void 0 !== this.props.data.style.fontSize ? P.default.fontSizePercentageFromCommand(this.props.data.style.fontSize) : this.props.fontSize
            }
        }, {
            key: "selectElement",
            value: function(e) {
                this.props.onSelectedChanged({
                    key: e,
                    selected: {
                        lineIndex: 0,
                        charIndex: 0
                    }
                })
            }
        }, {
            key: "buildMetaDataFromName",
            value: function(e, t) {
                var n = {};
                return n.data = this.props.data.elements[e],
                n.id = this.props.data.elements[e].id,
                n.keyName = e,
                n.fontSize = this.getFontSize(),
                n.stripInfo = this.props.stripInfo,
                void 0 !== this.props.noSpacingRule && (n.noSpacingRule = this.props.noSpacingRule),
                this.props.selected && this.props.selected.key == e && (n.selected = this.props.selected.selected),
                !t && this.isDirectSelected() && this.isChildSelected() && (n.showBorder = !0),
                null == this.elementMethodsCache[e] && (this.elementMethodsCache[e] = {},
                this.elementMethodsCache[e].onDataChanged = function(e, t, n) {
                    this.props.onDataChanged(v.default.set(this.props.data, "elements." + e, t), n)
                }
                .bind(this, e),
                this.elementMethodsCache[e].onSelectedChanged = function(t, n) {
                    this.props.onSelectedChanged({
                        key: e,
                        selected: t
                    }, n)
                }
                .bind(this),
                this.elementMethodsCache[e].ref = function(e, t) {
                    if (!t)
                        return void delete this.refMap[e];
                    this.refMap[e] = t
                }
                .bind(this, e)),
                n.onDataChanged = this.elementMethodsCache[e].onDataChanged,
                n.onSelectedChanged = this.elementMethodsCache[e].onSelectedChanged,
                n.ref = this.elementMethodsCache[e].ref,
                n
            }
        }]),
        t
    }(s.default.Component);
    t.default = D,
    D.contextTypes = {
        getEditorInfo: s.default.PropTypes.any,
        fontSizeBase: s.default.PropTypes.any
    }
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        if (null === e || void 0 === e)
            throw new TypeError("Object.assign cannot be called with null or undefined");
        return Object(e)
    }
    var o = Object.getOwnPropertySymbols
      , i = Object.prototype.hasOwnProperty
      , a = Object.prototype.propertyIsEnumerable;
    e.exports = function() {
        try {
            if (!Object.assign)
                return !1;
            var e = new String("abc");
            if (e[5] = "de",
            "5" === Object.getOwnPropertyNames(e)[0])
                return !1;
            for (var t = {}, n = 0; n < 10; n++)
                t["_" + String.fromCharCode(n)] = n;
            if ("0123456789" !== Object.getOwnPropertyNames(t).map(function(e) {
                return t[e]
            }).join(""))
                return !1;
            var r = {};
            return "abcdefghijklmnopqrst".split("").forEach(function(e) {
                r[e] = e
            }),
            "abcdefghijklmnopqrst" === Object.keys(Object.assign({}, r)).join("")
        } catch (e) {
            return !1
        }
    }() ? Object.assign : function(e, t) {
        for (var n, u, l = r(e), s = 1; s < arguments.length; s++) {
            n = Object(arguments[s]);
            for (var c in n)
                i.call(n, c) && (l[c] = n[c]);
            if (o) {
                u = o(n);
                for (var f = 0; f < u.length; f++)
                    a.call(n, u[f]) && (l[u[f]] = n[u[f]])
            }
        }
        return l
    }
}
, function(e, t, n) {
    e.exports = !n(19)(function() {
        return 7 != Object.defineProperty({}, "a", {
            get: function() {
                return 7
            }
        }).a
    })
}
, function(e, t, n) {
    var r = n(12)
      , o = n(336)
      , i = n(76)
      , a = Object.defineProperty;
    t.f = n(32) ? Object.defineProperty : function(e, t, n) {
        if (r(e),
        t = i(t, !0),
        r(n),
        o)
            try {
                return a(e, t, n)
            } catch (e) {}
        if ("get"in n || "set"in n)
            throw TypeError("Accessors not supported!");
        return "value"in n && (e[t] = n.value),
        e
    }
}
, function(e, t, n) {
    "use strict";
    function r(e, t) {
        return 1 === e.nodeType && e.getAttribute(h) === String(t) || 8 === e.nodeType && e.nodeValue === " react-text: " + t + " " || 8 === e.nodeType && e.nodeValue === " react-empty: " + t + " "
    }
    function o(e) {
        for (var t; t = e._renderedComponent; )
            e = t;
        return e
    }
    function i(e, t) {
        var n = o(e);
        n._hostNode = t,
        t[m] = n
    }
    function a(e) {
        var t = e._hostNode;
        t && (delete t[m],
        e._hostNode = null)
    }
    function u(e, t) {
        if (!(e._flags & y.hasCachedChildNodes)) {
            var n = e._renderedChildren
              , a = t.firstChild;
            e: for (var u in n)
                if (n.hasOwnProperty(u)) {
                    var l = n[u]
                      , s = o(l)._domID;
                    if (0 !== s) {
                        for (; null !== a; a = a.nextSibling)
                            if (r(a, s)) {
                                i(l, a);
                                continue e
                            }
                        f("32", s)
                    }
                }
            e._flags |= y.hasCachedChildNodes
        }
    }
    function l(e) {
        if (e[m])
            return e[m];
        for (var t = []; !e[m]; ) {
            if (t.push(e),
            !e.parentNode)
                return null;
            e = e.parentNode
        }
        for (var n, r; e && (r = e[m]); e = t.pop())
            n = r,
            t.length && u(r, e);
        return n
    }
    function s(e) {
        var t = l(e);
        return null != t && t._hostNode === e ? t : null
    }
    function c(e) {
        if (void 0 === e._hostNode && f("33"),
        e._hostNode)
            return e._hostNode;
        for (var t = []; !e._hostNode; )
            t.push(e),
            e._hostParent || f("34"),
            e = e._hostParent;
        for (; t.length; e = t.pop())
            u(e, e._hostNode);
        return e._hostNode
    }
    var f = n(20)
      , d = n(143)
      , p = n(376)
      , h = (n(10),
    d.ID_ATTRIBUTE_NAME)
      , y = p
      , m = "__reactInternalInstance$" + Math.random().toString(36).slice(2);
    e.exports = {
        getClosestInstanceFromNode: l,
        getInstanceFromNode: s,
        getNodeFromInstance: c,
        precacheChildNodes: u,
        precacheNode: i,
        uncacheNode: a
    }
}
, function(e, t, n) {
    "use strict";
    function r(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var o = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , i = n(73)
      , a = function(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }(i)
      , u = function() {
        function e() {
            r(this, e)
        }
        return o(e, [{
            key: "getLeftTopFromEvent",
            value: function(e) {
                return this.isTouchEvent(e) ? {
                    left: e.touches[0].clientX,
                    top: e.touches[0].clientY
                } : {
                    left: e.clientX,
                    top: e.clientY
                }
            }
        }, {
            key: "getTargetOnMoveEvent",
            value: function(e) {
                if (this.isTouchEvent(e)) {
                    var t = e.touches[0];
                    return document.elementFromPoint(t.clientX, t.clientY)
                }
                return e.target
            }
        }, {
            key: "isTouchEvent",
            value: function(e) {
                return e.touches
            }
        }, {
            key: "isLeftButton",
            value: function(e) {
                return 0 === e.button
            }
        }, {
            key: "isLeftButtonOrTouch",
            value: function(e) {
                return this.isLeftButton(e) || this.isTouchEvent(e)
            }
        }, {
            key: "isMiddleButton",
            value: function(e) {
                return 1 === e.button
            }
        }, {
            key: "isRightButton",
            value: function(e) {
                return 2 === e.button
            }
        }, {
            key: "getStopPropagationForFocusClickMouseDown",
            value: function() {
                return e.stopPropagationForFocusClickMouseDown
            }
        }, {
            key: "focusAndCursorSelectAcquired",
            value: function(e) {
                e.customInfo = a.default.getBuilder().withFocusAcquired().withHandledCursorSelected().build()
            }
        }, {
            key: "onDoubleClickStopPropagation",
            value: function(e) {
                e.stopPropagation()
            }
        }, {
            key: "onMouseDownStopPropagation",
            value: function(e) {
                e.stopPropagation()
            }
        }, {
            key: "onWheelStopPropogateJquery",
            value: function(e) {
                var e = e.originalEvent
                  , t = e.deltaY || -e.wheelDelta || e && e.detail;
                t && (e.preventDefault(),
                "DOMMouseScroll" == e.type && (t *= 40),
                e.currentTarget.scrollTop = t + e.currentTarget.scrollTop)
            }
        }, {
            key: "onWheelStopPropogate",
            value: function(e) {
                var t = e.deltaY
                  , n = e.currentTarget
                  , r = n.scrollTop
                  , o = n.scrollHeight
                  , i = n.offsetHeight
                  , a = t;
                (r <= 0 && a < 0 || r >= o - i && a > 0) && e.preventDefault()
            }
        }]),
        e
    }();
    u.stopPropagationForFocusClickMouseDown = {
        onFocus: function(e) {
            e.stopPropagation()
        },
        onMouseDown: function(e) {
            e.stopPropagation()
        },
        onClick: function(e) {
            e.stopPropagation()
        },
        onDoubleClick: function(e) {
            e.stopPropagation()
        }
    },
    t.default = new u
}
, function(e, t, n) {
    "use strict";
    t.__esModule = !0;
    var r = n(484)
      , o = function(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }(r);
    t.default = function(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" !== (void 0 === t ? "undefined" : (0,
        o.default)(t)) && "function" != typeof t ? e : t
    }
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    t.__esModule = !0;
    var o = n(1438)
      , i = r(o)
      , a = n(1442)
      , u = r(a)
      , l = n(484)
      , s = r(l);
    t.default = function(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + (void 0 === t ? "undefined" : (0,
            s.default)(t)));
        e.prototype = (0,
        u.default)(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (i.default ? (0,
        i.default)(e, t) : e.__proto__ = t)
    }
}
, function(e, t, n) {
    var r = n(100)
      , o = Math.min;
    e.exports = function(e) {
        return e > 0 ? o(r(e), 9007199254740991) : 0
    }
}
, function(e, t, n) {
    "use strict";
    function r() {
        S.ReactReconcileTransaction && w || c("123")
    }
    function o() {
        this.reinitializeTransaction(),
        this.dirtyComponentsLength = null,
        this.callbackQueue = d.getPooled(),
        this.reconcileTransaction = S.ReactReconcileTransaction.getPooled(!0)
    }
    function i(e, t, n, o, i, a) {
        return r(),
        w.batchedUpdates(e, t, n, o, i, a)
    }
    function a(e, t) {
        return e._mountOrder - t._mountOrder
    }
    function u(e) {
        var t = e.dirtyComponentsLength;
        t !== v.length && c("124", t, v.length),
        v.sort(a),
        g++;
        for (var n = 0; n < t; n++) {
            var r = v[n]
              , o = r._pendingCallbacks;
            r._pendingCallbacks = null;
            if (h.logTopLevelRenders) {
                var i = r;
                r._currentElement.type.isReactTopLevelWrapper && (i = r._renderedComponent),
                "React update: " + i.getName()
            }
            if (y.performUpdateIfNecessary(r, e.reconcileTransaction, g),
            o)
                for (var u = 0; u < o.length; u++)
                    e.callbackQueue.enqueue(o[u], r.getPublicInstance())
        }
    }
    function l(e) {
        if (r(),
        !w.isBatchingUpdates)
            return void w.batchedUpdates(l, e);
        v.push(e),
        null == e._updateBatchNumber && (e._updateBatchNumber = g + 1)
    }
    function s(e, t) {
        w.isBatchingUpdates || c("125"),
        b.enqueue(e, t),
        x = !0
    }
    var c = n(20)
      , f = n(31)
      , d = n(380)
      , p = n(118)
      , h = n(381)
      , y = n(144)
      , m = n(199)
      , v = (n(10),
    [])
      , g = 0
      , b = d.getPooled()
      , x = !1
      , w = null
      , C = {
        initialize: function() {
            this.dirtyComponentsLength = v.length
        },
        close: function() {
            this.dirtyComponentsLength !== v.length ? (v.splice(0, this.dirtyComponentsLength),
            _()) : v.length = 0
        }
    }
      , E = {
        initialize: function() {
            this.callbackQueue.reset()
        },
        close: function() {
            this.callbackQueue.notifyAll()
        }
    }
      , k = [C, E];
    f(o.prototype, m, {
        getTransactionWrappers: function() {
            return k
        },
        destructor: function() {
            this.dirtyComponentsLength = null,
            d.release(this.callbackQueue),
            this.callbackQueue = null,
            S.ReactReconcileTransaction.release(this.reconcileTransaction),
            this.reconcileTransaction = null
        },
        perform: function(e, t, n) {
            return m.perform.call(this, this.reconcileTransaction.perform, this.reconcileTransaction, e, t, n)
        }
    }),
    p.addPoolingTo(o);
    var _ = function() {
        for (; v.length || x; ) {
            if (v.length) {
                var e = o.getPooled();
                e.perform(u, null, e),
                o.release(e)
            }
            if (x) {
                x = !1;
                var t = b;
                b = d.getPooled(),
                t.notifyAll(),
                d.release(t)
            }
        }
    }
      , A = {
        injectReconcileTransaction: function(e) {
            e || c("126"),
            S.ReactReconcileTransaction = e
        },
        injectBatchingStrategy: function(e) {
            e || c("127"),
            "function" != typeof e.batchedUpdates && c("128"),
            "boolean" != typeof e.isBatchingUpdates && c("129"),
            w = e
        }
    }
      , S = {
        ReactReconcileTransaction: null,
        batchedUpdates: i,
        enqueueUpdate: l,
        flushBatchedUpdates: _,
        injection: A,
        asap: s
    };
    e.exports = S
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.EditorBorderType = void 0;
    var i, a = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }(), u = n(1), l = r(u), s = n(52), c = r(s), f = n(4), d = r(f), p = n(5), h = r(p), y = n(47), m = r(y);
    !function(e) {
        e[e.None = 0] = "None",
        e[e.Left = 1] = "Left",
        e[e.Top = 2] = "Top",
        e[e.Right = 4] = "Right",
        e[e.Bottom = 8] = "Bottom",
        e[e.Full = 15] = "Full"
    }(i || (t.EditorBorderType = i = {}));
    var v = function() {
        function e() {
            o(this, e)
        }
        return a(e, [{
            key: "normalizeStyle",
            value: function(e) {
                if (!e)
                    return e;
                var t = null;
                for (var n in e)
                    e.hasOwnProperty(n) && !e[n] && (t = t || l.default.clone(e),
                    delete t[n]);
                return t || e
            }
        }, {
            key: "setEditorsStyleForRow",
            value: function(e, t, n, r) {
                var o = this
                  , i = l.default.range(0, e.column).map(function(e) {
                    return h.default.getKeyFromRowCol(t, e)
                });
                return m.default.modifyEditors(e, i, function(e) {
                    return o.setStyleToEditor(e, n, r)
                })
            }
        }, {
            key: "setEditorsStyleForColumn",
            value: function(e, t, n, r) {
                var o = this
                  , i = l.default.range(0, e.row).map(function(e) {
                    return h.default.getKeyFromRowCol(e, t)
                });
                return m.default.modifyEditors(e, i, function(e) {
                    return o.setStyleToEditor(e, n, r)
                })
            }
        }, {
            key: "setStyleToEditor",
            value: function(e, t, n) {
                var r = l.default.clone(e);
                return r.style = null == r.style ? {} : l.default.clone(r.style),
                null == n ? delete r.style[t] : r.style[t] = n,
                r
            }
        }, {
            key: "getStyleForEditor",
            value: function(e, t, n) {
                var r = (e.style || {})[t];
                return void 0 !== r ? r : n
            }
        }, {
            key: "addStyleMod",
            value: function(e, t, n) {
                null == e.style && (e.style = {}),
                e.style[t] = n
            }
        }, {
            key: "addStyle",
            value: function(e, t, n) {
                var r = l.default.clone(e);
                return r.style = null == e.style ? {} : l.default.clone(e.style),
                r.style[t] = n,
                r
            }
        }, {
            key: "setLineStyleMod",
            value: function(e, t, n) {
                var r = e;
                return void 0 === n ? delete r.style[t] : r.style[t] = n,
                r
            }
        }, {
            key: "setLineStyle",
            value: function(e, t, n) {
                var r = l.default.clone(e);
                return r.style = null == e.style ? {} : l.default.clone(r.style),
                void 0 === n ? delete r.style[t] : r.style[t] = n,
                r
            }
        }, {
            key: "setListType",
            value: function(e, t) {
                if (null == t || "none" == t)
                    return this.n__bo(e);
                if (null != this.getLineStyle(e, "align") && (e = this.removeLineStyle(e, "align")),
                "section" == t) {
                    this.getLineTempOrStoreIndent(e) > 2 && (e = this.setLineStyle(e, "indentIndex", 2))
                }
                return this.setLineStyle(e, "listType", t)
            }
        }, {
            key: "hasListType",
            value: function(e) {
                return null != this.getLineStyle(e, "listType", void 0)
            }
        }, {
            key: "removeLineStyle",
            value: function(e, t) {
                return this.setLineStyle(e, t, void 0)
            }
        }, {
            key: "n__bo",
            value: function(e) {
                var t = this.removeLineStyle(e, "listType");
                return t = this.removeLineStyle(t, "indentIndex"),
                t = this.removeLineStyle(t, "listTypeSkip"),
                t.___tempIndentIndex = void 0,
                t
            }
        }, {
            key: "indentLine",
            value: function(e) {
                var t = this.getLineStyle(e, "listType")
                  , n = this.getLineTempOrStoreIndent(e, 0);
                if ("section" == t && n >= 2)
                    return e;
                if (n >= 3)
                    return e;
                var r = this.setLineStyle(e, "indentIndex", n + 1);
                return r = this.removeLineStyle(r, "listTypeSkip")
            }
        }, {
            key: "outdentLine",
            value: function(e) {
                var t = this.getLineTempOrStoreIndent(e, 0);
                if (t > 0) {
                    var n = this.setLineStyle(e, "indentIndex", t - 1);
                    return n = this.removeLineStyle(n, "listTypeSkip")
                }
                return e
            }
        }, {
            key: "getLineStyle",
            value: function(e, t, n) {
                return e.style ? void 0 === e.style[t] ? n : e.style[t] : n
            }
        }, {
            key: "getLineTempOrStoreIndent",
            value: function(e, t) {
                return null != e.___tempIndentIndex ? e.___tempIndentIndex : this.getLineStyle(e, "indentIndex", t)
            }
        }, {
            key: "getMaxNestedListLevel",
            value: function() {
                return 3
            }
        }, {
            key: "getMaxNestedSectionLevel",
            value: function() {
                return 3
            }
        }, {
            key: "getIntersectStyleForTabular",
            value: function(e, t, n) {
                for (var r = t.getTabularSelectedKeys(), o = null, i = h.default.n__dx(e[t.fromLineIndex], t.fromCharIndex).block, a = 0; a < r.length; a++)
                    for (var u = r[a], l = i.elements[u], s = 0; s < l.lines.length; s++)
                        for (var f = l.lines[s], d = 0; d < f.blocks.length; d++) {
                            var p = f.blocks[d];
                            n && c.default.isComposite(p) || (o = null != o || null != p.style ? null != o ? this.intersectStyle(o, p.style || {}) : p.style : {})
                        }
                return o
            }
        }, {
            key: "setStyleForTabular",
            value: function(e, t, n, r) {
                for (var o = h.default.n__db(e), i = 0; i < t.length; i++) {
                    var a = t[i];
                    o.elements[a] = this.setStyleToEditor(e.elements[a], n, r)
                }
                return o
            }
        }, {
            key: "setBorderStyleForTabular",
            value: function(e, t, n) {
                var r = this
                  , o = h.default.n__db(e)
                  , a = h.default.n__di(t);
                switch (n) {
                case "full":
                case "none":
                    for (var u = 0; u < t.length; u++) {
                        var s = t[u]
                          , c = e.elements[s];
                        o.elements[s] = this.addBorderStyleForEditor(c, "full" == n ? i.Full : i.None)
                    }
                    return o
                }
                if ("outside" == n) {
                    l.default.range(a.minRow, a.maxRow + 1).map(function(e) {
                        return h.default.getKeyFromRowCol(e, a.minCol)
                    }).forEach(function(e) {
                        return o.elements[e] = r.addBorderStyleForEditor(o.elements[e], i.Left)
                    }),
                    l.default.range(a.minCol, a.maxCol + 1).map(function(e) {
                        return h.default.getKeyFromRowCol(a.minRow, e)
                    }).forEach(function(e) {
                        return o.elements[e] = r.addBorderStyleForEditor(o.elements[e], i.Top)
                    }),
                    l.default.range(a.minRow, a.maxRow + 1).map(function(e) {
                        return h.default.getKeyFromRowCol(e, a.maxCol)
                    }).forEach(function(e) {
                        var t = m.default.findCellFromKey(e, o);
                        o.elements[t] = r.addBorderStyleForEditor(o.elements[t], i.Right)
                    }),
                    l.default.range(a.minCol, a.maxCol + 1).map(function(e) {
                        return h.default.getKeyFromRowCol(a.maxRow, e)
                    }).forEach(function(e) {
                        var t = m.default.findCellFromKey(e, o);
                        o.elements[t] = r.addBorderStyleForEditor(o.elements[t], i.Bottom)
                    });
                    return o
                }
                if ("inside" == n) {
                    for (var f = a.minRow; f <= a.maxRow; f++)
                        for (var d = a.minCol; d <= a.maxCol; d++) {
                            var s = h.default.getKeyFromRowCol(f, d)
                              , c = o.elements[s]
                              , p = c.colSpan || 1
                              , y = c.rowSpan || 1;
                            f == a.minRow && f != a.maxRow && f + y - 1 < a.maxRow ? o.elements[s] = this.addBorderStyleForEditor(o.elements[s], i.Bottom) : f == a.maxRow && f != a.minRow ? o.elements[s] = this.addBorderStyleForEditor(o.elements[s], i.Top) : f != a.minRow && f != a.maxRow && (o.elements[s] = this.addBorderStyleForEditor(o.elements[s], i.Top),
                            f + y - 1 < a.maxRow && (o.elements[s] = this.addBorderStyleForEditor(o.elements[s], i.Bottom))),
                            d == a.minCol && d != a.maxCol && d + p - 1 < a.maxCol ? o.elements[s] = this.addBorderStyleForEditor(o.elements[s], i.Right) : d == a.maxCol && d != a.minCol ? o.elements[s] = this.addBorderStyleForEditor(o.elements[s], i.Left) : d != a.minCol && d != a.maxCol && (o.elements[s] = this.addBorderStyleForEditor(o.elements[s], i.Left),
                            d + p - 1 < a.maxCol && (o.elements[s] = this.addBorderStyleForEditor(o.elements[s], i.Right)))
                        }
                    return o
                }
                switch (n) {
                case "top":
                    l.default.range(a.minCol, a.maxCol + 1).map(function(e) {
                        return h.default.getKeyFromRowCol(a.minRow, e)
                    }).forEach(function(e) {
                        return o.elements[e] = r.addBorderStyleForEditor(o.elements[e], i.Top)
                    });
                    return o;
                case "middle":
                    for (var f = a.minRow; f <= a.maxRow; f++)
                        for (var d = a.minCol; d <= a.maxCol; d++) {
                            var s = h.default.getKeyFromRowCol(f, d)
                              , c = o.elements[s]
                              , p = c.colSpan || 1
                              , y = c.rowSpan || 1;
                            f == a.minRow && f != a.maxRow && f + y - 1 < a.maxRow ? o.elements[s] = this.addBorderStyleForEditor(o.elements[s], i.Bottom) : f == a.maxRow && f != a.minRow ? o.elements[s] = this.addBorderStyleForEditor(o.elements[s], i.Top) : f != a.minRow && f != a.maxRow && (o.elements[s] = this.addBorderStyleForEditor(o.elements[s], i.Top),
                            f + y - 1 < a.maxRow && (o.elements[s] = this.addBorderStyleForEditor(o.elements[s], i.Bottom)))
                        }
                    return o;
                case "bottom":
                    l.default.range(a.minCol, a.maxCol + 1).map(function(e) {
                        return h.default.getKeyFromRowCol(a.maxRow, e)
                    }).forEach(function(e) {
                        var t = m.default.findCellFromKey(e, o);
                        o.elements[t] = r.addBorderStyleForEditor(o.elements[t], i.Bottom)
                    });
                    return o;
                case "left":
                    l.default.range(a.minRow, a.maxRow + 1).map(function(e) {
                        return h.default.getKeyFromRowCol(e, a.minCol)
                    }).forEach(function(e) {
                        return o.elements[e] = r.addBorderStyleForEditor(o.elements[e], i.Left)
                    });
                    return o;
                case "center":
                    for (var f = a.minRow; f <= a.maxRow; f++)
                        for (var d = a.minCol; d <= a.maxCol; d++) {
                            var s = h.default.getKeyFromRowCol(f, d)
                              , c = o.elements[s]
                              , p = c.colSpan || 1
                              , y = c.rowSpan || 1;
                            d == a.minCol && d != a.maxCol && d + p - 1 < a.maxCol ? o.elements[s] = this.addBorderStyleForEditor(o.elements[s], i.Right) : d == a.maxCol && d != a.minCol ? o.elements[s] = this.addBorderStyleForEditor(o.elements[s], i.Left) : d != a.minCol && d != a.maxCol && (o.elements[s] = this.addBorderStyleForEditor(o.elements[s], i.Left),
                            d + p - 1 < a.maxCol && (o.elements[s] = this.addBorderStyleForEditor(o.elements[s], i.Right)))
                        }
                    return o;
                case "right":
                    l.default.range(a.minRow, a.maxRow + 1).map(function(e) {
                        return h.default.getKeyFromRowCol(e, a.maxCol)
                    }).forEach(function(e) {
                        var t = m.default.findCellFromKey(e, o);
                        o.elements[t] = r.addBorderStyleForEditor(o.elements[t], i.Right)
                    });
                    return o
                }
            }
        }, {
            key: "addBorderStyleForEditor",
            value: function(e, t) {
                if (t === i.Full || null == t)
                    return this.setStyleToEditor(e, "border", void 0);
                if (t === i.None)
                    return this.setStyleToEditor(e, "border", i.None);
                var n = this.getStyleForEditor(e, "border", i.Full);
                return n === i.Full ? e : (n |= t,
                this.setStyleToEditor(e, "border", n))
            }
        }, {
            key: "getIntersectEditorStyleForTabular",
            value: function(e, t, n) {
                for (var r = null, o = 0; o < t.length; o++) {
                    var i = t[o]
                      , a = e.elements[i];
                    null != r || null != a.style ? r = null != r ? this.intersectStyle(r, a.style || {}) : a.style : r = {}
                }
                return r
            }
        }, {
            key: "n__at",
            value: function(e, t, n) {
                var r = this;
                if (t.isSameRoute())
                    return {};
                if (t.isTabularRoute())
                    return this.getIntersectStyleForTabular(e, t, n);
                var o = null
                  , i = 0;
                return t.forEach(e, function(e, t, a, u) {
                    return ++i > 100 ? void u() : n && c.default.isComposite(e) ? void 0 : null == o && null == e.style ? void (o = {}) : null == o ? void (o = e.style) : void (o = r.intersectStyle(o, e.style || {}))
                }),
                o
            }
        }, {
            key: "intersectStyle",
            value: function(e, t) {
                var n = {};
                return l.default.keys(e).forEach(function(r) {
                    n[r] = "" !== n[r] && t[r] == e[r] ? e[r] : ""
                }),
                l.default.keys(t).forEach(function(r) {
                    n[r] = "" !== n[r] && t[r] == e[r] ? e[r] : ""
                }),
                n
            }
        }, {
            key: "getClassFromFontSizeCommand",
            value: function(e) {
                return " font-size-" + e.substr(1)
            }
        }, {
            key: "getClassFromStyle",
            value: function(e) {
                if (!e.style)
                    return "";
                if (e.style.mathType)
                    return "\\boldsymbol" == e.style.mathType ? "math-boldsymbol" : "\\text" == e.style.mathType ? "math-text" : "math-" + e.style.mathType.substr(5);
                var t = "";
                return e.style.fontSize && (t += this.getClassFromFontSizeCommand(e.style.fontSize)),
                e.style.isBold && (t += " font-bold"),
                e.style.isItalic && (t += " font-italic"),
                e.style.textDecoration && (t += " font-" + e.style.textDecoration),
                e.style.fontName && (t += " font-name-" + e.style.fontName),
                t
            }
        }, {
            key: "styleToLatex",
            value: function(e, t) {
                return t
            }
        }, {
            key: "lineStyleToLatex",
            value: function(e, t) {
                if ("listType" == e)
                    switch (t) {
                    case "order":
                        return "enumerate";
                    case "unorder":
                        return "itemize";
                    case "section":
                        return "second"
                    }
                if ("align" == e)
                    switch (t) {
                    case "left":
                        return "flushleft";
                    case "center":
                        return "center";
                    case "right":
                        return "flushright"
                    }
            }
        }, {
            key: "addStyleForMathContainer",
            value: function(e, t, n) {
                var r = this
                  , o = l.default.map(e.elements.mathValue.lines, function(e) {
                    var o = l.default.map(e.blocks, function(e) {
                        return r.addStyle(e, t, n)
                    });
                    return d.default.set(e, "blocks", o)
                });
                return d.default.set(e, "elements.mathValue.lines", o)
            }
        }]),
        e
    }();
    t.EditorBorderType = i,
    t.default = new v
}
, function(e, t, n) {
    var r = n(69);
    e.exports = function(e) {
        return Object(r(e))
    }
}
, function(e, t, n) {
    "use strict";
    function r(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function o(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
    function i(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var a = n(404)
      , u = function(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }(a);
    t.default = function(e) {
        function t(e) {
            r(this, t);
            var n = o(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e));
            return n.tagName = "opensymbolblock",
            n
        }
        return i(t, e),
        t
    }(u.default)
}
, function(e, t, n) {
    "use strict";
    function r(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function o(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
    function i(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var a = n(404)
      , u = function(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }(a);
    t.default = function(e) {
        function t(e) {
            r(this, t);
            var n = o(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e));
            return n.tagName = "closesymbolblock",
            n
        }
        return i(t, e),
        t
    }(u.default)
}
, function(e, t, n) {
    "use strict";
    function r(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function o(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
    function i(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var a = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , u = n(0)
      , l = function(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }(u);
    n(1153),
    t.default = function(e) {
        function t(e) {
            r(this, t);
            var n = o(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e));
            return n.renderEmpty = n.renderEmpty.bind(n),
            n
        }
        return i(t, e),
        a(t, [{
            key: "renderEmpty",
            value: function() {
                return l.default.createElement("div", {
                    className: "empty"
                })
            }
        }, {
            key: "render",
            value: function() {
                return l.default.createElement("div", {
                    className: "icon-pair-symbol"
                }, l.default.createElement("div", null, this.props.start), l.default.createElement("div", {
                    className: "square common-big-square-icon common-square-icon-expand"
                }), l.default.createElement("div", null, this.props.end ? this.props.end : this.renderEmpty()))
            }
        }]),
        t
    }(l.default.Component)
}
, function(e, t, n) {
    e.exports = {
        default: n(1409),
        __esModule: !0
    }
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var i = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , a = n(1)
      , u = r(a)
      , l = n(862)
      , s = r(l)
      , c = n(5)
      , f = r(c)
      , d = n(868)
      , p = r(d)
      , h = n(277)
      , y = JSON.parse(h.decompressFromBase64(p.default));
    t.default = new (function() {
        function e() {
            o(this, e),
            this.dollarSign = {
                symbol: "$",
                names: ["\\$"],
                searchText: "$ dollar",
                forceCreateModel: !0
            },
            this.backSlashSign = {
                symbol: "\\",
                names: ["\\backslash", "\\\\"],
                searchText: "\\ back slash",
                forceCreateModel: !0
            },
            this.initAll()
        }
        return i(e, [{
            key: "initAll",
            value: function() {
                if (null == this.symbols) {
                    (new Date).getTime();
                    this.customSymbolComponents = this.initCustomSymbols(),
                    this.textSymbols = y,
                    this.symbolMapByUnicodeChar = this.createSymbolMapByUnicodeChar(this.textSymbols),
                    this.fullSymbols = this.initData(this.textSymbols, this.customSymbolComponents),
                    this.symbols = this.fullSymbols,
                    this.recSymbols = this.buildRecSymbols(this.symbols),
                    this.symbolMap = this.createSymbolMapByName(this.symbols),
                    this.customSymbolMap = this.createCustomSymbolComponentMap(this.customSymbolComponents),
                    this.alphabetMap = this.getAlphabetMap(this.symbolMap)
                }
            }
        }, {
            key: "isCaseSymbol",
            value: function(e) {
                return "\\case" == e.text
            }
        }, {
            key: "getMetaDataByName",
            value: function(e) {
                var t = this.getCustomSymbolComponent(e);
                if (t.getModelMeta)
                    return t.getModelMeta()
            }
        }, {
            key: "tryReplaceWithMathAlphaBet",
            value: function(e) {
                var t = this;
                return u.default.map(e.split(""), function(e) {
                    return t.tryMathAlphaBetMap(e)
                }).join("")
            }
        }, {
            key: "recognize",
            value: function(e) {
                var t = this
                  , n = s.default.recognize(e);
                return u.default.map(n, function(e) {
                    return t.getByName(e.latex)
                })
            }
        }, {
            key: "getAlphabetMap",
            value: function(e) {
                var t = {}
                  , n = "abcdefghijklmnopqrstuvwxyz";
                return n.split("").forEach(function(e, n) {
                    if ("h" == e)
                        return void (t[e] = "ℎ");
                    t[e] = String.fromCharCode(55349) + String.fromCharCode(56398 + n)
                }),
                n.toUpperCase().split("").forEach(function(e, n) {
                    t[e] = String.fromCharCode(55349) + String.fromCharCode(56372 + n)
                }),
                t["-"] = "−",
                t
            }
        }, {
            key: "getLatexTextCommandFromUnicode",
            value: function(e) {
                var t = e.codePointAt(0);
                if (t >= 33 && t <= 126)
                    return null;
                var n = this.symbolMapByUnicodeChar[e];
                return n && u.default.startsWith(n.names[0], "\\") ? n.names[0] : null
            }
        }, {
            key: "getAllSymbols",
            value: function() {
                return this.symbols
            }
        }, {
            key: "getAllCompositeSymbols",
            value: function() {
                return this.customSymbolComponents
            }
        }, {
            key: "getRecognizableSymbols",
            value: function() {
                return this.recSymbols
            }
        }, {
            key: "getByName",
            value: function(e) {
                return this.symbolMap[e]
            }
        }, {
            key: "getModelByName",
            value: function(e) {
                var t = this.symbolMap[e];
                if ("composite" == t.type || "single" == t.type) {
                    return this.customSymbolMap[e].getModel(t)
                }
                return t.symbol
            }
        }, {
            key: "getLinesByInfo",
            value: function(e) {
                var t = this.symbolMap[e.names[0]];
                if (t.commandBlocks)
                    return {
                        lines: this.createLinesFromcommandBlocks(t.commandBlocks),
                        selected: t.selected
                    };
                throw new Error("Not implmented")
            }
        }, {
            key: "getModelByInfo",
            value: function(e) {
                return this.customSymbolMap[e.names[0]].getModel(e)
            }
        }, {
            key: "createLinesFromcommandBlocks",
            value: function(e) {
                var t = this
                  , n = u.default.map(e, function(e) {
                    return t.getModelByName(e)
                });
                return [f.default.n__dr(n)]
            }
        }, {
            key: "getView",
            value: function(e) {
                return this.customSymbolMap[e].getViewComponent()
            }
        }, {
            key: "getCustomSymbolComponent",
            value: function(e) {
                return this.customSymbolMap[e]
            }
        }, {
            key: "getDollarSign",
            value: function() {
                return this.dollarSign
            }
        }, {
            key: "getBackSlashSign",
            value: function() {
                return this.backSlashSign
            }
        }, {
            key: "categoryByUnicodeChar",
            value: function(e) {
                if ("-" == e)
                    return "Vary";
                var t = this.symbolMapByUnicodeChar[e];
                if (null == t)
                    return "Normal";
                if (null == t.category)
                    return "Normal";
                switch (t.category) {
                case "N":
                    return "Normal";
                case "A":
                    return "Alphabetic";
                case "B":
                    return "Binary";
                case "C":
                    return "Closing";
                case "D":
                    return "Diacritic";
                case "F":
                    return "Fence";
                case "G":
                    return "Glyph";
                case "L":
                    return "Large";
                case "O":
                    return "Opening";
                case "P":
                    return "Punctuation";
                case "R":
                    return "Relation";
                case "S":
                    return "Space";
                case "U":
                    return "Unary";
                case "V":
                    return "Vary";
                case "X":
                    return "Special"
                }
            }
        }, {
            key: "buildRecSymbols",
            value: function(e) {
                var t = s.default.n__cy()
                  , n = [];
                return u.default.map(t, function(t) {
                    var r = u.default.find(e, function(e) {
                        return e.names.indexOf(t.latex) >= 0
                    });
                    return r || (u.default.startsWith(t.latex, "\\") && n.push(t),
                    {
                        symbol: t.latex,
                        names: [t.latex],
                        searchText: t.latex
                    })
                })
            }
        }, {
            key: "createCustomSymbolComponentMap",
            value: function(e) {
                var t = {};
                return e.forEach(function(e) {
                    var n = e.getSymbolInfo();
                    u.default.isArray(n) ? n.forEach(function(n) {
                        n.names.forEach(function(n) {
                            t[n] = e
                        })
                    }) : n.names.forEach(function(n) {
                        t[n] = e
                    })
                }),
                t
            }
        }, {
            key: "createSymbolMapByName",
            value: function(e) {
                var t = {};
                return e.forEach(function(e) {
                    e.names.forEach(function(n) {
                        t[n] = e
                    })
                }),
                t
            }
        }, {
            key: "createSymbolMapByUnicodeChar",
            value: function(e) {
                var t = {};
                return e.forEach(function(e) {
                    e.isHidden || (t[e.symbol] = e)
                }),
                t
            }
        }, {
            key: "initData",
            value: function(e, t) {
                var n = e.concat([{
                    symbol: "^",
                    names: ["\\caret", "\\^"],
                    searchText: "^ caret",
                    forceCreateModel: !0
                }, {
                    symbol: "_",
                    names: ["\\underscore", "\\_"],
                    searchText: "_ underscore",
                    forceCreateModel: !0
                }, this.backSlashSign])
                  , r = u.default.flatMap(t, function(e) {
                    var t = e.getSymbolInfo();
                    return u.default.isArray(t) ? t : [t]
                });
                return n = u.default.filter(n, function(e) {
                    return e.names.indexOf("\\vec") < 0
                }),
                r.forEach(function(e) {
                    var t = n.findIndex(function(t) {
                        return t.names.indexOf(e.names[0]) >= 0
                    });
                    e.id = Math.random(),
                    t >= 0 ? n[t] = e : n.push(e)
                }),
                n.forEach(function(e) {
                    return e.id = Math.random()
                }),
                n
            }
        }, {
            key: "getImageBox",
            value: function() {
                return this.symbolMap["\\image-container"]
            }
        }, {
            key: "getMathchaText",
            value: function() {
                return this.symbolMap["\\mathcha"]
            }
        }, {
            key: "getDiagram",
            value: function() {
                return this.symbolMap["\\diagram"]
            }
        }, {
            key: "getInlineImageBox",
            value: function() {
                return this.symbolMap["\\inline-image"]
            }
        }, {
            key: "getDisplayMathContainer",
            value: function() {
                return this.symbolMap["\\math-container"]
            }
        }, {
            key: "getAlignContainer",
            value: function() {
                return this.symbolMap["\\align"]
            }
        }, {
            key: "getGatherContainer",
            value: function() {
                return this.symbolMap["\\gather"]
            }
        }, {
            key: "getMultilineContainer",
            value: function() {
                return this.symbolMap["\\multiline"]
            }
        }, {
            key: "getInlineMathContainer",
            value: function() {
                return this.symbolMap["\\inline-math"]
            }
        }, {
            key: "getTagRef",
            value: function() {
                return this.symbolMap["\\tag-ref"]
            }
        }, {
            key: "getTable",
            value: function() {
                return this.symbolMap["\\table"]
            }
        }, {
            key: "getTableOfContent",
            value: function() {
                return this.symbolMap["\\table-of-content"]
            }
        }, {
            key: "getDisplayMathContainerModel",
            value: function() {
                return this.customSymbolMap["\\math-container"].getModel(this.symbolMap["\\math-container"])
            }
        }, {
            key: "getInlineMathContainerModel",
            value: function() {
                return this.customSymbolMap["\\inline-math"].getModel(this.symbolMap["\\inline-math"])
            }
        }, {
            key: "tryMathAlphaBetMap",
            value: function(e) {
                return this.alphabetMap[e] || e
            }
        }, {
            key: "initCustomSymbols",
            value: function() {
                return u.default.map([n(869), n(873), n(878), n(879), n(880), n(881), n(882), n(405), n(883), n(406), n(884), n(407), n(888), n(891), n(892), n(893), n(894), n(895), n(896), n(897), n(898), n(899), n(900), n(901), n(902), n(903), n(904), n(905), n(906), n(907), n(908), n(909), n(910), n(279), n(919), n(920), n(923), n(926), n(282), n(933), n(934), n(936), n(940), n(945), n(949), n(953), n(957), n(958), n(960), n(206), n(171).arraySc, n(171).caseSc, n(171).matrixSc, n(171).gatheredSc, n(171).alignedSc, n(989), n(990), n(992), n(995), n(1e3), n(1031), n(1033), n(1034), n(1038), n(1039), n(1040), n(1041), n(1042), n(1043), n(1046), n(1047), n(1048), n(1049), n(1050), n(1051), n(1053), n(1054), n(1055), n(1056), n(1057), n(1059), n(1060), n(1063), n(1064), n(1067), n(1068), n(1070), n(430), n(433), n(1076), n(1080), n(1084), n(1088), n(1090), n(1092), n(1094), n(1095), n(1096), n(1097), n(1098), n(1099), n(1100), n(1101), n(1102), n(1103), n(1104), n(1105), n(1106), n(1107), n(1108), n(1109), n(1110), n(1111), n(1112), n(1113), n(1114), n(1115), n(1116), n(1117), n(1118), n(1119), n(1120), n(1121), n(1122), n(1123), n(1124), n(1125), n(1126), n(1127), n(1128), n(1129), n(1130), n(1131), n(1132), n(1133), n(1134), n(1135), n(436), n(1137), n(1138), n(1140), n(1141), n(1142), n(1143), n(1144), n(1145), n(1146), n(1147), n(1148), n(1149), n(1152), n(1154), n(1155), n(1156), n(1157), n(1158), n(1159), n(1160), n(1161), n(1162), n(1163), n(1164), n(1165), n(1166), n(1167), n(1168), n(1169), n(1170), n(1172), n(1403)], function(e) {
                    return e.default || e
                })
            }
        }]),
        e
    }())
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var i = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , a = n(1)
      , u = r(a)
      , l = n(5)
      , s = r(l)
      , c = n(4)
      , f = r(c);
    t.default = new (function() {
        function e() {
            o(this, e)
        }
        return i(e, [{
            key: "isColumHidden",
            value: function(e, t) {
                for (var n = 0; n < e.row; n++) {
                    if (!e.elements[s.default.getKeyFromRowCol(n, t)].hidden)
                        return !1
                }
                return !0
            }
        }, {
            key: "findCellFromKey",
            value: function(e, t) {
                if (!t.elements[e].hidden)
                    return e;
                for (var n = s.default.n__dj(e), r = 0; r < t.row; r++)
                    for (var o = 0; o < t.column; o++) {
                        var i = s.default.getKeyFromRowCol(r, o)
                          , a = t.elements[i];
                        if (a.colSpan || a.rowSpan) {
                            var u = a.colSpan || 1
                              , l = a.rowSpan || 1;
                            if (n.column >= o && o + u > n.column && n.row >= r && r + l > n.row)
                                return i
                        }
                    }
                return null
            }
        }, {
            key: "getRightAvailableCellKey",
            value: function(e, t) {
                var n = s.default.n__dj(e)
                  , r = n.column + (t.elements[e].colSpan || 1);
                return r >= t.column ? null : this.findCellFromKey(s.default.getKeyFromRowCol(n.row, r), t)
            }
        }, {
            key: "getLeftAvailableCellKey",
            value: function(e, t) {
                var n = s.default.n__dj(e)
                  , r = n.column - 1;
                return r < 0 ? null : this.findCellFromKey(s.default.getKeyFromRowCol(n.row, r), t)
            }
        }, {
            key: "getAboveAvailableCellKey",
            value: function(e, t) {
                var n = s.default.n__dj(e)
                  , r = n.row - 1;
                return r < 0 ? null : this.findCellFromKey(s.default.getKeyFromRowCol(r, n.column), t)
            }
        }, {
            key: "getBelowAvailableCellKey",
            value: function(e, t) {
                var n = s.default.n__dj(e)
                  , r = n.row + (t.elements[e].rowSpan || 1);
                return r >= t.row ? null : this.findCellFromKey(s.default.getKeyFromRowCol(r, n.column), t)
            }
        }, {
            key: "isMergable",
            value: function(e, t) {
                for (var n = s.default.n__di(e), r = {}, o = n.minRow; o <= n.maxRow; o++)
                    for (var i = n.minCol; i <= n.maxCol; i++) {
                        var a = s.default.getKeyFromRowCol(o, i)
                          , l = t.elements[a];
                        if (!l.hidden)
                            if (l.colSpan || l.rowSpan)
                                for (var c = l.colSpan || 1, f = l.rowSpan || 1, d = o; d < o + f; d++)
                                    for (var p = i; p < i + c; p++) {
                                        var h = s.default.getKeyFromRowCol(d, p);
                                        r[h] = !0
                                    }
                            else
                                r[a] = !0
                    }
                for (var n = s.default.n__di(u.default.keys(r)), o = n.minRow; o <= n.maxRow; o++)
                    for (var i = n.minCol; i <= n.maxCol; i++) {
                        var a = s.default.getKeyFromRowCol(o, i);
                        if (!r[a])
                            return !1
                    }
                return !0
            }
        }, {
            key: "getRangedKeys",
            value: function(e, t) {
                for (var n = s.default.n__di([e, t]), r = [], o = n.minRow; o <= n.maxRow; o++)
                    for (var i = n.minCol; i <= n.maxCol; i++)
                        r.push(s.default.getKeyFromRowCol(o, i));
                return r
            }
        }, {
            key: "getTabularKeysSelected",
            value: function(e) {
                return e.isTabularCellsSelected() ? e.getTabularCellKeysSelected() : [s.default.findLeafParentSelected(e.getJointSelected()).key]
            }
        }, {
            key: "modifyEditors",
            value: function(e, t, n) {
                for (var r = s.default.n__db(e), o = 0; o < t.length; o++) {
                    var i = t[o];
                    r.elements[i] = n(e.elements[i], i)
                }
                return r
            }
        }, {
            key: "mergeCells",
            value: function(e, t) {
                for (var n = s.default.n__db(e), r = s.default.n__di(t), o = u.default.clone(e.elements[s.default.getKeyFromRowCol(r.minRow, r.minCol)]), i = r.maxCol, a = r.maxRow, l = r.minRow; l <= r.maxRow; l++)
                    for (var c = r.minCol; c <= r.maxCol; c++) {
                        var f = s.default.getKeyFromRowCol(l, c);
                        if (l != r.minRow || c != r.minCol) {
                            var d = n.elements[f];
                            (d.lines.length > 1 || !s.default.isEmptyLine(d.lines[0])) && (o.lines = o.lines.concat(d.lines)),
                            n.elements[f] = s.default.n__dt(),
                            n.elements[f].hidden = !0,
                            e.elements[f].colSpan && c + e.elements[f].colSpan - 1 > i && (i = c + e.elements[f].colSpan - 1),
                            e.elements[f].rowSpan && l + e.elements[f].rowSpan - 1 > a && (a = l + e.elements[f].rowSpan - 1)
                        } else
                            n.elements[f] = o
                    }
                return i > r.minCol && (o.colSpan = i - r.minCol + 1),
                a > r.minRow && (o.rowSpan = a - r.minRow + 1),
                n
            }
        }, {
            key: "unmergeCells",
            value: function(e, t) {
                for (var n = s.default.n__db(e), r = u.default.clone(n.elements[t]), o = s.default.n__dj(t), i = o.row; i < o.row + (r.rowSpan || 1); i++)
                    for (var a = o.column; a < o.column + (r.colSpan || 1); a++) {
                        var l = s.default.getKeyFromRowCol(i, a);
                        l != t && (n.elements[l] = f.default.setProp(n.elements[l], "hidden", void 0))
                    }
                return r.colSpan = void 0,
                r.rowSpan = void 0,
                n.elements[t] = r,
                n
            }
        }, {
            key: "normalizeCells",
            value: function(e) {
                var t = s.default.n__db(e);
                return t = this.expandRowColumnFromSpan(t),
                t = this.fillMissingElement(t),
                t = this.hideElementsInSpan(t),
                t = this.showElementsNotInSpan(t),
                t = this.makeSureNoWidthForHiddenColumn(t)
            }
        }, {
            key: "makeSureNoWidthForHiddenColumn",
            value: function(e) {
                if (!e.columnWidths)
                    return e;
                for (var t = u.default.clone(e), n = 0; n < e.column; n++)
                    e.columnWidths[n] && this.isColumHidden(e, n) && (t.columnWidths = f.default.setIndex(t.columnWidths, n, void 0));
                return t
            }
        }, {
            key: "recalculateColumnWidth",
            value: function(e, t) {
                if (!e.columnWidths)
                    return e;
                var n = u.default.clone(e);
                n = this.makeSureNoWidthForHiddenColumn(e);
                var r = u.default.sumBy(u.default.range(0, e.column), function(t) {
                    return e.columnWidths[t] || 0
                }) + (e.column - 1)
                  , o = u.default.sumBy(u.default.range(0, e.column), function(t) {
                    return e.columnWidths[t] ? 0 : 1
                });
                if (t - r > 10 * o)
                    return e;
                var i = e.column - o
                  , a = 10 * o - (t - r)
                  , l = Math.ceil(a / i)
                  , s = 0
                  , c = a;
                return n.columnWidths = u.default.map(n.columnWidths, function(e) {
                    if (!e)
                        return e;
                    if (s == i - 1)
                        return e - c;
                    s++;
                    var t = e - l;
                    return c -= l,
                    t
                }),
                n
            }
        }, {
            key: "fillMissingElement",
            value: function(e) {
                for (var t = 0; t < e.row; t++)
                    for (var n = 0; n < e.column; n++) {
                        var r = s.default.getKeyFromRowCol(t, n);
                        e.elements[r] || (e.elements[r] = s.default.n__dt())
                    }
                return e
            }
        }, {
            key: "hideElementsInSpan",
            value: function(e) {
                for (var t = 0; t < e.row; t++)
                    for (var n = 0; n < e.column; n++) {
                        var r = s.default.getKeyFromRowCol(t, n)
                          , o = e.elements[r];
                        (o.colSpan || o.rowSpan) && (e = this.hideFromCellSpan(e, o, t, n))
                    }
                return e
            }
        }, {
            key: "showElementsNotInSpan",
            value: function(e) {
                for (var t = {}, n = 0; n < e.row; n++)
                    for (var r = 0; r < e.column; r++) {
                        var o = s.default.getKeyFromRowCol(n, r)
                          , i = e.elements[o];
                        if (i.colSpan || i.rowSpan)
                            for (var a = i.colSpan || 1, u = i.rowSpan || 1, l = n; l < n + u; l++)
                                for (var c = r; c < r + a; c++)
                                    if (l != n || c != r) {
                                        var d = s.default.getKeyFromRowCol(l, c);
                                        t[d] = !0
                                    }
                    }
                for (var n = 0; n < e.row; n++)
                    for (var r = 0; r < e.column; r++) {
                        var o = s.default.getKeyFromRowCol(n, r)
                          , i = e.elements[o];
                        i.hidden && !t[o] && (e.elements[o] = f.default.setProp(i, "hidden", void 0))
                    }
                return e
            }
        }, {
            key: "hideFromCellSpan",
            value: function(e, t, n, r) {
                for (var o = t.colSpan || 1, i = t.rowSpan || 1, a = n; a < n + i; a++)
                    for (var u = r; u < r + o; u++)
                        if (a != n || u != r) {
                            var l = s.default.getKeyFromRowCol(a, u)
                              , c = e.elements[l];
                            c.hidden || (e.elements[l] = f.default.setProp(c, "hidden", !0))
                        }
                return e
            }
        }, {
            key: "expandRowColumnFromSpan",
            value: function(e) {
                for (var t = 0; t < e.row; t++)
                    for (var n = 0; n < e.column; n++) {
                        var r = s.default.getKeyFromRowCol(t, n)
                          , o = e.elements[r];
                        o && (o.colSpan && o.colSpan + n > e.column && (e.column = o.colSpan + n),
                        o.rowSpan && o.rowSpan + t > e.row && (e.row = o.rowSpan + t))
                    }
                return e
            }
        }, {
            key: "replaceWith",
            value: function(e, t, n) {
                for (var r = s.default.n__dj(t), o = s.default.n__db(e), i = 0; i < n.row; i++)
                    for (var a = 0; a < n.column; a++) {
                        var u = s.default.getKeyFromRowCol(i + r.row, a + r.column)
                          , l = s.default.getKeyFromRowCol(i, a);
                        o.elements[u] = n.elements[l]
                    }
                return o.row = Math.max(o.row, r.row + n.row),
                o.column = Math.max(o.column, r.column + n.column),
                this.normalizeCells(o)
            }
        }, {
            key: "insertNewRowBelow",
            value: function(e, t) {
                for (var n = s.default.n__dj(t), r = s.default.n__db(e), o = e.elements[t], i = n.row + (o.rowSpan || 1), a = i; a < e.row; a++)
                    for (var u = 0; u < e.column; u++) {
                        var l = s.default.getKeyFromRowCol(a, u)
                          , c = s.default.getKeyFromRowCol(a + 1, u);
                        r.elements[c] = e.elements[l]
                    }
                for (var u = 0; u < e.column; u++) {
                    var l = s.default.getKeyFromRowCol(i, u);
                    r.elements[l] = s.default.n__dt(),
                    r.elements[l].style = e.elements[t].style
                }
                return r = this.adjustHLinesOneRowDown(r, n.row),
                r.row++,
                s.default.isTable(r) ? (r = this.mergeNewRowToMergedRows(r, i),
                this.insertNewRowBelowForTablePost(r, t)) : r
            }
        }, {
            key: "mergeNewRowToMergedRows",
            value: function(e, t) {
                for (var n = 0; n < e.row; n++)
                    for (var r = 0; r < e.column; r++) {
                        var o = s.default.getKeyFromRowCol(n, r)
                          , i = e.elements[o];
                        !i.hidden && i.rowSpan && t >= n && n + i.rowSpan > t && (e.elements[o] = f.default.setProp(i, "rowSpan", i.rowSpan + 1),
                        this.setHiddenForRow(e, t, r, r + (i.colSpan || 1) - 1))
                    }
                return e
            }
        }, {
            key: "setHiddenForRow",
            value: function(e, t, n, r) {
                for (var o = n; o <= r; o++) {
                    var i = s.default.getKeyFromRowCol(t, o);
                    e.elements[i] = f.default.setProp(e.elements[i], "hidden", !0)
                }
            }
        }, {
            key: "mergeNewColumnToMergedColumns",
            value: function(e, t) {
                for (var n = 0; n < e.column; n++)
                    for (var r = 0; r < e.row; r++) {
                        var o = s.default.getKeyFromRowCol(r, n)
                          , i = e.elements[o];
                        !i.hidden && i.colSpan && t >= n && n + i.colSpan > t && (e.elements[o] = f.default.setProp(i, "colSpan", i.colSpan + 1),
                        this.setHiddenForColumn(e, t, r, r + (i.rowSpan || 1) - 1))
                    }
                return e
            }
        }, {
            key: "setHiddenForColumn",
            value: function(e, t, n, r) {
                for (var o = n; o <= r; o++) {
                    var i = s.default.getKeyFromRowCol(o, t);
                    e.elements[i] = f.default.setProp(e.elements[i], "hidden", !0)
                }
            }
        }, {
            key: "insertNewRowBelowForTablePost",
            value: function(e, t) {
                if (!e.rowHeights)
                    return e;
                var n = s.default.n__dj(t);
                return e.rowHeights = f.default.insert(e.rowHeights, n.row + 1, null),
                n.row < e.row - 2 ? e.rowHeights[n.row + 2] && (e.rowHeights[n.row + 2] -= 50,
                e.rowHeights[n.row + 1] = 50) : e.rowHeights[n.row] && (e.rowHeights[n.row] -= 50,
                e.rowHeights[n.row + 1] = 50),
                e
            }
        }, {
            key: "insertNewRowAbove",
            value: function(e, t) {
                for (var n = s.default.n__dj(t), r = s.default.n__db(e), o = n.row; o < e.row; o++)
                    for (var i = 0; i < e.column; i++) {
                        var a = s.default.getKeyFromRowCol(o, i)
                          , u = s.default.getKeyFromRowCol(o + 1, i);
                        r.elements[u] = e.elements[a]
                    }
                for (var i = 0; i < e.column; i++) {
                    var a = s.default.getKeyFromRowCol(n.row, i);
                    r.elements[a] = s.default.n__dt(),
                    r.elements[a].style = e.elements[t].style
                }
                return r.row++,
                s.default.isTable(r) ? (r = this.mergeNewRowToMergedRows(r, n.row),
                this.insertNewRowAboveForTablePost(r, t)) : r
            }
        }, {
            key: "insertNewRowAboveForTablePost",
            value: function(e, t) {
                if (!e.rowHeights)
                    return e;
                var n = s.default.n__dj(t);
                return e.rowHeights = f.default.insert(e.rowHeights, n.row, null),
                e.rowHeights[n.row] && (e.rowHeights[n.row] -= 50,
                e.rowHeights[n.row - 1] = 50),
                e
            }
        }, {
            key: "insertColumnOnLeft",
            value: function(e, t) {
                for (var n = s.default.n__dj(t), r = s.default.n__db(e), o = n.column; o < e.column; o++)
                    for (var i = 0; i < e.row; i++) {
                        var a = s.default.getKeyFromRowCol(i, o)
                          , u = s.default.getKeyFromRowCol(i, o + 1);
                        r.elements[u] = e.elements[a]
                    }
                for (var i = 0; i < e.row; i++) {
                    var a = s.default.getKeyFromRowCol(i, n.column);
                    r.elements[a] = s.default.n__dt(),
                    r.elements[a].style = e.elements[t].style
                }
                return r.column++,
                s.default.isTable(r) ? (r = this.mergeNewColumnToMergedColumns(r, n.column),
                this.insertColumnOnLeftForTablePost(r, t)) : r
            }
        }, {
            key: "insertColumnOnLeftForTablePost",
            value: function(e, t) {
                if (!e.columnWidths)
                    return e;
                var n = s.default.n__dj(t);
                e.columnWidths = f.default.insert(e.columnWidths, n.column, null),
                e.columnWidths[n.column] = 50;
                var r = this.findColumnToReduceWidth(e, n.column);
                return r && (e.columnWidths[r] -= 50),
                e
            }
        }, {
            key: "findColumnToReduceWidth",
            value: function(e, t) {
                if (!e.columnWidths)
                    throw new Error("not supported");
                for (var n = t + 1; n < e.columnWidths.length; n++) {
                    var r = e.columnWidths[n];
                    if (r && r > 50)
                        return n
                }
                for (var n = t - 1; n >= 0; n--) {
                    var r = e.columnWidths[n];
                    if (r && r > 50)
                        return n
                }
                return null
            }
        }, {
            key: "insertColumnOnRight",
            value: function(e, t) {
                for (var n = s.default.n__dj(t), r = s.default.n__db(e), o = e.elements[t], i = n.column + (o.colSpan || 1), a = i; a < e.column; a++)
                    for (var u = 0; u < e.row; u++) {
                        var l = s.default.getKeyFromRowCol(u, a)
                          , c = s.default.getKeyFromRowCol(u, a + 1);
                        r.elements[c] = e.elements[l]
                    }
                for (var u = 0; u < e.row; u++) {
                    var l = s.default.getKeyFromRowCol(u, i);
                    r.elements[l] = s.default.n__dt(),
                    r.elements[l].style = e.elements[t].style
                }
                return r.column++,
                s.default.isTable(r) ? (r = this.mergeNewColumnToMergedColumns(r, i),
                this.insertColumnOnRightForTablePost(r, i)) : r
            }
        }, {
            key: "insertColumnOnRightForTablePost",
            value: function(e, t) {
                if (!e.columnWidths)
                    return e;
                e.columnWidths = f.default.insert(e.columnWidths, t, null),
                e.columnWidths[t] = 50;
                var n = this.findColumnToReduceWidth(e, t);
                return n && (e.columnWidths[n] -= 50),
                e
            }
        }, {
            key: "removeColumns",
            value: function(e, t) {
                var n = this
                  , r = e
                  , o = u.default.chain(t).flatMap(function(t) {
                    var n = e.elements[t];
                    if (!n.colSpan)
                        return [t];
                    var r = s.default.n__dj(t);
                    return u.default.map(u.default.range(r.column, r.column + n.colSpan), function(e) {
                        return s.default.getKeyFromRowCol(r.row, e)
                    })
                }).map(function(e) {
                    return s.default.n__dj(e).column
                }).uniq().orderBy(function(e) {
                    return e
                }, "desc").value();
                return u.default.forEach(o, function(e) {
                    return r = n.removeColumn(r, "0_" + e)
                }),
                r
            }
        }, {
            key: "removeColumn",
            value: function(e, t) {
                for (var n = s.default.n__dj(t), r = s.default.n__db(e), o = n.column; o < e.column - 1; o++)
                    for (var i = 0; i < e.row; i++) {
                        var a = s.default.getKeyFromRowCol(i, o)
                          , u = s.default.getKeyFromRowCol(i, o + 1);
                        r.elements[a] = e.elements[u],
                        o == n.column && e.elements[a].colSpan && (r.elements[a] = f.default.update(r.elements[a], {
                            hidden: void 0,
                            colSpan: e.elements[a].colSpan <= 2 ? void 0 : e.elements[a].colSpan - 1,
                            rowSpan: e.elements[a].rowSpan
                        }))
                    }
                return r.column--,
                r = this.decreaseColSpanWithRemovedColumn(r, n.column),
                r = this.deleteLastRedundantColumn(r),
                r = this.normalizeCells(r),
                s.default.isTable(r) && r.columnWidths && (r.columnWidths = f.default.remove(r.columnWidths, n.column)),
                r
            }
        }, {
            key: "deleteLastRedundantColumn",
            value: function(e) {
                for (var t = 0; t < e.row; t++) {
                    var n = s.default.getKeyFromRowCol(t, e.column);
                    e.elements[n] && delete e.elements[n];
                    var n = s.default.getKeyFromRowCol(t, e.column + 1);
                    e.elements[n] && delete e.elements[n]
                }
                return e
            }
        }, {
            key: "deleteLastRedundantRow",
            value: function(e) {
                for (var t = 0; t < e.column; t++) {
                    var n = s.default.getKeyFromRowCol(e.row, t);
                    e.elements[n] && delete e.elements[n];
                    var n = s.default.getKeyFromRowCol(e.row + 1, t);
                    e.elements[n] && delete e.elements[n]
                }
                return e
            }
        }, {
            key: "decreaseColSpanWithRemovedColumn",
            value: function(e, t) {
                for (var n = 0; n < e.column; n++)
                    for (var r = 0; r < e.row; r++) {
                        var o = s.default.getKeyFromRowCol(r, n)
                          , i = e.elements[o];
                        i.colSpan && n < t && n + i.colSpan > t && (e.elements[o] = f.default.setProp(e.elements[o], "colSpan", e.elements[o].colSpan <= 2 ? void 0 : e.elements[o].colSpan - 1))
                    }
                return e
            }
        }, {
            key: "decreaseRowSpanWithRemovedRow",
            value: function(e, t) {
                for (var n = 0; n < e.column; n++)
                    for (var r = 0; r < e.row; r++) {
                        var o = s.default.getKeyFromRowCol(r, n)
                          , i = e.elements[o];
                        i.rowSpan && r < t && r + i.rowSpan > t && (e.elements[o] = f.default.setProp(e.elements[o], "rowSpan", e.elements[o].rowSpan <= 2 ? void 0 : e.elements[o].rowSpan - 1))
                    }
                return e
            }
        }, {
            key: "adjustHLinesOneRowDown",
            value: function(e, t) {
                if (!e.hLines)
                    return e;
                for (var n = u.default.clone(e.hLines), r = 0; r < e.hLines.length; r++) {
                    var o = e.hLines[r];
                    o == t && n.push(t),
                    o >= t && (n[r] = o + 1)
                }
                return e.hLines = n,
                e
            }
        }, {
            key: "removeRows",
            value: function(e, t) {
                var n = this
                  , r = e
                  , o = u.default.chain(t).flatMap(function(t) {
                    var n = e.elements[t];
                    if (!n.rowSpan)
                        return [t];
                    var r = s.default.n__dj(t);
                    return u.default.map(u.default.range(r.row, r.row + n.rowSpan), function(e) {
                        return s.default.getKeyFromRowCol(e, r.column)
                    })
                }).map(function(e) {
                    return s.default.n__dj(e).row
                }).uniq().orderBy(function(e) {
                    return e
                }, "desc").value();
                return u.default.forEach(o, function(e) {
                    return r = n.removeCurrentRow(r, e + "_0")
                }),
                r
            }
        }, {
            key: "removeCurrentRow",
            value: function(e, t) {
                for (var n = s.default.n__dj(t), r = s.default.n__db(e), o = n.row; o < e.row - 1; o++)
                    for (var i = 0; i < e.column; i++) {
                        var a = s.default.getKeyFromRowCol(o, i)
                          , u = s.default.getKeyFromRowCol(o + 1, i);
                        r.elements[a] = e.elements[u]
                    }
                for (var i = 0; i < e.column; i++) {
                    var a = s.default.getKeyFromRowCol(e.row - 1, i);
                    delete r.elements[a]
                }
                return r = this.removeRowHAlign(r, n.row),
                r.row--,
                r = this.decreaseRowSpanWithRemovedRow(r, n.row),
                r = this.deleteLastRedundantRow(r),
                r = this.normalizeCells(r)
            }
        }, {
            key: "removeRowHAlign",
            value: function(e, t) {
                if (!e.hLines)
                    return e;
                for (var n = u.default.clone(e.hLines), r = 0; r < e.hLines.length; r++) {
                    var o = e.hLines[r];
                    o > t && (n[r] = o - 1)
                }
                return n = u.default.uniq(n),
                e.hLines = n,
                e
            }
        }, {
            key: "adjustModelByRowCollumn",
            value: function(e, t, n) {
                var r = u.default.clone(e);
                r.elements = u.default.clone(e.elements),
                r.row = t,
                r.column = n;
                for (var o = 0; o < t; o++)
                    for (var i = 0; i < n; i++) {
                        var a = o + "_" + i;
                        r.elements[a] || (r.elements[a] = s.default.n__dt())
                    }
                return r
            }
        }]),
        e
    }())
}
, function(e, t) {
    var n = {}.hasOwnProperty;
    e.exports = function(e, t) {
        return n.call(e, t)
    }
}
, function(e, t, n) {
    "use strict";
    var r = !("undefined" == typeof window || !window.document || !window.document.createElement);
    e.exports = {
        canUseDOM: r,
        canUseWorkers: "undefined" != typeof Worker,
        canUseEventListeners: r && !(!window.addEventListener && !window.attachEvent),
        canUseViewport: r && !!window.screen,
        isInWorker: !r
    }
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var i = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , a = n(1)
      , u = r(a)
      , l = n(4)
      , s = r(l);
    t.default = new (function() {
        function e() {
            o(this, e)
        }
        return i(e, [{
            key: "setLeftGeoPos",
            value: function(e, t) {
                return s.default.set(e, "left", t)
            }
        }, {
            key: "setTopGeoPos",
            value: function(e, t) {
                return s.default.set(e, "top", t)
            }
        }, {
            key: "n__gu",
            value: function(e, t) {
                for (var n = e[0], r = 999999, o = 0; o < e.length; o++) {
                    var i = e[o].rect;
                    if (t.top >= i.top && t.top <= i.bottom)
                        return e[o];
                    var a = t.top > i.bottom ? t.top - i.bottom : i.top - t.top;
                    a < r && (n = e[o],
                    r = a)
                }
                return n
            }
        }, {
            key: "n__gv",
            value: function(e, t) {
                var n = this
                  , r = u.default.filter(e, function(e) {
                    return n.n__hk(e, t)
                });
                return r.length <= 0 ? null : u.default.minBy(r, function(e) {
                    return n.n__ha(e, t)
                })
            }
        }, {
            key: "n__gw",
            value: function(e, t) {
                var n = this
                  , r = u.default.filter(e, function(e) {
                    return n.n__hn(e, t)
                });
                return r.length <= 0 ? null : u.default.minBy(r, function(e) {
                    return n.n__ha(e, t)
                })
            }
        }, {
            key: "n__gx",
            value: function(e, t) {
                var n = this
                  , r = u.default.filter(e, function(e) {
                    return n.n__hf(e, t)
                });
                return r.length <= 0 ? null : u.default.minBy(r, function(e) {
                    return n.n__ha(e, t)
                })
            }
        }, {
            key: "n__gy",
            value: function(e, t) {
                var n = this
                  , r = u.default.filter(e, function(e) {
                    return n.n__hh(e, t)
                });
                return r.length <= 0 ? null : u.default.minBy(r, function(e) {
                    return n.n__ha(e, t)
                })
            }
        }, {
            key: "n__gz",
            value: function(e, t) {
                var n = this;
                return u.default.minBy(e, function(e) {
                    return n.n__hb(e, t)
                })
            }
        }, {
            key: "n__ha",
            value: function(e, t) {
                var n = this.minCloseTo(t.left, e.rect.left, e.rect.right)
                  , r = this.minCloseTo(t.top, e.rect.top, e.rect.bottom);
                return this.n__hc(e, t) ? Math.abs(n - t.left) : this.n__he(e, t) ? Math.abs(r - t.top) : this.distance2Pos({
                    left: n,
                    top: r
                }, t)
            }
        }, {
            key: "n__hb",
            value: function(e, t) {
                if (this.n__he(e, t))
                    return 0;
                var n = this.minCloseTo(t.left, e.rect.left, e.rect.right);
                return Math.abs(t.left - n)
            }
        }, {
            key: "distance2Pos",
            value: function(e, t) {
                return Math.sqrt((e.left - t.left) * (e.left - t.left) + (e.top - t.top) * (e.top - t.top))
            }
        }, {
            key: "minMargin",
            value: function(e, t, n) {
                var r = Math.abs(t - e)
                  , o = Math.abs(n - e);
                return Math.min(r, o)
            }
        }, {
            key: "minCloseTo",
            value: function(e, t, n) {
                return Math.abs(t - e) < Math.abs(n - e) ? t : n
            }
        }, {
            key: "n__hc",
            value: function(e, t) {
                return e.rect.bottom >= t.top && e.rect.top <= t.top
            }
        }, {
            key: "n__hd",
            value: function(e, t, n) {
                return n || (n = 0),
                e.bottom >= t.top - n && e.top <= t.top + n
            }
        }, {
            key: "n__he",
            value: function(e, t, n) {
                return n || (n = 0),
                e.rect.right + n >= t.left && e.rect.left - n <= t.left
            }
        }, {
            key: "n__hf",
            value: function(e, t) {
                return e.rect.bottom < t.top
            }
        }, {
            key: "n__hg",
            value: function(e, t) {
                return e.rect.top < t.top
            }
        }, {
            key: "isRectMiddleAboveOf",
            value: function(e, t) {
                return e.rect.top + e.rect.height / 2 < t.top
            }
        }, {
            key: "n__hh",
            value: function(e, t) {
                return e.rect.top > t.top
            }
        }, {
            key: "n__hi",
            value: function(e, t) {
                return e.rect.bottom > t.top
            }
        }, {
            key: "n__hj",
            value: function(e, t) {
                return e.rect.bottom - e.rect.height / 2 > t.top
            }
        }, {
            key: "n__hk",
            value: function(e, t) {
                return e.rect.right < t.left
            }
        }, {
            key: "n__hl",
            value: function(e, t) {
                return e.rect.right < t.rect.left
            }
        }, {
            key: "n__hm",
            value: function(e, t) {
                return e.right < t.left
            }
        }, {
            key: "n__hn",
            value: function(e, t) {
                return e.rect.left > t.left
            }
        }, {
            key: "n__ho",
            value: function(e, t) {
                return e.left > t.left
            }
        }, {
            key: "n__hp",
            value: function(e, t) {
                return e.rect.top >= t.top
            }
        }, {
            key: "n__hq",
            value: function(e, t) {
                return e.rect.bottom <= t.top
            }
        }, {
            key: "n__hr",
            value: function(e, t) {
                return t.left < e.rect.left + (e.rect.right - e.rect.left) / 2
            }
        }, {
            key: "toPosition",
            value: function(e, t) {
                return {
                    left: e,
                    top: t
                }
            }
        }, {
            key: "getRelativeRect",
            value: function(e, t, n) {
                return n = void 0 === n ? 0 : n,
                {
                    left: e.left - t.left - n,
                    top: e.top - t.top - n,
                    width: e.width + 2 * n,
                    height: e.height + 2 * n,
                    right: e.left - t.left + e.width + n,
                    bottom: e.top - t.top + e.height + n
                }
            }
        }, {
            key: "n__hs",
            value: function(e, t) {
                var n = Math.max(e.left, t.left)
                  , r = Math.min(e.right, t.right)
                  , o = Math.max(e.top, t.top)
                  , i = Math.min(e.bottom, t.bottom);
                return {
                    left: n,
                    right: r,
                    top: o,
                    bottom: i,
                    width: r - n,
                    height: i - o
                }
            }
        }, {
            key: "n__ht",
            value: function(e, t) {
                return {
                    left: Math.max(Math.min(e.left, t.right), t.left),
                    top: Math.max(Math.min(e.top, t.bottom), t.top)
                }
            }
        }, {
            key: "isIntersect",
            value: function(e, t) {
                return !(t.left >= e.right || t.right <= e.left || Math.round(t.top) >= Math.round(e.bottom) - 1 || Math.round(t.bottom) <= Math.round(e.top) + 1)
            }
        }, {
            key: "emptyRect",
            value: function() {
                return {
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: 0,
                    height: 0
                }
            }
        }, {
            key: "n__hu",
            value: function(e, t) {
                return 0 == t ? e : {
                    left: e.left,
                    right: e.right,
                    width: e.width,
                    top: e.top - t,
                    bottom: e.bottom + t,
                    height: e.height + 2 * t
                }
            }
        }]),
        e
    }())
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var i = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , a = n(844)
      , u = r(a)
      , l = n(1)
      , s = r(l)
      , c = n(845)
      , f = r(c)
      , d = f.default
      , p = new u.default
      , h = function() {
        function e(t) {
            o(this, e),
            this.text = t
        }
        return i(e, [{
            key: "clusterAt",
            value: function(e) {
                return this.text.charAt(e)
            }
        }, {
            key: "clusterIndexAt",
            value: function(e) {
                return e
            }
        }, {
            key: "rawIndexAt",
            value: function(e) {
                return e
            }
        }, {
            key: "charAt",
            value: function(e) {
                return this.text.charAt(e)
            }
        }, {
            key: "slice",
            value: function(e, t) {
                return this.text.slice(e, t)
            }
        }, {
            key: "substring",
            value: function(e, t) {
                return this.text.substring(e, t)
            }
        }, {
            key: "substr",
            value: function(e, t) {
                return this.text.substr(e, t)
            }
        }, {
            key: "getClusterIndexFromUTF16Index",
            value: function(e) {
                return e
            }
        }, {
            key: "charCodeAt",
            value: function(e) {
                return this.text.charCodeAt(e)
            }
        }, {
            key: "length",
            get: function() {
                return this.text.length
            }
        }]),
        e
    }()
      , y = {
        text: null,
        uniStr: null
    };
    t.default = new (function() {
        function e() {
            o(this, e)
        }
        return i(e, [{
            key: "getUnistring",
            value: function(e) {
                return this.buildOrGetCacheUnistring(e)
            }
        }, {
            key: "getUnistringUncached",
            value: function(e) {
                return this.createUniString(e)
            }
        }, {
            key: "length",
            value: function(e) {
                return s.default.isString(e) ? p.countGraphemes(e) : e.length
            }
        }, {
            key: "lengthByCache",
            value: function(e) {
                return this.buildOrGetCacheUnistring(e).length
            }
        }, {
            key: "charAt",
            value: function(e, t) {
                return this.buildOrGetCacheUnistring(e).clusterAt(t)
            }
        }, {
            key: "substring",
            value: function(e, t, n) {
                return this.buildOrGetCacheUnistring(e).substring(t, n).toString()
            }
        }, {
            key: "substr",
            value: function(e, t, n) {
                return this.buildOrGetCacheUnistring(e).substr(t, n).toString()
            }
        }, {
            key: "isEmpty",
            value: function(e) {
                return 0 == e.length
            }
        }, {
            key: "isSingleChar",
            value: function(e) {
                return 1 == this.length(e)
            }
        }, {
            key: "rawIndexAt",
            value: function(e, t) {
                return this.buildOrGetCacheUnistring(e).rawIndexAt(t)
            }
        }, {
            key: "clusterIndexAt",
            value: function(e, t) {
                return this.buildOrGetCacheUnistring(e).getClusterIndexFromUTF16Index(t)
            }
        }, {
            key: "buildOrGetCacheUnistring",
            value: function(e) {
                var t = e instanceof HTMLElement ? e.innerText : e.text;
                return y.text == t ? y.uniStr : t.length < 400 ? this.createUniString(t) : (e.___uniStr && e.___cacheText && e.___cacheText == t || (e.___uniStr = this.fromGlobalCache(t),
                e.___cacheText = t),
                e.___uniStr)
            }
        }, {
            key: "fromGlobalCache",
            value: function(e) {
                return y.text == e ? y.uniStr : (y.text = e,
                y.uniStr = this.createUniString(e))
            }
        }, {
            key: "createUniString",
            value: function(e) {
                var t = new d(e);
                return null == t.clusters && (t = new h(e)),
                t
            }
        }, {
            key: "strPslice",
            value: function(e, t, n, r) {
                var o = this.buildOrGetCacheUnistring(e);
                return o.slice(0, t) + r + o.slice(t + Math.abs(n))
            }
        }]),
        e
    }())
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var i = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , a = n(51)
      , u = r(a)
      , l = n(1)
      , s = r(l)
      , c = n(4)
      , f = r(c)
      , d = n(6)
      , p = r(d)
      , h = n(40)
      , y = r(h)
      , m = n(46)
      , v = r(m);
    t.default = new (function() {
        function e() {
            o(this, e),
            this.bracketLists = ["(", ")", "{", "}", "[", "]"]
        }
        return i(e, [{
            key: "n__gf",
            value: function(e, t) {
                return this.isNonTextBlock(e) ? null : u.default.charAt(e, t)
            }
        }, {
            key: "n__gg",
            value: function(e) {
                return this.isOpenClose(e) || this.isPowerIndex(e)
            }
        }, {
            key: "isComposite",
            value: function(e) {
                return "composite" == e.type
            }
        }, {
            key: "isCompositeBlockWithNestedEditor",
            value: function(e) {
                return this.isComposite(e) && s.default.keys(e.elements).length > 0
            }
        }, {
            key: "n__gh",
            value: function(e) {
                return !!this.isComposite(e) && v.default.getCustomSymbolComponent(e.text).isIntegralLike
            }
        }, {
            key: "n__gi",
            value: function(e) {
                return !!this.n__gh(e) && (null == e.elements.from && null == e.elements.to)
            }
        }, {
            key: "isOpenClose",
            value: function(e) {
                return 1 == e.text.length && this.bracketLists.indexOf(e.text) >= 0 || s.default.startsWith(e.text, "\\left") || s.default.startsWith(e.text, "\\right")
            }
        }, {
            key: "isPowerIndex",
            value: function(e) {
                return this.isComposite(e) && ("\\power-index" == e.text || "\\power" == e.text || "\\index" == e.text)
            }
        }, {
            key: "isPower",
            value: function(e) {
                return "composite" == e.type && ("\\power" == e.text || "\\power-index" == e.text && null == e.elements.indexValue)
            }
        }, {
            key: "isIndex",
            value: function(e) {
                return "composite" == e.type && ("\\index" == e.text || "\\power-index" == e.text && null == e.elements.powerValue)
            }
        }, {
            key: "n__da",
            value: function(e) {
                return "single" == e.type
            }
        }, {
            key: "isTextBlock",
            value: function(e) {
                return void 0 == e.type
            }
        }, {
            key: "isNonTextBlock",
            value: function(e) {
                return !this.isTextBlock(e)
            }
        }, {
            key: "getCharCount",
            value: function(e) {
                return this.isTextBlock(e) ? u.default.lengthByCache(e) : 1
            }
        }, {
            key: "n__ge",
            value: function(e, t) {
                if (!this.isTextBlock(e))
                    return !1;
                if (!this.isTextBlock(t))
                    return !1;
                var n = e.style || {}
                  , r = t.style || {};
                for (var o in n)
                    if (n.hasOwnProperty(o) && n[o] != r[o])
                        return !1;
                for (var o in r)
                    if (r.hasOwnProperty(o) && n[o] != r[o])
                        return !1;
                return !0
            }
        }, {
            key: "n__gj",
            value: function(e, t) {
                return 0 == t ? [e] : this.getCharCount(e) <= t ? [e] : [f.default.set(e, "text", u.default.substr(e, 0, t)), this.copyFormat({
                    text: u.default.substr(e, t),
                    id: p.default.nextId()
                }, e)]
            }
        }, {
            key: "n__ee",
            value: function(e) {
                return "composite" == e.type && "\\math-container" == e.text
            }
        }, {
            key: "isGather",
            value: function(e) {
                return "composite" == e.type && "\\gather" == e.text
            }
        }, {
            key: "isAlign",
            value: function(e) {
                return "composite" == e.type && "\\align" == e.text
            }
        }, {
            key: "n__ef",
            value: function(e) {
                return this.n__ee(e) && !e.displayMode
            }
        }, {
            key: "isDisplayMathContainer",
            value: function(e) {
                return this.n__ee(e) && e.displayMode
            }
        }, {
            key: "getOverSymbolEditorValue",
            value: function(e) {
                return e.elements.value
            }
        }, {
            key: "copyFormat",
            value: function(e, t) {
                return "root" == (arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "all") ? this.n__gs(e, t) : this.n__gr(e, t)
            }
        }, {
            key: "n__gk",
            value: function(e, t, n) {
                return "fontSize" == t ? y.default.addStyle(e, t, n) : e
            }
        }, {
            key: "mergeFormat",
            value: function(e, t) {
                return "root" == (arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "all") ? this.mergeFormat(e, t) : this.n__gl(e, t)
            }
        }, {
            key: "n__gl",
            value: function(e, t) {
                return this.n__gn(e, t)
            }
        }, {
            key: "n__gm",
            value: function(e, t) {
                return this.isComposite(e) ? t.style && t.style.fontSize ? y.default.addStyle(e, "fontSize", t.style.fontSize) : e : this.n__gn(e, t)
            }
        }, {
            key: "n__gn",
            value: function(e, t) {
                return f.default.update(e, {
                    displayMode: t.displayMode,
                    style: s.default.assignWith(s.default.clone(e.style), t.style)
                })
            }
        }, {
            key: "mergeFormatMod",
            value: function(e, t) {
                return "root" == (arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "all") ? this.n__gp(e, t) : this.n__go(e, t)
            }
        }, {
            key: "n__go",
            value: function(e, t) {
                return this.n__gq(e, t)
            }
        }, {
            key: "n__gp",
            value: function(e, t) {
                return this.isComposite(e) ? (t.style && t.style.fontSize && y.default.addStyleMod(e, "fontSize", t.style.fontSize),
                e) : this.n__gq(e, t)
            }
        }, {
            key: "n__gq",
            value: function(e, t) {
                return t.style ? (e.style || (e.style = {}),
                f.default.update(e, {
                    displayMode: t.displayMode,
                    style: s.default.assignWith(e.style, t.style)
                })) : e
            }
        }, {
            key: "n__gr",
            value: function(e, t) {
                var n = e;
                return (e.style || t.style) && (n = f.default.setProp(n, "style", s.default.assign({}, t.style || {}, e.style || {}))),
                f.default.update(n, {
                    displayMode: t.displayMode
                })
            }
        }, {
            key: "n__gs",
            value: function(e, t) {
                if (this.isComposite(e))
                    return t.style && t.style.fontSize ? y.default.addStyle(e, "fontSize", t.style.fontSize) : e;
                var n = e;
                return (e.style || t.style) && (n = f.default.setProp(n, "style", s.default.assign({}, t.style || {}, e.style || {}))),
                f.default.update(n, {
                    displayMode: t.displayMode
                })
            }
        }, {
            key: "n__gt",
            value: function(e, t, n, r) {
                if (0 == n)
                    return [t, e];
                if (this.getCharCount(e) <= n)
                    return [e, t];
                var o = this.n__gj(e, n);
                return [o[0], this.copyFormat(t, o[0], r ? "root" : "math"), o[1]]
            }
        }]),
        e
    }())
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var i = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , a = n(1)
      , u = r(a)
      , l = n(39)
      , s = r(l);
    t.default = new (function() {
        function e() {
            o(this, e),
            this.commands = [],
            this.tailCommands = [],
            this.isProcessing = !1,
            this.progressFunc = null,
            this.requestProcess = !1,
            this.requestAfterProcessCallbacks = []
        }
        return i(e, [{
            key: "push",
            value: function(e, t) {
                e.instanceToCheck = t,
                this.commands.push(e)
            }
        }, {
            key: "pushToEnd",
            value: function(e, t) {
                if (this.isProcessing)
                    return this.push(e, t);
                e.instanceToCheck = t,
                this.tailCommands.push(e)
            }
        }, {
            key: "callCommand",
            value: function(e) {
                if (!e.instanceToCheck || !e.instanceToCheck.willComponentUnmount)
                    try {
                        e()
                    } catch (e) {}
            }
        }, {
            key: "process",
            value: function(e, t) {
                this.isProcessing || this._process(e)
            }
        }, {
            key: "processWithProgress",
            value: function(e) {
                var t = this;
                this.progressFunc(0, this.commands.length);
                var n = Math.min(500, Math.max(100, this.commands.length / 10))
                  , r = 0
                  , o = {}
                  , i = function i() {
                    for (var a = 0; r < t.commands.length; r++) {
                        var l = t.commands[r];
                        if (u.default.isArray(l) ? l.forEach(function(e) {
                            t.startTime(),
                            t.callCommand(e),
                            o[l.displayName] = (o[l.displayName] || 0) + t.getDurationTime()
                        }) : (t.startTime(),
                        t.callCommand(l),
                        o[l.displayName] = (o[l.displayName] || 0) + t.getDurationTime()),
                        ++a > n)
                            break
                    }
                    r < t.commands.length ? (t.progressFunc(r, t.commands.length),
                    setTimeout(i, 0)) : (t.isProcessing = !1,
                    t.clear(),
                    e(!0),
                    t.handleRequestAfterProcess())
                };
                setTimeout(i, 0)
            }
        }, {
            key: "startTime",
            value: function() {
                this.start = (new Date).getTime()
            }
        }, {
            key: "getDurationTime",
            value: function() {
                return (new Date).getTime() - this.start
            }
        }, {
            key: "_process",
            value: function(e) {
                var t = this;
                this.commands = this.commands.concat(this.tailCommands),
                this.tailCommands = [],
                this.isProcessing = !0;
                var n = {};
                if (this.commands.length > 11100)
                    return this.processWithProgress(e);
                for (var r = 0; r < this.commands.length; r++) {
                    var o = this.commands[r];
                    u.default.isArray(o) ? o.forEach(function(e) {
                        t.startTime(),
                        t.callCommand(e),
                        n[o.displayName] = (n[o.displayName] || 0) + t.getDurationTime()
                    }) : (this.startTime(),
                    this.callCommand(o),
                    n[o.displayName] = (n[o.displayName] || 0) + this.getDurationTime())
                }
                this.clear(),
                e && e(this.commands.length > 0),
                this.handleRequestAfterProcess()
            }
        }, {
            key: "handleRequestAfterProcess",
            value: function() {
                0 != this.requestAfterProcessCallbacks.length && (this.requestAfterProcessCallbacks.forEach(function(e) {
                    return e()
                }),
                this.requestAfterProcessCallbacks = [],
                s.default.flushBatchedUpdates())
            }
        }, {
            key: "clear",
            value: function() {
                this.commands = [],
                this.tailCommands = [],
                this.requestProcess = !1,
                this.isProcessing = !1
            }
        }, {
            key: "requestAfterProcess",
            value: function(e) {
                if (0 == this.commands.length && 0 == this.tailCommands.length)
                    return e();
                this.requestAfterProcessCallbacks.push(e)
            }
        }]),
        e
    }())
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function i(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
    function a(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var u = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , l = n(24)
      , s = r(l)
      , c = n(5)
      , f = r(c);
    t.default = function(e) {
        function t() {
            return o(this, t),
            i(this, (t.__proto__ || Object.getPrototypeOf(t)).apply(this, arguments))
        }
        return a(t, e),
        u(t, [{
            key: "getModelMeta",
            value: function() {
                return {
                    text: this.getLatextName(),
                    keyInsertOnSelection: "value",
                    elements: {
                        value: {
                            onRemove: "all"
                        }
                    }
                }
            }
        }, {
            key: "getSymbolInfo",
            value: function() {
                return this.fillSymbolInfo({
                    type: "composite",
                    names: [this.getLatextName(), this.getSymbol()],
                    symbol: this.getSymbol()
                })
            }
        }, {
            key: "toModel",
            value: function(e, t, n) {
                if (this.isFlatten) {
                    if (null == n || 0 == n.length)
                        return {
                            text: ""
                        };
                    if (n && 1 == n.length)
                        return n[0].blocks
                }
                var r = this.getModel();
                return r.elements.value = null == n || 0 == n.length ? f.default.n__dt() : f.default.n__du(n),
                r
            }
        }, {
            key: "toLatex",
            value: function(e, t, n) {
                return this.getLatextName() + "{" + n.toLatexFromEditor(e.elements.value, t) + "}"
            }
        }]),
        t
    }(s.default)
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
    function i(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    function a(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var u = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , l = n(14)
      , s = r(l);
    n(305);
    var c = n(1)
      , f = r(c)
      , d = n(4)
      , p = r(d)
      , h = function() {
        function e() {
            a(this, e)
        }
        return u(e, [{
            key: "pathsD",
            value: function(e) {
                for (var t = "", n = 0; n < e.length; n++) {
                    var r = s.default.roundPath(e[n])
                      , o = n > 0 ? s.default.roundPoint(e[n - 1].p2) : null;
                    o && o.x == r.p1.x && o.y == r.p1.y || (t += this.actionWith("M", r.p1)),
                    r.cp2 ? (t += this.actionWith("C", r.cp),
                    t += this.actionWith("", r.cp2),
                    t += this.actionWith("", r.p2)) : r.cp ? (t += this.actionWith("Q", r.cp),
                    t += this.actionWith("", r.p2)) : t += this.actionWith("L", r.p2)
                }
                return t
            }
        }, {
            key: "cubicBeziersD",
            value: function(e) {
                for (var t = "", n = 0; n < e.length; n++) {
                    var r = s.default.roundCubicBezier(e[n])
                      , o = n > 0 ? s.default.roundPoint(e[n - 1].p2) : null;
                    o && o.x == r.p1.x && o.y == r.p1.y || (t += this.actionWith("M", r.p1)),
                    t += this.actionWith("C", r.cp),
                    t += this.actionWith("", r.cp2),
                    t += this.actionWith("", r.p2)
                }
                return t
            }
        }, {
            key: "quadraticBeziersD",
            value: function(e) {
                for (var t = "", n = 0; n < e.length; n++) {
                    var r = s.default.roundQuadraticBezier(e[n])
                      , o = n > 0 ? s.default.roundPoint(e[n - 1].p2) : null;
                    o && o.x == r.p1.x && o.y == r.p1.y || (t += this.actionWith("M", r.p1)),
                    t += this.actionWith("Q", r.cp),
                    t += this.actionWith("", r.p2)
                }
                return t
            }
        }, {
            key: "getLinesD",
            value: function(e) {
                for (var t = "", n = 0; n < e.length; n++) {
                    var r = s.default.roundLine(e[n])
                      , o = n > 0 ? s.default.roundPoint(e[n - 1].p2) : null;
                    o && o.x == r.p1.x && o.y == r.p1.y || (t += this.actionWith("M", s.default.roundPoint(r.p1))),
                    t += this.actionWith("L", s.default.roundPoint(r.p2))
                }
                return t
            }
        }, {
            key: "getBezierOrStraightLineD",
            value: function(e) {
                for (var t = "", n = 0; n < e.length; n++) {
                    var r = e[n];
                    n > 0 && e[n - 1].p2.x == r.p1.x && e[n - 1].p2.y == r.p1.y || (t += this.actionWith("M", s.default.roundPoint(r.p1))),
                    r.cp && r.cp2 ? (t += this.actionWith("C", s.default.roundPoint(r.cp)),
                    t += this.actionWith("", s.default.roundPoint(r.cp2)),
                    t += this.actionWith("", s.default.roundPoint(r.p2))) : r.cp ? (t += this.actionWith("Q", s.default.roundPoint(r.cp)),
                    t += this.actionWith("", s.default.roundPoint(r.p2))) : t += this.actionWith("L", s.default.roundPoint(r.p2))
                }
                return t
            }
        }, {
            key: "getLineD",
            value: function(e) {
                for (var t = this.actionWith("M", e[0]), n = 1; n < e.length; n++)
                    t += this.actionWith("L", e[n]);
                return t
            }
        }, {
            key: "getWaveLineD",
            value: function(e, t, n, r, o, i, a, u) {
                o = o || 0,
                i = i || 0,
                a = a || 0,
                u = u || 0;
                var l = s.default.distance2Points(e, t)
                  , c = null
                  , f = null;
                o && (c = s.default.getMiddlePointLine(e, t, o / l, 0)),
                i && (f = s.default.getMiddlePointLine(e, t, 1 - i / l, 0));
                var d = [];
                c && d.push({
                    p1: e,
                    p2: c,
                    length: o
                });
                for (var p = c || e, h = f || t, y = s.default.distance2Points(p, h), m = p, v = 1, g = n; g <= y; g += n) {
                    var b = s.default.roundPoint(s.default.pointAtDistance(p, h, g));
                    d.push({
                        p1: m,
                        cp: s.default.roundPoint(s.default.getMiddlePointLine(m, b, .5, r * v)),
                        p2: b,
                        length: n
                    }),
                    m = b,
                    v = -v
                }
                if (g < y + n) {
                    var b = s.default.roundPoint(s.default.pointAtDistance(p, h, y));
                    d.push({
                        p1: m,
                        p2: b,
                        length: s.default.distance2Points(m, b)
                    }),
                    m = b
                }
                if (p != t) {
                    var b = s.default.roundPoint(s.default.pointAtDistance(e, t, l));
                    d.push({
                        p1: m,
                        p2: b,
                        length: s.default.distance2Points(m, b)
                    }),
                    m = b
                }
                return a && (d = s.default.insertBreakForPaths(d, a, u, "ratio")),
                this.getBezierOrStraightLineD(d)
            }
        }, {
            key: "getWaveLineCubicD",
            value: function(e, t, n, r, o, i, a, u, l, s) {
                return this.getWavePathD(e, t, n, r, o, i, a, u, l, s, m)
            }
        }, {
            key: "getWavePathD",
            value: function(e, t, n, r, o, i, a, u, l, c, d) {
                r = r || 0,
                o = o || 0,
                i = i || 0,
                a = a || 0,
                u = u || 0,
                (a || u) && (e = f.default.clone(e));
                var h = new d(e,i);
                if (a && (e[0] = p.default.setProp(e[0], "p1", h.getPointFromDistance(e[0], a)),
                r = Math.max(0, r - a)),
                u) {
                    var y = e[e.length - 1];
                    e[e.length - 1] = p.default.setProp(y, "p2", h.getPointFromDistanceSecondPoint(y, u)),
                    o = Math.max(0, o - u)
                }
                var h = new d(e,i)
                  , m = []
                  , v = h.getPoint(0);
                r && (v = h.getPoint(r),
                m.push({
                    p1: h.getPoint(0),
                    p2: v,
                    length: r
                }));
                for (var g = 1, b = t + r; b <= h.totalLength - o; b += t) {
                    var x = h.getPoint(b - t / 2, h.perpendicularD + n * g, !0)
                      , w = h.getPoint(b, null, !0);
                    m.push({
                        p1: v,
                        cp: x,
                        p2: w,
                        length: t
                    }),
                    g = -g,
                    v = w
                }
                return b < h.totalLength - o + t && (w = h.getPoint(h.totalLength - o, null, !0),
                m.push({
                    p1: v,
                    p2: w,
                    length: s.default.distance2Points(v, w)
                }),
                v = w),
                o && (w = h.getPoint(h.totalLength, null, !0),
                m.push({
                    p1: v,
                    p2: w,
                    length: s.default.distance2Points(v, w)
                }),
                v = w),
                l && (m = s.default.insertBreakForPaths(m, l, c, "ratio")),
                this.pathsD(m)
            }
        }, {
            key: "actionWith",
            value: function(e, t, n) {
                return n ? " " + e + s.default.round2(t.x) + "," + s.default.round2(t.y) : " " + e + t.x + "," + t.y
            }
        }, {
            key: "getRulerLinesDFromPoints",
            value: function(e, t, n) {
                for (var r = "", o = [], i = 0; i < e.length - 1; i++) {
                    var a = e[i]
                      , u = e[i + 1];
                    0 == i && (r += this.actionWith("M", a)),
                    r += this.actionWith("L", u),
                    o.push({
                        p1: a,
                        p2: u
                    })
                }
                return r += this.getRulerMarkPathD(o, t, n, 0, 0, 0, 0, 0, v)
            }
        }, {
            key: "getRulerBeziersD",
            value: function(e, t, n) {
                var r = this.cubicBeziersD(e);
                return r += this.getRulerMarkPathD(e, t, n, 0, 0, 0, 0, 0, m)
            }
        }, {
            key: "getRulerMarkPathD",
            value: function(e, t, n, r, o, i, a, u, l) {
                r = r || 0,
                o = o || 0,
                i = i || 0,
                a = a || 0,
                u = u || 0;
                var s = new l(e,i);
                if ((a || u) && (e = f.default.clone(e)),
                a && (e[0] = p.default.setProp(e[0], "p1", s.getPointFromDistance(e[0], a)),
                r = Math.max(0, r - a)),
                u) {
                    var c = e[e.length - 1];
                    e[e.length - 1] = p.default.setProp(c, "p2", s.getPointFromDistanceSecondPoint(c, u)),
                    o = Math.max(0, o - u)
                }
                for (var d = "", h = t + r; h < s.totalLength - o; h += t)
                    d += s.action("M", h, s.perpendicularD + n / 2, !0),
                    d += s.action("L", h, s.perpendicularD - n / 2, !0);
                return d
            }
        }]),
        e
    }()
      , y = function() {
        function e(t, n) {
            var r = this;
            a(this, e),
            this.paths = t,
            this.perpendicularD = n,
            this.totalLength = 0,
            this.pathInfos = f.default.map(t, function(e, t) {
                var n = r.getLength(e)
                  , o = {
                    b: e,
                    length: n,
                    lengthSofar: r.totalLength,
                    index: t
                };
                return r.totalLength += n,
                o
            })
        }
        return u(e, [{
            key: "getMatchPath",
            value: function(e, t) {
                for (var n = t && this.lastInfo ? this.lastInfo.index : 0, r = n; r < this.pathInfos.length; r++) {
                    var o = this.pathInfos[r];
                    if (o.lengthSofar <= e && e <= o.lengthSofar + o.length)
                        return o
                }
            }
        }, {
            key: "action",
            value: function(e, t, n, r) {
                var o = this.getPoint(t, n, r);
                return " " + e + s.default.round2(o.x) + "," + s.default.round2(o.y)
            }
        }, {
            key: "getPoint",
            value: function(e, t, n) {
                t = t || this.perpendicularD;
                var r = this.getMatchPath(e, n);
                return this.lastInfo = r,
                this.getPointFromDistance(r.b, e - r.lengthSofar, t)
            }
        }, {
            key: "getLength",
            value: function(e) {
                throw new Error("not implemented")
            }
        }, {
            key: "getPointFromDistance",
            value: function(e, t, n) {
                throw new Error("not implemented")
            }
        }, {
            key: "getPointFromDistanceSecondPoint",
            value: function(e, t, n) {
                throw new Error("not implemented")
            }
        }]),
        e
    }()
      , m = function(e) {
        function t() {
            return a(this, t),
            o(this, (t.__proto__ || Object.getPrototypeOf(t)).apply(this, arguments))
        }
        return i(t, e),
        u(t, [{
            key: "getLength",
            value: function(e) {
                return s.default.cubicBezierLength(e)
            }
        }, {
            key: "getPointFromDistance",
            value: function(e, t, n) {
                return s.default.pointAtDistanceCubic(e, t, n)
            }
        }, {
            key: "getPointFromDistanceSecondPoint",
            value: function(e, t, n) {
                return s.default.pointAtDistanceFromSecondPointCubic(e, t, n)
            }
        }]),
        t
    }(y)
      , v = function(e) {
        function t() {
            return a(this, t),
            o(this, (t.__proto__ || Object.getPrototypeOf(t)).apply(this, arguments))
        }
        return i(t, e),
        u(t, [{
            key: "getLength",
            value: function(e) {
                return s.default.distance2Points(e.p1, e.p2)
            }
        }, {
            key: "getPointFromDistance",
            value: function(e, t, n) {
                return s.default.pointAtDistance(e.p1, e.p2, t, n)
            }
        }, {
            key: "getPointFromDistanceSecondPoint",
            value: function(e, t, n) {
                return s.default.pointAtDistanceFromSecondPoint(e.p1, e.p2, t, n)
            }
        }]),
        t
    }(y);
    t.default = new h
}
, function(e, t) {
    var n = e.exports = {
        version: "2.4.0"
    };
    "number" == typeof __e && (__e = n)
}
, function(e, t, n) {
    var r = n(33)
      , o = n(98);
    e.exports = n(32) ? function(e, t, n) {
        return r.f(e, t, o(1, n))
    }
    : function(e, t, n) {
        return e[t] = n,
        e
    }
}
, function(e, t, n) {
    var r = n(15)
      , o = n(57)
      , i = n(48)
      , a = n(109)("src")
      , u = Function.toString
      , l = ("" + u).split("toString");
    n(83).inspectSource = function(e) {
        return u.call(e)
    }
    ,
    (e.exports = function(e, t, n, u) {
        var s = "function" == typeof n;
        s && (i(n, "name") || o(n, "name", t)),
        e[t] !== n && (s && (i(n, a) || o(n, a, e[t] ? "" + e[t] : l.join(String(t)))),
        e === r ? e[t] = n : u ? e[t] ? e[t] = n : o(e, t, n) : (delete e[t],
        o(e, t, n)))
    }
    )(Function.prototype, "toString", function() {
        return "function" == typeof this && this[a] || u.call(this)
    })
}
, function(e, t) {
    e.exports = function(e) {
        if ("function" != typeof e)
            throw TypeError(e + " is not a function!");
        return e
    }
}
, function(e, t, n) {
    var r = n(159)
      , o = n(69);
    e.exports = function(e) {
        return r(o(e))
    }
}
, function(e, t, n) {
    var r = n(2)
      , o = n(19)
      , i = n(69)
      , a = /"/g
      , u = function(e, t, n, r) {
        var o = String(i(e))
          , u = "<" + t;
        return "" !== n && (u += " " + n + '="' + String(r).replace(a, "&quot;") + '"'),
        u + ">" + o + "</" + t + ">"
    };
    e.exports = function(e, t) {
        var n = {};
        n[e] = t(u),
        r(r.P + r.F * o(function() {
            var t = ""[e]('"');
            return t !== t.toLowerCase() || t.split('"').length > 3
        }), "String", n)
    }
}
, function(e, t, n) {
    var r = n(160)
      , o = n(98)
      , i = n(60)
      , a = n(76)
      , u = n(48)
      , l = n(336)
      , s = Object.getOwnPropertyDescriptor;
    t.f = n(32) ? s : function(e, t) {
        if (e = i(e),
        t = a(t, !0),
        l)
            try {
                return s(e, t)
            } catch (e) {}
        if (u(e, t))
            return o(!r.f.call(e, t), e[t])
    }
}
, function(e, t, n) {
    var r = n(48)
      , o = n(41)
      , i = n(230)("IE_PROTO")
      , a = Object.prototype;
    e.exports = Object.getPrototypeOf || function(e) {
        return e = o(e),
        r(e, i) ? e[i] : "function" == typeof e.constructor && e instanceof e.constructor ? e.constructor.prototype : e instanceof Object ? a : null
    }
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return function() {
            return e
        }
    }
    var o = function() {};
    o.thatReturns = r,
    o.thatReturnsFalse = r(!1),
    o.thatReturnsTrue = r(!0),
    o.thatReturnsNull = r(null),
    o.thatReturnsThis = function() {
        return this
    }
    ,
    o.thatReturnsArgument = function(e) {
        return e
    }
    ,
    e.exports = o
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var i = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , a = n(3)
      , u = r(a)
      , l = n(50)
      , s = r(l)
      , c = n(1)
      , f = r(c)
      , d = n(146)
      , p = r(d)
      , h = n(72)
      , y = r(h)
      , m = n(846)
      , v = r(m)
      , g = n(4)
      , b = r(g)
      , x = n(169)
      , w = r(x)
      , C = n(847)
      , E = r(C)
      , k = n(51)
      , _ = r(k)
      , A = n(7)
      , S = r(A)
      , O = n(11)
      , P = r(O);
    t.default = new (function() {
        function e() {
            o(this, e)
        }
        return i(e, [{
            key: "n__cf",
            value: function(e, t) {
                if (u.default.isEmptyLine(e))
                    return w.default.emptyLine(e);
                var n = (new w.default).withLine(e)
                  , r = y.default.buildLineBlocks(e);
                if (null == t)
                    return n.withCharIndex(r[0].startIndex).build();
                var o = f.default.find(r, function(e) {
                    return e.element == t
                });
                return o.blockIndex == r.length - 1 ? n.withCharIndex(o.startIndex + o.numOfChar).build() : n.withCharIndex(r[o.blockIndex + 1].startIndex).build()
            }
        }, {
            key: "n__cg",
            value: function(e, t) {
                if (u.default.isEmptyLine(e))
                    return w.default.emptyLine(e);
                var n = y.default.buildLineBlocks(e)
                  , r = f.default.find(n, function(e) {
                    return e.element == t
                });
                return (new w.default).withLine(e).withCharIndex(r.startIndex).build()
            }
        }, {
            key: "n__cx",
            value: function(e) {
                if (u.default.isEmptyLine(e))
                    return w.default.emptyLine(e);
                var t = y.default.buildLineBlocks(e)
                  , n = f.default.last(t);
                if (u.default.n__dl(e)) {
                    var r = f.default.last(f.default.values(n.element.reactInstance.refMap)).editor;
                    return w.default.endOfEditor(r)
                }
                return (new w.default).withLine(e).withCharIndex(n.startIndex + n.numOfChar).build()
            }
        }, {
            key: "buildLineBlocks",
            value: function(e) {
                return y.default.buildLineBlocks(e)
            }
        }, {
            key: "n__ch",
            value: function(e, t) {
                for (var n = 0; n < e.length; n++) {
                    var r = e[n];
                    if (r.endIndex + 1 == t && n < e.length - 1)
                        return f.default.assign({}, r, {
                            charIndex: t - r.startIndex,
                            subBlock: b.default.set(e[n + 1], "charIndex", 0)
                        });
                    if (t >= r.startIndex && (null == r.endIndex || t <= r.endIndex))
                        return f.default.assign({}, r, {
                            charIndex: t - r.startIndex
                        })
                }
                return null
            }
        }, {
            key: "n__ci",
            value: function(e, t) {
                return this.n__ch(e.lineBlocks, t)
            }
        }, {
            key: "getNumberOfChars",
            value: function(e) {
                return f.default.sumBy(e, function(e) {
                    return e.numOfChar
                })
            }
        }, {
            key: "findNextCharIndex",
            value: function(e) {
                return e.charIndex < e.totalChar ? e.charIndex + 1 : null
            }
        }, {
            key: "findPreviousCharIndex",
            value: function(e) {
                return e.charIndex > 0 ? e.charIndex - 1 : null
            }
        }, {
            key: "n__cj",
            value: function(e, t) {
                return this.n__ck(e, t.target, {
                    left: t.clientX,
                    top: t.clientY
                })
            }
        }, {
            key: "findNearestLine",
            value: function(e, t) {
                var n = u.default.n__er(e)
                  , r = u.default.n__fy(n);
                return s.default.n__gu(r, t).element
            }
        }, {
            key: "n__ck",
            value: function(e, t, n) {
                if (u.default.isEditArea(t)) {
                    var r = this.findNearestLine(t, n);
                    return E.default.build(r, e, n)
                }
                if (u.default.n__ec(t))
                    return E.default.build(t, e, n);
                if (u.default.n__ed(t))
                    return E.default.build(t.parentElement, e, n);
                if (u.default.isPrefix(t))
                    return E.default.build(t.parentElement, e, n);
                var o = t;
                u.default.isBlock(o) || (o = u.default.n__eq(t));
                var r = u.default.n__ep(o);
                return this.n__cr(o, r, e, n)
            }
        }, {
            key: "n__cl",
            value: function(e) {
                if (0 == e.charIndex)
                    return this.n__co(e.line);
                var t = this.n__ci(e, e.charIndex)
                  , n = this.n__cm(t.element, t.charIndex, e.line);
                if (n.charIndexInBlock = t.charIndex,
                n.attachElement) {
                    var r = u.default.n__fh(n.attachElement);
                    n.pos.left = Math.max(n.pos.left, r.left),
                    n.pos.left = Math.min(n.pos.left, r.right)
                }
                return n
            }
        }, {
            key: "isHideCursor",
            value: function(e) {
                return (0,
                S.default)(e).hasClass("no-cursor-selected")
            }
        }, {
            key: "n__cm",
            value: function(e, t, n) {
                if (u.default.isNonChar(e))
                    return this.n__cn(e, t, n);
                var r = _.default.rawIndexAt(e, t)
                  , o = u.default.n__ct(e, r)
                  , i = u.default.n__fh(o)
                  , a = 0 == t ? i.left : i.right;
                return e.innerText.length == r && (a += u.default.getComputedStyleAsNumber(e, "padding-right")),
                {
                    attachElement: e,
                    positionType: "middle",
                    pos: {
                        left: a,
                        top: i.top + i.height / 2
                    }
                }
            }
        }, {
            key: "n__cn",
            value: function(e, t, n) {
                var r = u.default.n__fh(e)
                  , o = 0;
                if (u.default.n__ee(e))
                    var i = getComputedStyle(e)
                      , o = +Number.parseFloat(i.getPropertyValue("margin-right"));
                var a = v.default.getBlockBaseLineInfo(e, n);
                return {
                    attachElement: e,
                    positionType: a.positionType,
                    pos: {
                        left: 0 == t ? r.left : r.right + o,
                        top: a.top
                    }
                }
            }
        }, {
            key: "n__co",
            value: function(e) {
                if (u.default.isTextEditLine(e))
                    return this.calculateGeoPosBeginForTextModeLine(e);
                var t = u.default.n__fr(e)
                  , n = u.default.n__fh(t).left
                  , r = v.default.getBlockBaseLineInfo(t, e);
                return {
                    attachElement: t,
                    positionType: r.positionType,
                    pos: {
                        left: n,
                        top: r.top
                    }
                }
            }
        }, {
            key: "calculateGeoPosBeginForTextModeLine",
            value: function(e) {
                var t = u.default.n__fr(e)
                  , n = u.default.n__fh(t).left;
                if (u.default.isEmptyLine(e) || u.default.isComposite(t)) {
                    var r = v.default.getBlockBaseLineInfo(t, e);
                    return {
                        attachElement: t,
                        positionType: r.positionType,
                        pos: {
                            left: n,
                            top: r.top
                        }
                    }
                }
                return this.n__cm(t, 0, e)
            }
        }, {
            key: "n__cq",
            value: function(e, t, n) {
                return e ? {
                    charIndex: e.startIndex,
                    line: t,
                    lineIndex: this.findLineIndex(t, n),
                    editor: n
                } : w.default.emptyLine(t, n)
            }
        }, {
            key: "n__cr",
            value: function(e, t, n, r) {
                if (!e)
                    return w.default.emptyLine(t, n);
                var o = (new w.default).withLine(t).withEditor(n);
                if (u.default.isNonChar(e)) {
                    var i = u.default.n__ew(t);
                    if (0 == i.length)
                        return w.default.emptyLine(t, n);
                    var a = f.default.takeWhile(i, function(t) {
                        return t != e
                    })
                      , l = o.withCharIndexBySumOfBlocks(a).build();
                    return s.default.n__hr(u.default.n__fx(e), r) || (l.charIndex += 1),
                    l
                }
                return o.withCharIndex(this.n__cs(e, t, r)).build()
            }
        }, {
            key: "n__cs",
            value: function(e, t, n) {
                for (var r = u.default.n__ew(t), o = r.indexOf(e), i = 0, a = 0; a < o; a++) {
                    i += y.default.getNumberOfCharsInBlock(r[a])
                }
                var l = this.n__cu(e, n);
                if (u.default.isTextEditLine(t) && o > 0 && 0 == l.startOffset) {
                    var s = this.buildLineBlocks(t)
                      , c = s[o - 1]
                      , f = s[o];
                    if (c.rect.bottom <= f.rect.top) {
                        var d = b.default.set(f, "charIndex", 0);
                        p.default.n__i(s, t, d);
                        l = u.default.n__ct(e, _.default.rawIndexAt(e, 1))
                    }
                }
                return i + _.default.clusterIndexAt(e, l.startOffset)
            }
        }, {
            key: "n__cu",
            value: function(e, t) {
                var n = 0
                  , r = 0
                  , o = _.default.getUnistring(e)
                  , i = u.default.n__fh(e)
                  , a = o.length
                  , l = u.default.n__ct(e, n)
                  , c = u.default.n__ct(e, o.rawIndexAt(a))
                  , d = u.default.n__fh(l)
                  , p = u.default.n__fh(c);
                if (t = f.default.clone(t),
                t.top = Math.max(d.top, t.top),
                t.top = Math.min(p.bottom, t.top),
                t.left = Math.max(i.left, t.left),
                t.left = Math.min(i.right, t.left),
                s.default.n__hd(d, t) && s.default.n__ho(d, t))
                    return l;
                if (s.default.n__hd(p, t) && s.default.n__hm(p, t))
                    return c;
                for (; a - n > 1; ) {
                    P.default.shouldRangeDetach() && (l.detach(),
                    c.detach());
                    var h = Math.floor((a + n) / 2)
                      , y = u.default.n__ct(e, o.rawIndexAt(h))
                      , m = u.default.n__o(e, y);
                    if (P.default.shouldRangeDetach() && y.detach(),
                    this.n__cv(t, d, m.computedRangeRect) && (c = y,
                    p = m.computedRangeRect,
                    a = h),
                    this.n__cv(t, m.computedRangeRect, p) && (l = y,
                    d = m.computedRangeRect,
                    n = h),
                    ++r > 200)
                        return null
                }
                return n == a ? l : Math.abs(d.left - t.left) < Math.abs(p.left - t.left) ? l : c
            }
        }, {
            key: "n__cv",
            value: function(e, t, n) {
                return (!s.default.n__hd(t, e, 0) || !s.default.n__ho(t, e)) && ((!s.default.n__hd(n, e, 0) || !s.default.n__hm(n, e)) && (e.top >= t.top - 0 && e.top - 0 <= n.bottom))
            }
        }, {
            key: "findLineIndex",
            value: function(e, t) {
                return t || (t = u.default.n__eo(e)),
                u.default.n__er(t).indexOf(e)
            }
        }, {
            key: "n__cw",
            value: function(e, t) {
                var n = u.default.n__fx(e);
                return s.default.n__hr(n, t) ? e.previousElementSibling : e
            }
        }]),
        e
    }())
}
, function(e, t, n) {
    "use strict";
    function r(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var o = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , i = n(0)
      , a = function(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }(i);
    t.default = new (function() {
        function e() {
            r(this, e),
            this.cache = {}
        }
        return o(e, [{
            key: "getRemoveItem",
            value: function(e) {
                return a.default.createElement("item", {
                    style: {
                        outline: "none",
                        color: "gray",
                        cursor: "pointer",
                        border: "1px solid transparent",
                        position: "relative",
                        height: "23px",
                        display: "block",
                        width: "30px",
                        marginLeft: 0,
                        padding: 0
                    },
                    title: "Remove Selected Item",
                    className: "remove",
                    onMouseDown: e
                }, a.default.createElement("svg", {
                    style: {
                        width: "100%",
                        height: "100%"
                    },
                    viewBox: "-100 -100 1200 1200"
                }, a.default.createElement("path", {
                    fill: "indianred",
                    d: "M500,990C229.5,990,10,770.5,10,500S229.5,10,500,10s490,219.5,490,490S770.5,990,500,990z M500,152.9c-191.4,0-347.1,155.7-347.1,347.1c0,191.4,155.7,347.1,347.1,347.1c191.4,0,347.1-155.7,347.1-347.1C847.1,308.6,691.4,152.9,500,152.9z M616.8,709.9c-8.3,8.3-21.1,8.3-29.3,0L500,622.5l-87.4,87.4c-8.3,8.3-21.1,8.3-29.3,0l-93.2-93.2c-8.3-8.3-8.3-21.1,0-29.3l87.4-87.4l-87.4-87.4c-8.3-8.3-8.3-21.1,0-29.3l93.2-93.2c8.3-8.3,21.1-8.3,29.3,0l87.4,87.4l87.4-87.4c8.3-8.3,21.1-8.3,29.3,0l93.2,93.2c8.3,8.3,8.3,21.1,0,29.3L622.5,500l87.4,87.4c8.3,8.3,8.3,21.1,0,29.3L616.8,709.9z"
                })))
            }
        }, {
            key: "getRotationSvgIcon",
            value: function(e) {
                var t = .08 * e;
                return this.cachable("rotation-icon", function() {
                    return a.default.createElement("g", {
                        style: {
                            transform: "translate(-1px,-1px) scale(" + t + ")",
                            fill: "orange"
                        }
                    }, a.default.createElement("path", {
                        d: "M27.998,16c-0.012,6.628-5.373,11.986-11.999,11.998C9.373,27.986,4.012,22.627,4,15.999    C4.012,9.373,9.373,4.012,15.999,4c2.024,0.003,3.928,0.515,5.601,1.402l-2.6,2.6h8.002V0l-2.476,2.476    c-2.47-1.561-5.39-2.475-8.527-2.476C7.164,0.002,0.002,7.164,0,15.999C0.002,24.837,7.164,31.998,15.999,32    C24.835,31.998,31.998,24.838,32,16H27.998z"
                    }), a.default.createElement("path", {
                        d: "M10.001,16c0,3.314,2.685,5.999,5.999,6c3.314-0.002,5.999-2.688,5.999-6H22    c-0.001-3.314-2.686-6-6-6.001C12.686,10,10.001,12.686,10.001,16z M19.999,15.999L19.999,15.999    c-0.004,2.21-1.79,3.995-3.999,3.999c-2.208-0.004-3.995-1.789-3.999-3.999C12.005,13.792,13.792,12.004,16,12    C18.209,12.004,19.995,13.79,19.999,15.999z"
                    }))
                })
            }
        }, {
            key: "separator1",
            value: function() {
                return this.cachable("separator1", function() {
                    return a.default.createElement("relative-separator", {
                        key: "1"
                    }, a.default.createElement("bar", null))
                })
            }
        }, {
            key: "separator",
            value: function() {
                return this.cachable("separator", function() {
                    return a.default.createElement("relative-separator", null, a.default.createElement("bar", null))
                })
            }
        }, {
            key: "getSvnDef",
            value: function(e) {
                return e = e || "selected-filter",
                this.cachable("getSvnDef", function() {
                    return a.default.createElement("defs", null, a.default.createElement("filter", {
                        id: e,
                        primitiveUnits: "userSpaceOnUse",
                        filterUnits: "userSpaceOnUse"
                    }, a.default.createElement("feColorMatrix", {
                        type: "matrix",
                        values: "0 0 0  0   0\n                        0 0 0 0 0\n                        0 0 0 0 0\n                        0 0 0 0.7    0"
                    }), a.default.createElement("feGaussianBlur", {
                        stdDeviation: "1.5",
                        result: "coloredBlur"
                    }), a.default.createElement("feComposite", {
                        operator: "over",
                        in2: "coloredBlur",
                        in: "SourceGraphic"
                    })))
                })
            }
        }, {
            key: "cachable",
            value: function(e, t) {
                return this.cache[e] || (this.cache[e] = t()),
                this.cache[e]
            }
        }]),
        e
    }())
}
, function(e, t) {
    e.exports = Array.isArray
}
, function(e, t) {
    var n = {}.toString;
    e.exports = function(e) {
        return n.call(e).slice(8, -1)
    }
}
, function(e, t) {
    e.exports = function(e) {
        if (void 0 == e)
            throw TypeError("Can't call method on  " + e);
        return e
    }
}
, function(e, t, n) {
    var r = n(19);
    e.exports = function(e, t) {
        return !!e && r(function() {
            t ? e.call(null, function() {}, 1) : e.call(null)
        })
    }
}
, function(e, t, n) {
    "use strict";
    var r = null;
    e.exports = {
        debugTool: r
    }
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var i = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , a = n(3)
      , u = r(a)
      , l = n(1)
      , s = r(l)
      , c = n(4)
      , f = r(c)
      , d = n(51)
      , p = r(d);
    t.default = new (function() {
        function e() {
            o(this, e)
        }
        return i(e, [{
            key: "findSelectedBlock",
            value: function(e, t, n) {
                for (var r = u.default.n__ew(e), o = 0, i = 0; i < r.length; i++) {
                    var a = r[i]
                      , l = this.getNumberOfCharsInBlock(a);
                    if (t >= o && t < o + l)
                        return {
                            element: a,
                            localIndex: t - o
                        };
                    if (!n && t == o + l) {
                        var s = {
                            element: a,
                            localIndex: t - o
                        };
                        return i < r.length - 1 && (s.sub = {
                            element: r[i + 1],
                            localIndex: 0
                        }),
                        s
                    }
                    o += l
                }
            }
        }, {
            key: "toCharIndexedHtmlLineBlockAtStart",
            value: function(e) {
                return f.default.set(e, "charIndex", 0)
            }
        }, {
            key: "toCharIndexedHtmlLineBlockAtEnd",
            value: function(e) {
                return f.default.set(e, "charIndex", this.getNumberOfCharsInBlock(e.element))
            }
        }, {
            key: "isLineBlock",
            value: function(e) {
                return !(e instanceof HTMLElement)
            }
        }, {
            key: "buildLineBlocks",
            value: function(e) {
                var t = this
                  , n = u.default.n__ew(e)
                  , r = 0;
                return s.default.map(n, function(e, o) {
                    var i = u.default.isNonChar(e)
                      , a = t.getNumberOfCharsInBlock(e)
                      , l = u.default.n__fh(e)
                      , s = {
                        rect: l,
                        startIndex: r,
                        endIndex: o == n.length - 1 ? null : r + a - 1,
                        element: e,
                        isNonChar: i,
                        isChar: !i,
                        isComposite: u.default.isComposite(e),
                        hasChildEditor: u.default.hasChildEditor(e),
                        numOfChar: a,
                        blockIndex: o
                    };
                    return r += a,
                    s
                })
            }
        }, {
            key: "getNumberOfCharsInBlock",
            value: function(e) {
                return u.default.isNonChar(e) ? 1 : p.default.lengthByCache(e)
            }
        }, {
            key: "toCharIndexLineBlock",
            value: function(e, t) {
                return s.default.assign({}, e, {
                    charIndex: t
                })
            }
        }, {
            key: "getNumberOfCharsFromLine",
            value: function(e) {
                var t = this;
                return s.default.sumBy(u.default.n__ew(e), function(e) {
                    return t.getNumberOfCharsInBlock(e)
                })
            }
        }]),
        e
    }())
}
, function(e, t, n) {
    "use strict";
    function r(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var o = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , i = function() {
        function e() {
            r(this, e)
        }
        return o(e, [{
            key: "withHandledCursorSelected",
            value: function() {
                return this.handledCursorSelected = !0,
                this
            }
        }, {
            key: "withFocusAcquired",
            value: function() {
                return this.focusAcquired = !0,
                this
            }
        }, {
            key: "withRequestCursorSelect",
            value: function() {
                return this.requestCursorSelect = !0,
                this
            }
        }, {
            key: "build",
            value: function() {
                return {
                    handledCursorSelected: this.handledCursorSelected,
                    focusAcquired: this.focusAcquired,
                    requestCursorSelect: this.requestCursorSelect
                }
            }
        }], [{
            key: "getBuilder",
            value: function(t) {
                var n = new e;
                return t && (n.focusAcquired = t.focusAcquired,
                n.handledCursorSelected = t.handledCursorSelected,
                n.requestCursorSelect = t.requestCursorSelect),
                n
            }
        }, {
            key: "getDefault",
            value: function() {
                return e.empty
            }
        }]),
        e
    }();
    t.default = i,
    i.empty = {}
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function i(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
    function a(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.ExactMatrix = void 0;
    var u = Object.assign || function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
      , l = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , s = function e(t, n, r) {
        null === t && (t = Function.prototype);
        var o = Object.getOwnPropertyDescriptor(t, n);
        if (void 0 === o) {
            var i = Object.getPrototypeOf(t);
            return null === i ? void 0 : e(i, n, r)
        }
        if ("value"in o)
            return o.value;
        var a = o.get;
        if (void 0 !== a)
            return a.call(r)
    }
      , c = n(0)
      , f = r(c)
      , d = n(18)
      , p = r(d)
      , h = n(7)
      , y = r(h)
      , m = n(1)
      , v = r(m)
      , g = n(13)
      , b = r(g)
      , x = n(30)
      , w = r(x)
      , C = n(4)
      , E = r(C)
      , k = n(278)
      , _ = r(k)
      , A = n(3)
      , S = r(A)
      , O = n(53)
      , P = r(O)
      , M = n(961)
      , I = r(M)
      , D = n(47)
      , T = r(D)
      , B = n(5)
      , j = r(B)
      , L = n(205)
      , R = r(L)
      , F = n(170)
      , N = r(F)
      , U = n(962)
      , z = r(U)
      , H = n(978)
      , W = r(H);
    n(979);
    var q = {
        "(": "open-parenthesis",
        ")": "close-parenthesis",
        "{": "open-brace",
        "}": "close-brace",
        "[": "open-bracket",
        "]": "close-bracket",
        "|": "open-vert"
    }
      , G = function(e) {
        function t(e) {
            o(this, t);
            var n = i(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e));
            return n.onRowChange = n.onRowChange.bind(n),
            n.onColumnChange = n.onColumnChange.bind(n),
            n.onBracketChange = n.onBracketChange.bind(n),
            n.onLayoutChange = n.onLayoutChange.bind(n),
            n.changeCurrentColumnAlign = n.changeCurrentColumnAlign.bind(n),
            n.state = {
                row: n.props.data.row,
                column: n.props.data.column,
                bracket: "(",
                height: null,
                bracketWidth: null,
                showBorderDesign: !1
            },
            n.updateMatrix = n.updateMatrix.bind(n),
            n.selfManageBaseLine = !0,
            n.cacheRowIds = {},
            n
        }
        return a(t, e),
        l(t, [{
            key: "getClassName",
            value: function() {
                return s(t.prototype.__proto__ || Object.getPrototypeOf(t.prototype), "getClassName", this).call(this) + "matrix-symbol matrix-like matrix-math-mode tabular"
            }
        }, {
            key: "insertRowBelow",
            value: function() {
                var e = this;
                p.default.unstable_batchedUpdates(function() {
                    var t = T.default.insertNewRowBelow(e.props.data, e.props.selected.key);
                    e.props.onDataChanged(t)
                })
            }
        }, {
            key: "insertRowAbove",
            value: function() {
                var e = this;
                p.default.unstable_batchedUpdates(function() {
                    var t = T.default.insertNewRowAbove(e.props.data, e.props.selected.key);
                    e.props.onDataChanged(t),
                    e.props.onSelectedChanged(E.default.update(e.props.selected, {
                        selected: {
                            lineIndex: 0,
                            charIndex: 0
                        }
                    }))
                })
            }
        }, {
            key: "insertColumnOnLeft",
            value: function() {
                this.props.onDataChanged(T.default.insertColumnOnLeft(this.props.data, this.props.selected.key)),
                this.props.onSelectedChanged(E.default.update(this.props.selected, {
                    selected: {
                        lineIndex: 0,
                        charIndex: 0
                    }
                }))
            }
        }, {
            key: "insertColumnOnRight",
            value: function() {
                this.props.onDataChanged(T.default.insertColumnOnRight(this.props.data, this.props.selected.key))
            }
        }, {
            key: "removeCurrenRow",
            value: function(e) {
                var t = this;
                return p.default.unstable_batchedUpdates(function() {
                    if (e)
                        var n = T.default.removeRows(t.props.data, e);
                    else
                        var n = T.default.removeRows(t.props.data, [t.props.selected.key]);
                    if (n.row <= 0 || n.column <= 0)
                        return {
                            removeSelf: !0
                        };
                    t.props.onDataChanged(n),
                    t.props.onSelectedChanged(t.moveCursorRowAbove(n, t.props.selected.key))
                })
            }
        }, {
            key: "removeCurrentColumn",
            value: function(e) {
                var t = this;
                return p.default.unstable_batchedUpdates(function() {
                    if (e)
                        var n = T.default.removeColumns(t.props.data, e);
                    else
                        var n = T.default.removeColumns(t.props.data, [t.props.selected.key]);
                    if (n.row <= 0 || n.column <= 0)
                        return {
                            removeSelf: !0
                        };
                    t.props.onDataChanged(n),
                    t.props.onSelectedChanged(t.moveCursorColumnLeft(n, t.props.selected.key))
                })
            }
        }, {
            key: "moveCursorColumnLeft",
            value: function(e, t, n) {
                for (var r, o = j.default.n__dj(t), i = Math.min(o.column, e.column - 1); ; ) {
                    if (i < 0) {
                        if (n)
                            throw new Error("should not happen");
                        return this.moveCursorRowAbove(e, r, !0)
                    }
                    if (r = j.default.getKeyFromRowCol(o.row, i),
                    !e.elements[r].hidden)
                        break;
                    i--
                }
                return E.default.update(this.props.selected, {
                    key: r,
                    selected: {
                        lineIndex: 0,
                        charIndex: 0
                    }
                })
            }
        }, {
            key: "moveCursorRowAbove",
            value: function(e, t, n) {
                for (var r, o = j.default.n__dj(t), i = Math.min(o.row, e.row - 1); ; ) {
                    if (i < 0) {
                        if (n)
                            throw new Error("should not happen");
                        return this.moveCursorColumnLeft(e, r, !0)
                    }
                    if (r = j.default.getKeyFromRowCol(i, o.column),
                    !e.elements[r].hidden)
                        break;
                    i--
                }
                return E.default.update(this.props.selected, {
                    key: r,
                    selected: {
                        lineIndex: 0,
                        charIndex: 0
                    }
                })
            }
        }, {
            key: "getKeyForRow",
            value: function(e) {
                var t = this
                  , n = j.default.n__dg(this.props.data, e)
                  , r = v.default.map(n, function(e) {
                    return t.props.data.elements[e].id
                })
                  , o = v.default.find(v.default.keys(this.cacheRowIds), function(e) {
                    return v.default.intersection(r, t.cacheRowIds[e]).length > 0
                });
                return o || (o = "n" + Math.random()),
                this.cacheRowIds[o] = r,
                o
            }
        }, {
            key: "componentWillUpdate",
            value: function(e) {
                e.data.row == this.props.data.row && e.data.column == this.props.data.column || this.setState({
                    row: e.data.row,
                    column: e.data.column
                }),
                e.selected == this.props.selected || e.selected || this.setState({
                    showBorderDesign: !1
                })
            }
        }, {
            key: "useCustomBaseLine",
            value: function() {
                return !1
            }
        }, {
            key: "findPair",
            value: function(e) {
                return v.default.find(t.bracketPairs, function(t) {
                    return t.indexOf(e) >= 0
                })
            }
        }, {
            key: "onLayoutChange",
            value: function(e) {
                this.props.onDataChanged(E.default.set(this.props.data, "text", e))
            }
        }, {
            key: "changeSelectedIfRequire",
            value: function(e, t) {
                var n = this.props.selected;
                if (n && n.key) {
                    var r = j.default.n__dj(n.key);
                    if (r.column >= t || r.row >= e) {
                        this.props.onSelectedChanged({
                            key: j.default.getKeyFromRowCol(Math.min(r.row, e - 1), Math.min(r.column, t - 1)),
                            selected: {
                                lineIndex: 0,
                                charIndex: 0
                            }
                        })
                    }
                }
            }
        }, {
            key: "changeModelBaseOnRowColumn",
            value: function(e, t) {
                if (this.props.data.row != e || this.props.data.column != t) {
                    var n = this.props.data
                      , n = T.default.adjustModelByRowCollumn(n, e, t);
                    this.props.onDataChanged(n, R.default.getBuilder().withFocusAcquired().build()),
                    this.changeSelectedIfRequire(n.row, n.column)
                }
            }
        }, {
            key: "onRowChange",
            value: function(e) {
                var t = I.default.parseInt(e.target.value, 1, 100);
                this.setState({
                    row: t
                }),
                t && this.changeModelBaseOnRowColumn(t, this.state.column)
            }
        }, {
            key: "onColumnChange",
            value: function(e) {
                var t = I.default.parseInt(e.target.value, 1, 50);
                this.setState({
                    column: t
                }),
                t && this.changeModelBaseOnRowColumn(this.state.row, t)
            }
        }, {
            key: "onBracketChange",
            value: function(e) {
                var t = e;
                if (t) {
                    t = t[0];
                    var n = this.findPair(t);
                    t = n ? n[0] : "("
                } else
                    t = "";
                this.props.onDataChanged(E.default.set(this.props.data, "bracket", t))
            }
        }, {
            key: "renderBorderDesign",
            value: function() {
                var e = this;
                if (this.state.showBorderDesign && this.isArray())
                    return f.default.createElement(W.default, {
                        matrixRef: this.matrix,
                        vLines: this.props.data.vLines || [],
                        hLines: this.props.data.hLines || [],
                        onVLineChanged: function(t) {
                            return e.props.onDataChanged(E.default.set(e.props.data, "vLines", t))
                        },
                        onHLineChanged: function(t) {
                            return e.props.onDataChanged(E.default.set(e.props.data, "hLines", t))
                        }
                    })
            }
        }, {
            key: "getDisplayMode",
            value: function() {
                return this.props.displayMode
            }
        }, {
            key: "shouldShowSmaller",
            value: function() {
                return !1
            }
        }, {
            key: "renderColumn",
            value: function(e, t) {
                var n = e + "_" + t
                  , r = "";
                r += this.isChildSelected() ? " selected" : "";
                var o = this.props.fontSize;
                return this.shouldShowSmaller() && (o *= .75),
                f.default.createElement("td", {
                    key: this.props.data.elements[n].id,
                    className: r
                }, f.default.createElement(b.default, u({}, this.buildMetaDataFromName(n), {
                    className: "editor-matrix",
                    showBorder: !1,
                    optimizeForOneLine: !0,
                    displayMode: this.getDisplayMode(),
                    fontSize: o
                })))
            }
        }, {
            key: "renderRowContent",
            value: function(e) {
                for (var t = [], n = this.props.data.column, r = 0; r < n; r++)
                    t.push(this.renderColumn(e, r));
                return t
            }
        }, {
            key: "renderRow",
            value: function(e) {
                var t = this.isChildSelected() ? " selected" : "";
                return t = "math-row" + t,
                this.shouldShowSmaller() && (t += " smaller"),
                f.default.createElement("tr", {
                    key: this.getKeyForRow(e),
                    className: t
                }, this.renderRowContent(e))
            }
        }, {
            key: "renderTables",
            value: function() {
                for (var e = [], t = this.props.data.row, n = 0; n < t; n++)
                    e.push(this.renderRow(n));
                return e
            }
        }, {
            key: "isArray",
            value: function() {
                return "\\array" == this.props.data.text
            }
        }, {
            key: "componentWillUnmount",
            value: function() {
                this.willComponentUnmount = !0
            }
        }, {
            key: "updateMatrix",
            value: function() {
                if (this.compositeBlock) {
                    if (!this.props.data.bracket)
                        return null;
                    var e = S.default.n__fh((0,
                    y.default)(this.compositeBlock).children("matrix").children("table").get(0)).height;
                    if (e != this.state.height) {
                        this.setState({
                            height: e,
                            bracketWidth: N.default.bracketWitdhFromHeight(e, S.default.getComputedFontSize(this.compositeBlock))
                        }),
                        (0,
                        y.default)(this.compositeBlock).children("matrix").children("vcomposed-symbol").height(e)
                    }
                }
            }
        }, {
            key: "afterReactRenderWhenDataChanged",
            value: function() {
                this.updateMatrix.displayName = "matrix",
                P.default.push(this.updateMatrix, this)
            }
        }, {
            key: "renderOpenBracket",
            value: function() {
                if (!this.props.data.bracket)
                    return null;
                var e = this.findPair(this.props.data.bracket)
                  , t = q[e[0]];
                return "|" == this.props.data.bracket && (t = "open-vert"),
                "‖" == this.props.data.bracket && (t = "open-Vert"),
                this.renderBracket(t)
            }
        }, {
            key: "renderCloseBracket",
            value: function() {
                if (!this.props.data.bracket)
                    return null;
                var e = this.findPair(this.props.data.bracket)
                  , t = q[e[1]];
                return "|" == this.props.data.bracket && (t = "close-vert"),
                "‖" == this.props.data.bracket && (t = "close-Vert"),
                this.renderBracket(t)
            }
        }, {
            key: "getCurrentAlign",
            value: function(e) {
                return void 0 === e && (e = this.currentSelectedColumn()),
                (this.props.data.aligns || {})[e] || "center"
            }
        }, {
            key: "currentSelectedColumn",
            value: function() {
                var e = this.props.selected.key;
                return parseInt(e.split("_")[1])
            }
        }, {
            key: "changeCurrentColumnAlign",
            value: function(e) {
                var t = E.default.set(this.props.data.aligns || {}, this.currentSelectedColumn(), e);
                this.props.onDataChanged(E.default.set(this.props.data, "aligns", t))
            }
        }, {
            key: "renderBracket",
            value: function(e) {
                return f.default.createElement(_.default, {
                    updateOnlyOnNotifyDataChanged: !0,
                    notifyData: this.props.data,
                    delimiter: e,
                    fontSize: this.getFontSizePixel()
                })
            }
        }, {
            key: "renderSetting",
            value: function() {
                var e = this;
                if (!this.isSelectModeOnly()) {
                    var t = this.props.data;
                    return this.isChildSelected() && !this.state.showBorderDesign ? f.default.createElement(z.default, {
                        disableLayoutType: !!this.disableLayoutType,
                        onLayoutChange: this.onLayoutChange,
                        onRowChange: this.onRowChange,
                        onColumnChange: this.onColumnChange,
                        text: t.text,
                        row: this.state.row,
                        column: this.state.column,
                        bracket: t.bracket,
                        onBracketChange: this.onBracketChange,
                        colAlign: this.getCurrentAlign(),
                        onShowBorderDesignChange: function(t) {
                            return e.setState({
                                showBorderDesign: t
                            })
                        },
                        changeCurrentColumnAlign: this.changeCurrentColumnAlign
                    }) : void 0
                }
            }
        }, {
            key: "renderPlaceHolder",
            value: function() {}
        }, {
            key: "getTableCssStyle",
            value: function() {}
        }, {
            key: "renderColumns",
            value: function() {}
        }, {
            key: "renderComponent",
            value: function() {
                var e = this;
                return f.default.createElement("matrix", {
                    ref: function(t) {
                        return e.matrix = t
                    },
                    className: this.props.data.text.substr(1)
                }, this.renderOpenBracket(), f.default.createElement("table", {
                    style: this.getTableCssStyle()
                }, this.renderColumns(), f.default.createElement("tbody", null, this.renderTables())), this.renderCloseBracket(), this.renderSetting(), this.renderBorderDesign(), this.renderPlaceHolder())
            }
        }]),
        t
    }(w.default);
    G.bracketPairs = ["()", "{}", "<>", "[]", "| |", "‖ ‖"],
    t.default = G,
    t.ExactMatrix = function(e) {
        function t(e) {
            o(this, t);
            var n = i(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e));
            return n.supportSmallerInTextMode = !0,
            n
        }
        return a(t, e),
        t
    }(G)
}
, function(e, t, n) {
    var r = n(438)
      , o = "object" == typeof self && self && self.Object === Object && self;
    e.exports = r || o || Function("return this")()
}
, function(e, t, n) {
    var r = n(23);
    e.exports = function(e, t) {
        if (!r(e))
            return e;
        var n, o;
        if (t && "function" == typeof (n = e.toString) && !r(o = n.call(e)))
            return o;
        if ("function" == typeof (n = e.valueOf) && !r(o = n.call(e)))
            return o;
        if (!t && "function" == typeof (n = e.toString) && !r(o = n.call(e)))
            return o;
        throw TypeError("Can't convert object to primitive value")
    }
}
, function(e, t, n) {
    var r = n(2)
      , o = n(83)
      , i = n(19);
    e.exports = function(e, t) {
        var n = (o.Object || {})[e] || Object[e]
          , a = {};
        a[e] = t(n),
        r(r.S + r.F * i(function() {
            n(1)
        }), "Object", a)
    }
}
, function(e, t, n) {
    var r = n(84)
      , o = n(159)
      , i = n(41)
      , a = n(38)
      , u = n(628);
    e.exports = function(e, t) {
        var n = 1 == e
          , l = 2 == e
          , s = 3 == e
          , c = 4 == e
          , f = 6 == e
          , d = 5 == e || f
          , p = t || u;
        return function(t, u, h) {
            for (var y, m, v = i(t), g = o(v), b = r(u, h, 3), x = a(g.length), w = 0, C = n ? p(t, x) : l ? p(t, 0) : void 0; x > w; w++)
                if ((d || w in g) && (y = g[w],
                m = b(y, w, v),
                e))
                    if (n)
                        C[w] = m;
                    else if (m)
                        switch (e) {
                        case 3:
                            return !0;
                        case 5:
                            return y;
                        case 6:
                            return w;
                        case 2:
                            C.push(y)
                        }
                    else if (c)
                        return !1;
            return f ? -1 : s || c ? c : C
        }
    }
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function i(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
    function a(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.MatrixSc = void 0;
    var u = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , l = n(1)
      , s = r(l)
      , c = n(0)
      , f = r(c)
      , d = n(24)
      , p = r(d)
      , h = n(6)
      , y = r(h)
      , m = n(5)
      , v = r(m)
      , g = n(74)
      , b = n(276)
      , x = r(b)
      , w = function(e) {
        function t(e) {
            o(this, t);
            var n = i(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e));
            return n.bracketMap = {
                "{": "Bmatrix",
                "[": "bmatrix",
                "(": "pmatrix",
                "|": "vmatrix",
                " ": "matrix",
                "‖": "Vmatrix"
            },
            n
        }
        return a(t, e),
        u(t, [{
            key: "getViewComponent",
            value: function() {
                return g.ExactMatrix
            }
        }, {
            key: "getModel",
            value: function() {
                var e = this.getModelFromStructure({
                    "0_0": "editor",
                    "0_1": "editor",
                    "1_0": "editor",
                    "1_1": "editor"
                }, "\\matrix");
                return e.row = 2,
                e.column = 2,
                e.bracket = "(",
                e
            }
        }, {
            key: "getLatexName",
            value: function() {
                return "\\matrix"
            }
        }, {
            key: "getSymbolInfo",
            value: function() {
                return this.fillSymbolInfo({
                    type: "composite",
                    names: ["\\matrix"],
                    height: 30,
                    renderSymbol: function() {
                        return f.default.createElement(x.default, null)
                    }
                })
            }
        }, {
            key: "bracketFromName",
            value: function(e) {
                return "pmatrix" == e ? "(" : "Bmatrix" == e ? "{" : "bmatrix" == e ? "[" : "vmatrix" == e ? "|" : "Vmatrix" == e ? "‖" : "matrix" == e ? null : void 0
            }
        }, {
            key: "findMaxColumn",
            value: function(e) {
                for (var t = 0, n = 0; n < e.length; n++) {
                    var r = e[n].sections ? e[n].sections.length : 0;
                    t = Math.max(r, t)
                }
                return t
            }
        }, {
            key: "toModel",
            value: function(e, t) {
                for (var n = this.bracketFromName(e), r = t, o = {}, i = this.findMaxColumn(t), a = r.length, u = 0; u < r.length; u++) {
                    var l = r[u];
                    l.sections = l.sections || [];
                    for (var s = 0; s < i; s++) {
                        o[u + "_" + s] = l.sections[s] ? l.sections[s] : v.default.n__dt()
                    }
                }
                return null == o["0_0"] && (o["0_0"] = v.default.n__dt(),
                i = 1,
                a = 1),
                {
                    id: y.default.nextId(),
                    type: "composite",
                    text: this.getLatexName(),
                    row: a,
                    column: i,
                    bracket: n,
                    elements: o
                }
            }
        }, {
            key: "toLatex",
            value: function(e, t, n, r, o) {
                var i = e.bracket || " ";
                return null == r && (r = this.bracketMap[i]),
                o = o || "",
                t = s.default.assign({}, t, {
                    inMathExpression: !0
                }),
                "\\begin{" + r + "}" + o + "\n" + this.toLatexFromTable(e, t, n) + "\n\\end{" + r + "}"
            }
        }, {
            key: "toLatexFromTable",
            value: function(e, t, n) {
                for (var r = [], o = 0; o < e.row; o++) {
                    var i = []
                      , a = "";
                    e.hLines && e.hLines.indexOf(o) >= 0 && (a += "\\hline\n");
                    for (var u = 0; u < e.column; u++) {
                        i.push("" + n.toLatexFromEditor(e.elements[o + "_" + u], t))
                    }
                    a += i.join(" & "),
                    r.push(a)
                }
                return e.hLines && e.hLines.indexOf(o) >= 0 && r.push("\\hline"),
                r.join("\\\\\n")
            }
        }]),
        t
    }(p.default);
    t.default = new w,
    t.MatrixSc = w
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function i(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
    function a(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.OverSymbolSc = t.OverSymbol = void 0;
    var u = Object.assign || function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
      , l = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , s = n(0)
      , c = r(s)
      , f = n(13)
      , d = r(f)
      , p = n(103)
      , h = r(p)
      , y = n(3)
      , m = r(y)
      , v = n(54)
      , g = r(v)
      , b = n(90)
      , x = r(b);
    n(1139);
    var w = function(e) {
        function t(e) {
            o(this, t);
            var n = i(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e));
            return n.containerClassName = "over-symbol",
            n.shouldAdjustSymbolWithCharacterSign = !1,
            n
        }
        return a(t, e),
        l(t, [{
            key: "getSymbol",
            value: function() {
                return "*"
            }
        }, {
            key: "getPowerIndexInfo",
            value: function() {
                return {
                    rect: m.default.n__fh(this.refMap.value.editor),
                    shouldConsiderAsChar: this.isSingleTextBlockFirstLine(this.props.data.elements.value)
                }
            }
        }, {
            key: "getInnerSymbolClass",
            value: function() {
                return this.shouldAdjustSymbolWithCharacterSign ? this.isSingleTextBlockLeftUpperSign(this.props.data.elements.value) ? "left-sign" : this.isSingleTextBlockRightUpperSign(this.props.data.elements.value) ? "right-sign" : "" : ""
            }
        }, {
            key: "getSymbolHeight",
            value: function() {
                return this.getRoundEmStr(.4)
            }
        }, {
            key: "getMarginBottom",
            value: function() {
                return this.getRoundEmStr(this.isSingleTextBlockAndUperSmall(this.props.data.elements.value) ? -.4 : -.2)
            }
        }, {
            key: "renderComponent",
            value: function() {
                var e = this
                  , t = {
                    height: this.getSymbolHeight(),
                    marginBottom: this.getMarginBottom()
                }
                  , n = this.getSymbolClassName ? this.getSymbolClassName() : null;
                return [c.default.createElement("symbol", {
                    key: "symbol",
                    style: t,
                    className: n,
                    ref: function(t) {
                        return e.symbol = t
                    }
                }, c.default.createElement("inner", {
                    className: this.getInnerSymbolClass()
                }, this.getSymbol())), c.default.createElement(d.default, u({
                    key: "value",
                    className: "center",
                    borderIfEmpty: !0,
                    optimizeForOneLine: !0
                }, this.buildMetaDataFromName("value")))]
            }
        }]),
        t
    }(h.default)
      , C = function(e) {
        function t() {
            o(this, t);
            var e = i(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this));
            return e.isOverSymbol = !0,
            e
        }
        return a(t, e),
        l(t, [{
            key: "getViewComponent",
            value: function() {
                return w
            }
        }, {
            key: "getLatextName",
            value: function() {
                return "\\tilde"
            }
        }, {
            key: "getSymbol",
            value: function() {
                return "~"
            }
        }, {
            key: "getSymbolInfo",
            value: function() {
                return this.fillSymbolInfo({
                    type: "composite",
                    names: [this.getLatextName()],
                    symbol: this.getSymbol(),
                    renderSymbol: function() {
                        return c.default.createElement(x.default, {
                            symbol: this.symbol
                        })
                    }
                })
            }
        }]),
        t
    }(g.default);
    t.default = new C,
    t.OverSymbol = w,
    t.OverSymbolSc = C
}
, function(e, t, n) {
    "use strict";
    t.__esModule = !0;
    var r = n(1449);
    t.default = function(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }(r).default || function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
}
, function(e, t) {
    var n;
    n = function() {
        return this
    }();
    try {
        n = n || Function("return this")() || (0,
        eval)("this")
    } catch (e) {
        "object" == typeof window && (n = window)
    }
    e.exports = n
}
, function(e, t) {
    var n = e.exports = {
        version: "2.4.0"
    };
    "number" == typeof __e && (__e = n)
}
, function(e, t, n) {
    var r = n(59);
    e.exports = function(e, t, n) {
        if (r(e),
        void 0 === t)
            return e;
        switch (n) {
        case 1:
            return function(n) {
                return e.call(t, n)
            }
            ;
        case 2:
            return function(n, r) {
                return e.call(t, n, r)
            }
            ;
        case 3:
            return function(n, r, o) {
                return e.call(t, n, r, o)
            }
        }
        return function() {
            return e.apply(t, arguments)
        }
    }
}
, function(e, t, n) {
    "use strict";
    if (n(32)) {
        var r = n(110)
          , o = n(15)
          , i = n(19)
          , a = n(2)
          , u = n(195)
          , l = n(253)
          , s = n(84)
          , c = n(116)
          , f = n(98)
          , d = n(57)
          , p = n(117)
          , h = n(100)
          , y = n(38)
          , m = n(112)
          , v = n(76)
          , g = n(48)
          , b = n(342)
          , x = n(161)
          , w = n(23)
          , C = n(41)
          , E = n(245)
          , k = n(113)
          , _ = n(63)
          , A = n(114).f
          , S = n(247)
          , O = n(109)
          , P = n(26)
          , M = n(78)
          , I = n(187)
          , D = n(250)
          , T = n(249)
          , B = n(137)
          , j = n(191)
          , L = n(115)
          , R = n(248)
          , F = n(351)
          , N = n(33)
          , U = n(62)
          , z = N.f
          , H = U.f
          , W = o.RangeError
          , q = o.TypeError
          , G = o.Uint8Array
          , V = Array.prototype
          , K = l.ArrayBuffer
          , Q = l.DataView
          , J = M(0)
          , Y = M(2)
          , X = M(3)
          , Z = M(4)
          , $ = M(5)
          , ee = M(6)
          , te = I(!0)
          , ne = I(!1)
          , re = T.values
          , oe = T.keys
          , ie = T.entries
          , ae = V.lastIndexOf
          , ue = V.reduce
          , le = V.reduceRight
          , se = V.join
          , ce = V.sort
          , fe = V.slice
          , de = V.toString
          , pe = V.toLocaleString
          , he = P("iterator")
          , ye = P("toStringTag")
          , me = O("typed_constructor")
          , ve = O("def_constructor")
          , ge = u.CONSTR
          , be = u.TYPED
          , xe = u.VIEW
          , we = M(1, function(e, t) {
            return Se(D(e, e[ve]), t)
        })
          , Ce = i(function() {
            return 1 === new G(new Uint16Array([1]).buffer)[0]
        })
          , Ee = !!G && !!G.prototype.set && i(function() {
            new G(1).set({})
        })
          , ke = function(e, t) {
            if (void 0 === e)
                throw q("Wrong length!");
            var n = +e
              , r = y(e);
            if (t && !b(n, r))
                throw W("Wrong length!");
            return r
        }
          , _e = function(e, t) {
            var n = h(e);
            if (n < 0 || n % t)
                throw W("Wrong offset!");
            return n
        }
          , Ae = function(e) {
            if (w(e) && be in e)
                return e;
            throw q(e + " is not a typed array!")
        }
          , Se = function(e, t) {
            if (!(w(e) && me in e))
                throw q("It is not a typed array constructor!");
            return new e(t)
        }
          , Oe = function(e, t) {
            return Pe(D(e, e[ve]), t)
        }
          , Pe = function(e, t) {
            for (var n = 0, r = t.length, o = Se(e, r); r > n; )
                o[n] = t[n++];
            return o
        }
          , Me = function(e, t, n) {
            z(e, t, {
                get: function() {
                    return this._d[n]
                }
            })
        }
          , Ie = function(e) {
            var t, n, r, o, i, a, u = C(e), l = arguments.length, c = l > 1 ? arguments[1] : void 0, f = void 0 !== c, d = S(u);
            if (void 0 != d && !E(d)) {
                for (a = d.call(u),
                r = [],
                t = 0; !(i = a.next()).done; t++)
                    r.push(i.value);
                u = r
            }
            for (f && l > 2 && (c = s(c, arguments[2], 2)),
            t = 0,
            n = y(u.length),
            o = Se(this, n); n > t; t++)
                o[t] = f ? c(u[t], t) : u[t];
            return o
        }
          , De = function() {
            for (var e = 0, t = arguments.length, n = Se(this, t); t > e; )
                n[e] = arguments[e++];
            return n
        }
          , Te = !!G && i(function() {
            pe.call(new G(1))
        })
          , Be = function() {
            return pe.apply(Te ? fe.call(Ae(this)) : Ae(this), arguments)
        }
          , je = {
            copyWithin: function(e, t) {
                return F.call(Ae(this), e, t, arguments.length > 2 ? arguments[2] : void 0)
            },
            every: function(e) {
                return Z(Ae(this), e, arguments.length > 1 ? arguments[1] : void 0)
            },
            fill: function(e) {
                return R.apply(Ae(this), arguments)
            },
            filter: function(e) {
                return Oe(this, Y(Ae(this), e, arguments.length > 1 ? arguments[1] : void 0))
            },
            find: function(e) {
                return $(Ae(this), e, arguments.length > 1 ? arguments[1] : void 0)
            },
            findIndex: function(e) {
                return ee(Ae(this), e, arguments.length > 1 ? arguments[1] : void 0)
            },
            forEach: function(e) {
                J(Ae(this), e, arguments.length > 1 ? arguments[1] : void 0)
            },
            indexOf: function(e) {
                return ne(Ae(this), e, arguments.length > 1 ? arguments[1] : void 0)
            },
            includes: function(e) {
                return te(Ae(this), e, arguments.length > 1 ? arguments[1] : void 0)
            },
            join: function(e) {
                return se.apply(Ae(this), arguments)
            },
            lastIndexOf: function(e) {
                return ae.apply(Ae(this), arguments)
            },
            map: function(e) {
                return we(Ae(this), e, arguments.length > 1 ? arguments[1] : void 0)
            },
            reduce: function(e) {
                return ue.apply(Ae(this), arguments)
            },
            reduceRight: function(e) {
                return le.apply(Ae(this), arguments)
            },
            reverse: function() {
                for (var e, t = this, n = Ae(t).length, r = Math.floor(n / 2), o = 0; o < r; )
                    e = t[o],
                    t[o++] = t[--n],
                    t[n] = e;
                return t
            },
            some: function(e) {
                return X(Ae(this), e, arguments.length > 1 ? arguments[1] : void 0)
            },
            sort: function(e) {
                return ce.call(Ae(this), e)
            },
            subarray: function(e, t) {
                var n = Ae(this)
                  , r = n.length
                  , o = m(e, r);
                return new (D(n, n[ve]))(n.buffer,n.byteOffset + o * n.BYTES_PER_ELEMENT,y((void 0 === t ? r : m(t, r)) - o))
            }
        }
          , Le = function(e, t) {
            return Oe(this, fe.call(Ae(this), e, t))
        }
          , Re = function(e) {
            Ae(this);
            var t = _e(arguments[1], 1)
              , n = this.length
              , r = C(e)
              , o = y(r.length)
              , i = 0;
            if (o + t > n)
                throw W("Wrong length!");
            for (; i < o; )
                this[t + i] = r[i++]
        }
          , Fe = {
            entries: function() {
                return ie.call(Ae(this))
            },
            keys: function() {
                return oe.call(Ae(this))
            },
            values: function() {
                return re.call(Ae(this))
            }
        }
          , Ne = function(e, t) {
            return w(e) && e[be] && "symbol" != typeof t && t in e && String(+t) == String(t)
        }
          , Ue = function(e, t) {
            return Ne(e, t = v(t, !0)) ? f(2, e[t]) : H(e, t)
        }
          , ze = function(e, t, n) {
            return !(Ne(e, t = v(t, !0)) && w(n) && g(n, "value")) || g(n, "get") || g(n, "set") || n.configurable || g(n, "writable") && !n.writable || g(n, "enumerable") && !n.enumerable ? z(e, t, n) : (e[t] = n.value,
            e)
        };
        ge || (U.f = Ue,
        N.f = ze),
        a(a.S + a.F * !ge, "Object", {
            getOwnPropertyDescriptor: Ue,
            defineProperty: ze
        }),
        i(function() {
            de.call({})
        }) && (de = pe = function() {
            return se.call(this)
        }
        );
        var He = p({}, je);
        p(He, Fe),
        d(He, he, Fe.values),
        p(He, {
            slice: Le,
            set: Re,
            constructor: function() {},
            toString: de,
            toLocaleString: Be
        }),
        Me(He, "buffer", "b"),
        Me(He, "byteOffset", "o"),
        Me(He, "byteLength", "l"),
        Me(He, "length", "e"),
        z(He, ye, {
            get: function() {
                return this[be]
            }
        }),
        e.exports = function(e, t, n, l) {
            l = !!l;
            var s = e + (l ? "Clamped" : "") + "Array"
              , f = "Uint8Array" != s
              , p = "get" + e
              , h = "set" + e
              , m = o[s]
              , v = m || {}
              , g = m && _(m)
              , b = !m || !u.ABV
              , C = {}
              , E = m && m.prototype
              , S = function(e, n) {
                var r = e._d;
                return r.v[p](n * t + r.o, Ce)
            }
              , O = function(e, n, r) {
                var o = e._d;
                l && (r = (r = Math.round(r)) < 0 ? 0 : r > 255 ? 255 : 255 & r),
                o.v[h](n * t + o.o, r, Ce)
            }
              , P = function(e, t) {
                z(e, t, {
                    get: function() {
                        return S(this, t)
                    },
                    set: function(e) {
                        return O(this, t, e)
                    },
                    enumerable: !0
                })
            };
            b ? (m = n(function(e, n, r, o) {
                c(e, m, s, "_d");
                var i, a, u, l, f = 0, p = 0;
                if (w(n)) {
                    if (!(n instanceof K || "ArrayBuffer" == (l = x(n)) || "SharedArrayBuffer" == l))
                        return be in n ? Pe(m, n) : Ie.call(m, n);
                    i = n,
                    p = _e(r, t);
                    var h = n.byteLength;
                    if (void 0 === o) {
                        if (h % t)
                            throw W("Wrong length!");
                        if ((a = h - p) < 0)
                            throw W("Wrong length!")
                    } else if ((a = y(o) * t) + p > h)
                        throw W("Wrong length!");
                    u = a / t
                } else
                    u = ke(n, !0),
                    a = u * t,
                    i = new K(a);
                for (d(e, "_d", {
                    b: i,
                    o: p,
                    l: a,
                    e: u,
                    v: new Q(i)
                }); f < u; )
                    P(e, f++)
            }),
            E = m.prototype = k(He),
            d(E, "constructor", m)) : j(function(e) {
                new m(null),
                new m(e)
            }, !0) || (m = n(function(e, n, r, o) {
                c(e, m, s);
                var i;
                return w(n) ? n instanceof K || "ArrayBuffer" == (i = x(n)) || "SharedArrayBuffer" == i ? void 0 !== o ? new v(n,_e(r, t),o) : void 0 !== r ? new v(n,_e(r, t)) : new v(n) : be in n ? Pe(m, n) : Ie.call(m, n) : new v(ke(n, f))
            }),
            J(g !== Function.prototype ? A(v).concat(A(g)) : A(v), function(e) {
                e in m || d(m, e, v[e])
            }),
            m.prototype = E,
            r || (E.constructor = m));
            var M = E[he]
              , I = !!M && ("values" == M.name || void 0 == M.name)
              , D = Fe.values;
            d(m, me, !0),
            d(E, be, s),
            d(E, xe, !0),
            d(E, ve, m),
            (l ? new m(1)[ye] == s : ye in E) || z(E, ye, {
                get: function() {
                    return s
                }
            }),
            C[s] = m,
            a(a.G + a.W + a.F * (m != v), C),
            a(a.S, s, {
                BYTES_PER_ELEMENT: t,
                from: Ie,
                of: De
            }),
            "BYTES_PER_ELEMENT"in E || d(E, "BYTES_PER_ELEMENT", t),
            a(a.P, s, je),
            L(s),
            a(a.P + a.F * Ee, s, {
                set: Re
            }),
            a(a.P + a.F * !I, s, Fe),
            a(a.P + a.F * (E.toString != de), s, {
                toString: de
            }),
            a(a.P + a.F * i(function() {
                new m(1).slice()
            }), s, {
                slice: Le
            }),
            a(a.P + a.F * (i(function() {
                return [1, 2].toLocaleString() != new m([1, 2]).toLocaleString()
            }) || !i(function() {
                E.toLocaleString.call([1, 2])
            })), s, {
                toLocaleString: Be
            }),
            B[s] = I ? M : D,
            r || I || d(E, he, D)
        }
    } else
        e.exports = function() {}
}
, function(e, t, n) {
    var r = n(354)
      , o = n(2)
      , i = n(186)("metadata")
      , a = i.store || (i.store = new (n(357)))
      , u = function(e, t, n) {
        var o = a.get(e);
        if (!o) {
            if (!n)
                return;
            a.set(e, o = new r)
        }
        var i = o.get(t);
        if (!i) {
            if (!n)
                return;
            o.set(t, i = new r)
        }
        return i
    };
    e.exports = {
        store: a,
        map: u,
        has: function(e, t, n) {
            var r = u(t, n, !1);
            return void 0 !== r && r.has(e)
        },
        get: function(e, t, n) {
            var r = u(t, n, !1);
            return void 0 === r ? void 0 : r.get(e)
        },
        set: function(e, t, n, r) {
            u(n, r, !0).set(e, t)
        },
        keys: function(e, t) {
            var n = u(e, t, !1)
              , r = [];
            return n && n.forEach(function(e, t) {
                r.push(t)
            }),
            r
        },
        key: function(e) {
            return void 0 === e || "symbol" == typeof e ? e : String(e)
        },
        exp: function(e) {
            o(o.S, "Reflect", e)
        }
    }
}
, function(e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var r = n(734)
      , o = n(373)
      , i = n(753);
    n.d(t, "Provider", function() {
        return r.b
    }),
    n.d(t, "createProvider", function() {
        return r.a
    }),
    n.d(t, "connectAdvanced", function() {
        return o.a
    }),
    n.d(t, "connect", function() {
        return i.a
    })
}
, function(e, t, n) {
    "use strict";
    e.exports = {
        current: null
    }
}
, function(e, t, n) {
    "use strict";
    function r(e, t, n, r) {
        this.dispatchConfig = e,
        this._targetInst = t,
        this.nativeEvent = n;
        var o = this.constructor.Interface;
        for (var i in o)
            if (o.hasOwnProperty(i)) {
                var u = o[i];
                u ? this[i] = u(n) : "target" === i ? this.target = r : this[i] = n[i]
            }
        return this.isDefaultPrevented = (null != n.defaultPrevented ? n.defaultPrevented : !1 === n.returnValue) ? a.thatReturnsTrue : a.thatReturnsFalse,
        this.isPropagationStopped = a.thatReturnsFalse,
        this
    }
    var o = n(31)
      , i = n(118)
      , a = n(64)
      , u = (n(16),
    ["dispatchConfig", "_targetInst", "nativeEvent", "isDefaultPrevented", "isPropagationStopped", "_dispatchListeners", "_dispatchInstances"])
      , l = {
        type: null,
        target: null,
        currentTarget: a.thatReturnsNull,
        eventPhase: null,
        bubbles: null,
        cancelable: null,
        timeStamp: function(e) {
            return e.timeStamp || Date.now()
        },
        defaultPrevented: null,
        isTrusted: null
    };
    o(r.prototype, {
        preventDefault: function() {
            this.defaultPrevented = !0;
            var e = this.nativeEvent;
            e && (e.preventDefault ? e.preventDefault() : "unknown" != typeof e.returnValue && (e.returnValue = !1),
            this.isDefaultPrevented = a.thatReturnsTrue)
        },
        stopPropagation: function() {
            var e = this.nativeEvent;
            e && (e.stopPropagation ? e.stopPropagation() : "unknown" != typeof e.cancelBubble && (e.cancelBubble = !0),
            this.isPropagationStopped = a.thatReturnsTrue)
        },
        persist: function() {
            this.isPersistent = a.thatReturnsTrue
        },
        isPersistent: a.thatReturnsFalse,
        destructor: function() {
            var e = this.constructor.Interface;
            for (var t in e)
                this[t] = null;
            for (var n = 0; n < u.length; n++)
                this[u[n]] = null
        }
    }),
    r.Interface = l,
    r.augmentClass = function(e, t) {
        var n = this
          , r = function() {};
        r.prototype = n.prototype;
        var a = new r;
        o(a, e.prototype),
        e.prototype = a,
        e.prototype.constructor = e,
        e.Interface = o({}, n.Interface, t),
        e.augmentClass = n.augmentClass,
        i.addPoolingTo(e, i.fourArgumentPooler)
    }
    ,
    i.addPoolingTo(r, i.fourArgumentPooler),
    e.exports = r
}
, function(e, t, n) {
    "use strict";
    function r(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function o(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
    function i(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var a = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , u = n(0)
      , l = function(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }(u);
    n(1065),
    t.default = function(e) {
        function t(e) {
            return r(this, t),
            o(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e))
        }
        return i(t, e),
        a(t, [{
            key: "render",
            value: function() {
                var e = 6
                  , t = 1;
                return this.props.height && (e = this.props.height,
                t = 10),
                l.default.createElement("div", {
                    className: "over-icon"
                }, l.default.createElement("div", {
                    className: "over-wrapper",
                    style: {
                        height: e,
                        lineHeight: t + "px"
                    }
                }, this.props.symbol), l.default.createElement("div", {
                    className: "common-big-square-icon"
                }))
            }
        }]),
        t
    }(l.default.Component)
}
, function(e, t) {
    function n(e) {
        var t = typeof e;
        return null != e && ("object" == t || "function" == t)
    }
    e.exports = n
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.red = void 0;
    var o = n(1296)
      , i = r(o)
      , a = n(1298)
      , u = r(a);
    t.default = {
        simpleCheckForValidColor: function(e) {
            var t = ["r", "g", "b", "a", "h", "s", "a", "v"]
              , n = 0
              , r = 0;
            return (0,
            i.default)(t, function(t) {
                e[t] && (n += 1,
                isNaN(e[t]) || (r += 1))
            }),
            n === r && e
        },
        toState: function(e, t) {
            var n = (0,
            u.default)(e.hex ? e.hex : e)
              , r = n.toHsl()
              , o = n.toHsv()
              , i = n.toRgb()
              , a = n.toHex();
            return 0 === r.s && (r.h = t || 0,
            o.h = t || 0),
            {
                hsl: r,
                hex: "000000" === a && 0 === i.a ? "transparent" : "#" + a,
                rgb: i,
                hsv: o,
                oldHue: e.h || t || r.h,
                source: e.source
            }
        },
        isValidHex: function(e) {
            return (0,
            u.default)(e).isValid()
        }
    };
    t.red = {
        hsl: {
            a: 1,
            h: 0,
            l: .5,
            s: 1
        },
        hex: "#ff0000",
        rgb: {
            r: 255,
            g: 0,
            b: 0,
            a: 1
        },
        hsv: {
            h: 0,
            s: 1,
            v: 1,
            a: 1
        }
    }
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function i(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
    function a(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.RectWrapMt = t.RectWrapSettings = t.RectWrap = void 0;
    var u = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , l = n(1)
      , s = r(l)
      , c = n(4)
      , f = r(c)
      , d = n(14)
      , p = r(d)
      , h = n(22)
      , y = r(h)
      , m = n(6)
      , v = r(m)
      , g = n(106)
      , b = r(g)
      , x = n(304)
      , w = function(e) {
        function t() {
            return o(this, t),
            i(this, (t.__proto__ || Object.getPrototypeOf(t)).apply(this, arguments))
        }
        return a(t, e),
        u(t, [{
            key: "getWidth",
            value: function() {
                var e = this.props.shape.data
                  , t = e.p1
                  , n = e.p2;
                return Math.abs(n.x - t.x)
            }
        }, {
            key: "getHeight",
            value: function() {
                var e = this.props.shape.data
                  , t = e.p1
                  , n = e.p2;
                return Math.abs(n.y - t.y)
            }
        }, {
            key: "shape",
            value: function() {
                return this.props.shape
            }
        }, {
            key: "getCp",
            value: function() {
                var e = this.props.shape.data
                  , t = e.p1
                  , n = e.p2;
                return {
                    x: (t.x + n.x) / 2,
                    y: (t.y + n.y) / 2
                }
            }
        }, {
            key: "styleWithRotation",
            value: function() {
                var e = this.props.style
                  , t = this.props.shape.data.rotation;
                if (t) {
                    var n = this.getCp();
                    e = f.default.update(e, {
                        transform: "rotate(" + t + "deg)",
                        transformOrigin: n.x + "px " + n.y + "px"
                    })
                }
                return e
            }
        }, {
            key: "transparentStyleWithRotation",
            value: function() {
                var e = this.props.shape.data.rotation;
                if (e) {
                    var t = this.getCp();
                    return {
                        transform: "rotate(" + e + "deg)",
                        transformOrigin: t.x + "px " + t.y + "px"
                    }
                }
                return {}
            }
        }, {
            key: "render",
            value: function() {
                throw new Error(" not implemented")
            }
        }]),
        t
    }(x.BaseComposite);
    t.default = w;
    var C = function(e) {
        function t() {
            return o(this, t),
            i(this, (t.__proto__ || Object.getPrototypeOf(t)).apply(this, arguments))
        }
        return a(t, e),
        t
    }(x.BaseCompositeSettings)
      , E = function(e) {
        function t() {
            return o(this, t),
            i(this, (t.__proto__ || Object.getPrototypeOf(t)).apply(this, arguments))
        }
        return a(t, e),
        u(t, [{
            key: "getSettingDefaultValue",
            value: function() {}
        }, {
            key: "getSettingsComponent",
            value: function() {
                throw new Error("not implemented")
            }
        }, {
            key: "styleSupports",
            value: function() {
                return ["thickness", "strokeColor", "fillColor", "intersection", "strokeType", "rotation"]
            }
        }, {
            key: "minMaxVertical",
            value: function(e) {
                var t = e.data
                  , n = t.p1
                  , r = t.p2
                  , o = t.rotation;
                if (!n || !r)
                    throw new Error("could not figure out");
                if (!o)
                    return {
                        min: Math.min(n.y, r.y),
                        max: Math.max(n.y, r.y)
                    };
                var i = this.getCp(n, r);
                return n = p.default.pointRotate(n, i, o),
                r = p.default.pointRotate(r, i, o),
                {
                    min: Math.min(n.y, r.y),
                    max: Math.max(n.y, r.y)
                }
            }
        }, {
            key: "getBreakdownInfoWhenInvalidCache",
            value: function(e) {
                return {
                    data: this.getBreakdownInfoData(e)
                }
            }
        }, {
            key: "getBreakdownInfoData",
            value: function(e) {
                return this.rotateLines(e, p.default.segmentsFromPoints(p.default.getPointsRect(e.data)))
            }
        }, {
            key: "rotateLines",
            value: function(e, t) {
                return this.rotatePaths(e, t, ["p1", "p2"])
            }
        }, {
            key: "rotateBeziers",
            value: function(e, t) {
                return this.rotatePaths(e, t, ["p1", "p2", "cp", "cp2"])
            }
        }, {
            key: "rotatePaths",
            value: function(e, t, n) {
                var r = this
                  , o = e.data
                  , i = o.p1
                  , a = o.p2
                  , u = o.rotation;
                if (!u)
                    return t;
                var l = this.getCp(i, a);
                return s.default.map(t, function(e) {
                    return r.rotateInData(e, n, u, l)
                })
            }
        }, {
            key: "rotateInData",
            value: function(e, t, n, r) {
                var o = {};
                return t.forEach(function(t) {
                    var i = p.default.pointRotate(e[t], r, n);
                    o[t] = i
                }),
                f.default.update(e, o)
            }
        }, {
            key: "getControlPoints",
            value: function(e) {
                var t = e.data
                  , n = t.p1
                  , r = t.p2
                  , o = t.rotation
                  , i = this.getCp(n, r)
                  , a = r.x - n.x
                  , u = r.y - n.y
                  , l = [{
                    key: "left-top",
                    p: p.default.pointRotate(n, i, o)
                }, {
                    key: "top",
                    p: p.default.pointRotate({
                        x: i.x,
                        y: n.y
                    }, i, o)
                }, {
                    key: "top-right",
                    p: p.default.pointRotate({
                        x: r.x,
                        y: n.y
                    }, i, o)
                }, {
                    key: "right",
                    p: p.default.pointRotate({
                        x: r.x,
                        y: i.y
                    }, i, o)
                }, {
                    key: "right-bottom",
                    p: p.default.pointRotate(r, i, o)
                }, {
                    key: "bottom",
                    p: p.default.pointRotate({
                        x: i.x,
                        y: r.y
                    }, i, o)
                }, {
                    key: "bottom-left",
                    p: p.default.pointRotate({
                        x: n.x,
                        y: r.y
                    }, i, o)
                }, {
                    key: "left",
                    p: p.default.pointRotate({
                        x: n.x,
                        y: i.y
                    }, i, o)
                }];
                return a <= 20 && (l = s.default.filter(l, function(e) {
                    return "top" != e.key && "bottom" != e.key
                })),
                u <= 20 && (l = s.default.filter(l, function(e) {
                    return "right" != e.key && "left" != e.key
                })),
                u <= 25 && a <= 25 && l.forEach(function(e) {
                    return e.smaller = !0
                }),
                l
            }
        }, {
            key: "getSupplementaryLines",
            value: function(e) {
                return this.getBreakdownInfo(e).data
            }
        }, {
            key: "moveControlPoint",
            value: function(e, t, n) {
                var r = n.data
                  , o = r.p1
                  , i = r.p2
                  , a = r.rotation
                  , u = n.data
                  , l = this.getCp(o, i);
                switch (t = p.default.pointRotate(t, l, -a),
                e) {
                case "left-top":
                    t = {
                        x: Math.min(t.x, i.x),
                        y: Math.min(t.y, i.y)
                    },
                    u = f.default.setProp(u, "p1", t);
                    break;
                case "top":
                    t = {
                        x: t.x,
                        y: Math.min(t.y, i.y)
                    },
                    u = f.default.setProp(u, "p1", {
                        x: o.x,
                        y: t.y
                    });
                    break;
                case "top-right":
                    t = {
                        x: Math.max(t.x, o.x),
                        y: Math.min(t.y, i.y)
                    },
                    u = f.default.setProp(u, "p1", {
                        x: o.x,
                        y: t.y
                    }),
                    u = f.default.setProp(u, "p2", {
                        x: t.x,
                        y: i.y
                    });
                    break;
                case "right":
                    t = {
                        x: Math.max(t.x, o.x),
                        y: t.y
                    },
                    u = f.default.setProp(u, "p2", {
                        x: t.x,
                        y: i.y
                    });
                    break;
                case "right-bottom":
                    t = {
                        x: Math.max(t.x, o.x),
                        y: Math.max(t.y, o.y)
                    },
                    u = f.default.setProp(u, "p2", t);
                    break;
                case "bottom":
                    t = {
                        x: t.x,
                        y: Math.max(t.y, o.y)
                    },
                    u = f.default.setProp(u, "p2", {
                        x: i.x,
                        y: t.y
                    });
                    break;
                case "bottom-left":
                    t = {
                        x: Math.min(t.x, i.x),
                        y: Math.max(t.y, o.y)
                    },
                    u = f.default.setProp(u, "p1", {
                        x: t.x,
                        y: o.y
                    }),
                    u = f.default.setProp(u, "p2", {
                        x: i.x,
                        y: t.y
                    });
                    break;
                case "left":
                    t = {
                        x: Math.min(t.x, i.x),
                        y: t.y
                    },
                    u = f.default.setProp(u, "p1", {
                        x: t.x,
                        y: o.y
                    })
                }
                return a && (u = this.handleRotationForControlPoints(e, n.data, u)),
                f.default.setProp(n, "data", u)
            }
        }, {
            key: "handleRotationForControlPoints",
            value: function(e, t, n) {
                var r = n.rotation
                  , o = this.getCp(t.p1, t.p2)
                  , i = this.getCp(n.p1, n.p2);
                switch (e) {
                case "left-top":
                case "top":
                    var a = p.default.pointRotate(t.p2, o, r)
                      , u = p.default.pointRotate(n.p2, i, r);
                    break;
                case "top-right":
                case "right":
                    var a = p.default.pointRotate({
                        x: t.p1.x,
                        y: t.p2.y
                    }, o, r)
                      , u = p.default.pointRotate({
                        x: n.p1.x,
                        y: n.p2.y
                    }, i, r);
                    break;
                case "right-bottom":
                case "bottom":
                    var a = p.default.pointRotate(t.p1, o, r)
                      , u = p.default.pointRotate(n.p1, i, r);
                    break;
                case "bottom-left":
                case "left":
                    var a = p.default.pointRotate({
                        x: t.p2.x,
                        y: t.p1.y
                    }, o, r)
                      , u = p.default.pointRotate({
                        x: n.p2.x,
                        y: n.p1.y
                    }, i, r)
                }
                var l = {
                    x: a.x - u.x,
                    y: a.y - u.y
                };
                return f.default.update(n, {
                    p1: p.default.addPoint(n.p1, l),
                    p2: p.default.addPoint(n.p2, l)
                })
            }
        }, {
            key: "getCp",
            value: function(e, t) {
                return {
                    x: (e.x + t.x) / 2,
                    y: (e.y + t.y) / 2
                }
            }
        }, {
            key: "getBaseRotationPoints",
            value: function(e) {
                var t = p.default.normalizePointTupple(e.data)
                  , n = t.p1
                  , r = t.p2
                  , o = this.getCp(n, r);
                return {
                    p: {
                        x: o.x,
                        y: o.y - (r.y - n.y) / 2 - 20
                    },
                    cp: o
                }
            }
        }, {
            key: "getRotationPoints",
            value: function(e) {
                var t = this.getBaseRotationPoints(e)
                  , n = t.p
                  , r = t.cp;
                return {
                    cp: r,
                    p: p.default.pointRotate(n, r, e.data.rotation || 0)
                }
            }
        }, {
            key: "rotate",
            value: function(e, t) {
                return f.default.setProp(e, "data.rotation", t)
            }
        }, {
            key: "move",
            value: function(e, t) {
                var n = f.default.update(e.data, {
                    p1: p.default.addPoint(e.data.p1, t),
                    p2: p.default.addPoint(e.data.p2, t)
                });
                return f.default.setProp(e, "data", n)
            }
        }, {
            key: "createShape",
            value: function(e) {
                var e = e || 200
                  , t = b.default.getRandomPosYAround(100, 180, e);
                return {
                    id: v.default.nextDiagramCompositeShapeId(),
                    type: this.getType(),
                    data: {
                        p1: {
                            x: 100,
                            y: t.y1
                        },
                        p2: {
                            x: 170,
                            y: t.y1 + 40
                        }
                    }
                }
            }
        }, {
            key: "getRectangleBreakdownInfoData",
            value: function(e) {
                var t = y.default.getSettings(e, "cornerRadius");
                if (0 == t)
                    return this.rotateLines(e, p.default.segmentsFromPoints(p.default.getPointsRect(e.data)));
                var n = e.data
                  , r = n.p1
                  , o = n.p2
                  , i = p.default.getPointsRect(e.data)
                  , a = p.default.segmentsFromPoints(i);
                a.forEach(function(e) {
                    return e.length = p.default.distance2Points(e.p1, e.p2)
                });
                var u = [];
                a[0].length > 2 * t && u.push({
                    p1: p.default.addPoint(a[0].p1, {
                        x: t,
                        y: 0
                    }),
                    p2: p.default.addPoint(a[0].p2, {
                        x: -t,
                        y: 0
                    })
                }),
                a[1].length > 2 * t && u.push({
                    p1: p.default.addPoint(a[1].p1, {
                        x: 0,
                        y: t
                    }),
                    p2: p.default.addPoint(a[1].p2, {
                        x: 0,
                        y: -t
                    })
                }),
                a[2].length > 2 * t && u.push({
                    p1: p.default.addPoint(a[2].p1, {
                        x: -t,
                        y: 0
                    }),
                    p2: p.default.addPoint(a[2].p2, {
                        x: t,
                        y: 0
                    })
                }),
                a[3].length > 2 * t && u.push({
                    p1: p.default.addPoint(a[3].p1, {
                        x: 0,
                        y: -t
                    }),
                    p2: p.default.addPoint(a[3].p2, {
                        x: 0,
                        y: t
                    })
                });
                var l = o.x - r.x
                  , s = o.y - r.y
                  , c = t < l / 2 ? t : l / 2
                  , f = t < s / 2 ? t : s / 2
                  , d = {
                    x: r.x + c,
                    y: r.y + f
                }
                  , h = {
                    x: o.x - c,
                    y: r.y + f
                }
                  , m = {
                    x: o.x - c,
                    y: o.y - f
                }
                  , v = {
                    x: r.x + c,
                    y: o.y - f
                }
                  , g = p.default.getLeftTopArc(d, c, f)
                  , b = p.default.getRightTopArc(h, c, f)
                  , x = p.default.getRightBottomArc(m, c, f)
                  , w = p.default.getLeftBottomArc(v, c, f);
                return this.rotateLines(e, u).concat(this.rotateBeziers(e, [g, b, x, w]))
            }
        }]),
        t
    }(x.BaseCompositeMt);
    t.RectWrap = w,
    t.RectWrapSettings = C,
    t.RectWrapMt = E
}
, function(e, t, n) {
    "use strict";
    function r(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var o = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , i = n(22)
      , a = function(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }(i);
    t.default = new (function() {
        function e() {
            r(this, e)
        }
        return o(e, [{
            key: "getIconSvgStyle",
            value: function() {
                return {
                    stroke: "gray",
                    strokeWidth: 1,
                    fill: "none",
                    width: 23,
                    height: 18,
                    position: "relative"
                }
            }
        }, {
            key: "getEntityHtmlStyle",
            value: function(e) {
                switch (a.default.getEntityType(e)) {
                case "connection":
                case "shape-arrow":
                    return this.getStyle(e.style, ["strokeColor", "thickness"]);
                case "shape-object":
                case "intersection":
                    return this.getStyle(e.style, ["strokeColor", "thickness", "fillColor"]);
                case "shape-composite":
                    return this.getStyle(e.style, a.default.getShapeManagement(e).styleSupports() || []);
                case "text":
                    return this.getStyle(e.shape.style, ["strokeColor", "thickness", "fillColor", "strokeType"])
                }
                return {}
            }
        }, {
            key: "getStrokeDasharrayFromStrokeType",
            value: function(e) {
                switch (e) {
                case "-":
                case "2-":
                    return "";
                case ".":
                case "2.":
                    return "1 1";
                case "--":
                case "2--":
                    return "6 6"
                }
            }
        }, {
            key: "getStyle",
            value: function(e, t) {
                var n = this;
                e = e || {};
                var r = {};
                return t.forEach(function(t) {
                    switch (t) {
                    case "strokeColor":
                        r.stroke = a.default.getStyle(e, "strokeColor");
                        break;
                    case "thickness":
                        r.strokeWidth = a.default.getStyle(e, "thickness");
                        break;
                    case "fillColor":
                        r.fill = a.default.getStyle(e, "fillColor");
                        break;
                    case "strokeType":
                        r.strokeDasharray = n.getStrokeDasharrayFromStrokeType(a.default.getStyle(e, "strokeType"))
                    }
                }),
                r
            }
        }]),
        e
    }())
}
, function(e, t, n) {
    var r = n(313)("wks")
      , o = n(222)
      , i = n(107).Symbol
      , a = "function" == typeof i;
    (e.exports = function(e) {
        return r[e] || (r[e] = a && i[e] || (a ? i : o)("Symbol." + e))
    }
    ).store = r
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var o = n(1)
      , i = r(o)
      , a = n(4)
      , u = r(a)
      , l = function(e) {
        return e.sidebar.show
    }
      , s = function(e) {
        return e.sidebar.width
    }
      , c = function(e) {
        return e.sidebar.shareSection
    }
      , f = function(e) {
        return e.documents.editingDocumentId
    }
      , d = function(e) {
        return e.documents.items
    }
      , p = function(e) {
        return e.documents.documentRenameRequestedId
    }
      , h = function(e) {
        return e.documents.documentRenameRequestedId ? i.default.find(e.documents.items, function(t) {
            return t.id == e.documents.documentRenameRequestedId
        }) : null
    }
      , y = function(e) {
        return e.documents.editingDocumentId ? i.default.find(e.documents.items, function(t) {
            return t.id == e.documents.editingDocumentId
        }) : null
    }
      , m = function(e) {
        var t = e.documents.activeLoadedDocument;
        if (!t)
            return null;
        var n = t.id
          , r = i.default.find(e.documents.items, function(e) {
            return e.id == n
        });
        return u.default.update(r, {
            data: t.data,
            historyContents: t.historyContents
        })
    }
      , v = function(e) {
        return e.documents.isDocumentLoading
    }
      , g = function(e) {
        return e.user
    }
      , b = function(e) {
        return e.user.isAnonymous
    }
      , x = function(e) {
        return e.common.isInitialized
    }
      , w = function(e) {
        return e.documents.saveInfo.requestedStatus
    }
      , C = function(e) {
        return e.documents.saveInfo.isSaving
    }
      , E = function(e) {
        return e.user.displayName
    };
    t.default = {
        isSideBarShown: l,
        getSideBarWidth: s,
        getEditingDocumentId: f,
        getDocumentRenameRequestedId: p,
        getDocumentRenameRequested: h,
        getDocuments: d,
        getEditingDocument: y,
        isDocumentLoading: v,
        getActiveLoadedDocument: m,
        getUser: g,
        isAnonymousUser: b,
        isInitialized: x,
        getSaveStatus: w,
        isSaving: C,
        getUserDisplayName: E,
        getLoadingItemsError: function(e) {
            return e.documents.loadingItemsError
        },
        getActiveDocumentError: function(e) {
            return e.documents.activeDocumentError
        },
        getNetworkStatus: function(e) {
            return e.common.networkStatus
        },
        getShareSection: c
    }
}
, function(e, t, n) {
    "use strict";
    function r(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var o = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , i = n(401)
      , a = function(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }(i);
    t.default = new (function() {
        function e() {
            r(this, e);
            var t = new a.default;
            t.sniff(window.navigator.userAgent),
            this.sniffr = t
        }
        return o(e, [{
            key: "getDefaultFirstTimePageContent",
            value: function() {
                return mathGlobal.initData.initPageContent
            }
        }, {
            key: "getDefaultImportLatexContent",
            value: function() {
                return "abc"
            }
        }, {
            key: "isSaveDisabled",
            value: function() {
                return "main" != mathGlobal.appMode
            }
        }, {
            key: "isAppSettingStoreDisabled",
            value: function() {
                return "main" != mathGlobal.appMode
            }
        }, {
            key: "getAppMode",
            value: function() {
                return mathGlobal.appMode
            }
        }, {
            key: "isMainMode",
            value: function() {
                return "main" == this.getAppMode()
            }
        }, {
            key: "isTutorialMode",
            value: function() {
                return !this.isMainMode()
            }
        }, {
            key: "getBrowserName",
            value: function() {
                return this.sniffr.browser.name
            }
        }, {
            key: "getOsName",
            value: function() {
                return this.sniffr.os.name
            }
        }, {
            key: "isMac",
            value: function() {
                return "macos" == this.getOsName()
            }
        }, {
            key: "isMobileOrTablet",
            value: function() {
                return "Unknown" !== this.sniffr.device.name || this.isIos() || this.isAndroid() || this.isFirefoxOs()
            }
        }, {
            key: "isFirefoxOs",
            value: function() {
                return "firefoxos" == this.sniffr.os.name
            }
        }, {
            key: "getScreenWidth",
            value: function() {
                return window.screen.width
            }
        }, {
            key: "shouldUseSmallLayout",
            value: function() {
                return this.isMobileOrTablet() && this.getScreenWidth() < 900
            }
        }, {
            key: "isIos",
            value: function() {
                return "ios" == this.sniffr.os.name
            }
        }, {
            key: "isAndroid",
            value: function() {
                return "android" == this.sniffr.os.name
            }
        }]),
        e
    }())
}
, function(e, t) {
    e.exports = function(e, t) {
        return {
            enumerable: !(1 & e),
            configurable: !(2 & e),
            writable: !(4 & e),
            value: t
        }
    }
}
, function(e, t, n) {
    var r = n(109)("meta")
      , o = n(23)
      , i = n(48)
      , a = n(33).f
      , u = 0
      , l = Object.isExtensible || function() {
        return !0
    }
      , s = !n(19)(function() {
        return l(Object.preventExtensions({}))
    })
      , c = function(e) {
        a(e, r, {
            value: {
                i: "O" + ++u,
                w: {}
            }
        })
    }
      , f = function(e, t) {
        if (!o(e))
            return "symbol" == typeof e ? e : ("string" == typeof e ? "S" : "P") + e;
        if (!i(e, r)) {
            if (!l(e))
                return "F";
            if (!t)
                return "E";
            c(e)
        }
        return e[r].i
    }
      , d = function(e, t) {
        if (!i(e, r)) {
            if (!l(e))
                return !0;
            if (!t)
                return !1;
            c(e)
        }
        return e[r].w
    }
      , p = function(e) {
        return s && h.NEED && l(e) && !i(e, r) && c(e),
        e
    }
      , h = e.exports = {
        KEY: r,
        NEED: !1,
        fastKey: f,
        getWeak: d,
        onFreeze: p
    }
}
, function(e, t) {
    var n = Math.ceil
      , r = Math.floor;
    e.exports = function(e) {
        return isNaN(e = +e) ? 0 : (e > 0 ? r : n)(e)
    }
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function i(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
    function a(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var u = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , l = n(0)
      , s = r(l)
      , c = n(35)
      , f = r(c)
      , d = n(30)
      , p = r(d)
      , h = n(122)
      , y = r(h);
    n(929),
    t.default = function(e) {
        function t() {
            return o(this, t),
            i(this, (t.__proto__ || Object.getPrototypeOf(t)).apply(this, arguments))
        }
        return a(t, e),
        u(t, [{
            key: "renderBaseSetting",
            value: function() {
                if (this.isDirectSelected() && !this.isInSelectionMode()) {
                    var e = ["\\frac", "\\sqrt", "\\overrightarrow", "\\overbrace", "\\underbrace", "\\overline", "\\underline"];
                    return s.default.createElement(y.default, null, s.default.createElement("container-like-setting", f.default.getStopPropagationForFocusClickMouseDown(), this.__renderIcons(e)))
                }
            }
        }]),
        t
    }(p.default)
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function i(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
    function a(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.IntegralLikeSc = t.IntegralLike = void 0;
    var u = function e(t, n, r) {
        null === t && (t = Function.prototype);
        var o = Object.getOwnPropertyDescriptor(t, n);
        if (void 0 === o) {
            var i = Object.getPrototypeOf(t);
            return null === i ? void 0 : e(i, n, r)
        }
        if ("value"in o)
            return o.value;
        var a = o.get;
        if (void 0 !== a)
            return a.call(r)
    }
      , l = Object.assign || function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
      , s = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , c = n(0)
      , f = r(c)
      , d = n(1)
      , p = r(d)
      , h = n(13)
      , y = r(h)
      , m = n(30)
      , v = r(m)
      , g = n(24)
      , b = r(g)
      , x = n(4)
      , w = r(x)
      , C = n(206)
      , E = r(C)
      , k = n(5)
      , _ = r(k)
      , A = n(3)
      , S = r(A)
      , O = n(6)
      , P = r(O)
      , M = n(11)
      , I = r(M)
      , D = n(1035)
      , T = r(D);
    n(1037);
    var B = function(e) {
        function t(e) {
            o(this, t);
            var n = i(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e));
            return n.containerClassName = "integral-like-symbol limit-type",
            n.onSettingClick = n.onSettingClick.bind(n),
            n
        }
        return a(t, e),
        s(t, [{
            key: "useCustomBaseLine",
            value: function() {
                return !1
            }
        }, {
            key: "getSymbol",
            value: function() {
                return "∫"
            }
        }, {
            key: "getSymbolClassName",
            value: function() {
                return ""
            }
        }, {
            key: "isLimitKind",
            value: function() {
                return !!this.props.data.isLimitKind
            }
        }, {
            key: "onSettingClick",
            value: function(e) {
                e.stopPropagation(),
                e.preventDefault(),
                this.props.onDataChanged(w.default.set(this.props.data, "isLimitKind", !this.isLimitKind()))
            }
        }, {
            key: "onAddClick",
            value: function(e) {
                e.stopPropagation(),
                e.preventDefault();
                var t = {
                    from: {
                        id: P.default.nextId(),
                        lines: [{
                            id: P.default.nextId(),
                            blocks: []
                        }]
                    },
                    to: {
                        id: P.default.nextId(),
                        lines: [{
                            id: P.default.nextId(),
                            blocks: []
                        }]
                    }
                };
                this.props.onDataChanged(w.default.set(this.props.data, "elements", t)),
                this.selectElement("from")
            }
        }, {
            key: "getSettingTopEm",
            value: function() {
                return this.isEditorEmpty(this.props.data.elements.from) ? -2.7 : -1.7
            }
        }, {
            key: "renderSetting",
            value: function() {
                if (!this.isSelectModeOnly() && this.isDirectSelectedNoSelectionMode() && this.props.data.elements.to) {
                    var e = {};
                    return I.default.isMobileOrTablet() && (e = {
                        transform: "scale(1.3)"
                    }),
                    this.isLimitKind() ? (e.top = this.getSettingTopEm() + "em",
                    f.default.createElement("setting", {
                        key: "setting",
                        className: "setting-popup-zindex  no-print",
                        style: e,
                        onMouseDown: this.onSettingClick
                    }, f.default.createElement("i", {
                        className: "fa fa-share",
                        "aria-hidden": "true"
                    }))) : f.default.createElement("setting", {
                        key: "setting",
                        className: "setting-popup-zindex  no-print",
                        style: e,
                        onMouseDown: this.onSettingClick
                    }, f.default.createElement("i", {
                        className: "fa fa-reply",
                        "aria-hidden": "true"
                    }))
                }
            }
        }, {
            key: "renderAdd",
            value: function() {
                var e = this;
                if (!this.isSelectModeOnly()) {
                    var t = {};
                    return I.default.isMobileOrTablet() && (t = {
                        transform: "scale(1.3)"
                    }),
                    !this.isDirectSelectedNoSelectionMode() || this.props.data.elements.to || this.props.data.elements.from ? void 0 : f.default.createElement("add", {
                        key: "add",
                        className: "no-print",
                        style: t,
                        onMouseDown: function(t) {
                            e.onAddClick(t)
                        }
                    }, f.default.createElement("i", {
                        className: "fa fa-plus",
                        "aria-hidden": "true"
                    }))
                }
            }
        }, {
            key: "getFromStyle",
            value: function() {
                return {
                    marginBottom: this.getRoundEmStr(this.isLimitKind() ? (this.isInlineMode(),
                    -0) : this.isInlineMode() ? -.8 : -1),
                    minHeight: this.isLimitKind() ? "" : this.getRoundEmStr(this.isInlineMode() ? 1 : 1.1)
                }
            }
        }, {
            key: "getToStyle",
            value: function() {
                return {
                    marginTop: this.getRoundEmStr(this.isLimitKind() ? this.isInlineMode() ? .15 : .2 : this.isInlineMode() ? -.4 : -.6),
                    minHeight: this.isLimitKind() || this.isInlineMode() ? "" : S.default.getEmRound(1, this.getFontSizePixel()) + "em"
                }
            }
        }, {
            key: "renderFrom",
            value: function() {
                var e = this.props.data.elements.from;
                if (e) {
                    var t = "from " + this.getFromClass()
                      , n = f.default.createElement(y.default, l({
                        key: "from",
                        className: t,
                        style: this.getFromStyle()
                    }, this.buildMetaDataFromName("from"), {
                        borderIfEmpty: this.isSelected(),
                        fontSize: .7 * this.props.fontSize,
                        noAreaContainer: !0,
                        noSpacingRule: !0,
                        stripInfo: this.setStripInfo({
                            stripDown: !0
                        })
                    }));
                    return this.isEditorEmpty(e) && this.isLimitKind() ? f.default.createElement("empty", {
                        key: "from-wrap",
                        className: "from"
                    }, n) : n
                }
            }
        }, {
            key: "renderTo",
            value: function() {
                if (this.props.data.elements.to) {
                    var e = "to " + this.getToClass()
                      , t = f.default.createElement(y.default, l({
                        key: "to",
                        style: this.getToStyle(),
                        className: e
                    }, this.buildMetaDataFromName("to"), {
                        borderIfEmpty: this.isSelected(),
                        highZOrderIndexOfEmpty: !0,
                        fontSize: .7 * this.props.fontSize,
                        noSpacingRule: !0,
                        noAreaContainer: !0,
                        stripInfo: this.setStripInfo({
                            stripUp: !0
                        })
                    }));
                    return this.isEditorEmpty(this.props.data.elements.to) && this.isLimitKind() ? f.default.createElement("empty", {
                        key: "to-wrap",
                        className: "to"
                    }, t) : t
                }
            }
        }, {
            key: "getEditorFromToMarginLeft",
            value: function() {
                return ""
            }
        }, {
            key: "getFromClass",
            value: function() {
                return ""
            }
        }, {
            key: "getToClass",
            value: function() {
                return ""
            }
        }, {
            key: "getClassName",
            value: function() {
                return this.containerClassName + (this.isLimitKind() ? " limit-kind " : " non-limit-kind ")
            }
        }, {
            key: "renderComponent",
            value: function() {
                return [this.renderFrom(), f.default.createElement("symbol", {
                    key: "symbol",
                    className: this.getSymbolClassName()
                }, f.default.createElement("span", null, this.getSymbol())), this.renderTo(), this.renderSetting(), this.renderAdd()]
            }
        }]),
        t
    }(v.default)
      , j = function(e) {
        function t() {
            o(this, t);
            var e = i(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this));
            return e.isIntegralLike = !0,
            e
        }
        return a(t, e),
        s(t, [{
            key: "getViewComponent",
            value: function() {
                return B
            }
        }, {
            key: "getLatextName",
            value: function() {
                return "\\int"
            }
        }, {
            key: "getSymbol",
            value: function() {
                return "∫"
            }
        }, {
            key: "getModel",
            value: function(e) {
                return u(t.prototype.__proto__ || Object.getPrototypeOf(t.prototype), "getModel", this).call(this, e)
            }
        }, {
            key: "getModelMeta",
            value: function() {
                return {
                    text: this.getLatextName(),
                    keyInsertOnSelection: "from",
                    elements: {
                        from: {
                            defaultHide: !0,
                            onRemove: "only"
                        },
                        to: {
                            defaultHide: !0,
                            onRemove: "only"
                        }
                    }
                }
            }
        }, {
            key: "getSymbolInfo",
            value: function() {
                return this.fillSymbolInfo({
                    type: "composite",
                    names: [this.getLatextName(), this.getSymbol()],
                    symbol: this.getSymbol(),
                    height: 40,
                    hasExpanded: !0,
                    renderSymbol: function() {
                        return f.default.createElement(T.default, {
                            symbol: this.symbol,
                            isExpanded: arguments.length > 0 && void 0 !== arguments[0] && arguments[0]
                        })
                    }
                })
            }
        }, {
            key: "toLatex",
            value: function(e, t, n) {
                var r = {
                    elements: {
                        powerValue: this.isEmptyEditor(e.elements.from) ? null : e.elements.from,
                        indexValue: this.isEmptyEditor(e.elements.to) ? null : e.elements.to
                    }
                }
                  , o = " ";
                if (void 0 !== e.isLimitKind && null !== e.isLimitKind)
                    var o = e.isLimitKind ? "\\limits " : "\\nolimits ";
                this.isEmptyEditor(e.elements.from) && this.isEmptyEditor(e.elements.to) && (o = "");
                var i = E.default.toLatex(r, t, n)
                  , a = this.getLatextName() + o + i;
                return i && p.default.endsWith(i, "}") || (a += " "),
                a
            }
        }, {
            key: "toModel",
            value: function(e, t, n) {
                var r = {};
                null != n && (r = {
                    from: n.elements.powerValue || _.default.n__dt(),
                    to: n.elements.indexValue || _.default.n__dt()
                });
                var o = _.default.n__dp(e);
                return o.elements = r,
                null != t && ("\\limits" == t && (o.isLimitKind = !0),
                "\\nolimits" == t && (o.isLimitKind = !1)),
                o
            }
        }]),
        t
    }(b.default);
    t.IntegralLike = B,
    t.IntegralLikeSc = j
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function i(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
    function a(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var u = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , l = n(7)
      , s = r(l)
      , c = n(3)
      , f = r(c)
      , d = n(101)
      , p = r(d);
    t.default = function(e) {
        function t() {
            return o(this, t),
            i(this, (t.__proto__ || Object.getPrototypeOf(t)).apply(this, arguments))
        }
        return a(t, e),
        u(t, [{
            key: "getEditContentTopBottom",
            value: function() {
                return f.default.n__fh((0,
                s.default)(this.getRootDom()).children("editarea").get(0))
            }
        }, {
            key: "useCustomBaseLine",
            value: function() {
                return !1
            }
        }]),
        t
    }(p.default)
}
, function(e, t, n) {
    "use strict";
    "prefixes = on, _on, handle, _handle";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function i(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
    function a(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var u = Object.assign || function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
      , l = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , s = n(0)
      , c = r(s)
      , f = n(11)
      , d = r(f)
      , p = n(1176)
      , h = r(p);
    n(1179),
    t.default = function(e) {
        function t(e) {
            o(this, t);
            var n = i(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e));
            return n.handleSelectedChanged = n.handleSelectedChanged.bind(n),
            n
        }
        return a(t, e),
        l(t, [{
            key: "componentDidMount",
            value: function() {}
        }, {
            key: "shouldComponentUpdate",
            value: function(e) {
                return e.value != this.props.value
            }
        }, {
            key: "handleSelectedChanged",
            value: function() {
                this.props.onSelectedChanged && this.props.onSelectedChanged()
            }
        }, {
            key: "render",
            value: function() {
                var e = d.default.isMobileOrTablet() ? "mobile-tablet" : "";
                return c.default.createElement("numeric-slider", {
                    title: this.props.title,
                    class: e
                }, c.default.createElement("numeric-icon", {
                    onMouseDown: this.handleSelectedChanged
                }, this.props.icon), c.default.createElement(h.default, u({}, this.props, {
                    style: u({}, this.props.style)
                })), c.default.createElement("numeric-unit", null, this.props.unit))
            }
        }]),
        t
    }(c.default.Component)
}
, function(e, t, n) {
    function r(e, t) {
        return (u(e) ? o : a)(e, i(t, 3))
    }
    var o = n(448)
      , i = n(1198)
      , a = n(1254)
      , u = n(67);
    e.exports = r
}
, function(e, t, n) {
    "use strict";
    function r(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var o = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }();
    t.default = new (function() {
        function e() {
            r(this, e)
        }
        return o(e, [{
            key: "getRandomPosYAround",
            value: function(e, t, n) {
                t = t || e;
                var r = t - e;
                n = n || 1e4;
                var o = Math.floor(30 * Math.random() + 1);
                return e = Math.max(0, Math.min(e, n - r)),
                {
                    y1: e + o,
                    y2: e + r + o
                }
            }
        }]),
        e
    }())
}
, function(e, t) {
    var n = e.exports = "undefined" != typeof window && window.Math == Math ? window : "undefined" != typeof self && self.Math == Math ? self : Function("return this")();
    "number" == typeof __g && (__g = n)
}
, function(e, t, n) {
    var r = n(488)
      , o = n(311);
    e.exports = function(e) {
        return r(o(e))
    }
}
, function(e, t) {
    var n = 0
      , r = Math.random();
    e.exports = function(e) {
        return "Symbol(".concat(void 0 === e ? "" : e, ")_", (++n + r).toString(36))
    }
}
, function(e, t) {
    e.exports = !1
}
, function(e, t, n) {
    var r = n(338)
      , o = n(231);
    e.exports = Object.keys || function(e) {
        return r(e, o)
    }
}
, function(e, t, n) {
    var r = n(100)
      , o = Math.max
      , i = Math.min;
    e.exports = function(e, t) {
        return e = r(e),
        e < 0 ? o(e + t, 0) : i(e, t)
    }
}
, function(e, t, n) {
    var r = n(12)
      , o = n(339)
      , i = n(231)
      , a = n(230)("IE_PROTO")
      , u = function() {}
      , l = function() {
        var e, t = n(228)("iframe"), r = i.length;
        for (t.style.display = "none",
        n(233).appendChild(t),
        t.src = "javascript:",
        e = t.contentWindow.document,
        e.open(),
        e.write("<script>document.F=Object<\/script>"),
        e.close(),
        l = e.F; r--; )
            delete l.prototype[i[r]];
        return l()
    };
    e.exports = Object.create || function(e, t) {
        var n;
        return null !== e ? (u.prototype = r(e),
        n = new u,
        u.prototype = null,
        n[a] = e) : n = l(),
        void 0 === t ? n : o(n, t)
    }
}
, function(e, t, n) {
    var r = n(338)
      , o = n(231).concat("length", "prototype");
    t.f = Object.getOwnPropertyNames || function(e) {
        return r(e, o)
    }
}
, function(e, t, n) {
    "use strict";
    var r = n(15)
      , o = n(33)
      , i = n(32)
      , a = n(26)("species");
    e.exports = function(e) {
        var t = r[e];
        i && t && !t[a] && o.f(t, a, {
            configurable: !0,
            get: function() {
                return this
            }
        })
    }
}
, function(e, t) {
    e.exports = function(e, t, n, r) {
        if (!(e instanceof t) || void 0 !== r && r in e)
            throw TypeError(n + ": incorrect invocation!");
        return e
    }
}
, function(e, t, n) {
    var r = n(58);
    e.exports = function(e, t, n) {
        for (var o in t)
            r(e, o, t[o], n);
        return e
    }
}
, function(e, t, n) {
    "use strict";
    var r = n(20)
      , o = (n(10),
    function(e) {
        var t = this;
        if (t.instancePool.length) {
            var n = t.instancePool.pop();
            return t.call(n, e),
            n
        }
        return new t(e)
    }
    )
      , i = function(e, t) {
        var n = this;
        if (n.instancePool.length) {
            var r = n.instancePool.pop();
            return n.call(r, e, t),
            r
        }
        return new n(e,t)
    }
      , a = function(e, t, n) {
        var r = this;
        if (r.instancePool.length) {
            var o = r.instancePool.pop();
            return r.call(o, e, t, n),
            o
        }
        return new r(e,t,n)
    }
      , u = function(e, t, n, r) {
        var o = this;
        if (o.instancePool.length) {
            var i = o.instancePool.pop();
            return o.call(i, e, t, n, r),
            i
        }
        return new o(e,t,n,r)
    }
      , l = function(e) {
        var t = this;
        e instanceof t || r("25"),
        e.destructor(),
        t.instancePool.length < t.poolSize && t.instancePool.push(e)
    }
      , s = o;
    e.exports = {
        addPoolingTo: function(e, t) {
            var n = e;
            return n.instancePool = [],
            n.getPooled = t || s,
            n.poolSize || (n.poolSize = 10),
            n.release = l,
            n
        },
        oneArgumentPooler: o,
        twoArgumentPooler: i,
        threeArgumentPooler: a,
        fourArgumentPooler: u
    }
}
, function(e, t, n) {
    "use strict";
    function r(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var o = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , i = n(867)
      , a = function() {
        function e() {
            r(this, e),
            this.alphabet = "abcdefghijklmnopqrstuvwxyz",
            this.upperSmall = "acegmnopqrsuvwxyz-+𝜋",
            this.lowerSmall = "abcdehiklmnorstuvwxz0123456789-+𝜋",
            this.lowerBig = "fgjpqy",
            this.leftSignAlphabet = "bhlk",
            this.rightSignAlphabet = "df"
        }
        return o(e, [{
            key: "getMeasureCanvas",
            value: function() {
                return this.measureCanvas || (this.measureCanvas = window.document.createElement("canvas"),
                this.measureCanvas.style.width = "0px",
                this.measureCanvas.style.height = "0px"),
                this.measureCanvas
            }
        }, {
            key: "createTextEllipsisScope",
            value: function(e, t) {
                return new u(this.getMeasureCanvas(),e,t)
            }
        }, {
            key: "isUpperLeftSign",
            value: function(e) {
                return 1 == e.length && this.leftSignAlphabet.indexOf(e) >= 0
            }
        }, {
            key: "isUpperRightSign",
            value: function(e) {
                return 1 == e.length && this.rightSignAlphabet.indexOf(e) >= 0
            }
        }, {
            key: "isUpperSmall",
            value: function(e) {
                return !this.isAnyUpperBig(e)
            }
        }, {
            key: "isCompositeUpperSmall",
            value: function(e) {
                return e.type ? "composite" == e.type && void 0 : this.isUpperSmall(e.text)
            }
        }, {
            key: "isLowerSmall",
            value: function(e) {
                return !this.isAnyLowerBig(e)
            }
        }, {
            key: "isAnyUpperBig",
            value: function(e) {
                return this.isAnyUpperBigUni(e)
            }
        }, {
            key: "isAnyLowerBig",
            value: function(e) {
                return this.isAnyLowerBigUni(e)
            }
        }, {
            key: "isAnyLowerBigUni",
            value: function(e) {
                for (var t = 0; t < e.length; t++) {
                    var n = e.charCodeAt(t)
                      , r = i[n];
                    if ("b" == r || "l" == r)
                        return !0
                }
                return !1
            }
        }, {
            key: "isAnyUpperBigUni",
            value: function(e) {
                for (var t = 0; t < e.length; t++) {
                    var n = e.charCodeAt(t)
                      , r = i[n];
                    if ("b" == r || "u" == r)
                        return !0
                }
                return !1
            }
        }, {
            key: "heightFromBaseLine",
            value: function(e) {
                return e - e / 6
            }
        }, {
            key: "bottomToBaseLine",
            value: function(e) {
                return e / 6
            }
        }, {
            key: "fontSizePercentageFromCommand",
            value: function(e) {
                if (!e)
                    return 1;
                switch (e) {
                case "\\tiny":
                    return .5;
                case "\\scriptsize":
                    return .7;
                case "\\footnotesize":
                    return .8;
                case "\\small":
                    return .9;
                case "\\normalsize":
                    return 1;
                case "\\large":
                    return 1.2;
                case "\\Large":
                    return 1.44;
                case "\\LARGE":
                    return 17.28 / 10;
                case "\\huge":
                    return 2.074;
                case "\\Huge":
                    return 2.488
                }
                throw new Error("not implemented")
            }
        }]),
        e
    }()
      , u = function() {
        function e(t, n, o) {
            r(this, e),
            this.canvas = t,
            this.font = n,
            this.width = o,
            this.context = this.canvas.getContext("2d"),
            this.context.font = n
        }
        return o(e, [{
            key: "getText",
            value: function(e) {
                for (var t = this.width, n = e.split(/\b|(?=\W)/), r = this.context.measureText("...").width, o = [], i = 0, a = 0, u = 0, l = !1, s = 0; s < n.length; s++) {
                    var c = n[s]
                      , f = this.context.measureText(c);
                    if (0 == u && (i += f.width,
                    i > t ? u++ : o.push(c)),
                    1 == u) {
                        if ((a += f.width) > t - r) {
                            l = !0;
                            break
                        }
                        o.push(c)
                    }
                }
                var e = o.join("");
                return l && (e += "..."),
                e
            }
        }]),
        e
    }();
    t.default = new a
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function i(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
    function a(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var u = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , l = n(0)
      , s = r(l)
      , c = n(18)
      , f = r(c)
      , d = n(3)
      , p = r(d)
      , h = n(53)
      , y = r(h);
    n(876),
    t.default = function(e) {
        function t(e) {
            o(this, t);
            var n = i(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e));
            return n.updateComponent = n.updateComponent.bind(n),
            n.updateComponent.displayName = "svg-composed",
            n.cache = {},
            n
        }
        return a(t, e),
        u(t, [{
            key: "componentWillUnmount",
            value: function() {
                this.willComponentUnmount = !0
            }
        }, {
            key: "componentWillReceiveProps",
            value: function() {
                y.default.pushToEnd(this.updateComponent, this)
            }
        }, {
            key: "shouldComponentUpdate",
            value: function(e) {
                return e.className != this.props.className
            }
        }, {
            key: "componentDidMount",
            value: function() {
                this.root = f.default.findDOMNode(this),
                y.default.pushToEnd(this.updateComponent, this)
            }
        }, {
            key: "updateComponent",
            value: function() {
                var e = p.default.n__fh(this.root)
                  , t = p.default.getComputedFontSize(this.root);
                this.cache.width == e.width && this.cache.height == e.height && this.cache.fontSize == t && this.cache.changedData == this.props.changedData && this.cache.className == this.props.className || (this.cache = {
                    width: e.width,
                    height: e.height,
                    fontSize: t,
                    className: this.props.className,
                    changedData: this.props.changedData
                },
                this.forceUpdate())
            }
        }, {
            key: "renderInsideSvg",
            value: function() {
                return this.props.renderSvg(this.cache.width, this.cache.height, this.cache.fontSize)
            }
        }, {
            key: "renderSvg",
            value: function() {
                if (this.root)
                    return s.default.createElement("svg", null, this.renderInsideSvg())
            }
        }, {
            key: "render",
            value: function() {
                return s.default.createElement("svg-composed-symbol", {
                    class: this.props.className
                }, this.renderSvg())
            }
        }]),
        t
    }(s.default.Component)
}
, function(e, t, n) {
    "use strict";
    function r(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var o = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , i = n(0)
      , a = function(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }(i);
    t.default = new (function() {
        function e() {
            r(this, e)
        }
        return o(e, [{
            key: "wrapInput",
            value: function(e, t, n) {
                return e.key ? a.default.createElement("input-wrapper", {
                    key: e.key,
                    style: t,
                    class: n
                }, e) : a.default.createElement("input-wrapper", {
                    style: t,
                    class: n
                }, e)
            }
        }]),
        e
    }())
}
, function(e, t, n) {
    "use strict";
    "prefixes = on, _on, handle, _handle";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function i(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
    function a(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var u = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , l = n(0)
      , s = r(l)
      , c = n(4)
      , f = r(c)
      , d = n(11)
      , p = r(d);
    n(928),
    t.default = function(e) {
        function t(e) {
            o(this, t);
            var n = i(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e));
            return n.state = {
                showChildren: !1,
                left: void 0,
                top: void 0
            },
            n.onMouseDown = n.onMouseDown.bind(n),
            n
        }
        return a(t, e),
        u(t, [{
            key: "componentDidMount",
            value: function() {
                !this.state.showChildren && this.props.childPositionByBulbOriginalPos && (this.originalBulbLeft = this.props.left)
            }
        }, {
            key: "componentDidUpdate",
            value: function() {
                !this.state.showChildren && this.props.childPositionByBulbOriginalPos && (this.originalBulbLeft = this.props.left)
            }
        }, {
            key: "setPosition",
            value: function(e, t) {
                this.setState({
                    left: e,
                    top: t
                })
            }
        }, {
            key: "onMouseDown",
            value: function(e) {
                this.setState({
                    showChildren: !0
                }),
                this.props.onExpandDetail && this.props.onExpandDetail(),
                e.stopPropagation(),
                e.preventDefault()
            }
        }, {
            key: "render",
            value: function() {
                if (this.state.showChildren)
                    return this.props.childPositionByBulbOriginalPos ? s.default.cloneElement(this.props.children, {
                        style: {
                            left: this.originalBulbLeft
                        }
                    }) : this.props.children;
                var e = f.default.set(this.props.style || {}, "left", this.props.left);
                if (this.props.manuallyUpdate && void 0 !== this.state.left && (e.left = this.state.left,
                e.top = this.state.top),
                this.props.customIcon)
                    return s.default.createElement("bulb", {
                        style: e,
                        onMouseDown: this.onMouseDown
                    }, this.props.customIcon());
                var t = "no-print";
                return p.default.isMobileOrTablet() && (t += " mobile-tablet"),
                s.default.createElement("bulb", {
                    className: t,
                    style: e,
                    onMouseDown: this.onMouseDown
                }, s.default.createElement("i", {
                    className: "fa fa-cog",
                    "aria-hidden": "true"
                }))
            }
        }]),
        t
    }(s.default.Component)
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function i(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
    function a(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var u = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , l = n(0)
      , s = r(l)
      , c = n(1)
      , f = r(c)
      , d = n(73)
      , p = r(d)
      , h = n(963)
      , y = r(h);
    n(965),
    t.default = function(e) {
        function t(e) {
            o(this, t);
            var n = i(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e));
            return n.onSelect = n.onSelect.bind(n),
            n.onKeyDown = n.onKeyDown.bind(n),
            n.onBlur = n.onBlur.bind(n),
            n.onSelectBoxMouseDown = n.onSelectBoxMouseDown.bind(n),
            n.state = {
                isExpanded: !1,
                selectedData: n.getSelectedData(n.getData(), n.props.value),
                arrowClassName: ""
            },
            n.width = 200,
            n.height = 200,
            n.props.width && (n.width = n.props.width),
            n.props.height && (n.height = n.props.height),
            n
        }
        return a(t, e),
        u(t, [{
            key: "getData",
            value: function(e, t) {
                return e = e || this.props.data,
                t = void 0 === t ? this.props.value : t,
                "" !== t || this.props.noAutoAddedEmpty || (e = [{
                    key: "",
                    value: ""
                }].concat(this.props.data)),
                e
            }
        }, {
            key: "getSelectedData",
            value: function(e, t) {
                return null == e || 0 == e.length ? null : null === t || void 0 === t ? e[0] : f.default.find(e, function(e) {
                    return e.key == t
                })
            }
        }, {
            key: "onKeyDown",
            value: function(e) {
                if (e.stopPropagation(),
                13 == e.keyCode)
                    return e.preventDefault(),
                    void this.items.selectItem();
                38 == e.keyCode && (this.items.goUp(),
                e.preventDefault()),
                40 == e.keyCode && (this.items.goDown(),
                e.preventDefault())
            }
        }, {
            key: "renderItems",
            value: function() {
                var e = this;
                if (!this.state.isExpanded)
                    return null;
                var t = this.getData();
                return s.default.createElement(y.default, {
                    ref: function(t) {
                        return e.items = t
                    },
                    data: t,
                    onSelect: this.onSelect,
                    onBlur: this.onBlur,
                    selectedData: this.state.selectedData,
                    onRenderItem: this.props.onRenderItem
                })
            }
        }, {
            key: "componentWillReceiveProps",
            value: function(e) {
                e.value != this.props.value && this.setState({
                    selectedData: this.getSelectedData(this.getData(e.data, e.value), e.value)
                })
            }
        }, {
            key: "componentDidUpdate",
            value: function(e, t) {}
        }, {
            key: "onSelect",
            value: function(e) {
                this.setState({
                    selectedData: e,
                    isExpanded: !1
                }),
                "" === e.key && "" === e.value || this.props.onChange(e.hasOwnProperty("key") ? e.key : e)
            }
        }, {
            key: "renderInput",
            value: function() {
                if (this.props.isReadOnly)
                    return this.state.selectedData.hasOwnProperty("value") ? s.default.createElement("input-like", {
                        value: this.state.selectedData.value,
                        readOnly: !0
                    }, this.state.selectedData.value) : s.default.createElement("input-like", {
                        value: this.state.selectedData,
                        readOnly: !0
                    }, this.state.selectedData)
            }
        }, {
            key: "onBlur",
            value: function() {
                this.setState({
                    isExpanded: !1
                })
            }
        }, {
            key: "onSelectBoxMouseDown",
            value: function(e) {
                var t = this;
                this.state.isExpanded || (e.customInfo = p.default.getBuilder().withFocusAcquired().build(),
                setTimeout(function() {
                    t.container.focus()
                }, 0)),
                this.setState({
                    isExpanded: !this.state.isExpanded
                }),
                e.preventDefault()
            }
        }, {
            key: "render",
            value: function() {
                var e = this
                  , t = this.props.expansionWidth || this.width;
                return s.default.createElement("div", {
                    className: "select-box-container",
                    ref: function(t) {
                        return e.container = t
                    },
                    onKeyDown: this.onKeyDown,
                    style: {
                        width: this.width
                    },
                    onBlur: this.onBlur,
                    title: this.props.title,
                    tabIndex: "998"
                }, s.default.createElement("div", {
                    "data-for": "select-box",
                    className: "input-container",
                    onMouseDown: this.onSelectBoxMouseDown,
                    onMouseOver: function() {
                        e.setState({
                            arrowClassName: "selected"
                        })
                    },
                    onMouseLeave: function() {
                        e.setState({
                            arrowClassName: ""
                        })
                    }
                }, this.renderInput(), s.default.createElement("div", {
                    className: "arrow-down-icon " + this.state.arrowClassName,
                    style: {
                        left: this.width - 10
                    }
                }, s.default.createElement("i", {
                    className: "fa fa-caret-down",
                    "aria-hidden": "true"
                }))), s.default.createElement("div", {
                    className: (this.state.isExpanded ? "show" : "hide") + " items",
                    style: {
                        width: t - 2
                    }
                }, this.renderItems()))
            }
        }]),
        t
    }(s.default.Component)
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function i(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
    function a(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.SummationLikeSc = t.SummationLike = void 0;
    var u = function e(t, n, r) {
        null === t && (t = Function.prototype);
        var o = Object.getOwnPropertyDescriptor(t, n);
        if (void 0 === o) {
            var i = Object.getPrototypeOf(t);
            return null === i ? void 0 : e(i, n, r)
        }
        if ("value"in o)
            return o.value;
        var a = o.get;
        if (void 0 !== a)
            return a.call(r)
    }
      , l = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , s = n(0)
      , c = r(s)
      , f = n(102)
      , d = n(174)
      , p = r(d);
    n(426);
    var h = function(e) {
        function t(e) {
            o(this, t);
            var n = i(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e));
            return n.containerClassName = "summation-like-symbol limit-type",
            n
        }
        return a(t, e),
        l(t, [{
            key: "getSymbol",
            value: function() {
                return "∑"
            }
        }, {
            key: "getSymbolClassName",
            value: function() {
                return ""
            }
        }, {
            key: "getEditorFromToMarginLeft",
            value: function() {
                return "lef-1-margin"
            }
        }, {
            key: "getSettingTopEm",
            value: function() {
                return this.isEditorEmpty(this.props.data.elements.from) ? -2 : -1.7
            }
        }, {
            key: "isLimitKind",
            value: function() {
                return null != this.props.data.isLimitKind ? !!this.props.data.isLimitKind : !this.isInlineMode()
            }
        }, {
            key: "getFromStyle",
            value: function() {
                return {
                    marginBottom: this.getRoundEmStr(this.isLimitKind() ? this.isInlineMode() ? -.3 : -.45 : this.isInlineMode() ? -.7 : -1.2),
                    minHeight: this.isLimitKind() || this.isInlineMode() ? "" : this.getRoundEmStr(1.1)
                }
            }
        }, {
            key: "getToStyle",
            value: function() {
                return {
                    marginTop: this.getRoundEmStr(this.isLimitKind() ? this.isInlineMode() ? -.11 : 0 : this.isInlineMode() ? -.5 : -.7),
                    minHeight: this.isLimitKind() || this.isInlineMode() ? "" : this.getRoundEmStr(.9)
                }
            }
        }]),
        t
    }(f.IntegralLike)
      , y = function(e) {
        function t() {
            return o(this, t),
            i(this, (t.__proto__ || Object.getPrototypeOf(t)).apply(this, arguments))
        }
        return a(t, e),
        l(t, [{
            key: "getViewComponent",
            value: function() {
                throw new Error("not implemented")
            }
        }, {
            key: "getLatextName",
            value: function() {
                return "\\sum"
            }
        }, {
            key: "getSymbol",
            value: function() {
                return "∑"
            }
        }, {
            key: "getModel",
            value: function(e) {
                return u(t.prototype.__proto__ || Object.getPrototypeOf(t.prototype), "getModel", this).call(this, e)
            }
        }, {
            key: "getSymbolInfo",
            value: function() {
                return this.fillSymbolInfo({
                    type: "composite",
                    names: [this.getLatextName(), this.getSymbol()],
                    symbol: this.getSymbol(),
                    height: 35,
                    hasExpanded: !0,
                    renderSymbol: function() {
                        return c.default.createElement(p.default, {
                            symbol: this.symbol,
                            isExpanded: arguments.length > 0 && void 0 !== arguments[0] && arguments[0]
                        })
                    }
                })
            }
        }]),
        t
    }(f.IntegralLikeSc);
    t.SummationLike = h,
    t.SummationLikeSc = y
}
, function(e, t, n) {
    "use strict";
    "prefixes = on, _on, handle, _handle";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function i(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
    function a(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var u = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , l = n(0)
      , s = r(l)
      , c = n(73)
      , f = r(c);
    n(1180),
    t.default = function(e) {
        function t(e) {
            o(this, t);
            var n = i(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e));
            return n.state = {
                expand: !1
            },
            n.onExpandContainerMouseDown = n.onExpandContainerMouseDown.bind(n),
            n.inFocus = !1,
            n.onMouseDown = n.onMouseDown.bind(n),
            n.onFocus = n.onFocus.bind(n),
            n.onLostFocus = n.onLostFocus.bind(n),
            n.onItemSelect = n.onItemSelect.bind(n),
            n.onExpandContainerMouseDown = n.onExpandContainerMouseDown.bind(n),
            n
        }
        return a(t, e),
        u(t, [{
            key: "shouldComponentUpdate",
            value: function(e, t) {
                return t.expand != this.state.expand
            }
        }, {
            key: "onMouseDown",
            value: function(e) {
                var t = this;
                this.state.expand || (e.customInfo = f.default.getBuilder().withFocusAcquired().build(),
                setTimeout(function() {
                    t.component.focus()
                }, 10)),
                this.setState({
                    expand: !this.state.expand
                })
            }
        }, {
            key: "closeExpand",
            value: function() {
                this.setState({
                    expand: !1
                })
            }
        }, {
            key: "onFocus",
            value: function(e) {
                this.inFocus = !0,
                e.preventDefault(),
                e.stopPropagation()
            }
        }, {
            key: "onLostFocus",
            value: function() {
                var e = this;
                this.inFocus = !1,
                setTimeout(function() {
                    e.inFocus || e.state.expand && e.setState({
                        expand: !1
                    })
                }, 0)
            }
        }, {
            key: "onItemSelect",
            value: function(e) {
                this.setState({
                    expand: !1
                }),
                this.props.onItemSelect(e)
            }
        }, {
            key: "getComponentClassName",
            value: function() {
                return ""
            }
        }, {
            key: "renderComponent",
            value: function() {}
        }, {
            key: "renderExpandComponent",
            value: function() {}
        }, {
            key: "onExpandContainerMouseDown",
            value: function() {}
        }, {
            key: "renderExpandContainer",
            value: function() {
                if (this.state.expand)
                    return s.default.createElement("div", {
                        onMouseDown: this.onExpandContainerMouseDown
                    }, this.renderExpandComponent())
            }
        }, {
            key: "render",
            value: function() {
                var e = this;
                return s.default.createElement("expandable-component", {
                    title: this.props.title || this.title,
                    tabIndex: "-1",
                    ref: function(t) {
                        return e.component = t
                    },
                    class: this.getComponentClassName(),
                    onMouseDown: this.onMouseDown,
                    onFocus: this.onFocus,
                    onBlur: this.onLostFocus
                }, this.renderExpandContainer(), this.renderComponent())
            }
        }]),
        t
    }(s.default.Component)
}
, function(e, t, n) {
    function r(e) {
        return null == e ? void 0 === e ? l : u : s && s in Object(e) ? i(e) : a(e)
    }
    var o = n(176)
      , i = n(1185)
      , a = n(1186)
      , u = "[object Null]"
      , l = "[object Undefined]"
      , s = o ? o.toStringTag : void 0;
    e.exports = r
}
, function(e, t) {
    function n(e) {
        return null != e && "object" == typeof e
    }
    e.exports = n
}
, function(e, t, n) {
    function r(e, t) {
        var n = i(e, t);
        return o(n) ? n : void 0
    }
    var o = n(1211)
      , i = n(1214);
    e.exports = r
}
, function(e, t) {
    var n = {}.hasOwnProperty;
    e.exports = function(e, t) {
        return n.call(e, t)
    }
}
, function(e, t, n) {
    var r = n(107)
      , o = n(56)
      , i = n(481)
      , a = n(153)
      , u = function(e, t, n) {
        var l, s, c, f = e & u.F, d = e & u.G, p = e & u.S, h = e & u.P, y = e & u.B, m = e & u.W, v = d ? o : o[t] || (o[t] = {}), g = v.prototype, b = d ? r : p ? r[t] : (r[t] || {}).prototype;
        d && (n = t);
        for (l in n)
            (s = !f && b && void 0 !== b[l]) && l in v || (c = s ? b[l] : n[l],
            v[l] = d && "function" != typeof b[l] ? n[l] : y && s ? i(c, r) : m && b[l] == c ? function(e) {
                var t = function(t, n, r) {
                    if (this instanceof e) {
                        switch (arguments.length) {
                        case 0:
                            return new e;
                        case 1:
                            return new e(t);
                        case 2:
                            return new e(t,n)
                        }
                        return new e(t,n,r)
                    }
                    return e.apply(this, arguments)
                };
                return t.prototype = e.prototype,
                t
            }(c) : h && "function" == typeof c ? i(Function.call, c) : c,
            h && ((v.virtual || (v.virtual = {}))[l] = c,
            e & u.R && g && !g[l] && a(g, l, c)))
    };
    u.F = 1,
    u.G = 2,
    u.S = 4,
    u.P = 8,
    u.B = 16,
    u.W = 32,
    u.U = 64,
    u.R = 128,
    e.exports = u
}
, function(e, t, n) {
    var r = n(154)
      , o = n(482)
      , i = n(315)
      , a = Object.defineProperty;
    t.f = n(132) ? Object.defineProperty : function(e, t, n) {
        if (r(e),
        t = i(t, !0),
        r(n),
        o)
            try {
                return a(e, t, n)
            } catch (e) {}
        if ("get"in n || "set"in n)
            throw TypeError("Accessors not supported!");
        return "value"in n && (e[t] = n.value),
        e
    }
}
, function(e, t, n) {
    e.exports = !n(155)(function() {
        return 7 != Object.defineProperty({}, "a", {
            get: function() {
                return 7
            }
        }).a
    })
}
, function(e, t, n) {
    "use strict";
    function r(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var o = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , i = n(3)
      , a = function(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }(i);
    t.default = function() {
        function e() {
            r(this, e)
        }
        return o(e, [{
            key: "visit",
            value: function(e, t) {
                return a.default.isEditArea(e) ? this.visitEditArea(e, t) : a.default.isComposite(e) ? this.visitComposite(e, t) : a.default.n__ec(e) ? this.visitEditLine(e, t) : a.default.isRoot(e) ? this.visitRoot(e, t) : void 0
            }
        }, {
            key: "visitEditArea",
            value: function(e, t) {
                return null
            }
        }, {
            key: "visitEditLine",
            value: function(e, t) {
                return null
            }
        }, {
            key: "visitComposite",
            value: function(e, t) {
                return null
            }
        }, {
            key: "visitRoot",
            value: function(e, t) {
                return null
            }
        }]),
        e
    }()
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e) {
        (0,
        l.put)("/api/documents/" + e + "/editing")
    }
    function i(e, t) {
        return m.default.find(e.documents.items, function(e) {
            return e.id == t
        })
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.setDocumentWidth = t.updateShared = t.updateGeneratedLink = t.requestSaveStatus = t.requestSaveDocument = t.setActiveDocumentError = t.setLoadingDocumentsError = t.stopLoadingDocument = t.replaceTemporaryIdDocument = t.setActiveDocument = t.requestEditingDocument = t.closeDocumentRename = t.requestDocumentRename = t.removeDocument = t.addDocumentAndOpen = t.addNewDocument = t.setDocumentName = t.setItems = void 0,
    t.notifyEditingDocument = o;
    var a = n(183)
      , u = r(a)
      , l = n(185)
      , s = n(332)
      , c = r(s)
      , f = n(530)
      , d = r(f)
      , p = n(96)
      , h = r(p)
      , y = n(1)
      , m = r(y)
      , v = n(333)
      , g = r(v)
      , b = n(4)
      , x = r(b)
      , w = n(1576)
      , C = (t.setItems = function(e) {
        return {
            type: "documents_setItems",
            items: e
        }
    }
    ,
    t.setDocumentName = function(e, t) {
        return {
            type: "documents_setDocumentName",
            name: e,
            documentId: t
        }
    }
    ,
    t.addNewDocument = function(e, t) {
        return {
            type: "documents_addNewDocument",
            id: e,
            name: t
        }
    }
    ,
    t.addDocumentAndOpen = function(e) {
        return {
            type: "documents_addDocumentAndOpenAction",
            document: e
        }
    }
    ,
    t.removeDocument = function(e) {
        return {
            type: "documents_removeDocument",
            id: e
        }
    }
    ,
    t.requestDocumentRename = function(e) {
        return {
            type: "showDocumentRename",
            selectedDocumentId: e
        }
    }
    ,
    t.closeDocumentRename = function(e) {
        return {
            type: "hideDocumentRename"
        }
    }
    ,
    null)
      , E = (t.requestEditingDocument = function(e) {
        return function(t, n) {
            var r = n();
            if (r.documents.editingDocumentId != e) {
                C && (C.cancel(),
                C = null),
                t({
                    type: "loadDocument",
                    documentId: e
                });
                var a = g.default.getDocumentCacheInfo(e);
                if (a)
                    return void setTimeout(function() {
                        var n = m.default.find(r.documents.items, function(t) {
                            return t.id == e
                        })
                          , i = x.default.update(n, {
                            data: a.content,
                            historyContents: a.historyContents
                        });
                        o(e),
                        t(E(i))
                    }, 300);
                return i(r, e).isAnonymous ? void setTimeout(function() {
                    var n = m.default.find(r.documents.items, function(t) {
                        return t.id == e
                    })
                      , o = x.default.update(n, {
                        data: d.default.loadPageContent(),
                        historyContents: null
                    });
                    t(E(o))
                }, 300) : (C = (0,
                l.get)("/api/documents/" + e),
                C.then(function(e) {
                    return e.text()
                }).then(function(n) {
                    C = null;
                    var r = JSON.parse(n);
                    r.data = u.default.parseFromSavedModel(r.data),
                    r.settings = r.settings ? JSON.parse(r.settings) : {},
                    t(E(r)),
                    g.default.setCacheInfo({
                        id: r.id,
                        content: r.data
                    }),
                    o(e)
                }).catch(function(e) {
                    var n = e.isConnectionError
                      , r = e.message;
                    t(k(n ? "Connection error, could not load next document" : r))
                }),
                C)
            }
        }
    }
    ,
    t.setActiveDocument = function(e) {
        return {
            type: "setActiveDocument",
            document: e
        }
    }
    )
      , k = (t.replaceTemporaryIdDocument = function(e) {
        return {
            type: "socuments_replaceTemporaryIdDocument",
            id: e
        }
    }
    ,
    t.stopLoadingDocument = function() {
        return {
            type: "documents_stopLoading"
        }
    }
    ,
    t.setLoadingDocumentsError = function(e) {
        return {
            type: "documents_setLoadingDocumentsError",
            message: e
        }
    }
    ,
    t.setActiveDocumentError = function(e, t) {
        return t = t || "loadError",
        {
            type: "documents_setActiveDocumentError",
            message: e,
            errorType: t
        }
    }
    )
      , _ = new w
      , A = (t.requestSaveDocument = function() {
        var e = c.default.getCurrentDocumentInfo();
        return function(t, n) {
            t(A("saving"));
            var r = c.default.getCurrentDocumentInfo()
              , o = c.default.getCurrentDocumentHistoryContents()
              , i = n();
            if (h.default.isAnonymousUser(i))
                return void d.default.savePageContent(e.model).then(function() {
                    t(A("saved")),
                    g.default.setCacheInfo({
                        id: r.id,
                        content: r.model,
                        historyContents: o
                    })
                }).catch(function() {
                    t(A("unsave")),
                    t(k("Save failed in private mode, please login or use without private mode"))
                });
            _.postMessage({
                id: e.id,
                model: e.model
            }),
            _.onmessage = function(e) {
                if ("error" == e.data.status) {
                    var n = e.data.errorData
                      , i = n.isConnectionError
                      , a = n.message;
                    t({
                        type: "documents_saveActiveDocumentError",
                        message: i ? "Connection error, could not save document" : a,
                        errorType: "saveError"
                    }),
                    t(A("forceUnsave"))
                } else
                    t(A("saved")),
                    g.default.setCacheInfo({
                        id: r.id,
                        content: r.model,
                        historyContents: o
                    })
            }
        }
    }
    ,
    t.requestSaveStatus = function(e) {
        return {
            type: "requestSaveStatus",
            status: e
        }
    }
    );
    t.updateGeneratedLink = function(e, t) {
        return {
            type: "documents_updateGeneratedLink",
            id: e,
            link: t
        }
    }
    ,
    t.updateShared = function(e, t) {
        return {
            type: "documents_updateShared",
            id: e,
            isShared: t
        }
    }
    ,
    t.setDocumentWidth = function(e, t) {
        return function(n, r) {
            n({
                type: "documents_setDocumentWidth",
                id: e,
                width: t
            }),
            (0,
            l.put)("/api/documents/" + e + "/settings/width", t)
        }
    }
}
, function(e, t, n) {
    var r = n(33).f
      , o = n(48)
      , i = n(26)("toStringTag");
    e.exports = function(e, t, n) {
        e && !o(e = n ? e : e.prototype, i) && r(e, i, {
            configurable: !0,
            value: t
        })
    }
}
, function(e, t, n) {
    var r = n(2)
      , o = n(69)
      , i = n(19)
      , a = n(235)
      , u = "[" + a + "]"
      , l = "​"
      , s = RegExp("^" + u + u + "*")
      , c = RegExp(u + u + "*$")
      , f = function(e, t, n) {
        var o = {}
          , u = i(function() {
            return !!a[e]() || l[e]() != l
        })
          , s = o[e] = u ? t(d) : a[e];
        n && (o[n] = s),
        r(r.P + r.F * u, "String", o)
    }
      , d = f.trim = function(e, t) {
        return e = String(o(e)),
        1 & t && (e = e.replace(s, "")),
        2 & t && (e = e.replace(c, "")),
        e
    }
    ;
    e.exports = f
}
, function(e, t) {
    e.exports = {}
}
, function(e, t, n) {
    var r = n(26)("unscopables")
      , o = Array.prototype;
    void 0 == o[r] && n(57)(o, r, {}),
    e.exports = function(e) {
        o[r][e] = !0
    }
}
, function(e, t, n) {
    var r = n(84)
      , o = n(349)
      , i = n(245)
      , a = n(12)
      , u = n(38)
      , l = n(247)
      , s = {}
      , c = {}
      , t = e.exports = function(e, t, n, f, d) {
        var p, h, y, m, v = d ? function() {
            return e
        }
        : l(e), g = r(n, f, t ? 2 : 1), b = 0;
        if ("function" != typeof v)
            throw TypeError(e + " is not iterable!");
        if (i(v)) {
            for (p = u(e.length); p > b; b++)
                if ((m = t ? g(a(h = e[b])[0], h[1]) : g(e[b])) === s || m === c)
                    return m
        } else
            for (y = v.call(e); !(h = y.next()).done; )
                if ((m = o(y, g, h.value, t)) === s || m === c)
                    return m
    }
    ;
    t.BREAK = s,
    t.RETURN = c
}
, function(e, t, n) {
    "use strict";
    var r = n(31)
      , o = n(735)
      , i = n(256)
      , a = n(740)
      , u = n(741)
      , l = n(743)
      , s = n(142)
      , c = n(744)
      , f = n(747)
      , d = n(748)
      , p = (n(16),
    s.createElement)
      , h = s.createFactory
      , y = s.cloneElement
      , m = r
      , v = {
        Children: {
            map: o.map,
            forEach: o.forEach,
            count: o.count,
            toArray: o.toArray,
            only: d
        },
        Component: i,
        PureComponent: a,
        createElement: p,
        cloneElement: y,
        isValidElement: s.isValidElement,
        PropTypes: c,
        createClass: u.createClass,
        createFactory: h,
        createMixin: function(e) {
            return e
        },
        DOM: l,
        version: f,
        __spread: m
    };
    e.exports = v
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        for (var t = arguments.length - 1, n = "Minified React error #" + e + "; visit http://facebook.github.io/react/docs/error-decoder.html?invariant=" + e, r = 0; r < t; r++)
            n += "&args[]=" + encodeURIComponent(arguments[r + 1]);
        n += " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
        var o = new Error(n);
        throw o.name = "Invariant Violation",
        o.framesToPop = 1,
        o
    }
    e.exports = r
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return void 0 !== e.ref
    }
    function o(e) {
        return void 0 !== e.key
    }
    var i = n(31)
      , a = n(88)
      , u = (n(16),
    n(368),
    Object.prototype.hasOwnProperty)
      , l = n(369)
      , s = {
        key: !0,
        ref: !0,
        __self: !0,
        __source: !0
    }
      , c = function(e, t, n, r, o, i, a) {
        var u = {
            $$typeof: l,
            type: e,
            key: t,
            ref: n,
            props: a,
            _owner: i
        };
        return u
    };
    c.createElement = function(e, t, n) {
        var i, l = {}, f = null, d = null;
        if (null != t) {
            r(t) && (d = t.ref),
            o(t) && (f = "" + t.key),
            void 0 === t.__self ? null : t.__self,
            void 0 === t.__source ? null : t.__source;
            for (i in t)
                u.call(t, i) && !s.hasOwnProperty(i) && (l[i] = t[i])
        }
        var p = arguments.length - 2;
        if (1 === p)
            l.children = n;
        else if (p > 1) {
            for (var h = Array(p), y = 0; y < p; y++)
                h[y] = arguments[y + 2];
            l.children = h
        }
        if (e && e.defaultProps) {
            var m = e.defaultProps;
            for (i in m)
                void 0 === l[i] && (l[i] = m[i])
        }
        return c(e, f, d, 0, 0, a.current, l)
    }
    ,
    c.createFactory = function(e) {
        var t = c.createElement.bind(null, e);
        return t.type = e,
        t
    }
    ,
    c.cloneAndReplaceKey = function(e, t) {
        return c(e.type, t, e.ref, 0, 0, e._owner, e.props)
    }
    ,
    c.cloneElement = function(e, t, n) {
        var l, f = i({}, e.props), d = e.key, p = e.ref, h = e._owner;
        if (null != t) {
            r(t) && (p = t.ref,
            h = a.current),
            o(t) && (d = "" + t.key);
            var y;
            e.type && e.type.defaultProps && (y = e.type.defaultProps);
            for (l in t)
                u.call(t, l) && !s.hasOwnProperty(l) && (f[l] = void 0 === t[l] && void 0 !== y ? y[l] : t[l])
        }
        var m = arguments.length - 2;
        if (1 === m)
            f.children = n;
        else if (m > 1) {
            for (var v = Array(m), g = 0; g < m; g++)
                v[g] = arguments[g + 2];
            f.children = v
        }
        return c(e.type, d, p, 0, 0, h, f)
    }
    ,
    c.isValidElement = function(e) {
        return "object" == typeof e && null !== e && e.$$typeof === l
    }
    ,
    e.exports = c
}
, function(e, t, n) {
    "use strict";
    function r(e, t) {
        return (e & t) === t
    }
    var o = n(20)
      , i = (n(10),
    {
        MUST_USE_PROPERTY: 1,
        HAS_BOOLEAN_VALUE: 4,
        HAS_NUMERIC_VALUE: 8,
        HAS_POSITIVE_NUMERIC_VALUE: 24,
        HAS_OVERLOADED_BOOLEAN_VALUE: 32,
        injectDOMPropertyConfig: function(e) {
            var t = i
              , n = e.Properties || {}
              , a = e.DOMAttributeNamespaces || {}
              , l = e.DOMAttributeNames || {}
              , s = e.DOMPropertyNames || {}
              , c = e.DOMMutationMethods || {};
            e.isCustomAttribute && u._isCustomAttributeFunctions.push(e.isCustomAttribute);
            for (var f in n) {
                u.properties.hasOwnProperty(f) && o("48", f);
                var d = f.toLowerCase()
                  , p = n[f]
                  , h = {
                    attributeName: d,
                    attributeNamespace: null,
                    propertyName: f,
                    mutationMethod: null,
                    mustUseProperty: r(p, t.MUST_USE_PROPERTY),
                    hasBooleanValue: r(p, t.HAS_BOOLEAN_VALUE),
                    hasNumericValue: r(p, t.HAS_NUMERIC_VALUE),
                    hasPositiveNumericValue: r(p, t.HAS_POSITIVE_NUMERIC_VALUE),
                    hasOverloadedBooleanValue: r(p, t.HAS_OVERLOADED_BOOLEAN_VALUE)
                };
                if (h.hasBooleanValue + h.hasNumericValue + h.hasOverloadedBooleanValue <= 1 || o("50", f),
                l.hasOwnProperty(f)) {
                    var y = l[f];
                    h.attributeName = y
                }
                a.hasOwnProperty(f) && (h.attributeNamespace = a[f]),
                s.hasOwnProperty(f) && (h.propertyName = s[f]),
                c.hasOwnProperty(f) && (h.mutationMethod = c[f]),
                u.properties[f] = h
            }
        }
    })
      , a = ":A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD"
      , u = {
        ID_ATTRIBUTE_NAME: "data-reactid",
        ROOT_ATTRIBUTE_NAME: "data-reactroot",
        ATTRIBUTE_NAME_START_CHAR: a,
        ATTRIBUTE_NAME_CHAR: a + "\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040",
        properties: {},
        getPossibleStandardName: null,
        _isCustomAttributeFunctions: [],
        isCustomAttribute: function(e) {
            for (var t = 0; t < u._isCustomAttributeFunctions.length; t++) {
                if ((0,
                u._isCustomAttributeFunctions[t])(e))
                    return !0
            }
            return !1
        },
        injection: i
    };
    e.exports = u
}
, function(e, t, n) {
    "use strict";
    function r() {
        o.attachRefs(this, this._currentElement)
    }
    var o = n(773);
    n(71),
    n(16);
    e.exports = {
        mountComponent: function(e, t, n, o, i, a) {
            var u = e.mountComponent(t, n, o, i, a);
            return e._currentElement && null != e._currentElement.ref && t.getReactMountReady().enqueue(r, e),
            u
        },
        getHostNode: function(e) {
            return e.getHostNode()
        },
        unmountComponent: function(e, t) {
            o.detachRefs(e, e._currentElement),
            e.unmountComponent(t)
        },
        receiveComponent: function(e, t, n, i) {
            var a = e._currentElement;
            if (t !== a || i !== e._context) {
                var u = o.shouldUpdateRefs(a, t);
                u && o.detachRefs(e, a),
                e.receiveComponent(t, n, i),
                u && e._currentElement && null != e._currentElement.ref && n.getReactMountReady().enqueue(r, e)
            }
        },
        performUpdateIfNecessary: function(e, t, n) {
            e._updateBatchNumber === n && e.performUpdateIfNecessary(t)
        }
    }
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        if (h) {
            var t = e.node
              , n = e.children;
            if (n.length)
                for (var r = 0; r < n.length; r++)
                    y(t, n[r], null);
            else
                null != e.html ? f(t, e.html) : null != e.text && p(t, e.text)
        }
    }
    function o(e, t) {
        e.parentNode.replaceChild(t.node, e),
        r(t)
    }
    function i(e, t) {
        h ? e.children.push(t) : e.node.appendChild(t.node)
    }
    function a(e, t) {
        h ? e.html = t : f(e.node, t)
    }
    function u(e, t) {
        h ? e.text = t : p(e.node, t)
    }
    function l() {
        return this.node.nodeName
    }
    function s(e) {
        return {
            node: e,
            children: [],
            html: null,
            text: null,
            toString: l
        }
    }
    var c = n(266)
      , f = n(201)
      , d = n(267)
      , p = n(384)
      , h = "undefined" != typeof document && "number" == typeof document.documentMode || "undefined" != typeof navigator && "string" == typeof navigator.userAgent && /\bEdge\/\d/.test(navigator.userAgent)
      , y = d(function(e, t, n) {
        11 === t.node.nodeType || 1 === t.node.nodeType && "object" === t.node.nodeName.toLowerCase() && (null == t.node.namespaceURI || t.node.namespaceURI === c.html) ? (r(t),
        e.insertBefore(t.node, n)) : (e.insertBefore(t.node, n),
        r(t))
    });
    s.insertTreeBefore = y,
    s.replaceChildWithTree = o,
    s.queueChild = i,
    s.queueHTML = a,
    s.queueText = u,
    e.exports = s
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var i = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , a = n(1)
      , u = r(a)
      , l = n(72)
      , s = r(l)
      , c = n(4)
      , f = r(c)
      , d = n(51)
      , p = r(d)
      , h = n(3)
      , y = r(h)
      , m = n(50)
      , v = r(m)
      , g = n(11)
      , b = r(g);
    t.default = new (function() {
        function e() {
            o(this, e)
        }
        return i(e, [{
            key: "getGeoBlock",
            value: function(e) {
                if (e.isNonChar) {
                    var t = y.default.n__fh(e.element);
                    return {
                        isMultiline: !1,
                        rect: t,
                        startLineLeft: t.left,
                        endLineLeft: t.right,
                        kind: "nonchar",
                        block: e
                    }
                }
                if (e.isChar) {
                    var n = y.default.n__n(e.element, 0)
                      , r = y.default.n__n(e.element, e.element.innerText.length)
                      , o = n.computedRangeRect
                      , i = r.computedRangeRect;
                    b.default.isSafari() && (JSON.stringify(n.rangeRect),
                    JSON.stringify(r.rangeRect));
                    var a = y.default.n__fg(e.element, n.rangeRect.height);
                    return {
                        isMultiline: !this.isRangeSameLine(n, r),
                        rect: v.default.n__hu(y.default.n__fh(e.element), a),
                        startLineLeft: o.left,
                        startRangeRect: o,
                        endLineLeft: i.left,
                        endRangeRect: i,
                        startRange: n,
                        endRange: r,
                        lineHeight: o.height,
                        kind: "char",
                        block: e
                    }
                }
            }
        }, {
            key: "getGeoBlocks",
            value: function(e) {
                var t = this;
                return u.default.map(e, function(e) {
                    return t.getGeoBlock(e)
                })
            }
        }, {
            key: "cursorRangeFromCursorPos",
            value: function(e) {
                var t = y.default.n__ct(e.element, p.default.rawIndexAt(e.element, e.charIndex));
                return y.default.n__o(e.element, t)
            }
        }, {
            key: "n__l",
            value: function(e) {
                var t = s.default.buildLineBlocks(e)
                  , n = u.default.last(t);
                return n ? n.isNonChar ? this.n__i(t, e, n) : this.n__i(t, e, s.default.toCharIndexLineBlock(n, n.numOfChar)) : []
            }
        }, {
            key: "n__b",
            value: function(e, t, n, r, o) {
                var i = f.default.setProp(e, "charIndex", 0)
                  , a = t
                  , u = this.n__i(r, n, i);
                return this.n__g(o, this.n__h(u)) ? u : [{
                    rect: {
                        left: t.rect.left,
                        right: t.rect.right,
                        bottom: o.top - 2,
                        top: o.top - a.lineHeight,
                        width: t.rect.right - t.rect.left,
                        height: a.lineHeight
                    },
                    data: e
                }]
            }
        }, {
            key: "n__m",
            value: function(e, t) {
                var n = s.default.buildLineBlocks(t);
                return this.n__c(u.default.find(n, function(t) {
                    return t.element == e
                }), t, n)
            }
        }, {
            key: "n__c",
            value: function(e, t, n) {
                var r = this.n__i(n, t, e)
                  , o = this.n__h(r)
                  , i = u.default.first(r)
                  , a = this.getGeoBlock(i.data);
                if ("char" == a.kind) {
                    if (this.hasPreviousLine(a, this.cursorRangeFromCursorPos(i.data)))
                        return this.n__b(i.data, a, t, n, o)
                }
                if (0 == i.data.blockIndex)
                    return [];
                var l = n[i.data.blockIndex - 1];
                return this.n__i(n, t, s.default.toCharIndexLineBlock(l, l.numOfChar))
            }
        }, {
            key: "n__d",
            value: function(e, t, n, r, o) {
                var i = u.default.assign({}, e, {
                    charIndex: e.element.innerText.length
                })
                  , a = this.n__i(r, n, i)
                  , l = this.n__h(a)
                  , s = t;
                return this.n__g(o, l) ? a : [{
                    rect: {
                        left: t.rect.left,
                        right: t.rect.right,
                        bottom: o.bottom + s.lineHeight,
                        top: o.bottom + 2,
                        width: t.rect.right - t.rect.left,
                        height: s.lineHeight
                    },
                    data: e
                }]
            }
        }, {
            key: "n__e",
            value: function(e, t) {
                var n = s.default.buildLineBlocks(t);
                return this.n__f(u.default.find(n, function(t) {
                    return t.element == e
                }), t, n)
            }
        }, {
            key: "n__f",
            value: function(e, t, n) {
                var r = this.n__i(n, t, e)
                  , o = this.n__h(r)
                  , i = u.default.last(r)
                  , a = this.getGeoBlock(i.data);
                if ("char" == a.kind) {
                    if (this.hasNextLine(a, this.cursorRangeFromCursorPos(i.data)))
                        return this.n__d(i.data, a, t, n, o)
                }
                return i.data.blockIndex == n.length - 1 ? [] : this.n__i(n, t, u.default.assign({}, n[i.data.blockIndex + 1], {
                    charIndex: 0
                }))
            }
        }, {
            key: "n__g",
            value: function(e, t) {
                return e.top < t.top ? Math.abs(e.bottom - t.top) < 3 : Math.abs(t.bottom - e.top) < 3
            }
        }, {
            key: "n__h",
            value: function(e) {
                if (0 == e.length)
                    return null;
                for (var t = -99999, n = 99999, r = 0; r < e.length; r++) {
                    var o = e[r];
                    n = Math.min(o.rect.top, n),
                    t = Math.max(o.rect.bottom, t)
                }
                return {
                    top: n,
                    bottom: t,
                    height: t - n
                }
            }
        }, {
            key: "n__i",
            value: function(e, t, n) {
                var r = []
                  , o = this.getGeoBlock(n)
                  , i = y.default.n__fh(t);
                if ("char" == o.kind) {
                    var a = n;
                    if (null == a.charIndex)
                        throw new Error("need charIndex");
                    var u = this.cursorRangeFromCursorPos(a)
                      , l = o
                      , s = {
                        rect: {
                            left: i.left,
                            right: i.right,
                            width: i.width,
                            top: u.computedRangeRect.top,
                            bottom: u.computedRangeRect.bottom,
                            height: u.computedRangeRect.height
                        },
                        data: n
                    };
                    if (!this.hasPreviousLine(l, u)) {
                        s.rect.left = o.startLineLeft,
                        s.rect.width = s.rect.right - o.startLineLeft;
                        var c = this.n__j(e, n.blockIndex, t, l.startLineLeft);
                        r = r.concat(c)
                    }
                    if (r = r.concat([s]),
                    !this.hasNextLine(l, u)) {
                        s.rect.right = o.endLineLeft,
                        s.rect.width = o.endLineLeft - s.rect.left;
                        var c = this.n__k(e, n.blockIndex, t, l.endLineLeft);
                        r = r.concat(c)
                    }
                    return r
                }
                var s = {
                    rect: o.rect,
                    data: n
                }
                  , c = this.n__j(e, n.blockIndex, t, o.rect.left);
                return r = r.concat(c),
                r = r.concat([s]),
                c = this.n__k(e, n.blockIndex, t, o.rect.right),
                r = r.concat(c),
                r
            }
        }, {
            key: "n__j",
            value: function(e, t, n, r) {
                for (var o = [], i = y.default.n__fh(n), a = r, l = t - 1; l >= 0; l--) {
                    var s = e[l]
                      , c = this.getGeoBlock(s);
                    if (c.endLineLeft - 2 > a)
                        return u.default.reverse(o);
                    if (c.isMultiline) {
                        var d = c;
                        return o.push({
                            rect: {
                                bottom: c.rect.bottom,
                                left: i.left,
                                right: c.endLineLeft,
                                top: c.rect.bottom - d.lineHeight,
                                height: d.lineHeight,
                                width: c.endLineLeft - i.left
                            },
                            data: f.default.set(s, "charIndex", s.numOfChar)
                        }),
                        u.default.reverse(o)
                    }
                    o.push({
                        rect: c.rect,
                        data: s
                    }),
                    a = c.rect.left
                }
                return u.default.reverse(o)
            }
        }, {
            key: "n__k",
            value: function(e, t, n, r) {
                for (var o = [], i = y.default.n__fh(n), a = r, u = t + 1; u < e.length; u++) {
                    var l = e[u]
                      , s = this.getGeoBlock(l);
                    if (s.startLineLeft + 2 < a)
                        return o;
                    if (s.isMultiline) {
                        var c = s;
                        return o.push({
                            rect: {
                                bottom: s.rect.top + c.lineHeight,
                                left: c.startLineLeft,
                                right: i.right,
                                top: s.rect.top,
                                height: c.lineHeight,
                                width: i.right - c.startLineLeft
                            },
                            data: f.default.set(l, "charIndex", 0)
                        }),
                        o
                    }
                    o.push({
                        rect: s.rect,
                        data: l
                    }),
                    a = s.rect.right
                }
                return o
            }
        }, {
            key: "hasPreviousLine",
            value: function(e, t) {
                return !this.isRangeSameLine(e.startRange, t)
            }
        }, {
            key: "hasNextLine",
            value: function(e, t) {
                return !this.isRangeSameLine(e.endRange, t)
            }
        }, {
            key: "isRangeSameLine",
            value: function(e, t) {
                var n = e.computedRangeRect
                  , r = t.computedRangeRect;
                return Math.abs(n.top - r.top) <= 3 && Math.abs(n.bottom - r.bottom) <= 3
            }
        }]),
        e
    }())
}
, function(e, t) {}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var i = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , a = n(1)
      , u = r(a)
      , l = n(11)
      , s = r(l);
    t.default = new (function() {
        function e() {
            o(this, e),
            this.tooltips = [{
                key: "copy",
                value: "⌘+C"
            }, {
                key: "cut",
                value: "⌘+X"
            }, {
                key: "paste",
                value: "⌘+V"
            }, {
                key: "undo",
                value: "⌘+Z"
            }, {
                key: "redo",
                value: "⌘+⇧+Z"
            }, {
                key: "bold",
                value: "Bold (⌘+B)"
            }, {
                key: "italic",
                value: "Italic (⌘ + I)"
            }, {
                key: "underline",
                value: "Underline (⌘+U)"
            }, {
                key: "strike-through",
                value: "StrikeThrough"
            }, {
                key: "font-size",
                value: "Font Sizes"
            }, {
                key: "font-name",
                value: "Font Names"
            }, {
                key: "mathnormal",
                value: "Font \\mathnormal"
            }, {
                key: "mathrm",
                value: "Font \\mathrm"
            }, {
                key: "mathbf",
                value: "Font \\mathbf (Cmd+B)"
            }, {
                key: "mathit",
                value: "Font \\mathit"
            }, {
                key: "mathbb",
                value: "Font \\mathbb (Cmd+Shift+B)"
            }, {
                key: "math-boldsymbol",
                value: "Font \\boldsymbol"
            }, {
                key: "mathcal",
                value: "Font \\mathcal (Cmd+Shift+C)"
            }, {
                key: "mathscr",
                value: "Font \\mathscr"
            }, {
                key: "mathfrak",
                value: "Font \\mathfrak"
            }, {
                key: "mathsf",
                value: "Font \\mathsf"
            }, {
                key: "mathtt",
                value: "Font \\mathtt"
            }, {
                key: "align-left",
                value: "Align Left"
            }, {
                key: "align-right",
                value: "Align Right"
            }, {
                key: "align-center",
                value: "Align Center"
            }, {
                key: "align-justify",
                value: "Align Justify"
            }, {
                key: "layout",
                value: "Layout"
            }, {
                key: "export",
                value: "Export To Latex"
            }, {
                key: "section",
                value: "Section"
            }, {
                key: "ordered-list",
                value: "Ordered List"
            }, {
                key: "unordered-list",
                value: "UnOrdered List"
            }, {
                key: "decrease-indent",
                value: "Outdent"
            }, {
                key: "increase-indent",
                value: "Indent"
            }, {
                key: "displayStyle",
                value: "\\displaystyle mode"
            }, {
                key: "textStyle",
                value: "\\textstyle mode"
            }, {
                key: "math-font",
                value: "Math Font"
            }, {
                key: "open-autocomplete",
                value: "Open Suggestion Box (Shortcut: \\ )"
            }, {
                key: "insert-diagram",
                value: "Add Diagram/Graph"
            }],
            s.default.isMac() || (this.tooltips = this.overwrite(this.tooltips, [{
                key: "copy",
                value: "Ctrl+C"
            }, {
                key: "cut",
                value: "Ctrl+X"
            }, {
                key: "paste",
                value: "Ctrl+V"
            }, {
                key: "undo",
                value: "Ctrl+Z"
            }, {
                key: "redo",
                value: "Ctrl+Y"
            }, {
                key: "bold",
                value: "Bold (Ctrl + B)"
            }, {
                key: "italic",
                value: "Italic (Ctrl + I)"
            }, {
                key: "underline",
                value: "Underline (Ctrl + U)"
            }, {
                key: "mathbf",
                value: "Font \\mathbf (Ctrl+B)"
            }, {
                key: "mathbb",
                value: "Font \\mathbb (Ctrl+Shift+B)"
            }, {
                key: "mathcal",
                value: "Font \\mathcal (Ctrl+Shift+C)"
            }]))
        }
        return i(e, [{
            key: "overwrite",
            value: function(e, t) {
                for (var n = 0; n < t.length; n++) {
                    var r = t[n]
                      , o = u.default.find(e, function(e) {
                        return e.key == r.key
                    });
                    o ? o.value = r.value : e.push(r)
                }
                return e
            }
        }, {
            key: "getToolTipByKey",
            value: function(e) {
                return u.default.filter(this.tooltips, function(t) {
                    return t.key == e
                })[0]
            }
        }]),
        e
    }())
}
, function(e, t, n) {
    "use strict";
    function r(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function o(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function i(e, t) {
        if (!e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !t || "object" != typeof t && "function" != typeof t ? e : t
    }
    function a(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.LimLikeSc = t.LimLike = void 0;
    var u = function() {
        function e(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r)
            }
        }
        return function(t, n, r) {
            return n && e(t.prototype, n),
            r && e(t, r),
            t
        }
    }()
      , l = function e(t, n, r) {
        null === t && (t = Function.prototype);
        var o = Object.getOwnPropertyDescriptor(t, n);
        if (void 0 === o) {
            var i = Object.getPrototypeOf(t);
            return null === i ? void 0 : e(i, n, r)
        }
        if ("value"in o)
            return o.value;
        var a = o.get;
        if (void 0 !== a)
            return a.call(r)
    }
      , s = n(0)
      , c = r(s)
      , f = n(102);
    n(1044);
    var d = n(3)
      , p = r(d)
      , h = n(286)
      , y = r(h)
      , m = function(e) {
        function t(e) {
            o(this, t);
            var n = i(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e));
            return n.containerClassName = "lim-like-symbol limit-type",
            n
        }
        return a(t, e),
        u(t, [{
            key: "shouldComponentUpdate",
            value: function(e, n) {
                return l(t.prototype.__proto__ || Object.getPrototypeOf(t.prototype), "shouldComponentUpdate", this).call(this, e, n) || e.customDataStr != this.props.customDataStr
            }
        }, {
            key: "useCustomBaseLine",
            value: function() {
                return !1
            }
        }, {
            key: "getSymbol",
            value: function() {
                return "∑"
            }
        }, {
            key: 