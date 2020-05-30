Promise.all([barGraphPromise]).then(([[finalData, PhylumClassOrderFamilyGenusSpecies, datum]]) => {
  const height = $('#picture').height()
  const width = $('#picture').width()


  d3.json('./data/picture.json').then((pictureJson) => {
    format = d3.format('.2f')
    color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, pictureJson.children.length + 1))

    partition = (data) => {
      const root = d3.hierarchy(data).sum((d) => d.max - d.min)
      return d3.partition().size([width, ((root.height + 1) * height) / 3])(root)
    }

    const chart = (() => {
      const root = partition(pictureJson)
      let focus = root

      const svg = d3
        .create('svg')
        .attr('viewBox', [0, 0, width, height])
        .style('font', '10px sans-serif')


      const cell = svg
        .selectAll('g')
        .data(root.descendants())
        .join('g')
        .attr('transform', (d) => `translate(${d.x0},${d.y0})`)

      const rect = cell
        .append('rect')
        .attr('width', (d) => rectWidth(d))
        .attr('height', (d) => d.y1 - d.y0 - 1)
        .attr('fill-opacity', 0.6)
        .attr('fill', (d) => {
          if (!d.depth) return '#ccc'
          while (d.depth > 1) d = d.parent
          return color(d.data.name)
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

      const tspan = text
        .append('tspan')
        .attr('fill-opacity', (d) => labelVisible(d) * 0.7)
        .text((d) => ` ${format(d.data.min)}~${format(d.data.max)}`)

      cell.append('title').text(
        (d) =>
          `${d
            .ancestors()
            .map((d) => d.data.name)
            .reverse()
            .join('/')}\n${format(d.data.min)}~${format(d.data.max)}`,
      )

      function clicked(p) {
        focus = focus === p ? (p = p.parent) : p

        root.each(
          (d) =>
            (d.target = {
              x0: ((d.x0 - p.x0) / (p.x1 - p.x0)) * width,
              x1: ((d.x1 - p.x0) / (p.x1 - p.x0)) * width,
              y0: d.y0 - p.y0,
              y1: d.y1 - p.y0,
            }),
        )

        const t = cell
          .transition()
          .duration(750)
          .attr('transform', (d) => `translate(${d.target.x0},${d.target.y0})`)

        rect.transition(t).attr('width', (d) => rectWidth
        (d.target))
        text.transition(t).attr('fill-opacity', (d) => +labelVisible(d.target))
        tspan.transition(t).attr('fill-opacity', (d) => labelVisible(d.target) * 0.7)
      }

      function rectWidth(d) {
        return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2)
      }

      function labelVisible(d) {
        return d.y1 <= height && d.y0 >= 0 && d.x1 - d.x0 > 16
      }

      return svg.node()
    })()

    document.getElementById('picture').appendChild(chart)
  })
})
