class MapController < ApplicationController

  def index
  	#everytime the site index is accessed update the bus and stop table
    @buses = Bus.all
	   
    respond_to do |format|
      format.html { render :index, layout: 'maplayout' }
      format.json { render json: @buses }
    end
  end
end
