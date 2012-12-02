class DropOldStopRouteTable < ActiveRecord::Migration
  def up
  	drop_table :stop_route
  end

  def down
  	create_table :stop_route do |t|
		t.integer :stopid
		t.integer :routeid
		t.string :direction
		t.integer :seqno
	end	
  end
end
