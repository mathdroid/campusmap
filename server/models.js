
var mongoose = require('mongoose')

exports.Room = mongoose.model('rooms', new mongoose.Schema({
  name: String,
  building: String,
  lat: Number,
  lon: Number,
  alt: Number,
  heading: Number,
  tilt: Number,
  range: Number,
  buildingId: String,
  floorId: String,
  gId: String
}))
