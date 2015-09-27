(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Car, Ctrl, S, Solver, Traffic, _, angular, carDer, d3, visDer;

angular = require('angular');

d3 = require('d3');

_ = require('lodash');

S = require('./settings');

Traffic = require('./models/traffic');

Car = require('./models/car');

Solver = require('./models/solver');

Ctrl = (function() {
  function Ctrl(scope1) {
    this.scope = scope1;
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

carDer = function() {
  var directive;
  return directive = {
    scope: {
      cars: '='
    },
    link: function(scope, el, attr) {
      var sel, update;
      sel = d3.select(el[0]).select('.cars');
      scope.$on('tick', function() {
        return sel.selectAll('.g-car').data(scope.cars, function(d) {
          return d.id;
        }).attr('transform', function(d) {
          return "rotate(" + (S.scale(d.loc)) + ") translate(0,50)";
        });
      });
      update = function() {
        var cars, new_cars;
        cars = sel.selectAll('.g-car').data(scope.cars, function(d) {
          return d.id;
        });
        new_cars = cars.enter().append('g').attr({
          "class": 'g-car'
        });
        cars.exit().remove();
        return new_cars.append('rect').attr({
          width: .2,
          height: 2,
          y: -1,
          x: -.1,
          fill: function(d) {
            return d.color;
          }
        });
      };
      return scope.$watch('cars.length', update);
    }
  };
};

angular.module('mainApp', [require('angular-material', require('angular-animate'))]).directive('visDer', visDer).directive('datum', require('./directives/datum')).directive('d3Der', require('./directives/d3Der')).directive('mfdChart', require('./mfd')).directive('horAxis', require('./directives/xAxis')).directive('verAxis', require('./directives/yAxis')).directive('sliderDer', require('./directives/slider')).directive('shifter', require('./directives/shifter')).directive('carDer', carDer);



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
    this.hor = d3.scale.linear().domain([0, .5]).range([0, this.width]);
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
    this.been_free = 0;
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
    return car.cell = this;
  };

  Cell.prototype.remove = function() {
    this.been_free = 0;
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
    return this.been_free > (1 / S.kj);
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
    return ref = [0, 0, -1], this.q = ref[0], this.k = ref[1], this.i = ref[2], ref;
  };

  Memory.prototype.span = 50;

  Memory.prototype.remember = function(q, k) {
    this.i++;
    this.q += q;
    this.k += k;
    if (this.i > this.span) {
      this.long_term.push({
        q: this.q / (this.span * S.num_cells),
        k: this.k / (this.span * S.num_cells),
        id: _.uniqueId('memory-')
      });
      this.reset();
      if (this.long_term > 50) {
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
    this.make_signals();
    this.cars = [];
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
    var car, cell, i, j, l, len, num_cars, num_cells, ref, ref1, results, which;
    ref = this.cells;
    for (j = 0, len = ref.length; j < len; j++) {
      cell = ref[j];
      cell.remove();
    }
    this.cars = [];
    num_cars = S.num_cars;
    num_cells = S.num_cells;
    results = [];
    for (i = l = 0, ref1 = num_cars; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
      car = new Car();
      this.cars.push(car);
      which = Math.floor(i / num_cars * num_cells);
      cell = this.choose_cell(this.cells[which]);
      results.push(cell.receive(car));
    }
    return results;
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
    var C, cell, i, j, l, len, len1, len2, m, q, ref, ref1, signal;
    C = this.cells;
    q = 0;
    ref = this.signals;
    for (j = 0, len = ref.length; j < len; j++) {
      signal = ref[j];
      signal.tick();
    }
    for (i = l = 0, len1 = C.length; l < len1; i = ++l) {
      cell = C[i];
      if (cell.car) {
        if (cell.next.is_free()) {
          cell.next.receive(cell.car);
          cell.remove();
          q++;
        }
      }
    }
    ref1 = this.cells;
    for (m = 0, len2 = ref1.length; m < len2; m++) {
      cell = ref1[m];
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
      _kj: 1 / 3,
      _k0: 1 / 9,
      time: 0,
      red: .02,
      cycle: 50,
      vf: 1
    });
    this.kj = 1 / 3;
    this.colors = d3.scale.linear().domain(_.range(0, this.num_cells, this.num_cells / 6)).range(['#F44336', '#2196F3', '#E91E63', '#00BCD4', '#FFC107', '#4CAF50']);
    this.scale = d3.scale.linear().domain([0, this.num_cells]).range([0, 360]);
  }

  Settings.property('q0', {
    get: function() {
      return this._k0;
    }
  });

  Settings.property('kj', {
    get: function() {
      return this._kj;
    },
    set: function(kj) {
      this._kj = kj;
      return this.w = this._k0 / (this._kj - this._k0);
    }
  });

  Settings.property('k0', {
    get: function() {
      return this._k0;
    },
    set: function(k0) {
      this._k0 = k0;
      return this.w = this._k0 / (this._kj - this._k0);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL2FwcC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL2RpcmVjdGl2ZXMvZDNEZXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9kaXJlY3RpdmVzL2RhdHVtLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvZGlyZWN0aXZlcy9zaGlmdGVyLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvZGlyZWN0aXZlcy9zbGlkZXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9kaXJlY3RpdmVzL3hBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvZGlyZWN0aXZlcy95QXhpcy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL2hlbHBlcnMuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9tZmQuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9tb2RlbHMvY2FyLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvbW9kZWxzL2NlbGwuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3ZhcmlhdGlvbmFsL2FwcC9tb2RlbHMvc2lnbmFsLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvbW9kZWxzL3NvbHZlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvdmFyaWF0aW9uYWwvYXBwL21vZGVscy90cmFmZmljLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC92YXJpYXRpb25hbC9hcHAvc2V0dGluZ3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQTs7QUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1YsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztBQUNMLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7QUFDSixDQUFBLEdBQUksT0FBQSxDQUFRLFlBQVI7O0FBQ0osT0FBQSxHQUFVLE9BQUEsQ0FBUSxrQkFBUjs7QUFDVixHQUFBLEdBQU0sT0FBQSxDQUFRLGNBQVI7O0FBQ04sTUFBQSxHQUFTLE9BQUEsQ0FBUSxpQkFBUjs7QUFFSDtFQUNPLGNBQUMsTUFBRDtJQUFDLElBQUMsQ0FBQSxRQUFEO0lBQ1osQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQ0M7TUFBQSxNQUFBLEVBQVEsSUFBUjtNQUNBLE9BQUEsRUFBUyxJQUFJLE9BRGI7TUFFQSxNQUFBLEVBQVEsSUFBSSxNQUZaO0tBREQ7SUFLQSxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsR0FBaUIsSUFBQyxDQUFBO0lBRWxCLElBQUMsQ0FBQSxLQUFLLENBQUMsQ0FBUCxHQUFXO0lBRVgsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsWUFBZCxFQUE0QixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7UUFDM0IsS0FBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULENBQUE7ZUFDQSxLQUFDLENBQUEsV0FBRCxHQUFlLEtBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFBO01BRlk7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVCO0lBSUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsZUFBZCxFQUErQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7UUFDOUIsS0FBQyxDQUFBLE9BQU8sQ0FBQyxZQUFULENBQUE7ZUFDQSxLQUFDLENBQUEs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Q0gsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJLENBQUMsS0FBTCxDQUFXLE1BQUEsR0FBUyxJQUFDLENBQUEsWUFBckIsQ0FBQSxHQUFtQyxJQUFDLENBQUE7SUFENUMsQ0FGSjtHQUREOztxQkFNQSxPQUFBLEdBQVMsU0FBQTtXQUNSLElBQUMsQ0FBQSxJQUFEO0VBRFE7Ozs7OztBQUdWLE1BQU0sQ0FBQyxPQUFQLEdBQXFCLElBQUEsUUFBQSxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblRyYWZmaWMgPSByZXF1aXJlICcuL21vZGVscy90cmFmZmljJ1xuQ2FyID0gcmVxdWlyZSAnLi9tb2RlbHMvY2FyJ1xuU29sdmVyID0gcmVxdWlyZSAnLi9tb2RlbHMvc29sdmVyJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0cGF1c2VkOiB0cnVlXG5cdFx0XHR0cmFmZmljOiBuZXcgVHJhZmZpY1xuXHRcdFx0c29sdmVyOiBuZXcgU29sdmVyXG5cdFx0XHRcblx0XHRAc2NvcGUudHJhZmZpYyA9IEB0cmFmZmljXG5cblx0XHRAc2NvcGUuUyA9IFNcblxuXHRcdEBzY29wZS4kd2F0Y2ggJ1MubnVtX2NhcnMnLCA9PlxuXHRcdFx0QHRyYWZmaWMubWFrZV9jYXJzKClcblx0XHRcdEBkYXRhX3RoZW9yeSA9IEBzb2x2ZXIuZmluZF9tZmQoKVxuXG5cdFx0QHNjb3BlLiR3YXRjaCAnUy5udW1fc2lnbmFscycsID0+XG5cdFx0XHRAdHJhZmZpYy5tYWtlX3NpZ25hbHMoKVxuXHRcdFx0QGRhdGFfdGhlb3J5ID0gQHNvbHZlci5maW5kX21mZCgpXG5cblx0XHRAc2NvcGUuJHdhdGNoICdTLm9mZnNldCArIFMuY3ljbGUgKyBTLnJlZCcsPT5cblx0XHRcdEB0cmFmZmljLnJlc2V0X3NpZ25hbHMoKVxuXHRcdFx0QGRhdGFfdGhlb3J5ID0gQHNvbHZlci5maW5kX21mZCgpXG5cblx0XHRAc2NvcGUuJHdhdGNoICdTLnEwICsgUy53Jyw9PlxuXHRcdFx0QGRhdGFfdGhlb3J5ID0gQHNvbHZlci5maW5kX21mZCgpXG5cdFx0XG5cdHJvdGF0b3I6IChjYXIpLT4gXCJyb3RhdGUoI3tTLnNjYWxlKGNhci5sb2MpfSkgdHJhbnNsYXRlKDAsNTApXCJcblxuXHRjbGljazogKHZhbCkgLT4gaWYgIXZhbCB0aGVuIEBwbGF5KClcblx0cGF1c2U6IC0+IEBwYXVzZWQgPSB0cnVlXG5cdHRpY2s6IC0+XG5cdFx0ZDMudGltZXIgPT5cblx0XHRcdFx0IyBTLmFkdmFuY2UoKVxuXHRcdFx0XHRAdHJhZmZpYy50aWNrKClcblx0XHRcdFx0IyBAc2NvcGUuJGJyb2FkY2FzdCAndGljaydcblx0XHRcdFx0QHNjb3BlLiRldmFsQXN5bmMoKVxuXHRcdFx0XHRAcGF1c2VkXG5cdHBsYXk6IC0+XG5cdFx0QHBhdXNlKClcblx0XHRAcGF1c2VkID0gZmFsc2Vcblx0XHRAdGljaygpXG5cbnZpc0RlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHNjb3BlOiB7fVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L3Zpcy5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgQ3RybF1cblxuY2FyRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6XG5cdFx0XHRjYXJzOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsZWwsYXR0ciktPlxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5zZWxlY3QgJy5jYXJzJ1xuXG5cdFx0XHRzY29wZS4kb24gJ3RpY2snLC0+XG5cblx0XHRcdFx0c2VsLnNlbGVjdEFsbCAnLmctY2FyJ1xuXHRcdFx0XHRcdC5kYXRhIHNjb3BlLmNhcnMsIChkKS0+IGQuaWRcblx0XHRcdFx0XHQuYXR0ciAndHJhbnNmb3JtJywgKGQpLT5cInJvdGF0ZSgje1Muc2NhbGUoZC5sb2MpfSkgdHJhbnNsYXRlKDAsNTApXCJcblxuXHRcdFx0dXBkYXRlID0gLT5cblx0XHRcdFx0Y2FycyA9IHNlbC5zZWxlY3RBbGwgJy5nLWNhcidcdFx0XG5cdFx0XHRcdFx0LmRhdGEgc2NvcGUuY2FycywgKGQpLT4gZC5pZFxuXG5cdFx0XHRcdG5ld19jYXJzID0gY2Fycy5lbnRlcigpXG5cdFx0XHRcdFx0LmFwcGVuZCAnZydcblx0XHRcdFx0XHQuYXR0clxuXHRcdFx0XHRcdFx0Y2xhc3M6ICdnLWNhcidcblx0XHRcdFx0XHRcdCMgdHJhbnNmb3JtOiAoZCktPlwicm90YXRlKCN7Uy5zY2FsZShkLmxvYyl9KSB0cmFuc2xhdGUoMCw1MClcIlxuXG5cdFx0XHRcdGNhcnMuZXhpdCgpLnJlbW92ZSgpXG5cdFx0XHRcdFx0XG5cdFx0XHRcdG5ld19jYXJzLmFwcGVuZCAncmVjdCdcblx0XHRcdFx0XHQuYXR0clxuXHRcdFx0XHRcdFx0d2lkdGg6IC4yXG5cdFx0XHRcdFx0XHRoZWlnaHQ6IDJcblx0XHRcdFx0XHRcdHk6IC0xXG5cdFx0XHRcdFx0XHR4OiAtLjFcblx0XHRcdFx0XHRcdGZpbGw6IChkKS0+ZC5jb2xvclxuXG5cdFx0XHRcdCMgY2Fycy5hdHRyICd0cmFuc2Zvcm0nLCAoZCktPlwicm90YXRlKCN7Uy5zY2FsZShkLmxvYyl9KSB0cmFuc2xhdGUoMCw1MClcIlxuXG5cdFx0XHRzY29wZS4kd2F0Y2ggJ2NhcnMubGVuZ3RoJywgdXBkYXRlXG5cblxuYW5ndWxhci5tb2R1bGUgJ21haW5BcHAnICwgW3JlcXVpcmUgJ2FuZ3VsYXItbWF0ZXJpYWwnICwgcmVxdWlyZSAnYW5ndWxhci1hbmltYXRlJ11cblx0LmRpcmVjdGl2ZSAndmlzRGVyJywgdmlzRGVyXG5cdC5kaXJlY3RpdmUgJ2RhdHVtJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL2RhdHVtJ1xuXHQuZGlyZWN0aXZlICdkM0RlcicsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9kM0Rlcidcblx0LmRpcmVjdGl2ZSAnbWZkQ2hhcnQnLCByZXF1aXJlICcuL21mZCdcblx0LmRpcmVjdGl2ZSAnaG9yQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy94QXhpcydcblx0LmRpcmVjdGl2ZSAndmVyQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy95QXhpcydcblx0LmRpcmVjdGl2ZSAnc2xpZGVyRGVyJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3NsaWRlcidcblx0LmRpcmVjdGl2ZSAnc2hpZnRlcicscmVxdWlyZSAnLi9kaXJlY3RpdmVzL3NoaWZ0ZXInXG5cdC5kaXJlY3RpdmUgJ2NhckRlcicsIGNhckRlclxuIiwiZDMgPSByZXF1aXJlICdkMydcbmFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuXG5kZXIgPSAoJHBhcnNlKS0+ICNnb2VzIG9uIGEgc3ZnIGVsZW1lbnRcblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGQzRGVyOiAnPSdcblx0XHRcdHRyYW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0dSA9ICd0LScgKyBNYXRoLnJhbmRvbSgpXG5cdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSBmYWxzZVxuXHRcdFx0c2NvcGUuJHdhdGNoICdkM0Rlcidcblx0XHRcdFx0LCAodiktPlxuXHRcdFx0XHRcdGlmIHNjb3BlLnRyYW4gYW5kIGhhc1RyYW5zaXRpb25lZFxuXHRcdFx0XHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gdHJ1ZVxuXHRcdFx0XHRcdFx0c2VsLnRyYW5zaXRpb24gdVxuXHRcdFx0XHRcdFx0XHQuYXR0ciB2XG5cdFx0XHRcdFx0XHRcdC5jYWxsIHNjb3BlLnRyYW5cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSB0cnVlXG5cdFx0XHRcdFx0XHRzZWwuYXR0ciB2XG5cdFx0XHRcdCwgdHJ1ZVxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJtb2R1bGUuZXhwb3J0cyA9ICgkcGFyc2UpLT5cblx0KHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdGQzLnNlbGVjdChlbFswXSkuZGF0dW0gJHBhcnNlKGF0dHIuZGF0dW0pKHNjb3BlKSIsImQzID0gcmVxdWlyZSAnZDMnXG5cbmRlciA9ICgkcGFyc2UpLT5cblx0ZGlyZWN0aXZlID1cblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHR1ID0gJ3QtJyArIE1hdGgucmFuZG9tKClcblx0XHRcdHRyYW4gPSAkcGFyc2UoYXR0ci50cmFuKShzY29wZSlcblx0XHRcdHJlc2hpZnQgPSAodiktPiBcblx0XHRcdFx0aWYgdHJhblxuXHRcdFx0XHRcdHNlbC50cmFuc2l0aW9uIHVcblx0XHRcdFx0XHRcdC5hdHRyICd0cmFuc2Zvcm0nICwgXCJ0cmFuc2xhdGUoI3t2WzBdfSwje3ZbMV19KVwiXG5cdFx0XHRcdFx0XHQuY2FsbCB0cmFuXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRzZWwuYXR0ciAndHJhbnNmb3JtJyAsIFwidHJhbnNsYXRlKCN7dlswXX0sI3t2WzFdfSlcIlxuXG5cdFx0XHRzY29wZS4kd2F0Y2ggLT5cblx0XHRcdFx0XHQkcGFyc2UoYXR0ci5zaGlmdGVyKShzY29wZSlcblx0XHRcdFx0LCByZXNoaWZ0XG5cdFx0XHRcdCwgdHJ1ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImRlciA9IC0+XG5cdHJlcyA9IFxuXHRcdHNjb3BlOiBcblx0XHRcdGxhYmVsOiAnQCdcblx0XHRcdG15RGF0YTogJz0nXG5cdFx0XHRtaW46ICc9J1xuXHRcdFx0bWF4OiAnPSdcblx0XHRcdHN0ZXA6ICc9J1xuXHRcdCMgY29udHJvbGxlckFzOiAndm0nXG5cdFx0cmVwbGFjZTogdHJ1ZVxuXHRcdCMgY29udHJvbGxlcjogLT5cblx0XHQjIGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC9zbGlkZXIuaHRtbCdcblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZnVuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzY2FsZSA9IHNjb3BlLmZ1bi5zY2FsZSgpXG5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuY2xhc3NlZCAnaG9yIGF4aXMnLCB0cnVlXG5cblx0XHRcdHNlbC5jYWxsIHNjb3BlLmZ1blxuXHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5cbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRzY29wZTogXG5cdFx0XHRmdW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNjYWxlID0gc2NvcGUuZnVuLnNjYWxlKClcblxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5jbGFzc2VkICd2ZXIgYXhpcycsIHRydWVcblxuXHRcdFx0c2VsLmNhbGwgc2NvcGUuZnVuXG5cdFx0XHRcbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiJ3VzZSBzdHJpY3QnXG5cbkZ1bmN0aW9uOjpwcm9wZXJ0eSA9IChwcm9wLCBkZXNjKSAtPlxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgcHJvcCwgZGVzYyIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxlbCktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHR3aWR0aDogMzAwXG5cdFx0XHRoZWlnaHQ6IDMwMFxuXHRcdFx0bTogXG5cdFx0XHRcdHQ6IDEwXG5cdFx0XHRcdGw6IDQwXG5cdFx0XHRcdHI6IDE4XG5cdFx0XHRcdGI6IDM1XG5cblx0XHRAaG9yID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdFx0LmRvbWFpbiBbMCwuNV1cblx0XHRcdFx0LnJhbmdlIFswLEB3aWR0aF1cblxuXHRcdEB2ZXIgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCwgLjVdXG5cdFx0XHQucmFuZ2UgW0BoZWlnaHQsIDBdXG5cblx0XHRAbGluZSA9IGQzLnN2Zy5saW5lKClcblx0XHRcdC54IChkKT0+QGhvciBkLmtcblx0XHRcdC55IChkKT0+QHZlciBkLnFcblx0XHRcdC5kZWZpbmVkIChkKS0+ZC5xPjBcblxuXHRcdEBob3JBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEBob3Jcblx0XHRcdC5vcmllbnQgJ2JvdHRvbSdcblx0XHRcdC50aWNrcyA4XG5cblx0XHRAdmVyQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAdmVyXG5cdFx0XHQub3JpZW50ICdsZWZ0J1xuXG5cdGQ6IC0+XG5cdFx0QGxpbmUgQGRhdGFcblx0XG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZGF0YTogJz0nXG5cdFx0XHRtZW1vcnk6ICc9J1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L21mZENoYXJ0Lmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsIlMgPSByZXF1aXJlICcuLi9zZXR0aW5ncydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5cbm4gPSAwXG5cbmNsYXNzIENhclxuXHRjb25zdHJ1Y3RvcjotPlxuXHRcdEBpZCA9IG4rK1xuXHRcdEBjb2xvciA9IF8uc2FtcGxlIFMuY29sb3JzLnJhbmdlKClcblxuXHRzZXRfbG9jOiAoQGxvYyktPlxuXG5tb2R1bGUuZXhwb3J0cyA9IENhciIsIlMgPSByZXF1aXJlICcuLi9zZXR0aW5ncydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5cbmNsYXNzIENlbGxcblx0Y29uc3RydWN0b3I6IChAbG9jKS0+XG5cdFx0QGJlZW5fZnJlZSA9IDBcblx0XHRAdGVtcF9jYXIgPSBAY2FyID0gZmFsc2Vcblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdjZWxsJ1xuXHRcdEBzaWduYWwgPSB1bmRlZmluZWRcblxuXHRzZXRfc2lnbmFsOiAoQHNpZ25hbCktPlxuXHRcdEBzaWduYWwubG9jID0gQGxvY1xuXHRcdEBzaWduYWwuY2VsbCA9IHRoaXNcblxuXHRjbGVhcl9zaWduYWw6IC0+XG5cdFx0QHNpZ25hbCA9IHVuZGVmaW5lZFxuXG5cdHJlY2VpdmU6KGNhciktPlxuXHRcdGNhci5zZXRfbG9jIEBsb2Ncblx0XHRAdGVtcF9jYXIgPSBjYXJcblx0XHRjYXIuY2VsbCA9IHRoaXNcblxuXHRyZW1vdmU6IC0+XG5cdFx0QGJlZW5fZnJlZSA9IDBcblx0XHRAdGVtcF9jYXIgPSBAY2FyID0gZmFsc2VcblxuXHRmaW5hbGl6ZTogLT5cblx0XHRAY2FyID0gQHRlbXBfY2FyXG5cdFx0aWYgQGNhclxuXHRcdFx0QGJlZW5fZnJlZT0wXG5cdFx0ZWxzZVxuXHRcdFx0QGJlZW5fZnJlZSsrXG5cblx0aXNfZnJlZTogLT5cblx0XHQjIGlmIEBzaWduYWxcblx0XHQjIFx0cmV0dXJuIChAc2lnbmFsLmdyZWVuIGFuZCAoQGJlZW5fZnJlZT4oMS9TLmtqKSkpXG5cdFx0IyBlbHNlXG5cdFx0QGJlZW5fZnJlZT4oMS9TLmtqKVxuXG5tb2R1bGUuZXhwb3J0cyA9IENlbGwiLCJTID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuXG5jbGFzcyBTaWduYWxcblx0Y29uc3RydWN0b3I6IChAaSkgLT5cblx0XHRAY291bnQgPSAwXG5cdFx0QGdyZWVuID0gdHJ1ZVxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ3NpZ25hbC0nXG5cdFx0QHJlc2V0KClcblxuXHRyZXNldDogLT5cblx0XHRAb2Zmc2V0ID0gUy5jeWNsZSooKEBpKlMub2Zmc2V0KSUxKVxuXHRcdFtAY291bnQsIEBncmVlbl0gPSBbQG9mZnNldCwgdHJ1ZV1cblxuXHR0aWNrOiAtPlxuXHRcdEBjb3VudCsrXG5cdFx0aWYgQGNvdW50ID4gUy5jeWNsZVxuXHRcdFx0W0Bjb3VudCwgQGdyZWVuXSA9IFswLCB0cnVlXVxuXHRcdGlmIChAY291bnQpPj0oKDEtUy5yZWQpKlMuY3ljbGUpXG5cdFx0XHRAZ3JlZW4gPSBmYWxzZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpZ25hbCIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4uL3NldHRpbmdzJ1xuXG5jbGFzcyBMaWdodFxuXHRjb25zdHJ1Y3RvcjooQGwpLT5cblx0XHRAeCA9IFMuZCAqIEBsXG5cblx0aW50ZXJzZWN0Oih0KS0+XG5cdFx0b2Zmc2V0ID0gUy5kZWx0YSpAbFxuXHRcdGxlZnRvdmVyID0gKHQrb2Zmc2V0KSVTLmN5Y2xlXG5cdFx0aWYgbGVmdG92ZXI8KFMucmVkKlMuY3ljbGUpXG5cdFx0XHQwXG5cdFx0ZWxzZVxuXHRcdFx0Uy5jeWNsZS1sZWZ0b3ZlclxuXG5jbGFzcyBTb2x2ZXJcblx0Y29uc3RydWN0b3I6IC0+XG5cblx0bWFrZV90YWJsZTotPlxuXHRcdHJlZF90aW1lID0gUy5yZWRfdGltZVxuXHRcdGtqID0gUy5ralxuXHRcdHJlcyA9IFtdXG5cdFx0W3RpbWVfc3RvcHBlZCxsXSA9IFsxMDAwLC0xXVxuXHRcdHdoaWxlIHRpbWVfc3RvcHBlZD4wIGFuZCArK2w8NTBcblx0XHRcdGxpZ2h0ID0gbmV3IExpZ2h0IGxcblx0XHRcdHRpbWVfdHJhdmVsaW5nID0gbGlnaHQueC9TLnZmXG5cdFx0XHR0aW1lX2Fycml2YWwgPSByZWRfdGltZSArIHRpbWVfdHJhdmVsaW5nXG5cdFx0XHR0aW1lX3N0b3BwZWQgPSBsaWdodC5pbnRlcnNlY3QgdGltZV9hcnJpdmFsXG5cdFx0XHRyZXMucHVzaCBcblx0XHRcdFx0eDogbGlnaHQueFxuXHRcdFx0XHR0OiB0aW1lX2Fycml2YWwrdGltZV9zdG9wcGVkXG5cdFx0XHRcdGc6IHRpbWVfc3RvcHBlZFxuXHRcdFx0XHRsOiBsaWdodC5sXG5cdFx0XHRcdGM6IFMucTAqdGltZV9zdG9wcGVkXG5cblx0XHRbdGltZV9zdG9wcGVkLGxdID0gWzEwMDAsMF1cblx0XHR3aGlsZSB0aW1lX3N0b3BwZWQ+MCBhbmQgLS1sPi01MFxuXHRcdFx0bGlnaHQgPSBuZXcgTGlnaHQgbFxuXHRcdFx0dGltZV90cmF2ZWxpbmc9IC1saWdodC54L1Mud1xuXHRcdFx0dGltZV9hcnJpdmFsID0gcmVkX3RpbWUgKyB0aW1lX3RyYXZlbGluZ1xuXHRcdFx0dGltZV9zdG9wcGVkID0gbGlnaHQuaW50ZXJzZWN0IHRpbWVfYXJyaXZhbFxuXHRcdFx0cmVzLnB1c2hcblx0XHRcdFx0eDogbGlnaHQueFxuXHRcdFx0XHR0OiB0aW1lX2Fycml2YWwgKyB0aW1lX3N0b3BwZWRcblx0XHRcdFx0ZzogdGltZV9zdG9wcGVkXG5cdFx0XHRcdGw6IGxcblx0XHRcdFx0YzogLWxpZ2h0Lngqa2ogKyBTLnEwKnRpbWVfc3RvcHBlZFxuXHRcdHJlc1xuXG5cdGZpbmRfbWluOiAoayx0YWJsZSktPlxuXHRcdGZsb3cgPSBJbmZpbml0eVxuXHRcdHJlcyA9IHt9XG5cdFx0Zm9yIGUgaW4gdGFibGVcblx0XHRcdGZsb3dfbCA9IChlLmMgKyBrKmUueCkvKGUudClcblx0XHRcdGlmIGZsb3dfbDw9Zmxvd1xuXHRcdFx0XHRmbG93ID0gZmxvd19sXG5cdFx0XHRcdHJlcyA9IF8uY2xvbmUgZVxuXHRcdHJlcy5rID0ga1xuXHRcdHJlcy5xID0gZmxvd1xuXHRcdHJldHVybiByZXNcblxuXHRmaW5kX21mZDotPlxuXHRcdHRhYmxlID0gQG1ha2VfdGFibGUoKVxuXHRcdHJlcyA9IChAZmluZF9taW4gayx0YWJsZSBmb3IgayBpbiBfLnJhbmdlIDAsNSwuMDEpXG5cbm1vZHVsZS5leHBvcnRzID0gU29sdmVyIiwiUyA9IHJlcXVpcmUgJy4uL3NldHRpbmdzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbkNhciA9IHJlcXVpcmUgJy4vY2FyJ1xuU2lnbmFsID0gcmVxdWlyZSAnLi9zaWduYWwnXG5DZWxsID0gcmVxdWlyZSAnLi9jZWxsJ1xuXG5cbmNsYXNzIE1lbW9yeVxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAbG9uZ190ZXJtID0gW11cblx0XHRAcmVzZXQoKVxuXHRyZXNldDotPlxuXHRcdFtAcSxAayxAaV0gPSBbMCwwLC0xXVxuXG5cdHNwYW46IDUwXG5cblx0cmVtZW1iZXI6KHEsayktPlxuXHRcdEBpKytcblx0XHRAcSs9cVxuXHRcdEBrKz1rXG5cdFx0aWYgQGk+QHNwYW5cblx0XHRcdEBsb25nX3Rlcm0ucHVzaCBcblx0XHRcdFx0cTogQHEvKEBzcGFuKlMubnVtX2NlbGxzKVxuXHRcdFx0XHRrOiBAay8oQHNwYW4qUy5udW1fY2VsbHMpXG5cdFx0XHRcdGlkOiBfLnVuaXF1ZUlkICdtZW1vcnktJ1xuXHRcdFx0QHJlc2V0KClcblx0XHRcdGlmIEBsb25nX3Rlcm0+NTAgdGhlbiBAbG9uZ190ZXJtLnNoaWZ0KClcblxuY2xhc3MgVHJhZmZpY1xuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAY2VsbHMgPSAobmV3IENlbGwgbiBmb3IgbiBpbiBbMC4uLlMubnVtX2NlbGxzXSlcblx0XHRmb3IgY2VsbCxpIGluIEBjZWxsc1xuXHRcdFx0Y2VsbC5uZXh0ID0gQGNlbGxzWyhpKzEpJUBjZWxscy5sZW5ndGhdXG5cdFx0QG1ha2Vfc2lnbmFscygpXG5cdFx0QGNhcnMgPSBbXVxuXHRcdEBtYWtlX2NhcnMoKVxuXHRcdEBtZW1vcnkgPSBuZXcgTWVtb3J5KClcblxuXHRjaG9vc2VfY2VsbDogKGNlbGwpLT5cblx0XHRpZiAhY2VsbC5jYXIgdGhlbiBjZWxsIGVsc2UgQGNob29zZV9jZWxsKGNlbGwubmV4dClcblxuXHRtYWtlX2NhcnM6IC0+XG5cdFx0Y2VsbC5yZW1vdmUoKSBmb3IgY2VsbCBpbiBAY2VsbHNcblx0XHRAY2FycyA9IFtdXG5cdFx0bnVtX2NhcnMgPSBTLm51bV9jYXJzXG5cdFx0bnVtX2NlbGxzID0gUy5udW1fY2VsbHNcblx0XHRmb3IgaSBpbiBbMC4uLm51bV9jYXJzXVxuXHRcdFx0Y2FyID0gbmV3IENhcigpXG5cdFx0XHRAY2Fycy5wdXNoIGNhclxuXHRcdFx0d2hpY2ggPSBNYXRoLmZsb29yKGkvbnVtX2NhcnMqbnVtX2NlbGxzKVxuXHRcdFx0Y2VsbCA9IEBjaG9vc2VfY2VsbCBAY2VsbHNbd2hpY2hdXG5cdFx0XHRjZWxsLnJlY2VpdmUgY2FyXG5cblx0bWFrZV9zaWduYWxzOi0+XG5cdFx0Y2VsbC5jbGVhcl9zaWduYWwoKSBmb3IgY2VsbCBpbiBAY2VsbHNcblx0XHRAc2lnbmFscyA9IFtdXG5cdFx0bnVtX3NpZ25hbHMgPSBTLm51bV9zaWduYWxzXG5cdFx0bnVtX2NlbGxzID0gUy5udW1fY2VsbHNcblx0XHRmb3IgaSBpbiBbMC4uLm51bV9zaWduYWxzXVxuXHRcdFx0c2lnbmFsID0gbmV3IFNpZ25hbCBpXG5cdFx0XHRAc2lnbmFscy5wdXNoIHNpZ25hbFxuXHRcdFx0d2hpY2ggPSBNYXRoLmZsb29yKGkvbnVtX3NpZ25hbHMqbnVtX2NlbGxzKVxuXHRcdFx0QGNlbGxzW3doaWNoXS5zZXRfc2lnbmFsIHNpZ25hbFxuXG5cdHJlc2V0X3NpZ25hbHM6LT5cblx0XHRzaWduYWwucmVzZXQoKSBmb3Igc2lnbmFsIGluIEBzaWduYWxzXG5cblx0dGljazotPlxuXHRcdEMgPSBAY2VsbHNcblx0XHRxPTBcblxuXHRcdHNpZ25hbC50aWNrKCkgZm9yIHNpZ25hbCBpbiBAc2lnbmFsc1xuXG5cdFx0Zm9yIGNlbGwsaSBpbiBDXG5cdFx0XHRpZiBjZWxsLmNhclxuXHRcdFx0XHRpZiBjZWxsLm5leHQuaXNfZnJlZSgpXG5cdFx0XHRcdFx0Y2VsbC5uZXh0LnJlY2VpdmUgY2VsbC5jYXJcblx0XHRcdFx0XHRjZWxsLnJlbW92ZSgpXG5cdFx0XHRcdFx0cSsrXG5cblx0XHRjZWxsLmZpbmFsaXplKCkgZm9yIGNlbGwgaW4gQGNlbGxzXG5cdFx0QG1lbW9yeS5yZW1lbWJlciBxLEBjYXJzLmxlbmd0aFxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYWZmaWNcbiIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xucmVxdWlyZSAnLi9oZWxwZXJzJ1xuXG5jbGFzcyBTZXR0aW5nc1xuXHRjb25zdHJ1Y3RvcjotPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRudW1fY2VsbHM6IDEwMDBcblx0XHRcdF9udW1fY2FyczogMzAwXG5cdFx0XHRfazogMzAwLzEwMDBcblx0XHRcdF9udW1fc2lnbmFsczogNTBcblx0XHRcdF9vZmZzZXQ6IC4zXG5cdFx0XHRfZDogMTAwMC81MFxuXHRcdFx0X2tqOiAxLzNcblx0XHRcdF9rMDogMS85XG5cdFx0XHR0aW1lOiAwXG5cdFx0XHRyZWQ6IC4wMlxuXHRcdFx0Y3ljbGU6IDUwXG5cdFx0XHR2ZjogMVxuXG5cdFx0QGtqID0gMS8zXG5cblx0XHRAY29sb3JzID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gXy5yYW5nZSAwLEBudW1fY2VsbHMsQG51bV9jZWxscy82XG5cdFx0XHQucmFuZ2UgW1xuXHRcdFx0XHQnI0Y0NDMzNicsICNyZWRcblx0XHRcdFx0JyMyMTk2RjMnLCAjYmx1ZVxuXHRcdFx0XHQnI0U5MUU2MycsICNwaW5rXG5cdFx0XHRcdCcjMDBCQ0Q0JywgI2N5YW5cblx0XHRcdFx0JyNGRkMxMDcnLCAjYW1iZXJcblx0XHRcdFx0JyM0Q0FGNTAnLCAjZ3JlZW5cblx0XHRcdFx0XVxuXG5cdFx0QHNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsQG51bV9jZWxsc11cblx0XHRcdC5yYW5nZSBbMCwzNjBdXG5cblx0IyBAcHJvcGVydHkgJ3cnLFxuXHQjIFx0Z2V0Oi0+XG5cblx0QHByb3BlcnR5ICdxMCcsXG5cdFx0Z2V0Oi0+XG5cdFx0XHRAX2swXG5cdFx0XHQjIEB3ID0gQF9rMC8oQF9raiAtIEBfazApXG5cblx0QHByb3BlcnR5ICdraicsXG5cdFx0Z2V0Oi0+XG5cdFx0XHRAX2tqXG5cdFx0c2V0OiAoa2opLT5cblx0XHRcdCMgQF9raiA9IDEvTWF0aC5yb3VuZCgxL2tqKVxuXHRcdFx0QF9raiA9IGtqXG5cdFx0XHRAdyA9IEBfazAvKEBfa2ogLSBAX2swKVxuXG5cdEBwcm9wZXJ0eSAnazAnLFxuXHRcdGdldDotPlxuXHRcdFx0QF9rMFxuXHRcdHNldDogKGswKS0+XG5cdFx0XHQjIEBfazAgPSAxL01hdGgucm91bmQoMS9rMClcblx0XHRcdEBfazAgPSBrMFxuXHRcdFx0IyBAcTAgPSBAdmYqQF9rMFxuXHRcdFx0QHcgPSBAX2swLyhAX2tqIC0gQF9rMClcblxuXG5cdEBwcm9wZXJ0eSAnbnVtX2NhcnMnLCBcblx0XHRnZXQ6LT5cblx0XHRcdEBfbnVtX2NhcnNcblx0XHRzZXQ6KG51bV9jYXJzKS0+XG5cdFx0XHRAX251bV9jYXJzID0gTWF0aC5yb3VuZCBudW1fY2Fyc1xuXHRcdFx0QF9rID0gQF9udW1fY2Fycy9AbnVtX2NlbGxzXG5cblx0QHByb3BlcnR5ICdrJyxcblx0XHRnZXQ6LT5cblx0XHRcdEBfa1xuXHRcdHNldDooayktPlxuXHRcdFx0QF9rID0ga1xuXHRcdFx0QF9udW1fY2FycyA9IE1hdGgucm91bmQgaypAbnVtX2NlbGxzXG5cblx0QHByb3BlcnR5ICdkZWx0YScsXG5cdFx0Z2V0OiAtPlxuXHRcdFx0QF9vZmZzZXQqQGN5Y2xlXG5cblx0QHByb3BlcnR5ICdyZWRfdGltZScsXG5cdFx0Z2V0Oi0+XG5cdFx0XHRAY3ljbGUgKiBAcmVkXG5cblx0QHByb3BlcnR5ICdkJywgXG5cdFx0Z2V0Oi0+XG5cdFx0XHRAX2Rcblx0XHRzZXQ6KGQpLT5cblx0XHRcdEBfbnVtX3NpZ25hbHMgPSBNYXRoLnJvdW5kIEBudW1fY2VsbHMvZFxuXHRcdFx0QF9kID0gQG51bV9jZWxscy9AX251bV9zaWduYWxzXG5cdFx0XHRAX29mZnNldCA9IE1hdGgucm91bmQoQF9vZmZzZXQgKiBAX251bV9zaWduYWxzKS9AX251bV9zaWduYWxzXG5cblx0QHByb3BlcnR5ICdudW1fc2lnbmFscycsXG5cdFx0Z2V0Oi0+XG5cdFx0XHRAX251bV9zaWduYWxzXG5cdFx0c2V0OiAobnVtX3NpZ25hbHMpLT5cblx0XHRcdEBfbnVtX3NpZ25hbHMgPSBudW1fc2lnbmFsc1xuXHRcdFx0QF9kID0gTWF0aC5yb3VuZCBAbnVtX2NlbGxzL0BfbnVtX3NpZ25hbHNcblx0XHRcdEBfb2Zmc2V0ID0gTWF0aC5yb3VuZChAX29mZnNldCAqIEBfbnVtX3NpZ25hbHMpL0BfbnVtX3NpZ25hbHNcblxuXHRAcHJvcGVydHkgJ29mZnNldCcsXG5cdFx0Z2V0Oi0+XG5cdFx0XHRAX29mZnNldFxuXHRcdHNldDoob2Zmc2V0KS0+XG5cdFx0XHRAX29mZnNldCA9IE1hdGgucm91bmQob2Zmc2V0ICogQF9udW1fc2lnbmFscykvQF9udW1fc2lnbmFsc1xuXG5cdGFkdmFuY2U6IC0+XG5cdFx0QHRpbWUrK1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTZXR0aW5ncygpIl19
