require 'spec_helper'

describe "routes/index" do
  before(:each) do
    assign(:routes, [
      stub_model(Route,
        :routeid => "Routeid",
        :direction => "Direction",
        :name => "Name"
      ),
      stub_model(Route,
        :routeid => "Routeid",
        :direction => "Direction",
        :name => "Name"
      )
    ])
  end

  it "renders a list of routes" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", :text => "Routeid".to_s, :count => 2
    assert_select "tr>td", :text => "Direction".to_s, :count => 2
    assert_select "tr>td", :text => "Name".to_s, :count => 2
  end
end
