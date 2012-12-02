require 'spec_helper'

describe "stops/show" do
  before(:each) do
    @stop = assign(:stop, stub_model(Stop))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
  end
end
