
var mongoose = require('mongoose')
mongoose.connect('localhost/campusmap')
var campusData = require('../data/database')
var Room = require('./models').Room
var Floor = require('./models').Floor
var Building = require('./models').Building
var FloorPolygon = require('./models').FloorPolygon
var VRoomPolygon = require('./models').VRoomPolygon

// console.log(Object.keys(campusData))
// campusData.rooms.data.forEach(room => {
//   let newRoom = new Room()
//   Object.keys(room).forEach(key => {
//     newRoom[key] = room[key]
//   })
//   newRoom.save()
// })

Object.keys(campusData).forEach(key => {
  console.log(campusData[key].data[0])
  campusData[key].data.forEach(obj => {
    let newObj
    switch(key) {
      case 'rooms':
        newObj = new Room()
        break
      case 'floors':
        newObj = new Floor()
        break
      case 'buildings':
        newObj = new Building()
        break
      case 'polygonsOfFloors':
        newObj = new FloorPolygon()
        break
      case 'validatedPolygons':
        newObj = new VRoomPolygon()
        break
      default:
        break
    }
    Object.assign(newObj, obj)
    newObj.save()

  })
})
