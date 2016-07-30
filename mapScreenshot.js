const Nightmare = require('nightmare')
// const nightmare = Nightmare({  })
const nightmare = Nightmare({ show: true })
const Parallel = require('paralleljs')

const fs = require('fs')

let rooms = []
try {
  fs.statSync('./rooms.json').isFile()
  let data = fs.readFileSync('./rooms.json')
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

let screenshot = (roomNum) => {
  let room = rooms[roomNum]
  let uri = `http://petakampus.itb.ac.id/lantai_gmap2.php?id_gedung=${room.buildingId}&id_lantai=${room.floorId}&gid=${room.gId}`
  console.dir(room)
  console.log(uri)
  nightmare
    .on('console', (type) => {
      // console.log(type)
    })
    .goto(uri)
    .wait(2500)
    .screenshot(`./data/${room.gId}-${room.building}-${room.name}.png`, {
      x: 424,
      y: 27,
      width: 480,
      height: 160
    })
    .end()
    .then((res) => {
      console.log(`SUCCESS MAPPING room ${room.gId}`)
    }).catch((error) => {
      console.log(`ERROR MAPPING room ${room.gId}`)
    });
}

screenshot(0)
// pRooms = new Parallel(rooms)
//
// pRooms.map(screenshot).then(() => {
//   console.log(arguments)
// })
