S = require '../settings'
_ = require 'lodash'

class Car
	constructor:->
		@id = _.uniqueId 'car-'
		@color = _.sample S.colors.domain()

	set_loc: (@loc)->

module.exports = Car