S = require '../settings'
_ = require 'lodash'
Car = require './car'
Signal = require './signal'
Cell = require './cell'

class Traffic
	constructor: ->
		@cells = (new Cell n for n in [0...S.num_cells])

	reset: ->
		num_cars = S.num_cars
		num_cells = S.num_cells
		num_signals = S.num_signals
		@cars = [0...S.num_cars].map -> new Car()
		@signals = []
		for i in [0...num_signals]
			signal = new Signal i
			@signals.push signal
			which = Math.floor(i/num_signals*num_cells)
			@cells[which].set_signal signal

		for c,i in @cars
			loc = Math.round(num_cells*i/@cars.length)
			unless @cells[loc]?.car
				@cells[loc].receive c

	tick:->
		k = @cells

		for cell,i in k
			if cell.car
				if k[(i+1)%k.length].is_free()
					k[(i+1)%k.length].receive cell.car
					cell.remove()
				else debugger

		cell.finalize() for cell in @cells

module.exports = Traffic
