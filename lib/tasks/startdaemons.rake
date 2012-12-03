require "#{Rails.root}/lib/wmata_helper"
include WmataHelper

namespace :jobs do  
  desc "Run the tasks"
  task :work do
      puts "Updating bus table at #{Time.now}"
      t1=Time.now
      n=updateBusTable
      t2=Time.now
      puts "Finished updating #{n} buses in #{t2-t1} seconds"
      sleep(10)
  end
end