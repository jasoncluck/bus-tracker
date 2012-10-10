require "#{Rails.root}/app/helpers/wmata_helper"
include WmataHelper
#Run rake populate:all
#This approach to populating the database with initial values 
#was recommended in http://stackoverflow.com/questions/62201/how-and-whether-to-populate-rails-application-with-initial-data
namespace :populate do
  desc "Add WMATA routes to database"
  task :routes => :environment do
    
  end

  desc "Add WMATA bus positions to database"
  task :buses => :environment do
  	updateBusTable
  end

  desc "Add WMATA stops to database"
  task :stops => :environment do  	
  end


  desc "Run all bootstrapping tasks"
  task :all => [:routes, :buses, :stops]
end