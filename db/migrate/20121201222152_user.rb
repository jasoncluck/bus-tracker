class User < ActiveRecord::Migration
  def up
		create_table :users do |t|
			t.float :lat
			t.float :lon
		end
  end

  def down
  	drop_table :users
  end
end
