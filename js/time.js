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

    const createTooltip = function (el) {
      el.style('position', 'absolute')
        .style('pointer-events', 'none')
        .style('top', 0)
        .style('opacity', 0)
        .style('background', 'white')
        .style('border-radius', '5px')
        .style('box-shadow', '0 0 10px rgba(0,0,0,.25)')
        .style('padding', '10px')
        .style('line-height', '1.3')
        .style('font', '11px sans-serif')
    }

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
          .attr('height', yT.bandwidth())
          .attr('width', w)
          .attr('fill', 'lightgrey')
          .append('title')
          .text(d.Species)
      }

      const parent = document.createElement('div')

      const svg = d3.select(DOM.svg(widthT, heightT))

      const g = svg
        .append('g')
        .attr('transform', (d, i) => `translate(${marginT.left} ${marginT.top})`)

      const groups = g
        .selectAll('g')
        .data(filteredData)
        .enter()
        .append('g')
        .attr('class', 'civ')
        .attr('data-phylum', (d) => d.Phylum)
        .attr('data-class', (d) => d.Class)
        .attr('data-order', (d) => d.Order)
        .attr('data-family', (d) => d.Family)
        .attr('data-genus', (d) => d.Genus)
        .attr('data-species', (d) => d.Species)

      const tooltip = d3.select(document.createElement('div')).call(createTooltip)

      groups.attr('transform', (d, i) => `translate(0 ${yT(d.lane)})`)

      groups
        .each(getRect)
        .on('mouseover', function (d) {
          d3.select(this).select('rect').attr('fill', darkGrey)
        })
        .on('mouseleave', function (d) {
          d3.select(this).select('rect').attr('fill', 'lightgrey')
          tooltip.style('opacity', 0)
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
      parent.appendChild(tooltip.node())
      parent.groups = groups
      const civs = d3.selectAll('.civ')

      civs
        .data(filteredData, (d) => d.Species)
        .transition()
        .ease(d3.easeCubic)
        .attr('transform', (d, i) => `translate(0 ${yT(d.lane)})`)
      document.getElementById('time').appendChild(parent)
      chartT = parent
    }

    function reDrawBar(nodeNameList) {
      let collection = PhylumClassOrderFamilyGenusSpecies
      for (const key of nodeNameList) {
        collection = collection.get(key)
      }

      const nextList = []
      let lane = -1
      let lastLane = -1
      ;(function flatten(node) {
        if (Array.isArray(node)) {
          for (const data of node[1]) {
            if (data.lane !== lastLane) {
              lastLane = data.lane
              lane++
            }
            nextList.push({
              ...data,
              lane,
            })
          }
        } else {
          for (const childNode of node.values()) {
            flatten(childNode)
          }
        }
      })(collection)

      chartT.remove()
      draw(nextList)
    }

    draw(finalData)

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
