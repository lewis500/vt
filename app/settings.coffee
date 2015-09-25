d3 = require 'd3'
_ = require 'lodash'

class Settings
	constructor:->
		_.assign this,
			num_cars: 1500
			time: 0
			space: 3
			pace: 1
			distance: 90
			sample: 30
			beta: .5
			gamma: 2
			offset: 0
			rush_length: 800
			# frequency: 8
			num_cells: 1000
			phase: 50
			green: .5
			wish: 400
			num_signals: 20
			day: 0
			offset: .3

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

	advance: ->
		@time++
	reset_time: ->
		@day++
		@time = 0

module.exports = new Settings()