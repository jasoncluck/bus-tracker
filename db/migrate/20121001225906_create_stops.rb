class CreateStops < ActiveRecord::Migration
	def up
		create_table :stops do |t|
			t.integer :stopid
			t.string :name
			t.string :wmataid
			t.float :lat
			t.float :lon
		end

		create_table :stop_route do |t|
			t.integer :stopid
			t.integer :routeid
			t.string :direction
			t.integer :seqno
		end

		add_column :buses, :busid, :integer
		add_column :buses, :direction, :string
	end

	def down
		drop_table :stops
		drop_table :routes
		drop_table :stop_route
		remove_column :buses, :busid
		remove_column :buses, :direction		
	end
end
