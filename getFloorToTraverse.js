const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const logUpdate = require('log-update')

const url = 'http://petakampus.itb.ac.id/search/search_map.php'
const baseUrl = 'http://petakampus.itb.ac.id/'
let endpoint = 'lantai_gmap2.php?id_gedung='+100128+'&id_lantai='+10012802+'&gid='+72


const rooms = []
let traversedFloor = {}
console.log(`Fetching from '${url}' at ${new Date().toLocaleString()}.`)
axios.get(url).then((response) => {
  console.log(`Got response at ${new Date().toLocaleString()}, parsing data.`)
  var $ = cheerio.load(response.data);
  $('td').each((i, elm) => {
    let child = $(elm).children().first()
    // remove the chevron and unneeded spaces
    let childText = child.text().split('»').join('').slice(1).split(', ')
    let name = childText[0]
    let building = childText[1]
    let attrib = child.attr('onclick').split('javascript:lookat2(').join('').split(')').join('').split(', ').join(',').split(',')
    // The lat and lon here is just the general position of the building the room is in.
    let room = {
      name,
      building,
      lat: attrib[0],
      lon: attrib[1],
      alt: attrib[2],
      heading: attrib[3],
      tilt: attrib[4],
      range: attrib[5],
      buildingId: attrib[6],
      floorId: attrib[7],
      gId: attrib[8]
    }
    rooms.push(room)
  })
  console.log(`Returning ${rooms.length} parsed rooms.`)
  return rooms
}).then(roomsResponse => {
  let floorsToTraverse = {}
  let buildingsToTraverse = {}
  roomsResponse.forEach((room, i) => {
    floorsToTraverse['' + room.floorId] = []
    buildingsToTraverse['' + room.buildingId] = []
  })
  console.log(`There are ${Object.keys(buildingsToTraverse).length} buildings`)
  console.log(`There are ${Object.keys(floorsToTraverse).length} floors`)
  return {
    roomsResponse,
    floorsToTraverse,
    buildingsToTraverse
  }
}).then((obj) => {
  let {roomsResponse, floorsToTraverse, buildingsToTraverse} = obj
  roomsResponse.forEach((room, i) => {
    floorsToTraverse[room.floorId].push(room)
  })
  Object.keys(floorsToTraverse).forEach(floor => {
    buildingsToTraverse[floor.slice(0, -2)].push(floor)
  })
  // console.log(buildingsToTraverse)
  // console.log(floorsToTraverse)
  // console.log(roomsResponse)
  return {
    roomsResponse,
    floorsToTraverse,
    buildingsToTraverse
  }
})

.then(obj => {
  let {roomsResponse, floorsToTraverse, buildingsToTraverse} = obj
  let roomsProcessed = 0
  let floorsProcessed = 0
  let polygonsProcessed = 0
  Object.keys(buildingsToTraverse).forEach(building => {
    let floorsInThisBuilding = buildingsToTraverse[building]
    console.log(`${building}: ${floorsInThisBuilding.length} floors.`)
    floorsInThisBuilding.forEach((floor, i) => {
      let roomsInThisFloor = floorsToTraverse[floor]
      console.log(`  (${i}) Floor ${floor}: ${roomsInThisFloor.length} rooms.`)
      roomsInThisFloor.forEach(room => {
        console.log(`    > Room ${room.name}`)
        // roomsProcessed++
        // logUpdate(`Processed ${roomsProcessed} rooms.`)
        // if (roomsProcessed === roomsResponse.length) console.log(`Processed ${roomsProcessed} rooms.`)
      })
      // console.log(`  Parsing floor ${floor} for polygons.`)
      let firstRoomInThisFloor = roomsInThisFloor[0]
      axios.get(baseUrl + `lantai_gmap2.php?id_gedung=${firstRoomInThisFloor.buildingId}&id_lantai=${firstRoomInThisFloor.floorId}&gid=${firstRoomInThisFloor.gId}`).then((response) => {
        let $ = cheerio.load(response.data)
        let rawCoordsArray = $('script')[1].children[0].data.split('var triangleCoords = [\r\n           \r\n        \r\n')
        rawCoordsArray.forEach((str, i) => {
          let polygon = {}
          // Sanitize from first elm.
          if (i > 0) {
            polygonsProcessed++
            polygon.type = 'polygon'
            polygon.name = str.split('document.getElementById(\'ifk\').innerHTML = \'')[1].split('\';')[0]
            polygon.coordinates = str.split('    \r\n    ];')[0].split('((').join('').split('new google.maps.LatLng(').filter((elm, i) => {
              return i > 0
            }).map((coordString, i) => {
              return coordString.split('),')[0].split(',').map((coordNumber) => {
                let realNumber = Number(coordNumber)
                return realNumber
              })
            }).filter((coordinate) => {
              return ((coordinate[0] != null) && (coordinate[1] != null))
            })
            // polygon.coordinates = str.split('    \r\n    ];')[0].split('new google.maps.LatLng(').filter((elm, i) => {
            //   return i > 0
            // }).map((coordString, i) => {
            //   return coordString.split('),')[0].split(',').filter((coords) => {
            //     return coords
            //     // console.log(coords)
            //     // return true
            //   }).map((coordNumber) => {
            //     // console.log(coordNumber)
            //     return Number(coordNumber)
            //   })
            // }).filter((coords) => {
            //   return (typeof coords) === 'object' && (typeof coords[0]) === 'number' && (typeof coords[1]) === 'number' && coords[1] !== 'null' && coords[0] !== 'null'
            // })
            // polygon.coordinates.forEach(pair => {
            //   // if (pair.length !== 2 || pair[0] === NaN || pair[1] == NaN) {
            //   if (pair.length !== 2) {
            //     console.log(polygon)
            //   }
            // })
            // if (polygon.coordinates.length < 3) console.log(polygon)
            // if (polygon.name === 'Sekan' || polygon.name === 'Ruang Peminjaman Buku') console.log(polygon)
          }
        })
        floorsProcessed++; //floorsProcessed
        logUpdate(
          `Reading room ${firstRoomInThisFloor.name} in ${firstRoomInThisFloor.building} (${firstRoomInThisFloor.floorId})
          ${floorsProcessed}/${Object.keys(floorsToTraverse).length}: found ${polygonsProcessed} Polygons.`
        )
      })
    })
  })
})

// .then((rooms) => {
//   console.log(`Got rooms with length ${rooms.length}`)
//   const polygons = []
//   let traversedFloor = {}
//   let roomProcessed = 0
//   rooms.forEach((room) => {
//     axios.get(baseUrl + `lantai_gmap2.php?id_gedung=${room.buildingId}&id_lantai=${room.floorId}&gid=${room.gId}`).then((response) => {
//         roomProcessed++;
//         logUpdate(
// `Reading room ${room.name} in ${room.building} (${room.floorId})
// ${roomProcessed}/${rooms.length}`
//         )
//     })
//
//   })
// })
