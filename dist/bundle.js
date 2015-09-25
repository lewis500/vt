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
    this.scope.$watch('S.num_cars', (function(_this) {
      return function() {
        _this.traffic.make_cars();
        return _this.data_theory = _this.solver.find_mfd();
      };
    })(this));
    this.scope.$watch('S.num_signals', (function(_this) {
      return function() {
        _this.traffic.make_signals();
        return _this.data_theory = _this.solver.find_mfd();
      };
    })(this));
    this.scope.$watch('S.offset + S.cycle + S.red', (function(_this) {
      return function() {
        _this.traffic.reset_signals();
        return _this.data_theory = _this.solver.find_mfd();
      };
    })(this));
    this.scope.$watch('S.q0', (function(_this) {
      return function() {
        return _this.data_theory = _this.solver.find_mfd();
      };
    })(this));
  }

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
    this.signal = void 0;
  }

  Cell.prototype.set_signal = function(signal) {
    this.signal = signal;
    this.signal.loc = this.loc;
    return this.signal.cell = this;
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
    if ((this.car = this.temp_car)) {
      return this.last = S.time;
    }
  };

  Cell.prototype.is_free = function() {
    if (this.signal) {
      return this.signal.green && ((S.time - this.last) > this.space);
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
    if (this.count > S.cycle) {
      ref = [0, true], this.count = ref[0], this.green = ref[1];
    }
    if (this.count >= ((1 - S.red) * S.cycle)) {
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
    res = {};
    ref = this.table;
    for (i = 0, len = ref.length; i < len; i++) {
      e = ref[i];
      flow_l = (e.c + k * e.x) / e.t;
      if (flow_l < flow) {
        flow = flow_l;
        res = _.clone(e);
      }
    }
    res.k = k;
    res.q = flow;
    return res;
  };

  Solver.prototype.find_mfd = function() {
    var a, k, res;
    this.table = this.solve();
    a = [];
    return res = (function() {
      var i, len, ref, results;
      ref = _.range(0, 8, 1 / 5);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        k = ref[i];
        results.push(this.find_min(k));
      }
      return results;
    }).call(this);
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
    this.make_signals();
    this.make_cars;
  }

  Traffic.prototype.make_cars = function() {
    var c, i, j, l, len, loc, num_cars, num_cells, ref, ref1, ref2, results, results1;
    num_cars = S.num_cars;
    num_cells = S.num_cells;
    this.cars = (function() {
      results = [];
      for (var j = 0, ref = S.num_cars; 0 <= ref ? j < ref : j > ref; 0 <= ref ? j++ : j--){ results.push(j); }
      return results;
    }).apply(this).map(function() {
      return new Car();
    });
    ref1 = this.cars;
    results1 = [];
    for (i = l = 0, len = ref1.length; l < len; i = ++l) {
      c = ref1[i];
      loc = Math.round(num_cells * i / this.cars.length);
      if (!((ref2 = this.cells[loc]) != null ? ref2.car : void 0)) {
        results1.push(this.cells[loc].receive(c));
      } else {
        results1.push(void 0);
      }
    }
    return results1;
  };

  Traffic.prototype.make_signals = function() {
    var cell, i, j, l, len, num_cells, num_signals, ref, ref1, results, signal, which;
    ref = this.cells;
    for (j = 0, len = ref.length; j < len; j++) {
      cell = ref[j];
      cell.clear_signal();
    }
    this.signals = [];
    num_signals = S.num_signals;
    num_cells = S.num_cells;
    results = [];
    for (i = l = 0, ref1 = num_signals; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
      signal = new Signal(i);
      this.signals.push(signal);
      which = Math.floor(i / num_signals * num_cells);
      results.push(this.cells[which].set_signal(signal));
    }
    return results;
  };

  Traffic.prototype.reset_signals = function() {
    var j, len, ref, results, signal;
    ref = this.signals;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      signal = ref[j];
      results.push(signal.reset());
    }
    return results;
  };

  Traffic.prototype.tick = function() {
    var cell, i, j, k, l, len, len1, len2, m, ref, ref1, results, signal;
    k = this.cells;
    ref = this.signals;
    for (j = 0, len = ref.length; j < len; j++) {
      signal = ref[j];
      signal.tick();
    }
    for (i = l = 0, len1 = k.length; l < len1; i = ++l) {
      cell = k[i];
      if (cell.car) {
        if (k[(i + 1) % k.length].is_free()) {
          k[(i + 1) % k.length].receive(cell.car);
          cell.remove();
        }
      }
    }
    ref1 = this.cells;
    results = [];
    for (m = 0, len2 = ref1.length; m < len2; m++) {
      cell = ref1[m];
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
      num_cells: 2000,
      _num_cars: 300,
      _k: 300 / 2000,
      _num_signals: 50,
      _offset: .3,
      _d: 2000 / 50,
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
    return this.cycle + this.offset + this.q0 + this.red + this.d;
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
      this._num_signals = num_signals;
      this._d = Math.round(this.num_cells / this._num_signals);
      return this._offset = Math.round(this._offset * this._num_signals) / this._num_signals;
    }
  });

  Settings.property('offset', {
    get: function() {
      return this._offset;
    },
    set: function(offset) {
      return this._offset = Math.round(offset * this._num_signals) / this._num_signals;
    }
  });

  Settings.prototype.advance = function() {
    return this.time++;
  };

  return Settings;

})();

