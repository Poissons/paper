/* global d3 timeGraphPromise */
Promise.all([d3.json('./data/picture.json'), timeGraphPromise]).then(
  ([pictureJson, { redrawBarByY, marginTime }]) => {
    const picture = document.getElementById('picture')
    const margin = { right: marginTime.right, left: marginTime.left }
    let { width, height } = picture.getBoundingClientRect()
    width -= margin.left + margin.right
    const format = d3.format('.2f')
    const color = d3.scaleOrdinal(
      d3.quantize(d3.interpolateRainbow, pictureJson.children.length + 1),
    )

    ;(function ensureMinMax(node) {
      if (!node.children) return
      for (const child of node.children) {
        ensureMinMax(child)
      }
      node.min = node.children[0].min
      node.max = node.children[node.children.length - 1].max
    })(pictureJson)

    const partition = (data) => {
      const root = d3.hierarchy(data).sum((d) => (d.children ? 0 : d.max - d.min))
      return d3.partition().size([width, ((root.height + 1) * height) / 3])(root)
    }

    const chart = (() => {
      const root = partition(pictureJson)
      let focus = root

      const svg = d3
        .create('svg')
        .attr('viewBox', [0, 0, width + margin.left + margin.right, height])
        .attr('width', width + margin.left + margin.right)
        .attr('height', height)
        .style('font', '10px sans-serif')

      const cell = svg
        .selectAll('g')
        .data(root.descendants())
        .join('g')
        .attr('transform', (d) => `translate(${d.x0 + margin.left},${d.y0})`)

      function updateLineY(node) {
        let lineYPosition
        if (!node.children) lineYPosition = []
        else {
          lineYPosition = (node.children[0].children
            ? node.children.map((child) => child.children).flat()
            : node.children
          ).map((child) => child.data.max)
          lineYPosition.pop()
        }
        redrawBarByY(lineYPosition, node.data.min, node.data.max)
      }
      root._color = 'rgb(224, 224, 224)'
      for (const child of root.children) {
        const fill = d3.color(color(child.data.name))
        fill.r = fill.r * 0.6 + 0xff * 0.4
        fill.g = fill.g * 0.6 + 0xff * 0.4
        fill.b = fill.b * 0.6 + 0xff * 0.4
        child._color = fill.toString()
      }
      const rect = cell
        .append('rect')
        .attr('width', (d) => rectWidth(d))
        .attr('height', (d) => d.y1 - d.y0 - 1)
        .attr('fill', (d) => {
          while (!d._color) d = d.parent
          return d._color
        })
        .style('outline', 'white solid 0.5px')
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
        if (p === root) return
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
          .attr('transform', (d) => `translate(${d.target.x0 + margin.left},${d.target.y0})`)

        rect.transition(t).attr('width', (d) => rectWidth(d.target))
        text.transition(t).attr('fill-opacity', (d) => +labelVisible(d.target))
        tspan.transition(t).attr('fill-opacity', (d) => labelVisible(d.target) * 0.7)
      }

      function rectWidth(d) {
        return d.x1 - d.x0
      }

      function labelVisible(d) {
        return d.y1 <= height && d.y0 >= 0 && d.x1 - d.x0 > 16
      }

      updateLineY(root)

      return svg.node()
    })()

    picture.appendChild(chart)
  },
)
