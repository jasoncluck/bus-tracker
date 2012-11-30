class StopsController < ApplicationController
  # GET /stops
  # GET /stops.json
  def index
    @stops = Stop.all
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @stops }
    end
  end
end
