require "#{Rails.root}/lib/wmata_helper"
include WmataHelper


every(10.seconds, 'updateBusTable') { Delayed::Job.enqueue UpdateBusTableJob.new }