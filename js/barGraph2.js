/* globals d3 barGraphPromise */
window.barGraphPromise = Promise.all([
  d3.csv('./data/all_data_earlyT.csv'),
  d3.csv('./data/all_data_midT.csv'),
  d3.csv('./data/all_data_lateT.csv'),
  d3.csv('./data/all_data_earlyJ.csv'),
  d3.csv('./data/all_data_midJ.csv'),
  d3.csv('./data/all_data_lateJ.csv'),
  d3.csv('./data/all_data_earlyK.csv'),
  d3.csv('./data/all_data_lateK.csv'),
])
barGraphPromise.then((datum) => {
  const dataCollection = [].concat(...datum)

  const tempPhylum = []
  for (const i in dataCollection) {
    tempPhylum.push(dataCollection[i].Phylum)
  }
  tempPhylum.sort(function (a, b) {
    if (a === 'P' && b !== 'P') {
      return 1
    } else if (a !== 'P' && b === 'P') {
      return -1
    } else {
      return a < b ? -1 : a > b ? 1 : 0
    }
  })

  const tempClass = []
  for (const i in dataCollection) {
    tempClass.push(dataCollection[i].Class)
  }
  tempClass.sort(function (a, b) {
    if (a === 'C' && b !== 'C') {
      return 1
    } else if (a !== 'C' && b === 'C') {
      return -1
    } else {
      return a < b ? -1 : a > b ? 1 : 0
    }
  })

  const tempOrder = []
  for (const i in dataCollection) {
    tempOrder.push(dataCollection[i].Order)
  }
  tempOrder.sort(function (a, b) {
    if (a === 'O' && b !== 'O') {
      return 1
    } else if (a !== 'O' && b === 'O') {
      return -1
    } else {
      return a < b ? -1 : a > b ? 1 : 0
    }
  })

  const tempFamily = []
  for (const i in dataCollection) {
    tempFamily.push(dataCollection[i].Family)
  }
  tempFamily.sort(function (a, b) {
    if (a === 'F' && b !== 'F') {
      return 1
    } else if (a !== 'F' && b === 'F') {
      return -1
    } else {
      return a < b ? -1 : a > b ? 1 : 0
    }
  })

  const tempGenus = []
  for (const i in dataCollection) {
    tempGenus.push(dataCollection[i].Genus)
  }
  tempGenus.sort(function (a, b) {
    if (a === 'G' && b !== 'G') {
      return 1
    } else if (a !== 'G' && b === 'G') {
      return -1
    } else {
      return a < b ? -1 : a > b ? 1 : 0
    }
  })

  const tempSpecies = []
  for (const i in dataCollection) {
    tempSpecies.push(dataCollection[i].Species)
  }
  tempSpecies.sort(function (a, b) {
    if (a === 'S' && b !== 'S') {
      return 1
    } else if (a !== 'S' && b === 'S') {
      return -1
    } else {
      return a < b ? -1 : a > b ? 1 : 0
    }
  })

  dataCollection.sort(function (data1, data2) {
    if (data1.Phylum === 'P' && data2.Phylum !== 'P') {
      return 1
    } else if (data1.Phylum !== 'P' && data2.Phylum === 'P') {
      return -1
    } else if (data1.Phylum < data2.Phylum) {
      return -1
    } else if (data1.Phylum > data2.Phylum) {
      return 1
    } else if (data1.Class === 'C' && data2.Class !== 'C') {
      return 1
    } else if (data1.Class !== 'C' && data2.Class === 'C') {
      return -1
    } else if (data1.Class < data2.Class) {
      return -1
    } else if (data1.Class > data2.Class) {
      return 1
    } else if (data1.Order === 'O' && data2.Order !== 'O') {
      return 1
    } else if (data1.Order !== 'O' && data2.Order === 'O') {
      return -1
    } else if (data1.Order < data2.Order) {
      return -1
    } else if (data1.Order > data2.Order) {
      return 1
    } else if (data1.Family === 'F' && data2.Family !== 'F') {
      return 1
    } else if (data1.Family !== 'F' && data2.Family === 'F') {
      return -1
    } else if (data1.Family < data2.Family) {
      return -1
    } else if (data1.Family > data2.Family) {
      return 1
    } else if (data1.Genus === 'G' && data2.Genus !== 'G') {
      return 1
    } else if (data1.Genus !== 'G' && data2.Genus === 'G') {
      return -1
    } else if (data1.Genus < data2.Genus) {
      return -1
    } else if (data1.Genus > data2.Genus) {
      return 1
    } else if (data1.Species === 'S' && data2.Species !== 'S') {
      return 1
    } else if (data1.Species !== 'S' && data2.Species === 'S') {
      return -1
    } else {
      return data1.Species < data2.Species ? -1 : data1.Species > data2.Species ? 1 : 0
    }
  })

  const PhylumClassOrderFamilyGenusSpecies = new Map()
  for (const data of Object.values(dataCollection)) {
    let map1
    if (PhylumClassOrderFamilyGenusSpecies.has(data.Phylum)) {
      map1 = PhylumClassOrderFamilyGenusSpecies.get(data.Phylum)
    } else {
      map1 = new Map()
      PhylumClassOrderFamilyGenusSpecies.set(data.Phylum, map1)
    }

    let map2
    if (map1.has(data.Class)) {
      map2 = map1.get(data.Class)
    } else {
      map2 = new Map()
      map1.set(data.Class, map2)
    }

    let map3
    if (map2.has(data.Order)) {
      map3 = map2.get(data.Order)
    } else {
      map3 = new Map()
      map2.set(data.Order, map3)
    }

    let map4
    if (map3.has(data.Family)) {
      map4 = map3.get(data.Family)
    } else {
      map4 = new Map()
      map3.set(data.Family, map4)
    }

    let set
    if (map4.has(data.Genus)) {
      set = map4.get(data.Genus)
    } else {
      set = new Set()
      map4.set(data.Genus, set)
    }
    set.add(data.Species)
  }

  const earlyData = dataCollection.map((d) => {
    return {
      ...d,
      start_year: +d.start_year,
      end_year: +d.end_year,
    }
  })

  const newEarlyData = []

  PhylumClassOrderFamilyGenusSpecies.forEach(function (data1, key1) {
    data1.forEach(function (data2, key2) {
      data2.forEach(function (data3, key3) {
        data3.forEach(function (data4, key4) {
          data4.forEach(function (data5, key5) {
            data5.forEach(function (data) {
              const temp = []
              earlyData.forEach(function (record) {
                if (
                  record.Phylum === key1 &&
                  record.Class === key2 &&
                  record.Order === key3 &&
                  record.Family === key4 &&
                  record.Genus === key5 &&
                  record.Species === data
                ) {
                  if (temp.length === 0) {
                    temp.push(record)
                  } else {
                    const oldYear = temp[0].end_year - temp[0].start_year
                    const newYear = record.end_year - record.start_year
                    if (newYear > oldYear) {
                      temp[0] = record
                    }
                  }
                }
              })
              newEarlyData.push(temp[0])
            })
          })
        })
      })
    })
  })

  const padding = { top: 20, right: 40, bottom: 20, left: 10 }
  const width = 1500
  const height = 300
  const x = d3
    .scaleLinear()
    .domain([d3.min(newEarlyData, (d) => d.start_year), d3.max(newEarlyData, (d) => d.end_year)])
    .range([padding.left, width - padding.right])

  const formatDate = (d) => (d < 0 ? `${-d}BC` : `${d}AD`)
  const xAaxis = d3.axisBottom(x).tickFormat(formatDate)

  // 准备数据
  const minYear = d3.min(newEarlyData, (d) => d.start_year)
  const maxYear = d3.max(newEarlyData, (d) => d.end_year)

  const thresholds = x.ticks(maxYear - minYear)
  const speciesNameListLength = maxYear - minYear

  // 准备种数据
  const speciesNameList = new Array(speciesNameListLength).fill(0)
  const newData = new Array(maxYear - minYear + 1).fill(0)
  let newDataSum = 0
  earlyData.forEach(function (data) {
    const min = data.start_year - minYear
    const max = data.end_year - minYear
    newDataSum += max - min + 1
    for (let i = min; i <= max; i++) {
      newData[i]++
    }
  })

  newEarlyData.forEach(function (data) {
    const min = data.start_year
    const max = data.end_year

    const afterMin = min + 298
    const afterMax = max + 298
    for (let i = afterMin; i < afterMax; i++) {
      speciesNameList[i] += 1
    }
  })

  function kde(kernel, thresholds, data, dataSum, offset) {
    return thresholds.map((t) => [
      t,
      data.reduce((acc, val, index) => acc + val * kernel(t - (index + offset)), 0) / dataSum,
    ])
  }

  function epanechnikov(bandwidth) {
    return (x) => (Math.abs((x /= bandwidth)) <= 1 ? (0.75 * (1 - x * x)) / bandwidth : 0)
  }

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(speciesNameList)])
    .range([height - padding.bottom, padding.top])

  const yAaxis = d3.axisLeft(y)

  const svg = d3.select('#barGraph').append('svg').attr('width', width).attr('height', height)

  const rectWidth = x(thresholds[1]) - x(thresholds[0])
  const rectStep = rectWidth

  svg
    .selectAll('rect')
    .data(speciesNameList)
    .enter()
    .append('rect')
    .attr('fill', 'steelblue')
    .attr('x', function (d, i) {
      return padding.left + i * rectStep + 10
    })
    .attr('y', function (d) {
      return height - padding.bottom - d
    })
    .attr('width', function (d, i) {
      return rectWidth
    })
    .attr('height', function (d) {
      return d
    })

  svg
    .append('g')
    .attr('transform', `translate(${padding.left},${height - padding.bottom})`)
    .attr('fill', '#000')
    .attr('text-anchor', 'end')
    .attr('font-weight', 'bold')
    .call(xAaxis)

  svg
    .append('g')
    .attr('transform', `translate(${padding.left + 9},0)`)
    .attr('text-anchor', 'end')
    .attr('font-weight', 'bold')
    .attr('font-size', '8px')
    .call(yAaxis)

  const range = document.getElementById('range')
  range.addEventListener(
    'input',
    (e) => {
      const p = d3.select('#thisPath')
      p.remove()
      const bandwidth = range.value
      myDrawFunction(bandwidth)
    },
    false,
  )

  function myDrawFunction(bandwidth) {
    // 需要能调整bandwidth
    const density = kde(epanechnikov(bandwidth), thresholds, newData, newDataSum, minYear)

    const line = d3
      .line()
      .curve(d3.curveBasis)
      .x((d) => x(d[0]))
      .y((d) => y(d[1] * 70000))

    svg
      .append('path')
      .datum(density)
      .attr('id', 'thisPath')
      .attr('fill', 'none')
      .attr('stroke', '#000')
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('d', line)
  }
})
