# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20121203162150) do

  create_table "buses", :force => true do |t|
    t.string   "name"
    t.string   "headsign"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
    t.float    "lat"
    t.float    "lon"
    t.float    "dev"
    t.string   "wmataid"
    t.integer  "busid"
    t.string   "direction"
    t.datetime "last_update"
    t.boolean  "draw"
  end

  create_table "delayed_jobs", :force => true do |t|
    t.integer  "priority",   :default => 0
    t.integer  "attempts",   :default => 0
    t.text     "handler"
    t.text     "last_error"
    t.datetime "run_at"
    t.datetime "locked_at"
    t.datetime "failed_at"
    t.string   "locked_by"
    t.string   "queue"
    t.datetime "created_at",                :null => false
    t.datetime "updated_at",                :null => false
  end

  add_index "delayed_jobs", ["priority", "run_at"], :name => "delayed_jobs_priority"

  create_table "route_points", :force => true do |t|
    t.integer  "seqnum"
    t.float    "lat"
    t.float    "lon"
    t.integer  "route_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "routes", :force => true do |t|
    t.string   "routeid"
    t.string   "direction"
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
    t.float    "mean_lat"
    t.float    "mean_lon"
    t.string   "headsign"
  end

  create_table "routes_stops", :id => false, :force => true do |t|
    t.integer "stop_id",  :null => false
    t.integer "route_id", :null => false
  end

  create_table "stops", :force => true do |t|
    t.integer "stopid"
    t.string  "name"
    t.string  "wmataid"
    t.float   "lat"
    t.float   "lon"
    t.boolean "draw"
  end

  create_table "users", :force => true do |t|
    t.float "lat"
    t.float "lon"
  end

end
