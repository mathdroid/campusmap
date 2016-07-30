const tj = require('togeojson')
const fs = require('fs')
const jsdom = require('jsdom').jsdom

try {
  fs.statSync('./config.json').isFile() ? console.log(chalk.green('✓') + ' Config file found.') : process.exit()
  let data = fs.readFileSync('./config.json')
  try {
    config = JSON.parse(data)
  // console.dir(config)
  } catch (err) {
    console.log(chalk.red('✗') + ' There has been an error parsing /config.json.')
    config = {}
  }
} catch (err) {
  console.log(chalk.red('✗') + ' No configuration file found.')
  config = {}
}


let kml = jsdom(fs.readFileSync('./campus.kml', 'utf8'))
let converted = tj.kml(kml)
let buildings = converted.features.map((feature) => {
  return {
    id: feature.id || '0',
    name: !feature.properties.name.includes('transBlue') ? feature.properties.name : 'NONAME',
    coordinates: feature.geometry.coordinates[0] || [],
    type: 'Polygon'
  }
})

fs.writeFile('./buildings.json', JSON.stringify({"buildings": buildings}, null, 2), (err) => {
  if (err) throw err
})
