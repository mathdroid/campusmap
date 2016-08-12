'use strict'
// var mongoose = require('mongoose')
// // Set up MongoDB connection
// var connection = mongoose.connect('localhost/campusmap')
//
var Room = require('./models').Room

module.exports.rooms = function * rooms(next) {
  if ('GET' != this.method) return yield next;
  // Query for all rooms
  let newRooms = yield Room.find({})
  // Set rooms as JSON response
  this.body = newRooms
}

module.exports.roomByName = function * roomByName(name, next) {
  if ('GET' != this.method) return yield next;
  // Query for all rooms
  let rooms = yield Room.find({'name': {'$regex': name, '$options': 'i'}})
  // Set rooms as JSON response
  this.body = rooms
}

module.exports.home = function * home(next) {
  if ('GET' != this.method) return yield next;
  this.body = yield {msg: 'welcome to campusmap API server 🎉'}
}

module.exports.head = function *(){
  return;
};

module.exports.options = function *() {
  this.body = "Allow: HEAD,GET,PUT,DELETE,OPTIONS";
};

module.exports.trace = function *() {
  this.body = "Smart! But you can't trace.";
};
