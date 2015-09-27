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

angular.module('mainApp', [require('angular-material', require('angular-animate'))]).directive('visDer', visDer).directive('datum', require('./directives/datum')).directive('d3Der', require('./directives/d3Der')).directive('mfdChart', require('./mfd')).directive('horAxis', require('./directives/xAxis')).directive('verAxis', require('./directives/yAxis')).directive('sliderDer', require('./directives/slider')).directive('shifter', require('./directives/shifter'));



},{"./directives/d3Der":2,"./directives/datum":3,"./directives/shifter":4,"./directives/slider":5,"./directives/xAxis":6,"./directives/yAxis":7,"./mfd":9,"./models/car":10,"./models/solver":13,"./models/traffic":14,"./settings":15,"angular":undefined,"angular-animate":undefined,"angular-material":undefined,"d3":undefined,"lodash":undefined}],2:[function(require,module,exports){
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
var d3, der;

d3 = require('d3');

der = function($parse) {
  var directive;
  return directive = {
    restrict: 'A',
    link: function(scope, el, attr) {
      var reshift, sel, tran, u;
      sel = d3.select(el[0]);
      u = 't-' + Math.random();
      tran = $parse(attr.tran)(scope);
      reshift = function(v) {
        if (tran) {
          return sel.transition(u).attr('transform', "translate(" + v[0] + "," + v[1] + ")").call(tran);
        } else {
          return sel.attr('transform', "translate(" + v[0] + "," + v[1] + ")");
        }
      };
      return scope.$watch(function() {
        return $parse(attr.shifter)(scope);
      }, reshift, true);
    }
  };
};

module.exports = der;



},{"d3":undefined}],5:[function(require,module,exports){
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



},{}],6:[function(require,module,exports){
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



},{"d3":undefined}],7:[function(require,module,exports){
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



},{"d3":undefined}],8:[function(require,module,exports){
'use strict';
Function.prototype.property = function(prop, desc) {
  return Object.defineProperty(this.prototype, prop, desc);
};



},{}],9:[function(require,module,exports){
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
    this.hor = d3.scale.linear().domain([0, 1]).range([0, this.width]);
    this.ver = d3.scale.linear().domain([0, 1 / 3]).range([this.height, 0]);
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
      data: '=',
      memory: '='
    },
    templateUrl: './dist/mfdChart.html',
    controller: ['$scope', '$element', Ctrl]
  };
};

