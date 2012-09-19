require 'spec_helper'

describe "maps/new" do
  before(:each) do
    assign(:map, stub_model(Map,
      :Buses => "MyString"
    ).as_new_record)
  end

  it "renders new map form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form", :action => maps_path, :method => "post" do
      assert_select "input#map_Buses", :name => "map[Buses]"
    end
  end
end
