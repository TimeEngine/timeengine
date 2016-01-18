(() => {
  'use strict';

  const __ = require('./timeengine.js');
  const Immutable = require('immutable');

  const timeseq0 = __.intervalSeq(Immutable.Range(0, 1), 0)
    .log('timeengine test started...');

  const a = __();
  const b = __([a]);
  //  const c = __([a, b]).__(([a, b]) => (a + b));

  //var c = a.__([b]);
  const timeseq1 = a.log('a');
  const timeseq2 = b.log('b');
  //  const timeseq3 = c.log('c');

  const timeseq4 = __.intervalSeq(Immutable.Range(0, 1), 1000)
    .__(() => {
      a.t = 1;
    });

  // Single (no duplicate) update by dependency analysis
  const __a = __();
  const __b = __([__a]).__(([a]) => a * 2); // b.t = 1 * 2 = 2
  const __c = __([__a, __b]).__(([a, b]) => a + b * 3); // c.t = 1 + 2 * 3 = 7
  const __d = __([__b]).__(([b]) => b * 100); // d.t = 2 * 100 = 200
  const __e = __([__a, __b, __c, __d]).__(([a, b, c, d]) => a + b + c + d); //210
  const __atomic = __([__a, __b, __c, __d, __e]);

  const timeseq10 = __a.log('__a');
  const timeseq11 = __b.log('__b');
  const timeseq12 = __c.log('__c');
  const timeseq13 = __d.log('__d');
  const timeseq14 = __e.log('__e');
  const timeseq15 = __atomic.log('atomic');
  const timeseq16 = __.intervalSeq(Immutable.Range(0, 1), 1500)
    .__(() => {
      __a.t = 1;
    });
  const __u = __([], true);
  __u.t = 1;
  __u.t = 2;
  __u.t = 3;

  __.log.t = __u[1];

  const timerts = __.intervalSeq(Immutable.Range(0, 5), 1000)
    .log(">>>");


})();
