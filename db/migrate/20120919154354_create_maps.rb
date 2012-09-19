class CreateMaps < ActiveRecord::Migration
  def change
    create_table :maps do |t|
      t.string :Buses

      t.timestamps
    end
  end
end
