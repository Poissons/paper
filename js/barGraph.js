/* globals d3 dataPromise */
/* exported barGraphPromise */
const barGraphPromise = dataPromise.then(([earlyData, PhylumClassOrderFamilyGenusSpecies]) => {
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

  // 准备种数据
  const allData = new Int32Array(maxYear - minYear)
  const kdeDatum = {
    all: {
      show: true,
      data: allData,
    },
  }
  for (const phylumName of PhylumClassOrderFamilyGenusSpecies.keys()) {
    kdeDatum[phylumName] = {
      show: false,
      data: new Int32Array(maxYear - minYear),
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
    const arr = kdeDatum[data.Phylum].data
    if (min !== arr.length) {
      arr[min]++
      if (max !== arr.length) arr[max]--
    }
  }
  for (const phylumName of PhylumClassOrderFamilyGenusSpecies.keys()) {
    const arr = kdeDatum[phylumName].data
    let sum = 0
    for (let i = 0; i < arr.length; i++) {
      arr[i] = sum += arr[i]
      allData[i] += sum
    }
  }
  const barRects = []
  {
    let last = 0
    for (let i = 0; i < allData.length; i++) {
      if (allData[i] !== last) {
        if (barRects.length) {
          barRects[barRects.length - 1][2] = i
        }
        last = allData[i]
        barRects.push([last, i, allData.length])
      }
    }
  }

  function kde(bandwidth, data, density) {
    // epanechnikov as kernel
    const bandwidthSquare = bandwidth * bandwidth
    const point75BandwidthCubeInv = 0.75 / (bandwidthSquare * bandwidth)
    for (let index = 0; index <= data.length; index++) {
      const rangeMin = Math.max(Math.ceil(index - bandwidth), 0)
      const rangeMax = Math.min(Math.floor(index + bandwidth) + 1, data.length)
      let sum = 0
      for (let i = rangeMin, x = i - index; i < rangeMax; i++, x++) {
        sum += data[i] * (bandwidthSquare - x * x)
      }
      density[index] = sum * point75BandwidthCubeInv
    }
  }

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(barRects, (d) => d[0])])
    .range([height - padding.bottom, padding.top])

  const yAxis = d3.axisLeft(y)

  const svg = d3.select(barGraph).append('svg').attr('width', width).attr('height', height)
  const rectWidth = x(minYear + 1) - x(minYear)
  const rectStep = rectWidth

  svg
    .append('g')
    .selectAll('rect')
    .data(barRects)
    .enter()
    .append('rect')
    .attr('fill', '#ff8c00')
    .attr('x', function (d) {
      return padding.left + d[1] * rectStep
    })
    .attr('y', function (d) {
      return y(d[0])
    })
    .attr('width', function (d, i) {
      return rectWidth * (d[2] - d[1])
    })
    .attr('height', function (d) {
      return y(0) - y(d[0])
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
    svg.selectAll('.this-path, .this-density-path, .slope-axis-y').remove()
    const slopesArr = []
    for (const [key, info] of Object.entries(kdeDatum)) {
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

  const line = d3
    .line()
    .curve(d3.curveNatural)
    .x((density, index) => x(index + minYear))
    .y((density) => y(density))

  function drawLine(key, info) {
    const bandwidth = +range.value
    let density = kdeDatum[key].densitySlope
    if (density) {
      density.push(0)
    } else {
      density = new Array(info.data.length + 1).fill(0)
    }
    kde(bandwidth, info.data, density)

    svg
      .append('path')
      .datum(density)
      .attr('class', 'this-path path-' + key.toLowerCase())
      .attr('fill', 'none')
      .attr('stroke', lineColor(key))
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('d', line)

    const densityLength = density.length
    for (let i = 0; i < densityLength - 1; i++) {
      density[i] = density[i + 1] - density[i]
    }
    density.pop()
    kdeDatum[key].densitySlope = density
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
        .attr('class', 'this-density-path path-' + key.toLowerCase())
        .attr('fill', 'none')
        .attr('stroke', lineColor(key))
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '10')
        .attr('stroke-linejoin', 'round')
        .attr('d', slopeLine)
    }
  }

  for (const [key, info] of Object.entries(kdeDatum)) {
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
          svg.select('.this-path.path-' + key.toLowerCase()).remove()
        }
        svg.selectAll('.this-density-path, .slope-axis-y').remove()
        drawSlopes(
          Object.entries(kdeDatum)
            .filter(([key, info]) => info.show)
            .map(([key, info]) => [key, info.densitySlope]),
        )
      },
      enumerable: true,
      configurable: true,
    })
  }
  redraw()
  return [earlyData, PhylumClassOrderFamilyGenusSpecies, kdeDatum]
})
