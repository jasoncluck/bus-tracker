require 'spec_helper'

describe "maps/show" do
  before(:each) do
    @map = assign(:map, stub_model(Map,
      :Buses => "Buses"
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/Buses/)
  end
end
