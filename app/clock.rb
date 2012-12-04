require 'clockwork'
include Clockwork

handler do |job|
  puts "Running #{job}"
end


every(10.seconds, 'system "bundle exec rake populate:buses"'){ system( "bundle exec rake populate:buses") }

