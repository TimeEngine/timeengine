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
  //__([a,b], true) // new seq depenus on us =[a,b]
  var __ = function __() {
    var us = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
    var store = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    if (typeof us === "boolean") {
      store = us;
      us = [];
    }
    var seq = []; //seq is vanilla JS array + features
    seq.id = getID();
    seq.store = store;
    seq.us = us;
    seq.ds = [];

    seq.updatedTo = {};
    seq.us.map(function (u) {
      //  seq is a member of u.ds
      u.ds[u.ds.length] = seq;
      u.updatedTo[seq.id] = 0; // non-interference dependency
    });
    seq.IndexOnTimestamp = {};
    seq.TimestampOnIndex = {};
    seq.propagating = 0;
    seq.done = 0;
    seq.eqs = [];
    seq.addEq = function (eq) {
      return seq.eqs[seq.eqs.length] = eq;
    };
    seq.evalEqs = function (val) {
      var val0 = val;
      seq.eqs.map(function (eq) {
        return val = eq(val);
      });
      return seq.us.length === 0 ? val0 : val;
    };
    //api-----------------
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
          if (seq.propagating === 0 && //sanity check
          seq.us.length !== 0) {
            throw new Error("cannot set a value on sequence that depenus on other sequences");
          } else {
            seq.propagating = 0;
            if (seq.done === 0) {
              seq.valOnT = seq.evalEqs(tval); //self eqs eval
              seq.T = Date.now();
              if (store) {
                seq.IndexOnTimestamp[seq.T] = seq.length;
                seq.TimestampOnIndex[seq.length] = seq.T;
                seq[seq.length] = seq.valOnT; //after funcs
              }
              Object.keys(seq.updatedTo).map(function (key) {
                seq.updatedTo[key] = 1;
              });
              //clear updated us in non-interference way
              seq.us.map(function (u) {
                return u.updatedTo[seq.id] = 0;
              });
              seq.ds.map(function (d) {
                var usAllUpdated = d.us.map(function (u) {
                  return u.updatedTo[d.id];
                }).reduce(function (a, b) {
                  return a * b;
                });
                if (usAllUpdated === 1) {
                  d.propagating = 1;
                  d.t = d.us.map(function (u) {
                    return u.t;
                  });
                }
              });
            }
          }
        }
      }
    });
    return seq;
  };
  //==================
  __.api = {};
  //--------------------------------------
  __.api.__ = function (__, seq, store) {
    return function (f) {
      seq.addEq(function (val) {
        return f(val, seq.T);
      });
      return seq;
    };
  };

  __.api.log = function (__, seq, store) {
    return function (msg) {
      seq.addEq(function (val) {
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

  __.api.onT = function (__, seq, store) {
    return function (timestamp) {
      if (store) {
        return seq[seq.IndexOnTimestamp[timestamp]];
      } else {
        throw new Error("store flag is not true");
      }
    };
  };

  //top level api
  __.log = __([], true).__(function (val) {
    console.info(">>> ", val);
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
    T: {
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
  //============================
})();
