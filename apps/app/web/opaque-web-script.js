(() => {
  var t,
    n,
    e,
    r,
    o,
    i,
    _ = {
      950: (t, n, e) => {
        "use strict";
        e.a(t, async (r, o) => {
          try {
            e.d(n, {
              EB: () => I,
              GS: () => G,
              GX: () => Y,
              MF: () => M,
              Mz: () => $,
              Or: () => tt,
              Qu: () => W,
              Ts: () => z,
              Wl: () => q,
              XP: () => X,
              Y8: () => C,
              YM: () => O,
              Yc: () => N,
              Z4: () => L,
              Zu: () => H,
              _8: () => K,
              _G: () => Q,
              bf: () => D,
              cF: () => U,
              cR: () => A,
              eY: () => P,
              h4: () => T,
              kC: () => V,
              m3: () => j,
              m_: () => J,
              oH: () => nt,
              rf: () => Z,
              tL: () => R,
              ug: () => F,
              vG: () => B,
            });
            var i = e(754);
            t = e.hmd(t);
            var _ = r([i]);
            i = (_.then ? (await _)() : _)[0];
            let a = new (
              "undefined" == typeof TextDecoder
                ? (0, t.require)("util").TextDecoder
                : TextDecoder
            )("utf-8", { ignoreBOM: !0, fatal: !0 });
            a.decode();
            let c = null;
            function s() {
              return (
                (null !== c && c.buffer === i.memory.buffer) ||
                  (c = new Uint8Array(i.memory.buffer)),
                c
              );
            }
            function u(t, n) {
              return a.decode(s().subarray(t, t + n));
            }
            const f = new Array(32).fill(void 0);
            f.push(void 0, null, !0, !1);
            let d = f.length;
            function l(t) {
              d === f.length && f.push(f.length + 1);
              const n = d;
              return (d = f[n]), (f[n] = t), n;
            }
            function w(t) {
              return f[t];
            }
            function b(t) {
              t < 36 || ((f[t] = d), (d = t));
            }
            function g(t) {
              const n = w(t);
              return b(t), n;
            }
            let p = 0;
            function h(t, n) {
              const e = n(1 * t.length);
              return s().set(t, e / 1), (p = t.length), e;
            }
            let y = null;
            function m() {
              return (
                (null !== y && y.buffer === i.memory.buffer) ||
                  (y = new Int32Array(i.memory.buffer)),
                y
              );
            }
            function v(t, n) {
              return s().subarray(t / 1, t / 1 + n);
            }
            let x = new (
              "undefined" == typeof TextEncoder
                ? (0, t.require)("util").TextEncoder
                : TextEncoder
            )("utf-8");
            const k =
              "function" == typeof x.encodeInto
                ? function (t, n) {
                    return x.encodeInto(t, n);
                  }
                : function (t, n) {
                    const e = x.encode(t);
                    return n.set(e), { read: t.length, written: e.length };
                  };
            function S(t, n, e) {
              if (void 0 === e) {
                const e = x.encode(t),
                  r = n(e.length);
                return (
                  s()
                    .subarray(r, r + e.length)
                    .set(e),
                  (p = e.length),
                  r
                );
              }
              let r = t.length,
                o = n(r);
              const i = s();
              let _ = 0;
              for (; _ < r; _++) {
                const n = t.charCodeAt(_);
                if (n > 127) break;
                i[o + _] = n;
              }
              if (_ !== r) {
                0 !== _ && (t = t.slice(_)),
                  (o = e(o, r, (r = _ + 3 * t.length)));
                const n = s().subarray(o + _, o + r);
                _ += k(t, n).written;
              }
              return (p = _), o;
            }
            function E(t, n) {
              try {
                return t.apply(this, n);
              } catch (t) {
                i.__wbindgen_exn_store(l(t));
              }
            }
            class j {
              static __wrap(t) {
                const n = Object.create(j.prototype);
                return (n.ptr = t), n;
              }
              __destroy_into_raw() {
                const t = this.ptr;
                return (this.ptr = 0), t;
              }
              free() {
                const t = this.__destroy_into_raw();
                i.__wbg_login_free(t);
              }
              constructor() {
                var t = i.login_new();
                return j.__wrap(t);
              }
              start(t) {
                try {
                  const c = i.__wbindgen_add_to_stack_pointer(-16);
                  var n = S(t, i.__wbindgen_malloc, i.__wbindgen_realloc),
                    e = p;
                  i.login_start(c, this.ptr, n, e);
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
              finish(t) {
                try {
                  const c = i.__wbindgen_add_to_stack_pointer(-16);
                  var n = h(t, i.__wbindgen_malloc),
                    e = p;
                  i.login_finish(c, this.ptr, n, e);
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
              getSessionKey() {
                try {
                  const o = i.__wbindgen_add_to_stack_pointer(-16);
                  i.login_getSessionKey(o, this.ptr);
                  var t = m()[o / 4 + 0],
                    n = m()[o / 4 + 1],
                    e = m()[o / 4 + 2];
                  if (m()[o / 4 + 3]) throw g(e);
                  var r = v(t, n).slice();
                  return i.__wbindgen_free(t, 1 * n), r;
                } finally {
                  i.__wbindgen_add_to_stack_pointer(16);
                }
              }
              getExportKey() {
                try {
                  const o = i.__wbindgen_add_to_stack_pointer(-16);
                  i.login_getExportKey(o, this.ptr);
                  var t = m()[o / 4 + 0],
                    n = m()[o / 4 + 1],
                    e = m()[o / 4 + 2];
                  if (m()[o / 4 + 3]) throw g(e);
                  var r = v(t, n).slice();
                  return i.__wbindgen_free(t, 1 * n), r;
                } finally {
                  i.__wbindgen_add_to_stack_pointer(16);
                }
              }
            }
            class O {
              static __wrap(t) {
                const n = Object.create(O.prototype);
                return (n.ptr = t), n;
              }
              __destroy_into_raw() {
                const t = this.ptr;
                return (this.ptr = 0), t;
              }
              free() {
                const t = this.__destroy_into_raw();
                i.__wbg_registration_free(t);
              }
              constructor() {
                var t = i.registration_new();
                return O.__wrap(t);
              }
              start(t) {
                try {
                  const c = i.__wbindgen_add_to_stack_pointer(-16);
                  var n = S(t, i.__wbindgen_malloc, i.__wbindgen_realloc),
                    e = p;
                  i.registration_start(c, this.ptr, n, e);
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
              finish(t) {
                try {
                  const c = i.__wbindgen_add_to_stack_pointer(-16);
                  var n = h(t, i.__wbindgen_malloc),
                    e = p;
                  i.registration_finish(c, this.ptr, n, e);
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
                  var t = m()[o / 4 + 0],
                    n = m()[o / 4 + 1],
                    e = m()[o / 4 + 2];
                  if (m()[o / 4 + 3]) throw g(e);
                  var r = v(t, n).slice();
                  return i.__wbindgen_free(t, 1 * n), r;
                } finally {
                  i.__wbindgen_add_to_stack_pointer(16);
                }
              }
            }
            function T(t, n) {
              return l(u(t, n));
            }
            function A() {
              return E(function (t, n) {
                w(t).getRandomValues(w(n));
              }, arguments);
            }
            function K() {
              return E(function (t, n, e) {
                w(t).randomFillSync(v(n, e));
              }, arguments);
            }
            function M(t) {
              return l(w(t).process);
            }
            function q(t) {
              const n = w(t);
              return "object" == typeof n && null !== n;
            }
            function C(t) {
              return l(w(t).versions);
            }
            function F(t) {
              g(t);
            }
            function G(t) {
              return l(w(t).node);
            }
            function P(t) {
              return "string" == typeof w(t);
            }
            function Y() {
              return E(function (t, n) {
                return l(e(989)(u(t, n)));
              }, arguments);
            }
            function U(t) {
              return l(w(t).crypto);
            }
            function B(t) {
              return l(w(t).msCrypto);
            }
            function D(t, n) {
              return l(new Function(u(t, n)));
            }
            function L() {
              return E(function (t, n) {
                return l(w(t).call(w(n)));
              }, arguments);
            }
            function R() {
              return E(function () {
                return l(self.self);
              }, arguments);
            }
            function W() {
              return E(function () {
                return l(window.window);
              }, arguments);
            }
            function I() {
              return E(function () {
                return l(globalThis.globalThis);
              }, arguments);
            }
            function N() {
              return E(function () {
                return l(e.g.global);
              }, arguments);
            }
            function X(t) {
              return void 0 === w(t);
            }
            function Z(t) {
              return l(w(t).buffer);
            }
            function z(t) {
              return l(new Uint8Array(w(t)));
            }
            function $(t, n, e) {
              w(t).set(w(n), e >>> 0);
            }
            function H(t) {
              return w(t).length;
            }
            function Q(t) {
              return l(new Uint8Array(t >>> 0));
            }
            function V(t, n, e) {
              return l(w(t).subarray(n >>> 0, e >>> 0));
            }
            function J(t) {
              return l(w(t));
            }
            function tt(t, n) {
              throw new Error(u(t, n));
            }
            function nt() {
              return l(i.memory);
            }
            o();
          } catch (et) {
            o(et);
          }
        });
      },
      989: (t) => {
        function n(t) {
          var n = new Error("Cannot find module '" + t + "'");
          throw ((n.code = "MODULE_NOT_FOUND"), n);
        }
        (n.keys = () => []), (n.resolve = n), (n.id = 989), (t.exports = n);
      },
      906: (t, n, e) => {
        "use strict";
        e.a(t, async (t, n) => {
          try {
            var r = e(950),
              o = t([r]);
            r = (o.then ? (await o)() : o)[0];
            var i = function (t) {
                return btoa(String.fromCharCode.apply(null, t));
              },
              _ = function (t) {
                return Uint8Array.from(atob(t), function (t) {
                  return t.charCodeAt(0);
                });
              },
              a = new r.YM(),
              c = new r.m3();
            (window._opaque = {}),
              (window._opaque.registerInitialize = function (t) {
                var n = a.start(t);
                return i(n);
              }),
              (window._opaque.finishRegistration = function (t) {
                var n = a.finish(_(t));
                return i(n);
              }),
              (window._opaque.startLogin = function (t) {
                var n = c.start(t);
                return i(n);
              }),
              (window._opaque.finishLogin = function (t) {
                var n = c.finish(_(t));
                return JSON.stringify({
                  sessionKey: i(c.getSessionKey()),
                  exportKey: i(c.getExportKey()),
                  response: i(n),
                });
              }),
              n();
          } catch (t) {
            n(t);
          }
        });
      },
      754: (t, n, e) => {
        "use strict";
        e.a(
          t,
          async (r, o) => {
            try {
              var i,
                _ = r([(i = e(950))]),
                [i] = _.then ? (await _)() : _;
              await e.v(n, t.id, "31e6924a2d41339527e6", {
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
            } catch (t) {
              o(t);
            }
          },
          1
        );
      },
    },
    a = {};
  function c(t) {
    var n = a[t];
    if (void 0 !== n) return n.exports;
    var e = (a[t] = { id: t, loaded: !1, exports: {} });
    return _[t](e, e.exports, c), (e.loaded = !0), e.exports;
  }
  (t =
    "function" == typeof Symbol ? Symbol("webpack then") : "__webpack_then__"),
    (n =
      "function" == typeof Symbol
        ? Symbol("webpack exports")
        : "__webpack_exports__"),
    (e =
      "function" == typeof Symbol
        ? Symbol("webpack error")
        : "__webpack_error__"),
    (r = (t) => {
      t && (t.forEach((t) => t.r--), t.forEach((t) => (t.r-- ? t.r++ : t())));
    }),
    (o = (t) => !--t.r && t()),
    (i = (t, n) => (t ? t.push(n) : o(n))),
    (c.a = (_, a, c) => {
      var s,
        u,
        f,
        d = c && [],
        l = _.exports,
        w = !0,
        b = !1,
        g = (n, e, r) => {
          b ||
            ((b = !0),
            (e.r += n.length),
            n.map((n, o) => n[t](e, r)),
            (b = !1));
        },
        p = new Promise((t, n) => {
          (f = n), (u = () => (t(l), r(d), (d = 0)));
        });
      (p[n] = l),
        (p[t] = (t, n) => {
          if (w) return o(t);
          s && g(s, t, n), i(d, t), p.catch(n);
        }),
        (_.exports = p),
        a(
          (_) => {
            var a;
            s = ((_) =>
              _.map((_) => {
                if (null !== _ && "object" == typeof _) {
                  if (_[t]) return _;
                  if (_.then) {
                    var a = [];
                    _.then(
                      (t) => {
                        (c[n] = t), r(a), (a = 0);
                      },
                      (t) => {
                        (c[e] = t), r(a), (a = 0);
                      }
                    );
                    var c = {};
                    return (c[t] = (t, n) => (i(a, t), _.catch(n))), c;
                  }
                }
                var s = {};
                return (s[t] = (t) => o(t)), (s[n] = _), s;
              }))(_);
            var c = () =>
                s.map((t) => {
                  if (t[e]) throw t[e];
                  return t[n];
                }),
              u = new Promise((t, n) => {
                ((a = () => t(c)).r = 0), g(s, a, n);
              });
            return a.r ? u : c();
          },
          (t) => (t && f((p[e] = t)), u())
        ),
        (w = !1);
    }),
    (c.d = (t, n) => {
      for (var e in n)
        c.o(n, e) &&
          !c.o(t, e) &&
          Object.defineProperty(t, e, { enumerable: !0, get: n[e] });
    }),
    (c.g = (function () {
      if ("object" == typeof globalThis) return globalThis;
      try {
        return this || new Function("return this")();
      } catch (t) {
        if ("object" == typeof window) return window;
      }
    })()),
    (c.hmd = (t) => (
      (t = Object.create(t)).children || (t.children = []),
      Object.defineProperty(t, "exports", {
        enumerable: !0,
        set: () => {
          throw new Error(
            "ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: " +
              t.id
          );
        },
      }),
      t
    )),
    (c.o = (t, n) => Object.prototype.hasOwnProperty.call(t, n)),
    (c.v = (t, n, e, r) => {
      var o = fetch(c.p + "" + e + ".module.wasm");
      return "function" == typeof WebAssembly.instantiateStreaming
        ? WebAssembly.instantiateStreaming(o, r).then((n) =>
            Object.assign(t, n.instance.exports)
          )
        : o
            .then((t) => t.arrayBuffer())
            .then((t) => WebAssembly.instantiate(t, r))
            .then((n) => Object.assign(t, n.instance.exports));
    }),
    (() => {
      var t;
      c.g.importScripts && (t = c.g.location + "");
      var n = c.g.document;
      if (!t && n && (n.currentScript && (t = n.currentScript.src), !t)) {
        var e = n.getElementsByTagName("script");
        e.length && (t = e[e.length - 1].src);
      }
      if (!t)
        throw new Error(
          "Automatic publicPath is not supported in this browser"
        );
      (t = t
        .replace(/#.*$/, "")
        .replace(/\?.*$/, "")
        .replace(/\/[^\/]+$/, "/")),
        (c.p = t);
    })(),
    c(906);
})();
