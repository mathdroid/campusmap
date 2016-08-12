
var mongoose = require('mongoose')
var campusData = require('../data/database')
var Room = require('./models').Room

console.log(Object.keys(campusData))
campusData.rooms.data.forEach(room => {
  let newRoom = new Room()
  Object.keys(room).forEach(key => {
    newRoom[key] = room[key]
  })
  newRoom.save()
})
