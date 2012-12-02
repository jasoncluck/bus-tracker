require 'spec_helper'

describe "stops/index" do
  before(:each) do
    assign(:stops, [
      stub_model(Stop),
      stub_model(Stop)
    ])
  end

  it "renders a list of stops" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
  end
end
