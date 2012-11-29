module RoutesHelper

	# Returns a color that maps to the route
	def route_color(route)
		return "%08x" % ((rand * 0xffffff) | 0x7f000000 )
	end
end
