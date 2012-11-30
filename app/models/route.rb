class Route < ActiveRecord::Base
  attr_accessible :name, :direction, :routeid, :mean_lat, :mean_lon
  validates :name, :direction, :routeid, :presence => true

  has_many :route_points, :dependent => :destroy

  def left_of?( p1, p2, p)
    return ((p2[0] - p1[0])*(p[1] - p1[1]) - (p2[1] - p1[1])*(p[0] - p1[0])) > 0;
  end

  def self.group_name ( group )
    case group
    when 1
      return "Virginia"
    when 2
      return "SE DC / PG Count"
    when 3
      return "Central DC"
    end
    return "NW MD"
  end

  # Determines how to partition routes...
  # Group 1 - VA: left of (38.85, -77.3) -> (39.29, -77.45)
  #               and left of (38.4, -77.04) -> (38.85, -77.03)
  # Group 2 - Southern MD:  right of (38.4, -77.04) -> (38.85, -77.03)
  #                        and right of (38.85, -77.03) -> (39.18, -76.45)
  # Group 3 - DC:  
  def in_group?( group, point )
    points = [
      [38.85, -77.03], # 0- Central DC
      [39.29, -77.45], # 1- Western VA
      [38.4, -77.04], #  2- Southern MD
      [39.18, -76.45], # 3- Baltimore
      [38.73, -76.63], # 4- DC north line SE
      [39.17, -77.33], # 5- DC north line NW
    ]
    left1 = left_of? points[1], points[0], point
    left2 = left_of? points[0], points[2], point
    left3 = left_of? points[3], points[0], point
    left4 = left_of? points[5], points[4], point

    #print "Left1: #{left1}, Left2: #{left2}, Left3: #{left3}, Left4: #{left4}\n"

    if left1 and left2
      return group == 1 # VA
    elsif !left2 and !left3
      return group == 2 # SE DC / PG County
    elsif !left1 and left3 and left4
      return group == 3 # Main DC
    end
    return true # Northern MD ... anywhere else
  end

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
