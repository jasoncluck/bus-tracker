require 'config/boot'
require 'config/environment'
require "#{Rails.root}/lib/wmata_helper"
include WmataHelper


every(10.minutes, 'updateBusTable') { Delayed::Job.enqueue UpdateBusTableJob.new }