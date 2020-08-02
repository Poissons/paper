/* global dataPromise L */
window.reHighlightPromise = dataPromise.then(
  ([dataCollection, PhylumClassOrderFamilyGenusSpecies]) => {
    // var mymap = L.map("map-id").setView([37.595, 112.069], 2);
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

    const map1 = L.map('map-1', {
      layers: [layer1],
      crs: L.CRS.EPSG3857,
      minZoom: 1, // mapbox will give a 404 when zoom level sets to 0
      zoomControl: false,
      scrollWheelZoom: true,
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
    const ancientMaps = mapImgs.map((url, i) => {
      const layers = imageBoundsArr.map((imageBounds) => L.imageOverlay(url, imageBounds))
      return L.map('map-' + (i + 2), {
        layers,
        maxBounds,
        crs: L.CRS.EPSG4326,
        zoomControl: false,
        minZoom: 0,
      }).setView(center, 0)
    })
    const maps = [map1, ...ancientMaps]

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

    const myGroup = L.layerGroup().addTo(map1)

    const icon = L.icon({
      iconUrl: './img/dot_5x5.png',
      iconSize: [5, 5],
      // iconAnchor: [13, 41],
      className: 'my-leaflet-marker',
    })
    const leafletConfig = {
      icon,
      keyboard: false,
      interactive: false,
    }

    const heatmapOptions = {
      // radius should be small ONLY if scaleRadius is true (or small radius is intended)
      // if scaleRadius is false it will be the constant radius used in pixels
      radius: 10,
      minOpacity: 0.7,
    }

    const myHeatMaps = ancientMaps.map((map) => L.heatLayer([], heatmapOptions).addTo(map))

    function reHighlight(dataCollection) {
      const skip = false
      if (skip) return
      requestAnimationFrame(() => {
        const latLngDatum = myHeatMaps.map(() => [])
        const modernSet = new Set()
        const modern = []
        for (const data of dataCollection) {
          const key = data.modern_latitude + ' ' + data.modern_longitude
          if (!modernSet.has(key)) {
            modernSet.add(key)
            modern.push([data.modern_latitude, data.modern_longitude])
          }
          latLngDatum[data.era].push([data.ancient_latitude, data.ancient_longitude])
        }
        for (const [i, data] of latLngDatum.entries()) {
          myHeatMaps[i].setLatLngs(data)
        }
        map1.removeLayer(myGroup)
        myGroup.clearLayers()
        for (const data of modern) {
          L.marker(data, leafletConfig).addTo(myGroup)
        }
        myGroup.addTo(map1)
      })
    }

    // 之前select功能
    // const mapsTop = []
    // const idList = []

    // for (const map of document.querySelectorAll('div.select-map')) {
    //   map.addEventListener(
    //     'click',
    //     function (e) {
    //       if (e.ctrlKey) {
    //         e.preventDefault()
    //         e.stopImmediatePropagation()
    //         const id = Number(map.id.slice(3))
    //         if (idList.length === 1 && idList[0] === id) {
    //           return
    //         }
    //         if (idList.length === 0) {
    //           for (const selected of document.querySelectorAll('.selected')) {
    //             selected.classList.remove('selected', 'selected-1', 'selected-2')
    //           }
    //         }

    //         idList.push(id)
    //         map.classList.add('selected', 'selected-' + idList.length)

    //         if (idList.length === 2) {
    //           if (mapsTop.length) {
    //             mapsTop[0].unsync(mapsTop[1])
    //             mapsTop[1].unsync(mapsTop[0])
    //             for (const map of mapsTop) {
    //               for (const anotherMap of maps) {
    //                 map.unsync(anotherMap)
    //                 anotherMap.unsync(map)
    //               }
    //               map.remove()
    //             }
    //           }
    //           for (const [i, id] of idList.entries()) {
    //             let options
    //             if (id === 1) {
    //               const layer1 = L.tileLayer(
    //                 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
    //                 {
    //                   attribution:
    //                     'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    //                   maxZoom: 18,
    //                   id: 'mapbox/streets-v11',
    //                   tileSize: 512,
    //                   zoomOffset: -1,
    //                   accessToken:
    //                     'pk.eyJ1IjoidGF5dGF5dGF5dGF5bG9yIiwiYSI6ImNqeGZkMWxpZTBsNDYzb29nNnh4Nm5wOTIifQ.wqEeGFygVQ-Uor1_rWvVNg',
    //                 },
    //                 stamenOptions,
    //               )
    //               options = {
    //                 layers: [layer1],
    //                 crs: L.CRS.EPSG3857,
    //                 minZoom: 1, // mapbox will give a 404 when zoom level sets to 0
    //               }
    //             } else {
    //               const layers = imageBoundsArr.map((imageBounds) =>
    //                 L.imageOverlay(mapImgs[id - 2], imageBounds),
    //               )
    //               options = {
    //                 layers,
    //                 maxBounds,
    //                 crs: L.CRS.EPSG4326,
    //                 minZoom: 0,
    //               }
    //             }
    //             const group = L.layerGroup()
    //             options.layers.push(group)
    //             mapsTop[i] = L.map('map-' + (i + 10), options).setView(
    //               maps[id - 1].getCenter(),
    //               maps[id - 1].getZoom(),
    //             )
    //             for (const anotherMap of maps) {
    //               mapsTop[i].sync(anotherMap, { syncCursor: true })
    //               anotherMap.sync(mapsTop[i], { syncCursor: true })
    //             }
    //             updateTop[i] = () => {
    //               mapsTop[i].removeLayer(group)
    //               group.clearLayers()
    //               const cache = new Set()
    //               for (const [lat, lng] of latLngDatum[id - 1]) {
    //                 const key = lat + ' ' + lng
    //                 if (!cache.has(key)) {
    //                   cache.add(key)
    //                   L.marker([lat, lng], leafletConfig).addTo(group)
    //                 }
    //               }
    //               mapsTop[i].addLayer(group)
    //             }
    //             updateTop[i]()
    //           }
    //           mapsTop[0].sync(mapsTop[1], { syncCursor: true })
    //           mapsTop[1].sync(mapsTop[0], { syncCursor: true })
    //           idList.length = 0
    //         }
    //       }
    //     },
    //     true,
    //   )
    // }

    return reHighlight
  },
)
