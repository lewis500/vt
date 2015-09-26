d3 = require 'd3'
_ = require 'lodash'
S = require '../settings'

class Light
	constructor:(@l)->
		@x = S.d * @l

	intersect:(t)->
		offset = S.delta*@l
		leftover = (t+offset)%S.cycle
		if leftover<(S.red*S.cycle)
			0
		else
			S.cycle-leftover

class Solver
	constructor: ->

	make_table:->
		red_time = S.red_time
		kj = S.q0*(1/S.vf+1/S.w)
		res = []
		[time_stopped,l] = [1000,-1]
		while time_stopped>0 and ++l<50
			light = new Light l
			time_traveling = light.x/S.vf
			time_arrival = red_time + time_traveling
			time_stopped = light.intersect time_arrival
			res.push 
				x: light.x
				t: time_arrival+time_stopped
				g: time_stopped
				l: light.l
				c: S.q0*time_stopped

		[time_stopped,l] = [1000,0]
		while time_stopped>0 and --l>-50
			light = new Light l
			time_traveling= -light.x/S.w
			time_arrival = red_time + time_traveling
			time_stopped = light.intersect time_arrival
			res.push
				x: light.x
				t: time_arrival + time_stopped
				g: time_stopped
				l: l
				c: -light.x*kj + S.q0*time_stopped
		res

	find_min: (k,table)->
		flow = Infinity
		res = {}
		for e in table
			flow_l = (e.c + k*e.x)/(e.t)
			if flow_l<=flow
				flow = flow_l
				res = _.clone e
		res.k = k
		res.q = flow
		return res

	find_mfd:->
		table = @make_table()
		res = (@find_min k,table for k in _.range 0,5,.01)

module.exports = Solver