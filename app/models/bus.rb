class Bus < ActiveRecord::Base
  attr_accessible :location, :name
  belongs_to :map
end
