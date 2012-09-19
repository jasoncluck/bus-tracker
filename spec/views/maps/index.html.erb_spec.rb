require 'spec_helper'

describe "maps/index" do
  before(:each) do
    assign(:maps, [
      stub_model(Map,
        :Buses => "Buses"
      ),
      stub_model(Map,
        :Buses => "Buses"
      )
    ])
  end

  it "renders a list of maps" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", :text => "Buses".to_s, :count => 2
  end
end
