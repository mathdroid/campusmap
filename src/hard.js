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

const axios = require('axios')
const cheerio = require('cheerio')

const baseUrl = 'http://petakampus.itb.ac.id/'
let endpoint = 'lantai_gmap2.php?id_gedung='+100128+'&id_lantai='+10012801+'&gid='+2963

axios.get(baseUrl+endpoint).then(function(response) {

  let $ = cheerio.load(response.data)
  // console.log($('script')[1])
  // console.log($('script')[1].children[0].data)
  // console.log($('script')[1].children[0].data.split('var triangleCoords = ['))
  let coordStarts = $('script')[1].children[0].data.split('var triangleCoords = [\r\n           \r\n        \r\n')
  let room = {}
  coordStarts.forEach((str, i) => {
    if (i > 0) {
    room.type = 'polygon'
    room.name = str.split('document.getElementById(\'ifk\').innerHTML = \'')[1].split('\';')[0]
    room.coordinates = str.split('    \r\n    ];')[0].split('new google.maps.LatLng(').filter((elm, i) => {
      return i > 0
    }).map((coordString, i) => {
      return coordString.split('),')[0].split(',').map((coordNumber) => {
        return Number(coordNumber)
      })
    }).filter(pair => pair.length === 2 && !isNaN(pair[0]) && !isNaN(pair[1]))
    console.log(room)
    }
  })
})
