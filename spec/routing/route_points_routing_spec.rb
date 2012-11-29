require "spec_helper"

describe RoutePointsController do
  describe "routing" do

    it "routes to #index" do
      get("/route_points").should route_to("route_points#index")
    end

    it "routes to #new" do
      get("/route_points/new").should route_to("route_points#new")
    end

    it "routes to #show" do
      get("/route_points/1").should route_to("route_points#show", :id => "1")
    end

    it "routes to #edit" do
      get("/route_points/1/edit").should route_to("route_points#edit", :id => "1")
    end

    it "routes to #create" do
      post("/route_points").should route_to("route_points#create")
    end

    it "routes to #update" do
      put("/route_points/1").should route_to("route_points#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/route_points/1").should route_to("route_points#destroy", :id => "1")
    end

  end
end
