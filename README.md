<h1 align="center">- c a m p u s m a p -</h1>
<p align="center">- by Muhammad Mustadi -</p>

<h5 align="center">Finding coordinates of Institut Teknologi Bandung's rooms and buildings has never been this easy.</h5>

<hr />
<div align="center">
<img align="center" src="/72-Labtek VI-Dapur.png" />
</div>

# INSTALLATION

> Tested on Node v6.3.1

1. `git clone` this repository

2. `npm install`

3. `node getBuildings.js` or `node getRooms.js`

# EXAMPLE

>Room example

Returns coordinates and the floor level (last 2 digits of `floorId`)

```json
{
  "rooms": [
    {
      "name": "Dapur",
      "building": "Labtek VI",
      "lat": "-6.89017306193434",
      "lon": "107.609718226161",
      "alt": "0",
      "heading": "0",
      "tilt": "30",
      "range": "200",
      "buildingId": "100128",
      "floorId": "10012802",
      "gId": "72"
    },
  ]
}
```

> Building example

Returns coordinates required to make a Polygon in Google Maps

```json
{
  "buildings": [
    {
      "id": "100181",
      "name": "Aula Barat",
      "coordinates": [
        [
          107.609607418844,
          -6.89234515668262,
          15
        ],
        [
          107.609607171525,
          -6.89229996813034,
          15
        ],
        [
          107.609641622674,
          -6.8922997798156,
          15
        ],
        [
          107.609641340022,
          -6.89224813575718,
          15
        ],
        [
          107.609965037191,
          -6.89224636627552,
          15
        ],
        [
          107.60996529632,
          -6.89229370664946,
          15
        ],
        [
          107.610001900654,
          -6.89229350653769,
          15
        ],
        [
          107.610002140157,
          -6.89233726051881,
          15
        ],
        [
          107.610099033987,
          -6.89233673079438,
          15
        ],
        [
          107.610099836718,
          -6.89248337117428,
          15
        ],
        [
          107.610015562985,
          -6.89248383191484,
          15
        ],
        [
          107.610016141479,
          -6.89258951092741,
          15
        ],
        [
          107.609607990878,
          -6.89259174218788,
          15
        ],
        [
          107.609607436029,
          -6.89249036681331,
          15
        ],
        [
          107.609516044746,
          -6.89249086637231,
          15
        ],
        [
          107.609515250046,
          -6.89234566048129,
          15
        ],
        [
          107.609607418844,
          -6.89234515668262,
          15
        ]
      ],
      "type": "Polygon"
    },
  ]
}

```

# TODO

- Map each floor in a building for its rooms.

- Create Android Client

- Create iOS Client

# CONTRIBUTE

Reach me out here or just make a PR.
