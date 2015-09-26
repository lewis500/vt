d3 = require 'd3'
_ = require 'lodash'
require './helpers'

class Settings
	constructor:->
		_.assign this,
			num_cells: 2000
			_num_cars: 300
			_k: 300/2000
			_num_signals: 50
			_offset: .3
			_d: 2000/50
			_kj: 3*(1/3+1/1)
			_k0: 1
			time: 0
			space: 3
			red: .02
			cycle: 50
			vf: 3
			w: 1
			q0: 3

		@colors = d3.scale.linear()
			.domain _.range 0,@num_cells,@num_cells/6
			.range [
				'#F44336', #red
				'#2196F3', #blue
				'#E91E63', #pink
				'#00BCD4', #cyan
				'#FFC107', #amber
				'#4CAF50', #green
				]

		@scale = d3.scale.linear()
			.domain [0,@num_cells]
			.range [0,360]

	sum: ->
		@cycle + @offset + @q0 + @red + @d

	@property 'kj',
		get:->
			@_kj
		set: (kj)->
			@_kj = kj
			@w = @q0/(kj - @k0)

	@property 'k0',
		get:->
			@_k0
		set: (k0)->
			@_k0 = k0
			@q0 = @vf*k0
			@w = @q0/(@kj - k0)

	@property 'num_cars', 
		get:->
			@_num_cars
		set:(num_cars)->
			@_num_cars = Math.round num_cars
			@_k = v/S.num_cells

	@property 'k',
		get:->
			@_k
		set:(k)->
			@_k = k
			@_num_cars = Math.round k*S.num_cells

	@property 'delta',
		get: ->
			@_offset*@cycle

	@property 'red_time',
		get:->
			@cycle * @red

	@property 'd', 
		get:->
			@_d
		set:(d)->
			@_num_signals = Math.round @num_cells/d
			@_d = @num_cells/@_num_signals
			@_offset = Math.round(@_offset * @_num_signals)/@_num_signals

	@property 'num_signals',
		get:->
			@_num_signals
		set: (num_signals)->
			@_num_signals = num_signals
			@_d = Math.round @num_cells/@_num_signals
			@_offset = Math.round(@_offset * @_num_signals)/@_num_signals

	@property 'offset',
		get:->
			@_offset
		set:(offset)->
			@_offset = Math.round(offset * @_num_signals)/@_num_signals


	advance: ->
		@time++

module.exports = new Settings()