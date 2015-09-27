S = require '../settings'
_ = require 'lodash'

n = 0

class Car
	constructor:->
		@id = n++
		@color = _.sample S.colors.range()

	set_loc: (@loc)->

module.exports = Car