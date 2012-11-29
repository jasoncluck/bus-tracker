class RoutePointsController < ApplicationController

	def index
		@route_points = RoutePoint.all

		respond_to do |format|
			format.html { render :index, layout: 'nonmap' }
			format.json { render json: @route_points }
		end
	end
end
