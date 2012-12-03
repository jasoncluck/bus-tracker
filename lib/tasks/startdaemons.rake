require "#{Rails.root}/lib/wmata_helper"

namespace :jobs do  
  desc "Run the tasks"
  task :work do
    system "script/daemon run poll_buses.rb"
  end
end