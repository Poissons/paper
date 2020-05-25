/* global barGraphPromise d3 reHighlight */
barGraphPromise.then(([finalData, PhylumClassOrderFamilyGenusSpecies]) => {
  // 第一部分：画树
  // 处理数据为正确格式
  // 首先得到全部属的名字

  // 画出动态图

  let status = 1
  d3.select('#button7').on('click', function () {
    status = 1
  })

  d3.select('#button8').on('click', function () {
    status = 0
  })

  function transform(node) {
    if (node instanceof Set) {
      return [...node].map((name) => ({ name }))
    }
    return [...node.entries()].map(([name, childNode]) => ({
      name,
      children: transform(childNode),
    }))
  }
  const myDict = {}
  myDict.name = 'all'
  myDict.children = transform(PhylumClassOrderFamilyGenusSpecies)

  const treewidth = 1800
  const treePadding = { top: 10, right: 20, bottom: 10, left: 80 }
  const tdx = 20
  const tdy = treewidth / 15

  const tree = d3.tree().nodeSize([tdx, tdy])
  const diagonal = d3
    .linkHorizontal()
    .x((d) => d.y)
    .y((d) => d.x)

  // let anotherHeight = 0
  const chart = (() => {
    const root = d3.hierarchy(myDict)
    root.x0 = tdy / 2
    root.y0 = 0
    root.descendants().forEach((d, i) => {
      d.id = i
      d._children = d.children
      if (d.depth && d.data.name.length !== 7) d.children = null
    })

    const svg1 = d3
      .create('svg')
      .attr('viewBox', [-treePadding.left, -treePadding.top, treewidth, tdx])
      .style('font', '10px sans-serif')
      .style('user-select', 'none')

    const gLink = svg1
      .append('g')
      .attr('fill', 'none')
      .attr('stroke', '#555')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5)

    const gNode = svg1.append('g').attr('cursor', 'pointer').attr('pointer-events', 'all')

    const duration = 250
    function update(source, supressRehighlight = false) {
      const nodes = root.descendants().reverse()
      const links = root.links()

      tree(root)

      let left = root
      let right = root
      root.eachBefore((node) => {
        if (node.x < left.x) left = node
        if (node.x > right.x) right = node
      })

      const treeheight = right.x - left.x + treePadding.top + treePadding.bottom
      // anotherHeight = treeheight

      const transition = svg1
        .transition()
        .duration(duration)
        .attr('viewBox', [-treePadding.left, left.x - treePadding.top, treewidth, treeheight])
      // .tween("resize", window.ResizeObserver ? null : () => () => svg1.dispatch("toggle"));

      const node = gNode.selectAll('g').data(nodes, (d) => d.id)

      const nodeEnter = node
        .enter()
        .append('g')
        .attr('transform', (d) => `translate(${source.y0},${source.x0})`)
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0)
        .on('click', (d) => {
          d.children = d.children ? null : d._children
          update(d)
          if (supressRehighlight) return
          if (status === 1) {
            if (d.parent) {
              let nodeNameList = []
              let node = d
              const nodeDepth = d.depth
              for (let i = 0; i < nodeDepth; i++) {
                nodeNameList.push(node.data.name)
                node = node.parent
              }
              nodeNameList = nodeNameList.reverse()
              reHighlight(nodeNameList, nodeDepth)
            } else {
              reHighlight([], 0)
            }
          }
        })

      nodeEnter
        .append('circle')
        .attr('r', 2.5)
        .attr('fill', (d) => (d._children ? '#555' : '#999'))
        .attr('stroke-width', 10)

      nodeEnter
        .append('text')
        .attr('dy', '0.31em')
        .attr('x', (d) => (d._children ? -6 : 6))
        .attr('text-anchor', (d) => (d._children ? 'end' : 'start'))
        .text((d) => d.data.name)
        .clone(true)
        .lower()
        .attr('stroke-linejoin', 'round')
        .attr('stroke-width', 3)
        .attr('stroke', 'white')

      // Transition nodes to their new position.
      node
        .merge(nodeEnter)
        .transition(transition)
        .attr('transform', (d) => `translate(${d.y},${d.x})`)
        .attr('fill-opacity', 1)
        .attr('stroke-opacity', 1)

      // Transition exiting nodes to the parent's new position.
      node
        .exit()
        .transition(transition)
        .remove()
        .attr('transform', (d) => `translate(${source.y},${source.x})`)
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0)

      // Update the links…
      const link = gLink.selectAll('path').data(links, (d) => d.target.id)

      // Enter any new links at the parent's previous position.
      const linkEnter = link
        .enter()
        .append('path')
        .attr('d', (d) => {
          const o = { x: source.x0, y: source.y0 }
          return diagonal({ source: o, target: o })
        })

      // Transition links to their new position.
      link.merge(linkEnter).transition(transition).attr('d', diagonal)

      // Transition exiting nodes to the parent's new position.
      link
        .exit()
        .transition(transition)
        .remove()
        .attr('d', (d) => {
          const o = { x: source.x, y: source.y }
          return diagonal({ source: o, target: o })
        })

      // Stash the old positions for transition.
      root.eachBefore((d) => {
        d.x0 = d.x
        d.y0 = d.y
      })
    }
    // function update1(node, depth) {
    //     if (!node._children) return
    //     if (depth > 0) {
    //         if (!node.children) {
    //             node.children = node._children
    //             update(node, true)
    //         }
    //     } else {
    //         if (node.children) {
    //             node.children = null
    //             update(node, true)
    //         }
    //     }
    //     setTimeout(() => {
    //         for (const child of node._children) {
    //             update1(child, depth - 1)
    //         }
    //     }, duration)
    // }

    function update1(node, depth) {
      if (!node._children) return
      if (depth > 0) {
        if (!node.children) {
          node.children = node._children
          update(node, true)
        }
        for (const child of node._children) {
          update1(child, depth - 1)
        }
      } else {
        if (node.children) {
          node.children = null
          update(node, true)
        }
      }
    }

    for (let i = 1; i <= 6; i++) {
      d3.select('#button' + i).on('click', function () {
        update1(root, i)
      })
    }

    update(root)

    return svg1.node()
  })()
  document.getElementById('tree').appendChild(chart)

  // 第二部分，画动态timeline图

  const lanes = []
  const laneLength = finalData[finalData.length - 1].lane + 1
  for (let i = 0; i < laneLength; i++) {
    lanes.push(i)
  }

  const timeBegin = d3.min(finalData, (d) => d.start_year)
  const timeEnd = d3.max(finalData, (d) => d.end_year)

  const m = [20, 15, 15, 240] // top right bottom left
  const w = 960 - m[1] - m[3]
  const h = 80000 - m[0] - m[2]

  // 可改动
  const miniHeight = laneLength * 12 + 50
  const mainHeight = h - miniHeight - 50

  const x = d3.scaleLinear().domain([timeBegin, timeEnd]).range([0, w])

  const axisX = d3.axisBottom().scale(x)

  const x1 = d3.scaleLinear().range([0, w])
  const y1 = d3.scaleLinear().domain([0, laneLength]).range([0, mainHeight])

  const y2 = d3.scaleLinear().domain([0, laneLength]).range([0, miniHeight])

  const timeChart = d3
    .select('#time')
    .append('svg')
    .attr('width', w + m[1] + m[3])
    .attr('height', h + m[0] + m[2])
    .attr('class', 'chart')

  timeChart
    .append('defs')
    .append('clipPath')
    .attr('id', 'clip')
    .append('rect')
    .attr('width', w)
    .attr('height', mainHeight)

  const main = timeChart
    .append('g')
    .attr('transform', 'translate(' + m[3] + ',' + m[0] + ')')
    .attr('width', w)
    .attr('height', mainHeight)
    .attr('class', 'main')

  const mini = timeChart
    .append('g')
    .attr('transform', 'translate(' + m[3] + ',' + (mainHeight + m[0]) + ')')
    .attr('width', w)
    .attr('height', miniHeight)
    .attr('class', 'mini')

  // main lanes and texts
  main
    .append('g')
    .selectAll('.laneLines')
    .data(finalData)
    .enter()
    .append('line')
    .attr('x1', m[1])
    .attr('y1', function (d) {
      return y1(d.lane)
    })
    .attr('x2', w)
    .attr('y2', function (d) {
      return y1(d.lane)
    })
    .attr('stroke', 'lightgray')

  main
    .append('g')
    .selectAll('.laneText')
    .data(lanes)
    .enter()
    .append('text')
    .text(function (d) {
      return d
    })
    .attr('x', -m[1])
    .attr('y', function (d, i) {
      return y1(i + 0.5)
    })
    .attr('dy', '.5ex')
    .attr('text-anchor', 'end')
    .attr('class', 'laneText')

  // mini lanes and texts
  mini
    .append('g')
    .selectAll('.laneLines')
    .data(finalData)
    .enter()
    .append('line')
    .attr('x1', m[1])
    .attr('y1', function (d) {
      return y2(d.lane)
    })
    .attr('x2', w)
    .attr('y2', function (d) {
      return y2(d.lane)
    })
    .attr('stroke', 'lightgray')

  mini
    .append('g')
    .selectAll('.laneText')
    .data(lanes)
    .enter()
    .append('text')
    .text(function (d) {
      return d
    })
    .attr('x', -m[1])
    .attr('y', function (d, i) {
      return y2(i + 0.5)
    })
    .attr('dy', '.5ex')
    .attr('text-anchor', 'end')
    .attr('class', 'laneText')

  const itemRects = main.append('g').attr('clip-path', 'url(#clip)')

  // mini item rects
  mini
    .append('g')
    .selectAll('.miniItems')
    .data(finalData)
    .enter()
    .append('rect')
    .attr('class', function (d) {
      return 'miniItem' + d.lane
    })
    .attr('class', 'minicolor')
    .attr('x', function (d) {
      return x(d.start_year)
    })
    .attr('y', function (d) {
      return y2(d.lane + 0.5) - 5
    })
    .attr('width', function (d) {
      return x(d.end_year) - x(d.start_year)
    })
    .attr('height', 10)

  timeChart
    .append('g')
    .attr('transform', `translate(${m[1] + m[3]},${mainHeight + miniHeight + 50})`)
    .attr('fill', '#000')
    // .attr("text-anchor", "end")
    .attr('font-weight', 'bold')
    .call(axisX)

  mini
    .append('g')
    .selectAll('.miniLabels')
    .data(finalData)
    .enter()
    .append('text')
    .text(function (d) {
      return d.Species
    })
    .attr('x', function (d) {
      return x(d.start_year)
    })
    .attr('y', function (d) {
      return y2(d.lane + 0.5)
    })
    .attr('dy', '.5ex')

  // brush
  const brush = d3
    .brushX()
    .extent([
      [0, 0],
      [w, miniHeight],
    ])
    .on('brush', display)

  mini
    .append('g')
    .attr('class', 'x brush')
    .call(brush)
    .selectAll('rect')
    .attr('y', 1)
    .attr('height', miniHeight - 1)

  function display() {
    // v3变到v5语法改变
    const extent = d3.event.selection || [0, 825]
    // v3变到v5语法改变
    const [minExtent, maxExtent] = extent.map((val) => x.invert(val))

    const visItems = finalData.filter(function (d) {
      return !(d.start_year > maxExtent || d.end_year < minExtent)
    })
    x1.domain([minExtent, maxExtent])

    // update main item rects
    const rects = itemRects
      .selectAll('rect')
      .data(visItems, function (d) {
        return d.Species
      })
      .attr('x', function (d) {
        return x1(d.start_year)
      })
      .attr('width', function (d) {
        return x1(d.end_year) - x1(d.start_year)
      })

    rects
      .enter()
      .append('rect')
      .attr('class', function (d) {
        return 'miniItem' + d.lane
      })
      .attr('class', 'minicolor')
      .attr('x', function (d) {
        return x1(d.start_year)
      })
      .attr('y', function (d) {
        return y1(d.lane) + 10
      })
      .attr('width', function (d) {
        return x1(d.end_year) - x1(d.start_year)
      })
      .attr('height', function (d) {
        return 0.8 * y1(1)
      })

    rects.exit().remove()

    // update the item labels
    const labels = itemRects
      .selectAll('text')
      .data(visItems, function (d) {
        return d.Species
      })
      .attr('x', function (d) {
        return x1(Math.max(d.start_year, minExtent) + 2)
      })

    labels
      .enter()
      .append('text')
      .text(function (d) {
        return d.Species
      })
      .attr('x', function (d) {
        return x1(Math.max(d.start_year, minExtent))
      })
      .attr('y', function (d) {
        return y1(d.lane + 0.5)
      })
      .attr('text-anchor', 'start')

    labels.exit().remove()
  }
})
