class RoutePointsController < ApplicationController
  # GET /route_points
  # GET /route_points.json
  def index
    @route_points = RoutePoint.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @route_points }
    end
  end

  # GET /route_points/1
  # GET /route_points/1.json
  def show
    @route_point = RoutePoint.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @route_point }
    end
  end

  # GET /route_points/new
  # GET /route_points/new.json
  def new
    @route_point = RoutePoint.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @route_point }
    end
  end

  # GET /route_points/1/edit
  def edit
    @route_point = RoutePoint.find(params[:id])
  end

  # POST /route_points
  # POST /route_points.json
  def create
    @route_point = RoutePoint.new(params[:route_point])

    respond_to do |format|
      if @route_point.save
        format.html { redirect_to @route_point, notice: 'Route point was successfully created.' }
        format.json { render json: @route_point, status: :created, location: @route_point }
      else
        format.html { render action: "new" }
        format.json { render json: @route_point.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /route_points/1
  # PUT /route_points/1.json
  def update
    @route_point = RoutePoint.find(params[:id])

    respond_to do |format|
      if @route_point.update_attributes(params[:route_point])
        format.html { redirect_to @route_point, notice: 'Route point was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @route_point.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /route_points/1
  # DELETE /route_points/1.json
  def destroy
    @route_point = RoutePoint.find(params[:id])
    @route_point.destroy

    respond_to do |format|
      format.html { redirect_to route_points_url }
      format.json { head :no_content }
    end
  end
end
