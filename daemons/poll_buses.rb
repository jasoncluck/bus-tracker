require ENV["RAILS_ENV_PATH"]

# To run this, do...
# gem install daemons
# script/daemon poll_buses.rb
#
# script/daemon was created based on advice here:
# http://stackoverflow.com/questions/5441221/custom-daemon-with-rails-3

include WmataHelper

	puts "Updating bus table at #{Time.now}"
	t1=Time.now
	n=updateBusTable
	t2=Time.now
	puts "Finished updating #{n} buses in #{t2-t1} seconds"
	sleep(10)

