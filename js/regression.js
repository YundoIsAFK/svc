function BIC(n, t, i) {
    return t + t * Math.log(2 * Math.PI) + t * Math.log(n / t) + Math.log(t) * (i + 1)
}

(function (n, t) {
    return typeof define == "function" && define.amd
        ? define("regression", t)
        : typeof module != "undefined"
            ? module.exports = t()
            : n.regression = t()
})(this, function () {

"use strict";

function t(n, t, i) {

    var u = n.reduce(function (n, t) { return n + t[1] }, 0),
        f = u / n.length,

        e = n.reduce(function (n, t) {
            var i = t[1] - f
            return n + i * i
        }, 0),

        r = n.reduce(function (n, i, r) {
            var f = t[r],
                u = i[1] - f[1]
            return n + u * u
        }, 0)

    return {
        r2: 1 - r / e,
        bic: BIC(r, n.length, i)
    }
}

function i(n, t) {

    for (var u = 0, i = 0, r = 0, e = 0, o = 0,
         f = n.length - 1,
         s = new Array(t), u = 0; u < f; u++) {

        for (e = u, i = u + 1; i < f; i++)
            Math.abs(n[u][i]) > Math.abs(n[u][e]) && (e = i)

        for (r = u; r < f + 1; r++) {
            o = n[r][u]
            n[r][u] = n[r][e]
            n[r][e] = o
        }

        for (i = u + 1; i < f; i++)
            for (r = f; r >= u; r--)
                n[r][i] -= n[r][u] * n[u][i] / n[u][u]
    }

    for (i = f - 1; i >= 0; i--) {
        for (o = 0, r = i + 1; r < f; r++)
            o += n[r][i] * s[r]

        s[i] = (n[f][i] - o) / n[i][i]
    }

    return s
}

function n(n, t) {
    var i = Math.pow(10, t)
    return Math.round(n * i) / i
}

var r = 2

var u = {

auto: function (n, t, i) {

    var u = [
        { type: "linear" },
        { type: "polynomial", order: 2 },
        { type: "polynomial", order: 3 },
        { type: "polynomial", order: 4 },
        { type: "exponential" },
        { type: "logarithmic" }
    ]

    var f, r, e

    if (t) u = t

    for (r = 0; r < u.length; r++) {

        e = this[u[r].type](n, u[r].order, i)

        if (!f || f.bic > e.bic)
            f = e
    }

    return f
},

linear: function (i, r, u) {

    var l,
        f = [0, 0, 0, 0, 0],
        c, o, h,
        s = i.length

    for (var e = 0; e < s; e++)
        if (i[e][1] !== null) {
            f[0] += i[e][0]
            f[1] += i[e][1]
            f[2] += i[e][0] * i[e][0]
            f[3] += i[e][0] * i[e][1]
            f[4] += i[e][1] * i[e][1]
        }

    o = (s * f[3] - f[0] * f[1]) / (s * f[2] - f[0] * f[0])
    h = f[1] / s - o * f[0] / s

    c = i.map(function (n) {
        var t = n[0]
        return [t, o * t + h]
    })

    l = t(i, c, 2)

    return {
        r2: l.r2,
        bic: l.bic,

        predict: function (n) {
            return this.equation[0] * n + this.equation[1]
        },

        equation: [o, h],
        points: c,

        string:
            "y = " + n(o, u.precision) + "x + " + n(h, u.precision)
    }
},

linearthroughorigin: function (i, r, u) {

    var h,
        e = [0, 0],
        o, s

    for (var f = 0; f < i.length; f++)
        if (i[f][1] !== null) {
            e[0] += i[f][0] * i[f][0]
            e[1] += i[f][0] * i[f][1]
        }

    o = e[1] / e[0]

    s = i.map(function (n) {
        var t = n[0]
        return [t, o * t]
    })

    h = t(i, s, 1)

    return {
        r2: h.r2,
        bic: h.bic,

        predict: function (n) {
            return this.equation[0] * n
        },

        equation: [o],
        points: s,

        string:
            "y = " + n(o, u.precision) + "x"
    }
}

}

return function (n, t, i, f) {

    var e = typeof i == "object" && typeof f == "undefined"
        ? i
        : f || {}

    if (!e.precision)
        e.precision = r

    return typeof n == "string"
        ? u[n.toLowerCase()](t, i, e)
        : null
}

})
