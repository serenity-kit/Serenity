(() => {
  var n,
    e,
    t,
    r,
    o,
    i,
    _ = {
      950: (n, e, t) => {
        "use strict";
        t.a(n, async (r, o) => {
          try {
            t.d(e, {
              EB: () => X,
              GS: () => P,
              GX: () => q,
              MF: () => M,
              Mz: () => $,
              Or: () => J,
              Qu: () => I,
              Ts: () => N,
              Wl: () => C,
              XP: () => z,
              Y8: () => F,
              YM: () => j,
              Yc: () => Z,
              Z4: () => R,
              Zu: () => H,
              _8: () => A,
              _G: () => K,
              bf: () => D,
              cF: () => U,
              cR: () => O,
              eY: () => Y,
              h4: () => T,
              kC: () => Q,
              m_: () => V,
              oH: () => nn,
              rf: () => L,
              tL: () => W,
              ug: () => G,
              vG: () => B,
            });
            var i = t(754);
            n = t.hmd(n);
            var _ = r([i]);
            i = (_.then ? (await _)() : _)[0];
            let a = new (
              "undefined" == typeof TextDecoder
                ? (0, n.require)("util").TextDecoder
                : TextDecoder
            )("utf-8", { ignoreBOM: !0, fatal: !0 });
            a.decode();
            let c = null;
            function u() {
              return (
                (null !== c && c.buffer === i.memory.buffer) ||
                  (c = new Uint8Array(i.memory.buffer)),
                c
              );
            }
            function f(n, e) {
              return a.decode(u().subarray(n, n + e));
            }
            const s = new Array(32).fill(void 0);
            s.push(void 0, null, !0, !1);
            let d = s.length;
            function l(n) {
              d === s.length && s.push(s.length + 1);
              const e = d;
              return (d = s[e]), (s[e] = n), e;
            }
            function b(n) {
              return s[n];
            }
            function w(n) {
              n < 36 || ((s[n] = d), (d = n));
            }
            function g(n) {
              const e = b(n);
              return w(n), e;
            }
            let p = 0;
            function h(n, e) {
              const t = e(1 * n.length);
              return u().set(n, t / 1), (p = n.length), t;
            }
            let y = null;
            function m() {
              return (
                (null !== y && y.buffer === i.memory.buffer) ||
                  (y = new Int32Array(i.memory.buffer)),
                y
              );
            }
            function v(n, e) {
              return u().subarray(n / 1, n / 1 + e);
            }
            let x = new (
              "undefined" == typeof TextEncoder
                ? (0, n.require)("util").TextEncoder
                : TextEncoder
            )("utf-8");
            const S =
              "function" == typeof x.encodeInto
                ? function (n, e) {
                    return x.encodeInto(n, e);
                  }
                : function (n, e) {
                    const t = x.encode(n);
                    return e.set(t), { read: n.length, written: t.length };
                  };
            function E(n, e, t) {
              if (void 0 === t) {
                const t = x.encode(n),
                  r = e(t.length);
                return (
                  u()
                    .subarray(r, r + t.length)
                    .set(t),
                  (p = t.length),
                  r
                );
              }
              let r = n.length,
                o = e(r);
              const i = u();
              let _ = 0;
              for (; _ < r; _++) {
                const e = n.charCodeAt(_);
                if (e > 127) break;
                i[o + _] = e;
              }
              if (_ !== r) {
                0 !== _ && (n = n.slice(_)),
                  (o = t(o, r, (r = _ + 3 * n.length)));
                const e = u().subarray(o + _, o + r);
                _ += S(n, e).written;
              }
              return (p = _), o;
            }
            function k(n, e) {
              try {
                return n.apply(this, e);
              } catch (n) {
                i.__wbindgen_exn_store(l(n));
              }
            }
            class j {
              static __wrap(n) {
                const e = Object.create(j.prototype);
                return (e.ptr = n), e;
              }
              __destroy_into_raw() {
                const n = this.ptr;
                return (this.ptr = 0), n;
              }
              free() {
                const n = this.__destroy_into_raw();
                i.__wbg_registration_free(n);
              }
              constructor() {
                var n = i.registration_new();
                return j.__wrap(n);
              }
              start(n) {
                try {
                  const c = i.__wbindgen_add_to_stack_pointer(-16);
                  var e = E(n, i.__wbindgen_malloc, i.__wbindgen_realloc),
                    t = p;
                  i.registration_start(c, this.ptr, e, t);
                  var r = m()[c / 4 + 0],
                    o = m()[c / 4 + 1],
                    _ = m()[c / 4 + 2];
                  if (m()[c / 4 + 3]) throw g(_);
                  var a = v(r, o).slice();
                  return i.__wbindgen_free(r, 1 * o), a;
                } finally {
                  i.__wbindgen_add_to_stack_pointer(16);
                }
              }
              finish(n) {
                try {
                  const c = i.__wbindgen_add_to_stack_pointer(-16);
                  var e = h(n, i.__wbindgen_malloc),
                    t = p;
                  i.registration_finish(c, this.ptr, e, t);
                  var r = m()[c / 4 + 0],
                    o = m()[c / 4 + 1],
                    _ = m()[c / 4 + 2];
                  if (m()[c / 4 + 3]) throw g(_);
                  var a = v(r, o).slice();
                  return i.__wbindgen_free(r, 1 * o), a;
                } finally {
                  i.__wbindgen_add_to_stack_pointer(16);
                }
              }
              getExportKey() {
                try {
                  const o = i.__wbindgen_add_to_stack_pointer(-16);
                  i.registration_getExportKey(o, this.ptr);
                  var n = m()[o / 4 + 0],
                    e = m()[o / 4 + 1],
                    t = m()[o / 4 + 2];
                  if (m()[o / 4 + 3]) throw g(t);
                  var r = v(n, e).slice();
                  return i.__wbindgen_free(n, 1 * e), r;
                } finally {
                  i.__wbindgen_add_to_stack_pointer(16);
                }
              }
            }
            function T(n, e) {
              return l(f(n, e));
            }
            function O() {
              return k(function (n, e) {
                b(n).getRandomValues(b(e));
              }, arguments);
            }
            function A() {
              return k(function (n, e, t) {
                b(n).randomFillSync(v(e, t));
              }, arguments);
            }
            function M(n) {
              return l(b(n).process);
            }
            function C(n) {
              const e = b(n);
              return "object" == typeof e && null !== e;
            }
            function F(n) {
              return l(b(n).versions);
            }
            function G(n) {
              g(n);
            }
            function P(n) {
              return l(b(n).node);
            }
            function Y(n) {
              return "string" == typeof b(n);
            }
            function q() {
              return k(function (n, e) {
                return l(t(989)(f(n, e)));
              }, arguments);
            }
            function U(n) {
              return l(b(n).crypto);
            }
            function B(n) {
              return l(b(n).msCrypto);
            }
            function D(n, e) {
              return l(new Function(f(n, e)));
            }
            function R() {
              return k(function (n, e) {
                return l(b(n).call(b(e)));
              }, arguments);
            }
            function W() {
              return k(function () {
                return l(self.self);
              }, arguments);
            }
            function I() {
              return k(function () {
                return l(window.window);
              }, arguments);
            }
            function X() {
              return k(function () {
                return l(globalThis.globalThis);
              }, arguments);
            }
            function Z() {
              return k(function () {
                return l(t.g.global);
              }, arguments);
            }
            function z(n) {
              return void 0 === b(n);
            }
            function L(n) {
              return l(b(n).buffer);
            }
            function N(n) {
              return l(new Uint8Array(b(n)));
            }
            function $(n, e, t) {
              b(n).set(b(e), t >>> 0);
            }
            function H(n) {
              return b(n).length;
            }
            function K(n) {
              return l(new Uint8Array(n >>> 0));
            }
            function Q(n, e, t) {
              return l(b(n).subarray(e >>> 0, t >>> 0));
            }
            function V(n) {
              return l(b(n));
            }
            function J(n, e) {
              throw new Error(f(n, e));
            }
            function nn() {
              return l(i.memory);
            }
            o();
          } catch (en) {
            o(en);
          }
        });
      },
      989: (n) => {
        function e(n) {
          var e = new Error("Cannot find module '" + n + "'");
          throw ((e.code = "MODULE_NOT_FOUND"), e);
        }
        (e.keys = () => []), (e.resolve = e), (e.id = 989), (n.exports = e);
      },
      906: (n, e, t) => {
        "use strict";
        t.a(n, async (n, e) => {
          try {
            var r = t(950),
              o = n([r]);
            r = (o.then ? (await o)() : o)[0];
            var i = function (n) {
                return btoa(String.fromCharCode.apply(null, n));
              },
              _ = new r.YM();
            (window._opaque = {}),
              (window._opaque.registerInitialize = function (n) {
                var e = _.start(n);
                return i(e);
              }),
              (window._opaque.finishRegistration = function (n) {
                var e,
                  t = _.finish(
                    ((e = n),
                    Uint8Array.from(atob(e), function (n) {
                      return n.charCodeAt(0);
                    }))
                  );
                return i(t);
              }),
              e();
          } catch (n) {
            e(n);
          }
        });
      },
      754: (n, e, t) => {
        "use strict";
        t.a(
          n,
          async (r, o) => {
            try {
              var i,
                _ = r([(i = t(950))]),
                [i] = _.then ? (await _)() : _;
              await t.v(e, n.id, "8dc9b46238dd179ed49d", {
                "./opaque_wasm_bg.js": {
                  __wbindgen_string_new: i.h4,
                  __wbg_getRandomValues_3e46aa268da0fed1: i.cR,
                  __wbg_randomFillSync_59fcc2add91fe7b3: i._8,
                  __wbg_process_f2b73829dbd321da: i.MF,
                  __wbindgen_is_object: i.Wl,
                  __wbg_versions_cd82f79c98672a9f: i.Y8,
                  __wbindgen_object_drop_ref: i.ug,
                  __wbg_node_ee3f6da4130bd35f: i.GS,
                  __wbindgen_is_string: i.eY,
                  __wbg_modulerequire_0a83c0c31d12d2c7: i.GX,
                  __wbg_crypto_9e3521ed42436d35: i.cF,
                  __wbg_msCrypto_c429c3f8f7a70bb5: i.vG,
                  __wbg_newnoargs_f579424187aa1717: i.bf,
                  __wbg_call_89558c3e96703ca1: i.Z4,
                  __wbg_self_e23d74ae45fb17d1: i.tL,
                  __wbg_window_b4be7f48b24ac56e: i.Qu,
                  __wbg_globalThis_d61b1f48a57191ae: i.EB,
                  __wbg_global_e7669da72fd7f239: i.Yc,
                  __wbindgen_is_undefined: i.XP,
                  __wbg_buffer_5e74a88a1424a2e0: i.rf,
                  __wbg_new_e3b800e570795b3c: i.Ts,
                  __wbg_set_5b8081e9d002f0df: i.Mz,
                  __wbg_length_30803400a8f15c59: i.Zu,
                  __wbg_newwithlength_5f4ce114a24dfe1e: i._G,
                  __wbg_subarray_a68f835ca2af506f: i.kC,
                  __wbindgen_object_clone_ref: i.m_,
                  __wbindgen_throw: i.Or,
                  __wbindgen_memory: i.oH,
                },
              }),
                o();
            } catch (n) {
              o(n);
            }
          },
          1
        );
      },
    },
    a = {};
  function c(n) {
    var e = a[n];
    if (void 0 !== e) return e.exports;
    var t = (a[n] = { id: n, loaded: !1, exports: {} });
    return _[n](t, t.exports, c), (t.loaded = !0), t.exports;
  }
  (n =
    "function" == typeof Symbol ? Symbol("webpack then") : "__webpack_then__"),
    (e =
      "function" == typeof Symbol
        ? Symbol("webpack exports")
        : "__webpack_exports__"),
    (t =
      "function" == typeof Symbol
        ? Symbol("webpack error")
        : "__webpack_error__"),
    (r = (n) => {
      n && (n.forEach((n) => n.r--), n.forEach((n) => (n.r-- ? n.r++ : n())));
    }),
    (o = (n) => !--n.r && n()),
    (i = (n, e) => (n ? n.push(e) : o(e))),
    (c.a = (_, a, c) => {
      var u,
        f,
        s,
        d = c && [],
        l = _.exports,
        b = !0,
        w = !1,
        g = (e, t, r) => {
          w ||
            ((w = !0),
            (t.r += e.length),
            e.map((e, o) => e[n](t, r)),
            (w = !1));
        },
        p = new Promise((n, e) => {
          (s = e), (f = () => (n(l), r(d), (d = 0)));
        });
      (p[e] = l),
        (p[n] = (n, e) => {
          if (b) return o(n);
          u && g(u, n, e), i(d, n), p.catch(e);
        }),
        (_.exports = p),
        a(
          (_) => {
            var a;
            u = ((_) =>
              _.map((_) => {
                if (null !== _ && "object" == typeof _) {
                  if (_[n]) return _;
                  if (_.then) {
                    var a = [];
                    _.then(
                      (n) => {
                        (c[e] = n), r(a), (a = 0);
                      },
                      (n) => {
                        (c[t] = n), r(a), (a = 0);
                      }
                    );
                    var c = {};
                    return (c[n] = (n, e) => (i(a, n), _.catch(e))), c;
                  }
                }
                var u = {};
                return (u[n] = (n) => o(n)), (u[e] = _), u;
              }))(_);
            var c = () =>
                u.map((n) => {
                  if (n[t]) throw n[t];
                  return n[e];
                }),
              f = new Promise((n, e) => {
                ((a = () => n(c)).r = 0), g(u, a, e);
              });
            return a.r ? f : c();
          },
          (n) => (n && s((p[t] = n)), f())
        ),
        (b = !1);
    }),
    (c.d = (n, e) => {
      for (var t in e)
        c.o(e, t) &&
          !c.o(n, t) &&
          Object.defineProperty(n, t, { enumerable: !0, get: e[t] });
    }),
    (c.g = (function () {
      if ("object" == typeof globalThis) return globalThis;
      try {
        return this || new Function("return this")();
      } catch (n) {
        if ("object" == typeof window) return window;
      }
    })()),
    (c.hmd = (n) => (
      (n = Object.create(n)).children || (n.children = []),
      Object.defineProperty(n, "exports", {
        enumerable: !0,
        set: () => {
          throw new Error(
            "ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: " +
              n.id
          );
        },
      }),
      n
    )),
    (c.o = (n, e) => Object.prototype.hasOwnProperty.call(n, e)),
    (c.v = (n, e, t, r) => {
      var o = fetch(c.p + "" + t + ".module.wasm");
      return "function" == typeof WebAssembly.instantiateStreaming
        ? WebAssembly.instantiateStreaming(o, r).then((e) =>
            Object.assign(n, e.instance.exports)
          )
        : o
            .then((n) => n.arrayBuffer())
            .then((n) => WebAssembly.instantiate(n, r))
            .then((e) => Object.assign(n, e.instance.exports));
    }),
    (() => {
      var n;
      c.g.importScripts && (n = c.g.location + "");
      var e = c.g.document;
      if (!n && e && (e.currentScript && (n = e.currentScript.src), !n)) {
        var t = e.getElementsByTagName("script");
        t.length && (n = t[t.length - 1].src);
      }
      if (!n)
        throw new Error(
          "Automatic publicPath is not supported in this browser"
        );
      (n = n
        .replace(/#.*$/, "")
        .replace(/\?.*$/, "")
        .replace(/\/[^\/]+$/, "/")),
        (c.p = n);
    })(),
    c(906);
})();
