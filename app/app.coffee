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
				@kj = @q0*(1/@w + 1/@vf)
				@red_time = @red*@cycle
				@mfd = @find_mfd()

	solve:->
		res = []
		[x,g,l] = [0,1000,0]
		while g>0
			t = @red_time + x/@vf
			g = @green_left t,l
			time_stopped = Math.max 0,g
			res.push 
				x: x
				t: t
				g: g
				l: l
				c: @q0*time_stopped
			x+=@d
			l+=1
		[x,g,l] = [-@d/@.w, 1000,-1]
		while g>0
			t = @red_time + -x/@w
			g = @green_left t,l
			res.push
				x: x
				t: t
				g: g
				l: l
				c: @kj*t
			x-=@d
			l-=1
		res

	green_left: (t,l)->
		leftover = (t+Math.abs(l)*@delta)%@cycle
		if leftover<@red_time
			leftover - @red_time
		else
			@cycle-leftover

	find_min: (k)->
		table = @solve()
		flow = Infinity
		res
		for e in table
			flow_l = (e.c + k*e.x)/(e.t-@red_time)
			if flow_l<flow
				flow = flow_l
				res = e
		res.k = k
		res.q = flow
		return res

	find_mfd:->
		(@find_min k for k in _.range(0,10,1/4))


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
