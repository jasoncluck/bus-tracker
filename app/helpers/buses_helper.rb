module BusesHelper

	def insert_routes
		json = File.read('public/busroutes.json')
		routes = JSON.parse(json)
		routar = routes["Routes"]
		route_ids=routar.map{|r| r["RouteID"]}
		"['#{route_ids.join("','")}']"
	end
end
