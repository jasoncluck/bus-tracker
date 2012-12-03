require 'json'

include WmataHelper

class StopsController < ApplicationController
  # GET /stops
  # GET /stops.json
  def index
    if params[:route]
      route_root = params[:route].dup
      #Strip out route variations
      if route_root =~ /[a-z].*/
        route_root[/[a-z].*/]=''
      end
      r=Route.where(routeid: route_root)
      @stops =[]
      if not r.nil?
        r.each do |route|
          @stops << route.stops
          @stops.flatten!
        end
      end
    else
      @stops = Stop.all
    end
    
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @stops }
    end
  end

  # GET /stops/1/predict
  # GET /stops/1/predict.json
  def predict
    @stop=Stop.find(params[:id])
    json=fetchPredictionRaw(@stop.stopid)
    @predictions=JSON.parse(json);
    @minimal=params[:minimal]
    respond_to do |format|
      format.html { render :predict, layout: !@minimal }
      format.json { render text: json }
    end
  end

  # GET /stops/1
  # GET /stops/1.json
  def show
    @stop = Stop.find(params[:id])
    @minimal=params[:minimal]
    respond_to do |format|
      format.html { render :show, :layout => !@minimal }
      format.json { render json: @stop }
    end
  end

  # GET /stops/new
  # GET /stops/new.json
  def new
    @stop = Stop.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @stop }
    end
  end

  # GET /stops/1/edit
  def edit
    @stop = Stop.find(params[:id])
  end

  # POST /stops
  # POST /stops.json
  def create
    @stop = Stop.new(params[:stop])

    respond_to do |format|
      if @stop.save
        format.html { redirect_to @stop, notice: 'Stop was successfully created.' }
        format.json { render json: @stop, status: :created, location: @stop }
      else
        format.html { render action: "new" }
        format.json { render json: @stop.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /stops/1
  # PUT /stops/1.json
  def update
    @stop = Stop.find(params[:id])

    respond_to do |format|
      if @stop.update_attributes(params[:stop])
        format.html { redirect_to @stop, notice: 'Stop was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @stop.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /stops/1
  # DELETE /stops/1.json
  def destroy
    @stop = Stop.find(params[:id])
    @stop.destroy

    respond_to do |format|
      format.html { redirect_to stops_url }
      format.json { head :no_content }
    end
  end
end
