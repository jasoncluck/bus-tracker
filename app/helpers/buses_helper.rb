require 'net/http'
require 'uri'
require 'json'

module BusesHelper

#This is the WMATA developer API key
#Use limits are once every 5 seconds or 10000 times per day
#Try to avoid using overrunning usage limits 
WMATA_KEY = '7ksbn5vbbxqanrmgg9jczkag'


#This is the google API key, required to use their maps API
#google api:  AIzaSyAAQDOZpCb33qnlU5xcBmf_n8CQ4p_qg6s


#uri=URI.parse("http://api.wmata.com/Bus.svc/json/JBusPositions?&includingVariations=true&api_key=#{apiKey}")

# Bus routes
#http://api.wmata.com/Bus.svc/json/JRoutes?api_key=YOUR_API_KEY
#uri=URI.parse("http://api.wmata.com/Bus.svc/json/JRoutes?api_key=#{apiKey}")
#
# Bus route details...
#
#routeId=""
#uri=URI.parse("http://api.wmata.com/Bus.svc/json/JRouteDetails?routeId=#{routeId}&api_key=#{apiKey}")

	def insert_routes
		json = File.read('public/busroutes.json')
		routes = JSON.parse(json)
		routar = routes["Routes"]
		route_ids=routar.map{|r| r["RouteID"]}
		"['#{route_ids.join("','")}']"
	end

	def next_route_color
		"%06x" % (rand * 0xffffff)
	end
	
	# Updates bus positions from the WMATA servers
	def update_positions
#		uri = URI.parse "http://api.wmata.com/Bus.svc/json/JBusPositions?&includingVariations=true&api_key=#{WMATA_KEY}")
#		response = Net::HTTP.get_response uri
#		result = JSON.parse(response)
		data = File.read('busroutes.json')
		result = JSON.parse(data)
		Buses.create :
	end


	def update_routes
		result['Routes'].each do |route|
			routeId=route['RouteID']
			uri=URI.parse("http://api.wmata.com/Bus.svc/json/JRouteDetails?routeId=#{routeId}&api_key=#{WMATA_KEY}")
			response = Net::HTTP.get_response uri
			File.open("busroute#{routeId}.json", 'w') {|f| f.write("RouteDetails=#{response.body}") }
		end
	end
end
