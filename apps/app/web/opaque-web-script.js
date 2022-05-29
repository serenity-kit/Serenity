(() => {
  var e,
    n,
    t,
    r,
    o,
    i,
    _ = {
      950: (e, n, t) => {
        "use strict";
        t.a(e, async (r, o) => {
          try {
            t.d(n, {
              EB: () => X,
              GS: () => P,
              GX: () => q,
              MF: () => M,
              Mz: () => $,
              Or: () => J,
              Qu: () => R,
              Ts: () => N,
              Wl: () => F,
              XP: () => z,
              Y8: () => C,
              YM: () => j,
              Yc: () => Z,
              Z4: () => W,
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
              oH: () => ee,
              rf: () => L,
              tL: () => I,
              ug: () => G,
              vG: () => B,
            });
            var i = t(754);
            e = t.hmd(e);
            var _ = r([i]);
            i = (_.then ? (await _)() : _)[0];
            let c = new (
              "undefined" == typeof TextDecoder
                ? (0, e.require)("util").TextDecoder
                : TextDecoder
            )("utf-8", { ignoreBOM: !0, fatal: !0 });
            c.decode();
            let a = null;
            function u() {
              return (
                (null !== a && a.buffer === i.memory.buffer) ||
                  (a = new Uint8Array(i.memory.buffer)),
                a
              );
            }
            function f(e, n) {
              return c.decode(u().subarray(e, e + n));
            }
            const s = new Array(32).fill(void 0);
            s.push(void 0, null, !0, !1);
            let d = s.length;
            function l(e) {
              d === s.length && s.push(s.length + 1);
              const n = d;
              return (d = s[n]), (s[n] = e), n;
            }
            function b(e) {
              return s[e];
            }
            function w(e) {
              e < 36 || ((s[e] = d), (d = e));
            }
            function g(e) {
              const n = b(e);
              return w(e), n;
            }
            let p = 0;
            function h(e, n) {
              const t = n(1 * e.length);
              return u().set(e, t / 1), (p = e.length), t;
            }
            let y = null;
            function m() {
              return (
                (null !== y && y.buffer === i.memory.buffer) ||
                  (y = new Int32Array(i.memory.buffer)),
                y
              );
            }
            function v(e, n) {
              return u().subarray(e / 1, e / 1 + n);
            }
            let x = new (
              "undefined" == typeof TextEncoder
                ? (0, e.require)("util").TextEncoder
                : TextEncoder
            )("utf-8");
            const S =
              "function" == typeof x.encodeInto
                ? function (e, n) {
                    return x.encodeInto(e, n);
                  }
                : function (e, n) {
                    const t = x.encode(e);
                    return n.set(t), { read: e.length, written: t.length };
                  };
            function E(e, n, t) {
              if (void 0 === t) {
                const t = x.encode(e),
                  r = n(t.length);
                return (
                  u()
                    .subarray(r, r + t.length)
                    .set(t),
                  (p = t.length),
                  r
                );
              }
              let r = e.length,
                o = n(r);
              const i = u();
              let _ = 0;
              for (; _ < r; _++) {
                const n = e.charCodeAt(_);
                if (n > 127) break;
                i[o + _] = n;
              }
              if (_ !== r) {
                0 !== _ && (e = e.slice(_)),
                  (o = t(o, r, (r = _ + 3 * e.length)));
                const n = u().subarray(o + _, o + r);
                _ += S(e, n).written;
              }
              return (p = _), o;
            }
            function k(e, n) {
              try {
                return e.apply(this, n);
              } catch (e) {
                i.__wbindgen_exn_store(l(e));
              }
            }
            class j {
              static __wrap(e) {
                const n = Object.create(j.prototype);
                return (n.ptr = e), n;
              }
              __destroy_into_raw() {
                const e = this.ptr;
                return (this.ptr = 0), e;
              }
              free() {
                const e = this.__destroy_into_raw();
                i.__wbg_registration_free(e);
              }
              constructor() {
                var e = i.registration_new();
                return j.__wrap(e);
              }
              start(e) {
                try {
                  const a = i.__wbindgen_add_to_stack_pointer(-16);
                  var n = E(e, i.__wbindgen_malloc, i.__wbindgen_realloc),
                    t = p;
                  i.registration_start(a, this.ptr, n, t);
                  var r = m()[a / 4 + 0],
                    o = m()[a / 4 + 1],
                    _ = m()[a / 4 + 2];
                  if (m()[a / 4 + 3]) throw g(_);
                  var c = v(r, o).slice();
                  return i.__wbindgen_free(r, 1 * o), c;
                } finally {
                  i.__wbindgen_add_to_stack_pointer(16);
                }
              }
              finish(e) {
                try {
                  const a = i.__wbindgen_add_to_stack_pointer(-16);
                  var n = h(e, i.__wbindgen_malloc),
                    t = p;
                  i.registration_finish(a, this.ptr, n, t);
                  var r = m()[a / 4 + 0],
                    o = m()[a / 4 + 1],
                    _ = m()[a / 4 + 2];
                  if (m()[a / 4 + 3]) throw g(_);
                  var c = v(r, o).slice();
                  return i.__wbindgen_free(r, 1 * o), c;
                } finally {
                  i.__wbindgen_add_to_stack_pointer(16);
                }
              }
              getExportKey() {
                try {
                  const o = i.__wbindgen_add_to_stack_pointer(-16);
                  i.registration_getExportKey(o, this.ptr);
                  var e = m()[o / 4 + 0],
                    n = m()[o / 4 + 1],
                    t = m()[o / 4 + 2];
                  if (m()[o / 4 + 3]) throw g(t);
                  var r = v(e, n).slice();
                  return i.__wbindgen_free(e, 1 * n), r;
                } finally {
                  i.__wbindgen_add_to_stack_pointer(16);
                }
              }
            }
            function T(e, n) {
              return l(f(e, n));
            }
            function O() {
              return k(function (e, n) {
                b(e).getRandomValues(b(n));
              }, arguments);
            }
            function A() {
              return k(function (e, n, t) {
                b(e).randomFillSync(v(n, t));
              }, arguments);
            }
            function M(e) {
              return l(b(e).process);
            }
            function F(e) {
              const n = b(e);
              return "object" == typeof n && null !== n;
            }
            function C(e) {
              return l(b(e).versions);
            }
            function G(e) {
              g(e);
            }
            function P(e) {
              return l(b(e).node);
            }
            function Y(e) {
              return "string" == typeof b(e);
            }
            function q() {
              return k(function (e, n) {
                return l(t(989)(f(e, n)));
              }, arguments);
            }
            function U(e) {
              return l(b(e).crypto);
            }
            function B(e) {
              return l(b(e).msCrypto);
            }
            function D(e, n) {
              return l(new Function(f(e, n)));
            }
            function W() {
              return k(function (e, n) {
                return l(b(e).call(b(n)));
              }, arguments);
            }
            function I() {
              return k(function () {
                return l(self.self);
              }, arguments);
            }
            function R() {
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
            function z(e) {
              return void 0 === b(e);
            }
            function L(e) {
              return l(b(e).buffer);
            }
            function N(e) {
              return l(new Uint8Array(b(e)));
            }
            function $(e, n, t) {
              b(e).set(b(n), t >>> 0);
            }
            function H(e) {
              return b(e).length;
            }
            function K(e) {
              return l(new Uint8Array(e >>> 0));
            }
            function Q(e, n, t) {
              return l(b(e).subarray(n >>> 0, t >>> 0));
            }
            function V(e) {
              return l(b(e));
            }
            function J(e, n) {
              throw new Error(f(e, n));
            }
            function ee() {
              return l(i.memory);
            }
            o();
          } catch (ne) {
            o(ne);
          }
        });
      },
      989: (e) => {
        function n(e) {
          var n = new Error("Cannot find module '" + e + "'");
          throw ((n.code = "MODULE_NOT_FOUND"), n);
        }
        (n.keys = () => []), (n.resolve = n), (n.id = 989), (e.exports = n);
      },
      906: (e, n, t) => {
        "use strict";
        t.a(e, async (e, n) => {
          try {
            var r = t(950),
              o = e([r]);
            (r = (o.then ? (await o)() : o)[0]),
              (window._opaque = {}),
              (window._opaque.registerInitialize = function (e) {
                var n;
                return (
                  (n = new r.YM().start(e)),
                  btoa(String.fromCharCode.apply(null, n))
                );
              }),
              n();
          } catch (e) {
            n(e);
          }
        });
      },
      754: (e, n, t) => {
        "use strict";
        t.a(
          e,
          async (r, o) => {
            try {
              var i,
                _ = r([(i = t(950))]),
                [i] = _.then ? (await _)() : _;
              await t.v(n, e.id, "8dc9b46238dd179ed49d", {
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
            } catch (e) {
              o(e);
            }
          },
          1
        );
      },
    },
    c = {};
  function a(e) {
    var n = c[e];
    if (void 0 !== n) return n.exports;
    var t = (c[e] = { id: e, loaded: !1, exports: {} });
    return _[e](t, t.exports, a), (t.loaded = !0), t.exports;
  }
  (e =
    "function" == typeof Symbol ? Symbol("webpack then") : "__webpack_then__"),
    (n =
      "function" == typeof Symbol
        ? Symbol("webpack exports")
        : "__webpack_exports__"),
    (t =
      "function" == typeof Symbol
        ? Symbol("webpack error")
        : "__webpack_error__"),
    (r = (e) => {
      e && (e.forEach((e) => e.r--), e.forEach((e) => (e.r-- ? e.r++ : e())));
    }),
    (o = (e) => !--e.r && e()),
    (i = (e, n) => (e ? e.push(n) : o(n))),
    (a.a = (_, c, a) => {
      var u,
        f,
        s,
        d = a && [],
        l = _.exports,
        b = !0,
        w = !1,
        g = (n, t, r) => {
          w ||
            ((w = !0),
            (t.r += n.length),
            n.map((n, o) => n[e](t, r)),
            (w = !1));
        },
        p = new Promise((e, n) => {
          (s = n), (f = () => (e(l), r(d), (d = 0)));
        });
      (p[n] = l),
        (p[e] = (e, n) => {
          if (b) return o(e);
          u && g(u, e, n), i(d, e), p.catch(n);
        }),
        (_.exports = p),
        c(
          (_) => {
            var c;
            u = ((_) =>
              _.map((_) => {
                if (null !== _ && "object" == typeof _) {
                  if (_[e]) return _;
                  if (_.then) {
                    var c = [];
                    _.then(
                      (e) => {
                        (a[n] = e), r(c), (c = 0);
                      },
                      (e) => {
                        (a[t] = e), r(c), (c = 0);
                      }
                    );
                    var a = {};
                    return (a[e] = (e, n) => (i(c, e), _.catch(n))), a;
                  }
                }
                var u = {};
                return (u[e] = (e) => o(e)), (u[n] = _), u;
              }))(_);
            var a = () =>
                u.map((e) => {
                  if (e[t]) throw e[t];
                  return e[n];
                }),
              f = new Promise((e, n) => {
                ((c = () => e(a)).r = 0), g(u, c, n);
              });
            return c.r ? f : a();
          },
          (e) => (e && s((p[t] = e)), f())
        ),
        (b = !1);
    }),
    (a.d = (e, n) => {
      for (var t in n)
        a.o(n, t) &&
          !a.o(e, t) &&
          Object.defineProperty(e, t, { enumerable: !0, get: n[t] });
    }),
    (a.g = (function () {
      if ("object" == typeof globalThis) return globalThis;
      try {
        return this || new Function("return this")();
      } catch (e) {
        if ("object" == typeof window) return window;
      }
    })()),
    (a.hmd = (e) => (
      (e = Object.create(e)).children || (e.children = []),
      Object.defineProperty(e, "exports", {
        enumerable: !0,
        set: () => {
          throw new Error(
            "ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: " +
              e.id
          );
        },
      }),
      e
    )),
    (a.o = (e, n) => Object.prototype.hasOwnProperty.call(e, n)),
    (a.v = (e, n, t, r) => {
      var o = fetch(a.p + "" + t + ".module.wasm");
      return "function" == typeof WebAssembly.instantiateStreaming
        ? WebAssembly.instantiateStreaming(o, r).then((n) =>
            Object.assign(e, n.instance.exports)
          )
        : o
            .then((e) => e.arrayBuffer())
            .then((e) => WebAssembly.instantiate(e, r))
            .then((n) => Object.assign(e, n.instance.exports));
    }),
    (() => {
      var e;
      a.g.importScripts && (e = a.g.location + "");
      var n = a.g.document;
      if (!e && n && (n.currentScript && (e = n.currentScript.src), !e)) {
        var t = n.getElementsByTagName("script");
        t.length && (e = t[t.length - 1].src);
      }
      if (!e)
        throw new Error(
          "Automatic publicPath is not supported in this browser"
        );
      (e = e
        .replace(/#.*$/, "")
        .replace(/\?.*$/, "")
        .replace(/\/[^\/]+$/, "/")),
        (a.p = e);
    })(),
    a(906);
})();
