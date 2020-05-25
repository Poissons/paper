/* globals d3 barGraphPromise */
window.barGraphPromise = d3.csv('./data/data_combined_sorted.csv').then((dataCollection) => {
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
    node.add(data.Species)
  }
  console.log(PhylumClassOrderFamilyGenusSpecies)
  return [dataCollection, PhylumClassOrderFamilyGenusSpecies]
})
barGraphPromise.then(([earlyData, PhylumClassOrderFamilyGenusSpecies]) => {
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
  const newData = new Array(maxYear - minYear + 1).fill(0)
  let newDataSum = 0
  let lastData = {
    lane: -1,
  }
  let lastDataMax = 0
  for (const data of earlyData) {
    if (lastData.lane !== data.lane) {
      lastDataMax = 0
    }
    lastData = data
    const max = data.end_year - minYear
    if (max <= lastDataMax) continue
    const min = Math.max(data.start_year - minYear, lastDataMax)
    lastDataMax = max + 1
    newDataSum += max - min + 1
    for (let i = min; i <= max; i++) {
      newData[i]++
    }
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
  myDrawFunction(range.value)
  range.addEventListener(
    'input',
    (e) => {
      const p = d3.select('#thisPath')
      p.remove()
      myDrawFunction(range.value)
    },
    false,
  )

  function myDrawFunction(bandwidth) {
    text.value = Math.round(bandwidth * 1000) / 1000 + ' bandwidth'
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
