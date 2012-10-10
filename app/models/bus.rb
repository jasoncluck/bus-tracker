class Bus < ActiveRecord::Base
  attr_accessible :lat, :lon, :headsign, :wmataid, :busid, :direction, :dev
  belongs_to :map
end
