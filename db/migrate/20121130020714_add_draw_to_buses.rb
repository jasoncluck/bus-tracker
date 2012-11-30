class AddDrawToBuses < ActiveRecord::Migration
  def change
  	add_column :buses, :draw, :boolean
  	add_column :stops, :draw, :boolean
  end
end
