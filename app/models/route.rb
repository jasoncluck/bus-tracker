include KML

class Route < ActiveRecord::Base
  attr_accessible :name, :direction, :routeid
  validates :name, :direction, :routeid, :presence => true

  has_many :route_points, :dependent => :destroy
end