module.exports = der;



},{"./settings":15,"d3":undefined,"lodash":undefined}],10:[function(require,module,exports){
var Car, S, _, n;

S = require('../settings');

_ = require('lodash');

n = 0;

Car = (function() {
  function Car() {
    this.id = n++;
    this.color = _.sample(S.colors.range());
  }

  Car.prototype.set_loc = function(loc) {
    this.loc = loc;
  };

  return Car;

})();

module.exports = Car;



},{"../settings":15,"lodash":undefined}],11:[function(require,module,exports){
var Cell, S, _;

S = require('../settings');

_ = require('lodash');

Cell = (function() {
  function Cell(loc) {
    this.loc = loc;
    this.been_free = Infinity;
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

  Cell.prototype.receive = function(car) {
    car.set_loc(this.loc);
    this.temp_car = car;
    this.been_free = 0;
    return car.cell = this;
  };

  Cell.prototype.reset = function() {
    this.been_free = Infinity;
    return this.temp_car = this.car = false;
  };

  Cell.prototype.remove = function() {
    this.been_free = 1;
    return this.temp_car = this.car = false;
  };

  Cell.prototype.finalize = function() {
    this.car = this.temp_car;
    if (!!this.car) {
      return this.been_free = 0;
    } else {
      return this.been_free++;
    }
  };

  Cell.prototype.is_free = function() {
    if (this.signal) {
      return this.signal.green && (this.been_free > (1 / S.w));
    } else {
      return this.been_free > (1 / S.w);
    }
  };

  return Cell;

})();

module.exports = Cell;



},{"../settings":15,"lodash":undefined}],12:[function(require,module,exports){
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



},{"../settings":15,"lodash":undefined}],13:[function(require,module,exports){
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



},{"../settings":15,"d3":undefined,"lodash":undefined}],14:[function(require,module,exports){
var Car, Cell, Memory, S, Signal, Traffic, _;

S = require('../settings');

_ = require('lodash');

Car = require('./car');

Signal = require('./signal');

Cell = require('./cell');

Memory = (function() {
  function Memory() {
    this.long_term = [];
    this.reset();
  }

  Memory.prototype.reset = function() {
    var ref;
    return ref = [0, 0, 0], this.q = ref[0], this.k = ref[1], this.i = ref[2], ref;
  };

  Memory.prototype.span = 30;

  Memory.prototype.remember = function(q, k) {
    this.i++;
    this.q += q;
    this.k += k;
    if (this.i >= this.span) {
      this.long_term.push({
        q: this.q / (this.span * S.num_cells),
        k: this.k / (this.span * S.num_cells),
        id: _.uniqueId('memory-')
      });
      this.reset();
      if (this.long_term.length > 10) {
        return this.long_term.shift();
      }
    }
  };

  return Memory;

})();

Traffic = (function() {
  function Traffic() {
    var cell, i, j, len, n, ref;
    this.cells = (function() {
      var j, ref, results;
      results = [];
      for (n = j = 0, ref = S.num_cells; 0 <= ref ? j < ref : j > ref; n = 0 <= ref ? ++j : --j) {
        results.push(new Cell(n));
      }
      return results;
    })();
    ref = this.cells;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      cell = ref[i];
      cell.next = this.cells[(i + 1) % this.cells.length];
    }
    this.cars = [];
    this.signals = [];
    this.make_signals();
    this.make_cars();
    this.memory = new Memory();
  }

  Traffic.prototype.choose_cell = function(cell) {
    if (!cell.car) {
      return cell;
    } else {
      return this.choose_cell(cell.next);
    }
  };

  Traffic.prototype.make_cars = function() {
    var car, cell, diff, i, j, len, len1, m, num_cars, num_cells, o, ref, ref1, ref2, results;
    num_cars = S.num_cars, num_cells = S.num_cells;
    ref = this.cells;
    for (j = 0, len = ref.length; j < len; j++) {
      cell = ref[j];
      cell.reset();
    }
    diff = num_cars - this.cars.length;
    if (diff < 0) {
      this.cars = _.drop(this.cars, -diff);
    } else {
      for (i = m = 0, ref1 = diff; 0 <= ref1 ? m < ref1 : m > ref1; i = 0 <= ref1 ? ++m : --m) {
        this.cars.push(new Car());
      }
    }
    ref2 = this.cars;
    results = [];
    for (i = o = 0, len1 = ref2.length; o < len1; i = ++o) {
      car = ref2[i];
      cell = this.choose_cell(this.cells[Math.floor(i / num_cars * num_cells)]);
      results.push(cell.receive(car));
    }
    return results;
  };

  Traffic.prototype.make_signals = function() {
    var cell, diff, i, j, l, len, len1, m, num_cells, num_signals, o, ref, ref1, ref2, results, signal, which;
    num_signals = S.num_signals, num_cells = S.num_cells;
    ref = this.cells;
    for (j = 0, len = ref.length; j < len; j++) {
      cell = ref[j];
      cell.clear_signal();
    }
    l = this.signals.length;
    diff = num_signals - l;
    if (diff < 0) {
      this.signals = _.drop(this.signals, -diff);
    } else {
      for (i = m = 0, ref1 = diff; 0 <= ref1 ? m < ref1 : m > ref1; i = 0 <= ref1 ? ++m : --m) {
        this.signals.push(new Signal(l + i));
      }
    }
    ref2 = this.signals;
    results = [];
    for (i = o = 0, len1 = ref2.length; o < len1; i = ++o) {
      signal = ref2[i];
      signal.reset();
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
    var C, cell, j, len, len1, len2, m, o, q, ref, ref1, signal;
    C = this.cells;
    q = 0;
    ref = this.signals;
    for (j = 0, len = ref.length; j < len; j++) {
      signal = ref[j];
      signal.tick();
    }
    for (m = 0, len1 = C.length; m < len1; m++) {
      cell = C[m];
      if (cell.car) {
        if (cell.next.is_free()) {
          cell.next.receive(cell.car);
          cell.remove();
          q++;
        }
      }
    }
    ref1 = this.cells;
    for (o = 0, len2 = ref1.length; o < len2; o++) {
      cell = ref1[o];
      cell.finalize();
    }
    return this.memory.remember(q, this.cars.length);
  };

  return Traffic;

})();

module.exports = Traffic;



},{"../settings":15,"./car":10,"./cell":11,"./signal":12,"lodash":undefined}],15:[function(require,module,exports){
var Settings, _, d3;

d3 = require('d3');

_ = require('lodash');

require('./helpers');

Settings = (function() {
  function Settings() {
    _.assign(this, {
      num_cells: 1000,
      _num_cars: 300,
      _k: 300 / 1000,
      _num_signals: 50,
      _offset: .3,
      _d: 1000 / 50,
      kj: 1,
      _k0: 1 / 3,
      time: 0,
      red: .02,
      cycle: 50,
      vf: 1
    });
    this.k0 = 1 / 3;
    this.colors = d3.scale.linear().domain(_.range(0, this.num_cells, this.num_cells / 6)).range(['#F44336', '#2196F3', '#E91E63', '#00BCD4', '#FFC107', '#4CAF50']);
    this.scale = d3.scale.linear().domain([0, this.num_cells]).range([0, 360]);
  }

  Settings.property('q0', {
    get: function() {
      return this._k0;
    }
  });

  Settings.property('k0', {
    get: function() {
      return this._k0;
    },
    set: function(k0) {
      this._k0 = 1 / Math.round(1 / k0);
      return this.w = this._k0 / (this.kj - this._k0);
    }
  });

  Settings.property('num_cars', {
    get: function() {
      return this._num_cars;
    },
    set: function(num_cars) {
      this._num_cars = Math.round(num_cars);
      return this._k = this._num_cars / this.num_cells;
    }
  });

  Settings.property('k', {
    get: function() {
      return this._k;
    },
    set: function(k) {
      this._num_cars = Math.round(k * this.num_cells);
      return this._k = this._num_cars / this.num_cells;
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



},{"./helpers":8,"d3":undefined,"lodash":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL2FwcC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL2RpcmVjdGl2ZXMvZDNEZXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9kaXJlY3RpdmVzL2RhdHVtLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvZGlyZWN0aXZlcy9zaGlmdGVyLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvZGlyZWN0aXZlcy9zbGlkZXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9kaXJlY3RpdmVzL3hBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvZGlyZWN0aXZlcy95QXhpcy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL2hlbHBlcnMuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9tZmQuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9tb2RlbHMvY2FyLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvbW9kZWxzL2NlbGwuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9tb2RlbHMvc2lnbmFsLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvbW9kZWxzL3NvbHZlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL21vZGVscy90cmFmZmljLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvc2V0dGluZ3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQTs7QUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1YsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztBQUNMLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7QUFDSixDQUFBLEdBQUksT0FBQSxDQUFRLFlBQVI7O0FBQ0osT0FBQSxHQUFVLE9BQUEsQ0FBUSxrQkFBUjs7QUFDVixHQUFBLEdBQU0sT0FBQSxDQUFRLGNBQVI7O0FBQ04sTUFBQSxHQUFTLE9BQUEsQ0FBUSxpQkFBUjs7QUFFSDtFQUNPLGNBQUMsS0FBRDtJQUFDLElBQUMsQ0FBQSxRQUFEO0lBQ1osQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQ0M7TUFBQSxNQUFBLEVBQVEsSUFBUjtNQUNBLE9BQUEsRUFBUyxJQUFJLE9BRGI7TUFFQSxNQUFBLEVBQVEsSUFBSSxNQUZaO0tBREQ7SUFLQSxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsR0FBaUIsSUFBQyxDQUFBO0lBRWxCLElBQUMsQ0FBQSxLQUFLLENBQUMsQ0FBUCxHQUFXO0lBRVgsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsWUFBZCxFQUE0QixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7UUFDM0IsS0FBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULENBQUE7ZUFDQSxLQUFDLENBQUEsV0FBRCxHQUFlLEtBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFBO01BRlk7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVCO0lBSUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsZUFBZCxFQUErQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7UUFDOUIsS0FBQyxDQUFBLE9BQU8sQ0FBQyxZQUFULENBQUE7ZUFDQSxLQUFDLENBQUEs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QUQsR0FBVyxJQUFDLENBQUEsWUFBdkI7YUFDTixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsWUFBdkIsQ0FBQSxHQUFxQyxJQUFDLENBQUE7SUFIN0MsQ0FGTDtHQUREOztFQVFBLFFBQUMsQ0FBQSxRQUFELENBQVUsUUFBVixFQUNDO0lBQUEsR0FBQSxFQUFJLFNBQUE7YUFDSCxJQUFDLENBQUE7SUFERSxDQUFKO0lBRUEsR0FBQSxFQUFJLFNBQUMsTUFBRDthQUNILElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFBLEdBQVMsSUFBQyxDQUFBLFlBQXJCLENBQUEsR0FBbUMsSUFBQyxDQUFBO0lBRDVDLENBRko7R0FERDs7cUJBTUEsT0FBQSxHQUFTLFNBQUE7V0FDUixJQUFDLENBQUEsSUFBRDtFQURROzs7Ozs7QUFHVixNQUFNLENBQUMsT0FBUCxHQUFxQixJQUFBLFFBQUEsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJhbmd1bGFyID0gcmVxdWlyZSAnYW5ndWxhcidcbmQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5UcmFmZmljID0gcmVxdWlyZSAnLi9tb2RlbHMvdHJhZmZpYydcbkNhciA9IHJlcXVpcmUgJy4vbW9kZWxzL2NhcidcblNvbHZlciA9IHJlcXVpcmUgJy4vbW9kZWxzL3NvbHZlcidcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHBhdXNlZDogdHJ1ZVxuXHRcdFx0dHJhZmZpYzogbmV3IFRyYWZmaWNcblx0XHRcdHNvbHZlcjogbmV3IFNvbHZlclxuXHRcdFx0XG5cdFx0QHNjb3BlLnRyYWZmaWMgPSBAdHJhZmZpY1xuXG5cdFx0QHNjb3BlLlMgPSBTXG5cblx0XHRAc2NvcGUuJHdhdGNoICdTLm51bV9jYXJzJywgPT5cblx0XHRcdEB0cmFmZmljLm1ha2VfY2FycygpXG5cdFx0XHRAZGF0YV90aGVvcnkgPSBAc29sdmVyLmZpbmRfbWZkKClcblxuXHRcdEBzY29wZS4kd2F0Y2ggJ1MubnVtX3NpZ25hbHMnLCA9PlxuXHRcdFx0QHRyYWZmaWMubWFrZV9zaWduYWxzKClcblx0XHRcdEBkYXRhX3RoZW9yeSA9IEBzb2x2ZXIuZmluZF9tZmQoKVxuXG5cdFx0QHNjb3BlLiR3YXRjaCAnUy5vZmZzZXQgKyBTLmN5Y2xlICsgUy5yZWQnLD0+XG5cdFx0XHRAdHJhZmZpYy5yZXNldF9zaWduYWxzKClcblx0XHRcdEBkYXRhX3RoZW9yeSA9IEBzb2x2ZXIuZmluZF9tZmQoKVxuXG5cdFx0QHNjb3BlLiR3YXRjaCAnUy5xMCArIFMudycsPT5cblx0XHRcdEBkYXRhX3RoZW9yeSA9IEBzb2x2ZXIuZmluZF9tZmQoKVxuXHRcdFxuXHRyb3RhdG9yOiAoY2FyKS0+IFwicm90YXRlKCN7Uy5zY2FsZShjYXIubG9jKX0pIHRyYW5zbGF0ZSgwLDUwKVwiXG5cblx0Y2xpY2s6ICh2YWwpIC0+IGlmICF2YWwgdGhlbiBAcGxheSgpXG5cdHBhdXNlOiAtPiBAcGF1c2VkID0gdHJ1ZVxuXHR0aWNrOiAtPlxuXHRcdGQzLnRpbWVyID0+XG5cdFx0XHRcdEB0cmFmZmljLnRpY2soKVxuXHRcdFx0XHRAc2NvcGUuJGV2YWxBc3luYygpXG5cdFx0XHRcdEBwYXVzZWRcblx0cGxheTogLT5cblx0XHRAcGF1c2UoKVxuXHRcdEBwYXVzZWQgPSBmYWxzZVxuXHRcdEB0aWNrKClcblxudmlzRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IHt9XG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvdmlzLmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCBDdHJsXVxuXG4jIGNhckRlciA9IC0+XG4jIFx0ZGlyZWN0aXZlID0gXG4jIFx0XHRzY29wZTpcbiMgXHRcdFx0Y2FyczogJz0nXG4jIFx0XHRsaW5rOiAoc2NvcGUsZWwsYXR0ciktPlxuIyBcdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cbiMgXHRcdFx0XHQuc2VsZWN0ICcuY2FycydcblxuIyBcdFx0XHRzY29wZS4kb24gJ3RpY2snLC0+XG5cbiMgXHRcdFx0XHRzZWwuc2VsZWN0QWxsICcuZy1jYXInXG4jIFx0XHRcdFx0XHQuZGF0YSBzY29wZS5jYXJzLCAoZCktPiBkLmlkXG4jIFx0XHRcdFx0XHQuYXR0ciAndHJhbnNmb3JtJywgKGQpLT5cInJvdGF0ZSgje1Muc2NhbGUoZC5sb2MpfSkgdHJhbnNsYXRlKDAsNTApXCJcblxuIyBcdFx0XHR1cGRhdGUgPSAtPlxuIyBcdFx0XHRcdGNhcnMgPSBzZWwuc2VsZWN0QWxsICcuZy1jYXInXHRcdFxuIyBcdFx0XHRcdFx0LmRhdGEgc2NvcGUuY2FycywgKGQpLT4gZC5pZFxuXG4jIFx0XHRcdFx0bmV3X2NhcnMgPSBjYXJzLmVudGVyKClcbiMgXHRcdFx0XHRcdC5hcHBlbmQgJ2cnXG4jIFx0XHRcdFx0XHQuYXR0clxuIyBcdFx0XHRcdFx0XHRjbGFzczogJ2ctY2FyJ1xuXG4jIFx0XHRcdFx0Y2Fycy5leGl0KCkucmVtb3ZlKClcblx0XHRcdFx0XHRcbiMgXHRcdFx0XHRuZXdfY2Fycy5hcHBlbmQgJ3JlY3QnXG4jIFx0XHRcdFx0XHQuYXR0clxuIyBcdFx0XHRcdFx0XHR3aWR0aDogLjJcbiMgXHRcdFx0XHRcdFx0aGVpZ2h0OiAyXG4jIFx0XHRcdFx0XHRcdHk6IC0xXG4jIFx0XHRcdFx0XHRcdHg6IC0uMVxuIyBcdFx0XHRcdFx0XHRmaWxsOiAoZCktPmQuY29sb3JcblxuIyBcdFx0XHRzY29wZS4kd2F0Y2ggJ2NhcnMubGVuZ3RoJywgdXBkYXRlXG5cbmFuZ3VsYXIubW9kdWxlICdtYWluQXBwJyAsIFtyZXF1aXJlICdhbmd1bGFyLW1hdGVyaWFsJyAsIHJlcXVpcmUgJ2FuZ3VsYXItYW5pbWF0ZSddXG5cdC5kaXJlY3RpdmUgJ3Zpc0RlcicsIHZpc0RlclxuXHQuZGlyZWN0aXZlICdkYXR1bScsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9kYXR1bSdcblx0LmRpcmVjdGl2ZSAnZDNEZXInLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvZDNEZXInXG5cdC5kaXJlY3RpdmUgJ21mZENoYXJ0JywgcmVxdWlyZSAnLi9tZmQnXG5cdC5kaXJlY3RpdmUgJ2hvckF4aXMnLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMveEF4aXMnXG5cdC5kaXJlY3RpdmUgJ3ZlckF4aXMnLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMveUF4aXMnXG5cdC5kaXJlY3RpdmUgJ3NsaWRlckRlcicsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9zbGlkZXInXG5cdC5kaXJlY3RpdmUgJ3NoaWZ0ZXInLHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9zaGlmdGVyJ1xuIiwiZDMgPSByZXF1aXJlICdkMydcbmFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuXG5kZXIgPSAoJHBhcnNlKS0+ICNnb2VzIG9uIGEgc3ZnIGVsZW1lbnRcblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGQzRGVyOiAnPSdcblx0XHRcdHRyYW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0dSA9ICd0LScgKyBNYXRoLnJhbmRvbSgpXG5cdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSBmYWxzZVxuXHRcdFx0c2NvcGUuJHdhdGNoICdkM0Rlcidcblx0XHRcdFx0LCAodiktPlxuXHRcdFx0XHRcdGlmIHNjb3BlLnRyYW4gYW5kIGhhc1RyYW5zaXRpb25lZFxuXHRcdFx0XHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gdHJ1ZVxuXHRcdFx0XHRcdFx0c2VsLnRyYW5zaXRpb24gdVxuXHRcdFx0XHRcdFx0XHQuYXR0ciB2XG5cdFx0XHRcdFx0XHRcdC5jYWxsIHNjb3BlLnRyYW5cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSB0cnVlXG5cdFx0XHRcdFx0XHRzZWwuYXR0ciB2XG5cdFx0XHRcdCwgdHJ1ZVxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJtb2R1bGUuZXhwb3J0cyA9ICgkcGFyc2UpLT5cblx0KHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdGQzLnNlbGVjdChlbFswXSkuZGF0dW0gJHBhcnNlKGF0dHIuZGF0dW0pKHNjb3BlKSIsImQzID0gcmVxdWlyZSAnZDMnXG5cbmRlciA9ICgkcGFyc2UpLT5cblx0ZGlyZWN0aXZlID1cblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHR1ID0gJ3QtJyArIE1hdGgucmFuZG9tKClcblx0XHRcdHRyYW4gPSAkcGFyc2UoYXR0ci50cmFuKShzY29wZSlcblx0XHRcdHJlc2hpZnQgPSAodiktPiBcblx0XHRcdFx0aWYgdHJhblxuXHRcdFx0XHRcdHNlbC50cmFuc2l0aW9uIHVcblx0XHRcdFx0XHRcdC5hdHRyICd0cmFuc2Zvcm0nICwgXCJ0cmFuc2xhdGUoI3t2WzBdfSwje3ZbMV19KVwiXG5cdFx0XHRcdFx0XHQuY2FsbCB0cmFuXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRzZWwuYXR0ciAndHJhbnNmb3JtJyAsIFwidHJhbnNsYXRlKCN7dlswXX0sI3t2WzFdfSlcIlxuXG5cdFx0XHRzY29wZS4kd2F0Y2ggLT5cblx0XHRcdFx0XHQkcGFyc2UoYXR0ci5zaGlmdGVyKShzY29wZSlcblx0XHRcdFx0LCByZXNoaWZ0XG5cdFx0XHRcdCwgdHJ1ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImRlciA9IC0+XG5cdHJlcyA9IFxuXHRcdHNjb3BlOiBcblx0XHRcdGxhYmVsOiAnQCdcblx0XHRcdG15RGF0YTogJz0nXG5cdFx0XHRtaW46ICc9J1xuXHRcdFx0bWF4OiAnPSdcblx0XHRcdHN0ZXA6ICc9J1xuXHRcdCMgY29udHJvbGxlckFzOiAndm0nXG5cdFx0cmVwbGFjZTogdHJ1ZVxuXHRcdCMgY29udHJvbGxlcjogLT5cblx0XHQjIGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC9zbGlkZXIuaHRtbCdcblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZnVuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzY2FsZSA9IHNjb3BlLmZ1bi5zY2FsZSgpXG5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuY2xhc3NlZCAnaG9yIGF4aXMnLCB0cnVlXG5cblx0XHRcdHNlbC5jYWxsIHNjb3BlLmZ1blxuXHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5cbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRzY29wZTogXG5cdFx0XHRmdW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNjYWxlID0gc2NvcGUuZnVuLnNjYWxlKClcblxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5jbGFzc2VkICd2ZXIgYXhpcycsIHRydWVcblxuXHRcdFx0c2VsLmNhbGwgc2NvcGUuZnVuXG5cdFx0XHRcbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiJ3VzZSBzdHJpY3QnXG5cbkZ1bmN0aW9uOjpwcm9wZXJ0eSA9IChwcm9wLCBkZXNjKSAtPlxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgcHJvcCwgZGVzYyIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxlbCktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHR3aWR0aDogMzAwXG5cdFx0XHRoZWlnaHQ6IDMwMFxuXHRcdFx0bTogXG5cdFx0XHRcdHQ6IDEwXG5cdFx0XHRcdGw6IDQwXG5cdFx0XHRcdHI6IDE4XG5cdFx0XHRcdGI6IDM1XG5cblx0XHRAaG9yID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdFx0LmRvbWFpbiBbMCwxXVxuXHRcdFx0XHQucmFuZ2UgWzAsQHdpZHRoXVxuXG5cdFx0QHZlciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLCAxLzNdXG5cdFx0XHQucmFuZ2UgW0BoZWlnaHQsIDBdXG5cblx0XHRAbGluZSA9IGQzLnN2Zy5saW5lKClcblx0XHRcdC54IChkKT0+QGhvciBkLmtcblx0XHRcdC55IChkKT0+QHZlciBkLnFcblx0XHRcdC5kZWZpbmVkIChkKS0+ZC5xPjBcblxuXHRcdEBob3JBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEBob3Jcblx0XHRcdC5vcmllbnQgJ2JvdHRvbSdcblx0XHRcdC50aWNrcyA4XG5cblx0XHRAdmVyQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAdmVyXG5cdFx0XHQub3JpZW50ICdsZWZ0J1xuXG5cdGQ6IC0+XG5cdFx0QGxpbmUgQGRhdGFcblx0XG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZGF0YTogJz0nXG5cdFx0XHRtZW1vcnk6ICc9J1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L21mZENoYXJ0Lmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsIlMgPSByZXF1aXJlICcuLi9zZXR0aW5ncydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5cbm4gPSAwXG5cbmNsYXNzIENhclxuXHRjb25zdHJ1Y3RvcjotPlxuXHRcdEBpZCA9IG4rK1xuXHRcdEBjb2xvciA9IF8uc2FtcGxlIFMuY29sb3JzLnJhbmdlKClcblxuXHRzZXRfbG9jOiAoQGxvYyktPlxuXG5tb2R1bGUuZXhwb3J0cyA9IENhciIsIlMgPSByZXF1aXJlICcuLi9zZXR0aW5ncydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5cbmNsYXNzIENlbGxcblx0Y29uc3RydWN0b3I6IChAbG9jKS0+XG5cdFx0QGJlZW5fZnJlZSA9IEluZmluaXR5XG5cdFx0QHRlbXBfY2FyID0gQGNhciA9IGZhbHNlXG5cdFx0QGlkID0gXy51bmlxdWVJZCAnY2VsbCdcblx0XHRAc2lnbmFsID0gdW5kZWZpbmVkXG5cblx0c2V0X3NpZ25hbDogKEBzaWduYWwpLT5cblx0XHRAc2lnbmFsLmxvYyA9IEBsb2Ncblx0XHRAc2lnbmFsLmNlbGwgPSB0aGlzXG5cblx0Y2xlYXJfc2lnbmFsOiAtPlxuXHRcdEBzaWduYWwgPSB1bmRlZmluZWRcblxuXHRyZWNlaXZlOihjYXIpLT5cblx0XHRjYXIuc2V0X2xvYyBAbG9jXG5cdFx0QHRlbXBfY2FyID0gY2FyXG5cdFx0QGJlZW5fZnJlZSA9IDBcblx0XHRjYXIuY2VsbCA9IHRoaXNcblxuXHRyZXNldDogLT5cblx0XHRAYmVlbl9mcmVlID0gSW5maW5pdHlcblx0XHRAdGVtcF9jYXIgPSBAY2FyID0gZmFsc2VcblxuXHRyZW1vdmU6IC0+XG5cdFx0QGJlZW5fZnJlZSA9IDFcblx0XHRAdGVtcF9jYXIgPSBAY2FyID0gZmFsc2VcblxuXHRmaW5hbGl6ZTogLT5cblx0XHRAY2FyID0gQHRlbXBfY2FyXG5cdFx0aWYgISFAY2FyXG5cdFx0XHRAYmVlbl9mcmVlPTBcblx0XHRlbHNlXG5cdFx0XHRAYmVlbl9mcmVlKytcblxuXHRpc19mcmVlOiAtPlxuXHRcdGlmIEBzaWduYWxcblx0XHRcdHJldHVybiAoQHNpZ25hbC5ncmVlbiBhbmQgKEBiZWVuX2ZyZWU+KDEvUy53KSkpXG5cdFx0ZWxzZVxuXHRcdFx0QGJlZW5fZnJlZT4oMS9TLncpXG5cbm1vZHVsZS5leHBvcnRzID0gQ2VsbCIsIlMgPSByZXF1aXJlICcuLi9zZXR0aW5ncydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5cbmNsYXNzIFNpZ25hbFxuXHRjb25zdHJ1Y3RvcjogKEBpKSAtPlxuXHRcdEBjb3VudCA9IDBcblx0XHRAZ3JlZW4gPSB0cnVlXG5cdFx0QGlkID0gXy51bmlxdWVJZCAnc2lnbmFsLSdcblx0XHRAcmVzZXQoKVxuXG5cdHJlc2V0OiAtPlxuXHRcdEBvZmZzZXQgPSBTLmN5Y2xlKigoQGkqUy5vZmZzZXQpJTEpXG5cdFx0W0Bjb3VudCwgQGdyZWVuXSA9IFtAb2Zmc2V0LCB0cnVlXVxuXG5cdHRpY2s6IC0+XG5cdFx0QGNvdW50Kytcblx0XHRpZiBAY291bnQgPiBTLmN5Y2xlXG5cdFx0XHRbQGNvdW50LCBAZ3JlZW5dID0gWzAsIHRydWVdXG5cdFx0aWYgKEBjb3VudCk+PSgoMS1TLnJlZCkqUy5jeWNsZSlcblx0XHRcdEBncmVlbiA9IGZhbHNlXG5cbm1vZHVsZS5leHBvcnRzID0gU2lnbmFsIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5cbmNsYXNzIExpZ2h0XG5cdGNvbnN0cnVjdG9yOihAbCktPlxuXHRcdEB4ID0gUy5kICogQGxcblxuXHRpbnRlcnNlY3Q6KHQpLT5cblx0XHRvZmZzZXQgPSBTLmRlbHRhKkBsXG5cdFx0bGVmdG92ZXIgPSAodCtvZmZzZXQpJVMuY3ljbGVcblx0XHRpZiBsZWZ0b3ZlcjwoUy5yZWQqUy5jeWNsZSlcblx0XHRcdDBcblx0XHRlbHNlXG5cdFx0XHRTLmN5Y2xlLWxlZnRvdmVyXG5cbmNsYXNzIFNvbHZlclxuXHRjb25zdHJ1Y3RvcjogLT5cblxuXHRtYWtlX3RhYmxlOi0+XG5cdFx0cmVkX3RpbWUgPSBTLnJlZF90aW1lXG5cdFx0a2ogPSBTLmtqXG5cdFx0cmVzID0gW11cblx0XHRbdGltZV9zdG9wcGVkLGxdID0gWzEwMDAsLTFdXG5cdFx0d2hpbGUgdGltZV9zdG9wcGVkPjAgYW5kICsrbDw1MFxuXHRcdFx0bGlnaHQgPSBuZXcgTGlnaHQgbFxuXHRcdFx0dGltZV90cmF2ZWxpbmcgPSBsaWdodC54L1MudmZcblx0XHRcdHRpbWVfYXJyaXZhbCA9IHJlZF90aW1lICsgdGltZV90cmF2ZWxpbmdcblx0XHRcdHRpbWVfc3RvcHBlZCA9IGxpZ2h0LmludGVyc2VjdCB0aW1lX2Fycml2YWxcblx0XHRcdHJlcy5wdXNoIFxuXHRcdFx0XHR4OiBsaWdodC54XG5cdFx0XHRcdHQ6IHRpbWVfYXJyaXZhbCt0aW1lX3N0b3BwZWRcblx0XHRcdFx0ZzogdGltZV9zdG9wcGVkXG5cdFx0XHRcdGw6IGxpZ2h0Lmxcblx0XHRcdFx0YzogUy5xMCp0aW1lX3N0b3BwZWRcblxuXHRcdFt0aW1lX3N0b3BwZWQsbF0gPSBbMTAwMCwwXVxuXHRcdHdoaWxlIHRpbWVfc3RvcHBlZD4wIGFuZCAtLWw+LTUwXG5cdFx0XHRsaWdodCA9IG5ldyBMaWdodCBsXG5cdFx0XHR0aW1lX3RyYXZlbGluZz0gLWxpZ2h0LngvUy53XG5cdFx0XHR0aW1lX2Fycml2YWwgPSByZWRfdGltZSArIHRpbWVfdHJhdmVsaW5nXG5cdFx0XHR0aW1lX3N0b3BwZWQgPSBsaWdodC5pbnRlcnNlY3QgdGltZV9hcnJpdmFsXG5cdFx0XHRyZXMucHVzaFxuXHRcdFx0XHR4OiBsaWdodC54XG5cdFx0XHRcdHQ6IHRpbWVfYXJyaXZhbCArIHRpbWVfc3RvcHBlZFxuXHRcdFx0XHRnOiB0aW1lX3N0b3BwZWRcblx0XHRcdFx0bDogbFxuXHRcdFx0XHRjOiAtbGlnaHQueCpraiArIFMucTAqdGltZV9zdG9wcGVkXG5cdFx0cmVzXG5cblx0ZmluZF9taW46IChrLHRhYmxlKS0+XG5cdFx0ZmxvdyA9IEluZmluaXR5XG5cdFx0cmVzID0ge31cblx0XHRmb3IgZSBpbiB0YWJsZVxuXHRcdFx0Zmxvd19sID0gKGUuYyArIGsqZS54KS8oZS50KVxuXHRcdFx0aWYgZmxvd19sPD1mbG93XG5cdFx0XHRcdGZsb3cgPSBmbG93X2xcblx0XHRcdFx0cmVzID0gXy5jbG9uZSBlXG5cdFx0cmVzLmsgPSBrXG5cdFx0cmVzLnEgPSBmbG93XG5cdFx0cmV0dXJuIHJlc1xuXG5cdGZpbmRfbWZkOi0+XG5cdFx0dGFibGUgPSBAbWFrZV90YWJsZSgpXG5cdFx0cmVzID0gKEBmaW5kX21pbiBrLHRhYmxlIGZvciBrIGluIF8ucmFuZ2UgMCw1LC4wMSlcblxubW9kdWxlLmV4cG9ydHMgPSBTb2x2ZXIiLCJTID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuQ2FyID0gcmVxdWlyZSAnLi9jYXInXG5TaWduYWwgPSByZXF1aXJlICcuL3NpZ25hbCdcbkNlbGwgPSByZXF1aXJlICcuL2NlbGwnXG5cblxuY2xhc3MgTWVtb3J5XG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBsb25nX3Rlcm0gPSBbXVxuXHRcdEByZXNldCgpXG5cdHJlc2V0Oi0+XG5cdFx0W0BxLEBrLEBpXSA9IFswLDAsMF1cblxuXHRzcGFuOiAzMFxuXG5cdHJlbWVtYmVyOihxLGspLT5cblx0XHRAaSsrXG5cdFx0QHErPXFcblx0XHRAays9a1xuXHRcdGlmIEBpPj1Ac3BhblxuXHRcdFx0QGxvbmdfdGVybS5wdXNoIFxuXHRcdFx0XHRxOiBAcS8oQHNwYW4qUy5udW1fY2VsbHMpXG5cdFx0XHRcdGs6IEBrLyhAc3BhbipTLm51bV9jZWxscylcblx0XHRcdFx0aWQ6IF8udW5pcXVlSWQgJ21lbW9yeS0nXG5cdFx0XHRAcmVzZXQoKVxuXHRcdFx0aWYgQGxvbmdfdGVybS5sZW5ndGg+MTAgdGhlbiBAbG9uZ190ZXJtLnNoaWZ0KClcblxuY2xhc3MgVHJhZmZpY1xuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAY2VsbHMgPSAobmV3IENlbGwgbiBmb3IgbiBpbiBbMC4uLlMubnVtX2NlbGxzXSlcblx0XHRmb3IgY2VsbCxpIGluIEBjZWxsc1xuXHRcdFx0Y2VsbC5uZXh0ID0gQGNlbGxzWyhpKzEpJUBjZWxscy5sZW5ndGhdXG5cdFx0QGNhcnMgPSBbXVxuXHRcdEBzaWduYWxzID0gW11cblx0XHRAbWFrZV9zaWduYWxzKClcblx0XHRAbWFrZV9jYXJzKClcblx0XHRAbWVtb3J5ID0gbmV3IE1lbW9yeSgpXG5cblx0Y2hvb3NlX2NlbGw6IChjZWxsKS0+XG5cdFx0aWYgIWNlbGwuY2FyIHRoZW4gY2VsbCBlbHNlIEBjaG9vc2VfY2VsbChjZWxsLm5leHQpXG5cblx0bWFrZV9jYXJzOiAtPlxuXHRcdHtudW1fY2FycyxudW1fY2VsbHN9ID0gU1xuXHRcdGNlbGwucmVzZXQoKSBmb3IgY2VsbCBpbiBAY2VsbHNcblx0XHRkaWZmID0gbnVtX2NhcnMgLSBAY2Fycy5sZW5ndGhcblx0XHRpZiBkaWZmPDBcblx0XHRcdEBjYXJzID0gXy5kcm9wIEBjYXJzLCAtZGlmZlxuXHRcdGVsc2Vcblx0XHRcdGZvciBpIGluIFswLi4uZGlmZl1cblx0XHRcdFx0QGNhcnMucHVzaCBuZXcgQ2FyKClcblxuXHRcdGZvciBjYXIsaSBpbiBAY2Fyc1xuXHRcdFx0Y2VsbCA9IEBjaG9vc2VfY2VsbCBAY2VsbHNbTWF0aC5mbG9vcihpL251bV9jYXJzKm51bV9jZWxscyldXG5cdFx0XHRjZWxsLnJlY2VpdmUgY2FyXG5cblx0bWFrZV9zaWduYWxzOi0+XG5cdFx0e251bV9zaWduYWxzLG51bV9jZWxsc30gPSBTXG5cdFx0Y2VsbC5jbGVhcl9zaWduYWwoKSBmb3IgY2VsbCBpbiBAY2VsbHNcblx0XHRsID0gQHNpZ25hbHMubGVuZ3RoXG5cdFx0ZGlmZiA9IG51bV9zaWduYWxzIC0gbFxuXHRcdGlmIGRpZmY8MFxuXHRcdFx0QHNpZ25hbHMgPSBfLmRyb3AgQHNpZ25hbHMsIC1kaWZmXG5cdFx0ZWxzZVxuXHRcdFx0Zm9yIGkgaW4gWzAuLi5kaWZmXVxuXHRcdFx0XHRAc2lnbmFscy5wdXNoIG5ldyBTaWduYWwgbCtpXG5cblx0XHRmb3Igc2lnbmFsLGkgaW4gQHNpZ25hbHNcblx0XHRcdHNpZ25hbC5yZXNldCgpXG5cdFx0XHR3aGljaCA9IE1hdGguZmxvb3IoaS9udW1fc2lnbmFscypudW1fY2VsbHMpXG5cdFx0XHRAY2VsbHNbd2hpY2hdLnNldF9zaWduYWwgc2lnbmFsXG5cblx0cmVzZXRfc2lnbmFsczotPlxuXHRcdHNpZ25hbC5yZXNldCgpIGZvciBzaWduYWwgaW4gQHNpZ25hbHNcblxuXHR0aWNrOi0+XG5cdFx0QyA9IEBjZWxsc1xuXHRcdHE9MFxuXG5cdFx0c2lnbmFsLnRpY2soKSBmb3Igc2lnbmFsIGluIEBzaWduYWxzXG5cblx0XHRmb3IgY2VsbCBpbiBDXG5cdFx0XHRpZiBjZWxsLmNhclxuXHRcdFx0XHRpZiBjZWxsLm5leHQuaXNfZnJlZSgpXG5cdFx0XHRcdFx0Y2VsbC5uZXh0LnJlY2VpdmUgY2VsbC5jYXJcblx0XHRcdFx0XHRjZWxsLnJlbW92ZSgpXG5cdFx0XHRcdFx0cSsrXG5cblx0XHRjZWxsLmZpbmFsaXplKCkgZm9yIGNlbGwgaW4gQGNlbGxzXG5cdFx0QG1lbW9yeS5yZW1lbWJlciBxLEBjYXJzLmxlbmd0aFxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYWZmaWNcbiIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xucmVxdWlyZSAnLi9oZWxwZXJzJ1xuXG5jbGFzcyBTZXR0aW5nc1xuXHRjb25zdHJ1Y3RvcjotPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRudW1fY2VsbHM6IDEwMDBcblx0XHRcdF9udW1fY2FyczogMzAwXG5cdFx0XHRfazogMzAwLzEwMDBcblx0XHRcdF9udW1fc2lnbmFsczogNTBcblx0XHRcdF9vZmZzZXQ6IC4zXG5cdFx0XHRfZDogMTAwMC81MFxuXHRcdFx0a2o6IDFcblx0XHRcdF9rMDogMS8zXG5cdFx0XHR0aW1lOiAwXG5cdFx0XHRyZWQ6IC4wMlxuXHRcdFx0Y3ljbGU6IDUwXG5cdFx0XHR2ZjogMVxuXG5cdFx0QGswID0gMS8zXG5cblx0XHRAY29sb3JzID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gXy5yYW5nZSAwLEBudW1fY2VsbHMsQG51bV9jZWxscy82XG5cdFx0XHQucmFuZ2UgW1xuXHRcdFx0XHQnI0Y0NDMzNicsICNyZWRcblx0XHRcdFx0JyMyMTk2RjMnLCAjYmx1ZVxuXHRcdFx0XHQnI0U5MUU2MycsICNwaW5rXG5cdFx0XHRcdCcjMDBCQ0Q0JywgI2N5YW5cblx0XHRcdFx0JyNGRkMxMDcnLCAjYW1iZXJcblx0XHRcdFx0JyM0Q0FGNTAnLCAjZ3JlZW5cblx0XHRcdFx0XVxuXG5cdFx0QHNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsQG51bV9jZWxsc11cblx0XHRcdC5yYW5nZSBbMCwzNjBdXG5cblx0QHByb3BlcnR5ICdxMCcsXG5cdFx0Z2V0Oi0+XG5cdFx0XHRAX2swXG5cblx0QHByb3BlcnR5ICdrMCcsXG5cdFx0Z2V0Oi0+XG5cdFx0XHRAX2swXG5cdFx0c2V0OiAoazApLT5cblx0XHRcdEBfazAgPSAxL01hdGgucm91bmQoMS9rMClcblx0XHRcdEB3ID0gQF9rMC8oQGtqIC0gQF9rMClcblxuXHRAcHJvcGVydHkgJ251bV9jYXJzJywgXG5cdFx0Z2V0Oi0+XG5cdFx0XHRAX251bV9jYXJzXG5cdFx0c2V0OihudW1fY2FycyktPlxuXHRcdFx0QF9udW1fY2FycyA9IE1hdGgucm91bmQgbnVtX2NhcnNcblx0XHRcdEBfayA9IEBfbnVtX2NhcnMvQG51bV9jZWxsc1xuXG5cdEBwcm9wZXJ0eSAnaycsXG5cdFx0Z2V0Oi0+XG5cdFx0XHRAX2tcblx0XHRzZXQ6KGspLT5cblx0XHRcdEBfbnVtX2NhcnMgPSBNYXRoLnJvdW5kIGsqQG51bV9jZWxsc1xuXHRcdFx0QF9rID0gQF9udW1fY2Fycy9AbnVtX2NlbGxzXG5cblx0QHByb3BlcnR5ICdkZWx0YScsXG5cdFx0Z2V0OiAtPlxuXHRcdFx0QF9vZmZzZXQqQGN5Y2xlXG5cblx0QHByb3BlcnR5ICdyZWRfdGltZScsXG5cdFx0Z2V0Oi0+XG5cdFx0XHRAY3ljbGUgKiBAcmVkXG5cblx0QHByb3BlcnR5ICdkJywgXG5cdFx0Z2V0Oi0+XG5cdFx0XHRAX2Rcblx0XHRzZXQ6KGQpLT5cblx0XHRcdEBfbnVtX3NpZ25hbHMgPSBNYXRoLnJvdW5kIEBudW1fY2VsbHMvZFxuXHRcdFx0QF9kID0gQG51bV9jZWxscy9AX251bV9zaWduYWxzXG5cdFx0XHRAX29mZnNldCA9IE1hdGgucm91bmQoQF9vZmZzZXQgKiBAX251bV9zaWduYWxzKS9AX251bV9zaWduYWxzXG5cblx0QHByb3BlcnR5ICdudW1fc2lnbmFscycsXG5cdFx0Z2V0Oi0+XG5cdFx0XHRAX251bV9zaWduYWxzXG5cdFx0c2V0OiAobnVtX3NpZ25hbHMpLT5cblx0XHRcdEBfbnVtX3NpZ25hbHMgPSBudW1fc2lnbmFsc1xuXHRcdFx0QF9kID0gTWF0aC5yb3VuZCBAbnVtX2NlbGxzL0BfbnVtX3NpZ25hbHNcblx0XHRcdEBfb2Zmc2V0ID0gTWF0aC5yb3VuZChAX29mZnNldCAqIEBfbnVtX3NpZ25hbHMpL0BfbnVtX3NpZ25hbHNcblxuXHRAcHJvcGVydHkgJ29mZnNldCcsXG5cdFx0Z2V0Oi0+XG5cdFx0XHRAX29mZnNldFxuXHRcdHNldDoob2Zmc2V0KS0+XG5cdFx0XHRAX29mZnNldCA9IE1hdGgucm91bmQob2Zmc2V0ICogQF9udW1fc2lnbmFscykvQF9udW1fc2lnbmFsc1xuXG5cdGFkdmFuY2U6IC0+XG5cdFx0QHRpbWUrK1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTZXR0aW5ncygpIl19
