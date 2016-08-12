
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
  gId: String,
  roomId: String
}))

exports.Floor = mongoose.model('floors', new mongoose.Schema({
  id: String,
  buildingId: String,
  buildingName: String,
  rooms: [{
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
  }]

}))
exports.Building = mongoose.model('buildings', new mongoose.Schema({
  id: String,
  name: String,
  floors: [{
    id: String,
    rooms: [String]
  }]
}))
exports.FloorPolygon = mongoose.model('floorPolygons', new mongoose.Schema({
  floorId: String,
  buildingId: String,
  polygons: [{
    type: String,
    name: String,
    buildingName: String,
    buildingId: String,
    floorId: String,
    coordinates: [[]]
  }]

}))
exports.VRoomPolygon = mongoose.model('vRoomPolygons', new mongoose.Schema({
  type: String,
  name: String,
  roomName: String,
  buildingName: String,
  buildingId: String,
  floorId: String,
  gId: String,
  roomId: String,
  coordinates: [[ Number ]]

}))
