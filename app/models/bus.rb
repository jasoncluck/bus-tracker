class Bus < ActiveRecord::Base
  attr_accessible :lat, :lon, :headsign, :wmataid, :busid, :direction, :dev, :last_update
  belongs_to :map
end
