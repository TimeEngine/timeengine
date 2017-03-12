"use strict";

(function () {
  "use strict";

  var getID = function (id0) {
    var id = id0;
    return function () {
      return id++;
    };
  }(0);
  //-----------------------------------
  //__([a,b], true) // new seq depenus on us =[a,b]
  var __ = function __() {
    var us = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var store = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    store = typeof us === "boolean" ? us : store;
    us = typeof us === "boolean" ? [] : us;

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
      t: {
        //foo.t
        get: function get() {
          return seq.valOnT;
        },
        set: function set(tval) {
          var sanityCheck = seq.propagating === 0 && seq.us.length !== 0 ? function () {
            throw new Error("Do not set a value of the sequence that depends on other sequences!");
          }() : function () {
            seq.propagating = 0;
            var core = seq.done === 0 ? function () {
              seq.valOnT = seq.evalEqs(tval); //self eqs eval
              seq.T = Date.now();
              var core1 = store ? function () {
                seq.IndexOnTimestamp[seq.T] = seq.length;
                seq.TimestampOnIndex[seq.length] = seq.T;
                seq[seq.length] = seq.valOnT; //after funcs
              }() : true;
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
                var core2 = usAllUpdated === 1 ? function () {
                  d.propagating = 1;
                  d.t = d.us.map(function (u) {
                    return u.t;
                  });
                }() : true;
              });
            }() : true;
          }();
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
        return typeof msg === "undefined" ? function () {
          console.info(">>", val);
          return val;
        }() : function () {
          console.info(msg + ":", val);
          return val;
        }();
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
    console.info(">>", val);
    return val;
  });

  __.intervalSeq = function (immutableSeq, interval) {
    var store = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var seq = __([], store);
    var it = immutableSeq.values();
    var val = __();
    val.t = it.next().value;
    var timer = typeof val.t !== "undefined" ? setInterval(function () {
      seq.t = val.t;
      val.t = it.next().value;
      var stop = typeof val.t === "undefined" ? clearInterval(timer) : true;
    }, interval) : true;
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
  if (typeof module !== "undefined" && module.exports) {
    module.exports = __;
  } else {
    window.__ = __;
  }
  //============================
})();
