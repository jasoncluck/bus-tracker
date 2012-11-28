class Bus < ActiveRecord::Base
  attr_accessible :lat, :lon, :headsign, :wmataid, :busid, :direction, :dev, :last_update
  validates :lat, :lon, :headsign, :wmataid, :busid, :direction, :dev, :last_update, :presence => true
  belongs_to :map
  has_one :route
end
