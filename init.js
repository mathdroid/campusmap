'use strict'
const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const logUpdate = require('log-update')

const ProgressBar = require('progress')

const PromiseThrottle = require('promise-throttle')
var promiseThrottle = new PromiseThrottle({
  requestsPerSecond: 15,           // up to 1 request per second
  promiseImplementation: Promise  // the Promise library you are using
});


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
      gId: attrib[8],
      roomId: attrib[7] + attrib[8]
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
  console.log('Parsing rooms response.')
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
  console.log('Preparing Floors and Buildings')
  let {roomsResponse, floorsToTraverse, buildingsToTraverse} = obj
  roomsResponse.forEach((room, i) => {
    floorsToTraverse[room.floorId].push(room)
  })
  Object.keys(floorsToTraverse).forEach(floor => {
    buildingsToTraverse[floor.slice(0, -2)].push(floor)
  })
  return {
    roomsResponse,
    floorsToTraverse,
    buildingsToTraverse
  }
})

.then(obj => {
  console.log('Inputting the data to Floors and Buildings')
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
        buildingName: buildingName,
        rooms: []
      }
      let roomsInThisFloor = floorsToTraverse[floor]
      console.log(`  (${i}) Floor ${floor.slice(-2)}: ${roomsInThisFloor.length} rooms.`)

      roomsInThisFloor.forEach((room, roomIdx) => {
        newFloor.rooms.push(room)
        console.log(`    ${room.gId} > Room ${room.name} of building ${room.building}. initial coordinates: [${room.lat}, ${room.lon}]`)
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
  console.log('Crawling for the polygons of each floor')
  let { rooms, floors, buildings } = obj
  let validatedRoomPolygons = []

  let bar = new ProgressBar('Crawled floor ":floorId" : :current/:total [:bar] :percent :etas', { total: floors.length })
  return axios.all(floors.map(floor => {
    return promiseThrottle.add(() => axios.get(baseUrl + `lantai_gmap2.php?id_gedung=${floor.buildingId}&id_lantai=${floor.id}&gid=${floor.rooms[0].gId}`)).then(response => {
      bar.tick({'floorId': floor.id})
      let $ = cheerio.load(response.data)
      // read the script, iterate over all trianglecoords, skip the first index (before the first 'var triangleCoords')
      let rawPolygons = $('script')[1].children[0].data.split('var triangleCoords = [\r\n           \r\n        \r\n').slice(1)
      let parsedPolygons = rawPolygons.map(rawPolygon => {
        let newPolygon = {
          type: 'polygon',
          name: rawPolygon.split('document.getElementById(\'ifk\').innerHTML = \'')[1].split('\';')[0],
          buildingName: floor.buildingName,

          buildingId: floor.buildingId,
          floorId: floor.id,
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
      validatedRoomPolygons.push(parsedPolygons.slice(-1)[0])
      return {floorId: floor.id, buildingId: floor.buildingId, polygons: parsedPolygons.slice(0, -1)}
    }).catch(reason => {
      console.log(reason)
      console.log(floor.id)
    })
  })).then(polygonsOfFloors => {
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
  console.log('creating list of validated room polygons.')
  let { rooms, floors, buildings, polygonsOfFloors, validatedRoomPolygons } = obj
  let roomsProcessed = 0
  let failedQueue = []
  let bar = new ProgressBar('Crawl progress: :current/:total. Failed: :failed [:bar] :percent :etas', { total: rooms.length, failed: failedQueue.length })
  return axios.all(rooms.map(room => {
    return promiseThrottle.add(() => axios.get(baseUrl + `lantai_gmap2.php?id_gedung=${room.buildingId}&id_lantai=${room.floorId}&gid=${room.gId}`)).then(resp => {
      bar.tick({'failed': failedQueue.length})
      let $ = cheerio.load(resp.data)
      // read the script, iterate over all trianglecoords, skip the first index (before the first 'var triangleCoords')
      let rawPolygon = $('script')[1].children[0].data.split('var triangleCoords = [\r\n           \r\n        \r\n').slice(-1)[0] // get the terminal elm
      let parsedPolygon = {
        type: 'polygon',
        name: rawPolygon.split('document.getElementById(\'ifk\').innerHTML = \'')[1].split('\';')[0],
        roomName: room.name,
        buildingName: room.building,
        buildingId: room.buildingId,
        floorId: room.floorId,
        gId: room.gId,
        roomId: room.roomId,
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

      return parsedPolygon
    }).catch(reason => {
      failedQueue.push(room)
      console.log(reason)
      console.log(failedQueue.length + ' Errored rooms.')
    })
  })).then(validatedPolygons => {
    return {
      rooms,
      floors,
      buildings,
      polygonsOfFloors,
      validatedPolygons
    }
  })

})

.then(obj => {
  console.log('last resolve')
  Object.keys(obj).forEach(key => {
    console.log(key + ': ' + obj[key].length)
  })
  return obj
})

.then(obj => {
  console.log('saving data...')

  fs.writeFile('./data/db.min.json', JSON.stringify({"data": obj}), (err) => {
    if (err) throw err
  })

  let fileString = Object.keys(obj).map(key => {
    return `exports.${key} = ${JSON.stringify({"data": obj[key]})}`
  }).join('\n')
  fs.writeFile('./data/database.js', fileString + '\n', (err) => {
    if (err) throw err
  })
  Object.keys(obj).forEach(key => {
    fs.writeFile(`./data/db${key}.min.json`, JSON.stringify({"data": obj[key]}), (err) => {
      if (err) throw err
    })
  })
})
