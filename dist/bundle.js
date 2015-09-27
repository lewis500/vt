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
      this._k = k;
      return this._num_cars = Math.round(k * this.num_cells);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL2FwcC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL2RpcmVjdGl2ZXMvZDNEZXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9kaXJlY3RpdmVzL2RhdHVtLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvZGlyZWN0aXZlcy9zaGlmdGVyLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvZGlyZWN0aXZlcy9zbGlkZXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9kaXJlY3RpdmVzL3hBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvZGlyZWN0aXZlcy95QXhpcy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL2hlbHBlcnMuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9tZmQuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9tb2RlbHMvY2FyLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvbW9kZWxzL2NlbGwuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9tb2RlbHMvc2lnbmFsLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvbW9kZWxzL3NvbHZlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL21vZGVscy90cmFmZmljLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvc2V0dGluZ3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQTs7QUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1YsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztBQUNMLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7QUFDSixDQUFBLEdBQUksT0FBQSxDQUFRLFlBQVI7O0FBQ0osT0FBQSxHQUFVLE9BQUEsQ0FBUSxrQkFBUjs7QUFDVixHQUFBLEdBQU0sT0FBQSxDQUFRLGNBQVI7O0FBQ04sTUFBQSxHQUFTLE9BQUEsQ0FBUSxpQkFBUjs7QUFFSDtFQUNPLGNBQUMsS0FBRDtJQUFDLElBQUMsQ0FBQSxRQUFEO0lBQ1osQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQ0M7TUFBQSxNQUFBLEVBQVEsSUFBUjtNQUNBLE9BQUEsRUFBUyxJQUFJLE9BRGI7TUFFQSxNQUFBLEVBQVEsSUFBSSxNQUZaO0tBREQ7SUFLQSxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsR0FBaUIsSUFBQyxDQUFBO0lBRWxCLElBQUMsQ0FBQSxLQUFLLENBQUMsQ0FBUCxHQUFXO0lBRVgsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsWUFBZCxFQUE0QixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7UUFDM0IsS0FBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULENBQUE7ZUFDQSxLQUFDLENBQUEsV0FBRCxHQUFlLEtBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFBO01BRlk7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVCO0lBSUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsZUFBZCxFQUErQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7UUFDOUIsS0FBQyxDQUFBLE9BQU8sQ0FBQyxZQUFULENBQUE7ZUFDQSxLQUFDLENBQUEs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QUFELEdBQVcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxZQUF2QixDQUFBLEdBQXFDLElBQUMsQ0FBQTtJQUg3QyxDQUZMO0dBREQ7O0VBUUEsUUFBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWLEVBQ0M7SUFBQSxHQUFBLEVBQUksU0FBQTthQUNILElBQUMsQ0FBQTtJQURFLENBQUo7SUFFQSxHQUFBLEVBQUksU0FBQyxNQUFEO2FBQ0gsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJLENBQUMsS0FBTCxDQUFXLE1BQUEsR0FBUyxJQUFDLENBQUEsWUFBckIsQ0FBQSxHQUFtQyxJQUFDLENBQUE7SUFENUMsQ0FGSjtHQUREOztxQkFNQSxPQUFBLEdBQVMsU0FBQTtXQUNSLElBQUMsQ0FBQSxJQUFEO0VBRFE7Ozs7OztBQUdWLE1BQU0sQ0FBQyxPQUFQLEdBQXFCLElBQUEsUUFBQSxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblRyYWZmaWMgPSByZXF1aXJlICcuL21vZGVscy90cmFmZmljJ1xuQ2FyID0gcmVxdWlyZSAnLi9tb2RlbHMvY2FyJ1xuU29sdmVyID0gcmVxdWlyZSAnLi9tb2RlbHMvc29sdmVyJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0cGF1c2VkOiB0cnVlXG5cdFx0XHR0cmFmZmljOiBuZXcgVHJhZmZpY1xuXHRcdFx0c29sdmVyOiBuZXcgU29sdmVyXG5cdFx0XHRcblx0XHRAc2NvcGUudHJhZmZpYyA9IEB0cmFmZmljXG5cblx0XHRAc2NvcGUuUyA9IFNcblxuXHRcdEBzY29wZS4kd2F0Y2ggJ1MubnVtX2NhcnMnLCA9PlxuXHRcdFx0QHRyYWZmaWMubWFrZV9jYXJzKClcblx0XHRcdEBkYXRhX3RoZW9yeSA9IEBzb2x2ZXIuZmluZF9tZmQoKVxuXG5cdFx0QHNjb3BlLiR3YXRjaCAnUy5udW1fc2lnbmFscycsID0+XG5cdFx0XHRAdHJhZmZpYy5tYWtlX3NpZ25hbHMoKVxuXHRcdFx0QGRhdGFfdGhlb3J5ID0gQHNvbHZlci5maW5kX21mZCgpXG5cblx0XHRAc2NvcGUuJHdhdGNoICdTLm9mZnNldCArIFMuY3ljbGUgKyBTLnJlZCcsPT5cblx0XHRcdEB0cmFmZmljLnJlc2V0X3NpZ25hbHMoKVxuXHRcdFx0QGRhdGFfdGhlb3J5ID0gQHNvbHZlci5maW5kX21mZCgpXG5cblx0XHRAc2NvcGUuJHdhdGNoICdTLnEwICsgUy53Jyw9PlxuXHRcdFx0QGRhdGFfdGhlb3J5ID0gQHNvbHZlci5maW5kX21mZCgpXG5cdFx0XG5cdHJvdGF0b3I6IChjYXIpLT4gXCJyb3RhdGUoI3tTLnNjYWxlKGNhci5sb2MpfSkgdHJhbnNsYXRlKDAsNTApXCJcblxuXHRjbGljazogKHZhbCkgLT4gaWYgIXZhbCB0aGVuIEBwbGF5KClcblx0cGF1c2U6IC0+IEBwYXVzZWQgPSB0cnVlXG5cdHRpY2s6IC0+XG5cdFx0ZDMudGltZXIgPT5cblx0XHRcdFx0QHRyYWZmaWMudGljaygpXG5cdFx0XHRcdEBzY29wZS4kZXZhbEFzeW5jKClcblx0XHRcdFx0QHBhdXNlZFxuXHRwbGF5OiAtPlxuXHRcdEBwYXVzZSgpXG5cdFx0QHBhdXNlZCA9IGZhbHNlXG5cdFx0QHRpY2soKVxuXG52aXNEZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRzY29wZToge31cblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC92aXMuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsIEN0cmxdXG5cbiMgY2FyRGVyID0gLT5cbiMgXHRkaXJlY3RpdmUgPSBcbiMgXHRcdHNjb3BlOlxuIyBcdFx0XHRjYXJzOiAnPSdcbiMgXHRcdGxpbms6IChzY29wZSxlbCxhdHRyKS0+XG4jIFx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuIyBcdFx0XHRcdC5zZWxlY3QgJy5jYXJzJ1xuXG4jIFx0XHRcdHNjb3BlLiRvbiAndGljaycsLT5cblxuIyBcdFx0XHRcdHNlbC5zZWxlY3RBbGwgJy5nLWNhcidcbiMgXHRcdFx0XHRcdC5kYXRhIHNjb3BlLmNhcnMsIChkKS0+IGQuaWRcbiMgXHRcdFx0XHRcdC5hdHRyICd0cmFuc2Zvcm0nLCAoZCktPlwicm90YXRlKCN7Uy5zY2FsZShkLmxvYyl9KSB0cmFuc2xhdGUoMCw1MClcIlxuXG4jIFx0XHRcdHVwZGF0ZSA9IC0+XG4jIFx0XHRcdFx0Y2FycyA9IHNlbC5zZWxlY3RBbGwgJy5nLWNhcidcdFx0XG4jIFx0XHRcdFx0XHQuZGF0YSBzY29wZS5jYXJzLCAoZCktPiBkLmlkXG5cbiMgXHRcdFx0XHRuZXdfY2FycyA9IGNhcnMuZW50ZXIoKVxuIyBcdFx0XHRcdFx0LmFwcGVuZCAnZydcbiMgXHRcdFx0XHRcdC5hdHRyXG4jIFx0XHRcdFx0XHRcdGNsYXNzOiAnZy1jYXInXG5cbiMgXHRcdFx0XHRjYXJzLmV4aXQoKS5yZW1vdmUoKVxuXHRcdFx0XHRcdFxuIyBcdFx0XHRcdG5ld19jYXJzLmFwcGVuZCAncmVjdCdcbiMgXHRcdFx0XHRcdC5hdHRyXG4jIFx0XHRcdFx0XHRcdHdpZHRoOiAuMlxuIyBcdFx0XHRcdFx0XHRoZWlnaHQ6IDJcbiMgXHRcdFx0XHRcdFx0eTogLTFcbiMgXHRcdFx0XHRcdFx0eDogLS4xXG4jIFx0XHRcdFx0XHRcdGZpbGw6IChkKS0+ZC5jb2xvclxuXG4jIFx0XHRcdHNjb3BlLiR3YXRjaCAnY2Fycy5sZW5ndGgnLCB1cGRhdGVcblxuYW5ndWxhci5tb2R1bGUgJ21haW5BcHAnICwgW3JlcXVpcmUgJ2FuZ3VsYXItbWF0ZXJpYWwnICwgcmVxdWlyZSAnYW5ndWxhci1hbmltYXRlJ11cblx0LmRpcmVjdGl2ZSAndmlzRGVyJywgdmlzRGVyXG5cdC5kaXJlY3RpdmUgJ2RhdHVtJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL2RhdHVtJ1xuXHQuZGlyZWN0aXZlICdkM0RlcicsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9kM0Rlcidcblx0LmRpcmVjdGl2ZSAnbWZkQ2hhcnQnLCByZXF1aXJlICcuL21mZCdcblx0LmRpcmVjdGl2ZSAnaG9yQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy94QXhpcydcblx0LmRpcmVjdGl2ZSAndmVyQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy95QXhpcydcblx0LmRpcmVjdGl2ZSAnc2xpZGVyRGVyJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3NsaWRlcidcblx0LmRpcmVjdGl2ZSAnc2hpZnRlcicscmVxdWlyZSAnLi9kaXJlY3RpdmVzL3NoaWZ0ZXInXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuYW5ndWxhciA9IHJlcXVpcmUgJ2FuZ3VsYXInXG5cbmRlciA9ICgkcGFyc2UpLT4gI2dvZXMgb24gYSBzdmcgZWxlbWVudFxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZDNEZXI6ICc9J1xuXHRcdFx0dHJhbjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHR1ID0gJ3QtJyArIE1hdGgucmFuZG9tKClcblx0XHRcdGhhc1RyYW5zaXRpb25lZCA9IGZhbHNlXG5cdFx0XHRzY29wZS4kd2F0Y2ggJ2QzRGVyJ1xuXHRcdFx0XHQsICh2KS0+XG5cdFx0XHRcdFx0aWYgc2NvcGUudHJhbiBhbmQgaGFzVHJhbnNpdGlvbmVkXG5cdFx0XHRcdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSB0cnVlXG5cdFx0XHRcdFx0XHRzZWwudHJhbnNpdGlvbiB1XG5cdFx0XHRcdFx0XHRcdC5hdHRyIHZcblx0XHRcdFx0XHRcdFx0LmNhbGwgc2NvcGUudHJhblxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGhhc1RyYW5zaXRpb25lZCA9IHRydWVcblx0XHRcdFx0XHRcdHNlbC5hdHRyIHZcblx0XHRcdFx0LCB0cnVlXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsIm1vZHVsZS5leHBvcnRzID0gKCRwYXJzZSktPlxuXHQoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0ZDMuc2VsZWN0KGVsWzBdKS5kYXR1bSAkcGFyc2UoYXR0ci5kYXR1bSkoc2NvcGUpIiwiZDMgPSByZXF1aXJlICdkMydcblxuZGVyID0gKCRwYXJzZSktPlxuXHRkaXJlY3RpdmUgPVxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdHUgPSAndC0nICsgTWF0aC5yYW5kb20oKVxuXHRcdFx0dHJhbiA9ICRwYXJzZShhdHRyLnRyYW4pKHNjb3BlKVxuXHRcdFx0cmVzaGlmdCA9ICh2KS0+IFxuXHRcdFx0XHRpZiB0cmFuXG5cdFx0XHRcdFx0c2VsLnRyYW5zaXRpb24gdVxuXHRcdFx0XHRcdFx0LmF0dHIgJ3RyYW5zZm9ybScgLCBcInRyYW5zbGF0ZSgje3ZbMF19LCN7dlsxXX0pXCJcblx0XHRcdFx0XHRcdC5jYWxsIHRyYW5cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHNlbC5hdHRyICd0cmFuc2Zvcm0nICwgXCJ0cmFuc2xhdGUoI3t2WzBdfSwje3ZbMV19KVwiXG5cblx0XHRcdHNjb3BlLiR3YXRjaCAtPlxuXHRcdFx0XHRcdCRwYXJzZShhdHRyLnNoaWZ0ZXIpKHNjb3BlKVxuXHRcdFx0XHQsIHJlc2hpZnRcblx0XHRcdFx0LCB0cnVlXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZGVyID0gLT5cblx0cmVzID0gXG5cdFx0c2NvcGU6IFxuXHRcdFx0bGFiZWw6ICdAJ1xuXHRcdFx0bXlEYXRhOiAnPSdcblx0XHRcdG1pbjogJz0nXG5cdFx0XHRtYXg6ICc9J1xuXHRcdFx0c3RlcDogJz0nXG5cdFx0IyBjb250cm9sbGVyQXM6ICd2bSdcblx0XHRyZXBsYWNlOiB0cnVlXG5cdFx0IyBjb250cm9sbGVyOiAtPlxuXHRcdCMgYmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L3NsaWRlci5odG1sJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5cbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRzY29wZTogXG5cdFx0XHRmdW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNjYWxlID0gc2NvcGUuZnVuLnNjYWxlKClcblxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5jbGFzc2VkICdob3IgYXhpcycsIHRydWVcblxuXHRcdFx0c2VsLmNhbGwgc2NvcGUuZnVuXG5cdFx0XHRcbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcblxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGZ1bjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2NhbGUgPSBzY29wZS5mdW4uc2NhbGUoKVxuXG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LmNsYXNzZWQgJ3ZlciBheGlzJywgdHJ1ZVxuXG5cdFx0XHRzZWwuY2FsbCBzY29wZS5mdW5cblx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCIndXNlIHN0cmljdCdcblxuRnVuY3Rpb246OnByb3BlcnR5ID0gKHByb3AsIGRlc2MpIC0+XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCBwcm9wLCBkZXNjIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLGVsKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHdpZHRoOiAzMDBcblx0XHRcdGhlaWdodDogMzAwXG5cdFx0XHRtOiBcblx0XHRcdFx0dDogMTBcblx0XHRcdFx0bDogNDBcblx0XHRcdFx0cjogMThcblx0XHRcdFx0YjogMzVcblxuXHRcdEBob3IgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0XHQuZG9tYWluIFswLDFdXG5cdFx0XHRcdC5yYW5nZSBbMCxAd2lkdGhdXG5cblx0XHRAdmVyID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsIC41XVxuXHRcdFx0LnJhbmdlIFtAaGVpZ2h0LCAwXVxuXG5cdFx0QGxpbmUgPSBkMy5zdmcubGluZSgpXG5cdFx0XHQueCAoZCk9PkBob3IgZC5rXG5cdFx0XHQueSAoZCk9PkB2ZXIgZC5xXG5cdFx0XHQuZGVmaW5lZCAoZCktPmQucT4wXG5cblx0XHRAaG9yQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAaG9yXG5cdFx0XHQub3JpZW50ICdib3R0b20nXG5cdFx0XHQudGlja3MgOFxuXG5cdFx0QHZlckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQHZlclxuXHRcdFx0Lm9yaWVudCAnbGVmdCdcblxuXHRkOiAtPlxuXHRcdEBsaW5lIEBkYXRhXG5cdFxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGRhdGE6ICc9J1xuXHRcdFx0bWVtb3J5OiAnPSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC9tZmRDaGFydC5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJTID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuXG5uID0gMFxuXG5jbGFzcyBDYXJcblx0Y29uc3RydWN0b3I6LT5cblx0XHRAaWQgPSBuKytcblx0XHRAY29sb3IgPSBfLnNhbXBsZSBTLmNvbG9ycy5yYW5nZSgpXG5cblx0c2V0X2xvYzogKEBsb2MpLT5cblxubW9kdWxlLmV4cG9ydHMgPSBDYXIiLCJTID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuXG5jbGFzcyBDZWxsXG5cdGNvbnN0cnVjdG9yOiAoQGxvYyktPlxuXHRcdEBiZWVuX2ZyZWUgPSBJbmZpbml0eVxuXHRcdEB0ZW1wX2NhciA9IEBjYXIgPSBmYWxzZVxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ2NlbGwnXG5cdFx0QHNpZ25hbCA9IHVuZGVmaW5lZFxuXG5cdHNldF9zaWduYWw6IChAc2lnbmFsKS0+XG5cdFx0QHNpZ25hbC5sb2MgPSBAbG9jXG5cdFx0QHNpZ25hbC5jZWxsID0gdGhpc1xuXG5cdGNsZWFyX3NpZ25hbDogLT5cblx0XHRAc2lnbmFsID0gdW5kZWZpbmVkXG5cblx0cmVjZWl2ZTooY2FyKS0+XG5cdFx0Y2FyLnNldF9sb2MgQGxvY1xuXHRcdEB0ZW1wX2NhciA9IGNhclxuXHRcdEBiZWVuX2ZyZWUgPSAwXG5cdFx0Y2FyLmNlbGwgPSB0aGlzXG5cblx0cmVzZXQ6IC0+XG5cdFx0QGJlZW5fZnJlZSA9IEluZmluaXR5XG5cdFx0QHRlbXBfY2FyID0gQGNhciA9IGZhbHNlXG5cblx0cmVtb3ZlOiAtPlxuXHRcdEBiZWVuX2ZyZWUgPSAxXG5cdFx0QHRlbXBfY2FyID0gQGNhciA9IGZhbHNlXG5cblx0ZmluYWxpemU6IC0+XG5cdFx0QGNhciA9IEB0ZW1wX2NhclxuXHRcdGlmICEhQGNhclxuXHRcdFx0QGJlZW5fZnJlZT0wXG5cdFx0ZWxzZVxuXHRcdFx0QGJlZW5fZnJlZSsrXG5cblx0aXNfZnJlZTogLT5cblx0XHRpZiBAc2lnbmFsXG5cdFx0XHRyZXR1cm4gKEBzaWduYWwuZ3JlZW4gYW5kIChAYmVlbl9mcmVlPigxL1MudykpKVxuXHRcdGVsc2Vcblx0XHRcdEBiZWVuX2ZyZWU+KDEvUy53KVxuXG5tb2R1bGUuZXhwb3J0cyA9IENlbGwiLCJTID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuXG5jbGFzcyBTaWduYWxcblx0Y29uc3RydWN0b3I6IChAaSkgLT5cblx0XHRAY291bnQgPSAwXG5cdFx0QGdyZWVuID0gdHJ1ZVxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ3NpZ25hbC0nXG5cdFx0QHJlc2V0KClcblxuXHRyZXNldDogLT5cblx0XHRAb2Zmc2V0ID0gUy5jeWNsZSooKEBpKlMub2Zmc2V0KSUxKVxuXHRcdFtAY291bnQsIEBncmVlbl0gPSBbQG9mZnNldCwgdHJ1ZV1cblxuXHR0aWNrOiAtPlxuXHRcdEBjb3VudCsrXG5cdFx0aWYgQGNvdW50ID4gUy5jeWNsZVxuXHRcdFx0W0Bjb3VudCwgQGdyZWVuXSA9IFswLCB0cnVlXVxuXHRcdGlmIChAY291bnQpPj0oKDEtUy5yZWQpKlMuY3ljbGUpXG5cdFx0XHRAZ3JlZW4gPSBmYWxzZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpZ25hbCIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4uL3NldHRpbmdzJ1xuXG5jbGFzcyBMaWdodFxuXHRjb25zdHJ1Y3RvcjooQGwpLT5cblx0XHRAeCA9IFMuZCAqIEBsXG5cblx0aW50ZXJzZWN0Oih0KS0+XG5cdFx0b2Zmc2V0ID0gUy5kZWx0YSpAbFxuXHRcdGxlZnRvdmVyID0gKHQrb2Zmc2V0KSVTLmN5Y2xlXG5cdFx0aWYgbGVmdG92ZXI8KFMucmVkKlMuY3ljbGUpXG5cdFx0XHQwXG5cdFx0ZWxzZVxuXHRcdFx0Uy5jeWNsZS1sZWZ0b3ZlclxuXG5jbGFzcyBTb2x2ZXJcblx0Y29uc3RydWN0b3I6IC0+XG5cblx0bWFrZV90YWJsZTotPlxuXHRcdHJlZF90aW1lID0gUy5yZWRfdGltZVxuXHRcdGtqID0gUy5ralxuXHRcdHJlcyA9IFtdXG5cdFx0W3RpbWVfc3RvcHBlZCxsXSA9IFsxMDAwLC0xXVxuXHRcdHdoaWxlIHRpbWVfc3RvcHBlZD4wIGFuZCArK2w8NTBcblx0XHRcdGxpZ2h0ID0gbmV3IExpZ2h0IGxcblx0XHRcdHRpbWVfdHJhdmVsaW5nID0gbGlnaHQueC9TLnZmXG5cdFx0XHR0aW1lX2Fycml2YWwgPSByZWRfdGltZSArIHRpbWVfdHJhdmVsaW5nXG5cdFx0XHR0aW1lX3N0b3BwZWQgPSBsaWdodC5pbnRlcnNlY3QgdGltZV9hcnJpdmFsXG5cdFx0XHRyZXMucHVzaCBcblx0XHRcdFx0eDogbGlnaHQueFxuXHRcdFx0XHR0OiB0aW1lX2Fycml2YWwrdGltZV9zdG9wcGVkXG5cdFx0XHRcdGc6IHRpbWVfc3RvcHBlZFxuXHRcdFx0XHRsOiBsaWdodC5sXG5cdFx0XHRcdGM6IFMucTAqdGltZV9zdG9wcGVkXG5cblx0XHRbdGltZV9zdG9wcGVkLGxdID0gWzEwMDAsMF1cblx0XHR3aGlsZSB0aW1lX3N0b3BwZWQ+MCBhbmQgLS1sPi01MFxuXHRcdFx0bGlnaHQgPSBuZXcgTGlnaHQgbFxuXHRcdFx0dGltZV90cmF2ZWxpbmc9IC1saWdodC54L1Mud1xuXHRcdFx0dGltZV9hcnJpdmFsID0gcmVkX3RpbWUgKyB0aW1lX3RyYXZlbGluZ1xuXHRcdFx0dGltZV9zdG9wcGVkID0gbGlnaHQuaW50ZXJzZWN0IHRpbWVfYXJyaXZhbFxuXHRcdFx0cmVzLnB1c2hcblx0XHRcdFx0eDogbGlnaHQueFxuXHRcdFx0XHR0OiB0aW1lX2Fycml2YWwgKyB0aW1lX3N0b3BwZWRcblx0XHRcdFx0ZzogdGltZV9zdG9wcGVkXG5cdFx0XHRcdGw6IGxcblx0XHRcdFx0YzogLWxpZ2h0Lngqa2ogKyBTLnEwKnRpbWVfc3RvcHBlZFxuXHRcdHJlc1xuXG5cdGZpbmRfbWluOiAoayx0YWJsZSktPlxuXHRcdGZsb3cgPSBJbmZpbml0eVxuXHRcdHJlcyA9IHt9XG5cdFx0Zm9yIGUgaW4gdGFibGVcblx0XHRcdGZsb3dfbCA9IChlLmMgKyBrKmUueCkvKGUudClcblx0XHRcdGlmIGZsb3dfbDw9Zmxvd1xuXHRcdFx0XHRmbG93ID0gZmxvd19sXG5cdFx0XHRcdHJlcyA9IF8uY2xvbmUgZVxuXHRcdHJlcy5rID0ga1xuXHRcdHJlcy5xID0gZmxvd1xuXHRcdHJldHVybiByZXNcblxuXHRmaW5kX21mZDotPlxuXHRcdHRhYmxlID0gQG1ha2VfdGFibGUoKVxuXHRcdHJlcyA9IChAZmluZF9taW4gayx0YWJsZSBmb3IgayBpbiBfLnJhbmdlIDAsNSwuMDEpXG5cbm1vZHVsZS5leHBvcnRzID0gU29sdmVyIiwiUyA9IHJlcXVpcmUgJy4uL3NldHRpbmdzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbkNhciA9IHJlcXVpcmUgJy4vY2FyJ1xuU2lnbmFsID0gcmVxdWlyZSAnLi9zaWduYWwnXG5DZWxsID0gcmVxdWlyZSAnLi9jZWxsJ1xuXG5cbmNsYXNzIE1lbW9yeVxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAbG9uZ190ZXJtID0gW11cblx0XHRAcmVzZXQoKVxuXHRyZXNldDotPlxuXHRcdFtAcSxAayxAaV0gPSBbMCwwLDBdXG5cblx0c3BhbjogMzBcblxuXHRyZW1lbWJlcjoocSxrKS0+XG5cdFx0QGkrK1xuXHRcdEBxKz1xXG5cdFx0QGsrPWtcblx0XHRpZiBAaT49QHNwYW5cblx0XHRcdEBsb25nX3Rlcm0ucHVzaCBcblx0XHRcdFx0cTogQHEvKEBzcGFuKlMubnVtX2NlbGxzKVxuXHRcdFx0XHRrOiBAay8oQHNwYW4qUy5udW1fY2VsbHMpXG5cdFx0XHRcdGlkOiBfLnVuaXF1ZUlkICdtZW1vcnktJ1xuXHRcdFx0QHJlc2V0KClcblx0XHRcdGlmIEBsb25nX3Rlcm0ubGVuZ3RoPjEwIHRoZW4gQGxvbmdfdGVybS5zaGlmdCgpXG5cbmNsYXNzIFRyYWZmaWNcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QGNlbGxzID0gKG5ldyBDZWxsIG4gZm9yIG4gaW4gWzAuLi5TLm51bV9jZWxsc10pXG5cdFx0Zm9yIGNlbGwsaSBpbiBAY2VsbHNcblx0XHRcdGNlbGwubmV4dCA9IEBjZWxsc1soaSsxKSVAY2VsbHMubGVuZ3RoXVxuXHRcdEBjYXJzID0gW11cblx0XHRAc2lnbmFscyA9IFtdXG5cdFx0QG1ha2Vfc2lnbmFscygpXG5cdFx0QG1ha2VfY2FycygpXG5cdFx0QG1lbW9yeSA9IG5ldyBNZW1vcnkoKVxuXG5cdGNob29zZV9jZWxsOiAoY2VsbCktPlxuXHRcdGlmICFjZWxsLmNhciB0aGVuIGNlbGwgZWxzZSBAY2hvb3NlX2NlbGwoY2VsbC5uZXh0KVxuXG5cdG1ha2VfY2FyczogLT5cblx0XHR7bnVtX2NhcnMsbnVtX2NlbGxzfSA9IFNcblx0XHRjZWxsLnJlc2V0KCkgZm9yIGNlbGwgaW4gQGNlbGxzXG5cdFx0ZGlmZiA9IG51bV9jYXJzIC0gQGNhcnMubGVuZ3RoXG5cdFx0aWYgZGlmZjwwXG5cdFx0XHRAY2FycyA9IF8uZHJvcCBAY2FycywgLWRpZmZcblx0XHRlbHNlXG5cdFx0XHRmb3IgaSBpbiBbMC4uLmRpZmZdXG5cdFx0XHRcdEBjYXJzLnB1c2ggbmV3IENhcigpXG5cblx0XHRmb3IgY2FyLGkgaW4gQGNhcnNcblx0XHRcdGNlbGwgPSBAY2hvb3NlX2NlbGwgQGNlbGxzW01hdGguZmxvb3IoaS9udW1fY2FycypudW1fY2VsbHMpXVxuXHRcdFx0Y2VsbC5yZWNlaXZlIGNhclxuXG5cdG1ha2Vfc2lnbmFsczotPlxuXHRcdHtudW1fc2lnbmFscyxudW1fY2VsbHN9ID0gU1xuXHRcdGNlbGwuY2xlYXJfc2lnbmFsKCkgZm9yIGNlbGwgaW4gQGNlbGxzXG5cdFx0bCA9IEBzaWduYWxzLmxlbmd0aFxuXHRcdGRpZmYgPSBudW1fc2lnbmFscyAtIGxcblx0XHRpZiBkaWZmPDBcblx0XHRcdEBzaWduYWxzID0gXy5kcm9wIEBzaWduYWxzLCAtZGlmZlxuXHRcdGVsc2Vcblx0XHRcdGZvciBpIGluIFswLi4uZGlmZl1cblx0XHRcdFx0QHNpZ25hbHMucHVzaCBuZXcgU2lnbmFsIGwraVxuXG5cdFx0Zm9yIHNpZ25hbCxpIGluIEBzaWduYWxzXG5cdFx0XHRzaWduYWwucmVzZXQoKVxuXHRcdFx0d2hpY2ggPSBNYXRoLmZsb29yKGkvbnVtX3NpZ25hbHMqbnVtX2NlbGxzKVxuXHRcdFx0QGNlbGxzW3doaWNoXS5zZXRfc2lnbmFsIHNpZ25hbFxuXG5cdHJlc2V0X3NpZ25hbHM6LT5cblx0XHRzaWduYWwucmVzZXQoKSBmb3Igc2lnbmFsIGluIEBzaWduYWxzXG5cblx0dGljazotPlxuXHRcdEMgPSBAY2VsbHNcblx0XHRxPTBcblxuXHRcdHNpZ25hbC50aWNrKCkgZm9yIHNpZ25hbCBpbiBAc2lnbmFsc1xuXG5cdFx0Zm9yIGNlbGwgaW4gQ1xuXHRcdFx0aWYgY2VsbC5jYXJcblx0XHRcdFx0aWYgY2VsbC5uZXh0LmlzX2ZyZWUoKVxuXHRcdFx0XHRcdGNlbGwubmV4dC5yZWNlaXZlIGNlbGwuY2FyXG5cdFx0XHRcdFx0Y2VsbC5yZW1vdmUoKVxuXHRcdFx0XHRcdHErK1xuXG5cdFx0Y2VsbC5maW5hbGl6ZSgpIGZvciBjZWxsIGluIEBjZWxsc1xuXHRcdEBtZW1vcnkucmVtZW1iZXIgcSxAY2Fycy5sZW5ndGhcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFmZmljXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbnJlcXVpcmUgJy4vaGVscGVycydcblxuY2xhc3MgU2V0dGluZ3Ncblx0Y29uc3RydWN0b3I6LT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0bnVtX2NlbGxzOiAxMDAwXG5cdFx0XHRfbnVtX2NhcnM6IDMwMFxuXHRcdFx0X2s6IDMwMC8xMDAwXG5cdFx0XHRfbnVtX3NpZ25hbHM6IDUwXG5cdFx0XHRfb2Zmc2V0OiAuM1xuXHRcdFx0X2Q6IDEwMDAvNTBcblx0XHRcdGtqOiAxXG5cdFx0XHRfazA6IDEvM1xuXHRcdFx0dGltZTogMFxuXHRcdFx0cmVkOiAuMDJcblx0XHRcdGN5Y2xlOiA1MFxuXHRcdFx0dmY6IDFcblxuXHRcdEBrMCA9IDEvM1xuXG5cdFx0QGNvbG9ycyA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIF8ucmFuZ2UgMCxAbnVtX2NlbGxzLEBudW1fY2VsbHMvNlxuXHRcdFx0LnJhbmdlIFtcblx0XHRcdFx0JyNGNDQzMzYnLCAjcmVkXG5cdFx0XHRcdCcjMjE5NkYzJywgI2JsdWVcblx0XHRcdFx0JyNFOTFFNjMnLCAjcGlua1xuXHRcdFx0XHQnIzAwQkNENCcsICNjeWFuXG5cdFx0XHRcdCcjRkZDMTA3JywgI2FtYmVyXG5cdFx0XHRcdCcjNENBRjUwJywgI2dyZWVuXG5cdFx0XHRcdF1cblxuXHRcdEBzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLEBudW1fY2VsbHNdXG5cdFx0XHQucmFuZ2UgWzAsMzYwXVxuXG5cdEBwcm9wZXJ0eSAncTAnLFxuXHRcdGdldDotPlxuXHRcdFx0QF9rMFxuXG5cdEBwcm9wZXJ0eSAnazAnLFxuXHRcdGdldDotPlxuXHRcdFx0QF9rMFxuXHRcdHNldDogKGswKS0+XG5cdFx0XHRAX2swID0gMS9NYXRoLnJvdW5kKDEvazApXG5cdFx0XHRAdyA9IEBfazAvKEBraiAtIEBfazApXG5cblx0QHByb3BlcnR5ICdudW1fY2FycycsIFxuXHRcdGdldDotPlxuXHRcdFx0QF9udW1fY2Fyc1xuXHRcdHNldDoobnVtX2NhcnMpLT5cblx0XHRcdEBfbnVtX2NhcnMgPSBNYXRoLnJvdW5kIG51bV9jYXJzXG5cdFx0XHRAX2sgPSBAX251bV9jYXJzL0BudW1fY2VsbHNcblxuXHRAcHJvcGVydHkgJ2snLFxuXHRcdGdldDotPlxuXHRcdFx0QF9rXG5cdFx0c2V0OihrKS0+XG5cdFx0XHRAX2sgPSBrXG5cdFx0XHRAX251bV9jYXJzID0gTWF0aC5yb3VuZCBrKkBudW1fY2VsbHNcblxuXHRAcHJvcGVydHkgJ2RlbHRhJyxcblx0XHRnZXQ6IC0+XG5cdFx0XHRAX29mZnNldCpAY3ljbGVcblxuXHRAcHJvcGVydHkgJ3JlZF90aW1lJyxcblx0XHRnZXQ6LT5cblx0XHRcdEBjeWNsZSAqIEByZWRcblxuXHRAcHJvcGVydHkgJ2QnLCBcblx0XHRnZXQ6LT5cblx0XHRcdEBfZFxuXHRcdHNldDooZCktPlxuXHRcdFx0QF9udW1fc2lnbmFscyA9IE1hdGgucm91bmQgQG51bV9jZWxscy9kXG5cdFx0XHRAX2QgPSBAbnVtX2NlbGxzL0BfbnVtX3NpZ25hbHNcblx0XHRcdEBfb2Zmc2V0ID0gTWF0aC5yb3VuZChAX29mZnNldCAqIEBfbnVtX3NpZ25hbHMpL0BfbnVtX3NpZ25hbHNcblxuXHRAcHJvcGVydHkgJ251bV9zaWduYWxzJyxcblx0XHRnZXQ6LT5cblx0XHRcdEBfbnVtX3NpZ25hbHNcblx0XHRzZXQ6IChudW1fc2lnbmFscyktPlxuXHRcdFx0QF9udW1fc2lnbmFscyA9IG51bV9zaWduYWxzXG5cdFx0XHRAX2QgPSBNYXRoLnJvdW5kIEBudW1fY2VsbHMvQF9udW1fc2lnbmFsc1xuXHRcdFx0QF9vZmZzZXQgPSBNYXRoLnJvdW5kKEBfb2Zmc2V0ICogQF9udW1fc2lnbmFscykvQF9udW1fc2lnbmFsc1xuXG5cdEBwcm9wZXJ0eSAnb2Zmc2V0Jyxcblx0XHRnZXQ6LT5cblx0XHRcdEBfb2Zmc2V0XG5cdFx0c2V0OihvZmZzZXQpLT5cblx0XHRcdEBfb2Zmc2V0ID0gTWF0aC5yb3VuZChvZmZzZXQgKiBAX251bV9zaWduYWxzKS9AX251bV9zaWduYWxzXG5cblx0YWR2YW5jZTogLT5cblx0XHRAdGltZSsrXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFNldHRpbmdzKCkiXX0=
