module RoutesHelper

	# Returns a color that maps to the route
	def route_color(route)
		return "%06x" % (rand * 0xffffff)
	end
end
