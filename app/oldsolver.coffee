d3 = require 'd3'
_ = require 'lodash'
S = require '../settings'

class Light
	constructor:(@l)->
		@x = S.d * @l

	intersect:(t)->
		offset = S.delta*@l
		leftover = (t+offset)%S.cycle
		if leftover<S.red
			0
		else
			S.cycle-leftover

class Solver
	constructor: ->

	make_table:->
		red_time = S.red_time
		kj = S.kj
		res = []
		[g,l] = [1000,-1]
		while g>0 and ++l<100
			light = new Light l
			time_traveling = light.x/S.vf
			time_arrival = red_time + time_traveling
			g = light.intersect time_arrival
			time_stopped = Math.max g,0
			res.push 
				x: light.x
				t: time_arrival + time_stopped
				g: g
				l: light.l
				c: S.q0*time_stopped

		[g,l] = [1000,0]
		while g>0 and --l>(-100)
			light = new Light l
			time_traveling= -light.x/S.w
			time_arrival = red_time + time_traveling
			g = light.intersect time_arrival
			time_stopped = Math.max g,0
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
			if flow_l<flow
				flow = flow_l
				res = _.clone e
		res.k = k
		res.q = flow
		return res

	find_mfd:->
		table = @make_table()
		res = (@find_min k,table for k in _.range 0,1.05,.025)

module.exports = Solver