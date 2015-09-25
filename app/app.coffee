angular = require 'angular'
d3 = require 'd3'
_ = require 'lodash'

class Ctrl
	constructor: (@scope)->
		_.assign this,
			cycle: 10
			delta: 1
			d: 3
			red: .5
			vf: 3
			w: 1
			q0: 3

		@scope.$watch =>
				@cycle + @delta + @d + @red + @vf + @w + @q0
			, =>
				@k0 = @q0/@vf
				@kj = @k0 + @q0/@w
				@red_time = @red*@cycle
				@mfd = @find_mfd()

	solve:->
		res = []
		[x,time_stopped,l] = [0,1000,0]
		while time_stopped>0 and l<10
			time_traveling = x/@vf
			time_arrival = @red_time + time_traveling
			time_stopped = @green_left time_arrival,l
			res.push 
				x: x
				t: time_arrival+time_stopped
				g: time_stopped
				l: l
				c: @q0*time_stopped
			x+=@d
			l+=1

		[x,time_stopped,l] = [-@d/@w, 1000,-1]
		while time_stopped>0 and l>-10
			time_traveling= -x/@w
			time_arrival = @red_time + time_traveling
			time_stopped = @green_left time_arrival,l
			res.push
				x: x
				t: time_arrival + time_stopped
				g: time_stopped
				l: l
				c: @kj*time_traveling + @q0*time_stopped
			x-=@d
			l-=1
		res

	green_left: (t,l)->
		leftover = (t+Math.abs(l)*@delta)%@cycle
		if leftover<@red_time
			0
		else
			@cycle-leftover

	find_min: (k)->
		table = @solve()
		flow = Infinity
		res
		for e in table
			flow_l = (e.c + k*e.x)/(e.t)
			if flow_l<flow
				flow = flow_l
				res = e
		res.k = k
		res.q = flow
		return res

	find_mfd:->
		(@find_min k for k in _.range(0,10,1/5))


visDer = ->
	directive = 
		scope: {}
		controllerAs: 'vm'
		templateUrl: './dist/vis.html'
		controller: ['$scope', Ctrl]

angular.module 'mainApp' , [require 'angular-material' , require 'angular-animate']
	.directive 'visDer', visDer
	.directive 'datum', require './directives/datum'
	.directive 'd3Der', require './directives/d3Der'
	.directive 'mfdChart', require './mfd'
	.directive 'horAxis', require './directives/xAxis'
	.directive 'verAxis', require './directives/yAxis'
	.directive 'sliderDer', require './directives/slider'
