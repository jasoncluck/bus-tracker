require "spec_helper"

describe RoutesController do
  describe "routing" do

    it "routes to #index" do
      get("/routes").should route_to("routes#index")
    end

    it "routes to #new" do
      get("/routes/new").should route_to("routes#new")
    end

    it "routes to #show" do
      get("/routes/1").should route_to("routes#show", :id => "1")
    end

    it "routes to #edit" do
      get("/routes/1/edit").should route_to("routes#edit", :id => "1")
    end

    it "routes to #create" do
      post("/routes").should route_to("routes#create")
    end

    it "routes to #update" do
      put("/routes/1").should route_to("routes#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/routes/1").should route_to("routes#destroy", :id => "1")
    end

  end
end
