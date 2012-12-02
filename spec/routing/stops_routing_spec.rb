require "spec_helper"

describe StopsController do
  describe "routing" do

    it "routes to #index" do
      get("/stops").should route_to("stops#index")
    end

    it "routes to #new" do
      get("/stops/new").should route_to("stops#new")
    end

    it "routes to #show" do
      get("/stops/1").should route_to("stops#show", :id => "1")
    end

    it "routes to #edit" do
      get("/stops/1/edit").should route_to("stops#edit", :id => "1")
    end

    it "routes to #create" do
      post("/stops").should route_to("stops#create")
    end

    it "routes to #update" do
      put("/stops/1").should route_to("stops#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/stops/1").should route_to("stops#destroy", :id => "1")
    end

  end
end
