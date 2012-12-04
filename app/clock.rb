require 'clockwork'
include Clockwork

handler do |job|
  puts "Running #{job}"
end

#every(10.seconds, 'updateBusTable') { Delayed::Job.enqueue UpdateBusTableJob.new }
every(10.seconds, 'system "bundle exec rake populate:buses"'){ system( "bundle exec rake populate:buses") }
