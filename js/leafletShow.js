/* global dataPromise L d3 */
window.reHighlightPromise = dataPromise.then(
  ([dataCollection, PhylumClassOrderFamilyGenusSpecies]) => {
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
    // const ancient=L.tileLayer('./img/Map_200.jpg',
    // {
    //     attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap<\/a> contributors',
    //     tileSize: 512,
    //     zoomOffset: -1,
    //     maxZoom: 18
    // }
    //     ).addTo(mymap);
    //
    // L.control.sideBySide(temporary, ancient).addTo(mymap);

    var center = [37.595, 112.069]

    const stamenOptions = {
      attribution:
        'Map tiles by <a href="http://stamen.com">Stamen Design</a>, ' +
        '<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; ' +
        'Map data OpenStreetmap',
      subdomains: 'abcd',
      minZoom: 1,
      maxZoom: 20,
    }

    const layer1 = L.tileLayer(
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

    /* var layer2 = L.tileLayer('./img/Map_200.jpg', stamenOptions) */

    const map1 = L.map('map1', {
      layers: [layer1],
      crs: L.CRS.EPSG3857,
      minZoom: 1, // mapbox will give a 404 when zoom level sets to 0
    })

    map1.setView(center, 1)

    const imageBoundsArr = [
      [
        [-90, -540],
        [90, -180],
      ],
      [
        [-90, -180],
        [90, 180],
      ],
      [
        [-90, 180],
        [90, 540],
      ],
    ]
    const maxBounds = [
      [-90, -360],
      [90, 360],
    ]
    const mapImgs = [
      './img/Map48a ETr Induan-Olenekian_245.jpg',
      './img/Map47a MTr Anisian_240.jpg',
      './img/Map44a LtTr Norian_210.jpg',
      './img/Map42a EJ Hettangian_195.jpg',
      './img/Map38a MJ Aalenian_175.jpg',
      './img/Map34a LtJ Kimmeridgian_155.jpg',
      './img/Map27a EK Early Albian_120.jpg',
      './img/Map21a LtK Turonian_090.jpg',
    ]
    const maps = [
      map1,
      ...mapImgs.map((url, i) => {
        const layers = imageBoundsArr.map((imageBounds) => L.imageOverlay(url, imageBounds))
        return L.map('map' + (i + 2), {
          layers,
          maxBounds,
          crs: L.CRS.EPSG4326,
          minZoom: 0,
        }).setView(center, 0)
      }),
    ]

    // var map2 = L.map('map2', {
    //         layers: [layer2],
    //         center: center,
    //         maxBounds: imageBounds,
    //         zoomControl: false
    //     });

    //   map2.setView([10, 0], 1);
    for (const map of maps) {
      for (const anotherMap of maps) {
        if (anotherMap !== map) map.sync(anotherMap, { syncCursor: true })
      }
    }

    function reHighlight(nodeNameList, nodeDepth) {
      const dataRedraw = []
      let node = PhylumClassOrderFamilyGenusSpecies
      for (const key of nodeNameList) {
        node = node.get(key)
      }
      // eslint-disable-next-line no-extra-semi
      ;(function add(node) {
        if (Array.isArray(node)) {
          dataRedraw.push(...node[1])
        } else {
          for (const child of node.values()) {
            add(child)
          }
        }
      })(node)
      // mymap.removeLayer(this.layer);
      reHelightCall(dataRedraw)
    }
    const heatmapOptions = {
      // radius should be small ONLY if scaleRadius is true (or small radius is intended)
      // if scaleRadius is false it will be the constant radius used in pixels
      radius: 10,
      minOpacity: 0.7,
    }

    const myHeatMaps = maps.map((map) => L.heatLayer([], heatmapOptions).addTo(map))

    let latLngDatum = null

    function reHelightCall(dataCollection) {
      requestAnimationFrame(() => {
        latLngDatum = myHeatMaps.map(() => [])
        const modern = latLngDatum[0]
        for (const data of dataCollection) {
          modern.push([data.modern_latitude, data.modern_longitude])
          latLngDatum[data.era + 1].push([data.ancient_latitude, data.ancient_longitude])
        }
        for (const [i, data] of latLngDatum.entries()) {
          myHeatMaps[i].setLatLngs(data)
        }
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

    let clickTime = 0
    let idList = []

    for (const map of document.querySelectorAll('div[class^="selectMap"]')) {
      map.addEventListener(
        'click',
        function (e) {
          if (e.ctrlKey) {
            e.preventDefault()
            e.stopImmediatePropagation()
            clickTime += 1
            if (clickTime == 2) {
              idList.push(parseInt(map.id[3]))
              for (var i = 0; i < 2; i++) {
                if(idList[0]==1){
                  const map10 = L.map('map'+ (i + 10), {
                     layers: [layer1],
                     crs: L.CRS.EPSG3857,
                     minZoom: 1, // mapbox will give a 404 when zoom level sets to 0
                   }).setView(center, 1)
             }else{

               const thisLayers = imageBoundsArr.map((imageBounds) => L.imageOverlay(mapImgs[idList[i]-2], imageBounds))
                 const map11=L.map('map'+ (i + 10),{
                   thisLayers,
                   maxBounds,
                   crs: L.CRS.EPSG4326,
                   minZoom: 0,
                 }).setView(center, 0)
               }
              }

              clickTime = 0
              idList = []
            }
          }
        },
        true,
      )
    }

    return reHighlight
  },
)
