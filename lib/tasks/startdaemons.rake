require "#{Rails.root}/lib/wmata_helper"

#Run rake populate:all
#This approach to populating the database with initial values 
#was recommended in http://stackoverflow.com/questions/62201/how-and-whether-to-populate-rails-application-with-initial-data
namespace :jobs do

  desc "Start running the bus polling daemon"
  task :buses => :environment do    
    system "script/daemon run poll_buses.rb"
  end

  
  desc "Run the tasks"
  task :work => [:buses]
end