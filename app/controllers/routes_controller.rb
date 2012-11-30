include WmataHelper

class RoutesController < ApplicationController

  def group
    @routes = Route.all
    @group_routes = []
    @routes.each do |route|
      if route.in_group? params[:id].to_i, [route.mean_lat, route.mean_lon]
        @group_routes << route
      end
    end

    @routes = @group_routes
    logger.info "Selected #{@group_routes.length} routes in group #{params[:id]}"
    @kml_name="WMATA Bus Routes (#{params[:id]})"
    @kml_desc="WMATA buses from grouping #{params[:id]} (#{@routes.length})"
    @alt=50
    respond_to do |format|
      format.kml { render kml: @routes, :action => "index" }
    end
  end

  def means
    @routes = Route.all

    respond_to do |format|
      format.kml { render kml: @routes }
    end
  end

  # GET /routes
  # GET /routes.json
  def index
    @routes = Route.all
    @alt=50
    @kml_name="WMATA Bus"
    @kml_desc="WMATA Bus Routes"
    respond_to do |format|
      format.html 
      format.kml { render kml: @routes }
      format.json { render json: @routes }
    end
  end

  # GET /routes/1
  # GET /routes/1.json
  def show
    @route = Route.find(params[:id])
    respond_to do |format|
      format.html # show.html.erb
      format.kml {
        @alt=50
        render kml: @route
      }
      format.json { render json: @route }
    end
  end

  # GET /routes/new
  # GET /routes/new.json
  def new
    @route = Route.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @route }
    end
  end

  # GET /routes/1/edit
  def edit
    @route = Route.find(params[:id])
  end

  # POST /routes
  # POST /routes.json
  def create
    @route = Route.new(params[:route])

    respond_to do |format|
      if @route.save
        format.html { redirect_to @route, notice: 'Route was successfully created.' }
        format.json { render json: @route, status: :created, location: @route }
      else
        format.html { render action: "new" }
        format.json { render json: @route.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /routes/1
  # PUT /routes/1.json
  def update
    @route = Route.find(params[:id])

    respond_to do |format|
      if @route.update_attributes(params[:route])
        format.html { redirect_to @route, notice: 'Route was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @route.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /routes/1
  # DELETE /routes/1.json
  def destroy
    @route = Route.find(params[:id])
    @route.destroy

    respond_to do |format|
      format.html { redirect_to routes_url }
      format.json { head :no_content }
    end
  end
end
