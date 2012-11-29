class Route < ActiveRecord::Base
  attr_accessible :name, :direction, :routeid
  
  validates :name, :direction, :routeid, :presence => true
end
