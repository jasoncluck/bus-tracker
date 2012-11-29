class RoutePoint < ActiveRecord::Base
  attr_accessible :lat, :lon, :route, :seqnum

  belongs_to :route
end
