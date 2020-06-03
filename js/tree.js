/* global barGraphPromise d3 reHighlightPromise $ */
Promise.all([barGraphPromise, reHighlightPromise]).then(
  ([[finalData, PhylumClassOrderFamilyGenusSpecies], reHighlight]) => {
    // barGraphPromise.then(([finalData, PhylumClassOrderFamilyGenusSpecies, datum]) => {
    const height = 8000 // $('#tree').height()
    const width = $('#tree').width() - 20

    function transform(node) {
      if (Array.isArray(node)) {
        return [...node[0]].map((name) => ({ name }))
      }
      return [...node.entries()].map(([name, childNode]) => ({
        name,
        children: transform(childNode),
      }))
    }

    const myDict = {}
    myDict.name = 'all'
    myDict.children = transform(PhylumClassOrderFamilyGenusSpecies)

    const partition = (data) => {
      const root = d3.hierarchy(data).count()
      return d3.partition().size([height, ((root.height + 1) * width) / 3])(root)
    }

    const chart = (() => {
      const root = partition(myDict)
      let focus = root

      const svg = d3
        .create('svg')
        .attr('viewBox', [0, 0, width, height])
        .attr('width', width)
        .attr('height', height)
        .style('font', '10px sans-serif')
      const cell = svg
        .selectAll('g')
        .data(root.descendants())
        .join('g')
        .attr('transform', (d) => `translate(${d.y0},${d.x0})`)

      const rect = cell
        .append('rect')
        .attr('width', (d) => d.y1 - d.y0 - 1)
        .attr('height', (d) => rectHeight(d))
        .attr('fill-opacity', 0.6)
        .attr('fill', (d) => {
          if (!d.depth) return 'grey'
          else return 'lightgrey'
        })
        .style('cursor', 'pointer')
        .on('click', clicked)

      const text = cell
        .append('text')
        .style('user-select', 'none')
        .attr('pointer-events', 'none')
        .attr('x', 4)
        .attr('y', 13)
        .attr('fill-opacity', (d) => +labelVisible(d))

      text.append('tspan').text((d) => d.data.name)

      const tspan = text.append('tspan').attr('fill-opacity', (d) => labelVisible(d) * 0.7)

      cell.append('title').text(
        (d) =>
          `${d
            .ancestors()
            .map((d) => d.data.name)
            .reverse()
            .join('/')}\n`,
      )

      function clicked(p) {
        focus = focus === p ? (p = p.parent) : p

        root.each(
          (d) =>
            (d.target = {
              x0: ((d.x0 - p.x0) / (p.x1 - p.x0)) * height,
              x1: ((d.x1 - p.x0) / (p.x1 - p.x0)) * height,
              y0: d.y0 - p.y0,
              y1: d.y1 - p.y0,
            }),
        )

        const t = cell
          .transition()
          .duration(750)
          .attr('transform', (d) => `translate(${d.target.y0},${d.target.x0})`)

        rect.transition(t).attr('height', (d) => rectHeight(d.target))
        text.transition(t).attr('fill-opacity', (d) => +labelVisible(d.target))
        tspan.transition(t).attr('fill-opacity', (d) => labelVisible(d.target) * 0.7)
      }

      function rectHeight(d) {
        return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2)
      }

      function labelVisible(d) {
        return d.y1 <= width && d.y0 >= 0 && d.x1 - d.x0 > 16
      }

      return svg.node()
    })()

    document.getElementById('tree').appendChild(chart)

    // 画timeline图
    const heightT = $('#time').height()
    const widthT = $('#time').width()
    const marginT = { top: 25, right: 30, bottom: 20, left: 10 }

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

    const formatDate = (d) => (d < 0 ? `${-d}MA` : `${d}AD`)

    const axisTop = d3.axisTop(xT).tickPadding(2).tickFormat(formatDate)

    const axisBottom = d3.axisBottom(xT).tickPadding(2).tickFormat(formatDate)

    const chartT = (() => {
      const filteredData = finalData

      // filteredData.forEach((d) => (d.color = d3.color(color(d.species_name))));

      const parent = document.createElement('div')

      parent.classList.add('timeGraph')

      const svg = d3.select(DOM.svg(widthT + 200, heightT))

      const g = svg
        .append('g')
        .attr('transform', (d, i) => `translate(${marginT.left} ${marginT.top})`)

      const groups = g.selectAll('g').data(filteredData).enter().append('g').attr('class', 'civ')

      const tooltip = d3.select(document.createElement('div')).call(createTooltip)

      const line = svg
        .append('line')
        .attr('y1', marginT.top - 10)
        .attr('y2', heightT - marginT.bottom)
        .attr('stroke', 'rgba(0,0,0,0.2)')
        .style('pointer-events', 'none')

      groups.attr('transform', (d, i) => `translate(0 ${yT(d.lane)})`)

      groups
        .each(getRect)
        // .on('mouseover', function (d) {
        //   d3.select(this).select('rect').attr('fill', d.color.darker())
        // })
        .on('mouseleave', function (d) {
          d3.select(this).select('rect').attr('fill', 'grey')
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

    document.getElementById('time').appendChild(chartT)
  },
)
