/* global d3 $ timeGraphPromise */
Promise.all([d3.json('./data/picture.json'), timeGraphPromise]).then(
  ([pictureJson, { reDrawBarByY }]) => {
    const height = $('#picture').height()
    const width = $('#picture').width()
    const format = d3.format('.2f')
    const color = d3.scaleOrdinal(
      d3.quantize(d3.interpolateRainbow, pictureJson.children.length + 1),
    )

    const partition = (data) => {
      const root = d3.hierarchy(data).sum((d) => d.max - d.min)
      return d3.partition().size([width, ((root.height + 1) * height) / 3])(root)
    }

    const chart = (() => {
      const root = partition(pictureJson)
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
        .attr('transform', (d) => `translate(${d.x0},${d.y0})`)

      const getMin = (node) => (node.children ? getMin(node.children[0]) : node.data.min)
      const getMax = (node) =>
        node.children ? getMax(node.children[node.children.length - 1]) : node.data.max
      function updateLineY(node) {
        let lineYPosition
        if (!node.children) lineYPosition = []
        else {
          lineYPosition = (node.children[0].children
            ? node.children.map((child) => child.children).flat()
            : node.children
          ).map(getMax)
          lineYPosition.pop()
        }
        reDrawBarByY(lineYPosition, getMin(node), getMax(node))
      }
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
        .attr('fill-opacity', (d) => Number(labelVisible(d)))

      text.append('tspan').text((d) => d.data.name)

      const tspan = text
        .filter((d) => 'min' in d.data)
        .append('tspan')
        .attr('fill-opacity', (d) => Number(labelVisible(d)) * 0.7)
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
        updateLineY(focus)

        const t = cell
          .transition()
          .duration(750)
          .attr('transform', (d) => `translate(${d.target.x0},${d.target.y0})`)

        rect.transition(t).attr('width', (d) => rectWidth(d.target))
        text.transition(t).attr('fill-opacity', (d) => +labelVisible(d.target))
        tspan.transition(t).attr('fill-opacity', (d) => labelVisible(d.target) * 0.7)
      }

      function rectWidth(d) {
        return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2)
      }

      function labelVisible(d) {
        return d.y1 <= height && d.y0 >= 0 && d.x1 - d.x0 > 16
      }

      updateLineY(root)

      return svg.node()
    })()

    document.getElementById('picture').appendChild(chart)
  },
)
