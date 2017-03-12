(() => {
  "use strict";

  const __ = require("./timeengine.es");
  const Immutable = require("immutable");

  (() => {
    const __delay = __
      .intervalSeq(Immutable
        .Seq.of("----------------------------------"), 100)
      .log()
      .__(() => {
        const __a = __(); //constructor

        const __d = __a
          .__((x) => (__.log.t = x + 1))
          .log("_d.t");

        __a.t = 9;
        __.log.t = __a.t; //should be 9
      });
  })();



})();
