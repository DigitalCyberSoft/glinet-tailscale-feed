module.exports = function(t) {
  var e = {};

  function i(n) {
    if (e[n]) return e[n].exports;
    var a = e[n] = {
      i: n,
      l: !1,
      exports: {}
    };
    return t[n].call(a.exports, a, a.exports, i), a.l = !0, a.exports
  }
  return i.m = t, i.c = e, i.d = function(t, e, n) {
    i.o(t, e) || Object.defineProperty(t, e, {
      enumerable: !0,
      get: n
    })
  }, i.r = function(t) {
    "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, {
      value: "Module"
    }), Object.defineProperty(t, "__esModule", {
      value: !0
    })
  }, i.t = function(t, e) {
    if (1 & e && (t = i(t)), 8 & e) return t;
    if (4 & e && "object" == typeof t && t && t.__esModule) return t;
    var n = Object.create(null);
    if (i.r(n), Object.defineProperty(n, "default", {
        enumerable: !0,
        value: t
      }), 2 & e && "string" != typeof t)
      for (var a in t) i.d(n, a, function(e) {
        return t[e]
      }.bind(null, a));
    return n
  }, i.n = function(t) {
    var e = t && t.__esModule ? function() {
      return t.default
    } : function() {
      return t
    };
    return i.d(e, "a", e), e
  }, i.o = function(t, e) {
    return Object.prototype.hasOwnProperty.call(t, e)
  }, i.p = "", i(i.s = "fb15")
}({
  "24fb": function(t, e, i) {
    "use strict";

    function n(t, e) {
      var i = t[1] || "",
        n = t[3];
      if (!n) return i;
      if (e && "function" == typeof btoa) {
        var a = function(t) {
            var e = btoa(unescape(encodeURIComponent(JSON.stringify(t)))),
              i = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(e);
            return "/*# ".concat(i, " */")
          }(n),
          s = n.sources.map((function(t) {
            return "/*# sourceURL=".concat(n.sourceRoot || "").concat(t, " */")
          }));
        return [i].concat(s).concat([a]).join("\n")
      }
      return [i].join("\n")
    }
    t.exports = function(t) {
      var e = [];
      return e.toString = function() {
        return this.map((function(e) {
          var i = n(e, t);
          return e[2] ? "@media ".concat(e[2], " {").concat(i, "}") : i
        })).join("")
      }, e.i = function(t, i, n) {
        "string" == typeof t && (t = [
          [null, t, ""]
        ]);
        var a = {};
        if (n)
          for (var s = 0; s < this.length; s++) {
            var o = this[s][0];
            null != o && (a[o] = !0)
          }
        for (var r = 0; r < t.length; r++) {
          var l = [].concat(t[r]);
          n && a[l[0]] || (i && (l[2] ? l[2] = "".concat(i, " and ").concat(l[2]) : l[2] = i), e.push(l))
        }
      }, e
    }
  },
  "2cc0": function(t, e, i) {
    var n = i("c59f");
    n.__esModule && (n = n.default), "string" == typeof n && (n = [
      [t.i, n, ""]
    ]), n.locals && (t.exports = n.locals), (0, i("499e").default)("1d680e68", n, !0, {
      sourceMap: !1,
      shadowMode: !1
    })
  },
  "2f62": function(t, e, i) {
    "use strict";
    (function(t) {
      i.d(e, "a", (function() {
        return x
      })), i.d(e, "b", (function() {
        return y
      }));
      var n = ("undefined" != typeof window ? window : void 0 !== t ? t : {}).__VUE_DEVTOOLS_GLOBAL_HOOK__;

      function a(t) {
        n && (t._devtoolHook = n, n.emit("vuex:init", t), n.on("vuex:travel-to-state", (function(e) {
          t.replaceState(e)
        })), t.subscribe((function(t, e) {
          n.emit("vuex:mutation", t, e)
        }), {
          prepend: !0
        }), t.subscribeAction((function(t, e) {
          n.emit("vuex:action", t, e)
        }), {
          prepend: !0
        }))
      }

      function s(t, e) {
        Object.keys(t).forEach((function(i) {
          return e(t[i], i)
        }))
      }

      function o(t) {
        return null !== t && "object" == typeof t
      }
      var r = function(t, e) {
          this.runtime = e, this._children = Object.create(null), this._rawModule = t;
          var i = t.state;
          this.state = ("function" == typeof i ? i() : i) || {}
        },
        l = {
          namespaced: {
            configurable: !0
          }
        };
      l.namespaced.get = function() {
        return !!this._rawModule.namespaced
      }, r.prototype.addChild = function(t, e) {
        this._children[t] = e
      }, r.prototype.removeChild = function(t) {
        delete this._children[t]
      }, r.prototype.getChild = function(t) {
        return this._children[t]
      }, r.prototype.hasChild = function(t) {
        return t in this._children
      }, r.prototype.update = function(t) {
        this._rawModule.namespaced = t.namespaced, t.actions && (this._rawModule.actions = t.actions), t.mutations && (this._rawModule.mutations = t.mutations), t.getters && (this._rawModule.getters = t.getters)
      }, r.prototype.forEachChild = function(t) {
        s(this._children, t)
      }, r.prototype.forEachGetter = function(t) {
        this._rawModule.getters && s(this._rawModule.getters, t)
      }, r.prototype.forEachAction = function(t) {
        this._rawModule.actions && s(this._rawModule.actions, t)
      }, r.prototype.forEachMutation = function(t) {
        this._rawModule.mutations && s(this._rawModule.mutations, t)
      }, Object.defineProperties(r.prototype, l);
      var c, u = function(t) {
        this.register([], t, !1)
      };

      function d(t, e, i) {
        if (e.update(i), i.modules)
          for (var n in i.modules) {
            if (!e.getChild(n)) return;
            d(t.concat(n), e.getChild(n), i.modules[n])
          }
      }
      u.prototype.get = function(t) {
        return t.reduce((function(t, e) {
          return t.getChild(e)
        }), this.root)
      }, u.prototype.getNamespace = function(t) {
        var e = this.root;
        return t.reduce((function(t, i) {
          return t + ((e = e.getChild(i)).namespaced ? i + "/" : "")
        }), "")
      }, u.prototype.update = function(t) {
        d([], this.root, t)
      }, u.prototype.register = function(t, e, i) {
        var n = this;
        void 0 === i && (i = !0);
        var a = new r(e, i);
        0 === t.length ? this.root = a : this.get(t.slice(0, -1)).addChild(t[t.length - 1], a);
        e.modules && s(e.modules, (function(e, a) {
          n.register(t.concat(a), e, i)
        }))
      }, u.prototype.unregister = function(t) {
        var e = this.get(t.slice(0, -1)),
          i = t[t.length - 1],
          n = e.getChild(i);
        n && n.runtime && e.removeChild(i)
      }, u.prototype.isRegistered = function(t) {
        var e = this.get(t.slice(0, -1)),
          i = t[t.length - 1];
        return !!e && e.hasChild(i)
      };
      var p = function(t) {
          var e = this;
          void 0 === t && (t = {}), !c && "undefined" != typeof window && window.Vue && w(window.Vue);
          var i = t.plugins;
          void 0 === i && (i = []);
          var n = t.strict;
          void 0 === n && (n = !1), this._committing = !1, this._actions = Object.create(null), this._actionSubscribers = [], this._mutations = Object.create(null), this._wrappedGetters = Object.create(null), this._modules = new u(t), this._modulesNamespaceMap = Object.create(null), this._subscribers = [], this._watcherVM = new c, this._makeLocalGettersCache = Object.create(null);
          var s = this,
            o = this.dispatch,
            r = this.commit;
          this.dispatch = function(t, e) {
            return o.call(s, t, e)
          }, this.commit = function(t, e, i) {
            return r.call(s, t, e, i)
          }, this.strict = n;
          var l = this._modules.root.state;
          m(this, l, [], this._modules.root), g(this, l), i.forEach((function(t) {
            return t(e)
          })), (void 0 !== t.devtools ? t.devtools : c.config.devtools) && a(this)
        },
        f = {
          state: {
            configurable: !0
          }
        };

      function h(t, e, i) {
        return e.indexOf(t) < 0 && (i && i.prepend ? e.unshift(t) : e.push(t)),
          function() {
            var i = e.indexOf(t);
            i > -1 && e.splice(i, 1)
          }
      }

      function _(t, e) {
        t._actions = Object.create(null), t._mutations = Object.create(null), t._wrappedGetters = Object.create(null), t._modulesNamespaceMap = Object.create(null);
        var i = t.state;
        m(t, i, [], t._modules.root, !0), g(t, i, e)
      }

      function g(t, e, i) {
        var n = t._vm;
        t.getters = {}, t._makeLocalGettersCache = Object.create(null);
        var a = t._wrappedGetters,
          o = {};
        s(a, (function(e, i) {
          o[i] = function(t, e) {
            return function() {
              return t(e)
            }
          }(e, t), Object.defineProperty(t.getters, i, {
            get: function() {
              return t._vm[i]
            },
            enumerable: !0
          })
        }));
        var r = c.config.silent;
        c.config.silent = !0, t._vm = new c({
          data: {
            $$state: e
          },
          computed: o
        }), c.config.silent = r, t.strict && function(t) {
          t._vm.$watch((function() {
            return this._data.$$state
          }), (function() {}), {
            deep: !0,
            sync: !0
          })
        }(t), n && (i && t._withCommit((function() {
          n._data.$$state = null
        })), c.nextTick((function() {
          return n.$destroy()
        })))
      }

      function m(t, e, i, n, a) {
        var s = !i.length,
          o = t._modules.getNamespace(i);
        if (n.namespaced && (t._modulesNamespaceMap[o], t._modulesNamespaceMap[o] = n), !s && !a) {
          var r = b(e, i.slice(0, -1)),
            l = i[i.length - 1];
          t._withCommit((function() {
            c.set(r, l, n.state)
          }))
        }
        var u = n.context = function(t, e, i) {
          var n = "" === e,
            a = {
              dispatch: n ? t.dispatch : function(i, n, a) {
                var s = $(i, n, a),
                  o = s.payload,
                  r = s.options,
                  l = s.type;
                return r && r.root || (l = e + l), t.dispatch(l, o)
              },
              commit: n ? t.commit : function(i, n, a) {
                var s = $(i, n, a),
                  o = s.payload,
                  r = s.options,
                  l = s.type;
                r && r.root || (l = e + l), t.commit(l, o, r)
              }
            };
          return Object.defineProperties(a, {
            getters: {
              get: n ? function() {
                return t.getters
              } : function() {
                return function(t, e) {
                  if (!t._makeLocalGettersCache[e]) {
                    var i = {},
                      n = e.length;
                    Object.keys(t.getters).forEach((function(a) {
                      if (a.slice(0, n) === e) {
                        var s = a.slice(n);
                        Object.defineProperty(i, s, {
                          get: function() {
                            return t.getters[a]
                          },
                          enumerable: !0
                        })
                      }
                    })), t._makeLocalGettersCache[e] = i
                  }
                  return t._makeLocalGettersCache[e]
                }(t, e)
              }
            },
            state: {
              get: function() {
                return b(t.state, i)
              }
            }
          }), a
        }(t, o, i);
        n.forEachMutation((function(e, i) {
          ! function(t, e, i, n) {
            var a = t._mutations[e] || (t._mutations[e] = []);
            a.push((function(e) {
              i.call(t, n.state, e)
            }))
          }(t, o + i, e, u)
        })), n.forEachAction((function(e, i) {
          var n = e.root ? i : o + i,
            a = e.handler || e;
          v(t, n, a, u)
        })), n.forEachGetter((function(e, i) {
          ! function(t, e, i, n) {
            t._wrappedGetters[e] || (t._wrappedGetters[e] = function(t) {
              return i(n.state, n.getters, t.state, t.getters)
            })
          }(t, o + i, e, u)
        })), n.forEachChild((function(n, s) {
          m(t, e, i.concat(s), n, a)
        }))
      }

      function v(t, e, i, n) {
        (t._actions[e] || (t._actions[e] = [])).push((function(e) {
          var a = i.call(t, {
            dispatch: n.dispatch,
            commit: n.commit,
            getters: n.getters,
            state: n.state,
            rootGetters: t.getters,
            rootState: t.state
          }, e);
          return function(t) {
            return t && "function" == typeof t.then
          }(a) || (a = Promise.resolve(a)), t._devtoolHook ? a.catch((function(e) {
            throw t._devtoolHook.emit("vuex:error", e), e
          })) : a
        }))
      }

      function b(t, e) {
        return e.reduce((function(t, e) {
          return t[e]
        }), t)
      }

      function $(t, e, i) {
        return o(t) && t.type && (i = e, e = t, t = t.type), {
          type: t,
          payload: e,
          options: i
        }
      }

      function w(t) {
        c && t === c ||
          /*!
           * vuex v3.6.2
           * (c) 2021 Evan You
           * @license MIT
           */
          function(t) {
            if (Number(t.version.split(".")[0]) >= 2) t.mixin({
              beforeCreate: i
            });
            else {
              var e = t.prototype._init;
              t.prototype._init = function(t) {
                void 0 === t && (t = {}), t.init = t.init ? [i].concat(t.init) : i, e.call(this, t)
              }
            }

            function i() {
              var t = this.$options;
              t.store ? this.$store = "function" == typeof t.store ? t.store() : t.store : t.parent && t.parent.$store && (this.$store = t.parent.$store)
            }
          }(c = t)
      }
      f.state.get = function() {
        return this._vm._data.$$state
      }, f.state.set = function(t) {}, p.prototype.commit = function(t, e, i) {
        var n = this,
          a = $(t, e, i),
          s = a.type,
          o = a.payload,
          r = (a.options, {
            type: s,
            payload: o
          }),
          l = this._mutations[s];
        l && (this._withCommit((function() {
          l.forEach((function(t) {
            t(o)
          }))
        })), this._subscribers.slice().forEach((function(t) {
          return t(r, n.state)
        })))
      }, p.prototype.dispatch = function(t, e) {
        var i = this,
          n = $(t, e),
          a = n.type,
          s = n.payload,
          o = {
            type: a,
            payload: s
          },
          r = this._actions[a];
        if (r) {
          try {
            this._actionSubscribers.slice().filter((function(t) {
              return t.before
            })).forEach((function(t) {
              return t.before(o, i.state)
            }))
          } catch (t) {}
          var l = r.length > 1 ? Promise.all(r.map((function(t) {
            return t(s)
          }))) : r[0](s);
          return new Promise((function(t, e) {
            l.then((function(e) {
              try {
                i._actionSubscribers.filter((function(t) {
                  return t.after
                })).forEach((function(t) {
                  return t.after(o, i.state)
                }))
              } catch (t) {}
              t(e)
            }), (function(t) {
              try {
                i._actionSubscribers.filter((function(t) {
                  return t.error
                })).forEach((function(e) {
                  return e.error(o, i.state, t)
                }))
              } catch (t) {}
              e(t)
            }))
          }))
        }
      }, p.prototype.subscribe = function(t, e) {
        return h(t, this._subscribers, e)
      }, p.prototype.subscribeAction = function(t, e) {
        return h("function" == typeof t ? {
          before: t
        } : t, this._actionSubscribers, e)
      }, p.prototype.watch = function(t, e, i) {
        var n = this;
        return this._watcherVM.$watch((function() {
          return t(n.state, n.getters)
        }), e, i)
      }, p.prototype.replaceState = function(t) {
        var e = this;
        this._withCommit((function() {
          e._vm._data.$$state = t
        }))
      }, p.prototype.registerModule = function(t, e, i) {
        void 0 === i && (i = {}), "string" == typeof t && (t = [t]), this._modules.register(t, e), m(this, this.state, t, this._modules.get(t), i.preserveState), g(this, this.state)
      }, p.prototype.unregisterModule = function(t) {
        var e = this;
        "string" == typeof t && (t = [t]), this._modules.unregister(t), this._withCommit((function() {
          var i = b(e.state, t.slice(0, -1));
          c.delete(i, t[t.length - 1])
        })), _(this)
      }, p.prototype.hasModule = function(t) {
        return "string" == typeof t && (t = [t]), this._modules.isRegistered(t)
      }, p.prototype.hotUpdate = function(t) {
        this._modules.update(t), _(this, !0)
      }, p.prototype._withCommit = function(t) {
        var e = this._committing;
        this._committing = !0, t(), this._committing = e
      }, Object.defineProperties(p.prototype, f);
      var y = S((function(t, e) {
          var i = {};
          return C(e).forEach((function(e) {
            var n = e.key,
              a = e.val;
            i[n] = function() {
              var e = this.$store.state,
                i = this.$store.getters;
              if (t) {
                var n = k(this.$store, "mapState", t);
                if (!n) return;
                e = n.context.state, i = n.context.getters
              }
              return "function" == typeof a ? a.call(this, e, i) : e[a]
            }, i[n].vuex = !0
          })), i
        })),
        x = S((function(t, e) {
          var i = {};
          return C(e).forEach((function(e) {
            var n = e.key,
              a = e.val;
            i[n] = function() {
              for (var e = [], i = arguments.length; i--;) e[i] = arguments[i];
              var n = this.$store.commit;
              if (t) {
                var s = k(this.$store, "mapMutations", t);
                if (!s) return;
                n = s.context.commit
              }
              return "function" == typeof a ? a.apply(this, [n].concat(e)) : n.apply(this.$store, [a].concat(e))
            }
          })), i
        }));

      function C(t) {
        return function(t) {
          return Array.isArray(t) || o(t)
        }(t) ? Array.isArray(t) ? t.map((function(t) {
          return {
            key: t,
            val: t
          }
        })) : Object.keys(t).map((function(e) {
          return {
            key: e,
            val: t[e]
          }
        })) : []
      }

      function S(t) {
        return function(e, i) {
          return "string" != typeof e ? (i = e, e = "") : "/" !== e.charAt(e.length - 1) && (e += "/"), t(e, i)
        }
      }

      function k(t, e, i) {
        return t._modulesNamespaceMap[i]
      }
      S((function(t, e) {
        var i = {};
        return C(e).forEach((function(e) {
          var n = e.key,
            a = e.val;
          a = t + a, i[n] = function() {
            if (!t || k(this.$store, "mapGetters", t)) return this.$store.getters[a]
          }, i[n].vuex = !0
        })), i
      })), S((function(t, e) {
        var i = {};
        return C(e).forEach((function(e) {
          var n = e.key,
            a = e.val;
          i[n] = function() {
            for (var e = [], i = arguments.length; i--;) e[i] = arguments[i];
            var n = this.$store.dispatch;
            if (t) {
              var s = k(this.$store, "mapActions", t);
              if (!s) return;
              n = s.context.dispatch
            }
            return "function" == typeof a ? a.apply(this, [n].concat(e)) : n.apply(this.$store, [a].concat(e))
          }
        })), i
      }))
    }).call(this, i("c8ba"))
  },
  "499e": function(t, e, i) {
    "use strict";

    function n(t, e) {
      for (var i = [], n = {}, a = 0; a < e.length; a++) {
        var s = e[a],
          o = s[0],
          r = {
            id: t + ":" + a,
            css: s[1],
            media: s[2],
            sourceMap: s[3]
          };
        n[o] ? n[o].parts.push(r) : i.push(n[o] = {
          id: o,
          parts: [r]
        })
      }
      return i
    }
    i.r(e), i.d(e, "default", (function() {
      return h
    }));
    var a = "undefined" != typeof document;
    if ("undefined" != typeof DEBUG && DEBUG && !a) throw new Error("vue-style-loader cannot be used in a non-browser environment. Use { target: 'node' } in your Webpack config to indicate a server-rendering environment.");
    var s = {},
      o = a && (document.head || document.getElementsByTagName("head")[0]),
      r = null,
      l = 0,
      c = !1,
      u = function() {},
      d = null,
      p = "data-vue-ssr-id",
      f = "undefined" != typeof navigator && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase());

    function h(t, e, i, a) {
      c = i, d = a || {};
      var o = n(t, e);
      return _(o),
        function(e) {
          for (var i = [], a = 0; a < o.length; a++) {
            var r = o[a],
              l = s[r.id];
            l.refs--, i.push(l)
          }
          for (e ? _(o = n(t, e)) : o = [], a = 0; a < i.length; a++)
            if (0 === (l = i[a]).refs) {
              for (var c = 0; c < l.parts.length; c++) l.parts[c]();
              delete s[l.id]
            }
        }
    }

    function _(t) {
      for (var e = 0; e < t.length; e++) {
        var i = t[e],
          n = s[i.id];
        if (n) {
          n.refs++;
          for (var a = 0; a < n.parts.length; a++) n.parts[a](i.parts[a]);
          for (; a < i.parts.length; a++) n.parts.push(m(i.parts[a]));
          n.parts.length > i.parts.length && (n.parts.length = i.parts.length)
        } else {
          var o = [];
          for (a = 0; a < i.parts.length; a++) o.push(m(i.parts[a]));
          s[i.id] = {
            id: i.id,
            refs: 1,
            parts: o
          }
        }
      }
    }

    function g() {
      var t = document.createElement("style");
      return t.type = "text/css", o.appendChild(t), t
    }

    function m(t) {
      var e, i, n = document.querySelector("style[" + p + '~="' + t.id + '"]');
      if (n) {
        if (c) return u;
        n.parentNode.removeChild(n)
      }
      if (f) {
        var a = l++;
        n = r || (r = g()), e = b.bind(null, n, a, !1), i = b.bind(null, n, a, !0)
      } else n = g(), e = $.bind(null, n), i = function() {
        n.parentNode.removeChild(n)
      };
      return e(t),
        function(n) {
          if (n) {
            if (n.css === t.css && n.media === t.media && n.sourceMap === t.sourceMap) return;
            e(t = n)
          } else i()
        }
    }
    var v = function() {
      var t = [];
      return function(e, i) {
        return t[e] = i, t.filter(Boolean).join("\n")
      }
    }();

    function b(t, e, i, n) {
      var a = i ? "" : n.css;
      if (t.styleSheet) t.styleSheet.cssText = v(e, a);
      else {
        var s = document.createTextNode(a),
          o = t.childNodes;
        o[e] && t.removeChild(o[e]), o.length ? t.insertBefore(s, o[e]) : t.appendChild(s)
      }
    }

    function $(t, e) {
      var i = e.css,
        n = e.media,
        a = e.sourceMap;
      if (n && t.setAttribute("media", n), d.ssrId && t.setAttribute(p, e.id), a && (i += "\n/*# sourceURL=" + a.sources[0] + " */", i += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(a)))) + " */"), t.styleSheet) t.styleSheet.cssText = i;
      else {
        for (; t.firstChild;) t.removeChild(t.firstChild);
        t.appendChild(document.createTextNode(i))
      }
    }
  },
  "7e16": function(t, e, i) {
    "use strict";
    i("2cc0")
  },
  c59f: function(t, e, i) {
    (e = i("24fb")(!1)).push([t.i, ".tailscale-wrapper[data-v-6329ebb0]{padding:20px 0}.tailscale-wrapper .main[data-v-6329ebb0]{max-width:635px}.tailscale-wrapper .main .desc[data-v-6329ebb0]{display:flex;align-items:center;font-size:14px;padding:14px 15px;background-color:var(--info-background);color:var(--info);border-radius:5px}.tailscale-wrapper .main .desc .iconfont[data-v-6329ebb0]{font-size:14px;margin-right:14px}.tailscale-wrapper .main .desc p[data-v-6329ebb0]{line-height:1.5}.tailscale-wrapper .main .status-tips[data-v-6329ebb0]{margin-top:10px;font-size:14px;padding:14px 15px;border-radius:5px}.tailscale-wrapper .main .status-tips.is-success[data-v-6329ebb0]{background-color:var(--secondary-background);color:var(--secondary)}.tailscale-wrapper .main .status-tips.is-warning[data-v-6329ebb0]{background-color:var(--warning-background);color:var(--warning)}.tailscale-wrapper .main .tailscale-config>li[data-v-6329ebb0]{min-height:50px;display:flex;align-items:center;justify-content:space-between;padding:14px 15px;border-bottom:1px solid var(--divider);font-size:14px}.tailscale-wrapper .main .tailscale-config>li>div[data-v-6329ebb0]:first-child{flex:1;color:var(--text-weak)}.tailscale-wrapper .main .tailscale-config>li>div:first-child .iconfont[data-v-6329ebb0]{font-size:14px}.tailscale-wrapper .main .tailscale-config>li>div:first-child .icon-warning[data-v-6329ebb0]{color:var(--warning)}.tailscale-wrapper .main .tailscale-config>li>div[data-v-6329ebb0]:last-child{min-width:100px;max-width:200px;width:70%;color:var(--text-regular);text-align:right}.tailscale-wrapper .main .tailscale-config>li>div:last-child.account-info[data-v-6329ebb0]{max-width:320px;display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap}.tailscale-wrapper .main .tailscale-config>li>div:last-child.node-list-warpper[data-v-6329ebb0]{min-width:160px;max-width:220px;display:flex;align-items:center}.tailscale-wrapper .main .tailscale-config>li>div:last-child.node-list-warpper .icon-redo-alt[data-v-6329ebb0]{width:35px;height:35px;text-align:center;line-height:35px;font-size:14px;color:var(--icon);margin-right:4px;border-radius:5px;cursor:pointer}.tailscale-wrapper .main .tailscale-config>li>div:last-child.node-list-warpper .icon-redo-alt[data-v-6329ebb0]:hover{background-color:var(--icon-active)}.tailscale-wrapper .main .tailscale-config>li>div:last-child.node-list-warpper .is-error[data-v-6329ebb0] .el-input__inner{border-color:var(--error)}.tailscale-wrapper .main .tailscale-config>li>div .text-btn[data-v-6329ebb0]{padding-left:6px}.tailscale-wrapper .btns[data-v-6329ebb0]{display:flex;justify-content:center;align-items:center;margin-top:20px}.tailscale-wrapper .btns .btn-item[data-v-6329ebb0]{min-width:124px;height:36px}.tailscale-wrapper .auth-dialog[data-v-6329ebb0] .el-dialog,.tailscale-wrapper .exit-node-dialog[data-v-6329ebb0] .el-dialog{max-width:420px;min-width:200px}.tailscale-wrapper .auth-dialog .dialog-main[data-v-6329ebb0],.tailscale-wrapper .exit-node-dialog .dialog-main[data-v-6329ebb0]{min-height:100px}", ""]), t.exports = e
  },
  c8ba: function(t, e) {
    var i;
    i = function() {
      return this
    }();
    try {
      i = i || new Function("return this")()
    } catch (t) {
      "object" == typeof window && (i = window)
    }
    t.exports = i
  },
  fb15: function(t, e, i) {
    "use strict";
    if (i.r(e), "undefined" != typeof window) {
      var n = window.document.currentScript,
        a = n && n.src.match(/(.+\/)[^/]+\.js(\?.*)?$/);
      a && (i.p = a[1])
    }
    var s = i("2f62");
    const o = window.$request,
      r = {
        getTailscaleStatus: function() {
          return o("call", [decodeURIComponent(((document.cookie.match(/(?:^|;\s*)Admin-Token=([^;]*)/) || [])[1] || "")), "tailscale", "get_status", {}])
        },
        getAuthUrl: function() {
          return o("call", [decodeURIComponent(((document.cookie.match(/(?:^|;\s*)Admin-Token=([^;]*)/) || [])[1] || "")), "tailscale", "get_auth_url", {}], {
            timeout: 6e4
          })
        },
        tailscaleUnbind: function() {
          return o("call", [decodeURIComponent(((document.cookie.match(/(?:^|;\s*)Admin-Token=([^;]*)/) || [])[1] || "")), "tailscale", "logout", {}])
        },
        getTailscaleConfig: function() {
          return o("call", [decodeURIComponent(((document.cookie.match(/(?:^|;\s*)Admin-Token=([^;]*)/) || [])[1] || "")), "tailscale", "get_config", {}])
        },
        setTailscaleConfig: function(t) {
          return o("call", [decodeURIComponent(((document.cookie.match(/(?:^|;\s*)Admin-Token=([^;]*)/) || [])[1] || "")), "tailscale", "set_config", t])
        },
        getNodeList: function() {
          return o("call", [decodeURIComponent(((document.cookie.match(/(?:^|;\s*)Admin-Token=([^;]*)/) || [])[1] || "")), "tailscale", "get_exit_node_list", {}])
        }
      };
    var l = r,
      c = {
        name: "tailscaleview",
        data: () => ({
          status: null,
          login_name: "",
          address_v4: "",
          lan_ip: "",
          dns: [],
          config: {
            enabled: !1,
            lan_enabled: !1,
            wan_enabled: !1,
            lan_gateway: !1,
            keep_on_upgrade: !1,
            advertise_exit_node: !1,
            killswitch: !0,
            manual: !1,
            exit_node_ip: ""
          },
          oldConfig: {
            enabled: !1,
            lan_enabled: !1,
            wan_enabled: !1,
            manual: !1,
            exit_node_ip: ""
          },
          exitNodeList: [],
          exitNodeIpErr: !1,
          getStatusTimeId: null,
          waitTimeId: null,
          auth_url: "",
          showAuthUrl: !1,
          showExitNodeWarning: !1
        }),
        watch: {
          status: {
            handler(t) {
              if (this.systemStatus.service) {
                const e = this.systemStatus.service.find((t => "tailscale" === t.name));
                e && (e.status = this.oldConfig.enabled ? 3 === t ? 1 : 2 : 0)
              }
              this.getSystemStatusNow(5e3)
            }
          }
        },
        computed: {
          ...Object(s.b)(["systemStatus"]),
          applyDisabled() {
            return this.config.enabled === this.oldConfig.enabled && this.config.lan_enabled === this.oldConfig.lan_enabled && this.config.wan_enabled === this.oldConfig.wan_enabled && this.config.manual === this.oldConfig.manual && this.config.exit_node_ip === this.oldConfig.exit_node_ip && this.config.lan_gateway === this.oldConfig.lan_gateway && this.config.advertise_exit_node === this.oldConfig.advertise_exit_node && this.config.keep_on_upgrade === this.oldConfig.keep_on_upgrade && this.config.killswitch === this.oldConfig.killswitch
          },
          hasDnsWarning() {
            return this.dns.every((t => this.$regTest.checkPrivateIpSubnet(t)))
          }
        },
        created() {
          this.getConfig()
        },
        methods: {
          ...Object(s.a)(["changeShowDisableMask", "getSystemStatusNow"]),
          getStatusTimeout(t = 5e3) {
            clearTimeout(this.getStatusTimeId), this.getStatusTimeId = setTimeout((() => {
              this.getStatus()
            }), t)
          },
          handleApply() {
            if (this.config.manual && this.config.enabled) return void(this.config.exit_node_ip ? this.showExitNodeWarning = !0 : this.exitNodeIpErr = !0);
            const t = {
              enabled: this.config.enabled
            };
            t.enabled && (t.lan_enabled = this.config.lan_enabled, t.wan_enabled = this.config.wan_enabled, t.lan_gateway = this.config.lan_gateway, t.keep_on_upgrade = this.config.keep_on_upgrade, t.advertise_exit_node = this.config.advertise_exit_node, t.exit_node_ip = ""), this.setTailscaleConfig(t)
          },
          handleSetExitNode() {
            const t = {
              enabled: this.config.enabled,
              lan_enabled: this.oldConfig.lan_enabled,
              wan_enabled: this.oldConfig.wan_enabled,
              lan_gateway: this.oldConfig.lan_gateway,
              advertise_exit_node: !1,
              killswitch: this.config.killswitch,
              exit_node_ip: this.config.exit_node_ip
            };
            this.setTailscaleConfig(t)
          },
          setTailscaleConfig(t) {
            this.$message.closeAll(), this.$message({
              message: this.$t("msg.being_process"),
              iconClass: "iconfont icon-loading",
              duration: 0
            }), this.changeShowDisableMask(!0), l.setTailscaleConfig(t).then((t => {
              t && t.err_msg ? (this.changeShowDisableMask(!1), this.$message.closeAll(), this.$message.error(t.err_code + ", " + t.err_msg)) : (this.config.enabled && !this.oldConfig.enabled && (this.status = 4), clearTimeout(this.waitTimeId), this.waitTimeId = setTimeout((() => {
                this.changeShowDisableMask(!1), this.$message.closeAll(), this.$message.success(this.$t("msg.success")), this.getConfig(), this.showExitNodeWarning && (this.showExitNodeWarning = !1)
              }), 5e3))
            }), (() => {
              this.changeShowDisableMask(!1), this.$message.closeAll()
            }))
          },
          handleLogout() {
            l.tailscaleUnbind().then((t => {
              this.$message.closeAll(), t && t.err_msg || (this.$message.success(this.$t("msg.success")), this.login_name = "", this.address_v4 = "", this.status = 1, this.getStatusTimeout(0))
            }))
          },
          async handleToAuth() {
            this.$message.closeAll(), this.$message({
              message: this.$t("msg.being_process"),
              iconClass: "iconfont icon-loading",
              duration: 0
            }), this.changeShowDisableMask(!0);
            try {
              const t = await l.getAuthUrl();
              t ? (this.$message.closeAll(), this.changeShowDisableMask(!1), t.err_msg ? -1 === t.err_code ? this.$message.error(this.$t("tailscale.get_url_err_msg")) : this.$message.error(t.err_code + ", " + t.err_msg) : t.auth_url ? (this.auth_url = t.auth_url, this.showAuthUrl = !0) : this.$message.error(this.$t("tailscale.get_url_err_msg"))) : (this.$message.closeAll(), this.changeShowDisableMask(!1))
            } catch (t) {
              this.$message.closeAll(), this.changeShowDisableMask(!1)
            }
          },
          getNodeList(t = !1) {
            l.getNodeList().then((e => {
              this.$message.closeAll(), e && e.err_msg ? this.$message.error(e.err_code + ", " + e.err_msg) : t && (this.$message.success(this.$t("msg.success")), this.exitNodeList = e.exit_node_list || [], this.$refs.exitNodeIpSelect.focus())
            }))
          },
          getConfig() {
            l.getTailscaleConfig().then((t => {
              t && t.err_msg || (this.config.enabled = t.enabled || !1, this.config.lan_enabled = t.lan_enabled || !1, this.config.wan_enabled = t.wan_enabled || !1, this.config.lan_gateway = t.lan_gateway || !1, this.config.advertise_exit_node = t.advertise_exit_node || !1, this.config.keep_on_upgrade = t.keep_on_upgrade || !1, this.config.killswitch = t.killswitch !== !1, this.config.exit_node_ip = t.exit_node_ip || "", this.config.manual = "" !== this.config.exit_node_ip, this.lan_ip = t.lan_ip || "", this.oldConfig = this.$deepCopy(this.config), t.enabled ? (this.getStatusTimeout(0), this.getNodeList(!1)) : clearTimeout(this.getStatusTimeId))
            }))
          },
          getStatus() {
            l.getTailscaleStatus().then((t => {
              t && t.err_msg || (this.status = t.status, this.login_name = t.login_name || "", this.address_v4 = t.address_v4 || "", this.dns = t.dns || [])
            })), this.getStatusTimeout()
          }
        },
        destroyed() {
          clearTimeout(this.getStatusTimeId), this.getStatusTimeId = null, clearTimeout(this.waitTimeId), this.waitTimeId = null
        }
      },
      u = c;
    i("7e16");
    var d = function(t, e, i, n, a, s, o, r) {
        var l, c = "function" == typeof t ? t.options : t;
        if (e && (c.render = e, c.staticRenderFns = i, c._compiled = !0), n && (c.functional = !0), s && (c._scopeId = "data-v-" + s), o ? (l = function(t) {
            (t = t || this.$vnode && this.$vnode.ssrContext || this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) || "undefined" == typeof __VUE_SSR_CONTEXT__ || (t = __VUE_SSR_CONTEXT__), a && a.call(this, t), t && t._registeredComponents && t._registeredComponents.add(o)
          }, c._ssrRegister = l) : a && (l = r ? function() {
            a.call(this, (c.functional ? this.parent : this).$root.$options.shadowRoot)
          } : a), l)
          if (c.functional) {
            c._injectStyles = l;
            var u = c.render;
            c.render = function(t, e) {
              return l.call(e), u(t, e)
            }
          } else {
            var d = c.beforeCreate;
            c.beforeCreate = d ? [].concat(d, l) : [l]
          } return {
          exports: t,
          options: c
        }
      }(u, (function() {
        var t = this,
          e = t._self._c;
        return e("div", {
          staticClass: "tailscale-wrapper"
        }, [e("gl-title", {
          attrs: {
            title: "Tailscale",
            badge: "Beta"
          }
        }), e("gl-card", [e("div", {
          staticClass: "main"
        }, [e("div", {
          staticClass: "desc"
        }, [e("span", {
          staticClass: "iconfont icon-info"
        }), e("p", [t._v(" " + t._s(t.$t("tailscale.desc").split("$$$$")[0]) + " "), e("el-tooltip", {
          attrs: {
            content: "https://tailscale.com/",
            placement: "top"
          }
        }, [e("a", {
          staticClass: "text-btn",
          attrs: {
            href: "https://tailscale.com/",
            target: "_blank",
            rel: "noopener noreferrer"
          }
        }, [t._v(" " + t._s(t.$t("tailscale.desc").split("$$$$")[1]) + " ")])]), t._v(" " + t._s(t.$t("tailscale.desc").split("$$$$")[2]) + " ")], 1)]), t.oldConfig.enabled && null !== t.status ? e("div", {
          staticClass: "status-tips",
          class: 3 !== t.status || t.oldConfig.manual ? "is-warning" : "is-success"
        }, [4 === t.status ? e("p", [t._v(" " + t._s(t.$t("internet.connecting")) + " ")]) : t._e(), 1 === t.status ? e("p", [t._v(" " + t._s(t.$t("tailscale.need_login_tips").split("$$$$")[0]) + " "), e("span", {
          staticClass: "text-btn",
          on: {
            click: t.handleToAuth
          }
        }, [t._v(" " + t._s(t.$t("tailscale.need_login_tips").split("$$$$")[1]) + " ")]), t._v(" " + t._s(t.$t("tailscale.need_login_tips").split("$$$$")[2]) + " ")]) : t._e(), 2 === t.status ? e("p", [t._v(" " + t._s(t.$t("tailscale.need_mandate_tips").split("$$$$")[0]) + " "), e("el-tooltip", {
          attrs: {
            placement: "top",
            content: "https://login.tailscale.com/admin/machines"
          }
        }, [e("a", {
          attrs: {
            href: "https://login.tailscale.com/admin/machines",
            target: "_blank",
            rel: "noopener noreferrer"
          }
        }, [t._v(" " + t._s(t.$t("tailscale.need_mandate_tips").split("$$$$")[1]) + " ")])]), t._v(" " + t._s(t.$t("tailscale.need_mandate_tips").split("$$$$")[2]) + " ")], 1) : t._e(), 3 === t.status ? [t.oldConfig.manual ? e("p", [t._v(" " + t._s(t.$t("tailscale.custom_exit_node_warning", {
          subnet: t.lan_ip
        }).split("$$$$")[0]) + " "), e("a", {
          staticClass: "text-btn",
          attrs: {
            href: "https://login.tailscale.com/admin/machines",
            target: "_blank",
            rel: "noopener noreferrer"
          }
        }, [t._v(" " + t._s(t.$t("tailscale.custom_exit_node_warning", {
          subnet: t.lan_ip
        }).split("$$$$")[1]) + " ")]), t._v(" " + t._s(t.$t("tailscale.custom_exit_node_warning", {
          subnet: t.lan_ip
        }).split("$$$$")[2]) + " ")]) : [t.oldConfig.lan_enabled || t.oldConfig.wan_enabled ? e("p", [t._v(" " + t._s(t.$t("tailscale.enable_lan_tips").split("$$$$")[0]) + " "), e("el-tooltip", {
          attrs: {
            placement: "top",
            content: "https://login.tailscale.com/admin/machines"
          }
        }, [e("a", {
          attrs: {
            href: "https://login.tailscale.com/admin/machines",
            target: "_blank",
            rel: "noopener noreferrer"
          }
        }, [t._v(" " + t._s(t.$t("tailscale.enable_lan_tips").split("$$$$")[1]) + " ")])]), t._v(" " + t._s(t.$t("tailscale.enable_lan_tips").split("$$$$")[2]) + " ")], 1) : e("p", [t._v(" " + t._s(t.$t("tailscale.ready_tips")) + " ")])]] : t._e()], 2) : t._e(), e("ul", {
          staticClass: "tailscale-config"
        }, [e("li", [e("div", [t._v(t._s(t.$t("core.enable")) + " Tailscale")]), e("div", [e("gl-switch", {
          attrs: {
            size: "small"
          },
          model: {
            value: t.config.enabled,
            callback: function(e) {
              t.$set(t.config, "enabled", e)
            },
            expression: "config.enabled"
          }
        })], 1)]), t.oldConfig.enabled && t.config.enabled ? [t.login_name ? e("li", [e("div", [t._v(t._s(t.$t("tailscale.account_label")))]), e("div", {
          staticClass: "account-info"
        }, [t._v(" " + t._s(t.login_name) + " "), e("span", {
          staticClass: "text-btn",
          on: {
            click: t.handleLogout
          }
        }, [t._v(" " + t._s(t.$t("tailscale.logout_btn")) + " ")])])]) : t._e(), t.address_v4 ? e("li", [e("div", [t._v(" " + t._s(t.$t("tailscale.current_ip_label")) + " "), e("el-tooltip", {
          attrs: {
            placement: "top",
            content: t.$t("tailscale.current_ip_tips")
          }
        }, [e("span", {
          staticClass: "iconfont icon-info"
        })])], 1), e("div", [t._v(" " + t._s(t.address_v4) + " ")])]) : t._e(), e("li", [e("div", [t._v(" " + t._s(t.$t("tailscale.manual_node_label")) + " ")]), e("div", [e("gl-switch", {
          attrs: {
            size: "small"
          },
          model: {
            value: t.config.manual,
            callback: function(e) {
              t.$set(t.config, "manual", e)
            },
            expression: "config.manual"
          }
        })], 1)]), t.config.manual ? [e("li", [e("div", [t._v(" " + t._s(t.$t("tailscale.exit_node_label")) + " "), e("el-tooltip", {
          attrs: {
            content: t.$t("tailscale.exit_node_tips"),
            placement: "top"
          }
        }, [e("span", {
          staticClass: "iconfont icon-info"
        })])], 1), e("div", {
          staticClass: "node-list-warpper"
        }, [e("span", {
          staticClass: "iconfont icon-redo-alt",
          on: {
            click: function(e) {
              return t.getNodeList(!0)
            }
          }
        }), e("el-select", {
          ref: "exitNodeIpSelect",
          class: {
            "is-error": t.exitNodeIpErr
          },
          attrs: {
            "no-data-text": " ",
            placeholder: " ",
            "popper-class": "main-select"
          },
          on: {
            focus: function(e) {
              t.exitNodeIpErr = !1
            }
          },
          model: {
            value: t.config.exit_node_ip,
            callback: function(e) {
              t.$set(t.config, "exit_node_ip", e)
            },
            expression: "config.exit_node_ip"
          }
        }, t._l(t.exitNodeList, (function(t) {
          return e("el-option", {
            key: t,
            attrs: {
              label: t,
              value: t
            }
          })
        })), 1)], 1)]), e("li", [e("div", [t._v(" " + t._s(t.$t("tailscale.killswitch_label")) + " "), e("el-tooltip", {
          attrs: {
            content: t.$t("tailscale.killswitch_tips"),
            placement: "top"
          }
        }, [e("span", {
          staticClass: "iconfont icon-info"
        })])], 1), e("div", [e("gl-switch", {
          attrs: {
            size: "small"
          },
          model: {
            value: t.config.killswitch,
            callback: function(e) {
              t.$set(t.config, "killswitch", e)
            },
            expression: "config.killswitch"
          }
        })], 1)]), t.hasDnsWarning ? e("li", [e("div", [t._v(" " + t._s(t.$t("core.dns")) + " "), e("el-tooltip", {
          attrs: {
            content: t.$t("tailscale.dns_warning_tips"),
            placement: "top-start"
          }
        }, [e("span", {
          staticClass: "iconfont icon-warning"
        })])], 1), e("div", [t._v(" " + t._s(t.dns.join(" , ")) + " ")])]) : t._e()] : [e("li", [e("div", [t._v(" " + t._s(t.$t("tailscale.enable_wan_label")) + " "), e("el-tooltip", {
          attrs: {
            content: t.$t("tailscale.allow_wan_tips"),
            placement: "top"
          }
        }, [e("span", {
          staticClass: "iconfont icon-info"
        })])], 1), e("div", [e("gl-switch", {
          attrs: {
            size: "small"
          },
          model: {
            value: t.config.wan_enabled,
            callback: function(e) {
              t.$set(t.config, "wan_enabled", e)
            },
            expression: "config.wan_enabled"
          }
        })], 1)]), e("li", [e("div", [t._v(" " + t._s(t.$t("tailscale.enable_lan_label")) + " "), e("el-tooltip", {
          attrs: {
            content: t.$t("tailscale.allow_lan_tips"),
            placement: "top"
          }
        }, [e("span", {
          staticClass: "iconfont icon-info"
        })])], 1), e("div", [e("gl-switch", {
          attrs: {
            size: "small"
          },
          model: {
            value: t.config.lan_enabled,
            callback: function(e) {
              t.$set(t.config, "lan_enabled", e)
            },
            expression: "config.lan_enabled"
          }
        })], 1)]), e("li", [e("div", [t._v(" " + t._s(t.$t("tailscale.lan_gateway_label")) + " "), e("el-tooltip", {
          attrs: {
            content: t.$t("tailscale.lan_gateway_tips"),
            placement: "top"
          }
        }, [e("span", {
          staticClass: "iconfont icon-info"
        })])], 1), e("div", [e("gl-switch", {
          attrs: {
            size: "small"
          },
          model: {
            value: t.config.lan_gateway,
            callback: function(e) {
              t.$set(t.config, "lan_gateway", e)
            },
            expression: "config.lan_gateway"
          }
        })], 1)]), e("li", [e("div", [t._v(" " + t._s(t.$t("tailscale.keep_on_upgrade_label")) + " "), e("el-tooltip", {
          attrs: {
            content: t.$t("tailscale.keep_on_upgrade_tips"),
            placement: "top"
          }
        }, [e("span", {
          staticClass: "iconfont icon-info"
        })])], 1), e("div", [e("gl-switch", {
          attrs: {
            size: "small"
          },
          model: {
            value: t.config.keep_on_upgrade,
            callback: function(e) {
              t.$set(t.config, "keep_on_upgrade", e)
            },
            expression: "config.keep_on_upgrade"
          }
        })], 1)]), e("li", [e("div", [t._v(" " + t._s(t.$t("tailscale.advertise_exit_node_label")) + " "), e("el-tooltip", {
          attrs: {
            content: t.$t("tailscale.advertise_exit_node_tips"),
            placement: "top"
          }
        }, [e("span", {
          staticClass: "iconfont icon-info"
        })])], 1), e("div", [e("gl-switch", {
          attrs: {
            size: "small"
          },
          model: {
            value: t.config.advertise_exit_node,
            callback: function(e) {
              t.$set(t.config, "advertise_exit_node", e)
            },
            expression: "config.advertise_exit_node"
          }
        })], 1)])]] : t._e()], 2), e("div", {
          staticClass: "btns"
        }, [e("gl-button", {
          staticClass: "btn-item",
          attrs: {
            type: "primary",
            disabled: t.applyDisabled
          },
          on: {
            click: t.handleApply
          }
        }, [t._v(t._s(t.$t("core.apply")))])], 1)])]), e("div", {
          staticClass: "auth-dialog"
        }, [e("el-dialog", {
          attrs: {
            visible: t.showAuthUrl,
            "show-close": ""
          },
          on: {
            "update:visible": function(e) {
              t.showAuthUrl = e
            }
          }
        }, [e("span", {
          attrs: {
            slot: "title"
          },
          slot: "title"
        }, [t._v(" " + t._s(t.$t("tailscale.need_login_tips").split("$$$$")[1]) + " ")]), e("div", {
          staticClass: "dialog-main"
        }, [e("a", {
          staticClass: "text-btn",
          attrs: {
            href: t.auth_url,
            target: "_blank",
            rel: "noopener noreferrer"
          }
        }, [t._v(" " + t._s(t.auth_url) + " ")])])])], 1), e("div", {
          staticClass: "exit-node-dialog"
        }, [e("el-dialog", {
          attrs: {
            visible: t.showExitNodeWarning
          },
          on: {
            "update:visible": function(e) {
              t.showExitNodeWarning = e
            }
          }
        }, [e("span", {
          staticClass: "dialog-title",
          attrs: {
            slot: "title"
          },
          slot: "title"
        }, [t._v(" " + t._s(t.$t("core.caution")))]), e("div", {
          staticClass: "dialog-main"
        }, [e("div", {
          staticClass: "desc"
        }, [t._v(" " + t._s(t.$t("tailscale.custom_exit_node_warning", {
          subnet: t.lan_ip
        }).split("$$$$")[0]) + " "), e("a", {
          staticClass: "text-btn",
          attrs: {
            href: "https://login.tailscale.com/admin/machines",
            target: "_blank",
            rel: "noopener noreferrer"
          }
        }, [t._v(" " + t._s(t.$t("tailscale.custom_exit_node_warning", {
          subnet: t.lan_ip
        }).split("$$$$")[1]) + " ")]), t._v(" " + t._s(t.$t("tailscale.custom_exit_node_warning", {
          subnet: t.lan_ip
        }).split("$$$$")[2]) + " ")]), e("div", {
          staticClass: "btns"
        }, [e("gl-button", {
          staticClass: "btn-item",
          on: {
            click: function(e) {
              t.showExitNodeWarning = !1
            }
          }
        }, [t._v(t._s(t.$t("core.cancel")))]), e("gl-button", {
          staticClass: "btn-item",
          attrs: {
            type: "abort"
          },
          on: {
            click: t.handleSetExitNode
          }
        }, [t._v(t._s(t.$t("core.apply")))])], 1)])])], 1)], 1)
      }), [], !1, null, "6329ebb0", null),
      p = d.exports;
    e.default = p
  }
}).default;