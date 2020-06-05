/* global barGraphPromise d3 reHighlightPromise $ */
window.timeGraphPromise = Promise.all([barGraphPromise, reHighlightPromise]).then(
  ([[finalData, PhylumClassOrderFamilyGenusSpecies, datum], reHighlight]) => {
    // 画timeline图
    const heightT = $('#time').height()
    const widthT = $('#time').width()
    const marginT = { top: 30, right: 30, bottom: 20, left: 10 }

    const DOM = {
      svg(width, height) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('viewBox', [0, 0, width, height])
        svg.setAttribute('width', width)
        svg.setAttribute('height', height)
        return svg
      },
    }

    const xT = d3
      .scaleLinear()
      .domain([d3.min(finalData, (d) => d.start_year), d3.max(finalData, (d) => d.end_year)])
      .range([0, widthT - marginT.left - marginT.right])

    const formatDate = (d) => (d < 0 ? `${-d}MA` : `${d}AD`)

    const axisTop = d3.axisTop(xT).tickPadding(2).tickFormat(formatDate)

    const axisBottom = d3.axisBottom(xT).tickPadding(2).tickFormat(formatDate)

    const lightGrey = d3.color('lightgrey')
    const darkGrey = lightGrey.darker()

    let chartT = null
    const draw = (filteredData) => {
      const yT = d3
        .scaleBand()
        .domain(d3.range(filteredData[filteredData.length - 1].lane + 1))
        .range([0, heightT - marginT.bottom - marginT.top])
        .padding(0.2)

      const getRect = function (d) {
        const el = d3.select(this)
        const sx = xT(d.start_year)
        const w = xT(d.end_year) - xT(d.start_year)

        el.style('cursor', 'pointer')

        el.append('rect')
          .attr('x', sx)
          // .attr('height', yT.bandwidth())
          .attr('height', 3)
          .attr('width', w)
          .attr('fill', 'lightgrey')
          .append('title')
          .text(d.name)
      }

      const parent = document.createElement('div')

      const svg = d3.select(DOM.svg(widthT, heightT))

      const g = svg
        .append('g')
        .attr('transform', (d, i) => `translate(${marginT.left} ${marginT.top})`)

      const groups = g.selectAll('g').data(filteredData).enter().append('g').attr('class', 'civ')

      groups.attr('transform', (d, i) => `translate(0 ${yT(d.lane)})`)

      groups
        .each(getRect)
        .on('mouseover', function (d) {
          d3.select(this).select('rect').attr('fill', darkGrey)
        })
        .on('mouseleave', function (d) {
          d3.select(this).select('rect').attr('fill', 'lightgrey')
        })

      svg
        .append('g')
        .attr('transform', (d, i) => `translate(${marginT.left} ${marginT.top - 10})`)
        .call(axisTop)

      svg
        .append('g')
        .attr('transform', (d, i) => `translate(${marginT.left} ${heightT - marginT.bottom})`)
        .call(axisBottom)

      parent.appendChild(svg.node())
      parent.groups = groups
      document.getElementById('time').appendChild(parent)
      chartT = parent
    }

    class LineSegments {
      constructor(name, lane) {
        this.name = name
        this.lane = lane
        this.segments = []
      }

      _lowerBound(key) {
        const segments = this.segments
        let first = 0
        let len = segments.length
        while (len > 0) {
          const half = len >> 1
          const middle = first + half
          if (segments[middle] < key) {
            first = middle + 1
            len = len - half - 1
          } else {
            len = half
          }
        }
        return first
      }

      _upperBound(key) {
        const segments = this.segments
        let first = 0
        let len = segments.length - 1
        while (len > 0) {
          const half = len >> 1
          const middle = first + half
          if (segments[middle] > key) {
            len = half
          } else {
            first = middle + 1
            len = len - half - 1
          }
        }
        return first
      }

      add(data) {
        const segments = this.segments
        const { start_year: startYear, end_year: endYear } = data
        const end = (((this._upperBound(endYear) - 1) >> 1) << 1) + 1
        if (end === -1) {
          segments.unshift(startYear, endYear)
          return
        }
        const start = (this._lowerBound(startYear) >> 1) << 1
        segments.splice(
          start,
          end - start + 1,
          Math.min(startYear, segments[start]),
          Math.max(endYear, segments[end]),
        )
      }

      pushResults(result) {
        const { segments, name, lane } = this
        for (let i = 0; i < segments.length; i += 2) {
          result.push(
            Object.freeze({
              start_year: segments[i],
              end_year: segments[i + 1],
              name,
              lane,
            }),
          )
        }
      }
    }

    function reDrawBar(nodeNameList) {
      let collection = PhylumClassOrderFamilyGenusSpecies
      for (const key of nodeNameList) {
        collection = collection.get(key)
      }
      const nextList = []
      if (Array.isArray(collection)) {
        let lane = 0
        let lastLane = -1
        let lineSegments = null
        for (const data of collection[1]) {
          if (data.lane !== lastLane) {
            lastLane = data.lane
            if (lineSegments) lineSegments.pushResults(nextList)
            lineSegments = new LineSegments(data.Species, lane++)
          }
          lineSegments.add(data)
        }
        if (lineSegments) lineSegments.pushResults(nextList)
      } else {
        let lane = 0
        for (const [name, node] of collection.entries()) {
          const lineSegments = new LineSegments(name, lane++)
          ;(function flatten(node) {
            if (Array.isArray(node)) {
              for (const data of node[1]) {
                lineSegments.add(data)
              }
            } else {
              for (const childNode of node.values()) {
                flatten(childNode)
              }
            }
          })(node)
          lineSegments.pushResults(nextList)
        }
      }

      if (chartT) chartT.remove()
      draw(nextList)
    }

    reDrawBar([])

    // const chartT = (() => {
    //   const parent = document.createElement('div')

    //   const svg = d3.select(DOM.svg(widthT + 200, heightT))

    //   const g = svg
    //     .append('g')
    //     .attr('transform', (d, i) => `translate(${marginT.left} ${marginT.top})`)

    //   svg
    //     .append('g')
    //     .attr('transform', (d, i) => `translate(${marginT.left} ${marginT.top - 10})`)
    //     .call(axisTop)

    //   svg
    //     .append('g')
    //     .attr('transform', (d, i) => `translate(${marginT.left} ${heightT - marginT.bottom})`)
    //     .call(axisBottom)

    //   parent.appendChild(svg.node())
    //   return parent
    // })()

    return [PhylumClassOrderFamilyGenusSpecies, datum, reHighlight, reDrawBar]
  },
)
