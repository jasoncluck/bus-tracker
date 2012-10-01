class FixLocation < ActiveRecord::Migration

  def change
	rename_column :buses, :location, :headsign
  	add_column :buses, :lat, :float
  	add_column :buses, :lon, :float
  	add_column :buses, :dev, :float
  	add_column :buses, :wmataid, :string
  end

end
