require "#{Rails.root}/lib/wmata_helper"
include WmataHelper
#Run rake populate:all
#This approach to populating the database with initial values 
#was recommended in http://stackoverflow.com/questions/62201/how-and-whether-to-populate-rails-application-with-initial-data
namespace :pollBuses do

  desc "Poll Buses"
  task :buses => :environment do    
    t1=Time.now
    n=updateBusTable
    t2=Time.now
    puts "Finished updating #{n} buses in #{t2-t1} seconds"
  end
end