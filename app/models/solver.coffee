d3 = require 'd3'
_ = require 'lodash'
S = require '../settings'

{max,min,abs} = Math

solve = (l)->
	x = l*S.d
	if l<0
		ta = abs(x)/S.w
	else
		ta = x/S.vf
	# ta = if l<0 then (abs(x)/S.w) else x/S.vf
	e = (ta-l*S.delta)%%S.cycle
	g = max(S.green-e,0)
	r = min(S.cycle-e,S.red)
	c = S.q0*g + (if l<0 then S.kj*abs(x) else 0)
	res =
		x: x
		c: c
		r: r
		c: c
		g: g
		l: l
		e: e
		ta: ta
		t: ta+S.cycle-e

class Solver
	constructor: ->

	make_table:->
		red_time = S.red_time
		kj = S.kj
		table = []
		[g_forward,l_forward] = [1000,0]
		while g_forward>0 and l_forward<100
			res = solve l_forward
			table.push res
			g_forward = res.g
			l_forward++

		[g_backward,l_backward] = [1000,-1]
		while g_backward>0 and l_backward>-100
			res = solve l_backward
			table.push res
			g_backward = res.g
			l_backward--

		table

	find_min: (k,table)->
		q = Infinity
		for e in table
			ql = (e.c + k*e.x)/e.t
			if ql<q
				q = ql
				lowest = e
		if q>=(S.vf*k)
			q = (S.vf*k)
			lowest = 
				q: q
		if q>=(S.kj-k)*S.w
			q = (S.kj-k)*S.w
			lowest = 
				q: q
		res = _.clone lowest
		res.k = k
		res.q = q
		return res

	find_mfd:->
		table = @make_table()
		res = (@find_min k,table for k in _.range 0,1.05,.01)

module.exports = Solver