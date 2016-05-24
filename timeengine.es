(() => {
  'use strict';
  const getID = ((id0) => {
    let id = id0;
    return () => (id++);
  })(0);
  //-----------------------------------
  //__([a,b], true) // new seq depenus on us =[a,b]
  const __ = (us = [], store = false) => {
    if (typeof us === "boolean") {
      store = us;
      us = [];
    }
    const seq = []; //seq is vanilla JS array + features
    seq.id = getID();
    seq.store = store;
    seq.us = us;
    seq.ds = [];

    seq.updatedTo = {};
    seq.us.map((u) => { //  seq is a member of u.ds
      u.ds[u.ds.length] = seq;
      u.updatedTo[seq.id] = 0; // non-interference dependency
    });
    seq.IndexOnTimestamp = {};
    seq.TimestampOnIndex = {};
    seq.propagating = 0;
    seq.done = 0;
    seq.eqs = [];
    seq.addEq = (eq) => (seq.eqs[seq.eqs.length] = eq);
    seq.evalEqs = (val) => {
      const val0 = val;
      seq.eqs.map((eq) => (val = eq(val)));
      return (seq.us.length === 0) ? val0 : val;
    };
    //api-----------------
    Object.keys(__.api).map((api) => {
      seq[api] = __.api[api](__, seq, store);
    });
    //-----------------
    Object.defineProperties(seq, //detect t update on each seqs
      {
        t: { //foo.t
          get() {
            return seq.valOnT;
          },
          set(tval) {
            if ((seq.propagating === 0) //sanity check
              && (seq.us.length !== 0)) {
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
                Object.keys(seq.updatedTo).map((key) => {
                  seq.updatedTo[key] = 1;
                });
                //clear updated us in non-interference way
                seq.us.map((u) => (u.updatedTo[seq.id] = 0));
                seq.ds.map((d) => {
                  const usAllUpdated = d.us
                    .map((u) => (u.updatedTo[d.id]))
                    .reduce((a, b) => (a * b));
                  if (usAllUpdated === 1) {
                    d.propagating = 1;
                    d.t = d.us.map((u) => (u.t));
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
  __.api.__ = ((__, seq, store) => {
    return ((f) => {
      seq.addEq((val) => (f(val, seq.T)));
      return seq;
    });
  });

  __.api.log = ((__, seq, store) => {
    return ((msg) => {
      seq.addEq((val) => {
        if (typeof msg === "undefined") {
          console.log(val);
          return val;
        } else {
          console.info(msg + ":", val);
          return val;
        }
      });
      return seq;
    });
  });

  __.api.onT = ((__, seq, store) => {
    return ((timestamp) => {
      if (store) {
        return (seq[seq.IndexOnTimestamp[timestamp]]);
      } else {
        throw new Error("store flag is not true");
      }
    });
  });

  //top level api
  __.log = __([], true)
    .__((val) => {
      console.info(">>> ", val);
      return val;
    });

  __.intervalSeq = (immutableSeq, interval, store = false) => {
    const seq = __([], store);
    const it = immutableSeq.values();
    const val = __();
    val.t = it.next().value;
    if (typeof val.t !== "undefined") {
      const timer = setInterval((() => {
        seq.t = val.t;
        val.t = it.next().value;
        if (typeof val.t === "undefined") {
          clearInterval(timer);
        }
      }), interval);
    }
    return seq;
  };

  Object.defineProperties(__,
    {
      T: {
        get() {
          return Date.now();
        },
        set(f) {
          f();
        }
      }
    });

  __.pure = (legacyF) => {
    const f = (...args) => {
      const wrappedF = () => {
        legacyF(...args);
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
