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
			@traffic.make_cars()
			@data_theory = @solver.find_mfd()

		@scope.$watch 'S.num_signals', =>
			@traffic.make_signals()
			@data_theory = @solver.find_mfd()

		@scope.$watch 'S.offset + S.cycle + S.red',=>
			@traffic.reset_signals()
			@data_theory = @solver.find_mfd()

		@scope.$watch 'S.q0 + S.w',=>
			@data_theory = @solver.find_mfd()
		
	rotator: (car)-> "rotate(#{S.scale(car.loc)}) translate(0,50)"

	click: (val) -> if !val then @play()
	pause: -> @paused = true
	tick: ->
		d3.timer =>
				# S.advance()
				@traffic.tick()
				# @scope.$broadcast 'tick'
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

carDer = ->
	directive = 
		scope:
			cars: '='
		link: (scope,el,attr)->
			sel = d3.select el[0]
				.select '.cars'

			scope.$on 'tick',->

				sel.selectAll '.g-car'
					.data scope.cars, (d)-> d.id
					.attr 'transform', (d)->"rotate(#{S.scale(d.loc)}) translate(0,50)"

			update = ->
				cars = sel.selectAll '.g-car'		
					.data scope.cars, (d)-> d.id

				new_cars = cars.enter()
					.append 'g'
					.attr
						class: 'g-car'
						# transform: (d)->"rotate(#{S.scale(d.loc)}) translate(0,50)"

				cars.exit().remove()
					
				new_cars.append 'rect'
					.attr
						width: .2
						height: 2
						y: -1
						x: -.1
						fill: (d)->d.color

				# cars.attr 'transform', (d)->"rotate(#{S.scale(d.loc)}) translate(0,50)"

			scope.$watch 'cars.length', update


angular.module 'mainApp' , [require 'angular-material' , require 'angular-animate']
	.directive 'visDer', visDer
	.directive 'datum', require './directives/datum'
	.directive 'd3Der', require './directives/d3Der'
	.directive 'mfdChart', require './mfd'
	.directive 'horAxis', require './directives/xAxis'
	.directive 'verAxis', require './directives/yAxis'
	.directive 'sliderDer', require './directives/slider'
	.directive 'shifter',require './directives/shifter'
	.directive 'carDer', carDer
