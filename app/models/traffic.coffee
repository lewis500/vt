S = require '../settings'
_ = require 'lodash'
Car = require './car'
Signal = require './signal'
Cell = require './cell'

class Traffic
	constructor: ->
		@cells = (new Cell n for n in [0...S.num_cells])
		@make_signals()
		@make_cars

	make_cars: ->
		num_cars = S.num_cars
		num_cells = S.num_cells
		@cars = [0...S.num_cars].map -> new Car()

		for c,i in @cars
			loc = Math.round(num_cells*i/@cars.length)
			unless @cells[loc]?.car
				@cells[loc].receive c


	make_signals:->
		cell.clear_signal() for cell in @cells
		@signals = []
		num_signals = S.num_signals
		num_cells = S.num_cells
		for i in [0...num_signals]
			signal = new Signal i
			@signals.push signal
			which = Math.floor(i/num_signals*num_cells)
			@cells[which].set_signal signal

	reset_signals:->
		signal.reset() for signal in @signals

	tick:->
		k = @cells

		signal.tick() for signal in @signals

		for cell,i in k
			if cell.car
				if k[(i+1)%k.length].is_free()
					k[(i+1)%k.length].receive cell.car
					cell.remove()

		cell.finalize() for cell in @cells

module.exports = Traffic
