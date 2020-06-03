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
        svg.setAttribute('viewBox', [0, 0, widthT, heightT])
        svg.setAttribute('width', widthT)
        svg.setAttribute('height', heightT)
        return svg
      },
    }

    const yT = d3
      .scaleBand()
      .domain(d3.range(finalData[finalData.length - 1].lane + 1))
      .range([0, heightT - marginT.bottom - marginT.top])
      .padding(0.2)

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

    const sortName = ['Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species']

    function reDrawBar(nodeNameList, nodeDepth) {
      const newData = finalData.filter((d) => {
        var boolValue = true
        for (var i = 0; i < nodeDepth; i++) {
          if (d[sortName[i]] !== nodeNameList[i]) {
            boolValue = false
          }
        }
        return boolValue
      })

      const nextNameSet = new Set()
      newData.forEach((element) => {
        nextNameSet.add(element[sortName[nodeDepth]])
      })

      const nextNameList = [...nextNameSet]
      console.log(nextNameList)

      const nextItemList = []

      for (var i = 0; i < nextNameList.length; i++) {
        const obj = {}
        let min, max
        const element = nextNameList[i]
        obj.name = element
        const selectData = newData.filter((d) => {
          return element === d[sortName[nodeDepth]]
        })
        for (var j = 0; j < selectData.length; j++) {
          const element1 = selectData[j]
          if (j === 0) {
            min = element1.start_year
            max = element1.end_year
            console.log(min, max)
          } else {
            min = Math.min(min, element1.start_year)
            max = Math.max(max, element1.end_year)
          }
        }
        obj.start_year = min
        obj.end_year = max
        nextItemList.push(obj)
      }
    }

    const chartT = (() => {
      const filteredData = finalData
      filteredData.forEach((d) => {
        d.color = d3.color('lightgrey')
      })

      const parent = document.createElement('div')

      const svg = d3.select(DOM.svg(widthT + 200, heightT))

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
          d3.select(this).select('rect').attr('fill', d.color.darker())
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
      return parent
    })()

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

    document.getElementById('time').appendChild(chartT)

    return [PhylumClassOrderFamilyGenusSpecies, datum, reHighlight, reDrawBar]
  },
)