module.exports = new Settings();



},{"./helpers":7,"d3":undefined,"lodash":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL2FwcC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL2RpcmVjdGl2ZXMvZDNEZXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9kaXJlY3RpdmVzL2RhdHVtLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvZGlyZWN0aXZlcy9zbGlkZXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9kaXJlY3RpdmVzL3hBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvZGlyZWN0aXZlcy95QXhpcy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL2hlbHBlcnMuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9tZmQuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9tb2RlbHMvY2FyLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvbW9kZWxzL2NlbGwuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9tb2RlbHMvc2lnbmFsLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvbW9kZWxzL3NvbHZlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL21vZGVscy90cmFmZmljLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25h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QUFBO0lBSDdDLENBRkw7R0FERDs7RUFRQSxRQUFDLENBQUEsUUFBRCxDQUFVLFFBQVYsRUFDQztJQUFBLEdBQUEsRUFBSSxTQUFBO2FBQ0gsSUFBQyxDQUFBO0lBREUsQ0FBSjtJQUVBLEdBQUEsRUFBSSxTQUFDLE1BQUQ7YUFDSCxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUksQ0FBQyxLQUFMLENBQVcsTUFBQSxHQUFTLElBQUMsQ0FBQSxZQUFyQixDQUFBLEdBQW1DLElBQUMsQ0FBQTtJQUQ1QyxDQUZKO0dBREQ7O3FCQU9BLE9BQUEsR0FBUyxTQUFBO1dBQ1IsSUFBQyxDQUFBLElBQUQ7RUFEUTs7Ozs7O0FBR1YsTUFBTSxDQUFDLE9BQVAsR0FBcUIsSUFBQSxRQUFBLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiYW5ndWxhciA9IHJlcXVpcmUgJ2FuZ3VsYXInXG5kMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuVHJhZmZpYyA9IHJlcXVpcmUgJy4vbW9kZWxzL3RyYWZmaWMnXG5DYXIgPSByZXF1aXJlICcuL21vZGVscy9jYXInXG5Tb2x2ZXIgPSByZXF1aXJlICcuL21vZGVscy9zb2x2ZXInXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRwYXVzZWQ6IHRydWVcblx0XHRcdHRyYWZmaWM6IG5ldyBUcmFmZmljXG5cdFx0XHRzb2x2ZXI6IG5ldyBTb2x2ZXJcblx0XHRAc2NvcGUudHJhZmZpYyA9IEB0cmFmZmljXG5cblx0XHRAc2NvcGUuUyA9IFNcblxuXHRcdCMgQHNjb3BlLiR3YXRjaCAtPlxuXHRcdCMgXHRTLnN1bSgpXG5cdFx0IyAsIEBvbl9jaGFuZ2UuYmluZCh0aGlzKVxuXG5cdFx0QHNjb3BlLiR3YXRjaCAnUy5udW1fY2FycycsID0+XG5cdFx0XHRAdHJhZmZpYy5tYWtlX2NhcnMoKVxuXHRcdFx0QGRhdGFfdGhlb3J5ID0gQHNvbHZlci5maW5kX21mZCgpXG5cblx0XHRAc2NvcGUuJHdhdGNoICdTLm51bV9zaWduYWxzJywgPT5cblx0XHRcdEB0cmFmZmljLm1ha2Vfc2lnbmFscygpXG5cdFx0XHRAZGF0YV90aGVvcnkgPSBAc29sdmVyLmZpbmRfbWZkKClcblxuXHRcdEBzY29wZS4kd2F0Y2ggJ1Mub2Zmc2V0ICsgUy5jeWNsZSArIFMucmVkJyw9PlxuXHRcdFx0QHRyYWZmaWMucmVzZXRfc2lnbmFscygpXG5cdFx0XHRAZGF0YV90aGVvcnkgPSBAc29sdmVyLmZpbmRfbWZkKClcblxuXHRcdEBzY29wZS4kd2F0Y2ggJ1MucTAnLD0+XG5cdFx0XHRAZGF0YV90aGVvcnkgPSBAc29sdmVyLmZpbmRfbWZkKClcblx0XHRcblx0IyBvbl9jaGFuZ2U6IC0+XG5cdCMgXHRcdEB0cmFmZmljLnJlc2V0KClcblxuXHRyb3RhdG9yOiAoY2FyKS0+IFwicm90YXRlKCN7Uy5zY2FsZShjYXIubG9jKX0pIHRyYW5zbGF0ZSgwLDUwKVwiXG5cblx0Y2xpY2s6ICh2YWwpIC0+IGlmICF2YWwgdGhlbiBAcGxheSgpXG5cdHBhdXNlOiAtPiBAcGF1c2VkID0gdHJ1ZVxuXHR0aWNrOiAtPlxuXHRcdGQzLnRpbWVyID0+XG5cdFx0XHRcdFMuYWR2YW5jZSgpXG5cdFx0XHRcdEB0cmFmZmljLnRpY2soKVxuXHRcdFx0XHRAc2NvcGUuJGV2YWxBc3luYygpXG5cdFx0XHRcdEBwYXVzZWRcblx0cGxheTogLT5cblx0XHRAcGF1c2UoKVxuXHRcdEBwYXVzZWQgPSBmYWxzZVxuXHRcdEB0aWNrKClcblxudmlzRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IHt9XG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvdmlzLmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCBDdHJsXVxuXG5hbmd1bGFyLm1vZHVsZSAnbWFpbkFwcCcgLCBbcmVxdWlyZSAnYW5ndWxhci1tYXRlcmlhbCcgLCByZXF1aXJlICdhbmd1bGFyLWFuaW1hdGUnXVxuXHQuZGlyZWN0aXZlICd2aXNEZXInLCB2aXNEZXJcblx0LmRpcmVjdGl2ZSAnZGF0dW0nLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvZGF0dW0nXG5cdC5kaXJlY3RpdmUgJ2QzRGVyJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL2QzRGVyJ1xuXHQuZGlyZWN0aXZlICdtZmRDaGFydCcsIHJlcXVpcmUgJy4vbWZkJ1xuXHQuZGlyZWN0aXZlICdob3JBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3hBeGlzJ1xuXHQuZGlyZWN0aXZlICd2ZXJBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3lBeGlzJ1xuXHQuZGlyZWN0aXZlICdzbGlkZXJEZXInLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvc2xpZGVyJ1xuIiwiZDMgPSByZXF1aXJlICdkMydcbmFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuXG5kZXIgPSAoJHBhcnNlKS0+ICNnb2VzIG9uIGEgc3ZnIGVsZW1lbnRcblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGQzRGVyOiAnPSdcblx0XHRcdHRyYW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0dSA9ICd0LScgKyBNYXRoLnJhbmRvbSgpXG5cdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSBmYWxzZVxuXHRcdFx0c2NvcGUuJHdhdGNoICdkM0Rlcidcblx0XHRcdFx0LCAodiktPlxuXHRcdFx0XHRcdGlmIHNjb3BlLnRyYW4gYW5kIGhhc1RyYW5zaXRpb25lZFxuXHRcdFx0XHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gdHJ1ZVxuXHRcdFx0XHRcdFx0c2VsLnRyYW5zaXRpb24gdVxuXHRcdFx0XHRcdFx0XHQuYXR0ciB2XG5cdFx0XHRcdFx0XHRcdC5jYWxsIHNjb3BlLnRyYW5cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSB0cnVlXG5cdFx0XHRcdFx0XHRzZWwuYXR0ciB2XG5cdFx0XHRcdCwgdHJ1ZVxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJtb2R1bGUuZXhwb3J0cyA9ICgkcGFyc2UpLT5cblx0KHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdGQzLnNlbGVjdChlbFswXSkuZGF0dW0gJHBhcnNlKGF0dHIuZGF0dW0pKHNjb3BlKSIsImRlciA9IC0+XG5cdHJlcyA9IFxuXHRcdHNjb3BlOiBcblx0XHRcdGxhYmVsOiAnQCdcblx0XHRcdG15RGF0YTogJz0nXG5cdFx0XHRtaW46ICc9J1xuXHRcdFx0bWF4OiAnPSdcblx0XHRcdHN0ZXA6ICc9J1xuXHRcdCMgY29udHJvbGxlckFzOiAndm0nXG5cdFx0cmVwbGFjZTogdHJ1ZVxuXHRcdCMgY29udHJvbGxlcjogLT5cblx0XHQjIGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC9zbGlkZXIuaHRtbCdcblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZnVuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzY2FsZSA9IHNjb3BlLmZ1bi5zY2FsZSgpXG5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuY2xhc3NlZCAnaG9yIGF4aXMnLCB0cnVlXG5cblx0XHRcdHNlbC5jYWxsIHNjb3BlLmZ1blxuXHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5cbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRzY29wZTogXG5cdFx0XHRmdW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNjYWxlID0gc2NvcGUuZnVuLnNjYWxlKClcblxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5jbGFzc2VkICd2ZXIgYXhpcycsIHRydWVcblxuXHRcdFx0c2VsLmNhbGwgc2NvcGUuZnVuXG5cdFx0XHRcbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiJ3VzZSBzdHJpY3QnXG5cbkZ1bmN0aW9uOjpwcm9wZXJ0eSA9IChwcm9wLCBkZXNjKSAtPlxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgcHJvcCwgZGVzYyIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxlbCktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHR3aWR0aDogMzAwXG5cdFx0XHRoZWlnaHQ6IDMwMFxuXHRcdFx0bTogXG5cdFx0XHRcdHQ6IDEwXG5cdFx0XHRcdGw6IDQwXG5cdFx0XHRcdHI6IDE4XG5cdFx0XHRcdGI6IDM1XG5cblx0XHRAaG9yID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdFx0LmRvbWFpbiBbMCw1XVxuXHRcdFx0XHQucmFuZ2UgWzAsQHdpZHRoXVxuXG5cdFx0QHZlciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLCA1XVxuXHRcdFx0LnJhbmdlIFtAaGVpZ2h0LCAwXVxuXG5cdFx0QGxpbmUgPSBkMy5zdmcubGluZSgpXG5cdFx0XHQueCAoZCk9PkBob3IgZC5rXG5cdFx0XHQueSAoZCk9PkB2ZXIgZC5xXG5cdFx0XHQuZGVmaW5lZCAoZCktPmQucT4wXG5cblx0XHRAaG9yQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAaG9yXG5cdFx0XHQub3JpZW50ICdib3R0b20nXG5cdFx0XHQudGlja3MgOFxuXG5cdFx0QHZlckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQHZlclxuXHRcdFx0Lm9yaWVudCAnbGVmdCdcblxuXHRkOiAtPlxuXHRcdEBsaW5lIEBkYXRhXG5cdFxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGRhdGE6ICc9J1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L21mZENoYXJ0Lmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsIlMgPSByZXF1aXJlICcuLi9zZXR0aW5ncydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5cbmNsYXNzIENhclxuXHRjb25zdHJ1Y3RvcjotPlxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ2Nhci0nXG5cdFx0QGNvbG9yID0gXy5zYW1wbGUgUy5jb2xvcnMuZG9tYWluKClcblxuXHRzZXRfbG9jOiAoQGxvYyktPlxuXG5tb2R1bGUuZXhwb3J0cyA9IENhciIsIlMgPSByZXF1aXJlICcuLi9zZXR0aW5ncydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5cbmNsYXNzIENlbGxcblx0Y29uc3RydWN0b3I6IChAbG9jKS0+XG5cdFx0QGxhc3QgPSAtSW5maW5pdHlcblx0XHRAdGVtcF9jYXIgPSBAY2FyID0gZmFsc2Vcblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdjZWxsJ1xuXHRcdEBzaWduYWwgPSB1bmRlZmluZWRcblxuXHRzZXRfc2lnbmFsOiAoQHNpZ25hbCktPlxuXHRcdEBzaWduYWwubG9jID0gQGxvY1xuXHRcdEBzaWduYWwuY2VsbCA9IHRoaXNcblxuXHRjbGVhcl9zaWduYWw6IC0+XG5cdFx0QHNpZ25hbCA9IHVuZGVmaW5lZFxuXG5cdHNwYWNlOiA0XG5cblx0cmVjZWl2ZTooY2FyKS0+XG5cdFx0Y2FyLnNldF9sb2MgQGxvY1xuXHRcdEBsYXN0ID0gUy50aW1lXG5cdFx0QHRlbXBfY2FyID0gY2FyXG5cdFx0Y2FyLmNlbGwgPSB0aGlzXG5cblx0cmVtb3ZlOiAtPlxuXHRcdEB0ZW1wX2NhciA9IGZhbHNlXG5cblx0ZmluYWxpemU6IC0+XG5cdFx0aWYgKEBjYXI9QHRlbXBfY2FyKVxuXHRcdFx0QGxhc3QgPSBTLnRpbWVcblxuXHRpc19mcmVlOiAtPlxuXHRcdGlmIEBzaWduYWxcblx0XHRcdHJldHVybiAoQHNpZ25hbC5ncmVlbiBhbmQgKChTLnRpbWUtQGxhc3QpPkBzcGFjZSkpXG5cdFx0ZWxzZVxuXHRcdFx0KFMudGltZS1AbGFzdCk+QHNwYWNlXG5cbm1vZHVsZS5leHBvcnRzID0gQ2VsbCIsIlMgPSByZXF1aXJlICcuLi9zZXR0aW5ncydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5cbmNsYXNzIFNpZ25hbFxuXHRjb25zdHJ1Y3RvcjogKEBpKSAtPlxuXHRcdEBjb3VudCA9IDBcblx0XHRAZ3JlZW4gPSB0cnVlXG5cdFx0QGlkID0gXy51bmlxdWVJZCAnc2lnbmFsLSdcblx0XHRAcmVzZXQoKVxuXG5cdHJlc2V0OiAtPlxuXHRcdEBvZmZzZXQgPSBTLmN5Y2xlKigoQGkqUy5vZmZzZXQpJTEpXG5cdFx0W0Bjb3VudCwgQGdyZWVuXSA9IFtAb2Zmc2V0LCB0cnVlXVxuXG5cdHRpY2s6IC0+XG5cdFx0QGNvdW50Kytcblx0XHRpZiBAY291bnQgPiBTLmN5Y2xlXG5cdFx0XHRbQGNvdW50LCBAZ3JlZW5dID0gWzAsIHRydWVdXG5cdFx0aWYgKEBjb3VudCk+PSgoMS1TLnJlZCkqUy5jeWNsZSlcblx0XHRcdEBncmVlbiA9IGZhbHNlXG5cbm1vZHVsZS5leHBvcnRzID0gU2lnbmFsIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5cbmNsYXNzIFNvbHZlclxuXHRjb25zdHJ1Y3RvcjogLT5cblxuXHRzb2x2ZTotPlxuXHRcdHJlZF90aW1lID0gUy5yZWRfdGltZVxuXHRcdGtqID0gUy5xMCooMS9TLnZmKzEvUy53KVxuXHRcdHJlcyA9IFtdXG5cdFx0W3gsdGltZV9zdG9wcGVkLGxdID0gWzAsMTAwMCwwXVxuXHRcdHdoaWxlIHRpbWVfc3RvcHBlZD4wIGFuZCBsPDEwXG5cdFx0XHR0aW1lX3RyYXZlbGluZyA9IHgvUy52ZlxuXHRcdFx0dGltZV9hcnJpdmFsID0gcmVkX3RpbWUgKyB0aW1lX3RyYXZlbGluZ1xuXHRcdFx0dGltZV9zdG9wcGVkID0gQGdyZWVuX2xlZnQgdGltZV9hcnJpdmFsLGxcblx0XHRcdHJlcy5wdXNoIFxuXHRcdFx0XHR4OiB4XG5cdFx0XHRcdHQ6IHRpbWVfYXJyaXZhbCt0aW1lX3N0b3BwZWRcblx0XHRcdFx0ZzogdGltZV9zdG9wcGVkXG5cdFx0XHRcdGw6IGxcblx0XHRcdFx0YzogUy5xMCp0aW1lX3N0b3BwZWRcblx0XHRcdHgrPVMuZFxuXHRcdFx0bCs9MVxuXG5cdFx0W3gsdGltZV9zdG9wcGVkLGxdID0gWy1TLmQvUy53LCAxMDAwLC0xXVxuXHRcdHdoaWxlIHRpbWVfc3RvcHBlZD4wIGFuZCBsPi0xMFxuXHRcdFx0dGltZV90cmF2ZWxpbmc9IC14L1Mud1xuXHRcdFx0dGltZV9hcnJpdmFsID0gcmVkX3RpbWUgKyB0aW1lX3RyYXZlbGluZ1xuXHRcdFx0dGltZV9zdG9wcGVkID0gQGdyZWVuX2xlZnQgdGltZV9hcnJpdmFsLGxcblx0XHRcdHJlcy5wdXNoXG5cdFx0XHRcdHg6IHhcblx0XHRcdFx0dDogdGltZV9hcnJpdmFsICsgdGltZV9zdG9wcGVkXG5cdFx0XHRcdGc6IHRpbWVfc3RvcHBlZFxuXHRcdFx0XHRsOiBsXG5cdFx0XHRcdGM6IGtqKnRpbWVfdHJhdmVsaW5nICsgUy5xMCp0aW1lX3N0b3BwZWRcblx0XHRcdHgtPVMuZFxuXHRcdFx0bC09MVxuXHRcdHJlc1xuXG5cdGdyZWVuX2xlZnQ6ICh0LGwpLT5cblx0XHRyZWRfdGltZSA9IFMucmVkX3RpbWVcblx0XHRsZWZ0b3ZlciA9ICh0K01hdGguYWJzKGwpKlMuZGVsdGEpJVMuY3ljbGVcblx0XHRpZiBsZWZ0b3ZlcjxyZWRfdGltZVxuXHRcdFx0MFxuXHRcdGVsc2Vcblx0XHRcdFMuY3ljbGUtbGVmdG92ZXJcblxuXHRmaW5kX21pbjogKGspLT5cblx0XHRmbG93ID0gSW5maW5pdHlcblx0XHRyZXMgPSB7fVxuXHRcdGZvciBlIGluIEB0YWJsZVxuXHRcdFx0Zmxvd19sID0gKGUuYyArIGsqZS54KS8oZS50KVxuXHRcdFx0aWYgZmxvd19sPGZsb3dcblx0XHRcdFx0ZmxvdyA9IGZsb3dfbFxuXHRcdFx0XHRyZXMgPSBfLmNsb25lIGVcblx0XHRyZXMuayA9IGtcblx0XHRyZXMucSA9IGZsb3dcblx0XHRyZXR1cm4gcmVzXG5cblx0ZmluZF9tZmQ6LT5cblx0XHRAdGFibGUgPSBAc29sdmUoKVxuXHRcdGEgPSBbXVxuXHRcdHJlcyA9IChAZmluZF9taW4gayBmb3IgayBpbiBfLnJhbmdlIDAsOCwxLzUpXG5cbm1vZHVsZS5leHBvcnRzID0gU29sdmVyIiwiUyA9IHJlcXVpcmUgJy4uL3NldHRpbmdzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbkNhciA9IHJlcXVpcmUgJy4vY2FyJ1xuU2lnbmFsID0gcmVxdWlyZSAnLi9zaWduYWwnXG5DZWxsID0gcmVxdWlyZSAnLi9jZWxsJ1xuXG5jbGFzcyBUcmFmZmljXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBjZWxscyA9IChuZXcgQ2VsbCBuIGZvciBuIGluIFswLi4uUy5udW1fY2VsbHNdKVxuXHRcdEBtYWtlX3NpZ25hbHMoKVxuXHRcdEBtYWtlX2NhcnNcblxuXHRtYWtlX2NhcnM6IC0+XG5cdFx0bnVtX2NhcnMgPSBTLm51bV9jYXJzXG5cdFx0bnVtX2NlbGxzID0gUy5udW1fY2VsbHNcblx0XHRAY2FycyA9IFswLi4uUy5udW1fY2Fyc10ubWFwIC0+IG5ldyBDYXIoKVxuXG5cdFx0Zm9yIGMsaSBpbiBAY2Fyc1xuXHRcdFx0bG9jID0gTWF0aC5yb3VuZChudW1fY2VsbHMqaS9AY2Fycy5sZW5ndGgpXG5cdFx0XHR1bmxlc3MgQGNlbGxzW2xvY10/LmNhclxuXHRcdFx0XHRAY2VsbHNbbG9jXS5yZWNlaXZlIGNcblxuXG5cdG1ha2Vfc2lnbmFsczotPlxuXHRcdGNlbGwuY2xlYXJfc2lnbmFsKCkgZm9yIGNlbGwgaW4gQGNlbGxzXG5cdFx0QHNpZ25hbHMgPSBbXVxuXHRcdG51bV9zaWduYWxzID0gUy5udW1fc2lnbmFsc1xuXHRcdG51bV9jZWxscyA9IFMubnVtX2NlbGxzXG5cdFx0Zm9yIGkgaW4gWzAuLi5udW1fc2lnbmFsc11cblx0XHRcdHNpZ25hbCA9IG5ldyBTaWduYWwgaVxuXHRcdFx0QHNpZ25hbHMucHVzaCBzaWduYWxcblx0XHRcdHdoaWNoID0gTWF0aC5mbG9vcihpL251bV9zaWduYWxzKm51bV9jZWxscylcblx0XHRcdEBjZWxsc1t3aGljaF0uc2V0X3NpZ25hbCBzaWduYWxcblxuXHRyZXNldF9zaWduYWxzOi0+XG5cdFx0c2lnbmFsLnJlc2V0KCkgZm9yIHNpZ25hbCBpbiBAc2lnbmFsc1xuXG5cdHRpY2s6LT5cblx0XHRrID0gQGNlbGxzXG5cblx0XHRzaWduYWwudGljaygpIGZvciBzaWduYWwgaW4gQHNpZ25hbHNcblxuXHRcdGZvciBjZWxsLGkgaW4ga1xuXHRcdFx0aWYgY2VsbC5jYXJcblx0XHRcdFx0aWYga1soaSsxKSVrLmxlbmd0aF0uaXNfZnJlZSgpXG5cdFx0XHRcdFx0a1soaSsxKSVrLmxlbmd0aF0ucmVjZWl2ZSBjZWxsLmNhclxuXHRcdFx0XHRcdGNlbGwucmVtb3ZlKClcblxuXHRcdGNlbGwuZmluYWxpemUoKSBmb3IgY2VsbCBpbiBAY2VsbHNcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFmZmljXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbnJlcXVpcmUgJy4vaGVscGVycydcblxuY2xhc3MgU2V0dGluZ3Ncblx0Y29uc3RydWN0b3I6LT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0bnVtX2NlbGxzOiAyMDAwXG5cdFx0XHRfbnVtX2NhcnM6IDMwMFxuXHRcdFx0X2s6IDMwMC8yMDAwXG5cdFx0XHRfbnVtX3NpZ25hbHM6IDUwXG5cdFx0XHRfb2Zmc2V0OiAuM1xuXHRcdFx0X2Q6IDIwMDAvNTBcblx0XHRcdHRpbWU6IDBcblx0XHRcdHNwYWNlOiAzXG5cdFx0XHRyZWQ6IC41XG5cdFx0XHRjeWNsZTogNTBcblx0XHRcdHZmOiAzXG5cdFx0XHR3OiAxXG5cdFx0XHRxMDogM1xuXG5cdFx0QGNvbG9ycyA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIF8ucmFuZ2UgMCxAbnVtX2NlbGxzLEBudW1fY2VsbHMvNlxuXHRcdFx0LnJhbmdlIFtcblx0XHRcdFx0JyNGNDQzMzYnLCAjcmVkXG5cdFx0XHRcdCcjMjE5NkYzJywgI2JsdWVcblx0XHRcdFx0JyNFOTFFNjMnLCAjcGlua1xuXHRcdFx0XHQnIzAwQkNENCcsICNjeWFuXG5cdFx0XHRcdCcjRkZDMTA3JywgI2FtYmVyXG5cdFx0XHRcdCcjNENBRjUwJywgI2dyZWVuXG5cdFx0XHRcdF1cblxuXHRcdEBzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLEBudW1fY2VsbHNdXG5cdFx0XHQucmFuZ2UgWzAsMzYwXVxuXG5cdHN1bTogLT5cblx0XHRAY3ljbGUgKyBAb2Zmc2V0ICsgQHEwICsgQHJlZCArIEBkXG5cblx0QHByb3BlcnR5ICdudW1fY2FycycsIFxuXHRcdGdldDotPlxuXHRcdFx0QF9udW1fY2Fyc1xuXHRcdHNldDoobnVtX2NhcnMpLT5cblx0XHRcdEBfbnVtX2NhcnMgPSBNYXRoLnJvdW5kIG51bV9jYXJzXG5cdFx0XHRAX2sgPSB2L1MubnVtX2NlbGxzXG5cblx0QHByb3BlcnR5ICdrJyxcblx0XHRnZXQ6LT5cblx0XHRcdEBfa1xuXHRcdHNldDooayktPlxuXHRcdFx0QF9rID0ga1xuXHRcdFx0QF9udW1fY2FycyA9IE1hdGgucm91bmQgaypTLm51bV9jZWxsc1xuXG5cdEBwcm9wZXJ0eSAnZGVsdGEnLFxuXHRcdGdldDogLT5cblx0XHRcdEBfb2Zmc2V0KkBjeWNsZVxuXG5cdEBwcm9wZXJ0eSAncmVkX3RpbWUnLFxuXHRcdGdldDotPlxuXHRcdFx0QGN5Y2xlICogQHJlZFxuXG5cdEBwcm9wZXJ0eSAnZCcsIFxuXHRcdGdldDotPlxuXHRcdFx0QF9kXG5cdFx0c2V0OihkKS0+XG5cdFx0XHRAX251bV9zaWduYWxzID0gTWF0aC5yb3VuZCBAbnVtX2NlbGxzL2Rcblx0XHRcdEBfZCA9IEBudW1fY2VsbHMvQF9udW1fc2lnbmFsc1xuXHRcdFx0QF9vZmZzZXQgPSBNYXRoLnJvdW5kKEBfb2Zmc2V0ICogQF9udW1fc2lnbmFscykvQF9udW1fc2lnbmFsc1xuXG5cdEBwcm9wZXJ0eSAnbnVtX3NpZ25hbHMnLFxuXHRcdGdldDotPlxuXHRcdFx0QF9udW1fc2lnbmFsc1xuXHRcdHNldDogKG51bV9zaWduYWxzKS0+XG5cdFx0XHRAX251bV9zaWduYWxzID0gbnVtX3NpZ25hbHNcblx0XHRcdEBfZCA9IE1hdGgucm91bmQgQG51bV9jZWxscy9AX251bV9zaWduYWxzXG5cdFx0XHRAX29mZnNldCA9IE1hdGgucm91bmQoQF9vZmZzZXQgKiBAX251bV9zaWduYWxzKS9AX251bV9zaWduYWxzXG5cblx0QHByb3BlcnR5ICdvZmZzZXQnLFxuXHRcdGdldDotPlxuXHRcdFx0QF9vZmZzZXRcblx0XHRzZXQ6KG9mZnNldCktPlxuXHRcdFx0QF9vZmZzZXQgPSBNYXRoLnJvdW5kKG9mZnNldCAqIEBfbnVtX3NpZ25hbHMpL0BfbnVtX3NpZ25hbHNcblxuXG5cdGFkdmFuY2U6IC0+XG5cdFx0QHRpbWUrK1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTZXR0aW5ncygpIl19
