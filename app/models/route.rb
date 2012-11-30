class Route < ActiveRecord::Base
  attr_accessible :name, :direction, :routeid, :mean_lat, :mean_lon
  validates :name, :direction, :routeid, :presence => true

  has_many :route_points, :dependent => :destroy

  def mean
  	means=[0.0, 0.0]
  	route_points.each do |point|
  		means[0] = means[0] + point.lat
  		means[1] = means[1] + point.lon
  	end
  	means[0] =  means[0]/route_points.length
  	means[1] =  means[1]/route_points.length

  	return NamedPoint.new(means[0], means[1], name)
  end
end
