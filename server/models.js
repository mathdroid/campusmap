
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

exports.Floor = mongoose.model('floors', new mongoose.Schema({

}))
exports.Building = mongoose.model('buildings', new mongoose.Schema({

}))
exports.FloorPolygon = mongoose.model('floorPolygons', new mongoose.Schema({

}))
exports.VRoomPolygon = mongoose.model('vRoomPolygons', new mongoose.Schema({

}))
