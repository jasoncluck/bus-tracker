require 'test_helper'

class RouteTest < ActiveSupport::TestCase
   test "VA groups" do
   	r=Route.new
   	assert r.in_group? 1, [38.85, -77.08]
   	assert r.in_group? 2, [38.84, -76.99]
   	assert r.in_group? 3, [38.88, -77.02]
   	assert r.in_group? 4, [39.88, -77.02]
   end
end