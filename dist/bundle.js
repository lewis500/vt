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
    this.scope.$watch('S.q0 + S.w', (function(_this) {
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
var Light, S, Solver, _, d3;

d3 = require('d3');

_ = require('lodash');

S = require('../settings');

Light = (function() {
  function Light(l1) {
    this.l = l1;
    this.x = S.d * this.l;
  }

  Light.prototype.intersect = function(t) {
    var leftover, offset;
    offset = S.delta * this.l;
    leftover = (t + offset) % S.cycle;
    if (leftover < (S.red * S.cycle)) {
      return 0;
    } else {
      return S.cycle - leftover;
    }
  };

  return Light;

})();

Solver = (function() {
  function Solver() {}

  Solver.prototype.make_table = function() {
    var kj, l, light, red_time, ref, ref1, res, time_arrival, time_stopped, time_traveling;
    red_time = S.red_time;
    kj = S.q0 * (1 / S.vf + 1 / S.w);
    res = [];
    ref = [1000, -1], time_stopped = ref[0], l = ref[1];
    while (time_stopped > 0 && ++l < 50) {
      light = new Light(l);
      time_traveling = light.x / S.vf;
      time_arrival = red_time + time_traveling;
      time_stopped = light.intersect(time_arrival);
      res.push({
        x: light.x,
        t: time_arrival + time_stopped,
        g: time_stopped,
        l: light.l,
        c: S.q0 * time_stopped
      });
    }
    ref1 = [1000, 0], time_stopped = ref1[0], l = ref1[1];
    while (time_stopped > 0 && --l > -50) {
      light = new Light(l);
      time_traveling = -light.x / S.w;
      time_arrival = red_time + time_traveling;
      time_stopped = light.intersect(time_arrival);
      res.push({
        x: light.x,
        t: time_arrival + time_stopped,
        g: time_stopped,
        l: l,
        c: -light.x * kj + S.q0 * time_stopped
      });
    }
    return res;
  };

  Solver.prototype.find_min = function(k, table) {
    var e, flow, flow_l, i, len, res;
    flow = Infinity;
    res = {};
    for (i = 0, len = table.length; i < len; i++) {
      e = table[i];
      flow_l = (e.c + k * e.x) / e.t;
      if (flow_l <= flow) {
        flow = flow_l;
        res = _.clone(e);
      }
    }
    res.k = k;
    res.q = flow;
    return res;
  };

  Solver.prototype.find_mfd = function() {
    var k, res, table;
    table = this.make_table();
    return res = (function() {
      var i, len, ref, results;
      ref = _.range(0, 5, .01);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        k = ref[i];
        results.push(this.find_min(k, table));
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
      _kj: 1 * (3 + 1 / 1),
      _k0: 1,
      time: 0,
      space: 3,
      red: .02,
      cycle: 50,
      vf: 1,
      w: 1 / 3,
      q0: 1
    });
    this.colors = d3.scale.linear().domain(_.range(0, this.num_cells, this.num_cells / 6)).range(['#F44336', '#2196F3', '#E91E63', '#00BCD4', '#FFC107', '#4CAF50']);
    this.scale = d3.scale.linear().domain([0, this.num_cells]).range([0, 360]);
  }

  Settings.property('kj', {
    get: function() {
      return this._kj;
    },
    set: function(kj) {
      this._kj = kj;
      return this.w = this.q0 / (kj - this.k0);
    }
  });

  Settings.property('k0', {
    get: function() {
      return this._k0;
    },
    set: function(k0) {
      this._k0 = k0;
      this.q0 = this.vf * k0;
      return this.w = this.q0 / (this.kj - k0);
    }
  });

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL2FwcC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL2RpcmVjdGl2ZXMvZDNEZXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9kaXJlY3RpdmVzL2RhdHVtLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvZGlyZWN0aXZlcy9zbGlkZXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9kaXJlY3RpdmVzL3hBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvZGlyZWN0aXZlcy95QXhpcy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL2hlbHBlcnMuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9tZmQuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9tb2RlbHMvY2FyLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvbW9kZWxzL2NlbGwuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9tb2RlbHMvc2lnbmFsLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvbW9kZWxzL3NvbHZlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL21vZGVscy90cmFmZmljLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25h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bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJhbmd1bGFyID0gcmVxdWlyZSAnYW5ndWxhcidcbmQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5UcmFmZmljID0gcmVxdWlyZSAnLi9tb2RlbHMvdHJhZmZpYydcbkNhciA9IHJlcXVpcmUgJy4vbW9kZWxzL2NhcidcblNvbHZlciA9IHJlcXVpcmUgJy4vbW9kZWxzL3NvbHZlcidcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHBhdXNlZDogdHJ1ZVxuXHRcdFx0dHJhZmZpYzogbmV3IFRyYWZmaWNcblx0XHRcdHNvbHZlcjogbmV3IFNvbHZlclxuXHRcdEBzY29wZS50cmFmZmljID0gQHRyYWZmaWNcblxuXHRcdEBzY29wZS5TID0gU1xuXG5cdFx0IyBAc2NvcGUuJHdhdGNoIC0+XG5cdFx0IyBcdFMuc3VtKClcblx0XHQjICwgQG9uX2NoYW5nZS5iaW5kKHRoaXMpXG5cblx0XHRAc2NvcGUuJHdhdGNoICdTLm51bV9jYXJzJywgPT5cblx0XHRcdEB0cmFmZmljLm1ha2VfY2FycygpXG5cdFx0XHRAZGF0YV90aGVvcnkgPSBAc29sdmVyLmZpbmRfbWZkKClcblxuXHRcdEBzY29wZS4kd2F0Y2ggJ1MubnVtX3NpZ25hbHMnLCA9PlxuXHRcdFx0QHRyYWZmaWMubWFrZV9zaWduYWxzKClcblx0XHRcdEBkYXRhX3RoZW9yeSA9IEBzb2x2ZXIuZmluZF9tZmQoKVxuXG5cdFx0QHNjb3BlLiR3YXRjaCAnUy5vZmZzZXQgKyBTLmN5Y2xlICsgUy5yZWQnLD0+XG5cdFx0XHRAdHJhZmZpYy5yZXNldF9zaWduYWxzKClcblx0XHRcdEBkYXRhX3RoZW9yeSA9IEBzb2x2ZXIuZmluZF9tZmQoKVxuXG5cdFx0QHNjb3BlLiR3YXRjaCAnUy5xMCArIFMudycsPT5cblx0XHRcdEBkYXRhX3RoZW9yeSA9IEBzb2x2ZXIuZmluZF9tZmQoKVxuXHRcdFxuXHQjIG9uX2NoYW5nZTogLT5cblx0IyBcdFx0QHRyYWZmaWMucmVzZXQoKVxuXG5cdHJvdGF0b3I6IChjYXIpLT4gXCJyb3RhdGUoI3tTLnNjYWxlKGNhci5sb2MpfSkgdHJhbnNsYXRlKDAsNTApXCJcblxuXHRjbGljazogKHZhbCkgLT4gaWYgIXZhbCB0aGVuIEBwbGF5KClcblx0cGF1c2U6IC0+IEBwYXVzZWQgPSB0cnVlXG5cdHRpY2s6IC0+XG5cdFx0ZDMudGltZXIgPT5cblx0XHRcdFx0Uy5hZHZhbmNlKClcblx0XHRcdFx0QHRyYWZmaWMudGljaygpXG5cdFx0XHRcdEBzY29wZS4kZXZhbEFzeW5jKClcblx0XHRcdFx0QHBhdXNlZFxuXHRwbGF5OiAtPlxuXHRcdEBwYXVzZSgpXG5cdFx0QHBhdXNlZCA9IGZhbHNlXG5cdFx0QHRpY2soKVxuXG52aXNEZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRzY29wZToge31cblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC92aXMuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsIEN0cmxdXG5cbmFuZ3VsYXIubW9kdWxlICdtYWluQXBwJyAsIFtyZXF1aXJlICdhbmd1bGFyLW1hdGVyaWFsJyAsIHJlcXVpcmUgJ2FuZ3VsYXItYW5pbWF0ZSddXG5cdC5kaXJlY3RpdmUgJ3Zpc0RlcicsIHZpc0RlclxuXHQuZGlyZWN0aXZlICdkYXR1bScsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9kYXR1bSdcblx0LmRpcmVjdGl2ZSAnZDNEZXInLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvZDNEZXInXG5cdC5kaXJlY3RpdmUgJ21mZENoYXJ0JywgcmVxdWlyZSAnLi9tZmQnXG5cdC5kaXJlY3RpdmUgJ2hvckF4aXMnLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMveEF4aXMnXG5cdC5kaXJlY3RpdmUgJ3ZlckF4aXMnLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMveUF4aXMnXG5cdC5kaXJlY3RpdmUgJ3NsaWRlckRlcicsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9zbGlkZXInXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuYW5ndWxhciA9IHJlcXVpcmUgJ2FuZ3VsYXInXG5cbmRlciA9ICgkcGFyc2UpLT4gI2dvZXMgb24gYSBzdmcgZWxlbWVudFxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZDNEZXI6ICc9J1xuXHRcdFx0dHJhbjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHR1ID0gJ3QtJyArIE1hdGgucmFuZG9tKClcblx0XHRcdGhhc1RyYW5zaXRpb25lZCA9IGZhbHNlXG5cdFx0XHRzY29wZS4kd2F0Y2ggJ2QzRGVyJ1xuXHRcdFx0XHQsICh2KS0+XG5cdFx0XHRcdFx0aWYgc2NvcGUudHJhbiBhbmQgaGFzVHJhbnNpdGlvbmVkXG5cdFx0XHRcdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSB0cnVlXG5cdFx0XHRcdFx0XHRzZWwudHJhbnNpdGlvbiB1XG5cdFx0XHRcdFx0XHRcdC5hdHRyIHZcblx0XHRcdFx0XHRcdFx0LmNhbGwgc2NvcGUudHJhblxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGhhc1RyYW5zaXRpb25lZCA9IHRydWVcblx0XHRcdFx0XHRcdHNlbC5hdHRyIHZcblx0XHRcdFx0LCB0cnVlXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsIm1vZHVsZS5leHBvcnRzID0gKCRwYXJzZSktPlxuXHQoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0ZDMuc2VsZWN0KGVsWzBdKS5kYXR1bSAkcGFyc2UoYXR0ci5kYXR1bSkoc2NvcGUpIiwiZGVyID0gLT5cblx0cmVzID0gXG5cdFx0c2NvcGU6IFxuXHRcdFx0bGFiZWw6ICdAJ1xuXHRcdFx0bXlEYXRhOiAnPSdcblx0XHRcdG1pbjogJz0nXG5cdFx0XHRtYXg6ICc9J1xuXHRcdFx0c3RlcDogJz0nXG5cdFx0IyBjb250cm9sbGVyQXM6ICd2bSdcblx0XHRyZXBsYWNlOiB0cnVlXG5cdFx0IyBjb250cm9sbGVyOiAtPlxuXHRcdCMgYmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L3NsaWRlci5odG1sJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5cbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRzY29wZTogXG5cdFx0XHRmdW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNjYWxlID0gc2NvcGUuZnVuLnNjYWxlKClcblxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5jbGFzc2VkICdob3IgYXhpcycsIHRydWVcblxuXHRcdFx0c2VsLmNhbGwgc2NvcGUuZnVuXG5cdFx0XHRcbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcblxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGZ1bjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2NhbGUgPSBzY29wZS5mdW4uc2NhbGUoKVxuXG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LmNsYXNzZWQgJ3ZlciBheGlzJywgdHJ1ZVxuXG5cdFx0XHRzZWwuY2FsbCBzY29wZS5mdW5cblx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCIndXNlIHN0cmljdCdcblxuRnVuY3Rpb246OnByb3BlcnR5ID0gKHByb3AsIGRlc2MpIC0+XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCBwcm9wLCBkZXNjIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLGVsKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHdpZHRoOiAzMDBcblx0XHRcdGhlaWdodDogMzAwXG5cdFx0XHRtOiBcblx0XHRcdFx0dDogMTBcblx0XHRcdFx0bDogNDBcblx0XHRcdFx0cjogMThcblx0XHRcdFx0YjogMzVcblxuXHRcdEBob3IgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0XHQuZG9tYWluIFswLDVdXG5cdFx0XHRcdC5yYW5nZSBbMCxAd2lkdGhdXG5cblx0XHRAdmVyID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsIDVdXG5cdFx0XHQucmFuZ2UgW0BoZWlnaHQsIDBdXG5cblx0XHRAbGluZSA9IGQzLnN2Zy5saW5lKClcblx0XHRcdC54IChkKT0+QGhvciBkLmtcblx0XHRcdC55IChkKT0+QHZlciBkLnFcblx0XHRcdC5kZWZpbmVkIChkKS0+ZC5xPjBcblxuXHRcdEBob3JBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEBob3Jcblx0XHRcdC5vcmllbnQgJ2JvdHRvbSdcblx0XHRcdC50aWNrcyA4XG5cblx0XHRAdmVyQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAdmVyXG5cdFx0XHQub3JpZW50ICdsZWZ0J1xuXG5cdGQ6IC0+XG5cdFx0QGxpbmUgQGRhdGFcblx0XG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZGF0YTogJz0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvbWZkQ2hhcnQuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiUyA9IHJlcXVpcmUgJy4uL3NldHRpbmdzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblxuY2xhc3MgQ2FyXG5cdGNvbnN0cnVjdG9yOi0+XG5cdFx0QGlkID0gXy51bmlxdWVJZCAnY2FyLSdcblx0XHRAY29sb3IgPSBfLnNhbXBsZSBTLmNvbG9ycy5kb21haW4oKVxuXG5cdHNldF9sb2M6IChAbG9jKS0+XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FyIiwiUyA9IHJlcXVpcmUgJy4uL3NldHRpbmdzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblxuY2xhc3MgQ2VsbFxuXHRjb25zdHJ1Y3RvcjogKEBsb2MpLT5cblx0XHRAbGFzdCA9IC1JbmZpbml0eVxuXHRcdEB0ZW1wX2NhciA9IEBjYXIgPSBmYWxzZVxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ2NlbGwnXG5cdFx0QHNpZ25hbCA9IHVuZGVmaW5lZFxuXG5cdHNldF9zaWduYWw6IChAc2lnbmFsKS0+XG5cdFx0QHNpZ25hbC5sb2MgPSBAbG9jXG5cdFx0QHNpZ25hbC5jZWxsID0gdGhpc1xuXG5cdGNsZWFyX3NpZ25hbDogLT5cblx0XHRAc2lnbmFsID0gdW5kZWZpbmVkXG5cblx0c3BhY2U6IDRcblxuXHRyZWNlaXZlOihjYXIpLT5cblx0XHRjYXIuc2V0X2xvYyBAbG9jXG5cdFx0QGxhc3QgPSBTLnRpbWVcblx0XHRAdGVtcF9jYXIgPSBjYXJcblx0XHRjYXIuY2VsbCA9IHRoaXNcblxuXHRyZW1vdmU6IC0+XG5cdFx0QHRlbXBfY2FyID0gZmFsc2VcblxuXHRmaW5hbGl6ZTogLT5cblx0XHRpZiAoQGNhcj1AdGVtcF9jYXIpXG5cdFx0XHRAbGFzdCA9IFMudGltZVxuXG5cdGlzX2ZyZWU6IC0+XG5cdFx0aWYgQHNpZ25hbFxuXHRcdFx0cmV0dXJuIChAc2lnbmFsLmdyZWVuIGFuZCAoKFMudGltZS1AbGFzdCk+QHNwYWNlKSlcblx0XHRlbHNlXG5cdFx0XHQoUy50aW1lLUBsYXN0KT5Ac3BhY2VcblxubW9kdWxlLmV4cG9ydHMgPSBDZWxsIiwiUyA9IHJlcXVpcmUgJy4uL3NldHRpbmdzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblxuY2xhc3MgU2lnbmFsXG5cdGNvbnN0cnVjdG9yOiAoQGkpIC0+XG5cdFx0QGNvdW50ID0gMFxuXHRcdEBncmVlbiA9IHRydWVcblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdzaWduYWwtJ1xuXHRcdEByZXNldCgpXG5cblx0cmVzZXQ6IC0+XG5cdFx0QG9mZnNldCA9IFMuY3ljbGUqKChAaSpTLm9mZnNldCklMSlcblx0XHRbQGNvdW50LCBAZ3JlZW5dID0gW0BvZmZzZXQsIHRydWVdXG5cblx0dGljazogLT5cblx0XHRAY291bnQrK1xuXHRcdGlmIEBjb3VudCA+IFMuY3ljbGVcblx0XHRcdFtAY291bnQsIEBncmVlbl0gPSBbMCwgdHJ1ZV1cblx0XHRpZiAoQGNvdW50KT49KCgxLVMucmVkKSpTLmN5Y2xlKVxuXHRcdFx0QGdyZWVuID0gZmFsc2VcblxubW9kdWxlLmV4cG9ydHMgPSBTaWduYWwiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuLi9zZXR0aW5ncydcblxuY2xhc3MgTGlnaHRcblx0Y29uc3RydWN0b3I6KEBsKS0+XG5cdFx0QHggPSBTLmQgKiBAbFxuXG5cdGludGVyc2VjdDoodCktPlxuXHRcdG9mZnNldCA9IFMuZGVsdGEqQGxcblx0XHRsZWZ0b3ZlciA9ICh0K29mZnNldCklUy5jeWNsZVxuXHRcdGlmIGxlZnRvdmVyPChTLnJlZCpTLmN5Y2xlKVxuXHRcdFx0MFxuXHRcdGVsc2Vcblx0XHRcdFMuY3ljbGUtbGVmdG92ZXJcblxuY2xhc3MgU29sdmVyXG5cdGNvbnN0cnVjdG9yOiAtPlxuXG5cdG1ha2VfdGFibGU6LT5cblx0XHRyZWRfdGltZSA9IFMucmVkX3RpbWVcblx0XHRraiA9IFMucTAqKDEvUy52ZisxL1Mudylcblx0XHRyZXMgPSBbXVxuXHRcdFt0aW1lX3N0b3BwZWQsbF0gPSBbMTAwMCwtMV1cblx0XHR3aGlsZSB0aW1lX3N0b3BwZWQ+MCBhbmQgKytsPDUwXG5cdFx0XHRsaWdodCA9IG5ldyBMaWdodCBsXG5cdFx0XHR0aW1lX3RyYXZlbGluZyA9IGxpZ2h0LngvUy52ZlxuXHRcdFx0dGltZV9hcnJpdmFsID0gcmVkX3RpbWUgKyB0aW1lX3RyYXZlbGluZ1xuXHRcdFx0dGltZV9zdG9wcGVkID0gbGlnaHQuaW50ZXJzZWN0IHRpbWVfYXJyaXZhbFxuXHRcdFx0cmVzLnB1c2ggXG5cdFx0XHRcdHg6IGxpZ2h0Lnhcblx0XHRcdFx0dDogdGltZV9hcnJpdmFsK3RpbWVfc3RvcHBlZFxuXHRcdFx0XHRnOiB0aW1lX3N0b3BwZWRcblx0XHRcdFx0bDogbGlnaHQubFxuXHRcdFx0XHRjOiBTLnEwKnRpbWVfc3RvcHBlZFxuXG5cdFx0W3RpbWVfc3RvcHBlZCxsXSA9IFsxMDAwLDBdXG5cdFx0d2hpbGUgdGltZV9zdG9wcGVkPjAgYW5kIC0tbD4tNTBcblx0XHRcdGxpZ2h0ID0gbmV3IExpZ2h0IGxcblx0XHRcdHRpbWVfdHJhdmVsaW5nPSAtbGlnaHQueC9TLndcblx0XHRcdHRpbWVfYXJyaXZhbCA9IHJlZF90aW1lICsgdGltZV90cmF2ZWxpbmdcblx0XHRcdHRpbWVfc3RvcHBlZCA9IGxpZ2h0LmludGVyc2VjdCB0aW1lX2Fycml2YWxcblx0XHRcdHJlcy5wdXNoXG5cdFx0XHRcdHg6IGxpZ2h0Lnhcblx0XHRcdFx0dDogdGltZV9hcnJpdmFsICsgdGltZV9zdG9wcGVkXG5cdFx0XHRcdGc6IHRpbWVfc3RvcHBlZFxuXHRcdFx0XHRsOiBsXG5cdFx0XHRcdGM6IC1saWdodC54KmtqICsgUy5xMCp0aW1lX3N0b3BwZWRcblx0XHRyZXNcblxuXHRmaW5kX21pbjogKGssdGFibGUpLT5cblx0XHRmbG93ID0gSW5maW5pdHlcblx0XHRyZXMgPSB7fVxuXHRcdGZvciBlIGluIHRhYmxlXG5cdFx0XHRmbG93X2wgPSAoZS5jICsgayplLngpLyhlLnQpXG5cdFx0XHRpZiBmbG93X2w8PWZsb3dcblx0XHRcdFx0ZmxvdyA9IGZsb3dfbFxuXHRcdFx0XHRyZXMgPSBfLmNsb25lIGVcblx0XHRyZXMuayA9IGtcblx0XHRyZXMucSA9IGZsb3dcblx0XHRyZXR1cm4gcmVzXG5cblx0ZmluZF9tZmQ6LT5cblx0XHR0YWJsZSA9IEBtYWtlX3RhYmxlKClcblx0XHRyZXMgPSAoQGZpbmRfbWluIGssdGFibGUgZm9yIGsgaW4gXy5yYW5nZSAwLDUsLjAxKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNvbHZlciIsIlMgPSByZXF1aXJlICcuLi9zZXR0aW5ncydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5DYXIgPSByZXF1aXJlICcuL2NhcidcblNpZ25hbCA9IHJlcXVpcmUgJy4vc2lnbmFsJ1xuQ2VsbCA9IHJlcXVpcmUgJy4vY2VsbCdcblxuY2xhc3MgVHJhZmZpY1xuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAY2VsbHMgPSAobmV3IENlbGwgbiBmb3IgbiBpbiBbMC4uLlMubnVtX2NlbGxzXSlcblx0XHRAbWFrZV9zaWduYWxzKClcblx0XHRAbWFrZV9jYXJzXG5cblx0bWFrZV9jYXJzOiAtPlxuXHRcdG51bV9jYXJzID0gUy5udW1fY2Fyc1xuXHRcdG51bV9jZWxscyA9IFMubnVtX2NlbGxzXG5cdFx0QGNhcnMgPSBbMC4uLlMubnVtX2NhcnNdLm1hcCAtPiBuZXcgQ2FyKClcblxuXHRcdGZvciBjLGkgaW4gQGNhcnNcblx0XHRcdGxvYyA9IE1hdGgucm91bmQobnVtX2NlbGxzKmkvQGNhcnMubGVuZ3RoKVxuXHRcdFx0dW5sZXNzIEBjZWxsc1tsb2NdPy5jYXJcblx0XHRcdFx0QGNlbGxzW2xvY10ucmVjZWl2ZSBjXG5cblxuXHRtYWtlX3NpZ25hbHM6LT5cblx0XHRjZWxsLmNsZWFyX3NpZ25hbCgpIGZvciBjZWxsIGluIEBjZWxsc1xuXHRcdEBzaWduYWxzID0gW11cblx0XHRudW1fc2lnbmFscyA9IFMubnVtX3NpZ25hbHNcblx0XHRudW1fY2VsbHMgPSBTLm51bV9jZWxsc1xuXHRcdGZvciBpIGluIFswLi4ubnVtX3NpZ25hbHNdXG5cdFx0XHRzaWduYWwgPSBuZXcgU2lnbmFsIGlcblx0XHRcdEBzaWduYWxzLnB1c2ggc2lnbmFsXG5cdFx0XHR3aGljaCA9IE1hdGguZmxvb3IoaS9udW1fc2lnbmFscypudW1fY2VsbHMpXG5cdFx0XHRAY2VsbHNbd2hpY2hdLnNldF9zaWduYWwgc2lnbmFsXG5cblx0cmVzZXRfc2lnbmFsczotPlxuXHRcdHNpZ25hbC5yZXNldCgpIGZvciBzaWduYWwgaW4gQHNpZ25hbHNcblxuXHR0aWNrOi0+XG5cdFx0ayA9IEBjZWxsc1xuXG5cdFx0c2lnbmFsLnRpY2soKSBmb3Igc2lnbmFsIGluIEBzaWduYWxzXG5cblx0XHRmb3IgY2VsbCxpIGluIGtcblx0XHRcdGlmIGNlbGwuY2FyXG5cdFx0XHRcdGlmIGtbKGkrMSklay5sZW5ndGhdLmlzX2ZyZWUoKVxuXHRcdFx0XHRcdGtbKGkrMSklay5sZW5ndGhdLnJlY2VpdmUgY2VsbC5jYXJcblx0XHRcdFx0XHRjZWxsLnJlbW92ZSgpXG5cblx0XHRjZWxsLmZpbmFsaXplKCkgZm9yIGNlbGwgaW4gQGNlbGxzXG5cbm1vZHVsZS5leHBvcnRzID0gVHJhZmZpY1xuIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5yZXF1aXJlICcuL2hlbHBlcnMnXG5cbmNsYXNzIFNldHRpbmdzXG5cdGNvbnN0cnVjdG9yOi0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdG51bV9jZWxsczogMjAwMFxuXHRcdFx0X251bV9jYXJzOiAzMDBcblx0XHRcdF9rOiAzMDAvMjAwMFxuXHRcdFx0X251bV9zaWduYWxzOiA1MFxuXHRcdFx0X29mZnNldDogLjNcblx0XHRcdF9kOiAyMDAwLzUwXG5cdFx0XHRfa2o6IDEqKDMrMS8xKVxuXHRcdFx0X2swOiAxXG5cdFx0XHR0aW1lOiAwXG5cdFx0XHRzcGFjZTogM1xuXHRcdFx0cmVkOiAuMDJcblx0XHRcdGN5Y2xlOiA1MFxuXHRcdFx0dmY6IDFcblx0XHRcdHc6IDEvM1xuXHRcdFx0cTA6IDFcblxuXHRcdEBjb2xvcnMgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBfLnJhbmdlIDAsQG51bV9jZWxscyxAbnVtX2NlbGxzLzZcblx0XHRcdC5yYW5nZSBbXG5cdFx0XHRcdCcjRjQ0MzM2JywgI3JlZFxuXHRcdFx0XHQnIzIxOTZGMycsICNibHVlXG5cdFx0XHRcdCcjRTkxRTYzJywgI3Bpbmtcblx0XHRcdFx0JyMwMEJDRDQnLCAjY3lhblxuXHRcdFx0XHQnI0ZGQzEwNycsICNhbWJlclxuXHRcdFx0XHQnIzRDQUY1MCcsICNncmVlblxuXHRcdFx0XHRdXG5cblx0XHRAc2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCxAbnVtX2NlbGxzXVxuXHRcdFx0LnJhbmdlIFswLDM2MF1cblxuXHQjIHN1bTogLT5cblx0IyBcdEBjeWNsZSArIEBvZmZzZXQgKyBAcTAgKyBAcmVkICsgQGRcblxuXHRAcHJvcGVydHkgJ2tqJyxcblx0XHRnZXQ6LT5cblx0XHRcdEBfa2pcblx0XHRzZXQ6IChraiktPlxuXHRcdFx0QF9raiA9IGtqXG5cdFx0XHRAdyA9IEBxMC8oa2ogLSBAazApXG5cblx0QHByb3BlcnR5ICdrMCcsXG5cdFx0Z2V0Oi0+XG5cdFx0XHRAX2swXG5cdFx0c2V0OiAoazApLT5cblx0XHRcdEBfazAgPSBrMFxuXHRcdFx0QHEwID0gQHZmKmswXG5cdFx0XHRAdyA9IEBxMC8oQGtqIC0gazApXG5cblx0QHByb3BlcnR5ICdudW1fY2FycycsIFxuXHRcdGdldDotPlxuXHRcdFx0QF9udW1fY2Fyc1xuXHRcdHNldDoobnVtX2NhcnMpLT5cblx0XHRcdEBfbnVtX2NhcnMgPSBNYXRoLnJvdW5kIG51bV9jYXJzXG5cdFx0XHRAX2sgPSB2L1MubnVtX2NlbGxzXG5cblx0QHByb3BlcnR5ICdrJyxcblx0XHRnZXQ6LT5cblx0XHRcdEBfa1xuXHRcdHNldDooayktPlxuXHRcdFx0QF9rID0ga1xuXHRcdFx0QF9udW1fY2FycyA9IE1hdGgucm91bmQgaypTLm51bV9jZWxsc1xuXG5cdEBwcm9wZXJ0eSAnZGVsdGEnLFxuXHRcdGdldDogLT5cblx0XHRcdEBfb2Zmc2V0KkBjeWNsZVxuXG5cdEBwcm9wZXJ0eSAncmVkX3RpbWUnLFxuXHRcdGdldDotPlxuXHRcdFx0QGN5Y2xlICogQHJlZFxuXG5cdEBwcm9wZXJ0eSAnZCcsIFxuXHRcdGdldDotPlxuXHRcdFx0QF9kXG5cdFx0c2V0OihkKS0+XG5cdFx0XHRAX251bV9zaWduYWxzID0gTWF0aC5yb3VuZCBAbnVtX2NlbGxzL2Rcblx0XHRcdEBfZCA9IEBudW1fY2VsbHMvQF9udW1fc2lnbmFsc1xuXHRcdFx0QF9vZmZzZXQgPSBNYXRoLnJvdW5kKEBfb2Zmc2V0ICogQF9udW1fc2lnbmFscykvQF9udW1fc2lnbmFsc1xuXG5cdEBwcm9wZXJ0eSAnbnVtX3NpZ25hbHMnLFxuXHRcdGdldDotPlxuXHRcdFx0QF9udW1fc2lnbmFsc1xuXHRcdHNldDogKG51bV9zaWduYWxzKS0+XG5cdFx0XHRAX251bV9zaWduYWxzID0gbnVtX3NpZ25hbHNcblx0XHRcdEBfZCA9IE1hdGgucm91bmQgQG51bV9jZWxscy9AX251bV9zaWduYWxzXG5cdFx0XHRAX29mZnNldCA9IE1hdGgucm91bmQoQF9vZmZzZXQgKiBAX251bV9zaWduYWxzKS9AX251bV9zaWduYWxzXG5cblx0QHByb3BlcnR5ICdvZmZzZXQnLFxuXHRcdGdldDotPlxuXHRcdFx0QF9vZmZzZXRcblx0XHRzZXQ6KG9mZnNldCktPlxuXHRcdFx0QF9vZmZzZXQgPSBNYXRoLnJvdW5kKG9mZnNldCAqIEBfbnVtX3NpZ25hbHMpL0BfbnVtX3NpZ25hbHNcblxuXHRhZHZhbmNlOiAtPlxuXHRcdEB0aW1lKytcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2V0dGluZ3MoKSJdfQ==
