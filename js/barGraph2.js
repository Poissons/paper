/* globals d3 dataPromise */
window.dataPromise = d3.csv('./data/data_combined_sorted.csv').then((dataCollection) => {
  const NUMERIC_KEYS = [
    'modern_longitude',
    'modern_latitude',
    'start_year',
    'end_year',
    'ancient_longitude',
    'ancient_latitude',
  ]
  const PhylumClassOrderFamilyGenusSpecies = new Map()
  const KEYS = ['Phylum', 'Class', 'Order', 'Family', 'Genus']
  const LAST_KEY = KEYS[KEYS.length - 1]
  let lane = -1
  for (const data of dataCollection.values()) {
    for (const key of NUMERIC_KEYS) {
      data[key] = +data[key]
    }
    data.lives = data.end_year - data.start_year
    let node = PhylumClassOrderFamilyGenusSpecies
    let lastLane = true
    for (const key of KEYS) {
      if (node.has(data[key])) {
        node = node.get(data[key])
      } else {
        const newNode = key === LAST_KEY ? new Set() : new Map()
        node.set(data[key], newNode)
        node = newNode
        lastLane = false
      }
    }
    if (!lastLane) lane++
    data.lane = lane
    node.add(data)
  }
  return [dataCollection, PhylumClassOrderFamilyGenusSpecies]
})
window.barGraphPromise = dataPromise.then(([earlyData, PhylumClassOrderFamilyGenusSpecies]) => {
  const padding = { top: 20, right: 40, bottom: 20, left: 30 }
  const width = 1500
  const height = 300
  // 准备数据
  const minYear = d3.min(earlyData, (d) => d.start_year)
  const maxYear = d3.max(earlyData, (d) => d.end_year)

  const x = d3
    .scaleLinear()
    .domain([minYear, maxYear])
    .range([padding.left, width - padding.right])

  const formatDate = (d) => (d < 0 ? `${-d}BC` : `${d}AD`)
  const xAaxis = d3.axisBottom(x).tickFormat(formatDate)

  const thresholds = x.ticks(maxYear - minYear)

  // 准备种数据
  const newData = new Array(maxYear - minYear).fill(0)
  const datum = {
    all: {
      show: true,
      data: newData,
      dataSum: 0,
    },
  }
  for (const phylumName of PhylumClassOrderFamilyGenusSpecies.keys()) {
    datum[phylumName] = {
      show: false,
      data: new Array(maxYear - minYear).fill(0),
      dataSum: 0,
    }
  }
  let lastDataLane = -1
  let lastDataMax = 0
  for (const data of earlyData) {
    if (lastDataLane !== data.lane) {
      lastDataMax = 0
      lastDataLane = data.lane
    }
    const min = Math.max(data.start_year - minYear, lastDataMax)
    const max = Math.max(data.end_year - minYear, lastDataMax)
    lastDataMax = max
    datum[data.Phylum].dataSum += max - min
    const arr = datum[data.Phylum].data
    for (let i = min; i < max; i++) {
      arr[i]++
    }
  }
  for (const phylumName of PhylumClassOrderFamilyGenusSpecies.keys()) {
    for (const [key, val] of datum[phylumName].data.entries()) {
      newData[key] += val
    }
    datum.all.dataSum += datum[phylumName].dataSum
  }

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
    .domain([0, d3.max(newData)])
    .range([height - padding.bottom, padding.top])

  const yAaxis = d3.axisLeft(y)

  const svg = d3.select('#barGraph').append('svg').attr('width', width).attr('height', height)

  const rectWidth = x(thresholds[1]) - x(thresholds[0])
  const rectStep = rectWidth

  svg
    .selectAll('rect')
    .data(newData)
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

  const text = document.getElementById('text')
  const range = document.getElementById('range')
  const redraw = () => {
    text.value = Math.round(range.value * 1000) / 1000 + ' bandwidth'
    d3.selectAll('.thisPath').remove()
    for (const [key, info] of Object.entries(datum)) {
      if (!info.show) continue
      drawLine(key, info)
    }
  }
  range.addEventListener('input', redraw, false)

  function drawLine(key, info) {
    const bandwidth = range.value
    const density = kde(epanechnikov(bandwidth), thresholds, info.data, info.dataSum, minYear)

    const line = d3
      .line()
      .curve(d3.curveBasis)
      .x((d) => x(d[0]))
      .y((d) => y(d[1] * 70000))

    svg
      .append('path')
      .datum(density)
      .attr('class', 'thisPath path-' + key.toLowerCase())
      .attr('fill', 'none')
      .attr('stroke', '#000')
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('d', line)
  }
  for (const [key, info] of Object.entries(datum)) {
    let show = info.show
    Object.defineProperty(info, 'show', {
      get() {
        return show
      },
      set(newShow) {
        if (show === newShow) return
        show = newShow
        if (newShow) {
          drawLine(key, info)
        } else {
          d3.select('.thisPath.path-' + key.toLowerCase()).remove()
        }
      },
      enumerable: true,
      configurable: true,
    })
  }
  redraw()
  return [earlyData, PhylumClassOrderFamilyGenusSpecies, datum]
})
