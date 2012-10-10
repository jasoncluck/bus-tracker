class Bus < ActiveRecord::Base
  attr_accessible :location, :name, :lat, :lon, :headsign, :wmataid, :busid, :direction, :dev
  belongs_to :map
end
