S = require '../settings'
_ = require 'lodash'
Car = require './car'
Signal = require './signal'
Cell = require './cell'


class Memory
	constructor: ->
		@long_term = []
		@reset()
	reset:->
		[@q,@k,@i] = [0,0,-1]

	span: 50

	remember:(q,k)->
		@i++
		@q+=q
		@k+=k
		if @i>@span
			@long_term.push 
				q: @q/(@span*S.num_cells)
				k: @k/(@span*S.num_cells)
				id: _.uniqueId 'memory-'
			@reset()
			if @long_term>50 then @long_term.shift()

class Traffic
	constructor: ->
		@cells = (new Cell n for n in [0...S.num_cells])
		for cell,i in @cells
			cell.next = @cells[(i+1)%@cells.length]
		@make_signals()
		@cars = []
		@make_cars()
		@memory = new Memory()

	choose_cell: (cell)->
		if !cell.car then cell else @choose_cell(cell.next)

	make_cars: ->
		cell.remove() for cell in @cells
		@cars = []
		num_cars = S.num_cars
		num_cells = S.num_cells
		for i in [0...num_cars]
			car = new Car()
			@cars.push car
			which = Math.floor(i/num_cars*num_cells)
			cell = @choose_cell @cells[which]
			cell.receive car

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
		C = @cells
		q=0

		signal.tick() for signal in @signals

		for cell,i in C
			if cell.car
				if cell.next.is_free()
					cell.next.receive cell.car
					cell.remove()
					q++

		cell.finalize() for cell in @cells
		@memory.remember q,@cars.length

module.exports = Traffic
