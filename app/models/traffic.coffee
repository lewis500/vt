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
		[@q,@k,@i] = [0,0,0]

	span: 30

	remember:(q,k)->
		@i++
		@q+=q
		@k+=k
		if @i>=@span
			@long_term.push 
				q: @q/(@span*S.num_cells)
				k: @k/(@span*S.num_cells)
				id: _.uniqueId 'memory-'
			@reset()
			if @long_term.length>10 then @long_term.shift()

class Traffic
	constructor: ->
		@cells = (new Cell n for n in [0...S.num_cells])
		for cell,i in @cells
			cell.next = @cells[(i+1)%@cells.length]
		@cars = []
		@signals = []
		@make_signals()
		@make_cars()
		@memory = new Memory()

	choose_cell: (cell)->
		if !cell.car then cell else @choose_cell(cell.next)

	make_cars: ->
		{num_cars,num_cells} = S
		cell.reset() for cell in @cells
		diff = num_cars - @cars.length
		if diff<0
			@cars = _.drop @cars, -diff
		else
			for i in [0...diff]
				@cars.push new Car()

		for car,i in @cars
			cell = @choose_cell @cells[Math.floor(i/num_cars*num_cells)]
			cell.receive car

	make_signals:->
		{num_signals,num_cells} = S
		cell.clear_signal() for cell in @cells
		l = @signals.length
		diff = num_signals - l
		if diff<0
			@signals = _.drop @signals, -diff
		else
			for i in [0...diff]
				@signals.push new Signal l+i

		for signal,i in @signals
			signal.reset()
			which = Math.floor(i/num_signals*num_cells)
			@cells[which].set_signal signal

	reset_signals:->
		signal.reset() for signal in @signals

	tick:->
		C = @cells
		q=0

		signal.tick() for signal in @signals

		for cell in C
			if cell.car
				if cell.next.is_free()
					cell.next.receive cell.car
					cell.remove()
					q++

		cell.finalize() for cell in @cells
		@memory.remember q,@cars.length

module.exports = Traffic
