class AddUpdateTimeToBus < ActiveRecord::Migration
  def change
  	add_column :buses, :last_update, :datetime
  end
end
