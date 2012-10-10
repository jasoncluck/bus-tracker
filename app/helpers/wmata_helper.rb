require 'net/http'
require 'uri'
require 'json'

#This is the WMATA developer API key
#Use limits are once every 5 seconds or 10000 times per day
#Try to avoid using overrunning usage limits 
#apiKey = '7ksbn5vbbxqanrmgg9jczkag'

module WmataHelper
	@@apiKey = '7ksbn5vbbxqanrmgg9jczkag'

	def fetchUri(uristr)

		uri=URI.parse(uristr)
		response = Net::HTTP.get_response uri
		result=JSON.parse(response.body)
		# if the hash has 'Error' as a key, we raise an error
		if result.has_key? 'Error'
		   raise "JSON error"
		end
		return result
	end

	def fetchPositions
		fetchUri("http://api.wmata.com/Bus.svc/json/JBusPositions?&includingVariations=true&api_key=#{@@apiKey}")
	end

	def updateBusTable
		pos=fetchPositions
	  	posarray=pos["BusPositions"]
	  	#{"DateTime"=>"2012-10-09T21:05:22",
	  	# "Deviation"=>"2.25",
	  	# "DirectionNum"=>"1",
	  	# "DirectionText"=>"EAST",
	  	# "Lat"=>38.840343,
	  	# "Lon"=>-76.97628,
	  	# "RouteID"=>"32",
	  	# "TripEndTime"=>"2012-10-09T21:08:00",
	  	# "TripHeadsign"=>"SOUTHERN AVE STATION",
	  	# "TripID"=>"20896_31",
	  	# "TripStartTime"=>"2012-10-09T19:38:00",
	  	# "VehicleID"=>"7136"} 
	  	posarray.each do |buspos|
	  		b=Bus.where(busid: buspos["VehicleID"]).first
	  		if b.nil?
	  			b=Bus.new headsign: buspos["TripHeadsign"], lat: buspos["Lat"], lon: buspos["Lon"], dev: buspos["Deviation"], wmataid: buspos["RouteID"], busid: buspos["VehicleID"], direction: buspos["DirectionText"]
	  			b.save
	  		else
	  			Bus.update b.id, headsign: buspos["TripHeadsign"], lat: buspos["Lat"], lon: buspos["Lon"], dev: buspos["Deviation"], wmataid: buspos["RouteID"], busid: buspos["VehicleID"], direction: buspos["DirectionText"]
  			end
		end
	end

	def fetchRoutes
		fetchUri("http://api.wmata.com/Bus.svc/json/JRoutes?api_key=#{@@apiKey}")
	end

	def fetchDetails(routeId)
		fetchUri("http://api.wmata.com/Bus.svc/json/JRouteDetails?routeId=#{routeId}&api_key=#{@@apiKey}")
	end
end