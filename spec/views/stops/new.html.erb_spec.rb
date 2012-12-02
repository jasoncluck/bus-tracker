require 'spec_helper'

describe "stops/new" do
  before(:each) do
    assign(:stop, stub_model(Stop).as_new_record)
  end

  it "renders new stop form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form", :action => stops_path, :method => "post" do
    end
  end
end
