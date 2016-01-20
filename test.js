(() => {
  'use strict';

  const __ = require('./timeengine.js');
  const Immutable = require('immutable');


  (() => {
    const __delay = __
      .intervalSeq(Immutable
        .Seq.of("##### timeengine Test Started #####"), 0)
      .log();

  })();

  (() => {
    const __delay = __
      .intervalSeq(Immutable
        .Seq.of("----------------------------------"), 100)
      .log()
      .__(() => {
        const __a = __(); //constructor
        const __b = __([__a])
          .__(([a]) => (a + 1));

        const __log1 = __a.log("__a");
        const __log2 = __b.log("__b");
        __a.t = 1;
      });
  })();

  (() => {
    const __delay = __
      .intervalSeq(Immutable
        .Seq.of("----------------------------------"), 150)
      .log()
      .__(() => {
        const __a = __();
        const __b = __();
        const __c = __();

        const __ab = __([__a, __b]).__(([a, b]) => (a * b));
        const __bc = __([__b, __c]).__(([b, c]) => (b * c));

        const __log1 = __a.log("__a");
        const __log2 = __b.log("__b");
        const __log3 = __c.log("__c");
        const __log4 = __ab.log("__ab");
        const __log5 = __bc.log("__bc");

        __a.t = 2;
        __b.t = 3; //__b update is managed in non-interference way
        __c.t = 5;

      });
  })();
  (() => {
    const __delay = __
      .intervalSeq(Immutable
        .Seq.of("----------------------------------"), 200)
      .log()
      .__(() => {
        // Single (no duplicate) update by dependency analysis
        const __a = __();
        const __b = __([__a]).__(([a]) => a * 2);
        const __c = __([__a, __b]).__(([a, b]) => a + b * 3);
        const __d = __([__b]).__(([b]) => b * 100);
        const __e = __([__a, __b, __c, __d])
          .__(([a, b, c, d]) => a + b + c + d);
        const __atomic = __([__a, __b, __c, __d, __e]);

        const __log1 = __a.log('__a');
        const __log2 = __b.log('__b'); // b.t = 1 * 2 = 2
        const __log3 = __c.log('__c'); // c.t = 1 + 2 * 3 = 7
        const __log4 = __d.log('__d'); // d.t = 2 * 100 = 200
        const __log5 = __e.log('__e'); //210
        const __log6 = __atomic.log('__atomic');

        __a.t = 1; // the whole val will be updated
        __a.t = 2;
        /* //ERROR!
        //cannot set a value on sequence that depends on other sequences
              __b.t = 99;
        */

      });

  })();

  (() => {
    const __delay = __
      .intervalSeq(Immutable
        .Seq.of("----------------------------------"), 300)
      .log()
      .__(() => {
        // Single (no duplicate) update by dependency analysis
        const __a = __();
        const __b = __();
        const __c = __([__a]).__(([a]) => a);
        const __abc = __([__a, __b, __c])
          .__(([a, b, c]) => a + b + c);

        const __log1 = __a.log('__a');
        const __log2 = __b.log('__b');
        const __log3 = __c.log('__c');
        const __log4 = __abc.log('__abc');
        __a.t = 1;
        __a.t = 2;
        __b.t = 1;
        __b.t = 3;
        __a.t = 3;

      });

  })();


  /*
    const loop = Immutable.Range(0, 10) //loop 10 times
.map((c) => (__.log.t = c))
.toArray(); //lazy Seq toArray to compute


    const timerts = __.intervalSeq(Immutable.Range(0, 5), 1000)
.log(">>>");
  */

  (() => {
    const __delay = __
      .intervalSeq(Immutable
        .Seq.of("----------------------------------"), 400)
      .log()
      .__(() => {
        const p = new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(99);
          }, 0);
        });

        p
          .then((value) => {
            console.log(value); // 99
            return value + 1;
          })
          .then((value) => {
            console.log(value); // 100
          });
      });
  })();

  (() => {
    const __delay = __
      .intervalSeq(Immutable
        .Seq.of("----------------------------------"), 500)
      .log()
      .__(() => {
        const __p = __();
        const __p2 = __p
          .__((value) => {
            __.log.t = value; //99
            return value + 1;
          })
          .__((value) => {
            __.log.t = value; //100
            return value + 1;
          });

        const __log = __p2.log("__p2");
        __p.t = 99;
        __p.t = 999;
      });
  })();

  (() => {
    const __delay = __
      .intervalSeq(Immutable
        .Seq.of("----------------------------------"), 600)
      .log()
      .__(() => {
        const __p = __();
        const __p2 = __p
          .__((value) => {
            __.log.t = value; //99
            return value + 1;
          });
        const __p3 = __p2
          .__((value) => {
            __.log.t = value; //100
            return value + 1;
          });

        const __log = __p3.log("__p3");
        __p.t = 99;
        __p.t = 999;

      });
  })();
  (() => {
    const __delay = __
      .intervalSeq(Immutable
        .Seq.of("----------------------------------"), 700)
      .log()
      .__(() => {
        const PromiseCreateFunc = (value, time) => {
          const promise = new Promise((resolve, reject) => {
            setTimeout(function() {
              resolve(value);
            }, time);
          });
          return promise;
        };

        var promise0 = PromiseCreateFunc("aaaaa", 300);
        var promise1 = PromiseCreateFunc("bbbbb", 100);
        var promise2 = PromiseCreateFunc("ccccc", 200);
        var promiseAll = Promise.all([promise0, promise1, promise2]);

        promiseAll.then((value) => {
          console.log(value);
        });

      });
  })();
  (() => {
    const __delay = __
      .intervalSeq(Immutable
        .Seq.of("----------------------------------"), 1200)
      .log()
      .__(() => {

        const __a = __
          .intervalSeq(Immutable
            .Seq.of("aaaaa"), 300);
        const __b = __
          .intervalSeq(Immutable
            .Seq.of("bbbbb"), 100);
        const __c = __
          .intervalSeq(Immutable
            .Seq.of("ccccc"), 200);

        const promiseAll = __([__a, __b, __c]);

        const __log1 = promiseAll.log();

      });
  })();

})();
