angular = require 'angular'
d3 = require 'd3'
_ = require 'lodash'
S = require './settings'
Traffic = require './models/traffic'
Car = require './models/car'
Solver = require './models/solver'

class Ctrl
	constructor:(@scope)->
		_.assign this,
			paused: true
			traffic: new Traffic
			solver: new Solver
			
		@scope.traffic = @traffic

		@scope.S = S

		@scope.$watch 'S.num_cars', =>
			# S.time = 0
			@traffic.make_cars()

		@scope.$watch 'S.num_signals', =>
			# S.time = 0
			@traffic.make_signals()
			# @traffic.make_cars()
			@data_theory = @solver.find_mfd()

		@scope.$watch 'S.offset + S.cycle + S.red',=>
			# @traffic.make_cars()
			# S.time = 0
			@data_theory = @solver.find_mfd()

		@scope.$watch 'S.q0 + S.w',=>
			# S.time = 0
			# @traffic.make_cars()
			@data_theory = @solver.find_mfd()
		
	rotator: (car)-> "rotate(#{S.scale(car.loc)}) translate(0,50)"

	click: (val) -> if !val then @play()
	pause: -> @paused = true
	tick: ->
		d3.timer =>
				for i in [0..6]
					S.time++
					@traffic.tick()
				@scope.$evalAsync()
				@paused
	play: ->
		@pause()
		@paused = false
		@tick()

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
	.directive 'shifter',require './directives/shifter'
