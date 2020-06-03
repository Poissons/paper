/* global timeGraphPromise d3 $ */
timeGraphPromise.then(([PhylumClassOrderFamilyGenusSpecies, datum, reHighlight, reDrawBar]) => {
  // barGraphPromise.then(([finalData, PhylumClassOrderFamilyGenusSpecies, datum]) => {
  const height = $('#tree').height()
  const width = $('#tree').width()

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
    return d3.partition().size([height, ((root.height + 1) * width) / 2])(root)
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
      .on('dblclick', dblclicked)

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

      if (focus.parent) {
        let nodeNameList = []
        let node = focus
        const nodeDepth = focus.depth
        for (let i = 0; i < nodeDepth; i++) {
          nodeNameList.push(node.data.name)
          node = node.parent
        }

        nodeNameList = nodeNameList.reverse()
        reHighlight(nodeNameList, nodeDepth)
        reDrawBar(nodeNameList, nodeDepth)
      } else {
        reHighlight([], 0)
        reDrawBar([], 0)
      }

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

    const timer = 0
    let lastNode = null

    function dblclicked(p) {
      focus = focus === p ? (p = p.parent) : p
      console.log(focus)
      if (focus.depth === 1) {
        if (focus === lastNode) {
          lastNode = null
          if (timer) {
            clearTimeout(timer)
            handleDblClick(focus)
          }
        }
      }
    }

    const handleDblClick = (d) => {
      datum[d.data.name].show = !datum[d.data.name].show
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
})
