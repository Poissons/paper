/* global barGraphPromise L */
barGraphPromise.then(([dataCollection, PhylumClassOrderFamilyGenusSpecies]) => {
  // var mymap = L.map("mapid").setView([37.595, 112.069], 2);
  // var myIcon = L.icon({
  //   iconUrl: "leaflet/images/marker-icon-2x.png",
  //
  //   iconSize: [12, 20], // size of the icon
  //   iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
  //   popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
  // });

  // const temporary=L.tileLayer(
  //   "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  //   {
  //     attribution:
  //       'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  //     maxZoom: 18,
  //     id: "mapbox/streets-v11",
  //     tileSize: 512,
  //     zoomOffset: -1,
  //     accessToken:
  //       "pk.eyJ1IjoidGF5dGF5dGF5dGF5bG9yIiwiYSI6ImNqeGZkMWxpZTBsNDYzb29nNnh4Nm5wOTIifQ.wqEeGFygVQ-Uor1_rWvVNg",
  //   }
  // ).addTo(mymap);
  //
  // const ancient=L.tileLayer('../img/Map_200.jpg',
  // {
  //     attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap<\/a> contributors',
  //     tileSize: 512,
  //     zoomOffset: -1,
  //     maxZoom: 18
  // }
  //     ).addTo(mymap);
  //
  // L.control.sideBySide(temporary, ancient).addTo(mymap);

  // var center = [37.595, 112.069]

  var stamenOptions = {
    attribution:
      'Map tiles by <a href="http://stamen.com">Stamen Design</a>, ' +
      '<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; ' +
      'Map data OpenStreetmap',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
  }

  var layer1 = L.tileLayer(
    'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken:
        'pk.eyJ1IjoidGF5dGF5dGF5dGF5bG9yIiwiYSI6ImNqeGZkMWxpZTBsNDYzb29nNnh4Nm5wOTIifQ.wqEeGFygVQ-Uor1_rWvVNg',
    },
    stamenOptions,
  )

  /* var layer2 = */ L.tileLayer('img/Map_200.jpg', stamenOptions)

  var map1 = L.map('map1', {
    layers: [layer1],
  })

  map1.setView([10, 0], 1)

  var imageBounds = [
    [-90, -360],
    [90, 360],
  ] // 对应古经纬度[-90, -180]和[90,180]

  // var map2 = L.map('map2', {
  //         layers: [layer2],
  //         center: center,
  //         maxBounds: imageBounds,
  //         zoomControl: false
  //     });

  //   map2.setView([10, 0], 1);

  var map2 = L.map('map2').setView([10, 0], 1)
  var imageUrl = 'img/Map_200.jpg'
  L.imageOverlay(imageUrl, imageBounds).addTo(map2)

  map1.sync(map2, { syncCursor: true })
  map2.sync(map1, { syncCursor: true })

  window.reHighlight = function (nodeNameList, nodeDepth) {
    const dataRedraw = []
    let node = PhylumClassOrderFamilyGenusSpecies
    for (const key of nodeNameList) {
      node = node.get(key)
    }
    // eslint-disable-next-line no-extra-semi
    ;(function add(node) {
      if (node instanceof Set) {
        dataRedraw.push(...node)
      } else {
        for (const child of node.values()) {
          add(child)
        }
      }
    })(node)
    // mymap.removeLayer(this.layer);
    reHelightCall(dataRedraw)
  }

  const myGroup1 = L.layerGroup().addTo(map1)
  const myGroup2 = L.layerGroup().addTo(map2)
  const icon = L.icon({
    iconUrl: './lib/leaflet/leaflet/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    className: 'my-leaflet-marker',
  })
  const leafletConfig = {
    icon,
    keyboard: false,
    interactive: false,
  }

  function reHelightCall(dataCollection) {
    requestAnimationFrame(() => {
      myGroup1.clearLayers()
      myGroup2.clearLayers()
      for (const data of dataCollection) {
        L.marker([data.modern_latitude, data.modern_longitude], leafletConfig).addTo(myGroup1)
        L.marker([data.ancient_latitude, data.ancient_longitude], leafletConfig).addTo(myGroup2)
      }
      myGroup1.addTo(map1)
      myGroup2.addTo(map2)
    })
  }

  reHelightCall(dataCollection)

  // var TILE_SIZE = 256
  // function project(lat, lng, zoom) {
  //   var siny = Math.sin((lat * Math.PI) / 180)

  //   // Truncating to 0.9999 effectively limits latitude to 89.189. This is
  //   // about a third of a tile past the edge of the world tile.
  //   siny = Math.min(Math.max(siny, -0.9999), 0.9999)

  //   return {
  //     X: TILE_SIZE * (0.5 + lng / 360) * (1 << zoom),
  //     Y: TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)) * (1 << zoom),
  //   }
  // }

  // function getPosition(lat, lng) {
  //   // top left point of the map picture we are using
  //   var STARTLAT = 40
  //   var STARTLNG = 10

  //   // zoom level of the map picture
  //   var zoom = 1

  //   var start = project(STARTLAT, STARTLNG, zoom)
  //   var p = project(lat, lng, zoom)

  //   return {
  //     X: p.X - start.X,
  //     Y: p.Y - start.Y,
  //   }
  // }
})
