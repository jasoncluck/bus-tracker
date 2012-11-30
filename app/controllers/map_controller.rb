include WmataHelper

class MapController < ApplicationController

  def index
  	#everytime the site index is accessed update the bus and stop table
    updateBusTable
    updateStopTable
    @buses = Bus.all

    if not @buses.empty? and not @buses.first.nil? and not @buses.first.draw.nil?
      gon.busBool = @buses.first.draw
    end
    
    respond_to do |format|
      format.html { render :index, layout: 'maplayout' }
      format.json { render json: @buses }
    end
  end
end
