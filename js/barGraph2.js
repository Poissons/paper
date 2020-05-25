/* eslint-disable camelcase */
/* globals d3 */
globalThis.barGraphPromise = Promise.all([
  d3.csv("./data/all_data_earlyT.csv"),
  d3.csv("./data/all_data_midT.csv"),
  d3.csv("./data/all_data_lateT.csv"),
  d3.csv("./data/all_data_earlyJ.csv"),
  d3.csv("./data/all_data_midJ.csv"),
  d3.csv("./data/all_data_lateJ.csv"),
  d3.csv("./data/all_data_earlyK.csv"),
  d3.csv("./data/all_data_lateK.csv"),
]);
barGraphPromise.then((datum) => {
  const data_collection = [].concat(...datum);

  const temp_Phylum = [];
  for (const i in data_collection) {
    temp_Phylum.push(data_collection[i].Phylum);
  }
  temp_Phylum.sort(function (a, b) {
    if (a === "P" && b !== "P") {
      return 1;
    } else if (a !== "P" && b === "P") {
      return -1;
    } else {
      return a < b ? -1 : a > b ? 1 : 0;
    }
  });

  const temp_Class = [];
  for (const i in data_collection) {
    temp_Class.push(data_collection[i].Class);
  }
  temp_Class.sort(function (a, b) {
    if (a === "C" && b !== "C") {
      return 1;
    } else if (a !== "C" && b === "C") {
      return -1;
    } else {
      return a < b ? -1 : a > b ? 1 : 0;
    }
  });

  const temp_Order = [];
  for (const i in data_collection) {
    temp_Order.push(data_collection[i].Order);
  }
  temp_Order.sort(function (a, b) {
    if (a === "O" && b !== "O") {
      return 1;
    } else if (a !== "O" && b === "O") {
      return -1;
    } else {
      return a < b ? -1 : a > b ? 1 : 0;
    }
  });

  const temp_Family = [];
  for (const i in data_collection) {
    temp_Family.push(data_collection[i].Family);
  }
  temp_Family.sort(function (a, b) {
    if (a === "F" && b !== "F") {
      return 1;
    } else if (a !== "F" && b === "F") {
      return -1;
    } else {
      return a < b ? -1 : a > b ? 1 : 0;
    }
  });

  const temp_Genus = [];
  for (const i in data_collection) {
    temp_Genus.push(data_collection[i].Genus);
  }
  temp_Genus.sort(function (a, b) {
    if (a === "G" && b !== "G") {
      return 1;
    } else if (a !== "G" && b === "G") {
      return -1;
    } else {
      return a < b ? -1 : a > b ? 1 : 0;
    }
  });

  const temp_Species = [];
  for (const i in data_collection) {
    temp_Species.push(data_collection[i].Species);
  }
  temp_Species.sort(function (a, b) {
    if (a === "S" && b !== "S") {
      return 1;
    } else if (a !== "S" && b === "S") {
      return -1;
    } else {
      return a < b ? -1 : a > b ? 1 : 0;
    }
  });

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

  const Phylum_Class_Order_Family_Genus_Species = new Map();
  for (const data of Object.values(data_collection)) {
    let map1;
    if (Phylum_Class_Order_Family_Genus_Species.has(data.Phylum)) {
      map1 = Phylum_Class_Order_Family_Genus_Species.get(data.Phylum);
    } else {
      map1 = new Map();
      Phylum_Class_Order_Family_Genus_Species.set(data.Phylum, map1);
    }

    let map2;
    if (map1.has(data.Class)) {
      map2 = map1.get(data.Class);
    } else {
      map2 = new Map();
      map1.set(data.Class, map2);
    }

    let map3;
    if (map2.has(data.Order)) {
      map3 = map2.get(data.Order);
    } else {
      map3 = new Map();
      map2.set(data.Order, map3);
    }

    let map4;
    if (map3.has(data.Family)) {
      map4 = map3.get(data.Family);
    } else {
      map4 = new Map();
      map3.set(data.Family, map4);
    }

    let set;
    if (map4.has(data.Genus)) {
      set = map4.get(data.Genus);
    } else {
      set = new Set();
      map4.set(data.Genus, set);
    }
    set.add(data.Species);
  }

  const early_data = data_collection.map((d) => {
    return {
      ...d,
      start_year: +d.start_year,
      end_year: +d.end_year,
    };
  });

  const new_early_data = [];

  Phylum_Class_Order_Family_Genus_Species.forEach(function (data1, key1) {
    data1.forEach(function (data2, key2) {
      data2.forEach(function (data3, key3) {
        data3.forEach(function (data4, key4) {
          data4.forEach(function (data5, key5) {
            data5.forEach(function (data) {
              const temp = [];
              early_data.forEach(function (record) {
                if (
                  record.Phylum === key1 &&
                  record.Class === key2 &&
                  record.Order === key3 &&
                  record.Family === key4 &&
                  record.Genus === key5 &&
                  record.Species === data
                ) {
                  if (temp.length === 0) {
                    temp.push(record);
                  } else {
                    const old_year = temp[0].end_year - temp[0].start_year;
                    const new_year = record.end_year - record.start_year;
                    if (new_year > old_year) {
                      temp[0] = record;
                    }
                  }
                }
              });
              new_early_data.push(temp[0]);
            });
          });
        });
      });
    });
  });

  const padding = { top: 20, right: 40, bottom: 20, left: 10 };
  const width = 1500;
  const height = 300;
  const x = d3
    .scaleLinear()
    .domain([
      d3.min(new_early_data, (d) => d.start_year),
      d3.max(new_early_data, (d) => d.end_year),
    ])
    .range([padding.left, width - padding.right]);

  const formatDate = (d) => (d < 0 ? `${-d}BC` : `${d}AD`);
  const xAaxis = d3.axisBottom(x).tickFormat(formatDate);

  // 准备数据
  const minYear = d3.min(new_early_data, (d) => d.start_year);
  const maxYear = d3.max(new_early_data, (d) => d.end_year);

  const thresholds = x.ticks(maxYear - minYear);
  const species_nameListLength = maxYear - minYear;

  // 准备种数据
  const species_nameList = new Array(species_nameListLength).fill(0);
  const new_data = new Array(maxYear - minYear + 1).fill(0);
  let new_data_sum = 0;
  early_data.forEach(function (data) {
    const min = data.start_year - minYear;
    const max = data.end_year - minYear;
    new_data_sum += max - min + 1;
    for (let i = min; i <= max; i++) {
      new_data[i]++;
    }
  });

  new_early_data.forEach(function (data) {
    const min = data.start_year;
    const max = data.end_year;

    const afterMin = min + 298;
    const afterMax = max + 298;
    for (let i = afterMin; i < afterMax; i++) {
      species_nameList[i] += 1;
    }
  });

  function kde(kernel, thresholds, data, dataSum, offset) {
    return thresholds.map((t) => [
      t,
      data.reduce(
        (acc, val, index) => acc + val * kernel(t - (index + offset)),
        0
      ) / dataSum,
    ]);
  }

  function epanechnikov(bandwidth) {
    return (x) =>
      Math.abs((x /= bandwidth)) <= 1 ? (0.75 * (1 - x * x)) / bandwidth : 0;
  }

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(species_nameList)])
    .range([height - padding.bottom, padding.top]);

  const yAaxis = d3.axisLeft(y);

  const svg = d3
    .select("#barGraph")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const rectWidth = x(thresholds[1]) - x(thresholds[0]);
  const rectStep = rectWidth;

  svg
    .selectAll("rect")
    .data(species_nameList)
    .enter()
    .append("rect")
    .attr("fill", "steelblue")
    .attr("x", function (d, i) {
      return padding.left + i * rectStep + 10;
    })
    .attr("y", function (d) {
      return height - padding.bottom - d;
    })
    .attr("width", function (d, i) {
      return rectWidth;
    })
    .attr("height", function (d) {
      return d;
    });

  svg
    .append("g")
    .attr("transform", `translate(${padding.left},${height - padding.bottom})`)
    .attr("fill", "#000")
    .attr("text-anchor", "end")
    .attr("font-weight", "bold")
    .call(xAaxis);

  svg
    .append("g")
    .attr("transform", `translate(${padding.left + 9},0)`)
    .attr("text-anchor", "end")
    .attr("font-weight", "bold")
    .attr("font-size", "8px")
    .call(yAaxis);

  const range = document.getElementById("range");
  range.addEventListener(
    "input",
    (e) => {
      const p = d3.select("#thisPath");
      p.remove();
      const bandwidth = range.value;
      myDrawFunction(bandwidth);
    },
    false
  );

  function myDrawFunction(bandwidth) {
    // 需要能调整bandwidth
    const density = kde(
      epanechnikov(bandwidth),
      thresholds,
      new_data,
      new_data_sum,
      minYear
    );

    const line = d3
      .line()
      .curve(d3.curveBasis)
      .x((d) => x(d[0]))
      .y((d) => y(d[1] * 70000));

    svg
      .append("path")
      .datum(density)
      .attr("id", "thisPath")
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("d", line);
  }
});
