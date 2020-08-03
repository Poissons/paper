/* globals d3 dataPromise */
window.barGraphPromise = dataPromise.then(([earlyData, PhylumClassOrderFamilyGenusSpecies]) => {
  const padding = { top: 10, right: 40, bottom: 18.5, left: 40 }
  const barGraph = document.getElementById('bar-graph')
  const { width, height } = barGraph.getBoundingClientRect()

  // 准备数据
  const minYear = d3.min(earlyData, (d) => d.start_year)
  const maxYear = d3.max(earlyData, (d) => d.end_year)

  const x = d3
    .scaleLinear()
    .domain([minYear, maxYear])
    .range([padding.left, width - padding.right])

  const formatDate = (d) => (d < 0 ? `${-d}MA` : `${d}AD`)
  const xAxis = d3.axisBottom(x).tickFormat(formatDate)

  const thresholds = x.ticks(maxYear - minYear)

  // 准备种数据
  const newData = new Array(maxYear - minYear).fill(0)
  const datum = {
    all: {
      show: true,
      data: newData,
    },
  }
  for (const phylumName of PhylumClassOrderFamilyGenusSpecies.keys()) {
    datum[phylumName] = {
      show: false,
      data: new Array(maxYear - minYear).fill(0),
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
    const arr = datum[data.Phylum].data
    for (let i = min; i < max; i++) {
      arr[i]++
    }
  }
  for (const phylumName of PhylumClassOrderFamilyGenusSpecies.keys()) {
    for (const [key, val] of datum[phylumName].data.entries()) {
      newData[key] += val
    }
  }

  function kde(kernel, thresholds, data, offset) {
    return thresholds.map((t) => [
      t,
      data.reduce((acc, val, index) => acc + val * kernel(t - (index + offset)), 0),
    ])
  }

  function epanechnikov(bandwidth) {
    return (x) => (Math.abs((x /= bandwidth)) <= 1 ? (0.75 * (1 - x * x)) / bandwidth : 0)
  }

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(newData)])
    .range([height - padding.bottom, padding.top])

  const yAxis = d3.axisLeft(y)

  const svg = d3.select(barGraph).append('svg').attr('width', width).attr('height', height)
  const rectWidth = x(thresholds[1]) - x(thresholds[0])
  const rectStep = rectWidth

  svg
    .append('g')
    .selectAll('rect')
    .data(newData)
    .enter()
    .append('rect')
    .attr('fill', '#ff8c00')
    .attr('x', function (d, i) {
      return padding.left + i * rectStep
    })
    .attr('y', function (d) {
      return y(d)
    })
    .attr('width', function (d, i) {
      return rectWidth
    })
    .attr('height', function (d) {
      return y(0) - y(d)
    })

  svg
    .append('g')
    .attr('transform', `translate(0,${height - padding.bottom})`)
    .attr('text-anchor', 'end')
    .call(xAxis)

  svg
    .append('g')
    .call(yAxis)
    .attr('transform', `translate(${padding.left},0)`)
    .attr('text-anchor', 'end')

  const text = document.getElementById('text')
  const range = document.getElementById('range')
  const redraw = () => {
    text.value = Math.round(range.value * 1000) / 1000 + ' bandwidth'
    svg.selectAll('.thisPath, .thisDensityPath, .slope-axis-y').remove()
    const slopesArr = []
    for (const [key, info] of Object.entries(datum)) {
      if (!info.show) continue
      drawLine(key, info)
      slopesArr.push([key, info.densitySlope])
    }
    drawSlopes(slopesArr)
  }
  range.addEventListener('input', redraw, false)

  const lineColors = {
    all: '#d62728',
    Angiospermae: '#152bf4',
    Bryophyta: '#dff415',
    Gymnospermae: '#2ca02c',
    Pteridophyta: '#1f77b4',
  }

  function lineColor(key) {
    const hasOwnProperty = Object.prototype.hasOwnProperty
    if (hasOwnProperty.call(lineColors, key)) return lineColors[key]
    else return '#9467bd'
  }

  function drawLine(key, info) {
    const densitySlope = (datum[key].densitySlope = [])

    const bandwidth = range.value
    const density = kde(epanechnikov(bandwidth), thresholds, info.data, minYear)

    const line = d3
      .line()
      .curve(d3.curveNatural)
      .x((d) => x(d[0]))
      .y((d) => y(d[1]))

    svg
      .append('path')
      .datum(density)
      .attr('class', 'thisPath path-' + key.toLowerCase())
      .attr('fill', 'none')
      .attr('stroke', lineColor(key))
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('d', line)

    const densityLength = density.length
    for (let i = 0; i < densityLength - 1; i++) {
      const slope = (density[i + 1][1] - density[i][1]) / (density[i + 1][0] - density[i][0])
      densitySlope.push(slope)
    }
  }

  const drawSlopes = (slopesArr) => {
    const slopeY = d3
      .scaleLinear()
      .domain([
        d3.min(slopesArr.map(([key, slopes]) => d3.min(slopes))),
        d3.max(slopesArr.map(([key, slopes]) => d3.max(slopes))),
      ])
      .range([height - padding.bottom, padding.top])

    const slopeYAxis = d3.axisRight(slopeY).tickPadding(20)

    svg
      .append('g')
      .attr('class', 'slope-axis-y')
      .call(slopeYAxis)
      .attr('transform', `translate(${width - padding.right},0)`)
      .attr('text-anchor', 'end')

    const slopeLine = d3
      .line()
      .curve(d3.curveNatural)
      .x((slope, index) => x(index + minYear + 0.5))
      .y((slope) => slopeY(slope))

    for (const [key, slopes] of slopesArr) {
      svg
        .append('path')
        .datum(slopes)
        .attr('class', 'thisDensityPath path-' + key.toLowerCase())
        .attr('fill', 'none')
        .attr('stroke', lineColor(key))
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '10')
        .attr('stroke-linejoin', 'round')
        .attr('d', slopeLine)
    }
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
          svg.select('.thisPath.path-' + key.toLowerCase()).remove()
        }
        svg.selectAll('.thisDensityPath, .slope-axis-y').remove()
        drawSlopes(
          Object.entries(datum)
            .filter(([key, info]) => info.show)
            .map(([key, info]) => [key, info.densitySlope]),
        )
      },
      enumerable: true,
      configurable: true,
    })
  }
  redraw()
  return [earlyData, PhylumClassOrderFamilyGenusSpecies, datum]
})
