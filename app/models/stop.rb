class Stop < ActiveRecord::Base
  attr_accessible :stopid, :name, :wmataid, :lat, :lon
  belongs_to :map
  has_many :routes
end
