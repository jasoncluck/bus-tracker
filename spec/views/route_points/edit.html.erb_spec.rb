require 'spec_helper'

describe "route_points/edit" do
  before(:each) do
    @route_point = assign(:route_point, stub_model(RoutePoint,
      :seqnum => 1,
      :lat => 1.5,
      :lon => 1.5,
      :route => ""
    ))
  end

  it "renders the edit route_point form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form", :action => route_points_path(@route_point), :method => "post" do
      assert_select "input#route_point_seqnum", :name => "route_point[seqnum]"
      assert_select "input#route_point_lat", :name => "route_point[lat]"
      assert_select "input#route_point_lon", :name => "route_point[lon]"
      assert_select "input#route_point_route", :name => "route_point[route]"
    end
  end
end
