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

		@scope.$watch ->
			S.sum()
		, =>
			@on_change()
		, true
		
	on_change: ->
		@data_theory = @solver.find_mfd()
		@traffic.reset()		

	rotator: (car)-> "rotate(#{S.scale(car.loc)}) translate(0,50)"

	click: (val) -> if !val then @play()
	pause: -> @paused = true
	tick: ->
		d3.timer =>
				S.advance()
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
