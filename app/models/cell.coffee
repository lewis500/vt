S = require '../settings'
_ = require 'lodash'

class Cell
	constructor: (@loc)->
		@last = -Infinity
		@temp_car = @car = false
		@id = _.uniqueId 'cell'
		@signal = undefined

	set_signal: (@signal)->
		@signal.loc = @loc
		@signal.cell = this

	clear_signal: ->
		@signal = undefined

	space: 4

	receive:(car)->
		car.set_loc @loc
		@last = S.time
		@temp_car = car
		car.cell = this

	remove: ->
		@temp_car = false

	finalize: ->
		if (@car=@temp_car)
			@last = S.time

	is_free: ->
		if @signal
			return (@signal.green and ((S.time-@last)>@space))
		else
			(S.time-@last)>@space

module.exports = Cell