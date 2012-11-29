require 'spec_helper'

describe "route_points/index" do
  before(:each) do
    assign(:route_points, [
      stub_model(RoutePoint,
        :seqnum => 1,
        :lat => 1.5,
        :lon => 1.5,
        :route => ""
      ),
      stub_model(RoutePoint,
        :seqnum => 1,
        :lat => 1.5,
        :lon => 1.5,
        :route => ""
      )
    ])
  end

  it "renders a list of route_points" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", :text => 1.to_s, :count => 2
    assert_select "tr>td", :text => 1.5.to_s, :count => 2
    assert_select "tr>td", :text => 1.5.to_s, :count => 2
    assert_select "tr>td", :text => "".to_s, :count => 2
  end
end
