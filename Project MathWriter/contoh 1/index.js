function getParameterByName(e, n) {
    n || (n = window.location.href),
    e = e.replace(/[\[\]]/g, "\\$&");
    var o = new RegExp("[?&]" + e + "(=([^&#]*)|&|#|$)").exec(n);
    return o ? o[2] ? decodeURIComponent(o[2].replace(/\+/g, " ")) : "" : null
}
function contribute(e) {
    if (!mathGlobal.connectionError) {
        var n = document.getElementById("progress-bar");
        mathGlobal.loaded += e;
        var o = mathGlobal.loaded / mathGlobal.sizes.totalSize * 100;
        console.log("percentage: ", o),
        n.style["stroke-dashoffset"] = Math.max(0, 100 - o) + "px"
    }
}
function loadAjax(e) {
    return new Promise(function(n, o) {
        var t = new XMLHttpRequest;
        t.open("GET", e, !0),
        t.onload = function(e) {
            4 === t.readyState && (200 === t.status ? n(t.response) : (o(),
            console.error(t.response)))
        }
        ;
        var a = 0;
        t.onprogress = function(e) {
            document.getElementById("progress-bar");
            var n = e.loaded - a;
            a = e.loaded,
            contribute(n / 1e3)
        }
        ,
        t.send()
    }
    )
}
function otherFontFunc(e) {
    return console.log("load finished: ", e),
    contribute(20),
    !0
}
function loadFonts() {
    var e = new FontFaceObserver("Asana").load(null, 2e5).then(function() {
        return contribute(400),
        console.log("ok aasana"),
        !0
    })
      , n = new FontFaceObserver("Asana-Math").load(null, 2e5).then(otherFontFunc.bind(this, "Asana-Math"))
      , o = new FontFaceObserver("Asana-Mathbb").load(null, 2e5).then(otherFontFunc.bind(this, "Asana-Mathbb"))
      , t = new FontFaceObserver("Asana-Mathit").load(null, 2e5).then(otherFontFunc.bind(this, "Asana-Mathit"))
      , a = new FontFaceObserver("Asana-Mathcal").load("ABCDEFGHIJKLMNOPQRSTXYZW", 2e5).then(otherFontFunc.bind(this, "Asana-Mathcal"))
      , r = new FontFaceObserver("Asana-Mathfrak").load(null, 2e5).then(otherFontFunc.bind(this, "Asana-Mathfrak"))
      , i = new FontFaceObserver("Asana-mathsf").load(null, 2e5).then(otherFontFunc.bind(this, "Asana-mathsf"))
      , s = new FontFaceObserver("Asana-Mathtt").load(null, 2e5).then(otherFontFunc.bind(this, "Asana-Mathtt"))
      , l = new FontFaceObserver("Asana-Mathrm").load(null, 2e5).then(otherFontFunc.bind(this, "Asana-Mathrm"))
      , d = new FontFaceObserver("Asana-Mathscr").load(null, 2e5).then(otherFontFunc.bind(this, "Asana-Mathscr"));
    return [e, n, o, t, a, r, i, s, l, new FontFaceObserver("FontAwesome").load(String.fromCharCode(62087, 61762, 61692), 2e5).then(function() {
        console.log("finish for font awesome"),
        contribute(80)
    }), d]
}
function setStyle(e) {
    var n = document.createElement("style");
    n.type = "text/css",
    n.styleSheet ? n.styleSheet.cssText = e : n.appendChild(document.createTextNode(e)),
    document.head.appendChild(n)
}
function setScript(e) {
    var n = document.createElement("script");
    n.text = e,
    document.head.appendChild(n)
}
function loadData() {
    return "main" == mathGlobal.appMode ? loadAjax("/data/page_init-" + mathGlobal.version).then(function(e) {
        mathGlobal.initData.initPageContent = e
    }) : "macos" == Sniffr.os.name ? loadAjax("/data/tutorial_mac-" + mathGlobal.version).then(function(e) {
        mathGlobal.initData.initPageContent = e
    }) : loadAjax("/data/tutorial_windows-" + mathGlobal.version).then(function(e) {
        mathGlobal.initData.initPageContent = e
    })
}
function loadMainStyle() {
    return loadAjax("/styles-" + mathGlobal.version + ".css").then(function(e) {
        setStyle(e)
    })
}
function loadFontAwesomeStyle() {
    return loadAjax("/resources/font-awesome.min-" + mathGlobal.version + ".css").then(function(e) {
        setStyle(e)
    })
}
window.mobilecheck = function() {
    var e = !1;
    return function(n) {
        (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(n) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(n.substr(0, 4))) && (e = !0)
    }(navigator.userAgent || navigator.vendor || window.opera),
    e
}
,
"function" != typeof Object.assign && (Object.assign = function(e, n) {
    "use strict";
    if (null == e)
        throw new TypeError("Cannot convert undefined or null to object");
    for (var o = Object(e), t = 1; t < arguments.length; t++) {
        var a = arguments[t];
        if (null != a)
            for (var r in a)
                Object.prototype.hasOwnProperty.call(a, r) && (o[r] = a[r])
    }
    return o
}
),
Array.prototype.map || (Array.prototype.map = function(e, n) {
    for (var o = [], t = 0; t < this.length; t++)
        o.push(e.call(n, this[t], t, this));
    return o
}
),
Array.prototype.forEach || (Array.prototype.forEach = function(e, n) {
    for (var o = 0; o < this.length; o++)
        e.call(n, this[o], o, this)
}
),
Object.keys || (Object.keys = function(e) {
    var n = [];
    for (var o in e)
        e.hasOwnProperty(o) && n.push(o);
    return n
}
),
function(e) {
    function n() {
        var e = this;
        i.forEach(function(n) {
            e[n] = {
                name: r,
                version: [],
                versionString: r
            }
        })
    }
    function o(e, n, o) {
        a[n].forEach(function(a) {
            var i = a[0]
              , s = a[1]
              , l = o.match(i);
            l && (e[n].name = s,
            l[2] ? (e[n].versionString = l[2],
            e[n].version = []) : l[1] ? (e[n].versionString = l[1].replace(/_/g, "."),
            e[n].version = t(l[1])) : (e[n].versionString = r,
            e[n].version = []))
        })
    }
    function t(e) {
        return e.split(/[\._]/).map(function(e) {
            return parseInt(e)
        })
    }
    var a = {
        browser: [[/msie ([\.\_\d]+)/, "ie"], [/trident\/.*?rv:([\.\_\d]+)/, "ie"], [/firefox\/([\.\_\d]+)/, "firefox"], [/chrome\/([\.\_\d]+)/, "chrome"], [/version\/([\.\_\d]+).*?safari/, "safari"], [/mobile safari ([\.\_\d]+)/, "safari"], [/android.*?version\/([\.\_\d]+).*?safari/, "com.android.browser"], [/crios\/([\.\_\d]+).*?safari/, "chrome"], [/opera/, "opera"], [/opera\/([\.\_\d]+)/, "opera"], [/opera ([\.\_\d]+)/, "opera"], [/opera mini.*?version\/([\.\_\d]+)/, "opera.mini"], [/opios\/([a-z\.\_\d]+)/, "opera"], [/blackberry/, "blackberry"], [/blackberry.*?version\/([\.\_\d]+)/, "blackberry"], [/bb\d+.*?version\/([\.\_\d]+)/, "blackberry"], [/rim.*?version\/([\.\_\d]+)/, "blackberry"], [/iceweasel\/([\.\_\d]+)/, "iceweasel"], [/edge\/([\.\d]+)/, "edge"]],
        os: [[/linux ()([a-z\.\_\d]+)/, "linux"], [/mac os x/, "macos"], [/mac os x.*?([\.\_\d]+)/, "macos"], [/os ([\.\_\d]+) like mac os/, "ios"], [/openbsd ()([a-z\.\_\d]+)/, "openbsd"], [/android/, "android"], [/android ([a-z\.\_\d]+);/, "android"], [/mozilla\/[a-z\.\_\d]+ \((?:mobile)|(?:tablet)/, "firefoxos"], [/windows\s*(?:nt)?\s*([\.\_\d]+)/, "windows"], [/windows phone.*?([\.\_\d]+)/, "windows.phone"], [/windows mobile/, "windows.mobile"], [/blackberry/, "blackberryos"], [/bb\d+/, "blackberryos"], [/rim.*?os\s*([\.\_\d]+)/, "blackberryos"]],
        device: [[/ipad/, "ipad"], [/iphone/, "iphone"], [/lumia/, "lumia"], [/htc/, "htc"], [/nexus/, "nexus"], [/galaxy nexus/, "galaxy.nexus"], [/nokia/, "nokia"], [/ gt\-/, "galaxy"], [/ sm\-/, "galaxy"], [/xbox/, "xbox"], [/(?:bb\d+)|(?:blackberry)|(?: rim )/, "blackberry"]]
    }
      , r = "Unknown"
      , i = Object.keys(a);
    n.prototype.sniff = function(e) {
        var n = this
          , t = (e || navigator.userAgent || "").toLowerCase();
        i.forEach(function(e) {
            o(n, e, t)
        })
    }
    ,
    "undefined" != typeof module && module.exports ? module.exports = n : (e.Sniffr = new n,
    e.Sniffr.sniff(navigator.userAgent))
}(this),
window.Promise = void 0,
function() {
    "use strict";
    function e(e) {
        u.push(e),
        1 == u.length && c()
    }
    function n() {
        for (; u.length; )
            u[0](),
            u.shift()
    }
    function o(e) {
        this.a = h,
        this.b = void 0,
        this.f = [];
        var n = this;
        try {
            e(function(e) {
                r(n, e)
            }, function(e) {
                i(n, e)
            })
        } catch (e) {
            i(n, e)
        }
    }
    function t(e) {
        return new o(function(n, o) {
            o(e)
        }
        )
    }
    function a(e) {
        return new o(function(n) {
            n(e)
        }
        )
    }
    function r(e, n) {
        if (e.a == h) {
            if (n == e)
                throw new TypeError;
            var o = !1;
            try {
                var t = n && n.then;
                if (null != n && "object" == typeof n && "function" == typeof t)
                    return void t.call(n, function(n) {
                        o || r(e, n),
                        o = !0
                    }, function(n) {
                        o || i(e, n),
                        o = !0
                    })
            } catch (n) {
                return void (o || i(e, n))
            }
            e.a = 0,
            e.b = n,
            s(e)
        }
    }
    function i(e, n) {
        if (e.a == h) {
            if (n == e)
                throw new TypeError;
            e.a = 1,
            e.b = n,
            s(e)
        }
    }
    function s(n) {
        e(function() {
            if (n.a != h)
                for (; n.f.length; ) {
                    var e = (a = n.f.shift())[0]
                      , o = a[1]
                      , t = a[2]
                      , a = a[3];
                    try {
                        0 == n.a ? t("function" == typeof e ? e.call(void 0, n.b) : n.b) : 1 == n.a && ("function" == typeof o ? t(o.call(void 0, n.b)) : a(n.b))
                    } catch (e) {
                        a(e)
                    }
                }
        })
    }
    function l(e) {
        return new o(function(n, o) {
            var t = 0
              , r = [];
            0 == e.length && n(r);
            for (var i = 0; i < e.length; i += 1)
                a(e[i]).c(function(o) {
                    return function(a) {
                        r[o] = a,
                        (t += 1) == e.length && n(r)
                    }
                }(i), o)
        }
        )
    }
    function d(e) {
        return new o(function(n, o) {
            for (var t = 0; t < e.length; t += 1)
                a(e[t]).c(n, o)
        }
        )
    }
    var c, u = [];
    c = function() {
        setTimeout(n)
    }
    ;
    var h = 2;
    o.prototype.g = function(e) {
        return this.c(void 0, e)
    }
    ,
    o.prototype.c = function(e, n) {
        var t = this;
        return new o(function(o, a) {
            t.f.push([e, n, o, a]),
            s(t)
        }
        )
    }
    ,
    window.Promise || (window.Promise = o,
    window.Promise.resolve = a,
    window.Promise.reject = t,
    window.Promise.race = d,
    window.Promise.all = l,
    window.Promise.prototype.then = o.prototype.c,
    window.Promise.prototype.catch = o.prototype.g)
}(),
function() {
    function e(e, n) {
        document.addEventListener ? e.addEventListener("scroll", n, !1) : e.attachEvent("scroll", n)
    }
    function n(e) {
        document.body ? e() : document.addEventListener ? document.addEventListener("DOMContentLoaded", function n() {
            document.removeEventListener("DOMContentLoaded", n),
            e()
        }) : document.attachEvent("onreadystatechange", function n() {
            "interactive" != document.readyState && "complete" != document.readyState || (document.detachEvent("onreadystatechange", n),
            e())
        })
    }
    function o(e) {
        this.a = document.createElement("div"),
        this.a.setAttribute("aria-hidden", "true"),
        this.a.appendChild(document.createTextNode(e)),
        this.b = document.createElement("span"),
        this.c = document.createElement("span"),
        this.h = document.createElement("span"),
        this.f = document.createElement("span"),
        this.g = -1,
        this.b.style.cssText = "max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;",
        this.c.style.cssText = "max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;",
        this.f.style.cssText = "max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;",
        this.h.style.cssText = "display:inline-block;width:200%;height:200%;font-size:16px;max-width:none;",
        this.b.appendChild(this.h),
        this.c.appendChild(this.f),
        this.a.appendChild(this.b),
        this.a.appendChild(this.c)
    }
    function t(e, n) {
        e.a.style.cssText = "max-width:none;min-width:20px;min-height:20px;display:inline-block;overflow:hidden;position:absolute;width:auto;margin:0;padding:0;top:-999px;left:-999px;white-space:nowrap;font-synthesis:none;font:" + n + ";"
    }
    function a(e) {
        var n = e.a.offsetWidth
          , o = n + 100;
        return e.f.style.width = o + "px",
        e.c.scrollLeft = o,
        e.b.scrollLeft = e.b.scrollWidth + 100,
        e.g !== n && (e.g = n,
        !0)
    }
    function r(n, o) {
        function t() {
            var e = r;
            a(e) && e.a.parentNode && o(e.g)
        }
        var r = n;
        e(n.b, t),
        e(n.c, t),
        a(n)
    }
    function i(e, n) {
        var o = n || {};
        this.family = e,
        this.style = o.style || "normal",
        this.weight = o.weight || "normal",
        this.stretch = o.stretch || "normal"
    }
    function s() {
        if (null === h)
            if (l() && /Apple/.test(window.navigator.vendor)) {
                var e = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))/.exec(window.navigator.userAgent);
                h = !!e && 603 > parseInt(e[1], 10)
            } else
                h = !1;
        return h
    }
    function l() {
        return null === m && (m = !!document.fonts),
        m
    }
    function d() {
        if (null === f) {
            var e = document.createElement("div");
            try {
                e.style.font = "condensed 100px sans-serif"
            } catch (e) {}
            f = "" !== e.style.font
        }
        return f
    }
    function c(e, n) {
        return [e.style, e.weight, d() ? e.stretch : "", "100px", n].join(" ")
    }
    var u = null
      , h = null
      , f = null
      , m = null;
    i.prototype.load = function(e, a) {
        var i = this
          , d = e || "BESbswy"
          , h = 0
          , f = a || 3e3
          , m = (new Date).getTime();
        return new Promise(function(e, a) {
            if (l() && !s()) {
                var p = new Promise(function(e, n) {
                    function o() {
                        (new Date).getTime() - m >= f ? n() : document.fonts.load(c(i, '"' + i.family + '"'), d).then(function(n) {
                            1 <= n.length ? e() : setTimeout(o, 25)
                        }, function() {
                            n()
                        })
                    }
                    o()
                }
                )
                  , b = new Promise(function(e, n) {
                    h = setTimeout(n, f)
                }
                );
                Promise.race([b, p]).then(function() {
                    clearTimeout(h),
                    e(i)
                }, function() {
                    a(i)
                })
            } else
                n(function() {
                    function n() {
                        var n;
                        (n = -1 != w && -1 != v || -1 != w && -1 != g || -1 != v && -1 != g) && ((n = w != v && w != g && v != g) || (null === u && (n = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent),
                        u = !!n && (536 > parseInt(n[1], 10) || 536 === parseInt(n[1], 10) && 11 >= parseInt(n[2], 10))),
                        n = u && (w == y && v == y && g == y || w == x && v == x && g == x || w == S && v == S && g == S)),
                        n = !n),
                        n && (k.parentNode && k.parentNode.removeChild(k),
                        clearTimeout(h),
                        e(i))
                    }
                    function s() {
                        if ((new Date).getTime() - m >= f)
                            k.parentNode && k.parentNode.removeChild(k),
                            a(i);
                        else {
                            var e = document.hidden;
                            !0 !== e && void 0 !== e || (w = l.a.offsetWidth,
                            v = p.a.offsetWidth,
                            g = b.a.offsetWidth,
                            n()),
                            h = setTimeout(s, 50)
                        }
                    }
                    var l = new o(d)
                      , p = new o(d)
                      , b = new o(d)
                      , w = -1
                      , v = -1
                      , g = -1
                      , y = -1
                      , x = -1
                      , S = -1
                      , k = document.createElement("div");
                    k.dir = "ltr",
                    t(l, c(i, "sans-serif")),
                    t(p, c(i, "serif")),
                    t(b, c(i, "monospace")),
                    k.appendChild(l.a),
                    k.appendChild(p.a),
                    k.appendChild(b.a),
                    document.body.appendChild(k),
                    y = l.a.offsetWidth,
                    x = p.a.offsetWidth,
                    S = b.a.offsetWidth,
                    s(),
                    r(l, function(e) {
                        w = e,
                        n()
                    }),
                    t(l, c(i, '"' + i.family + '",sans-serif')),
                    r(p, function(e) {
                        v = e,
                        n()
                    }),
                    t(p, c(i, '"' + i.family + '",serif')),
                    r(b, function(e) {
                        g = e,
                        n()
                    }),
                    t(b, c(i, '"' + i.family + '",monospace'))
                })
        }
        )
    }
    ,
    "undefined" != typeof module ? module.exports = i : (window.FontFaceObserver = i,
    window.FontFaceObserver.prototype.load = i.prototype.load)
}(),
mathGlobal = Object.assign({}, {
    environment: "production",
    sizes: {
        bundleSize: 1800,
        asanaMathSize: 400,
        styleSize: 90,
        asanaOtherAsanaFontSize: 180,
        totalSize: 0,
        initDataSize: 5
    },
    loaded: 0,
    connectionError: !1,
    version: g_version,
    initData: {
        initPageContent: ""
    }
}, mathGlobal),
mathGlobal.sizes.totalSize = mathGlobal.sizes.bundleSize + mathGlobal.sizes.asanaMathSize + mathGlobal.sizes.asanaOtherAsanaFontSize + mathGlobal.sizes.styleSize + mathGlobal.sizes.initDataSize;
var shouldLoad = !0
  , errorMessage = ""
  , notSupportedBrowserMessage = "Sorry! Only Desktop Chrome,Firefox, Safari browser are supported for this alpha release.";
