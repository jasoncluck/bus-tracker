class Bus < ActiveRecord::Base
  attr_accessible :lat, :lon, :headsign, :wmataid, :busid, :direction, :dev, :last_update, :draw
  belongs_to :map
  has_one :route
end
