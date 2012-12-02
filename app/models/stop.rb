class Stop < ActiveRecord::Base
  attr_accessible :stopid, :name, :wmataid, :lat, :lon
  validates :stopid, :name, :lat, :lon, :presence => true
  belongs_to :map
  has_and_belongs_to_many :routes
end
