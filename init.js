const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const logUpdate = require('log-update')

const url = 'http://petakampus.itb.ac.id/search/search_map.php'
const baseUrl = 'http://petakampus.itb.ac.id/'
let endpoint = 'lantai_gmap2.php?id_gedung='+100128+'&id_lantai='+10012802+'&gid='+72


const rooms = []
const gids = []
let traversedFloor = {}
console.log(`Fetching from '${url}' at ${new Date().toLocaleString()}.`)
axios.get(url).then((response) => {
  console.log(`Got response at ${new Date().toLocaleString()}, parsing data.`)
  var $ = cheerio.load(response.data);
  $('td').each((i, elm) => {
    let child = $(elm).children().first()
    // remove the chevron and unneeded spaces
    let childText = child.text().split('»').join('').slice(1).split(', ')
    let name = childText.slice(0, -1).join(', ')
    let building = childText[childText.length - 1]
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
    if (gids.indexOf(room.gId) === -1) {
      rooms.push(room)
      gids.push(room.gId)
    } else {
      rooms.push(Object.assign({}, rooms.pop(), room))
    }
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
  let buildings = []
  let floors = []
  Object.keys(buildingsToTraverse).forEach(building => {
    let newBuilding = {}
    let floorsInThisBuilding = buildingsToTraverse[building]
    let buildingName = floorsInThisBuilding.reduce((prevName, floor, i) => {
      let thisFloorsName = floorsToTraverse[floor].reduce((prevNameFloor, room, i) => {
        if (prevNameFloor.length > room.building.length) {return prevNameFloor}
        return room.building
      }, '')
      if (prevName.length > thisFloorsName.length) {return prevName}
      return thisFloorsName
    }, '')
    console.log(`${buildingName} (${building}): ${floorsInThisBuilding.length} floors.`)

    floorsInThisBuilding.forEach((floor, i) => {
      let newFloor = {
        id: floor,
        buildingId: building,
        rooms: []
      }
      let roomsInThisFloor = floorsToTraverse[floor]
      console.log(`  (${i}) Floor ${floor.slice(-2)}: ${roomsInThisFloor.length} rooms.`)

      roomsInThisFloor.forEach((room, roomIdx) => {
        newFloor.rooms.push(room)
        if (roomIdx === 0) console.log(`    ${room.gId} > Room ${room.name} of building ${room.building}. initial coordinates: [${room.lat}, ${room.lon}]`)
      })
      floors.push(newFloor)
    })
    newBuilding.id = building
    newBuilding.name = buildingName
    newBuilding.floors = floorsInThisBuilding.map(floor => {
      return {
        id: floor,
        rooms: floorsToTraverse[floor].map(room => room.gId)
      }
    })
    buildings.push(newBuilding)
  })
  return {
    rooms: roomsResponse,
    floors,
    buildings
  }
})
.then(obj => {
  let { rooms, floors, buildings } = obj

  return axios.all(floors.map(floor => {
    return axios.get(baseUrl + `lantai_gmap2.php?id_gedung=${floor.buildingId}&id_lantai=${floor.id}&gid=${floor.rooms[0].gId}`)
  })).then(responses => {
    console.log(`${responses.length} floors fetched for polygons.`)
    let floorsProcessed = 0
    let validatedRoomPolygons = []
    let polygonsOfFloors = responses.map(response => {
      let $ = cheerio.load(response.data)
      // read the script, iterate over all trianglecoords, skip the first index (before the first 'var triangleCoords')
      let rawPolygons = $('script')[1].children[0].data.split('var triangleCoords = [\r\n           \r\n        \r\n').slice(1)
      let parsedPolygons = rawPolygons.map(rawPolygon => {
        let newPolygon = {
          type: 'polygon',
          name: rawPolygon.split('document.getElementById(\'ifk\').innerHTML = \'')[1].split('\';')[0],
          coordinates: rawPolygon.split('    \r\n    ];')[0].split('new google.maps.LatLng(').filter((elm, i) => {
            return i > 0
          }).map((coordString, i) => {
            return coordString.split('),')[0].split(',').map((coordNumber) => {
              let realNumber = Number(coordNumber)
              return realNumber
            })
          }).filter((coordinate) => {
            return ((coordinate[0] != null) && (coordinate[1] != null))
          })
        }
        return newPolygon
      })
      // floorsProcessed++
      // logUpdate(`parsing floor ${floorsProcessed} out of ${floors.length}`)
      validatedRoomPolygons.push(parsedPolygons.slice(-1)[0])
      return parsedPolygons.slice(0, -1)
    })
    return {
      rooms,
      floors,
      buildings,
      polygonsOfFloors,
      validatedRoomPolygons
    }
  })

})
.then(obj => {
  console.log('last resolve')
  Object.keys(obj).forEach(key => {
    console.log(key)
  })
  console.log(obj.polygonsOfFloors[0])
  console.log(obj.validatedRoomPolygons[0])
  console.log(obj.polygonsOfFloors[0].indexOf(obj.validatedRoomPolygons[0]))
  // obj.validatedRoomPolygons.forEach(vrp => {
  //   console.log(vrp.name)
  // })
  // obj.polygonsOfFloors.forEach(pof => {
  //   console.log(pof.length)
  // })
})

// axios.get(baseUrl + `lantai_gmap2.php?id_gedung=${room.buildingId}&id_lantai=${room.floorId}&gid=${room.gId}`)
// .then((response) => {
//   let $ = cheerio.load(response.data)
//   let rawPolygons = $('script')[1].children[0].data.split('var triangleCoords = [\r\n           \r\n        \r\n').slice(1)
//   let parsedPolygons = rawPolygons.map(rawPolygon => {
//     let newPolygon = {
//       type: 'polygon',
//       name: rawPolygon.split('document.getElementById(\'ifk\').innerHTML = \'')[1].split('\';')[0],
//       coordinates: rawPolygon.split('    \r\n    ];')[0].split('new google.maps.LatLng(').filter((elm, i) => {
//         return i > 0
//       }).map((coordString, i) => {
//         return coordString.split('),')[0].split(',').map((coordNumber) => {
//           let realNumber = Number(coordNumber)
//           return realNumber
//         })
//       }).filter((coordinate) => {
//         return ((coordinate[0] != null) && (coordinate[1] != null))
//       })
//     }
//     return newPolygon
//   })
//   return parsedPolygons
// })
// .then(polygons => {
//   polygonsOfThisFloor = polygons.slice(0, -1)
//   polygonOfThisRoom = polygons.slice(-1)[0]
//
//   console.log(polygonOfThisRoom)
//   return {
//     polygonOfThisRoom,
//     polygonsOfThisFloor
//   }
// })

// .then(obj => {
//   // console.log(obj.floors)
//   // console.log(JSON.stringify(obj.buildings, null, 2))
//   // console.log(JSON.stringify(obj.floors, null, 2))
//   // console.log(JSON.stringify(obj.rooms, null, 2))
//   fs.writeFile('./data/database.js', `export const buildings = ${JSON.stringify({"data": obj.buildings})}
//   export const floors = ${JSON.stringify({"data": obj.floors})}
//   export const rooms = ${JSON.stringify({"data": obj.rooms})}\n`, (err) => {
//     if (err) throw err
//   })
//   // fs.writeFile('./data/dbFloors.min.json', JSON.stringify({"data": obj.floors}), (err) => {
//   //   if (err) throw err
//   // })
//   // fs.writeFile('./data/dbRooms.min.json', JSON.stringify({"data": obj.rooms}), (err) => {
//   //   if (err) throw err
//   // })
// })
