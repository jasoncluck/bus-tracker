require 'json'

module RoutesHelper
	def load_colors
		if File.exist? "public/route_colors.json"
			data = File.read("public/route_colors.json")
			@colorMap = JSON.parse(data)
			return true
		end
		return false
	end

	def map_exists?
		return File.exist? "public/route_colors.json"
	end

	def gen_colors(routes)
		prand = Random.new(1234)
		@colorMap={}
		File.open('public/route_colors.json', 'w') do |f| 
			f.write("{")
			routes.each do |route|
				if @colorMap[route.routeid].nil?
					@colorMap[route.routeid] = "%06x" % (prand.rand * 0xffffff)
					f.write("\"#{route.routeid}\":\"#{@colorMap[route.routeid]}\",")
				end
			end
			f.write("}")
		end			
	end

	# Returns a color that maps to the route
	def route_color(route)
		if @colorMap.nil?
			load_colors
		end
		return @colorMap[route.routeid]
	end
end
