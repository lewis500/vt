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
    kj = S.kj;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL2FwcC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL2RpcmVjdGl2ZXMvZDNEZXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9kaXJlY3RpdmVzL2RhdHVtLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvZGlyZWN0aXZlcy9zbGlkZXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9kaXJlY3RpdmVzL3hBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvZGlyZWN0aXZlcy95QXhpcy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL2hlbHBlcnMuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9tZmQuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9tb2RlbHMvY2FyLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvbW9kZWxzL2NlbGwuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9tb2RlbHMvc2lnbmFsLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvbW9kZWxzL3NvbHZlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL21vZGVscy90cmFmZmljLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25h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LElBQUMsQ0FBQTthQUNsQixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsWUFBdkIsQ0FBQSxHQUFxQyxJQUFDLENBQUE7SUFIOUMsQ0FGSjtHQUREOztFQVFBLFFBQUMsQ0FBQSxRQUFELENBQVUsYUFBVixFQUNDO0lBQUEsR0FBQSxFQUFJLFNBQUE7YUFDSCxJQUFDLENBQUE7SUFERSxDQUFKO0lBRUEsR0FBQSxFQUFLLFNBQUMsV0FBRDtNQUNKLElBQUMsQ0FBQSxZQUFELEdBQWdCO01BQ2hCLElBQUMsQ0FBQSxFQUFELEdBQU0sSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFDLENBQUEsU0FBRCxHQUFXLElBQUMsQ0FBQSxZQUF2QjthQUNOLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxZQUF2QixDQUFBLEdBQXFDLElBQUMsQ0FBQTtJQUg3QyxDQUZMO0dBREQ7O0VBUUEsUUFBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWLEVBQ0M7SUFBQSxHQUFBLEVBQUksU0FBQTthQUNILElBQUMsQ0FBQTtJQURFLENBQUo7SUFFQSxHQUFBLEVBQUksU0FBQyxNQUFEO2FBQ0gsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJLENBQUMsS0FBTCxDQUFXLE1BQUEsR0FBUyxJQUFDLENBQUEsWUFBckIsQ0FBQSxHQUFtQyxJQUFDLENBQUE7SUFENUMsQ0FGSjtHQUREOztxQkFNQSxPQUFBLEdBQVMsU0FBQTtXQUNSLElBQUMsQ0FBQSxJQUFEO0VBRFE7Ozs7OztBQUdWLE1BQU0sQ0FBQyxPQUFQLEdBQXFCLElBQUEsUUFBQSxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblRyYWZmaWMgPSByZXF1aXJlICcuL21vZGVscy90cmFmZmljJ1xuQ2FyID0gcmVxdWlyZSAnLi9tb2RlbHMvY2FyJ1xuU29sdmVyID0gcmVxdWlyZSAnLi9tb2RlbHMvc29sdmVyJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0cGF1c2VkOiB0cnVlXG5cdFx0XHR0cmFmZmljOiBuZXcgVHJhZmZpY1xuXHRcdFx0c29sdmVyOiBuZXcgU29sdmVyXG5cdFx0QHNjb3BlLnRyYWZmaWMgPSBAdHJhZmZpY1xuXG5cdFx0QHNjb3BlLlMgPSBTXG5cblx0XHQjIEBzY29wZS4kd2F0Y2ggLT5cblx0XHQjIFx0Uy5zdW0oKVxuXHRcdCMgLCBAb25fY2hhbmdlLmJpbmQodGhpcylcblxuXHRcdEBzY29wZS4kd2F0Y2ggJ1MubnVtX2NhcnMnLCA9PlxuXHRcdFx0QHRyYWZmaWMubWFrZV9jYXJzKClcblx0XHRcdEBkYXRhX3RoZW9yeSA9IEBzb2x2ZXIuZmluZF9tZmQoKVxuXG5cdFx0QHNjb3BlLiR3YXRjaCAnUy5udW1fc2lnbmFscycsID0+XG5cdFx0XHRAdHJhZmZpYy5tYWtlX3NpZ25hbHMoKVxuXHRcdFx0QGRhdGFfdGhlb3J5ID0gQHNvbHZlci5maW5kX21mZCgpXG5cblx0XHRAc2NvcGUuJHdhdGNoICdTLm9mZnNldCArIFMuY3ljbGUgKyBTLnJlZCcsPT5cblx0XHRcdEB0cmFmZmljLnJlc2V0X3NpZ25hbHMoKVxuXHRcdFx0QGRhdGFfdGhlb3J5ID0gQHNvbHZlci5maW5kX21mZCgpXG5cblx0XHRAc2NvcGUuJHdhdGNoICdTLnEwICsgUy53Jyw9PlxuXHRcdFx0QGRhdGFfdGhlb3J5ID0gQHNvbHZlci5maW5kX21mZCgpXG5cdFx0XG5cdCMgb25fY2hhbmdlOiAtPlxuXHQjIFx0XHRAdHJhZmZpYy5yZXNldCgpXG5cblx0cm90YXRvcjogKGNhciktPiBcInJvdGF0ZSgje1Muc2NhbGUoY2FyLmxvYyl9KSB0cmFuc2xhdGUoMCw1MClcIlxuXG5cdGNsaWNrOiAodmFsKSAtPiBpZiAhdmFsIHRoZW4gQHBsYXkoKVxuXHRwYXVzZTogLT4gQHBhdXNlZCA9IHRydWVcblx0dGljazogLT5cblx0XHRkMy50aW1lciA9PlxuXHRcdFx0XHRTLmFkdmFuY2UoKVxuXHRcdFx0XHRAdHJhZmZpYy50aWNrKClcblx0XHRcdFx0QHNjb3BlLiRldmFsQXN5bmMoKVxuXHRcdFx0XHRAcGF1c2VkXG5cdHBsYXk6IC0+XG5cdFx0QHBhdXNlKClcblx0XHRAcGF1c2VkID0gZmFsc2Vcblx0XHRAdGljaygpXG5cbnZpc0RlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHNjb3BlOiB7fVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L3Zpcy5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgQ3RybF1cblxuYW5ndWxhci5tb2R1bGUgJ21haW5BcHAnICwgW3JlcXVpcmUgJ2FuZ3VsYXItbWF0ZXJpYWwnICwgcmVxdWlyZSAnYW5ndWxhci1hbmltYXRlJ11cblx0LmRpcmVjdGl2ZSAndmlzRGVyJywgdmlzRGVyXG5cdC5kaXJlY3RpdmUgJ2RhdHVtJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL2RhdHVtJ1xuXHQuZGlyZWN0aXZlICdkM0RlcicsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9kM0Rlcidcblx0LmRpcmVjdGl2ZSAnbWZkQ2hhcnQnLCByZXF1aXJlICcuL21mZCdcblx0LmRpcmVjdGl2ZSAnaG9yQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy94QXhpcydcblx0LmRpcmVjdGl2ZSAndmVyQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy95QXhpcydcblx0LmRpcmVjdGl2ZSAnc2xpZGVyRGVyJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3NsaWRlcidcbiIsImQzID0gcmVxdWlyZSAnZDMnXG5hbmd1bGFyID0gcmVxdWlyZSAnYW5ndWxhcidcblxuZGVyID0gKCRwYXJzZSktPiAjZ29lcyBvbiBhIHN2ZyBlbGVtZW50XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRzY29wZTogXG5cdFx0XHRkM0RlcjogJz0nXG5cdFx0XHR0cmFuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdHUgPSAndC0nICsgTWF0aC5yYW5kb20oKVxuXHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gZmFsc2Vcblx0XHRcdHNjb3BlLiR3YXRjaCAnZDNEZXInXG5cdFx0XHRcdCwgKHYpLT5cblx0XHRcdFx0XHRpZiBzY29wZS50cmFuIGFuZCBoYXNUcmFuc2l0aW9uZWRcblx0XHRcdFx0XHRcdGhhc1RyYW5zaXRpb25lZCA9IHRydWVcblx0XHRcdFx0XHRcdHNlbC50cmFuc2l0aW9uIHVcblx0XHRcdFx0XHRcdFx0LmF0dHIgdlxuXHRcdFx0XHRcdFx0XHQuY2FsbCBzY29wZS50cmFuXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gdHJ1ZVxuXHRcdFx0XHRcdFx0c2VsLmF0dHIgdlxuXHRcdFx0XHQsIHRydWVcbm1vZHVsZS5leHBvcnRzID0gZGVyIiwibW9kdWxlLmV4cG9ydHMgPSAoJHBhcnNlKS0+XG5cdChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRkMy5zZWxlY3QoZWxbMF0pLmRhdHVtICRwYXJzZShhdHRyLmRhdHVtKShzY29wZSkiLCJkZXIgPSAtPlxuXHRyZXMgPSBcblx0XHRzY29wZTogXG5cdFx0XHRsYWJlbDogJ0AnXG5cdFx0XHRteURhdGE6ICc9J1xuXHRcdFx0bWluOiAnPSdcblx0XHRcdG1heDogJz0nXG5cdFx0XHRzdGVwOiAnPSdcblx0XHQjIGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHJlcGxhY2U6IHRydWVcblx0XHQjIGNvbnRyb2xsZXI6IC0+XG5cdFx0IyBiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3Qvc2xpZGVyLmh0bWwnXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcblxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGZ1bjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2NhbGUgPSBzY29wZS5mdW4uc2NhbGUoKVxuXG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LmNsYXNzZWQgJ2hvciBheGlzJywgdHJ1ZVxuXG5cdFx0XHRzZWwuY2FsbCBzY29wZS5mdW5cblx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZnVuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzY2FsZSA9IHNjb3BlLmZ1bi5zY2FsZSgpXG5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuY2xhc3NlZCAndmVyIGF4aXMnLCB0cnVlXG5cblx0XHRcdHNlbC5jYWxsIHNjb3BlLmZ1blxuXHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsIid1c2Ugc3RyaWN0J1xuXG5GdW5jdGlvbjo6cHJvcGVydHkgPSAocHJvcCwgZGVzYykgLT5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsIHByb3AsIGRlc2MiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsZWwpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0d2lkdGg6IDMwMFxuXHRcdFx0aGVpZ2h0OiAzMDBcblx0XHRcdG06IFxuXHRcdFx0XHR0OiAxMFxuXHRcdFx0XHRsOiA0MFxuXHRcdFx0XHRyOiAxOFxuXHRcdFx0XHRiOiAzNVxuXG5cdFx0QGhvciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHRcdC5kb21haW4gWzAsNV1cblx0XHRcdFx0LnJhbmdlIFswLEB3aWR0aF1cblxuXHRcdEB2ZXIgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCwgNV1cblx0XHRcdC5yYW5nZSBbQGhlaWdodCwgMF1cblxuXHRcdEBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQua1xuXHRcdFx0LnkgKGQpPT5AdmVyIGQucVxuXHRcdFx0LmRlZmluZWQgKGQpLT5kLnE+MFxuXG5cdFx0QGhvckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQGhvclxuXHRcdFx0Lm9yaWVudCAnYm90dG9tJ1xuXHRcdFx0LnRpY2tzIDhcblxuXHRcdEB2ZXJBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEB2ZXJcblx0XHRcdC5vcmllbnQgJ2xlZnQnXG5cblx0ZDogLT5cblx0XHRAbGluZSBAZGF0YVxuXHRcbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHRzY29wZTogXG5cdFx0XHRkYXRhOiAnPSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC9tZmRDaGFydC5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJTID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuXG5jbGFzcyBDYXJcblx0Y29uc3RydWN0b3I6LT5cblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdjYXItJ1xuXHRcdEBjb2xvciA9IF8uc2FtcGxlIFMuY29sb3JzLmRvbWFpbigpXG5cblx0c2V0X2xvYzogKEBsb2MpLT5cblxubW9kdWxlLmV4cG9ydHMgPSBDYXIiLCJTID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuXG5jbGFzcyBDZWxsXG5cdGNvbnN0cnVjdG9yOiAoQGxvYyktPlxuXHRcdEBsYXN0ID0gLUluZmluaXR5XG5cdFx0QHRlbXBfY2FyID0gQGNhciA9IGZhbHNlXG5cdFx0QGlkID0gXy51bmlxdWVJZCAnY2VsbCdcblx0XHRAc2lnbmFsID0gdW5kZWZpbmVkXG5cblx0c2V0X3NpZ25hbDogKEBzaWduYWwpLT5cblx0XHRAc2lnbmFsLmxvYyA9IEBsb2Ncblx0XHRAc2lnbmFsLmNlbGwgPSB0aGlzXG5cblx0Y2xlYXJfc2lnbmFsOiAtPlxuXHRcdEBzaWduYWwgPSB1bmRlZmluZWRcblxuXHRzcGFjZTogNFxuXG5cdHJlY2VpdmU6KGNhciktPlxuXHRcdGNhci5zZXRfbG9jIEBsb2Ncblx0XHRAbGFzdCA9IFMudGltZVxuXHRcdEB0ZW1wX2NhciA9IGNhclxuXHRcdGNhci5jZWxsID0gdGhpc1xuXG5cdHJlbW92ZTogLT5cblx0XHRAdGVtcF9jYXIgPSBmYWxzZVxuXG5cdGZpbmFsaXplOiAtPlxuXHRcdGlmIChAY2FyPUB0ZW1wX2Nhcilcblx0XHRcdEBsYXN0ID0gUy50aW1lXG5cblx0aXNfZnJlZTogLT5cblx0XHRpZiBAc2lnbmFsXG5cdFx0XHRyZXR1cm4gKEBzaWduYWwuZ3JlZW4gYW5kICgoUy50aW1lLUBsYXN0KT5Ac3BhY2UpKVxuXHRcdGVsc2Vcblx0XHRcdChTLnRpbWUtQGxhc3QpPkBzcGFjZVxuXG5tb2R1bGUuZXhwb3J0cyA9IENlbGwiLCJTID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuXG5jbGFzcyBTaWduYWxcblx0Y29uc3RydWN0b3I6IChAaSkgLT5cblx0XHRAY291bnQgPSAwXG5cdFx0QGdyZWVuID0gdHJ1ZVxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ3NpZ25hbC0nXG5cdFx0QHJlc2V0KClcblxuXHRyZXNldDogLT5cblx0XHRAb2Zmc2V0ID0gUy5jeWNsZSooKEBpKlMub2Zmc2V0KSUxKVxuXHRcdFtAY291bnQsIEBncmVlbl0gPSBbQG9mZnNldCwgdHJ1ZV1cblxuXHR0aWNrOiAtPlxuXHRcdEBjb3VudCsrXG5cdFx0aWYgQGNvdW50ID4gUy5jeWNsZVxuXHRcdFx0W0Bjb3VudCwgQGdyZWVuXSA9IFswLCB0cnVlXVxuXHRcdGlmIChAY291bnQpPj0oKDEtUy5yZWQpKlMuY3ljbGUpXG5cdFx0XHRAZ3JlZW4gPSBmYWxzZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpZ25hbCIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4uL3NldHRpbmdzJ1xuXG5jbGFzcyBMaWdodFxuXHRjb25zdHJ1Y3RvcjooQGwpLT5cblx0XHRAeCA9IFMuZCAqIEBsXG5cblx0aW50ZXJzZWN0Oih0KS0+XG5cdFx0b2Zmc2V0ID0gUy5kZWx0YSpAbFxuXHRcdGxlZnRvdmVyID0gKHQrb2Zmc2V0KSVTLmN5Y2xlXG5cdFx0aWYgbGVmdG92ZXI8KFMucmVkKlMuY3ljbGUpXG5cdFx0XHQwXG5cdFx0ZWxzZVxuXHRcdFx0Uy5jeWNsZS1sZWZ0b3ZlclxuXG5jbGFzcyBTb2x2ZXJcblx0Y29uc3RydWN0b3I6IC0+XG5cblx0bWFrZV90YWJsZTotPlxuXHRcdHJlZF90aW1lID0gUy5yZWRfdGltZVxuXHRcdGtqID0gUy5ralxuXHRcdHJlcyA9IFtdXG5cdFx0W3RpbWVfc3RvcHBlZCxsXSA9IFsxMDAwLC0xXVxuXHRcdHdoaWxlIHRpbWVfc3RvcHBlZD4wIGFuZCArK2w8NTBcblx0XHRcdGxpZ2h0ID0gbmV3IExpZ2h0IGxcblx0XHRcdHRpbWVfdHJhdmVsaW5nID0gbGlnaHQueC9TLnZmXG5cdFx0XHR0aW1lX2Fycml2YWwgPSByZWRfdGltZSArIHRpbWVfdHJhdmVsaW5nXG5cdFx0XHR0aW1lX3N0b3BwZWQgPSBsaWdodC5pbnRlcnNlY3QgdGltZV9hcnJpdmFsXG5cdFx0XHRyZXMucHVzaCBcblx0XHRcdFx0eDogbGlnaHQueFxuXHRcdFx0XHR0OiB0aW1lX2Fycml2YWwrdGltZV9zdG9wcGVkXG5cdFx0XHRcdGc6IHRpbWVfc3RvcHBlZFxuXHRcdFx0XHRsOiBsaWdodC5sXG5cdFx0XHRcdGM6IFMucTAqdGltZV9zdG9wcGVkXG5cblx0XHRbdGltZV9zdG9wcGVkLGxdID0gWzEwMDAsMF1cblx0XHR3aGlsZSB0aW1lX3N0b3BwZWQ+MCBhbmQgLS1sPi01MFxuXHRcdFx0bGlnaHQgPSBuZXcgTGlnaHQgbFxuXHRcdFx0dGltZV90cmF2ZWxpbmc9IC1saWdodC54L1Mud1xuXHRcdFx0dGltZV9hcnJpdmFsID0gcmVkX3RpbWUgKyB0aW1lX3RyYXZlbGluZ1xuXHRcdFx0dGltZV9zdG9wcGVkID0gbGlnaHQuaW50ZXJzZWN0IHRpbWVfYXJyaXZhbFxuXHRcdFx0cmVzLnB1c2hcblx0XHRcdFx0eDogbGlnaHQueFxuXHRcdFx0XHR0OiB0aW1lX2Fycml2YWwgKyB0aW1lX3N0b3BwZWRcblx0XHRcdFx0ZzogdGltZV9zdG9wcGVkXG5cdFx0XHRcdGw6IGxcblx0XHRcdFx0YzogLWxpZ2h0Lngqa2ogKyBTLnEwKnRpbWVfc3RvcHBlZFxuXHRcdHJlc1xuXG5cdGZpbmRfbWluOiAoayx0YWJsZSktPlxuXHRcdGZsb3cgPSBJbmZpbml0eVxuXHRcdHJlcyA9IHt9XG5cdFx0Zm9yIGUgaW4gdGFibGVcblx0XHRcdGZsb3dfbCA9IChlLmMgKyBrKmUueCkvKGUudClcblx0XHRcdGlmIGZsb3dfbDw9Zmxvd1xuXHRcdFx0XHRmbG93ID0gZmxvd19sXG5cdFx0XHRcdHJlcyA9IF8uY2xvbmUgZVxuXHRcdHJlcy5rID0ga1xuXHRcdHJlcy5xID0gZmxvd1xuXHRcdHJldHVybiByZXNcblxuXHRmaW5kX21mZDotPlxuXHRcdHRhYmxlID0gQG1ha2VfdGFibGUoKVxuXHRcdHJlcyA9IChAZmluZF9taW4gayx0YWJsZSBmb3IgayBpbiBfLnJhbmdlIDAsNSwuMDEpXG5cbm1vZHVsZS5leHBvcnRzID0gU29sdmVyIiwiUyA9IHJlcXVpcmUgJy4uL3NldHRpbmdzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbkNhciA9IHJlcXVpcmUgJy4vY2FyJ1xuU2lnbmFsID0gcmVxdWlyZSAnLi9zaWduYWwnXG5DZWxsID0gcmVxdWlyZSAnLi9jZWxsJ1xuXG5jbGFzcyBUcmFmZmljXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBjZWxscyA9IChuZXcgQ2VsbCBuIGZvciBuIGluIFswLi4uUy5udW1fY2VsbHNdKVxuXHRcdEBtYWtlX3NpZ25hbHMoKVxuXHRcdEBtYWtlX2NhcnNcblxuXHRtYWtlX2NhcnM6IC0+XG5cdFx0bnVtX2NhcnMgPSBTLm51bV9jYXJzXG5cdFx0bnVtX2NlbGxzID0gUy5udW1fY2VsbHNcblx0XHRAY2FycyA9IFswLi4uUy5udW1fY2Fyc10ubWFwIC0+IG5ldyBDYXIoKVxuXG5cdFx0Zm9yIGMsaSBpbiBAY2Fyc1xuXHRcdFx0bG9jID0gTWF0aC5yb3VuZChudW1fY2VsbHMqaS9AY2Fycy5sZW5ndGgpXG5cdFx0XHR1bmxlc3MgQGNlbGxzW2xvY10/LmNhclxuXHRcdFx0XHRAY2VsbHNbbG9jXS5yZWNlaXZlIGNcblxuXG5cdG1ha2Vfc2lnbmFsczotPlxuXHRcdGNlbGwuY2xlYXJfc2lnbmFsKCkgZm9yIGNlbGwgaW4gQGNlbGxzXG5cdFx0QHNpZ25hbHMgPSBbXVxuXHRcdG51bV9zaWduYWxzID0gUy5udW1fc2lnbmFsc1xuXHRcdG51bV9jZWxscyA9IFMubnVtX2NlbGxzXG5cdFx0Zm9yIGkgaW4gWzAuLi5udW1fc2lnbmFsc11cblx0XHRcdHNpZ25hbCA9IG5ldyBTaWduYWwgaVxuXHRcdFx0QHNpZ25hbHMucHVzaCBzaWduYWxcblx0XHRcdHdoaWNoID0gTWF0aC5mbG9vcihpL251bV9zaWduYWxzKm51bV9jZWxscylcblx0XHRcdEBjZWxsc1t3aGljaF0uc2V0X3NpZ25hbCBzaWduYWxcblxuXHRyZXNldF9zaWduYWxzOi0+XG5cdFx0c2lnbmFsLnJlc2V0KCkgZm9yIHNpZ25hbCBpbiBAc2lnbmFsc1xuXG5cdHRpY2s6LT5cblx0XHRrID0gQGNlbGxzXG5cblx0XHRzaWduYWwudGljaygpIGZvciBzaWduYWwgaW4gQHNpZ25hbHNcblxuXHRcdGZvciBjZWxsLGkgaW4ga1xuXHRcdFx0aWYgY2VsbC5jYXJcblx0XHRcdFx0aWYga1soaSsxKSVrLmxlbmd0aF0uaXNfZnJlZSgpXG5cdFx0XHRcdFx0a1soaSsxKSVrLmxlbmd0aF0ucmVjZWl2ZSBjZWxsLmNhclxuXHRcdFx0XHRcdGNlbGwucmVtb3ZlKClcblxuXHRcdGNlbGwuZmluYWxpemUoKSBmb3IgY2VsbCBpbiBAY2VsbHNcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFmZmljXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbnJlcXVpcmUgJy4vaGVscGVycydcblxuY2xhc3MgU2V0dGluZ3Ncblx0Y29uc3RydWN0b3I6LT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0bnVtX2NlbGxzOiAyMDAwXG5cdFx0XHRfbnVtX2NhcnM6IDMwMFxuXHRcdFx0X2s6IDMwMC8yMDAwXG5cdFx0XHRfbnVtX3NpZ25hbHM6IDUwXG5cdFx0XHRfb2Zmc2V0OiAuM1xuXHRcdFx0X2Q6IDIwMDAvNTBcblx0XHRcdF9rajogMSooMysxLzEpXG5cdFx0XHRfazA6IDFcblx0XHRcdHRpbWU6IDBcblx0XHRcdHNwYWNlOiAzXG5cdFx0XHRyZWQ6IC4wMlxuXHRcdFx0Y3ljbGU6IDUwXG5cdFx0XHR2ZjogMVxuXHRcdFx0dzogMS8zXG5cdFx0XHRxMDogMVxuXG5cdFx0QGNvbG9ycyA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIF8ucmFuZ2UgMCxAbnVtX2NlbGxzLEBudW1fY2VsbHMvNlxuXHRcdFx0LnJhbmdlIFtcblx0XHRcdFx0JyNGNDQzMzYnLCAjcmVkXG5cdFx0XHRcdCcjMjE5NkYzJywgI2JsdWVcblx0XHRcdFx0JyNFOTFFNjMnLCAjcGlua1xuXHRcdFx0XHQnIzAwQkNENCcsICNjeWFuXG5cdFx0XHRcdCcjRkZDMTA3JywgI2FtYmVyXG5cdFx0XHRcdCcjNENBRjUwJywgI2dyZWVuXG5cdFx0XHRcdF1cblxuXHRcdEBzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLEBudW1fY2VsbHNdXG5cdFx0XHQucmFuZ2UgWzAsMzYwXVxuXG5cdCMgc3VtOiAtPlxuXHQjIFx0QGN5Y2xlICsgQG9mZnNldCArIEBxMCArIEByZWQgKyBAZFxuXG5cdEBwcm9wZXJ0eSAna2onLFxuXHRcdGdldDotPlxuXHRcdFx0QF9ralxuXHRcdHNldDogKGtqKS0+XG5cdFx0XHRAX2tqID0ga2pcblx0XHRcdEB3ID0gQHEwLyhraiAtIEBrMClcblxuXHRAcHJvcGVydHkgJ2swJyxcblx0XHRnZXQ6LT5cblx0XHRcdEBfazBcblx0XHRzZXQ6IChrMCktPlxuXHRcdFx0QF9rMCA9IGswXG5cdFx0XHRAcTAgPSBAdmYqazBcblx0XHRcdEB3ID0gQHEwLyhAa2ogLSBrMClcblxuXHRAcHJvcGVydHkgJ251bV9jYXJzJywgXG5cdFx0Z2V0Oi0+XG5cdFx0XHRAX251bV9jYXJzXG5cdFx0c2V0OihudW1fY2FycyktPlxuXHRcdFx0QF9udW1fY2FycyA9IE1hdGgucm91bmQgbnVtX2NhcnNcblx0XHRcdEBfayA9IHYvUy5udW1fY2VsbHNcblxuXHRAcHJvcGVydHkgJ2snLFxuXHRcdGdldDotPlxuXHRcdFx0QF9rXG5cdFx0c2V0OihrKS0+XG5cdFx0XHRAX2sgPSBrXG5cdFx0XHRAX251bV9jYXJzID0gTWF0aC5yb3VuZCBrKlMubnVtX2NlbGxzXG5cblx0QHByb3BlcnR5ICdkZWx0YScsXG5cdFx0Z2V0OiAtPlxuXHRcdFx0QF9vZmZzZXQqQGN5Y2xlXG5cblx0QHByb3BlcnR5ICdyZWRfdGltZScsXG5cdFx0Z2V0Oi0+XG5cdFx0XHRAY3ljbGUgKiBAcmVkXG5cblx0QHByb3BlcnR5ICdkJywgXG5cdFx0Z2V0Oi0+XG5cdFx0XHRAX2Rcblx0XHRzZXQ6KGQpLT5cblx0XHRcdEBfbnVtX3NpZ25hbHMgPSBNYXRoLnJvdW5kIEBudW1fY2VsbHMvZFxuXHRcdFx0QF9kID0gQG51bV9jZWxscy9AX251bV9zaWduYWxzXG5cdFx0XHRAX29mZnNldCA9IE1hdGgucm91bmQoQF9vZmZzZXQgKiBAX251bV9zaWduYWxzKS9AX251bV9zaWduYWxzXG5cblx0QHByb3BlcnR5ICdudW1fc2lnbmFscycsXG5cdFx0Z2V0Oi0+XG5cdFx0XHRAX251bV9zaWduYWxzXG5cdFx0c2V0OiAobnVtX3NpZ25hbHMpLT5cblx0XHRcdEBfbnVtX3NpZ25hbHMgPSBudW1fc2lnbmFsc1xuXHRcdFx0QF9kID0gTWF0aC5yb3VuZCBAbnVtX2NlbGxzL0BfbnVtX3NpZ25hbHNcblx0XHRcdEBfb2Zmc2V0ID0gTWF0aC5yb3VuZChAX29mZnNldCAqIEBfbnVtX3NpZ25hbHMpL0BfbnVtX3NpZ25hbHNcblxuXHRAcHJvcGVydHkgJ29mZnNldCcsXG5cdFx0Z2V0Oi0+XG5cdFx0XHRAX29mZnNldFxuXHRcdHNldDoob2Zmc2V0KS0+XG5cdFx0XHRAX29mZnNldCA9IE1hdGgucm91bmQob2Zmc2V0ICogQF9udW1fc2lnbmFscykvQF9udW1fc2lnbmFsc1xuXG5cdGFkdmFuY2U6IC0+XG5cdFx0QHRpbWUrK1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTZXR0aW5ncygpIl19
