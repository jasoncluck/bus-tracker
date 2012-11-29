require 'spec_helper'

describe "route_points/show" do
  before(:each) do
    @route_point = assign(:route_point, stub_model(RoutePoint,
      :seqnum => 1,
      :lat => 1.5,
      :lon => 1.5,
      :route => ""
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/1/)
    rendered.should match(/1.5/)
    rendered.should match(/1.5/)
    rendered.should match(//)
  end
end
