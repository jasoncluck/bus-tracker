require 'clockwork'
include Clockwork

handler do |job|
  puts "Running #{job}"
end

#every(10.seconds, 'updateBusTable') { Delayed::Job.enqueue UpdateBusTableJob.new }
#every(90.seconds, 'system "bundle exec rake populate:buses"')
every(30.seconds, 'Queueing PollBuses job') { Delayed::Job.enqueue UpdateBusTableJob.new }
