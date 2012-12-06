class MapController < ApplicationController

require "#{Rails.root}/lib/wmata_helper"
include WmataHelper


  def index
  	#everytime the site index is accessed update the bus and stop table
    @buses = Bus.all
    updateBusTable
	   
    respond_to do |format|
      format.html { render :index, layout: 'maplayout' }
      format.json { render json: @buses }
    end
  end
end
