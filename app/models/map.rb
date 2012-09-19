class Map < ActiveRecord::Base
  attr_accessible :Buses
  has_many :buses
end
