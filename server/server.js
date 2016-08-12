'use strict'
// Dependencies
var koa = require('koa')
var route = require('koa-route')
var compress = require('koa-compress')
var logger = require('koa-logger')
var mongoose = require('mongoose')
var Room = require('./models').Room
const controller = require('./controller')

// Set up MongoDB connection
var connection = mongoose.connect('localhost/campusmap')

// Create koa app
var app = koa()
app.use(logger())

// API routes
app.use(route.get('/', controller.home))
app.use(route.get('/rooms', controller.rooms))
app.use(route.get('/rooms/name/:name', controller.roomByName))

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
