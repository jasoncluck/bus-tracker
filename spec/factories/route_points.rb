# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :route_point do
    seqnum 1
    lat 1.5
    lon 1.5
    route ""
  end
end
