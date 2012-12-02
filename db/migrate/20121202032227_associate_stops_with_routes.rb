class AssociateStopsWithRoutes < ActiveRecord::Migration
  def up
  	create_table :routes_stops, :id => false do |t|
      t.integer :stop_id, :null => false
      t.integer :route_id, :null => false
    end
  end

  def down
  	drop_table :routes_stops
  end
end
