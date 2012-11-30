class NamedPoint
  attr_accessor :lat, :lon, :name

  def initialize(lat, lon, name)
    @lat=lat
    @lon=lon
    @name=name
  end
end
