/*global React ReactDOM __ Immutable __Component*/

//const __Component = require("timeengine-react");
//this code is required to transpile by `npm run jsx`

(() => {
  'use strict';

  const TextComponent = () => {
    const __value = __();
    const onChange = (e) => {
      __value.t = e.target.value;
      __value.log("__value");
    };

    const __seqEl = __([__value])
      .__(([value]) => (<div>
      <input type="text" value={value} onChange={onChange}/>
        </div>));

    __value.t = "default text";
    return __Component(__seqEl);
  };

  // `.intervalSeq` is to map Immutable-js infinite Sequence
  //                       on TimeEngine infinite Sequence
  // map natural numbers sequence on intervalSeq(1000)
  const TimerComponent = () => {
    return __Component(__
      .intervalSeq(Immutable.Range(), 1000)
      .__((count) => (__.log.t = count)) //console.log
      .__((count) => (<div>{"Timer : "}{count}</div>)));
  };

  // memory leak, performance issue
  //how about games? memoized_reduce is needed
  // to calculate many elemnents of the long array
  const CounterComponentStateHistory = () => {
    const __updn = __(true); //1 or -1 or initially 0
    const __seqEl = __([__updn])
      .__(([updn]) => (__updn
          .reduce((a, b) => (a + b)))) //js Array.reduce
      .__((count) => (<span>{count}</span>));
    const init = () => (__updn.t = 0); //just trigger to view the init
    const __runNow = __
      .intervalSeq(Immutable.Seq.of(true), 0)
      .__(init);
    return (<span>
             <button
      onClick={() => (__updn.t = 1)}>{"Up"}</button>
             <button
      onClick={() => (__updn.t = -1)}>{"Down"}</button>
             &nbsp;&nbsp;{__Component(__seqEl)}&nbsp;&nbsp;
            </span>);
  };

  // no seq object destroy
  const CounterReloadComponent = () => {
    const __clicked = __();
    const onClick = () => {
      __clicked.t = true;
    };
    const __runNow = __
      .intervalSeq(Immutable.Seq.of(true), 0)
      .__(onClick);
    const __seqEl = __([__clicked])
      .__(() => (<span>{CounterComponentStateHistory()}</span>));
    return (<div>
            {__Component(__seqEl)}
           <button onClick={onClick}>{"Reload"}</button>
          </div>);
  };

  const CounterComponent = () => {
    const __updn = __();
    const __count = __([__updn])
      .__(([updn]) => ((updn === 0) ? (0) : (__count.t + updn)));
    const init = () => (__updn.t = 0); //initial value of count
    const __runNow = __
      .intervalSeq(Immutable.Seq.of(true), 0)
      .__(init);
    const __seqEl = __([__count])
      .__(([count]) => (<span>{count}</span>));
    return (<div>
           <button
      onClick={() => (__updn.t = 1)}>{"Up"}</button>
           <button
      onClick={() => (__updn.t = -1)}>{"Down"}</button>
           &nbsp;&nbsp;{__Component(__seqEl)}&nbsp;&nbsp;
           <button
      onClick={init}>{"Reset"}</button>
          </div>);
  };

  //to copy to document
  //__count.t += updn is deistructive operation!?
  //1. __count is const and immutable sequence
  //2. t (time index) is conceptually different before and after the operation, so __count.t is different and immutable  before and after the operation
  //3. Integirity between sequences is guranteed by dependency system.

  const PhysicsComponent = () => {
    //MKS system of units
    const V0 = 85.0; // m/s
    const DEG = 40; //degree
    const THETA = DEG / 180 * Math.PI; //radian
    const G = 9.8; //gravity const
    //t seconds elapsed 0msec time resolution
    const t = __
      .intervalSeq(Immutable.Range(), 10)
      .__((count) => (count * 10 / 1000));
    const x = __([t]).__(([t]) => V0 * Math.cos(THETA) * t);
    const y = __([t]).__(([t]) => V0 * Math.sin(THETA) * t - 1 / 2 * G * Math.pow(t, 2));
    //==================================
    const Drawscale = 1; //1 dot = 1 meter
    const __seqEl = __([x, y]) //atomic update
      .__(([x, y]) => (
      <div>
        <svg height = "250"  width = "100%">
            <circle r="2" fill="red"
        cx = {50 + x * Drawscale} cy = {250 - y * Drawscale}/>
        </svg>
      </div>));
    return __Component(__seqEl);
  };

  const ButtonComponent = () => {
    const __clicked = __();
    const onClick = () => {
      __clicked.t = true;
    };
    const __seqEl = __([__clicked])
      .__(() => (<div>{PhysicsComponent()}</div>));

    return (<div>
      <div><button onClick={onClick}>{"Physics Start"}</button></div>
      {__Component(__seqEl)}
           </div>
      );
  };

  const TopElement = (
  <div>
     <p>{"HelloElement!!"}</p>
      {TextComponent()}
      {"====================="}
      {TimerComponent()}
      {"====================="}
      <div>{CounterComponentStateHistory()}</div>
      {"====================="}
      {CounterReloadComponent()}
      {"====================="}
      {CounterComponent()}
      {"====================="}
      {ButtonComponent()}
      {"====================="}
  </div>
  );

  const mount = ReactDOM.render(TopElement, document.getElementById('container'));

})();
