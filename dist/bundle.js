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
        return _this.traffic.make_cars();
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
        var i, j;
        for (i = j = 0; j <= 6; i = ++j) {
          S.time++;
          _this.traffic.tick();
        }
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
    this.ver = d3.scale.linear().domain([0, .5]).range([this.height, 0]);
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
    return this.temp_car = car;
  };

  Cell.prototype.reset = function() {
    this.been_free = Infinity;
    return this.temp_car = this.car = false;
  };

  Cell.prototype.remove = function() {
    return this.temp_car = this.car = false;
  };

  Cell.prototype.finalize = function() {
    this.car = this.temp_car;
    if (this.car) {
      return this.been_free = 0;
    } else {
      return this.been_free++;
    }
  };

  Cell.prototype.is_free = function() {
    if (this.signal) {
      return this.signal.green && (this.been_free > (1 / S.w - 1));
    } else {
      return this.been_free > (1 / S.w - 1);
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
  }

  Signal.prototype.tick = function() {
    var e;
    e = (S.time - this.i * S.delta) % S.cycle;
    if (e >= S.green) {
      return this.green = false;
    } else {
      return this.green = true;
    }
  };

  return Signal;

})();

module.exports = Signal;



},{"../settings":15,"lodash":undefined}],13:[function(require,module,exports){
var S, Solver, _, abs, d3, max, min, solve,
  modulo = function(a, b) { return (+a % (b = +b) + b) % b; };

d3 = require('d3');

_ = require('lodash');

S = require('../settings');

max = Math.max, min = Math.min, abs = Math.abs;

solve = function(l) {
  var c, e, g, r, res, ta, x;
  x = l * S.d;
  if (l < 0) {
    ta = abs(x) / S.w;
  } else {
    ta = x / S.vf;
  }
  e = modulo(ta - l * S.delta, S.cycle);
  g = max(S.green - e, 0);
  r = min(S.cycle - e, S.red);
  c = S.q0 * g + (l < 0 ? S.kj * abs(x) : 0);
  return res = {
    x: x,
    c: c,
    r: r,
    c: c,
    g: g,
    l: l,
    e: e,
    ta: ta,
    t: ta + S.cycle - e
  };
};

Solver = (function() {
  function Solver() {}

  Solver.prototype.make_table = function() {
    var g_backward, g_forward, kj, l_backward, l_forward, red_time, ref, ref1, res, table;
    red_time = S.red_time;
    kj = S.kj;
    table = [];
    ref = [1000, 0], g_forward = ref[0], l_forward = ref[1];
    while (g_forward > 0 && l_forward < 100) {
      res = solve(l_forward);
      table.push(res);
      g_forward = res.g;
      l_forward++;
    }
    ref1 = [1000, -1], g_backward = ref1[0], l_backward = ref1[1];
    while (g_backward > 0 && l_backward > -100) {
      res = solve(l_backward);
      table.push(res);
      g_backward = res.g;
      l_backward--;
    }
    return table;
  };

  Solver.prototype.find_min = function(k, table) {
    var e, i, len, lowest, q, ql, res;
    q = Infinity;
    for (i = 0, len = table.length; i < len; i++) {
      e = table[i];
      ql = (e.c + k * e.x) / e.t;
      if (ql < q) {
        q = ql;
        lowest = e;
      }
    }
    if (q >= (S.vf * k)) {
      q = S.vf * k;
      lowest = {
        q: q
      };
    }
    if (q >= (S.kj - k) * S.w) {
      q = (S.kj - k) * S.w;
      lowest = {
        q: q
      };
    }
    res = _.clone(lowest);
    res.k = k;
    res.q = q;
    return res;
  };

  Solver.prototype.find_mfd = function() {
    var k, res, table;
    table = this.make_table();
    return res = (function() {
      var i, len, ref, results;
      ref = _.range(0, 1.05, .01);
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
    var span;
    this.i++;
    this.q += q;
    this.k += k;
    span = S.cycle;
    if (this.i >= span) {
      this.long_term.push({
        q: this.q / (span * S.num_cells),
        k: this.k / (span * S.num_cells),
        id: _.uniqueId('memory-')
      });
      this.reset();
      if (this.long_term.length > 3) {
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
    var car, cell, diff, free_cells, i, j, len, len1, m, num_cars, num_cells, o, ref, ref1, ref2, results;
    num_cars = S.num_cars, num_cells = S.num_cells;
    ref = this.cells;
    for (j = 0, len = ref.length; j < len; j++) {
      cell = ref[j];
      cell.reset();
    }
    diff = num_cars - this.cars.length;
    if (diff < 0) {
      this.cars = _.drop(_.shuffle(this.cars), -diff);
    } else {
      for (i = m = 0, ref1 = diff; 0 <= ref1 ? m < ref1 : m > ref1; i = 0 <= ref1 ? ++m : --m) {
        this.cars.push(new Car());
      }
    }
    free_cells = _.shuffle(_.clone(_.filter(this.cells, function(c) {
      return c.is_free();
    })));
    ref2 = this.cars;
    results = [];
    for (i = o = 0, len1 = ref2.length; o < len1; i = ++o) {
      car = ref2[i];
      cell = free_cells.pop();
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
      which = Math.floor(i / num_signals * num_cells);
      results.push(this.cells[which].set_signal(signal));
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
      _num_cars: 550,
      _k: 550 / 1000,
      _num_signals: 1000 / 20,
      _offset: .2,
      _d: 20,
      kj: 1,
      _k0: 1 / 3,
      time: 0,
      red: 50,
      cycle: 100,
      vf: 1
    });
    this.k0 = 1 / 3;
    this.colors = d3.scale.linear().domain(_.range(0, this.num_cells, this.num_cells / 6)).range(['#F44336', '#2196F3', '#E91E63', '#00BCD4', '#FFC107', '#4CAF50']);
    this.scale = d3.scale.linear().domain([0, this.num_cells]).range([0, 360]);
  }

  Settings.property('green', {
    get: function() {
      return this.cycle - this.red;
    }
  });

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
      return this.red;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL2FwcC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL2RpcmVjdGl2ZXMvZDNEZXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9kaXJlY3RpdmVzL2RhdHVtLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvZGlyZWN0aXZlcy9zaGlmdGVyLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvZGlyZWN0aXZlcy9zbGlkZXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9kaXJlY3RpdmVzL3hBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvZGlyZWN0aXZlcy95QXhpcy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL2hlbHBlcnMuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9tZmQuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9tb2RlbHMvY2FyLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvbW9kZWxzL2NlbGwuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9tb2RlbHMvc2lnbmFsLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvbW9kZWxzL3NvbHZlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL21vZGVscy90cmFmZmljLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvc2V0dGluZ3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQTs7QUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1YsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztBQUNMLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7QUFDSixDQUFBLEdBQUksT0FBQSxDQUFRLFlBQVI7O0FBQ0osT0FBQSxHQUFVLE9BQUEsQ0FBUSxrQkFBUjs7QUFDVixHQUFBLEdBQU0sT0FBQSxDQUFRLGNBQVI7O0FBQ04sTUFBQSxHQUFTLE9BQUEsQ0FBUSxpQkFBUjs7QUFFSDtFQUNPLGNBQUMsS0FBRDtJQUFDLElBQUMsQ0FBQSxRQUFEO0lBQ1osQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQ0M7TUFBQSxNQUFBLEVBQVEsSUFBUjtNQUNBLE9BQUEsRUFBUyxJQUFJLE9BRGI7TUFFQSxNQUFBLEVBQVEsSUFBSSxNQUZaO0tBREQ7SUFLQSxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsR0FBaUIsSUFBQyxDQUFBO0lBRWxCLElBQUMsQ0FBQSxLQUFLLENBQUMsQ0FBUCxHQUFXO0lBRVgsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsWUFBZCxFQUE0QixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7ZUFFM0IsS0FBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULENBQUE7TUFGMkI7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVCO0lBSUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsZUFBZCxFQUErQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7UUFFOUIsS0FBQyxDQUFBLE9BQU8sQ0FBQyxZQUFULENBQUE7ZUFFQSxLQUFDLENBQUEsV0FBRCxHQUFlLEtBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFBO01BSmU7SUFBQSxDQUFB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QUE7SUFIN0MsQ0FGTDtHQUREOztFQVFBLFFBQUMsQ0FBQSxRQUFELENBQVUsUUFBVixFQUNDO0lBQUEsR0FBQSxFQUFJLFNBQUE7YUFDSCxJQUFDLENBQUE7SUFERSxDQUFKO0lBRUEsR0FBQSxFQUFJLFNBQUMsTUFBRDthQUNILElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFBLEdBQVMsSUFBQyxDQUFBLFlBQXJCLENBQUEsR0FBbUMsSUFBQyxDQUFBO0lBRDVDLENBRko7R0FERDs7cUJBTUEsT0FBQSxHQUFTLFNBQUE7V0FDUixJQUFDLENBQUEsSUFBRDtFQURROzs7Ozs7QUFHVixNQUFNLENBQUMsT0FBUCxHQUFxQixJQUFBLFFBQUEsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJhbmd1bGFyID0gcmVxdWlyZSAnYW5ndWxhcidcbmQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5UcmFmZmljID0gcmVxdWlyZSAnLi9tb2RlbHMvdHJhZmZpYydcbkNhciA9IHJlcXVpcmUgJy4vbW9kZWxzL2NhcidcblNvbHZlciA9IHJlcXVpcmUgJy4vbW9kZWxzL3NvbHZlcidcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHBhdXNlZDogdHJ1ZVxuXHRcdFx0dHJhZmZpYzogbmV3IFRyYWZmaWNcblx0XHRcdHNvbHZlcjogbmV3IFNvbHZlclxuXHRcdFx0XG5cdFx0QHNjb3BlLnRyYWZmaWMgPSBAdHJhZmZpY1xuXG5cdFx0QHNjb3BlLlMgPSBTXG5cblx0XHRAc2NvcGUuJHdhdGNoICdTLm51bV9jYXJzJywgPT5cblx0XHRcdCMgUy50aW1lID0gMFxuXHRcdFx0QHRyYWZmaWMubWFrZV9jYXJzKClcblxuXHRcdEBzY29wZS4kd2F0Y2ggJ1MubnVtX3NpZ25hbHMnLCA9PlxuXHRcdFx0IyBTLnRpbWUgPSAwXG5cdFx0XHRAdHJhZmZpYy5tYWtlX3NpZ25hbHMoKVxuXHRcdFx0IyBAdHJhZmZpYy5tYWtlX2NhcnMoKVxuXHRcdFx0QGRhdGFfdGhlb3J5ID0gQHNvbHZlci5maW5kX21mZCgpXG5cblx0XHRAc2NvcGUuJHdhdGNoICdTLm9mZnNldCArIFMuY3ljbGUgKyBTLnJlZCcsPT5cblx0XHRcdCMgQHRyYWZmaWMubWFrZV9jYXJzKClcblx0XHRcdCMgUy50aW1lID0gMFxuXHRcdFx0QGRhdGFfdGhlb3J5ID0gQHNvbHZlci5maW5kX21mZCgpXG5cblx0XHRAc2NvcGUuJHdhdGNoICdTLnEwICsgUy53Jyw9PlxuXHRcdFx0IyBTLnRpbWUgPSAwXG5cdFx0XHQjIEB0cmFmZmljLm1ha2VfY2FycygpXG5cdFx0XHRAZGF0YV90aGVvcnkgPSBAc29sdmVyLmZpbmRfbWZkKClcblx0XHRcblx0cm90YXRvcjogKGNhciktPiBcInJvdGF0ZSgje1Muc2NhbGUoY2FyLmxvYyl9KSB0cmFuc2xhdGUoMCw1MClcIlxuXG5cdGNsaWNrOiAodmFsKSAtPiBpZiAhdmFsIHRoZW4gQHBsYXkoKVxuXHRwYXVzZTogLT4gQHBhdXNlZCA9IHRydWVcblx0dGljazogLT5cblx0XHRkMy50aW1lciA9PlxuXHRcdFx0XHRmb3IgaSBpbiBbMC4uNl1cblx0XHRcdFx0XHRTLnRpbWUrK1xuXHRcdFx0XHRcdEB0cmFmZmljLnRpY2soKVxuXHRcdFx0XHRAc2NvcGUuJGV2YWxBc3luYygpXG5cdFx0XHRcdEBwYXVzZWRcblx0cGxheTogLT5cblx0XHRAcGF1c2UoKVxuXHRcdEBwYXVzZWQgPSBmYWxzZVxuXHRcdEB0aWNrKClcblxudmlzRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IHt9XG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvdmlzLmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCBDdHJsXVxuXG5hbmd1bGFyLm1vZHVsZSAnbWFpbkFwcCcgLCBbcmVxdWlyZSAnYW5ndWxhci1tYXRlcmlhbCcgLCByZXF1aXJlICdhbmd1bGFyLWFuaW1hdGUnXVxuXHQuZGlyZWN0aXZlICd2aXNEZXInLCB2aXNEZXJcblx0LmRpcmVjdGl2ZSAnZGF0dW0nLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvZGF0dW0nXG5cdC5kaXJlY3RpdmUgJ2QzRGVyJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL2QzRGVyJ1xuXHQuZGlyZWN0aXZlICdtZmRDaGFydCcsIHJlcXVpcmUgJy4vbWZkJ1xuXHQuZGlyZWN0aXZlICdob3JBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3hBeGlzJ1xuXHQuZGlyZWN0aXZlICd2ZXJBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3lBeGlzJ1xuXHQuZGlyZWN0aXZlICdzbGlkZXJEZXInLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvc2xpZGVyJ1xuXHQuZGlyZWN0aXZlICdzaGlmdGVyJyxyZXF1aXJlICcuL2RpcmVjdGl2ZXMvc2hpZnRlcidcbiIsImQzID0gcmVxdWlyZSAnZDMnXG5hbmd1bGFyID0gcmVxdWlyZSAnYW5ndWxhcidcblxuZGVyID0gKCRwYXJzZSktPiAjZ29lcyBvbiBhIHN2ZyBlbGVtZW50XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRzY29wZTogXG5cdFx0XHRkM0RlcjogJz0nXG5cdFx0XHR0cmFuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdHUgPSAndC0nICsgTWF0aC5yYW5kb20oKVxuXHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gZmFsc2Vcblx0XHRcdHNjb3BlLiR3YXRjaCAnZDNEZXInXG5cdFx0XHRcdCwgKHYpLT5cblx0XHRcdFx0XHRpZiBzY29wZS50cmFuIGFuZCBoYXNUcmFuc2l0aW9uZWRcblx0XHRcdFx0XHRcdGhhc1RyYW5zaXRpb25lZCA9IHRydWVcblx0XHRcdFx0XHRcdHNlbC50cmFuc2l0aW9uIHVcblx0XHRcdFx0XHRcdFx0LmF0dHIgdlxuXHRcdFx0XHRcdFx0XHQuY2FsbCBzY29wZS50cmFuXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gdHJ1ZVxuXHRcdFx0XHRcdFx0c2VsLmF0dHIgdlxuXHRcdFx0XHQsIHRydWVcbm1vZHVsZS5leHBvcnRzID0gZGVyIiwibW9kdWxlLmV4cG9ydHMgPSAoJHBhcnNlKS0+XG5cdChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRkMy5zZWxlY3QoZWxbMF0pLmRhdHVtICRwYXJzZShhdHRyLmRhdHVtKShzY29wZSkiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAoJHBhcnNlKS0+XG5cdGRpcmVjdGl2ZSA9XG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0dSA9ICd0LScgKyBNYXRoLnJhbmRvbSgpXG5cdFx0XHR0cmFuID0gJHBhcnNlKGF0dHIudHJhbikoc2NvcGUpXG5cdFx0XHRyZXNoaWZ0ID0gKHYpLT4gXG5cdFx0XHRcdGlmIHRyYW5cblx0XHRcdFx0XHRzZWwudHJhbnNpdGlvbiB1XG5cdFx0XHRcdFx0XHQuYXR0ciAndHJhbnNmb3JtJyAsIFwidHJhbnNsYXRlKCN7dlswXX0sI3t2WzFdfSlcIlxuXHRcdFx0XHRcdFx0LmNhbGwgdHJhblxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0c2VsLmF0dHIgJ3RyYW5zZm9ybScgLCBcInRyYW5zbGF0ZSgje3ZbMF19LCN7dlsxXX0pXCJcblxuXHRcdFx0c2NvcGUuJHdhdGNoIC0+XG5cdFx0XHRcdFx0JHBhcnNlKGF0dHIuc2hpZnRlcikoc2NvcGUpXG5cdFx0XHRcdCwgcmVzaGlmdFxuXHRcdFx0XHQsIHRydWVcblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkZXIgPSAtPlxuXHRyZXMgPSBcblx0XHRzY29wZTogXG5cdFx0XHRsYWJlbDogJ0AnXG5cdFx0XHRteURhdGE6ICc9J1xuXHRcdFx0bWluOiAnPSdcblx0XHRcdG1heDogJz0nXG5cdFx0XHRzdGVwOiAnPSdcblx0XHQjIGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHJlcGxhY2U6IHRydWVcblx0XHQjIGNvbnRyb2xsZXI6IC0+XG5cdFx0IyBiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3Qvc2xpZGVyLmh0bWwnXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcblxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGZ1bjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2NhbGUgPSBzY29wZS5mdW4uc2NhbGUoKVxuXG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LmNsYXNzZWQgJ2hvciBheGlzJywgdHJ1ZVxuXG5cdFx0XHRzZWwuY2FsbCBzY29wZS5mdW5cblx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZnVuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzY2FsZSA9IHNjb3BlLmZ1bi5zY2FsZSgpXG5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuY2xhc3NlZCAndmVyIGF4aXMnLCB0cnVlXG5cblx0XHRcdHNlbC5jYWxsIHNjb3BlLmZ1blxuXHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsIid1c2Ugc3RyaWN0J1xuXG5GdW5jdGlvbjo6cHJvcGVydHkgPSAocHJvcCwgZGVzYykgLT5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsIHByb3AsIGRlc2MiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsZWwpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0d2lkdGg6IDMwMFxuXHRcdFx0aGVpZ2h0OiAzMDBcblx0XHRcdG06IFxuXHRcdFx0XHR0OiAxMFxuXHRcdFx0XHRsOiA0MFxuXHRcdFx0XHRyOiAxOFxuXHRcdFx0XHRiOiAzNVxuXG5cdFx0QGhvciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHRcdC5kb21haW4gWzAsMV1cblx0XHRcdFx0LnJhbmdlIFswLEB3aWR0aF1cblxuXHRcdEB2ZXIgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCwgLjVdXG5cdFx0XHQucmFuZ2UgW0BoZWlnaHQsIDBdXG5cblx0XHRAbGluZSA9IGQzLnN2Zy5saW5lKClcblx0XHRcdC54IChkKT0+QGhvciBkLmtcblx0XHRcdC55IChkKT0+QHZlciBkLnFcblx0XHRcdC5kZWZpbmVkIChkKS0+ZC5xPjBcblxuXHRcdEBob3JBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEBob3Jcblx0XHRcdC5vcmllbnQgJ2JvdHRvbSdcblx0XHRcdC50aWNrcyA4XG5cblx0XHRAdmVyQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAdmVyXG5cdFx0XHQub3JpZW50ICdsZWZ0J1xuXG5cdGQ6IC0+XG5cdFx0QGxpbmUgQGRhdGFcblx0XG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZGF0YTogJz0nXG5cdFx0XHRtZW1vcnk6ICc9J1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L21mZENoYXJ0Lmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsIlMgPSByZXF1aXJlICcuLi9zZXR0aW5ncydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5cbm4gPSAwXG5cbmNsYXNzIENhclxuXHRjb25zdHJ1Y3RvcjotPlxuXHRcdEBpZCA9IG4rK1xuXHRcdEBjb2xvciA9IF8uc2FtcGxlIFMuY29sb3JzLnJhbmdlKClcblxuXHRzZXRfbG9jOiAoQGxvYyktPlxuXG5tb2R1bGUuZXhwb3J0cyA9IENhciIsIlMgPSByZXF1aXJlICcuLi9zZXR0aW5ncydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5cbmNsYXNzIENlbGxcblx0Y29uc3RydWN0b3I6IChAbG9jKS0+XG5cdFx0QGJlZW5fZnJlZSA9IEluZmluaXR5XG5cdFx0QHRlbXBfY2FyID0gQGNhciA9IGZhbHNlXG5cdFx0QGlkID0gXy51bmlxdWVJZCAnY2VsbCdcblx0XHRAc2lnbmFsID0gdW5kZWZpbmVkXG5cblx0c2V0X3NpZ25hbDogKEBzaWduYWwpLT5cblx0XHRAc2lnbmFsLmxvYyA9IEBsb2Ncblx0XHRAc2lnbmFsLmNlbGwgPSB0aGlzXG5cblx0Y2xlYXJfc2lnbmFsOiAtPlxuXHRcdEBzaWduYWwgPSB1bmRlZmluZWRcblxuXHRyZWNlaXZlOihjYXIpLT5cblx0XHRjYXIuc2V0X2xvYyBAbG9jXG5cdFx0QHRlbXBfY2FyID0gY2FyXG5cblx0cmVzZXQ6IC0+XG5cdFx0QGJlZW5fZnJlZSA9IEluZmluaXR5XG5cdFx0QHRlbXBfY2FyID0gQGNhciA9IGZhbHNlXG5cblx0cmVtb3ZlOiAtPlxuXHRcdEB0ZW1wX2NhciA9IEBjYXIgPSBmYWxzZVxuXG5cdGZpbmFsaXplOiAtPlxuXHRcdEBjYXIgPSBAdGVtcF9jYXJcblx0XHRpZiBAY2FyXG5cdFx0XHRAYmVlbl9mcmVlPTBcblx0XHRlbHNlXG5cdFx0XHRAYmVlbl9mcmVlKytcblxuXHRpc19mcmVlOiAtPlxuXHRcdGlmIEBzaWduYWxcblx0XHRcdHJldHVybiAoQHNpZ25hbC5ncmVlbiBhbmQgKEBiZWVuX2ZyZWU+KDEvUy53LTEpKSlcblx0XHRlbHNlXG5cdFx0XHRAYmVlbl9mcmVlPigxL1Mudy0xKVxuXG5tb2R1bGUuZXhwb3J0cyA9IENlbGwiLCJTID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuXG5jbGFzcyBTaWduYWxcblx0Y29uc3RydWN0b3I6IChAaSkgLT5cblx0XHRAY291bnQgPSAwXG5cdFx0QGdyZWVuID0gdHJ1ZVxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ3NpZ25hbC0nXG5cblx0dGljazogLT5cblx0XHRlID0gKFMudGltZSAtIEBpKlMuZGVsdGEpJVMuY3ljbGVcblx0XHRpZiBlPj1TLmdyZWVuXG5cdFx0XHRAZ3JlZW4gPSBmYWxzZVxuXHRcdGVsc2Vcblx0XHRcdEBncmVlbj10cnVlXG5cbm1vZHVsZS5leHBvcnRzID0gU2lnbmFsIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5cbnttYXgsbWluLGFic30gPSBNYXRoXG5cbnNvbHZlID0gKGwpLT5cblx0eCA9IGwqUy5kXG5cdGlmIGw8MFxuXHRcdHRhID0gYWJzKHgpL1Mud1xuXHRlbHNlXG5cdFx0dGEgPSB4L1MudmZcblx0IyB0YSA9IGlmIGw8MCB0aGVuIChhYnMoeCkvUy53KSBlbHNlIHgvUy52ZlxuXHRlID0gKHRhLWwqUy5kZWx0YSklJVMuY3ljbGVcblx0ZyA9IG1heChTLmdyZWVuLWUsMClcblx0ciA9IG1pbihTLmN5Y2xlLWUsUy5yZWQpXG5cdGMgPSBTLnEwKmcgKyAoaWYgbDwwIHRoZW4gUy5raiphYnMoeCkgZWxzZSAwKVxuXHRyZXMgPVxuXHRcdHg6IHhcblx0XHRjOiBjXG5cdFx0cjogclxuXHRcdGM6IGNcblx0XHRnOiBnXG5cdFx0bDogbFxuXHRcdGU6IGVcblx0XHR0YTogdGFcblx0XHR0OiB0YStTLmN5Y2xlLWVcblxuY2xhc3MgU29sdmVyXG5cdGNvbnN0cnVjdG9yOiAtPlxuXG5cdG1ha2VfdGFibGU6LT5cblx0XHRyZWRfdGltZSA9IFMucmVkX3RpbWVcblx0XHRraiA9IFMua2pcblx0XHR0YWJsZSA9IFtdXG5cdFx0W2dfZm9yd2FyZCxsX2ZvcndhcmRdID0gWzEwMDAsMF1cblx0XHR3aGlsZSBnX2ZvcndhcmQ+MCBhbmQgbF9mb3J3YXJkPDEwMFxuXHRcdFx0cmVzID0gc29sdmUgbF9mb3J3YXJkXG5cdFx0XHR0YWJsZS5wdXNoIHJlc1xuXHRcdFx0Z19mb3J3YXJkID0gcmVzLmdcblx0XHRcdGxfZm9yd2FyZCsrXG5cblx0XHRbZ19iYWNrd2FyZCxsX2JhY2t3YXJkXSA9IFsxMDAwLC0xXVxuXHRcdHdoaWxlIGdfYmFja3dhcmQ+MCBhbmQgbF9iYWNrd2FyZD4tMTAwXG5cdFx0XHRyZXMgPSBzb2x2ZSBsX2JhY2t3YXJkXG5cdFx0XHR0YWJsZS5wdXNoIHJlc1xuXHRcdFx0Z19iYWNrd2FyZCA9IHJlcy5nXG5cdFx0XHRsX2JhY2t3YXJkLS1cblxuXHRcdHRhYmxlXG5cblx0ZmluZF9taW46IChrLHRhYmxlKS0+XG5cdFx0cSA9IEluZmluaXR5XG5cdFx0Zm9yIGUgaW4gdGFibGVcblx0XHRcdHFsID0gKGUuYyArIGsqZS54KS9lLnRcblx0XHRcdGlmIHFsPHFcblx0XHRcdFx0cSA9IHFsXG5cdFx0XHRcdGxvd2VzdCA9IGVcblx0XHRpZiBxPj0oUy52ZiprKVxuXHRcdFx0cSA9IChTLnZmKmspXG5cdFx0XHRsb3dlc3QgPSBcblx0XHRcdFx0cTogcVxuXHRcdGlmIHE+PShTLmtqLWspKlMud1xuXHRcdFx0cSA9IChTLmtqLWspKlMud1xuXHRcdFx0bG93ZXN0ID0gXG5cdFx0XHRcdHE6IHFcblx0XHRyZXMgPSBfLmNsb25lIGxvd2VzdFxuXHRcdHJlcy5rID0ga1xuXHRcdHJlcy5xID0gcVxuXHRcdHJldHVybiByZXNcblxuXHRmaW5kX21mZDotPlxuXHRcdHRhYmxlID0gQG1ha2VfdGFibGUoKVxuXHRcdHJlcyA9IChAZmluZF9taW4gayx0YWJsZSBmb3IgayBpbiBfLnJhbmdlIDAsMS4wNSwuMDEpXG5cbm1vZHVsZS5leHBvcnRzID0gU29sdmVyIiwiUyA9IHJlcXVpcmUgJy4uL3NldHRpbmdzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbkNhciA9IHJlcXVpcmUgJy4vY2FyJ1xuU2lnbmFsID0gcmVxdWlyZSAnLi9zaWduYWwnXG5DZWxsID0gcmVxdWlyZSAnLi9jZWxsJ1xuXG5cbmNsYXNzIE1lbW9yeVxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAbG9uZ190ZXJtID0gW11cblx0XHRAcmVzZXQoKVxuXHRyZXNldDotPlxuXHRcdFtAcSxAayxAaV0gPSBbMCwwLDBdXG5cblx0c3BhbjogMzBcblxuXHRyZW1lbWJlcjoocSxrKS0+XG5cdFx0QGkrK1xuXHRcdEBxKz1xXG5cdFx0QGsrPWtcblx0XHRzcGFuID0gUy5jeWNsZVxuXHRcdGlmIEBpPj1zcGFuXG5cdFx0XHRAbG9uZ190ZXJtLnB1c2ggXG5cdFx0XHRcdHE6IEBxLyhzcGFuKlMubnVtX2NlbGxzKVxuXHRcdFx0XHRrOiBAay8oc3BhbipTLm51bV9jZWxscylcblx0XHRcdFx0aWQ6IF8udW5pcXVlSWQgJ21lbW9yeS0nXG5cdFx0XHRAcmVzZXQoKVxuXHRcdFx0aWYgQGxvbmdfdGVybS5sZW5ndGg+MyB0aGVuIEBsb25nX3Rlcm0uc2hpZnQoKVxuXG5jbGFzcyBUcmFmZmljXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBjZWxscyA9IChuZXcgQ2VsbCBuIGZvciBuIGluIFswLi4uUy5udW1fY2VsbHNdKVxuXHRcdGZvciBjZWxsLGkgaW4gQGNlbGxzXG5cdFx0XHRjZWxsLm5leHQgPSBAY2VsbHNbKGkrMSklQGNlbGxzLmxlbmd0aF1cblx0XHRAY2FycyA9IFtdXG5cdFx0QHNpZ25hbHMgPSBbXVxuXHRcdEBtYWtlX3NpZ25hbHMoKVxuXHRcdEBtYWtlX2NhcnMoKVxuXHRcdEBtZW1vcnkgPSBuZXcgTWVtb3J5KClcblxuXHRjaG9vc2VfY2VsbDogKGNlbGwpLT5cblx0XHRpZiAhY2VsbC5jYXIgdGhlbiBjZWxsIGVsc2UgQGNob29zZV9jZWxsKGNlbGwubmV4dClcblxuXHRtYWtlX2NhcnM6IC0+XG5cdFx0e251bV9jYXJzLG51bV9jZWxsc30gPSBTXG5cdFx0Y2VsbC5yZXNldCgpIGZvciBjZWxsIGluIEBjZWxsc1xuXHRcdGRpZmYgPSBudW1fY2FycyAtIEBjYXJzLmxlbmd0aFxuXHRcdGlmIGRpZmY8MFxuXHRcdFx0QGNhcnMgPSBfLmRyb3AgXy5zaHVmZmxlKEBjYXJzKSwgLWRpZmZcblx0XHRlbHNlXG5cdFx0XHRmb3IgaSBpbiBbMC4uLmRpZmZdXG5cdFx0XHRcdEBjYXJzLnB1c2ggbmV3IENhcigpXG5cdFx0ZnJlZV9jZWxscyA9IF8uc2h1ZmZsZSBfLmNsb25lIF8uZmlsdGVyIEBjZWxscywgKGMpLT5jLmlzX2ZyZWUoKVxuXHRcdGZvciBjYXIsaSBpbiBAY2Fyc1xuXHRcdFx0Y2VsbCA9IGZyZWVfY2VsbHMucG9wKClcblx0XHRcdCMgY2VsbCA9IEBjaG9vc2VfY2VsbCBAY2VsbHNbTWF0aC5mbG9vcihpL251bV9jYXJzKm51bV9jZWxscyldXG5cdFx0XHRjZWxsLnJlY2VpdmUgY2FyXG5cblx0bWFrZV9zaWduYWxzOi0+XG5cdFx0e251bV9zaWduYWxzLG51bV9jZWxsc30gPSBTXG5cdFx0Y2VsbC5jbGVhcl9zaWduYWwoKSBmb3IgY2VsbCBpbiBAY2VsbHNcblx0XHRsID0gQHNpZ25hbHMubGVuZ3RoXG5cdFx0ZGlmZiA9IG51bV9zaWduYWxzLWxcblx0XHRpZiBkaWZmPDBcblx0XHRcdEBzaWduYWxzID0gXy5kcm9wIEBzaWduYWxzLCAtZGlmZlxuXHRcdGVsc2Vcblx0XHRcdGZvciBpIGluIFswLi4uZGlmZl1cblx0XHRcdFx0QHNpZ25hbHMucHVzaCBuZXcgU2lnbmFsIGwraVxuXG5cdFx0Zm9yIHNpZ25hbCxpIGluIEBzaWduYWxzXG5cdFx0XHR3aGljaCA9IE1hdGguZmxvb3IoaS9udW1fc2lnbmFscypudW1fY2VsbHMpXG5cdFx0XHRAY2VsbHNbd2hpY2hdLnNldF9zaWduYWwgc2lnbmFsXG5cblx0dGljazotPlxuXHRcdEMgPSBAY2VsbHNcblx0XHRxPTBcblxuXHRcdHNpZ25hbC50aWNrKCkgZm9yIHNpZ25hbCBpbiBAc2lnbmFsc1xuXG5cdFx0Zm9yIGNlbGwgaW4gQ1xuXHRcdFx0aWYgY2VsbC5jYXJcblx0XHRcdFx0aWYgY2VsbC5uZXh0LmlzX2ZyZWUoKVxuXHRcdFx0XHRcdGNlbGwubmV4dC5yZWNlaXZlIGNlbGwuY2FyXG5cdFx0XHRcdFx0Y2VsbC5yZW1vdmUoKVxuXHRcdFx0XHRcdHErK1xuXG5cdFx0Y2VsbC5maW5hbGl6ZSgpIGZvciBjZWxsIGluIEBjZWxsc1xuXHRcdEBtZW1vcnkucmVtZW1iZXIgcSxAY2Fycy5sZW5ndGhcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFmZmljXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbnJlcXVpcmUgJy4vaGVscGVycydcblxuY2xhc3MgU2V0dGluZ3Ncblx0Y29uc3RydWN0b3I6LT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0bnVtX2NlbGxzOiAxMDAwXG5cdFx0XHRfbnVtX2NhcnM6IDU1MFxuXHRcdFx0X2s6IDU1MC8xMDAwXG5cdFx0XHRfbnVtX3NpZ25hbHM6IDEwMDAvMjBcblx0XHRcdF9vZmZzZXQ6IC4yXG5cdFx0XHRfZDogMjBcblx0XHRcdGtqOiAxXG5cdFx0XHRfazA6IDEvM1xuXHRcdFx0dGltZTogMFxuXHRcdFx0cmVkOiA1MFxuXHRcdFx0Y3ljbGU6IDEwMFxuXHRcdFx0dmY6IDFcblxuXHRcdEBrMCA9IDEvM1xuXG5cdFx0QGNvbG9ycyA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIF8ucmFuZ2UgMCxAbnVtX2NlbGxzLEBudW1fY2VsbHMvNlxuXHRcdFx0LnJhbmdlIFtcblx0XHRcdFx0JyNGNDQzMzYnLCAjcmVkXG5cdFx0XHRcdCcjMjE5NkYzJywgI2JsdWVcblx0XHRcdFx0JyNFOTFFNjMnLCAjcGlua1xuXHRcdFx0XHQnIzAwQkNENCcsICNjeWFuXG5cdFx0XHRcdCcjRkZDMTA3JywgI2FtYmVyXG5cdFx0XHRcdCcjNENBRjUwJywgI2dyZWVuXG5cdFx0XHRcdF1cblxuXHRcdEBzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLEBudW1fY2VsbHNdXG5cdFx0XHQucmFuZ2UgWzAsMzYwXVxuXG5cdEBwcm9wZXJ0eSAnZ3JlZW4nLFxuXHRcdGdldDogLT5cblx0XHRcdEBjeWNsZSAtIEByZWRcblxuXHRAcHJvcGVydHkgJ3EwJyxcblx0XHRnZXQ6LT5cblx0XHRcdEBfazBcblxuXHRAcHJvcGVydHkgJ2swJyxcblx0XHRnZXQ6LT5cblx0XHRcdEBfazBcblx0XHRzZXQ6IChrMCktPlxuXHRcdFx0QF9rMCA9IDEvTWF0aC5yb3VuZCgxL2swKVxuXHRcdFx0QHcgPSBAX2swLyhAa2ogLSBAX2swKVxuXG5cdEBwcm9wZXJ0eSAnbnVtX2NhcnMnLCBcblx0XHRnZXQ6LT5cblx0XHRcdEBfbnVtX2NhcnNcblx0XHRzZXQ6KG51bV9jYXJzKS0+XG5cdFx0XHRAX251bV9jYXJzID0gTWF0aC5yb3VuZCBudW1fY2Fyc1xuXHRcdFx0QF9rID0gQF9udW1fY2Fycy9AbnVtX2NlbGxzXG5cblx0QHByb3BlcnR5ICdrJyxcblx0XHRnZXQ6LT5cblx0XHRcdEBfa1xuXHRcdHNldDooayktPlxuXHRcdFx0QF9udW1fY2FycyA9IE1hdGgucm91bmQgaypAbnVtX2NlbGxzXG5cdFx0XHRAX2sgPSBAX251bV9jYXJzL0BudW1fY2VsbHNcblxuXHRAcHJvcGVydHkgJ2RlbHRhJyxcblx0XHRnZXQ6IC0+XG5cdFx0XHRAX29mZnNldCpAY3ljbGVcblxuXHRAcHJvcGVydHkgJ3JlZF90aW1lJyxcblx0XHRnZXQ6LT5cblx0XHRcdEByZWRcblxuXHRAcHJvcGVydHkgJ2QnLCBcblx0XHRnZXQ6LT5cblx0XHRcdEBfZFxuXHRcdHNldDooZCktPlxuXHRcdFx0QF9udW1fc2lnbmFscyA9IE1hdGgucm91bmQgQG51bV9jZWxscy9kXG5cdFx0XHRAX2QgPSBAbnVtX2NlbGxzL0BfbnVtX3NpZ25hbHNcblx0XHRcdEBfb2Zmc2V0ID0gTWF0aC5yb3VuZChAX29mZnNldCAqIEBfbnVtX3NpZ25hbHMpL0BfbnVtX3NpZ25hbHNcblxuXHRAcHJvcGVydHkgJ251bV9zaWduYWxzJyxcblx0XHRnZXQ6LT5cblx0XHRcdEBfbnVtX3NpZ25hbHNcblx0XHRzZXQ6IChudW1fc2lnbmFscyktPlxuXHRcdFx0QF9udW1fc2lnbmFscyA9IG51bV9zaWduYWxzXG5cdFx0XHRAX2QgPSBNYXRoLnJvdW5kIEBudW1fY2VsbHMvQF9udW1fc2lnbmFsc1xuXHRcdFx0QF9vZmZzZXQgPSBNYXRoLnJvdW5kKEBfb2Zmc2V0ICogQF9udW1fc2lnbmFscykvQF9udW1fc2lnbmFsc1xuXG5cdEBwcm9wZXJ0eSAnb2Zmc2V0Jyxcblx0XHRnZXQ6LT5cblx0XHRcdEBfb2Zmc2V0XG5cdFx0c2V0OihvZmZzZXQpLT5cblx0XHRcdEBfb2Zmc2V0ID0gTWF0aC5yb3VuZChvZmZzZXQgKiBAX251bV9zaWduYWxzKS9AX251bV9zaWduYWxzXG5cblx0YWR2YW5jZTogLT5cblx0XHRAdGltZSsrXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFNldHRpbmdzKCkiXX0=
