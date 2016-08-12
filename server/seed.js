
var mongoose = require('mongoose')
mongoose.connect('localhost/campusmap')
var campusData = require('../data/database')
var Room = require('./models').Room

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
})
