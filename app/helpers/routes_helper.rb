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

	def make_key(routeid)
		colorKey = routeid.dup
		#Need the if to avoid a regex exception
		if colorKey =~ /.*[a-z].*/
			colorKey[/[a-z].*/]=''
		end
		return colorKey
	end

	def gen_colors(routes)
		prand = Random.new(1234)
		@colorMap={}
		File.open('public/route_colors.json', 'w') do |f| 
			f.write("{")
			routes.each do |route|
				colorKey = make_key(route.routeid)
				if @colorMap[colorKey].nil?
					@colorMap[colorKey] = "%06x" % (prand.rand * 0xffffff)
					f.write("\"#{colorKey}\":\"#{@colorMap[colorKey]}\",")
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
		colorKey = make_key(route.routeid)
		return @colorMap[colorKey]
	end
end
