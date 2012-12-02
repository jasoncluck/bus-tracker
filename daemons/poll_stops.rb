require ENV["RAILS_ENV_PATH"]

# To run this, do...
# gem install daemons
# script/daemon poll_buses.rb
#
# script/daemon was created based on advice here:
# http://stackoverflow.com/questions/5441221/custom-daemon-with-rails-3

include WmataHelper

loop do
	puts "Updating stops table at #{Time.now}"
	t1=Time.now
	n=updateStopTable
	t2=Time.now
	puts "Finished updating #{n} stops in #{t2-t1} seconds"
	sleep(10.days)
end