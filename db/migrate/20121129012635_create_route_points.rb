class CreateRoutePoints < ActiveRecord::Migration
  def change
    create_table :route_points do |t|
      t.integer :seqnum
      t.float :lat
      t.float :lon
      t.reference :route

      t.timestamps
    end
  end
end
