class AddHeadsignToRoutes < ActiveRecord::Migration
  def change
  	add_column :routes, :headsign, :string
  end
end
