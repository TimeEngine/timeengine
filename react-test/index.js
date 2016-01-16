"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/*global React __ Immutable __Component*/

//this code is required to transpile by `npm run jsx`

(function () {
  'use strict';

  var TextComponent = function TextComponent() {
    var __value = __();
    var onChange = function onChange(e) {
      __value.t = e.target.value;
      __value.log("__value");
    };

    var __seqEl = __([__value]).__(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 1);

      var value = _ref2[0];
      return React.createElement(
        "div",
        null,
        React.createElement("input", { type: "text", value: value, onChange: onChange })
      );
    });

    __value.t = "default text";
    return __Component(__seqEl);
  };

  // `.intervalSeq` is to map Immutable-js infinite Sequence
  //                       onto TimeEngine infinite Sequence
  // map natural numbers sequence onto intervalSeq(1000)
  var TimerComponent = function TimerComponent() {
    return __Component(__.intervalSeq(Immutable.Range(), 1000).__(function (count) {
      return __.log.t = count;
    }) //console.log
    .__(function (count) {
      return React.createElement(
        "div",
        null,
        "Timer : ",
        count
      );
    }));
  };

  var PhysicsComponent = function PhysicsComponent() {
    //-------Physics-------------------------------
    //MKS system of units
    var V0 = 85.0; // m/s
    var DEG = 40; //degree
    var THETA = DEG / 180 * Math.PI; //radian
    var G = 9.8; //gravity const

    //10msec time resolution
    //t seconds elapsed
    var t = __.intervalSeq(Immutable.Range(), 10).__(function (count) {
      return count * 10 / 1000;
    });
    var x = t.__(function (t) {
      return V0 * Math.cos(THETA) * t;
    });
    var y = t.__(function (t) {
      return V0 * Math.sin(THETA) * t - 1 / 2 * G * Math.pow(t, 2);
    });
    //==============================================================
    var Drawscale = 1; //1 dot = 1 meter
    var __seqEl = __([x, y]) //atomic update
    .__(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2);

      var x = _ref4[0];
      var y = _ref4[1];
      return React.createElement(
        "div",
        null,
        React.createElement(
          "svg",
          { height: "250", width: "100%" },
          React.createElement("circle", { r: "3", fill: "red",
            cx: 50 + x * Drawscale, cy: 250 - y * Drawscale })
        )
      );
    });

    return __Component(__seqEl);
  };

  var ButtonComponent = function ButtonComponent() {
    var __clicked = __();
    var onClick = function onClick() {
      __clicked.t = true;
    };

    var __seqEl = __([__clicked]).__(function () {
      return React.createElement(
        "div",
        null,
        PhysicsComponent()
      );
    });

    return React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        null,
        React.createElement(
          "button",
          { onClick: onClick },
          "Physics Start"
        )
      ),
      __Component(__seqEl)
    );
  };

  var TopElement = React.createElement(
    "div",
    null,
    React.createElement(
      "p",
      null,
      "HelloElement!!"
    ),
    TextComponent(),
    "=====================",
    TimerComponent(),
    "=====================",
    ButtonComponent(),
    "====================="
  );

  var mount = React.render(TopElement, document.getElementById('container'));
})();
