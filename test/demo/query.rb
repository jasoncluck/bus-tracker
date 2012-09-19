require 'net/http'
require 'uri'
require 'json'

#This is the WMATA developer API key
#Use limits are once every 5 seconds or 10000 times per day
#Try to avoid using overrunning usage limits 
apiKey = '7ksbn5vbbxqanrmgg9jczkag'

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

data = File.read('busroutes.json')
result = JSON.parse(data)

# if the hash has 'Error' as a key, we raise an error
if result.has_key? 'Error'
   raise "JSON error"
end

result['Routes'].each do |route|
	routeId=route['RouteID']
	uri=URI.parse("http://api.wmata.com/Bus.svc/json/JRouteDetails?routeId=#{routeId}&api_key=#{apiKey}")
	response = Net::HTTP.get_response uri
	File.open("busroute#{routeId}.json", 'w') {|f| f.write("RouteDetails=#{response.body}") }
end



