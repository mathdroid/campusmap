const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')

const url = 'http://petakampus.itb.ac.id/search/search_map.php'

const rooms = []

axios.get(url).then(function(response) {
    var $ = cheerio.load(response.data);
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
      // THE RESULT ORIGINALLY WOULD BE PASSED TO THIS FUNCTION
      //
      // function lookat2(lat,lon,alt,heading,tilt,range,id_gedung,id_lantai,gid){
      //
      //     var la = ge.createLookAt('');
      //     la.set(lat, lon, alt, ge.ALTITUDE_RELATIVE_TO_GROUND, heading, tilt, range);
      //     ge.getView().setAbstractView(la);
      //
      //     //alert(gid);
      //
          // var uri = 'lantai_gmap2.php?id_gedung='+id_gedung+'&id_lantai='+id_lantai+'&gid='+gid;
      //     //alert(uri);
      //
      //     window.open(uri,'lantai_gmap','','')
      //
      // }
      // console.dir(room)
      // console.log(attrib)
      // console.log(`${name} is in ${building} with coords ${attrib}`)

      // var uri = 'lantai_gmap2.php?id_gedung='+id_gedung+'&id_lantai='+id_lantai+'&gid='+gid
    })
    return rooms
}).then((rooms) => {
  fs.writeFile('./rooms.json', JSON.stringify({"rooms": rooms}, null, 2), (err) => {
    if (err) throw err
  })
})
