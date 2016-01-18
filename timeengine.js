"use strict";

(function () {
  'use strict';

  var getID = function (id0) {
    var id = id0;
    return function () {
      return id++;
    };
  }(0);
  //-----------------------------------
  //__([a,b], true) // new seq depends on ds =[a,b]
  var __ = function __() {
    var ds = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
    var store = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    if (typeof ds === "boolean") {
      store = ds;
      ds = [];
    }
    var seq = []; //seq is vanilla JS array + features
    seq.id = getID();
    seq.store = store;
    seq.us = [];
    seq.ds = ds;
    seq.updatedFor = {};
    seq.eq = function () {
      return seq.ds.map(function (d) {
        return d.t;
      });
    };
    seq.ds.map(function (d) {
      // add self seq to us Array of d
      d.us[d.us.length] = seq;
      d.updatedFor[seq.id] = 0; // non-interference dependency
    });
    seq.IndexOnTimestamp = {};
    seq.TimestampOnIndex = {};
    seq.done = 0;
    //-----------------
    Object.keys(__.api).map(function (api) {
      seq[api] = __.api[api](__, seq, store);
    });
    //-----------------
    Object.defineProperties(seq, //detect t update on each seqs
    {
      t: { //foo.t

        get: function get() {
          return seq.valOnT;
        },
        set: function set(tval) {
          seq.valOnT = tval;
          //----------------------
          if (store) {
            var now = Date.now();
            seq.IndexOnTimestamp[now] = seq.length;
            seq.TimestampOnIndex[seq.length] = now;
            seq[seq.length] = seq.valOnT;
          }
          //----------------------
          if (seq.done === 0) {
            Object.keys(seq.updatedFor).map(function (key) {
              seq.updatedFor[key] = 1;
            });
            seq.us.map(function (u) {
              //-------------------
              var dsAllUpdated = u.ds.map(function (d) {
                return d.updatedFor[u.id];
              }).reduce(function (a, b) {
                return a * b;
              });
              if (dsAllUpdated === 1) {
                u.t = u.eq(tval); //propagate
                //--clear updated ds in non-interference way--
                u.ds.map(function (d) {
                  d.updatedFor[u.id] = 0;
                });
              }
            });
          }
        }
      }
    });
    //=====================================
    return seq;
  };
  //==================

  __.api = {};
  //--------------------------------------
  __.api.__ = function (__, seq, store) {
    return function (f) {
      var __pedSeq = __([seq], store);
      var t0 = Date.now();
      __pedSeq.eq = function (t) {
        return f(t, t0);
      };
      return __pedSeq;
    };
  };

  __.api.log = function (__, seq, store) {
    return function (msg) {
      seq.__(function (val) {
        if (typeof msg === "undefined") {
          console.log(val);
          return val;
        } else {
          console.info(msg + ":", val);
          return val;
        }
      });
      return seq;
    };
  };

  __.api.T = function (__, seq, store) {
    return function (timestamp) {
      if (store) {
        return seq[seq.IndexOnTimestamp[timestamp]];
      } else {
        throw new Error("store flag is not true");
      }
    };
  };

  //top level api
  __.log = __([], true);
  __.log.__(function (val) {
    console.info(val);
    return val;
  });

  __.intervalSeq = function (immutableSeq, interval) {
    var store = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    var seq = __([], store);
    var it = immutableSeq.values();
    var val = __();
    val.t = it.next().value;
    if (typeof val.t !== "undefined") {
      (function () {
        var timer = setInterval(function () {
          seq.t = val.t;
          val.t = it.next().value;
          if (typeof val.t === "undefined") {
            clearInterval(timer);
          }
        }, interval);
      })();
    }
    return seq;
  };

  Object.defineProperties(__, {
    t: {
      get: function get() {
        return Date.now();
      },
      set: function set(f) {
        f();
      }
    }
  });

  __.pure = function (legacyF) {
    var f = function f() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var wrappedF = function wrappedF() {
        legacyF.apply(undefined, args);
      };
      return wrappedF;
    };
    return f;
  };
  //------------------

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = __;
  } else {
    window.__ = __;
  }
})();
