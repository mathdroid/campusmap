const Nightmare = require('nightmare')
// const nightmare = Nightmare({  })
const Parallel = require('paralleljs')
const Async = require('async')
const asyncLoop = require('node-async-loop')

const fs = require('fs')

let rooms = []
try {
  fs.statSync('./data/rooms.json').isFile()
  let data = fs.readFileSync('./data/rooms.json')
  try {
    rooms = JSON.parse(data).rooms
  // console.dir(config)
  } catch (err) {
    console.log(' There has been an error parsing /config.json.')
    rooms = []
  }
} catch (err) {
  console.log(' No configuration file found.')
  rooms = []
}
// console.dir(rooms[rooms.length - 1])

let screenshot = (room, next) => {
  let uri = `http://petakampus.itb.ac.id/lantai_gmap2.php?id_gedung=${room.buildingId}&id_lantai=${room.floorId}&gid=${room.gId}`

  let nightmare = Nightmare({ show: true })
  console.dir(room)
  console.log(uri)
  setTimeout(() => {
    nightmare
      .goto(uri)
      .wait(2500)
      .screenshot(`./data/img/${room.gId}-${room.building}-${room.name}.png`, {
        x: 424,
        y: 27,
        width: 480,
        height: 160
      })
      .end()
      .then((res) => {
        console.log(`SUCCESS MAPPING room ${room.gId}`)
        next()
      }).catch((error) => {
        console.log(`ERROR MAPPING room ${room.gId}`)
        next()
      });
  },100)

}

asyncLoop(rooms, screenshot)
// pRooms = new Parallel(rooms)
//
// pRooms.map(screenshot).then(() => {
//   console.log(arguments)
// })
