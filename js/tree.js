/* global timeGraphPromise d3 $ */
timeGraphPromise.then(
  ({ PhylumClassOrderFamilyGenusSpecies, kdeDatum, reHighlight, redrawBarByX }) => {
    // barGraphPromise.then(([finalData, PhylumClassOrderFamilyGenusSpecies, kdeDatum]) => {
    const marginT = { top: 1, bottom: 1, left: 1 }
    const height = $('#tree').height() - marginT.top - marginT.bottom
    const width = $('#tree').width() - marginT.left

    function transform(node) {
      if (Array.isArray(node)) {
        return [...node[1]].map((data) => ({ name: data.Species, data }))
      }
      return [...node.entries()].map(([name, childNode]) => ({
        name,
        children: transform(childNode),
      }))
    }

    const myDict = {}
    myDict.name = 'all'
    myDict.children = transform(PhylumClassOrderFamilyGenusSpecies)

    //   const myDict = {}
    //   myDict.name = 'all'
    //   myDict.children = transform(PhylumClassOrderFamilyGenusSpecies)

    //   function assignValue(myDict,beforeValue){
    //     let array=myDict['children']
    //     if(!array){
    //         myDict['value']=1/beforeValue
    //         console.log(myDict['value'])
    //     }else{
    //       let arrayLength=array.length
    //       beforeValue=beforeValue*arrayLength
    //       array.forEach((d)=>{
    //         assignValue(d,beforeValue)
    //       })
    //     }

    // }
    // assignValue(myDict,1)

    const partition = (data) => {
      const root = d3
        .hierarchy(data)
        .count()
        .eachBefore(function (node) {
          if (!node.children || !node.children.length) return
          let logSum = 0
          for (const child of node.children) {
            logSum += child._logValue = Math.log2(child.value + 1)
          }
          let sum = 0
          const linePos = []
          for (const child of node.children) {
            const ratio = child._logValue / logSum
            child.value = ratio * node.value
            child.data.centerPos = sum + ratio / 2
            sum += ratio
            linePos.push(sum)
          }
          linePos.pop()
          node.data.linePos = linePos
        })
      return d3.partition().size([height, ((root.height + 1) * width) / 2])(root)
    }

    const chart = (() => {
      const root = partition(myDict)
      let focus = root

      const svg = d3
        .create('svg')
        .attr('viewBox', [0, 0, width + marginT.left, height + marginT.top + marginT.bottom])
        .attr('width', width + marginT.left)
        .attr('height', height + marginT.top + marginT.bottom)
        .style('font', '10px sans-serif')

      let timer = 0
      let lastNode = null
      let isAnimating = false
      const clickListener = (node) => {
        if (isAnimating) return
        if (node.depth === 1) {
          if (node === lastNode) {
            lastNode = null
            if (timer) clearTimeout(timer)
            handleDblClick(node)
          } else {
            lastNode = node
            timer = setTimeout(() => {
              timer = 0
              lastNode = null
              clicked(node)
            }, 300)
          }
        } else {
          clicked(node)
        }
      }

      const createCell = (nodes) => {
        const cell = svg
          .selectAll(null)
          .data(nodes)
          .enter()
          .insert('g')
          .attr('class', 'tree-cell')
          .attr(
            'transform',
            (d) =>
              `translate(${(d.target || d).y0 + marginT.left},${(d.target || d).x0 + marginT.top})`,
          )

        cell
          .append('rect')
          .attr('class', 'tree-rect')
          .attr('width', (d) => (d.target || d).y1 - (d.target || d).y0 - 1)
          .attr('height', (d) => rectHeight(d.target || d))
          .attr(
            'fill',
            'white',
            // (d) => {
            //   if (!d.depth) return 'grey'
            //   else return 'lightgrey'
            // }
          )
          .attr('style', 'outline: rgb(179, 179, 179) solid 1px;')
          .style('cursor', 'pointer')
          .on('click', clickListener)

        const text = cell
          .append('text')
          .attr('class', 'tree-text')
          .style('user-select', 'none')
          .attr('pointer-events', 'none')
          .attr('x', 33)
          .attr('y', (d) => rectHeight(d.target || d) / 2 + 5)
          .attr('fill-opacity', (d) => +labelVisible(d.target || d))

        text.append('tspan').text((d) => d.data.name)

        cell.append('title').text(
          (d) =>
            `${d
              .ancestors()
              .map((d) => d.data.name)
              .reverse()
              .join('/')}\n`,
        )
      }

      function trigger(node) {
        const datumArr = node.children.map((child) => [
          child.data.name,
          child.data.centerPos,
          child.leaves().map((leave) => leave.data.data),
        ])
        reHighlight(datumArr.map((arr) => arr[2]).flat())
        redrawBarByX(datumArr, node.data.linePos)
      }

      function ensureNodes(focus) {
        const nodes = []
        const check = (node) => {
          if (!node._inDom) {
            nodes.push(node)
          }
        }
        check(focus)
        if (focus.parent) {
          check(focus.parent)
          for (const child of focus.parent.children) {
            check(child)
          }
        }
        for (const child of focus.children) {
          check(child)
        }
        for (const node of nodes) {
          node._inDom = true
        }
        createCell(nodes)
      }

      function endAnimation() {
        isAnimating = false
        svg
          .attr('pointer-events', 'auto')
          .selectAll('.tree-cell')
          .filter((d) => {
            if (
              d.parent !== focus &&
              d.parent !== focus.parent &&
              d !== focus &&
              focus.parent !== d
            ) {
              d._inDom = false
              return true
            }
            return false
          })
          .remove()
      }

      function clicked(node) {
        if (!node.children || node === root) return
        isAnimating = true
        svg.attr('pointer-events', 'none')
        focus = focus === node ? node.parent : node
        ensureNodes(focus)
        trigger(focus)

        root.each(
          (d) =>
            (d.target = {
              x0: ((d.x0 - focus.x0) / (focus.x1 - focus.x0)) * height,
              x1: ((d.x1 - focus.x0) / (focus.x1 - focus.x0)) * height,
              y0: d.y0 - focus.y0,
              y1: d.y1 - focus.y0,
            }),
        )

        const t = svg
          .selectAll('.tree-cell')
          .transition()
          .duration(750)
          .attr(
            'transform',
            (d) => `translate(${d.target.y0 + marginT.left},${d.target.x0 + marginT.top})`,
          )

        svg
          .selectAll('.tree-rect')
          .transition(t)
          .attr('height', (d) => rectHeight(d.target))
        svg
          .selectAll('.tree-text')
          .transition(t)
          .attr('fill-opacity', (d) => +labelVisible(d.target))
          .attr('y', (d) => rectHeight(d.target) / 2 + 5)

        t.end().then(endAnimation)
      }

      const handleDblClick = (d) => {
        kdeDatum[d.data.name].show = !kdeDatum[d.data.name].show
      }

      function rectHeight(d) {
        return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2)
      }

      function labelVisible(d) {
        return d.x1 - d.x0 > 16
      }

      ensureNodes(root)
      trigger(root)

      return svg.node()
    })()

    document.getElementById('tree').appendChild(chart)
  },
)
