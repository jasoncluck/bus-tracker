require 'net/http'
require 'uri'
require 'json'

#This is the WMATA developer API key
#Use limits are once every 5 seconds or 10000 times per day
#Try to avoid using overrunning usage limits 
#apiKey = '7ksbn5vbbxqanrmgg9jczkag'

module WmataHelper
	@@apiKey = '7ksbn5vbbxqanrmgg9jczkag'
	@@lastUpdate = curTime=DateTime.now()

	def fetchUri(uristr)
		uri=URI.parse(uristr)
		response = Net::HTTP.get_response uri
		result=JSON.parse(response.body)
		# if the hash has 'Error' as a key, we raise an error
		# File.open('busjson-dump.txt', 'a') {|f| f.write(response.body) }
		if result.has_key? 'Error'
		   raise "JSON error"
		end
		return result
	end

	def fetchBusPositions
		fetchUri("http://api.wmata.com/Bus.svc/json/JBusPositions?&includingVariations=false&api_key=#{@@apiKey}")
	end
	#TODO: do these api queries need to alternate?
	def fetchStopPositions
		fetchUri("http://api.wmata.com/Bus.svc/json/JStops?lat=38.878586&lon=-76.989626&radius=500&api_key=#{@@apiKey}")
	end


	def updateBusTable
		# subtractions result in fractions of days...
		# convert to seconds...
		n=DateTime.now
		secs=(n - @@lastUpdate)*24*60*60
		if secs < 4
			logger.info "Skipping update step because only #{secs.to_f} seconds since last update"
			return
		end
		# File.open('api-dump.txt', 'a') {|f| f.write("fetching bus positions at #{DateTime.now}...\n") }
		pos=fetchBusPositions
		@@lastUpdate=DateTime.now
	  	posarray=pos["BusPositions"]
	  	# File.open('api-dump.txt', 'a') {|f| f.write("fetched #{posarray.length} finished at #{DateTime.now}...\n") }
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
		  	dt=DateTime.strptime(buspos["DateTime"]+" EST", '%Y-%m-%dT%H:%M:%S %Z')
		  	bus=Bus.new headsign: buspos["TripHeadsign"], 
	  			lat: buspos["Lat"], 
	  			lon: buspos["Lon"], 
	  			dev: buspos["Deviation"], 
	  			wmataid: buspos["RouteID"], 
	  			busid: buspos["VehicleID"], 
	  			direction: buspos["DirectionText"], 
	  			last_update: dt
	  		if bus.valid?
	  			b=Bus.where(busid: buspos["VehicleID"]).first
	  			if b.nil?
	  				bus.save
	  			else
	  				#File.open('api-dump.txt', 'a') {|f| f.write("\tupdating bus with id #{b.id}, datetime #{dt}\n") }
	  				Bus.update b.id, 
	  				headsign: bus.headsign, 
	  				lat: bus.lat,
	  				lon: bus.lon,
	  				dev: bus.dev,
	  				wmataid: bus.wmataid,
	  				busid: bus.busid,
	  				direction: bus.direction,
	  				last_update: bus.last_update
	  			end
	  		else
	  			#File.open('api-dump.txt', 'a') {|f| f.write("\tskipped bus #{bus.id}, datetime #{dt} because it was invalid\n") }
	  		end
	  		
		end
	end

	def updateStopTable
		pos=fetchStopPositions
	  	posarray=pos["Stops"]
	 	# StopID - Regional BusStop ID
		# Lat - Latitude of the BusStop
		# Lon - Longitude of the BusStop
		# Name - The name of the BusStop
		# Routes - Array of Routes for this stop.

	  	posarray.each do |stoppos|
		  	#dt=DateTime.strptime(stoppos["DateTime"]+" EDT", '%Y-%m-%dT%H:%M:%S %Z')
	  		s=Stop.where(stopid: stoppos["StopID"]).first
	  		if s.nil?
	  			#wmataid = nil
	  			s=Stop.new stopid: stoppos["StopID"], lat: stoppos["Lat"], lon: stoppos["Lon"], name: stoppos["Name"]
	  			s.save
	  		else
	  			Stop.update s.id, stopid: stoppos["StopID"], lat: stoppos["Lat"], lon: stoppos["Lon"], name: stoppos["Name"]	 #routes: stoppos["Routes"]
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