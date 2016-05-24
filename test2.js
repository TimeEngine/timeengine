(() => {
  'use strict';

  const __ = require('./timeengine.es');
  const Immutable = require('immutable');

  (() => {
    const __delay = __
      .intervalSeq(Immutable
        .Seq.of("----------------------------------"), 100)
      .log()
      .__(() => {
        const __a = __(); //constructor
        const __b = __([__a]) //constructor
          .__(([a]) => (a + 1))
          .log();
        ; //

        const __log1 = __a.log("__a");
        const __log2 = __b.log("__b");

        __a.t = 1;

        __.log.t = __b.t;
      });
  })();

  (() => {
    const __delay = __
      .intervalSeq(Immutable
        .Seq.of("----------------------------------"), 200)
      .log()
      .__(() => {

        const __x = __(true);
        __x.t = 99;

        __x.t = __x.t + 1;

        __.log.t = __x[0]; //99
        __.log.t = __x[1]; //100


      });
  })();

})();
