(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Car, Ctrl, S, Solver, Traffic, _, angular, d3, visDer;

angular = require('angular');

d3 = require('d3');

_ = require('lodash');

S = require('./settings');

Traffic = require('./models/traffic');

Car = require('./models/car');

Solver = require('./models/solver');

Ctrl = (function() {
  function Ctrl(scope) {
    this.scope = scope;
    _.assign(this, {
      paused: true,
      traffic: new Traffic,
      solver: new Solver
    });
    this.scope.traffic = this.traffic;
    this.scope.S = S;
    this.scope.$watch(function() {
      return S.sum();
    }, (function(_this) {
      return function() {
        return _this.on_change();
      };
    })(this), true);
  }

  Ctrl.prototype.on_change = function() {
    this.data_theory = this.solver.find_mfd();
    return this.traffic.reset();
  };

  Ctrl.prototype.rotator = function(car) {
    return "rotate(" + (S.scale(car.loc)) + ") translate(0,50)";
  };

  Ctrl.prototype.click = function(val) {
    if (!val) {
      return this.play();
    }
  };

  Ctrl.prototype.pause = function() {
    return this.paused = true;
  };

  Ctrl.prototype.tick = function() {
    return d3.timer((function(_this) {
      return function() {
        S.advance();
        _this.traffic.tick();
        _this.scope.$evalAsync();
        return _this.paused;
      };
    })(this));
  };

  Ctrl.prototype.play = function() {
    this.pause();
    this.paused = false;
    return this.tick();
  };

  return Ctrl;

})();

visDer = function() {
  var directive;
  return directive = {
    scope: {},
    controllerAs: 'vm',
    templateUrl: './dist/vis.html',
    controller: ['$scope', Ctrl]
  };
};

angular.module('mainApp', [require('angular-material', require('angular-animate'))]).directive('visDer', visDer).directive('datum', require('./directives/datum')).directive('d3Der', require('./directives/d3Der')).directive('mfdChart', require('./mfd')).directive('horAxis', require('./directives/xAxis')).directive('verAxis', require('./directives/yAxis')).directive('sliderDer', require('./directives/slider'));



},{"./directives/d3Der":2,"./directives/datum":3,"./directives/slider":4,"./directives/xAxis":5,"./directives/yAxis":6,"./mfd":8,"./models/car":9,"./models/solver":12,"./models/traffic":13,"./settings":14,"angular":undefined,"angular-animate":undefined,"angular-material":undefined,"d3":undefined,"lodash":undefined}],2:[function(require,module,exports){
var angular, d3, der;

d3 = require('d3');

angular = require('angular');

der = function($parse) {
  var directive;
  return directive = {
    restrict: 'A',
    scope: {
      d3Der: '=',
      tran: '='
    },
    link: function(scope, el, attr) {
      var hasTransitioned, sel, u;
      sel = d3.select(el[0]);
      u = 't-' + Math.random();
      hasTransitioned = false;
      return scope.$watch('d3Der', function(v) {
        if (scope.tran && hasTransitioned) {
          hasTransitioned = true;
          return sel.transition(u).attr(v).call(scope.tran);
        } else {
          hasTransitioned = true;
          return sel.attr(v);
        }
      }, true);
    }
  };
};

module.exports = der;



},{"angular":undefined,"d3":undefined}],3:[function(require,module,exports){
module.exports = function($parse) {
  return function(scope, el, attr) {
    return d3.select(el[0]).datum($parse(attr.datum)(scope));
  };
};



},{}],4:[function(require,module,exports){
var der;

der = function() {
  var res;
  return res = {
    scope: {
      label: '@',
      myData: '=',
      min: '=',
      max: '=',
      step: '='
    },
    replace: true,
    templateUrl: './dist/slider.html'
  };
};

module.exports = der;



},{}],5:[function(require,module,exports){
var d3, der;

d3 = require('d3');

der = function() {
  var directive;
  return directive = {
    restrict: 'A',
    scope: {
      fun: '='
    },
    link: function(scope, el, attr) {
      var scale, sel;
      scale = scope.fun.scale();
      sel = d3.select(el[0]).classed('hor axis', true);
      return sel.call(scope.fun);
    }
  };
};

module.exports = der;



},{"d3":undefined}],6:[function(require,module,exports){
var d3, der;

d3 = require('d3');

der = function() {
  var directive;
  return directive = {
    restrict: 'A',
    scope: {
      fun: '='
    },
    link: function(scope, el, attr) {
      var scale, sel;
      scale = scope.fun.scale();
      sel = d3.select(el[0]).classed('ver axis', true);
      return sel.call(scope.fun);
    }
  };
};

module.exports = der;



},{"d3":undefined}],7:[function(require,module,exports){
'use strict';
Function.prototype.property = function(prop, desc) {
  return Object.defineProperty(this.prototype, prop, desc);
};



},{}],8:[function(require,module,exports){
var Ctrl, S, _, d3, der;

d3 = require('d3');

_ = require('lodash');

S = require('./settings');

Ctrl = (function() {
  function Ctrl(scope, el) {
    this.scope = scope;
    _.assign(this, {
      width: 300,
      height: 300,
      m: {
        t: 10,
        l: 40,
        r: 18,
        b: 35
      }
    });
    this.hor = d3.scale.linear().domain([0, 5]).range([0, this.width]);
    this.ver = d3.scale.linear().domain([0, 5]).range([this.height, 0]);
    this.line = d3.svg.line().x((function(_this) {
      return function(d) {
        return _this.hor(d.k);
      };
    })(this)).y((function(_this) {
      return function(d) {
        return _this.ver(d.q);
      };
    })(this)).defined(function(d) {
      return d.q > 0;
    });
    this.horAxis = d3.svg.axis().scale(this.hor).orient('bottom').ticks(8);
    this.verAxis = d3.svg.axis().scale(this.ver).orient('left');
  }

  Ctrl.prototype.d = function() {
    return this.line(this.data);
  };

  return Ctrl;

})();

der = function() {
  var directive;
  return directive = {
    bindToController: true,
    controllerAs: 'vm',
    scope: {
      data: '='
    },
    templateUrl: './dist/mfdChart.html',
    controller: ['$scope', '$element', Ctrl]
  };
};

module.exports = der;



},{"./settings":14,"d3":undefined,"lodash":undefined}],9:[function(require,module,exports){
var Car, S, _;

S = require('../settings');

_ = require('lodash');

Car = (function() {
  function Car() {
    this.id = _.uniqueId('car-');
    this.color = _.sample(S.colors.domain());
  }

  Car.prototype.set_loc = function(loc) {
    this.loc = loc;
  };

  return Car;

})();

module.exports = Car;



},{"../settings":14,"lodash":undefined}],10:[function(require,module,exports){
var Cell, S, _;

S = require('../settings');

_ = require('lodash');

Cell = (function() {
  function Cell(loc) {
    this.loc = loc;
    this.last = -Infinity;
    this.temp_car = this.car = false;
    this.id = _.uniqueId('cell');
  }

  Cell.prototype.set_signal = function(signal) {
    this.signal = signal;
    return this.signal.loc = this.loc;
  };

  Cell.prototype.clear_signal = function() {
    return this.signal = void 0;
  };

  Cell.prototype.space = 4;

  Cell.prototype.receive = function(car) {
    car.set_loc(this.loc);
    this.last = S.time;
    this.temp_car = car;
    return car.cell = this;
  };

  Cell.prototype.remove = function() {
    return this.temp_car = false;
  };

  Cell.prototype.finalize = function() {
    var ref;
    if ((ref = this.signal) != null) {
      ref.tick();
    }
    if ((this.car = this.temp_car)) {
      return this.last = S.time;
    }
  };

  Cell.prototype.is_free = function() {
    if (this.signal) {
      return this.signal.green && (S.time - this.last) > this.space;
    } else {
      return (S.time - this.last) > this.space;
    }
  };

  return Cell;

})();

module.exports = Cell;



},{"../settings":14,"lodash":undefined}],11:[function(require,module,exports){
var S, Signal, _;

S = require('../settings');

_ = require('lodash');

Signal = (function() {
  function Signal(i) {
    this.i = i;
    this.count = 0;
    this.green = true;
    this.id = _.uniqueId('signal-');
    this.reset();
  }

  Signal.prototype.reset = function() {
    var ref;
    this.offset = S.cycle * ((this.i * S.offset) % 1);
    return ref = [this.offset, true], this.count = ref[0], this.green = ref[1], ref;
  };

  Signal.prototype.tick = function() {
    var ref;
    this.count++;
    if (this.count >= S.phase) {
      ref = [0, true], this.count = ref[0], this.green = ref[1];
      return;
    }
    if (this.count >= (S.green * S.phase)) {
      return this.green = false;
    }
  };

  return Signal;

})();

module.exports = Signal;



},{"../settings":14,"lodash":undefined}],12:[function(require,module,exports){
var S, Solver, _, d3;

d3 = require('d3');

_ = require('lodash');

S = require('../settings');

Solver = (function() {
  function Solver() {}

  Solver.prototype.solve = function() {
    var kj, l, red_time, ref, ref1, res, time_arrival, time_stopped, time_traveling, x;
    red_time = S.red_time;
    kj = S.q0 * (1 / S.vf + 1 / S.w);
    res = [];
    ref = [0, 1000, 0], x = ref[0], time_stopped = ref[1], l = ref[2];
    while (time_stopped > 0 && l < 10) {
      time_traveling = x / S.vf;
      time_arrival = red_time + time_traveling;
      time_stopped = this.green_left(time_arrival, l);
      res.push({
        x: x,
        t: time_arrival + time_stopped,
        g: time_stopped,
        l: l,
        c: S.q0 * time_stopped
      });
      x += S.d;
      l += 1;
    }
    ref1 = [-S.d / S.w, 1000, -1], x = ref1[0], time_stopped = ref1[1], l = ref1[2];
    while (time_stopped > 0 && l > -10) {
      time_traveling = -x / S.w;
      time_arrival = red_time + time_traveling;
      time_stopped = this.green_left(time_arrival, l);
      res.push({
        x: x,
        t: time_arrival + time_stopped,
        g: time_stopped,
        l: l,
        c: kj * time_traveling + S.q0 * time_stopped
      });
      x -= S.d;
      l -= 1;
    }
    return res;
  };

  Solver.prototype.green_left = function(t, l) {
    var leftover, red_time;
    red_time = S.red_time;
    leftover = (t + Math.abs(l) * S.delta) % S.cycle;
    if (leftover < red_time) {
      return 0;
    } else {
      return S.cycle - leftover;
    }
  };

  Solver.prototype.find_min = function(k) {
    var e, flow, flow_l, i, len, ref, res;
    flow = Infinity;
    res;
    ref = this.table;
    for (i = 0, len = ref.length; i < len; i++) {
      e = ref[i];
      flow_l = (e.c + k * e.x) / e.t;
      if (flow_l < flow) {
        flow = flow_l;
        res = e;
      }
    }
    res.k = k;
    res.q = flow;
    return res;
  };

  Solver.prototype.find_mfd = function() {
    var i, k, len, ref, results;
    this.table = this.solve();
    ref = _.range(.2, 10, 1 / 5);
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      k = ref[i];
      results.push(this.find_min(k));
    }
    return results;
  };

  return Solver;

})();

module.exports = Solver;



},{"../settings":14,"d3":undefined,"lodash":undefined}],13:[function(require,module,exports){
var Car, Cell, S, Signal, Traffic, _;

S = require('../settings');

_ = require('lodash');

Car = require('./car');

Signal = require('./signal');

Cell = require('./cell');

Traffic = (function() {
  function Traffic() {
    var n;
    this.cells = (function() {
      var j, ref, results;
      results = [];
      for (n = j = 0, ref = S.num_cells; 0 <= ref ? j < ref : j > ref; n = 0 <= ref ? ++j : --j) {
        results.push(new Cell(n));
      }
      return results;
    })();
  }

  Traffic.prototype.reset = function() {
    var c, cell, i, j, l, len, len1, loc, m, num_cars, num_cells, o, ref, ref1, ref2, ref3, ref4, results, results1, signal, which;
    num_cars = S.num_cars;
    num_cells = S.num_cells;
    this.cars = (function() {
      results = [];
      for (var j = 0, ref = S.num_cars; 0 <= ref ? j < ref : j > ref; 0 <= ref ? j++ : j--){ results.push(j); }
      return results;
    }).apply(this).map(function() {
      return new Car();
    });
    this.signals = [];
    ref1 = this.cells;
    for (l = 0, len = ref1.length; l < len; l++) {
      cell = ref1[l];
      cell.clear_signal();
    }
    for (i = m = 0, ref2 = S.num_signals; 0 <= ref2 ? m < ref2 : m > ref2; i = 0 <= ref2 ? ++m : --m) {
      signal = new Signal(i);
      this.signals.push(signal);
      which = Math.floor(i / num_cars * S.num_cells);
      this.cells[which].set_signal(signal);
    }
    ref3 = this.cars;
    results1 = [];
    for (i = o = 0, len1 = ref3.length; o < len1; i = ++o) {
      c = ref3[i];
      loc = Math.round(num_cells * i / this.cars.length);
      if (!((ref4 = this.cells[loc]) != null ? ref4.car : void 0)) {
        results1.push(this.cells[loc].receive(c));
      } else {
        results1.push(void 0);
      }
    }
    return results1;
  };

  Traffic.prototype.tick = function() {
    var cell, i, j, k, l, len, len1, ref, results;
    k = this.cells;
    for (i = j = 0, len = k.length; j < len; i = ++j) {
      cell = k[i];
      if (cell.car) {
        if (k[(i + 1) % k.length].is_free()) {
          k[(i + 1) % k.length].receive(cell.car);
          cell.remove();
        } else {
          debugger;
        }
      }
    }
    ref = this.cells;
    results = [];
    for (l = 0, len1 = ref.length; l < len1; l++) {
      cell = ref[l];
      results.push(cell.finalize());
    }
    return results;
  };

  return Traffic;

})();

module.exports = Traffic;



},{"../settings":14,"./car":9,"./cell":10,"./signal":11,"lodash":undefined}],14:[function(require,module,exports){
var Settings, _, d3;

d3 = require('d3');

_ = require('lodash');

require('./helpers');

Settings = (function() {
  function Settings() {
    _.assign(this, {
      num_cells: 5000,
      _num_cars: 100,
      _k: 300 / 1000,
      _num_signals: 0,
      _offset: .3,
      _d: 3,
      time: 0,
      space: 3,
      red: .5,
      cycle: 50,
      vf: 3,
      w: 1,
      q0: 3
    });
    this.colors = d3.scale.linear().domain(_.range(0, this.num_cells, this.num_cells / 6)).range(['#F44336', '#2196F3', '#E91E63', '#00BCD4', '#FFC107', '#4CAF50']);
    this.scale = d3.scale.linear().domain([0, this.num_cells]).range([0, 360]);
  }

  Settings.prototype.sum = function() {
    return this.cycle;
  };

  Settings.property('num_cars', {
    get: function() {
      return this._num_cars;
    },
    set: function(num_cars) {
      this._num_cars = Math.round(num_cars);
      return this._k = v / S.num_cells;
    }
  });

  Settings.property('k', {
    get: function() {
      return this._k;
    },
    set: function(k) {
      this._k = k;
      return this._num_cars = Math.round(k * S.num_cells);
    }
  });

  Settings.property('delta', {
    get: function() {
      return this._offset * this.cycle;
    }
  });

  Settings.property('red_time', {
    get: function() {
      return this.cycle * this.red;
    }
  });

  Settings.property('d', {
    get: function() {
      return this._d;
    },
    set: function(d) {
      this._num_signals = Math.round(this.num_cells / d);
      this._d = this.num_cells / this._num_signals;
      return this._offset = Math.round(this._offset * this._num_signals) / this._num_signals;
    }
  });

  Settings.property('num_signals', {
    get: function() {
      return this._num_signals;
    },
    set: function(num_signals) {
      this._num_signals = this.num_signals;
      this._d = Math.round(this.num_cells / this._num_signals);
      return this._offset = Math.round(this._offset * this.num_signals) / this.num_signals;
    }
  });

  Settings.property('offset', {
    get: function() {
      return this._offset;
    },
    set: function(offset) {
      return this._offset = Math.round(this._offset * this.num_signals) / this.num_signals;
    }
  });

  Settings.prototype.advance = function() {
    return this.time++;
  };

  return Settings;

})();

module.exports = new Settings();



},{"./helpers":7,"d3":undefined,"lodash":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL2FwcC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL2RpcmVjdGl2ZXMvZDNEZXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9kaXJlY3RpdmVzL2RhdHVtLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvZGlyZWN0aXZlcy9zbGlkZXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9kaXJlY3RpdmVzL3hBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvZGlyZWN0aXZlcy95QXhpcy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL2hlbHBlcnMuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9tZmQuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9tb2RlbHMvY2FyLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvbW9kZWxzL2NlbGwuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9tb2RlbHMvc2lnbmFsLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvbW9kZWxzL3NvbHZlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL21vZGVscy90cmFmZmljLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25h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QUREOztFQVFBLFFBQUMsQ0FBQSxRQUFELENBQVUsUUFBVixFQUNDO0lBQUEsR0FBQSxFQUFJLFNBQUE7YUFDSCxJQUFDLENBQUE7SUFERSxDQUFKO0lBRUEsR0FBQSxFQUFJLFNBQUMsTUFBRDthQUNILElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxXQUF2QixDQUFBLEdBQW9DLElBQUMsQ0FBQTtJQUQ3QyxDQUZKO0dBREQ7O3FCQU9BLE9BQUEsR0FBUyxTQUFBO1dBQ1IsSUFBQyxDQUFBLElBQUQ7RUFEUTs7Ozs7O0FBR1YsTUFBTSxDQUFDLE9BQVAsR0FBcUIsSUFBQSxRQUFBLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiYW5ndWxhciA9IHJlcXVpcmUgJ2FuZ3VsYXInXG5kMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuVHJhZmZpYyA9IHJlcXVpcmUgJy4vbW9kZWxzL3RyYWZmaWMnXG5DYXIgPSByZXF1aXJlICcuL21vZGVscy9jYXInXG5Tb2x2ZXIgPSByZXF1aXJlICcuL21vZGVscy9zb2x2ZXInXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRwYXVzZWQ6IHRydWVcblx0XHRcdHRyYWZmaWM6IG5ldyBUcmFmZmljXG5cdFx0XHRzb2x2ZXI6IG5ldyBTb2x2ZXJcblx0XHRAc2NvcGUudHJhZmZpYyA9IEB0cmFmZmljXG5cblx0XHRAc2NvcGUuUyA9IFNcblxuXHRcdEBzY29wZS4kd2F0Y2ggLT5cblx0XHRcdFMuc3VtKClcblx0XHQsID0+XG5cdFx0XHRAb25fY2hhbmdlKClcblx0XHQsIHRydWVcblx0XHRcblx0b25fY2hhbmdlOiAtPlxuXHRcdEBkYXRhX3RoZW9yeSA9IEBzb2x2ZXIuZmluZF9tZmQoKVxuXHRcdEB0cmFmZmljLnJlc2V0KClcdFx0XG5cblx0cm90YXRvcjogKGNhciktPiBcInJvdGF0ZSgje1Muc2NhbGUoY2FyLmxvYyl9KSB0cmFuc2xhdGUoMCw1MClcIlxuXG5cdGNsaWNrOiAodmFsKSAtPiBpZiAhdmFsIHRoZW4gQHBsYXkoKVxuXHRwYXVzZTogLT4gQHBhdXNlZCA9IHRydWVcblx0dGljazogLT5cblx0XHRkMy50aW1lciA9PlxuXHRcdFx0XHRTLmFkdmFuY2UoKVxuXHRcdFx0XHRAdHJhZmZpYy50aWNrKClcblx0XHRcdFx0QHNjb3BlLiRldmFsQXN5bmMoKVxuXHRcdFx0XHRAcGF1c2VkXG5cdHBsYXk6IC0+XG5cdFx0QHBhdXNlKClcblx0XHRAcGF1c2VkID0gZmFsc2Vcblx0XHRAdGljaygpXG5cbnZpc0RlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHNjb3BlOiB7fVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L3Zpcy5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgQ3RybF1cblxuYW5ndWxhci5tb2R1bGUgJ21haW5BcHAnICwgW3JlcXVpcmUgJ2FuZ3VsYXItbWF0ZXJpYWwnICwgcmVxdWlyZSAnYW5ndWxhci1hbmltYXRlJ11cblx0LmRpcmVjdGl2ZSAndmlzRGVyJywgdmlzRGVyXG5cdC5kaXJlY3RpdmUgJ2RhdHVtJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL2RhdHVtJ1xuXHQuZGlyZWN0aXZlICdkM0RlcicsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9kM0Rlcidcblx0LmRpcmVjdGl2ZSAnbWZkQ2hhcnQnLCByZXF1aXJlICcuL21mZCdcblx0LmRpcmVjdGl2ZSAnaG9yQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy94QXhpcydcblx0LmRpcmVjdGl2ZSAndmVyQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy95QXhpcydcblx0LmRpcmVjdGl2ZSAnc2xpZGVyRGVyJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3NsaWRlcidcbiIsImQzID0gcmVxdWlyZSAnZDMnXG5hbmd1bGFyID0gcmVxdWlyZSAnYW5ndWxhcidcblxuZGVyID0gKCRwYXJzZSktPiAjZ29lcyBvbiBhIHN2ZyBlbGVtZW50XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRzY29wZTogXG5cdFx0XHRkM0RlcjogJz0nXG5cdFx0XHR0cmFuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdHUgPSAndC0nICsgTWF0aC5yYW5kb20oKVxuXHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gZmFsc2Vcblx0XHRcdHNjb3BlLiR3YXRjaCAnZDNEZXInXG5cdFx0XHRcdCwgKHYpLT5cblx0XHRcdFx0XHRpZiBzY29wZS50cmFuIGFuZCBoYXNUcmFuc2l0aW9uZWRcblx0XHRcdFx0XHRcdGhhc1RyYW5zaXRpb25lZCA9IHRydWVcblx0XHRcdFx0XHRcdHNlbC50cmFuc2l0aW9uIHVcblx0XHRcdFx0XHRcdFx0LmF0dHIgdlxuXHRcdFx0XHRcdFx0XHQuY2FsbCBzY29wZS50cmFuXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gdHJ1ZVxuXHRcdFx0XHRcdFx0c2VsLmF0dHIgdlxuXHRcdFx0XHQsIHRydWVcbm1vZHVsZS5leHBvcnRzID0gZGVyIiwibW9kdWxlLmV4cG9ydHMgPSAoJHBhcnNlKS0+XG5cdChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRkMy5zZWxlY3QoZWxbMF0pLmRhdHVtICRwYXJzZShhdHRyLmRhdHVtKShzY29wZSkiLCJkZXIgPSAtPlxuXHRyZXMgPSBcblx0XHRzY29wZTogXG5cdFx0XHRsYWJlbDogJ0AnXG5cdFx0XHRteURhdGE6ICc9J1xuXHRcdFx0bWluOiAnPSdcblx0XHRcdG1heDogJz0nXG5cdFx0XHRzdGVwOiAnPSdcblx0XHQjIGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHJlcGxhY2U6IHRydWVcblx0XHQjIGNvbnRyb2xsZXI6IC0+XG5cdFx0IyBiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3Qvc2xpZGVyLmh0bWwnXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcblxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGZ1bjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2NhbGUgPSBzY29wZS5mdW4uc2NhbGUoKVxuXG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LmNsYXNzZWQgJ2hvciBheGlzJywgdHJ1ZVxuXG5cdFx0XHRzZWwuY2FsbCBzY29wZS5mdW5cblx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZnVuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzY2FsZSA9IHNjb3BlLmZ1bi5zY2FsZSgpXG5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuY2xhc3NlZCAndmVyIGF4aXMnLCB0cnVlXG5cblx0XHRcdHNlbC5jYWxsIHNjb3BlLmZ1blxuXHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsIid1c2Ugc3RyaWN0J1xuXG5GdW5jdGlvbjo6cHJvcGVydHkgPSAocHJvcCwgZGVzYykgLT5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsIHByb3AsIGRlc2MiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsZWwpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0d2lkdGg6IDMwMFxuXHRcdFx0aGVpZ2h0OiAzMDBcblx0XHRcdG06IFxuXHRcdFx0XHR0OiAxMFxuXHRcdFx0XHRsOiA0MFxuXHRcdFx0XHRyOiAxOFxuXHRcdFx0XHRiOiAzNVxuXG5cdFx0QGhvciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHRcdC5kb21haW4gWzAsNV1cblx0XHRcdFx0LnJhbmdlIFswLEB3aWR0aF1cblxuXHRcdEB2ZXIgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCwgNV1cblx0XHRcdC5yYW5nZSBbQGhlaWdodCwgMF1cblxuXHRcdEBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQua1xuXHRcdFx0LnkgKGQpPT5AdmVyIGQucVxuXHRcdFx0LmRlZmluZWQgKGQpLT5kLnE+MFxuXG5cdFx0QGhvckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQGhvclxuXHRcdFx0Lm9yaWVudCAnYm90dG9tJ1xuXHRcdFx0LnRpY2tzIDhcblxuXHRcdEB2ZXJBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEB2ZXJcblx0XHRcdC5vcmllbnQgJ2xlZnQnXG5cblx0ZDogLT5cblx0XHRAbGluZSBAZGF0YVxuXHRcbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHRzY29wZTogXG5cdFx0XHRkYXRhOiAnPSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC9tZmRDaGFydC5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJTID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuXG5jbGFzcyBDYXJcblx0Y29uc3RydWN0b3I6LT5cblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdjYXItJ1xuXHRcdEBjb2xvciA9IF8uc2FtcGxlIFMuY29sb3JzLmRvbWFpbigpXG5cblx0c2V0X2xvYzogKEBsb2MpLT5cblxubW9kdWxlLmV4cG9ydHMgPSBDYXIiLCJTID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuXG5jbGFzcyBDZWxsXG5cdGNvbnN0cnVjdG9yOiAoQGxvYyktPlxuXHRcdEBsYXN0ID0gLUluZmluaXR5XG5cdFx0QHRlbXBfY2FyID0gQGNhciA9IGZhbHNlXG5cdFx0QGlkID0gXy51bmlxdWVJZCAnY2VsbCdcblxuXHRzZXRfc2lnbmFsOiAoQHNpZ25hbCktPlxuXHRcdEBzaWduYWwubG9jID0gQGxvY1xuXG5cdGNsZWFyX3NpZ25hbDogLT5cblx0XHRAc2lnbmFsID0gdW5kZWZpbmVkXG5cblx0c3BhY2U6IDRcblxuXHRyZWNlaXZlOihjYXIpLT5cblx0XHRjYXIuc2V0X2xvYyBAbG9jXG5cdFx0QGxhc3QgPSBTLnRpbWVcblx0XHRAdGVtcF9jYXIgPSBjYXJcblx0XHRjYXIuY2VsbCA9IHRoaXNcblxuXHRyZW1vdmU6IC0+XG5cdFx0QHRlbXBfY2FyID0gZmFsc2VcblxuXHRmaW5hbGl6ZTogLT5cblx0XHRAc2lnbmFsPy50aWNrKClcblx0XHRpZiAoQGNhcj1AdGVtcF9jYXIpXG5cdFx0XHRAbGFzdCA9IFMudGltZVxuXG5cdGlzX2ZyZWU6IC0+XG5cdFx0aWYgQHNpZ25hbFxuXHRcdFx0QHNpZ25hbC5ncmVlbiBhbmQgKFMudGltZS1AbGFzdCk+QHNwYWNlXG5cdFx0ZWxzZVxuXHRcdFx0KFMudGltZS1AbGFzdCk+QHNwYWNlXG5cbm1vZHVsZS5leHBvcnRzID0gQ2VsbCIsIlMgPSByZXF1aXJlICcuLi9zZXR0aW5ncydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5cbmNsYXNzIFNpZ25hbFxuXHRjb25zdHJ1Y3RvcjogKEBpKSAtPlxuXHRcdEBjb3VudCA9IDBcblx0XHRAZ3JlZW4gPSB0cnVlXG5cdFx0QGlkID0gXy51bmlxdWVJZCAnc2lnbmFsLSdcblx0XHRAcmVzZXQoKVxuXG5cdHJlc2V0OiAtPlxuXHRcdEBvZmZzZXQgPSBTLmN5Y2xlKigoQGkqUy5vZmZzZXQpJTEpXG5cdFx0W0Bjb3VudCwgQGdyZWVuXSA9IFtAb2Zmc2V0LCB0cnVlXVxuXG5cdHRpY2s6IC0+XG5cdFx0QGNvdW50Kytcblx0XHRpZiAoQGNvdW50KSA+PSAoUy5waGFzZSlcblx0XHRcdFtAY291bnQsIEBncmVlbl0gPSBbMCwgdHJ1ZV1cblx0XHRcdHJldHVyblxuXHRcdGlmIChAY291bnQpPj0gKFMuZ3JlZW4qUy5waGFzZSlcblx0XHRcdEBncmVlbiA9IGZhbHNlXG5cbm1vZHVsZS5leHBvcnRzID0gU2lnbmFsIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5cbmNsYXNzIFNvbHZlclxuXHRjb25zdHJ1Y3RvcjogLT5cblxuXHRzb2x2ZTotPlxuXHRcdHJlZF90aW1lID0gUy5yZWRfdGltZVxuXHRcdGtqID0gUy5xMCooMS9TLnZmKzEvUy53KVxuXHRcdHJlcyA9IFtdXG5cdFx0W3gsdGltZV9zdG9wcGVkLGxdID0gWzAsMTAwMCwwXVxuXHRcdHdoaWxlIHRpbWVfc3RvcHBlZD4wIGFuZCBsPDEwXG5cdFx0XHR0aW1lX3RyYXZlbGluZyA9IHgvUy52ZlxuXHRcdFx0dGltZV9hcnJpdmFsID0gcmVkX3RpbWUgKyB0aW1lX3RyYXZlbGluZ1xuXHRcdFx0dGltZV9zdG9wcGVkID0gQGdyZWVuX2xlZnQgdGltZV9hcnJpdmFsLGxcblx0XHRcdHJlcy5wdXNoIFxuXHRcdFx0XHR4OiB4XG5cdFx0XHRcdHQ6IHRpbWVfYXJyaXZhbCt0aW1lX3N0b3BwZWRcblx0XHRcdFx0ZzogdGltZV9zdG9wcGVkXG5cdFx0XHRcdGw6IGxcblx0XHRcdFx0YzogUy5xMCp0aW1lX3N0b3BwZWRcblx0XHRcdHgrPVMuZFxuXHRcdFx0bCs9MVxuXG5cdFx0W3gsdGltZV9zdG9wcGVkLGxdID0gWy1TLmQvUy53LCAxMDAwLC0xXVxuXHRcdHdoaWxlIHRpbWVfc3RvcHBlZD4wIGFuZCBsPi0xMFxuXHRcdFx0dGltZV90cmF2ZWxpbmc9IC14L1Mud1xuXHRcdFx0dGltZV9hcnJpdmFsID0gcmVkX3RpbWUgKyB0aW1lX3RyYXZlbGluZ1xuXHRcdFx0dGltZV9zdG9wcGVkID0gQGdyZWVuX2xlZnQgdGltZV9hcnJpdmFsLGxcblx0XHRcdHJlcy5wdXNoXG5cdFx0XHRcdHg6IHhcblx0XHRcdFx0dDogdGltZV9hcnJpdmFsICsgdGltZV9zdG9wcGVkXG5cdFx0XHRcdGc6IHRpbWVfc3RvcHBlZFxuXHRcdFx0XHRsOiBsXG5cdFx0XHRcdGM6IGtqKnRpbWVfdHJhdmVsaW5nICsgUy5xMCp0aW1lX3N0b3BwZWRcblx0XHRcdHgtPVMuZFxuXHRcdFx0bC09MVxuXHRcdHJlc1xuXG5cdGdyZWVuX2xlZnQ6ICh0LGwpLT5cblx0XHRyZWRfdGltZSA9IFMucmVkX3RpbWVcblx0XHRsZWZ0b3ZlciA9ICh0K01hdGguYWJzKGwpKlMuZGVsdGEpJVMuY3ljbGVcblx0XHRpZiBsZWZ0b3ZlcjxyZWRfdGltZVxuXHRcdFx0MFxuXHRcdGVsc2Vcblx0XHRcdFMuY3ljbGUtbGVmdG92ZXJcblxuXHRmaW5kX21pbjogKGspLT5cblx0XHRmbG93ID0gSW5maW5pdHlcblx0XHRyZXNcblx0XHRmb3IgZSBpbiBAdGFibGVcblx0XHRcdGZsb3dfbCA9IChlLmMgKyBrKmUueCkvKGUudClcblx0XHRcdGlmIGZsb3dfbDxmbG93XG5cdFx0XHRcdGZsb3cgPSBmbG93X2xcblx0XHRcdFx0cmVzID0gZVxuXHRcdHJlcy5rID0ga1xuXHRcdHJlcy5xID0gZmxvd1xuXHRcdHJldHVybiByZXNcblxuXHRmaW5kX21mZDotPlxuXHRcdEB0YWJsZSA9IEBzb2x2ZSgpXG5cdFx0KEBmaW5kX21pbiBrIGZvciBrIGluIF8ucmFuZ2UgLjIsMTAsMS81IClcblxubW9kdWxlLmV4cG9ydHMgPSBTb2x2ZXIiLCJTID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuQ2FyID0gcmVxdWlyZSAnLi9jYXInXG5TaWduYWwgPSByZXF1aXJlICcuL3NpZ25hbCdcbkNlbGwgPSByZXF1aXJlICcuL2NlbGwnXG5cbmNsYXNzIFRyYWZmaWNcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QGNlbGxzID0gKG5ldyBDZWxsIG4gZm9yIG4gaW4gWzAuLi5TLm51bV9jZWxsc10pXG5cblx0cmVzZXQ6IC0+XG5cdFx0bnVtX2NhcnMgPSBTLm51bV9jYXJzXG5cdFx0bnVtX2NlbGxzID0gUy5udW1fY2VsbHNcblx0XHRAY2FycyA9IFswLi4uUy5udW1fY2Fyc10ubWFwIC0+IG5ldyBDYXIoKVxuXHRcdEBzaWduYWxzID0gW11cblx0XHRjZWxsLmNsZWFyX3NpZ25hbCgpIGZvciBjZWxsIGluIEBjZWxsc1xuXHRcdGZvciBpIGluIFswLi4uUy5udW1fc2lnbmFsc11cblx0XHRcdHNpZ25hbCA9IG5ldyBTaWduYWwgaVxuXHRcdFx0QHNpZ25hbHMucHVzaCBzaWduYWxcblx0XHRcdHdoaWNoID0gTWF0aC5mbG9vcihpL251bV9jYXJzKlMubnVtX2NlbGxzKVxuXHRcdFx0QGNlbGxzW3doaWNoXS5zZXRfc2lnbmFsIHNpZ25hbFxuXG5cdFx0Zm9yIGMsaSBpbiBAY2Fyc1xuXHRcdFx0bG9jID0gTWF0aC5yb3VuZChudW1fY2VsbHMqaS9AY2Fycy5sZW5ndGgpXG5cdFx0XHR1bmxlc3MgQGNlbGxzW2xvY10/LmNhclxuXHRcdFx0XHRAY2VsbHNbbG9jXS5yZWNlaXZlIGNcblxuXHR0aWNrOi0+XG5cdFx0ayA9IEBjZWxsc1xuXG5cdFx0Zm9yIGNlbGwsaSBpbiBrXG5cdFx0XHRpZiBjZWxsLmNhclxuXHRcdFx0XHRpZiBrWyhpKzEpJWsubGVuZ3RoXS5pc19mcmVlKClcblx0XHRcdFx0XHRrWyhpKzEpJWsubGVuZ3RoXS5yZWNlaXZlIGNlbGwuY2FyXG5cdFx0XHRcdFx0Y2VsbC5yZW1vdmUoKVxuXHRcdFx0XHRlbHNlIGRlYnVnZ2VyXG5cblx0XHRjZWxsLmZpbmFsaXplKCkgZm9yIGNlbGwgaW4gQGNlbGxzXG5cbm1vZHVsZS5leHBvcnRzID0gVHJhZmZpY1xuIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5yZXF1aXJlICcuL2hlbHBlcnMnXG5cbmNsYXNzIFNldHRpbmdzXG5cdGNvbnN0cnVjdG9yOi0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdG51bV9jZWxsczogNTAwMFxuXHRcdFx0X251bV9jYXJzOiAxMDBcblx0XHRcdF9rOiAzMDAvMTAwMFxuXHRcdFx0X251bV9zaWduYWxzOiAwXG5cdFx0XHRfb2Zmc2V0OiAuM1xuXHRcdFx0X2Q6IDNcblx0XHRcdHRpbWU6IDBcblx0XHRcdHNwYWNlOiAzXG5cdFx0XHRyZWQ6IC41XG5cdFx0XHRjeWNsZTogNTBcblx0XHRcdHZmOiAzXG5cdFx0XHR3OiAxXG5cdFx0XHRxMDogM1xuXG5cdFx0QGNvbG9ycyA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIF8ucmFuZ2UgMCxAbnVtX2NlbGxzLEBudW1fY2VsbHMvNlxuXHRcdFx0LnJhbmdlIFtcblx0XHRcdFx0JyNGNDQzMzYnLCAjcmVkXG5cdFx0XHRcdCcjMjE5NkYzJywgI2JsdWVcblx0XHRcdFx0JyNFOTFFNjMnLCAjcGlua1xuXHRcdFx0XHQnIzAwQkNENCcsICNjeWFuXG5cdFx0XHRcdCcjRkZDMTA3JywgI2FtYmVyXG5cdFx0XHRcdCcjNENBRjUwJywgI2dyZWVuXG5cdFx0XHRcdF1cblxuXHRcdEBzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLEBudW1fY2VsbHNdXG5cdFx0XHQucmFuZ2UgWzAsMzYwXVxuXG5cdHN1bTogLT5cblx0XHRAY3ljbGVcblxuXHRAcHJvcGVydHkgJ251bV9jYXJzJywgXG5cdFx0Z2V0Oi0+XG5cdFx0XHRAX251bV9jYXJzXG5cdFx0c2V0OihudW1fY2FycyktPlxuXHRcdFx0QF9udW1fY2FycyA9IE1hdGgucm91bmQgbnVtX2NhcnNcblx0XHRcdEBfayA9IHYvUy5udW1fY2VsbHNcblxuXHRAcHJvcGVydHkgJ2snLFxuXHRcdGdldDotPlxuXHRcdFx0QF9rXG5cdFx0c2V0OihrKS0+XG5cdFx0XHRAX2sgPSBrXG5cdFx0XHRAX251bV9jYXJzID0gTWF0aC5yb3VuZCBrKlMubnVtX2NlbGxzXG5cblx0QHByb3BlcnR5ICdkZWx0YScsXG5cdFx0Z2V0OiAtPlxuXHRcdFx0QF9vZmZzZXQqQGN5Y2xlXG5cblx0QHByb3BlcnR5ICdyZWRfdGltZScsXG5cdFx0Z2V0Oi0+XG5cdFx0XHRAY3ljbGUgKiBAcmVkXG5cblx0QHByb3BlcnR5ICdkJywgXG5cdFx0Z2V0Oi0+XG5cdFx0XHRAX2Rcblx0XHRzZXQ6KGQpLT5cblx0XHRcdEBfbnVtX3NpZ25hbHMgPSBNYXRoLnJvdW5kIEBudW1fY2VsbHMvZFxuXHRcdFx0QF9kID0gQG51bV9jZWxscy9AX251bV9zaWduYWxzXG5cdFx0XHRAX29mZnNldCA9IE1hdGgucm91bmQoQF9vZmZzZXQgKiBAX251bV9zaWduYWxzKS9AX251bV9zaWduYWxzXG5cblx0QHByb3BlcnR5ICdudW1fc2lnbmFscycsXG5cdFx0Z2V0Oi0+XG5cdFx0XHRAX251bV9zaWduYWxzXG5cdFx0c2V0OiAobnVtX3NpZ25hbHMpLT5cblx0XHRcdEBfbnVtX3NpZ25hbHMgPSBAbnVtX3NpZ25hbHNcblx0XHRcdEBfZCA9IE1hdGgucm91bmQgQG51bV9jZWxscy9AX251bV9zaWduYWxzXG5cdFx0XHRAX29mZnNldCA9IE1hdGgucm91bmQoQF9vZmZzZXQgKiBAbnVtX3NpZ25hbHMpL0BudW1fc2lnbmFsc1xuXG5cdEBwcm9wZXJ0eSAnb2Zmc2V0Jyxcblx0XHRnZXQ6LT5cblx0XHRcdEBfb2Zmc2V0XG5cdFx0c2V0OihvZmZzZXQpLT5cblx0XHRcdEBfb2Zmc2V0ID0gTWF0aC5yb3VuZChAX29mZnNldCAqIEBudW1fc2lnbmFscykvQG51bV9zaWduYWxzXG5cblxuXHRhZHZhbmNlOiAtPlxuXHRcdEB0aW1lKytcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2V0dGluZ3MoKSJdfQ==
