class RoutePoint < ActiveRecord::Base
  attr_accessible :lat, :lon, :route, :seqnum
  validates :lat, :lon, :route, :seqnum, :presence => true
  belongs_to :route
end
