module BusesHelper

	def stale_time(bus)
		last=@bus.last_update
		staleness = (Time.now() - last) #in seconds
		hour = (staleness / 1.hour).to_i
		minutes = ((staleness-hour.hours) / 1.minute).to_i
		if hour > 0
			return "#{hour}:#{minutes}"
			
		end
		return "#{minutes}"
	end
end
