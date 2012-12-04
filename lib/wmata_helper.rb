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
	@@update_thread=nil
	@@update_mutex=Mutex.new

	def insureUpdateThread
		if @@update_thread.nil? or not @@update_thread.alive?
			@@update_thread = Thread.new do
				logger.info "Making new update thread..."
				while true do
					logger.info "Doing update..."
					updateBusTable
					logger.info "Finished updating buses..."
					sleep(10)
				end
			end
		end
	end

	def fetchRaw(uristr)
		Rails.logger.info "Fetching #{uristr}..."
		uri=URI.parse(uristr)
		response = Net::HTTP.get_response uri
		return response.body
	end

	def fetchUri(uristr)
		result=JSON.parse(fetchRaw(uristr))
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
		fetchUri("http://api.wmata.com/Bus.svc/json/JStops?&api_key=#{@@apiKey}")
	end

	def fetchPredictionRaw(stop_id)
		return fetchRaw("http://api.wmata.com/NextBusService.svc/json/JPredictions?StopID=#{stop_id}&api_key=#{@@apiKey}")
	end

	def saveStopPositions
		uristr="http://api.wmata.com/Bus.svc/json/JStops?&api_key=#{@@apiKey}"
		uri=URI.parse(uristr)
		response = Net::HTTP.get_response uri
		File.open("stops.json", "w") do |f| f.write( response.body ) end
	end

	# This takes way too long to do mid-AJAX request cycle.
	# It downloads about 15 MB of route data.  It's probably best done outside
	# of rails, from the command line or in a cron job or something.
	# Route data shouldn't change that much, so for now I've put it in a KML
	# file that can be served up directly from /public
	def fetchRoutes
		# Bus routes
	    #http://api.wmata.com/Bus.svc/json/JRoutes?api_key=YOUR_API_KEY
	    #
	    # Bus route details...
	    #
	    logger.info "Fetching, fetching..."
	    result = fetchUri("http://api.wmata.com/Bus.svc/json/JRoutes?api_key=#{@@apiKey}")

	    # if the hash has 'Error' as a key, we raise an error
	    logger.info "Got some data..."
	    if result.has_key? 'Error'
	    	raise "JSON error"
	    end
	    logger.info "No error..."
	    result['Routes'].each do |route|
	    	routeId=route['RouteID']
	    	logger.info "Processing route #{routeId}..."
	    	routeData = fetchUri("http://api.wmata.com/Bus.svc/json/JRouteDetails?routeId=#{URI.escape(routeId)}&api_key=#{@@apiKey}")
	    	#d.keys: ["Direction0", "Direction1", "Name", "RouteID"] 
	    	addRouteData(routeData)
 		end
	end

	def addRoutePoints(route, routeData)
		#routeData.keys = ["DirectionNum", "DirectionText", "Shape", "Stops", "TripHeadsign"] 
		routeData["Shape"].each do |point|
			#Each point is a map...{"Lat"=>38.792758, "Lon"=>-77.049595, "SeqNum"=>1} 
			p=RoutePoint.new lat: point["Lat"].to_f,
			lon: point["Lon"].to_f,
			seqnum: point["SeqNum"].to_i,
			route: route
			if p.valid?
				p.save
			end
		end
	end

	def updateRoutes
		n=Time.zone.now.utc
		updates=Route.select(:updated_at)
		if updates.nil? or updates.empty? or updates[0].nil? or ((n - updates[0].updated_at) > 60*60*24)
			logger.info "Updating routes..."
			fetchRoutes
		else
			seconds_old = (n - updates[0].updated_at);
			logger.info "Skipping update step because only #{seconds_old.to_f} days since last route update"
		end
	end

	def populateRoutes(dir)
		data = File.read("#{dir}/busroutes.json")
		result = JSON.parse(data)

	    # if the hash has 'Error' as a key, we raise an error
	    if result.has_key? 'Error'
	    	raise "JSON error"
	    end

	    result['Routes'].each do |route|
	    	routeId=route['RouteID']
	    	routeData = File.read("#{dir}/routes/busroute#{routeId}.json")
	    	routeData['RouteDetails='] = ''
	    	addRouteData(JSON.parse(routeData))
	    end
	end

	def addRouteData(routeData)
    	#d.keys: ["Direction0", "Direction1", "Name", "RouteID"] 
    	["Direction0", "Direction1"].each do |dir|
    		if routeData.has_key? dir
    			#d.keys: ["DirectionNum", "DirectionText", "Shape", "Stops", "TripHeadsign"] 
    			existing=Route.where("routeid = ? AND direction = ?", routeData["RouteID"], dir)
    			if existing.empty?
    				if not routeData[dir].nil? and not routeData[dir]["Shape"].nil?
    					r=Route.new name: routeData["Name"],
    					direction: routeData[dir]["DirectionText"],
    					headsign: routeData[dir]["TripHeadsign"],
    					routeid: routeData["RouteID"]
    					if r.valid?
    						r.save
    						addRoutePoints(r, routeData[dir])
    						associateStops(r, routeData[dir]["Stops"])
    					end
    					mn=r.mean
    					r.update_attributes :mean_lat => mn.lat, :mean_lon => mn.lon
    				end
    			end
    		end
    	end
	end

	def associateStops(route, stops)
		# "Stops":[{"Lat", "Lon", "Name", "Routes":["10A"...], "StopID"}, ...]
		# We want to figure out which route / direction combo matches which stops...
		stops.each do |stopData|
			s=Stop.where(stopid: stopData["StopID"])
			if not s.nil?
				route.stops << s
			end
		end
		route.save
	end


	def updateBusTable
		# subtractions result in fractions of days...
		# convert to seconds...
		n=DateTime.now
		# File.open('api-dump.txt', 'a') {|f| f.write("fetching bus positions at #{DateTime.now}...\n") }
		pos=fetchBusPositions
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

	  	updates=0

	  	posarray.each do |buspos|
		  	dt=DateTime.strptime(buspos["DateTime"]+" EST", '%Y-%m-%dT%H:%M:%S %Z')
		  	bus=Bus.new headsign: buspos["TripHeadsign"], 
	  			lat: buspos["Lat"], 
	  			lon: buspos["Lon"], 
	  			dev: buspos["Deviation"], 
	  			wmataid: buspos["RouteID"], 
	  			busid: buspos["VehicleID"], 
	  			direction: buspos["DirectionText"],
	  			draw: true,
	  			last_update: dt
	  		if bus.valid?
	  			b=Bus.where(busid: buspos["VehicleID"]).first
	  			if b.nil?
	  				@@update_mutex.synchronize do
	  					updates = updates +1
	  					bus.save
	  				end
	  			else
	  				#File.open('api-dump.txt', 'a') {|f| f.write("\tupdating bus with id #{b.id}, datetime #{dt}\n") }
	  				@@update_mutex.synchronize do

	  					Bus.update b.id, 
	  					headsign: bus.headsign, 
	  					lat: bus.lat,
	  					lon: bus.lon,
	  					dev: bus.dev,
	  					wmataid: bus.wmataid,
	  					busid: bus.busid,
	  					direction: bus.direction,
	  					draw: true,
	  					last_update: bus.last_update

	  					updates = updates +1
	  				end
	  			end
	  		else
	  			#File.open('api-dump.txt', 'a') {|f| f.write("\tskipped bus #{bus.id}, datetime #{dt} because it was invalid\n") }
	  		end
		end
		return updates
	end

	#handle_asynchronously :updateBusTable

	def updateStopTable
		pos=fetchStopPositions
	  	posarray=pos["Stops"]
	 	# StopID - Regional BusStop ID
		# Lat - Latitude of the BusStop
		# Lon - Longitude of the BusStop
		# Name - The name of the BusStop
		# Routes - Array of Routes for this stop.

		updates=0
	  	posarray.each do |stoppos|
		  	stop=Stop.new stopid: stoppos["StopID"], name: stoppos["Name"], lat: stoppos["Lat"].to_f, lon: stoppos["Lon"].to_f
		  	# e.g. "Routes":["7A","7Av1","7Av2","7F","7Fv1","7W","7X"],
		  	# This is not enough information to correlate stops with route directions, so 
		  	# the association is built up in addRouteData instead
		  	if stop.valid?
		  		s=Stop.where(stopid: stoppos["StopID"]).first
		  		if s.nil?
	  			   stop.save
	  			   updates = updates + 1
	  			else
	  			   Stop.update s.id, stopid: stop.stopid, name: stop.name, lat: stop.lat, lon: stop.lon
	  			   updates = updates +1
	  			end
  			end
		end
		return updates
	end

	def fetchDetails(routeId)
		fetchUri("http://api.wmata.com/Bus.svc/json/JRouteDetails?routeId=#{routeId}&api_key=#{@@apiKey}")
	end
end