S = require '../settings'
_ = require 'lodash'

class Cell
	constructor: (@loc)->
		@been_free = Infinity
		@temp_car = @car = false
		@id = _.uniqueId 'cell'
		@signal = undefined

	set_signal: (@signal)->
		@signal.loc = @loc
		@signal.cell = this

	clear_signal: ->
		@signal = undefined

	receive:(car)->
		car.set_loc @loc
		@temp_car = car

	reset: ->
		@been_free = Infinity
		@temp_car = @car = false

	remove: ->
		@temp_car = @car = false

	finalize: ->
		@car = @temp_car
		if @car
			@been_free=0
		else
			@been_free++

	is_free: ->
		if @signal
			return (@signal.green and (@been_free>(1/S.w-1)))
		else
			@been_free>(1/S.w-1)

module.exports = Cell