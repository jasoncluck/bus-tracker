class AddMeansToRoutes < ActiveRecord::Migration

  # This anonymouse inner class allows this migration to work even if
  # the Route model changes prior to running the migration
  class Route < ActiveRecord::Base
  	attr_accessible :mean_lat, :mean_lon
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

  def change

  	add_column :routes, :mean_lat, :float
  	add_column :routes, :mean_lon, :float

  	Route.reset_column_information
  	Route.all.each do |route|
  		mn=route.mean
  		route.update_attributes(:mean_lat => mn.lat, :mean_lon => mn.lon)
  	end
  end
end
