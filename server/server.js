'use strict'
// Dependencies
var koa = require('koa')
var route = require('koa-route')
var compress = require('koa-compress')
var logger = require('koa-logger')
var mongoose = require('mongoose')
var Room = require('./models').Room
var Floor = require('./models').Floor
var Building = require('./models').Building
var FloorPolygon = require('./models').FloorPolygon
var VRoomPolygon = require('./models').VRoomPolygon
const controller = require('./controller')

// Set up MongoDB connection
var connection = mongoose.connect('localhost/campusmap')

// Create koa app
var app = koa()
app.use(logger())

// API routes
app.use(route.get('/', controller.home))
app.use(route.get('/rooms', controller.rooms))
app.use(route.get('/rooms/name/:name', controller.roomsByName))
app.use(route.get('/rooms/id/:roomId', controller.roomsById))
app.use(route.get('/floors', controller.floors))
app.use(route.get('/floors/id/:id', controller.floorsById))
app.use(route.get('/buildings', controller.buildings))
app.use(route.get('/buildings/name/:name', controller.buildingsByName))
app.use(route.get('/buildings/id/:id', controller.buildingsById))
app.use(route.get('/floor-polygons', controller.floorPolygons))
app.use(route.get('/floor-polygons/id/:floorId', controller.floorPolygonsById))
app.use(route.get('/v-room-polygons', controller.vRoomPolygons))
app.use(route.get('/v-room-polygons/name/:name', controller.vRoomPolygonsByName))
app.use(route.get('/v-room-polygons/id/:roomId', controller.vRoomPolygonsById))

app.use(route.options('/', controller.options));
app.use(route.trace('/', controller.trace));
app.use(route.head('/', controller.head));

app.use(compress())

// Define configurable port
var port = process.env.CAMPUSMAP_PORT || 3000

// Listen for connections
app.listen(port)

// Log port
console.log('Server listening on port ' + port)
