(() => {
  'use strict';

  const __ = require('./timeengine.js');
  const Immutable = require('immutable');
  (() => {
    const __delay = __
      .intervalSeq(Immutable
        .Repeat('timeengine test started...', 1), 0)
      .log();
  })();
  (() => {
    const __delay = __
      .intervalSeq(Immutable
        .Seq.of("----------------------------------"), 500)
      .log()
      .__(() => {
        const __x = __();
        const __log1 = __x.log('x');

        const __y = __x.__((x) => (x + 1));
        const __log2 = __y.log('y');
        __x.t = 1;
      });
  })();


  (() => {
    const __delay = __
      .intervalSeq(Immutable
        .Seq.of("----------------------------------"), 1000)
      .log()
      .__(() => {
        // Single (no duplicate) update by dependency analysis
        const __a = __();
        const __log1 = __a.log('__a');

        const __b = __([__a]).__(([a]) => a * 2);
        const __log2 = __b.log('__b'); // b.t = 1 * 2 = 2

        const __c = __([__a, __b]).__(([a, b]) => a + b * 3);
        const __log3 = __c.log('__c'); // c.t = 1 + 2 * 3 = 7

        const __d = __([__b]).__(([b]) => b * 100);
        const __log4 = __d.log('__d'); // d.t = 2 * 100 = 200

        const __e = __([__a, __b, __c, __d])
          .__(([a, b, c, d]) => a + b + c + d);
        const __log5 = __e.log('__e'); //210

        const __atomic = __([__a, __b, __c, __d, __e]);
        const __log6 = __atomic.log('__atomic');


        __a.t = 1; // the whole val will be updated

      /* //ERROR!
      //cannot set a value on sequence that depends on other sequences

            __b.t = 99;

      */
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
        .Seq.of("----------------------------------"), 1500)
      .log()
      .__(() => {
        const p = new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(99);
          }, 1000);
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
        .Seq.of("----------------------------------"), 2000)
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
        .Seq.of("----------------------------------"), 2500)
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

        const __log = __p2.log("__p2");
        __p.t = 99;
        __p.t = 999;

      });
  })();
  (() => {
    const __delay = __
      .intervalSeq(Immutable
        .Seq.of("----------------------------------"), 3000)
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

        var promise0 = PromiseCreateFunc("aaaaa", 3000);
        var promise1 = PromiseCreateFunc("bbbbb", 1000);
        var promise2 = PromiseCreateFunc("ccccc", 2000);
        var promiseAll = Promise.all([promise0, promise1, promise2]);

        promiseAll.then((value) => {
          console.log(value);
        });

      });
  })();
  (() => {
    const __delay = __
      .intervalSeq(Immutable
        .Seq.of("----------------------------------"), 3500)
      .log()
      .__(() => {

        const __a = __
          .intervalSeq(Immutable
            .Seq.of("aaaaa"), 3000);
        const __b = __
          .intervalSeq(Immutable
            .Seq.of("bbbbb"), 1000);
        const __c = __
          .intervalSeq(Immutable
            .Seq.of("ccccc"), 2000);

        const promiseAll = __([__a, __b, __c]);

        const __log1 = promiseAll.log();

      });
  })();

})();
