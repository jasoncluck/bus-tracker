require 'spec_helper'

describe "routes/show" do
  before(:each) do
    @route = assign(:route, stub_model(Route,
      :routeid => "Routeid",
      :direction => "Direction",
      :name => "Name"
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/Routeid/)
    rendered.should match(/Direction/)
    rendered.should match(/Name/)
  end
end