if ("ios" == Sniffr.os.name ? Sniffr.os.version[0] < 10 ? (shouldLoad = !1,
errorMessage = "Sorry! Please upgrade to ios 10 and above") : shouldLoad = !0 : "android" == Sniffr.os.name ? "chrome" == Sniffr.browser.name && Sniffr.browser.version[0] < 51 ? (shouldLoad = !1,
errorMessage = "Sorry! Please use Chrome version 51 or above") : "firefox" == Sniffr.browser.name ? (shouldLoad = !1,
errorMessage = "Sorry! Firefox on Android is not supported, please use Chrome instead") : shouldLoad = !0 : "firefoxos" == Sniffr.os.name ? (shouldLoad = !1,
errorMessage = "Sorry! Firefox on Android is not supported, please use Chrome instead") : "chrome" != Sniffr.browser.name && "firefox" != Sniffr.browser.name && "safari" != Sniffr.browser.name ? (shouldLoad = !1,
errorMessage = notSupportedBrowserMessage) : "Unknown" != Sniffr.device.name ? (shouldLoad = !1,
errorMessage = notSupportedBrowserMessage) : "chrome" == Sniffr.browser.name && Sniffr.browser.version[0] < 51 ? (shouldLoad = !1,
errorMessage = "Sorry! Please use Chrome version 51 or above") : "firefox" == Sniffr.browser.name && Sniffr.browser.version[0] < 49 ? (shouldLoad = !1,
errorMessage = "Sorry! Please use Firefox version 49 or above") : "safari" == Sniffr.browser.name && Sniffr.browser.version[0] < 10 && (shouldLoad = !1,
errorMessage = "Sorry! Please use Safari version 10 or above"),
getParameterByName("force") && (shouldLoad = !0),
shouldLoad)
    window.Promise.all([loadAjax("/bundle-" + mathGlobal.version + ".js"), loadMainStyle(), loadFontAwesomeStyle(), loadData()].concat(loadFonts())).then(function(e) {
        console.log("all loaded");
        var n = document.getElementById("main-container");
        n.parentNode.removeChild(n),
        setScript(e[0])
    }, function(e) {
        mathGlobal.connectionError = !0,
        document.getElementById("error-span").innerText = "Connection error! Please try to reload page"
    });
else {
    var progressBarContainer = document.getElementById("progress-bar-container");
    progressBarContainer.parentNode.removeChild(progressBarContainer);
    var errorSpan = document.getElementById("error-span");
    errorSpan.innerText = errorMessage
}
