const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')

const url = 'http://petakampus.itb.ac.id/search/search_map.php'
const baseUrl = 'http://petakampus.itb.ac.id/'
let endpoint = 'lantai_gmap2.php?id_gedung='+100128+'&id_lantai='+10012802+'&gid='+72


const rooms = []
let traversedFloor = {}
axios.get(url).then((response) => {
  var $ = cheerio.load(response.data);
  // console.log($.html())
  $('td').each((i, elm) => {
    let child = $(elm).children().first()
    // remove the chevron and unneeded spaces
    let childText = child.text().split('»').join('').slice(1).split(', ')
    let name = childText[0]
    let building = childText[1]

    let attrib = child.attr('onclick').split('javascript:lookat2(').join('').split(')').join('').split(', ').join(',').split(',')

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
  return rooms
})
// .then((newRooms) => {
//   // console.log(newRooms)
//   let floors = {}
//   rooms.forEach((room, i) => {
//     console.log(i)
//     floors['' + room.floorId] = floors[room.floorId] || []
//     floors['' + room.floorId].push(room)
//     if(i === rooms.length -1) {
//       console.log(floors)
//     }
//   })
// })
.then(roomsResponse => {
  let floorsToTraverse = {}
  roomsResponse.forEach((room, i) => {
    floorsToTraverse['' + room.floorId] = []
  })
  // console.log(floorsToTraverse)
  return {
    roomsResponse,
    floorsToTraverse
  }
})

.then((obj) => {
  let {roomsResponse, floorsToTraverse} = obj
  roomsResponse.forEach((room, i) => {
    floorsToTraverse[room.floorId].push(room)
  })
  // console.log(floorsToTraverse)
  return floorsToTraverse
})

.then((floorsToTraverse) => {
  const polygons = []
  Object.keys(floorsToTraverse).forEach((key, i) => {
    console.log(`${key} has ${floorsToTraverse[key].length} rooms`)
    let room = floorsToTraverse[key][0]
    console.log(room)
    axios.get(baseUrl + `lantai_gmap2.php?id_gedung=${room.buildingId}&id_lantai=${room.floorId}&gid=${room.gId}`).then((response) => {
      console.log(`\nParsing floor ${room.floorId} room ${room.name}`)
      let $ = cheerio.load(response.data)
      let coordStarts = $('script')[1].children[0].data.split('var triangleCoords = [\r\n           \r\n        \r\n')
      // console.log(`${room.name} in ${room.building} (${room.floorId}) - ${coordStarts[1].split('document.getElementById(\'ifk\').innerHTML = \'')[1].split('\';')[0]}`)
      coordStarts.forEach((str, i) => {
        let polygon = {}
        if (i > 0) {
          polygon.type = 'polygon'
          polygon.name = str.split('document.getElementById(\'ifk\').innerHTML = \'')[1].split('\';')[0]
          polygon.coordinates = str.split('    \r\n    ];')[0].split('new google.maps.LatLng(').filter((elm, i) => {
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
          polygons.push(polygon)
        }
      })
      polygons.forEach((polygon, i) => {
        console.log(`Room ${polygon.name} has polygon coordinates: ${typeof polygon.coordinates} - ${polygon.coordinates.length} entries.`)
      })
      return polygons
    })

    .then((polygons) => {
      fs.writeFile('../mapRN/js/data/polygons.js', `export const polygons = JSON.parse(JSON.stringify(${JSON.stringify({'polygons': polygons}, null, 2)}))`, (err) => {
        if (err) throw err
        return Promise.resolve(polygons)
      })
    })

    // floorsToTraverse[key].forEach((room, idx) => {
    // axios.get(baseUrl + `lantai_gmap2.php?id_gedung=${room.buildingId}&id_lantai=${room.floorId}&gid=${room.gId}`).then((response) => {
    //   // console.log(`parsing room ${room.name}`)
    //   traversedFloor[room.floorId] = true
    //   let $ = cheerio.load(response.data)
    //   let coordStarts = $('script')[1].children[0].data.split('var triangleCoords = [\r\n           \r\n        \r\n')
    //   console.log(`${idx}, ${room.name} in ${room.building} (${room.floorId}) - ${coordStarts[1].split('document.getElementById(\'ifk\').innerHTML = \'')[1].split('\';')[0]}`)
    // })
    // })
  })
})
// .then((rooms) => {
//   console.log(`Got rooms with length ${rooms.length}`)
//   const polygons = []
//   let traversedFloor = {}
//   rooms.forEach((room, idx) => {
//     if (traversedFloor[room.floorId]) {
//       console.log(`Floor ${room.floorId} has been traversed.`)
//     } else {
// console.log(`Traversing floor ${room.floorId} for the first time.`)
// axios.get(baseUrl + `lantai_gmap2.php?id_gedung=${room.buildingId}&id_lantai=${room.floorId}&gid=${room.gId}`).then((response) => {
//   // console.log(`parsing room ${room.name}`)
//   traversedFloor[room.floorId] = true
//   let $ = cheerio.load(response.data)
//   let coordStarts = $('script')[1].children[0].data.split('var triangleCoords = [\r\n           \r\n        \r\n')
//   console.log(`${idx}, ${room.name} in ${room.building} (${room.floorId}) - ${coordStarts[1].split('document.getElementById(\'ifk\').innerHTML = \'')[1].split('\';')[0]}`)
//   // let room = {}
//   // coordStarts.forEach((str, i) => {
//   //   if (i === 1) {
//   //   room.type = 'polygon'
//   //   room.name = str.split('document.getElementById(\'ifk\').innerHTML = \'')[1].split('\';')[0]
//   //   room.coordinates = str.split('    \r\n    ];')[0].split('new google.maps.LatLng(').filter((elm, i) => {
//   //     return i > 0
//   //   }).map((coordString, i) => {
//   //     return coordString.split('),')[0].split(',').map((coordNumber) => {
//   //       return Number(coordNumber)
//   //     })
//   //   })
//   //   console.log(room)
//   //   polygons.push(room)
//   //   }
//   // })
// })
//     }
//
//   })
// })

// .then((rooms) => {
//   fs.writeFile('./data/roomsCompact.json', JSON.stringify({"rooms": rooms}), (err) => {
//     if (err) throw err
//     return Promise.resolve(rooms)
//   })
// })
