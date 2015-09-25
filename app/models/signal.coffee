S = require '../settings'
_ = require 'lodash'

class Signal
	constructor: (@i) ->
		@count = 0
		@green = true
		@id = _.uniqueId 'signal-'
		@reset()

	reset: ->
		@offset = S.cycle*((@i*S.offset)%1)
		[@count, @green] = [@offset, true]

	tick: ->
		@count++
		if (@count) >= (S.phase)
			[@count, @green] = [0, true]
			return
		if (@count)>= (S.green*S.phase)
			@green = false

module.exports = Signal