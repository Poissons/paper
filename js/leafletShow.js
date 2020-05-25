barGraphPromise.then(
  ([earlyT, midT, lateT, earlyJ, midJ, lateJ, earlyK, lateK]) => {
    let data_collection = earlyT
      .concat(midT)
      .concat(lateT)
      .concat(earlyJ)
      .concat(midJ)
      .concat(lateJ)
      .concat(earlyK)
      .concat(lateK);
    data_collection.sort(function (data1, data2) {
      if (data1.Phylum === "P" && data2.Phylum !== "P") {
        return 1;
      } else if (data1.Phylum !== "P" && data2.Phylum === "P") {
        return -1;
      } else {
        if (data1.Phylum < data2.Phylum) {
          return -1;
        } else if (data1.Phylum > data2.Phylum) {
          return 1;
        } else {
          if (data1.Class === "C" && data2.Class !== "C") {
            return 1;
          } else if (data1.Class !== "C" && data2.Class === "C") {
            return -1;
          } else {
            if (data1.Class < data2.Class) {
              return -1;
            } else if (data1.Class > data2.Class) {
              return 1;
            } else {
              if (data1.Order === "O" && data2.Order !== "O") {
                return 1;
              } else if (data1.Order !== "O" && data2.Order === "O") {
                return -1;
              } else {
                if (data1.Order < data2.Order) {
                  return -1;
                } else if (data1.Order > data2.Order) {
                  return 1;
                } else {
                  if (data1.Family === "F" && data2.Family !== "F") {
                    return 1;
                  } else if (data1.Family !== "F" && data2.Family === "F") {
                    return -1;
                  } else {
                    if (data1.Family < data2.Family) {
                      return -1;
                    } else if (data1.Family > data2.Family) {
                      return 1;
                    } else {
                      if (data1.Genus === "G" && data2.Genus !== "G") {
                        return 1;
                      } else if (data1.Genus !== "G" && data2.Genus === "G") {
                        return -1;
                      } else {
                        if (data1.Genus < data2.Genus) {
                          return -1;
                        } else if (data1.Genus > data2.Genus) {
                          return 1;
                        } else {
                          if (data1.Species === "S" && data2.Species !== "S") {
                            return 1;
                          } else if (
                            data1.Species !== "S" &&
                            data2.Species === "S"
                          ) {
                            return -1;
                          } else {
                            return data1.Species < data2.Species
                              ? -1
                              : data1.Species > data2.Species
                              ? 1
                              : 0;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

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

    var center = [37.595, 112.069];

    var stamenOptions = {
      attribution:
        'Map tiles by <a href="http://stamen.com">Stamen Design</a>, ' +
        '<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; ' +
        "Map data OpenStreetmap",
      subdomains: "abcd",
      minZoom: 0,
      maxZoom: 20,
    };

    var layer1 = L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "mapbox/streets-v11",
        tileSize: 512,
        zoomOffset: -1,
        accessToken:
          "pk.eyJ1IjoidGF5dGF5dGF5dGF5bG9yIiwiYSI6ImNqeGZkMWxpZTBsNDYzb29nNnh4Nm5wOTIifQ.wqEeGFygVQ-Uor1_rWvVNg",
      },
      stamenOptions
    );

    var layer2 = L.tileLayer("img/Map_200.jpg", stamenOptions);

    var map1 = L.map("map1", {
      layers: [layer1],
    });

    map1.setView([10, 0], 1);

    var imageBounds = [
      [-90, -360],
      [90, 360],
    ]; //对应古经纬度[-90, -180]和[90,180]

    // var map2 = L.map('map2', {
    //         layers: [layer2],
    //         center: center,
    //         maxBounds: imageBounds,
    //         zoomControl: false
    //     });

    //   map2.setView([10, 0], 1);

    var map2 = L.map("map2").setView([10, 0], 1);
    var imageUrl = "img/Map_200.jpg",
      imageBounds = [
        [-90, -360],
        [90, 360],
      ]; //对应古经纬度[-90, -180]和[90,180]
    L.imageOverlay(imageUrl, imageBounds).addTo(map2);

    map1.sync(map2, { syncCursor: true });
    map2.sync(map1, { syncCursor: true });

    globalThis.reHighlight = function (nodeNameList, nodeDepth) {
      const data_redraw = [];
      if (nodeDepth === 0) {
        data_collection.forEach(function (data) {
          data_redraw.push(data);
        });
      } else if (nodeDepth === 1) {
        data_collection.forEach(function (data) {
          if (data.Phylum === nodeNameList[0]) {
            data_redraw.push(data);
          }
        });
      } else if (nodeDepth === 2) {
        data_collection.forEach(function (data) {
          if (
            data.Phylum === nodeNameList[0] &&
            data.Class === nodeNameList[1]
          ) {
            data_redraw.push(data);
          }
        });
      } else if (nodeDepth === 3) {
        data_collection.forEach(function (data) {
          if (
            data.Phylum === nodeNameList[0] &&
            data.Class === nodeNameList[1] &&
            data.Order === nodeNameList[2]
          ) {
            data_redraw.push(data);
          }
        });
      } else if (nodeDepth === 4) {
        data_collection.forEach(function (data) {
          if (
            data.Phylum === nodeNameList[0] &&
            data.Class === nodeNameList[1] &&
            data.Order === nodeNameList[2] &&
            data.Family === nodeNameList[3]
          ) {
            data_redraw.push(data);
          }
        });
      } else if (nodeDepth === 5) {
        data_collection.forEach(function (data) {
          if (
            data.Phylum === nodeNameList[0] &&
            data.Class === nodeNameList[1] &&
            data.Order === nodeNameList[2] &&
            data.Family === nodeNameList[3] &&
            data.Genus === nodeNameList[4]
          ) {
            data_redraw.push(data);
          }
        });
      } else {
        data_collection.forEach(function (data) {
          if (
            data.Phylum === nodeNameList[0] &&
            data.Class === nodeNameList[1] &&
            data.Order === nodeNameList[2] &&
            data.Family === nodeNameList[3] &&
            data.Genus === nodeNameList[4] &&
            data.Species === nodeNameList[5]
          ) {
            data_redraw.push(data);
          }
        });
      }
      // mymap.removeLayer(this.layer);
      reHelightCall1(data_redraw);
      reHelightCall2(data_redraw);
    };

    let myGroup1 = L.layerGroup().addTo(map1);
    let myGroup2 = L.layerGroup().addTo(map2);

    reHelightCall1(data_collection);
    reHelightCall2(data_collection);

    function reHelightCall1(data_collection) {
      // for(let item of data_collection){
      //     let lng=Number(item["modern_longitude"]);
      //     let lat=Number(item["modern_latitude"]);
      //     let latlng = L.latLng(lat, lng);
      //     L.marker(latlng).addTo(mymap);
      //
      //       }
      myGroup1.clearLayers();
      data_collection.forEach(function (d) {
        let lng = +d["modern_longitude"];
        let lat = +d["modern_latitude"];
        L.marker([lat, lng]).addTo(myGroup1);
      });
      myGroup1.addTo(map1);
    }

    var TILE_SIZE = 256;
    function project(lat, lng, zoom) {
      var siny = Math.sin((lat * Math.PI) / 180);

      // Truncating to 0.9999 effectively limits latitude to 89.189. This is
      // about a third of a tile past the edge of the world tile.
      siny = Math.min(Math.max(siny, -0.9999), 0.9999);

      return {
        X: TILE_SIZE * (0.5 + lng / 360) * (1 << zoom),
        Y:
          TILE_SIZE *
          (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)) *
          (1 << zoom),
      };
    }

    function getPosition(lat, lng) {
      // top left point of the map picture we are using
      var STARTLAT = 40;
      var STARTLNG = 10;

      // zoom level of the map picture
      var zoom = 1;

      var start = project(STARTLAT, STARTLNG, zoom);
      var p = project(lat, lng, zoom);

      return {
        X: p.X - start.X,
        Y: p.Y - start.Y,
      };
    }


    function reHelightCall2(data_collection) {
      myGroup2.clearLayers();
      data_collection.forEach(function(d){
        let lng = +d["ancient_longitude"];
        let lat = +d["ancient_latitude"];
        L.marker([lat, lng]).addTo(myGroup2);
      });
      myGroup2.addTo(map2);
    }
  }
);