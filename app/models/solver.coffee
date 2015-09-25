d3 = require 'd3'
_ = require 'lodash'
S = require '../settings'

class Solver
	constructor: ->

	solve:->
		red_time = S.red_time
		kj = S.q0*(1/S.vf+1/S.w)
		res = []
		[x,time_stopped,l] = [0,1000,0]
		while time_stopped>0 and l<10
			time_traveling = x/S.vf
			time_arrival = red_time + time_traveling
			time_stopped = @green_left time_arrival,l
			res.push 
				x: x
				t: time_arrival+time_stopped
				g: time_stopped
				l: l
				c: S.q0*time_stopped
			x+=S.d
			l+=1

		[x,time_stopped,l] = [-S.d/S.w, 1000,-1]
		while time_stopped>0 and l>-10
			time_traveling= -x/S.w
			time_arrival = red_time + time_traveling
			time_stopped = @green_left time_arrival,l
			res.push
				x: x
				t: time_arrival + time_stopped
				g: time_stopped
				l: l
				c: kj*time_traveling + S.q0*time_stopped
			x-=S.d
			l-=1
		res

	green_left: (t,l)->
		red_time = S.red_time
		leftover = (t+Math.abs(l)*S.delta)%S.cycle
		if leftover<red_time
			0
		else
			S.cycle-leftover

	find_min: (k)->
		flow = Infinity
		res = {}
		for e in @table
			flow_l = (e.c + k*e.x)/(e.t)
			if flow_l<flow
				flow = flow_l
				res = _.clone e
		res.k = k
		res.q = flow
		return res

	find_mfd:->
		@table = @solve()
		a = []
		res = (@find_min k for k in _.range 0,8,1/5)

module.exports = Solver