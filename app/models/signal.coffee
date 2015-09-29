S = require '../settings'
_ = require 'lodash'

class Signal
	constructor: (@i) ->
		@count = 0
		@green = true
		@id = _.uniqueId 'signal-'

	tick: ->
		e = (S.time - @i*S.delta)%S.cycle
		if e>=S.green
			@green = false
		else
			@green=true

module.exports = Signal