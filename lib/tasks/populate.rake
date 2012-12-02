require "#{Rails.root}/lib/wmata_helper"
include WmataHelper
#Run rake populate:all
#This approach to populating the database with initial values 
#was recommended in http://stackoverflow.com/questions/62201/how-and-whether-to-populate-rails-application-with-initial-data
namespace :populate do

  desc "Add WMATA stops to database"
  task :stops => :environment do    
    updateStopTable
  end

  # It's important for stops to be populated before routes
  # because the stop_route association is populated
  # in the route adding logic 
  desc "Add WMATA routes to database"
  task :routes => :environment do
    populateRoutes "public"
  end

  desc "Add WMATA bus positions to database"
  task :buses => :environment do
  	updateBusTable
  end

  desc "Run all bootstrapping tasks"
  task :all => [:stops, :routes, :buses]
end