(() => {
  'use strict';
  const getID = ((id0) => {
    let id = id0;
    return () => (id++);
  })(0);
  //-----------------------------------
  //__([a,b], true) // new seq depends on ds =[a,b]
  const __ = (ds = [], store = false) => {
    if (typeof ds === "boolean") {
      store = ds;
      ds = [];
    }
    const seq = []; //seq is vanilla JS array + features
    seq.id = getID();
    seq.store = store;
    seq.us = [];
    seq.ds = ds;
    seq.updatedFor = {};
    seq.eq = () => (seq.ds.map((d) => (d.t)));
    seq.ds.map((d) => { // add self seq to us Array of d
      d.us[d.us.length] = seq;
      d.updatedFor[seq.id] = 0; // non-interference dependency
    });
    seq.IndexOnTimestamp = {};
    seq.TimestampOnIndex = {};
    seq.propagating = 0;
    seq.done = 0;
    //-----------------
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
            //sanity check
            if ((seq.propagating === 0)
              && (seq.ds.length !== 0)) {
              throw new Error("cannot set a value on sequence that depends on other sequences");
            } else {
              seq.propagating = 0;
              seq.valOnT = tval;
              seq.T = Date.now();
              if (store) {
                seq.IndexOnTimestamp[seq.T] = seq.length;
                seq.TimestampOnIndex[seq.length] = seq.T;
                seq[seq.length] = seq.valOnT;
              }
              if (seq.done === 0) {
                Object.keys(seq.updatedFor).map((key) => {
                  seq.updatedFor[key] = 1;
                });
                seq.us.map((u) => {
                  const dsAllUpdated = u.ds
                    .map((d) => (d.updatedFor[u.id]))
                    .reduce((a, b) => (a * b));
                  if (dsAllUpdated === 1) {
                    u.propagating = 1;
                    u.t = u.eq(tval); //propagate
                    //clear updated ds in non-interference way
                    u.ds.map((d) => {
                      d.updatedFor[u.id] = 0;
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
  __.api.__ = ((__, seq, store) => {
    return ((f) => {
      const __newSeq = __([seq], store);
      __newSeq.eq = (val) => (f(val, seq.T));
      return __newSeq;
    });
  });

  __.api.log = ((__, seq, store) => {
    return ((msg) => {
      seq.__((val) => {
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
  __.log = __([], true);
  __.log.__((val) => {
    console.info(val);
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

})();
