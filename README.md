<h1 align="center">- c a m p u s m a p -</h1>
<p align="center">- by Muhammad Mustadi -</p>

<h5 align="center">Finding coordinates of Institut Teknologi Bandung's rooms and buildings has never been this easy.</h5>

<hr />
<div align="center">
<img align="center" src="/72-Labtek VI-Dapur.png" />
</div>

# INSTALLATION

> Tested on Node v6.3.1

1. `$ git clone PATH_TO_THIS_REPO` this repository

2. `$ npm install`

3. `$ node index.js`

# RESULT

`init.js` will provide results in data/ folder.

1. `database.js` which will export (CommonJS) 5 things:
  1. `buildings` which is an `array` of building objects.
  2. `floors` which is an `array` of floor objects.
  3. `rooms` which is an `array` of room objects.
  4. `polygonsOfFloors` which is an `array` of floor objects, but instead of rooms they have polygons of each room in that floor.
  5. `validatedPolygons` which is an `array` of polygons fetched using the rooms of `rooms` array.
2. `db.min.json` which contains `buildings`, `floors`, `rooms`, `polygonsOfFloors`, `validatedPolygons` in a JSON (not prettified) format.
3. `db${key}.min.json` with one of the key from above, contains their value, respectively.



# TODO

- [x] Map each floor in a building for its rooms.

- [x] API server
  - [x] Rooms
  - [x] Floors
  - [x] Buildings
  - [x] Floor Polygons
  - [x] Room Polygons


- [ ] Create Android Client

- [ ] Create iOS Client

# SERVER

> Requires MongoDB

After running init, seed the Mongo database using `server/seed.js` or manually with the data from `data/`

Run `$ node server/index.js`.

Routes:

```
GET /rooms -> List all the rooms in JSON.

GET /rooms/name/:name -> Returns the rooms containing the name :name (using regex)

GET /rooms/id/:roomId' -> Returns the rooms with id :roomId

GET /floors -> List all the floors.

GET /floors/id/:id -> Returns the floors with id :id

GET /buildings -> List all the buildings

GET /buildings/name/:name -> List all the buildings containing name :name

GET /buildings/id/:id -> List all the buildings containing id :id

GET /floor-polygons -> List all the floor Polygons

GET /floor-polygons/id/:floorId -> Returns the floor polygons from floors with id :floorId

GET /v-room-polygons -> List all the Room polygons

GET /v-room-polygons/name/:name -> List all the RP with name :name.
GET /v-room-polygons/id/:roomId -> List all the RP with id :roomId.

(MORE HERE)

OPTIONS / -> Gives the list of allowed request types.

HEAD / -> HTTP headers only, no body.

TRACE / -> Blocked for security reasons.
```

# CONTRIBUTE

Reach me out here or just make a PR.

&copy; Muhammad Mustadi - 2016
