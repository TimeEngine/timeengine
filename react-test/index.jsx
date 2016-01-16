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
      .__((count) => (<div>Timer : {count}</div>)));
  };

  const PhysicsComponent = () => {
    //-------Physics-------------------------------
    //MKS system of units
    const V0 = 85.0; // m/s
    const DEG = 40; //degree
    const THETA = DEG / 180 * Math.PI; //radian
    const G = 9.8; //gravity const

    //10msec time resolution
    //t seconds elapsed
    const t = __
      .intervalSeq(Immutable.Range(), 10)
      .__((count) => (count * 10 / 1000));
    const x = t.__((t) => V0 * Math.cos(THETA) * t);
    const y = t.__((t) => V0 * Math.sin(THETA) * t - 1 / 2 * G * Math.pow(t, 2));
    //==============================================================
    const Drawscale = 1; //1 dot = 1 meter
    const __seqEl = __([x, y]) //atomic update
      .__(([x, y]) => (
      <div>
        <svg height = "250"  width = "100%">
            <circle r="3" fill="red"
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
      <div><button onClick={onClick}>Physics Start</button></div>
      {__Component(__seqEl)}
      </div>
      );
  };

  const TopElement = (
  <div>
      <p>HelloElement!!</p>

      {TextComponent()}
      =====================
      {TimerComponent()}
      =====================
      {ButtonComponent()}
      =====================
  </div>
  );

  const mount = ReactDOM.render(TopElement, document.getElementById('container'));

})();
