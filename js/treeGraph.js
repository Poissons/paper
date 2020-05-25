Promise.all([d3.csv('./data/all_data_early.csv'), d3.json('./data/all_data_early.json')]).then(([early_csv, early_json]) => {
    //第一部分：画树
    // 处理数据为正确格式
    //首先得到全部属的名字
    const temp_divide =[];
    for(let i in early_json){
        temp_divide.push(early_json[i]['divide']);
    }
    temp_divide.sort();
    const all_divide=new Set(temp_divide);

    const temp_category=[];
    for(let i in early_json){
        temp_category.push(early_json[i]['category']);
    }
    temp_category.sort();
    const all_category=new Set(temp_category);

    //得到由纲到种全名的map
    const divide_category=new Map();
    all_divide.forEach(function (d) {
        let tempList=[];
        for(let i in early_json){
            if(early_json[i]['divide']===d){
                tempList.push(early_json[i]['category'])
            }
        }
        tempList.sort();
        let tempSet= new Set(tempList);
        divide_category.set(d,tempSet);
    });

    //得到由属到种的map
    const category_species_name=new Map();
   all_category.forEach(function (d) {
       let tempList=[];
        for(let i in early_json){
        if(early_json[i]['category']===d){
            tempList.push(early_json[i]['species_name']);
        }
    }
        tempList.sort();
        let tempSet=new Set(tempList);
        category_species_name.set(d,tempSet);
   });

   //得到由属到种到种全名的map
    const divide_category_species_name=new Map();
    divide_category.forEach(function(value,key){
        let tempSet=value;
        let tempMap=new Map();
        tempSet.forEach(function (d) {
            tempMap.set(d,category_species_name.get(d));
        });
        divide_category_species_name.set(key,tempMap)
　　　　});

   //只画出由属到种全名的静态树图
   // const myDict={};
   // myDict["name"]="all";
   // const nextList=[];
   // category_species_name.forEach(function (value, key) {
   //     let tempDict={};
   //     tempDict["name"]=key;
   //     let nextnextList=[];
   //     value.forEach(function (d) {
   //         let temptempDict={};
   //         temptempDict["name"]=d;
   //         nextnextList.push(temptempDict)
   //     });
   //     tempDict["children"]=nextnextList.sort(function (a,b) {
   //         return  a.name > b.name ? 1 : a.name == b.name ? 0 : -1
   //     });
   //      nextList.push(tempDict);
   // });
   //  myDict["children"]=nextList;


    // let treePadding ={top:10, bottom:10, left:10, right:10};
    // let svg1 = d3.select("#tree")
    //     .append("svg")
    //     .attr("width",1600)
    //     .attr("height",1500);
    //         // .transform();
    // let treeWidth = svg1.attr("width");
    // let treeHeight = svg1.attr("height");
    // let treeg=svg1.append("g")
    //     .attr("transform","translate("+treePadding.left+","+treePadding.top+")");
    //
    // let hierarchyData = d3.hierarchy(myDict).sum(function (d) {
    //     return d.value;
    // });
    //
    //
    // let tree=d3.tree()
    //     .size([treeWidth-200,treeHeight-treePadding.bottom-100])
    //     .separation(function (a,b) {
    //     return (a.parent == b.parent ? 1:2)/a.depth;
    // });
    //
    // let treeData = tree(hierarchyData);
    //
    // let nodes = treeData.descendants();
    // let links = treeData.links();
    //
    // let Bézier_curve_generator = d3.linkHorizontal()
    // 		.x(function(d) { return d.y; })
    // 		.y(function(d) { return d.x; });
    //
    // treeg.append("g")
    // 		.selectAll("path")
    // 		.data(links)
    // 		.enter()
    // 		.append("path")
    // 		.attr("d",function(d){
    // 			var start = {x:d.source.x,y:d.source.y};
    // 			var end = {x:d.target.x,y:d.target.y};
    // 			return Bézier_curve_generator({source:start,target:end});
    // 		})
    // 		.attr("fill","none")
    // 		.attr("stroke","grey")
    // 		.attr("stroke-width",1);
    //
    // let treegs = treeg.append("g")
    // 		.selectAll("g")
    // 		.data(nodes)
    // 		.enter()
    // 		.append("g")
    // 		.attr("transform",function(d){
    // 			var cx = d.x;
    // 			var cy= d.y;
    // 			return "translate("+cy+","+cx+")";
    // 		});
    //
    // //绘制节点
    // 	treegs.append("circle")
    // 		.attr("r",2)
    // 		.attr("fill","green")
    // 		.attr("stroke","white")
    // 		.attr("stroke-width",1);
    //
    // 	//文字
    // 	treegs.append("text")
    //         .attr("font-size",10)
    // 		.attr("x",function(d){
    // 			return d.children?-40:8;
    // 		})
    // 		.attr("y",-5)
    // 		.attr("dy",1)
    // 		.text(function(d){
    // 			return d.data.name;
    // 		});

    //画出由纲到属到种全名的动态图
    const myDict={};
   myDict["name"]="all";
   const nextList=[];
   divide_category.forEach(function (categoryMap, divide) {
       let tempDict={};
       tempDict["name"]=divide;
       let nextnextList=[];
       categoryMap.forEach(function (category1) {
            let temptempDict={};
            temptempDict["name"]=category1;
            let nextnextnextList=[];
            category_species_name.forEach(function (species_name,category2) {
                if(category2===category1){
                    let species_nameSet=species_name;
                    species_nameSet.forEach(function (species_name) {
                        let temptemptempDict={};
                        temptemptempDict['name']=species_name;
                        nextnextnextList.push(temptemptempDict);
                    })

                }
            });
            temptempDict['children']=nextnextnextList;
            nextnextList.push(temptempDict)
       });
       tempDict["children"]=nextnextList;
       nextList.push(tempDict);
   });
   myDict["children"]=nextList;




    //动态树图
    const treewidth=768;
    let treePadding = ({top: 10, right: 120, bottom: 10, left: 230});
    let tdx = 20;
    let tdy = treewidth / 6;


    let tree = d3.tree().nodeSize([tdx, tdy]);
    let diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);

    let anotherHeight=0;
    const chart = (() =>{
        const root = d3.hierarchy(myDict);
    root.x0 = tdy / 2;
    root.y0 = 0;
    root.descendants().forEach((d, i) => {
    d.id = i;
    d._children = d.children;
    if (d.depth && d.data.name.length !== 7) d.children = null;
  });

    const svg1 = d3.create("svg")
      .attr("viewBox", [-treePadding.left, -treePadding.top, treewidth, tdx])
      .style("font", "10px sans-serif")
      .style("user-select", "none");

    const gLink = svg1.append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5);

    const gNode = svg1.append("g")
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");

    function update(source) {
    const duration = d3.event && d3.event.altKey ? 2500 : 250;
    const nodes = root.descendants().reverse();
    const links = root.links();

    tree(root);

    let left = root;
    let right = root;
    root.eachBefore(node => {
      if (node.x < left.x) left = node;
      if (node.x > right.x) right = node;
    });

    const treeheight = right.x - left.x + treePadding.top + treePadding.bottom;
    anotherHeight=treeheight;

     const transition = svg1.transition()
        .duration(duration)
        .attr("viewBox", [-treePadding.left, left.x - treePadding.top, treewidth, treeheight]);
        // .tween("resize", window.ResizeObserver ? null : () => () => svg1.dispatch("toggle"));

     const node = gNode.selectAll("g")
      .data(nodes, d => d.id);

     const nodeEnter = node.enter().append("g")
        .attr("transform", d => `translate(${source.y0},${source.x0})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)
        .on("click", d => {
          d.children = d.children ? null : d._children;
          update(d);
        });

     nodeEnter.append("circle")
        .attr("r", 2.5)
        .attr("fill", d => d._children ? "#555" : "#999")
        .attr("stroke-width", 10);

    nodeEnter.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d._children ? -6 : 6)
        .attr("text-anchor", d => d._children ? "end" : "start")
        .text(d => d.data.name)
      .clone(true).lower()
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .attr("stroke", "white");

    // Transition nodes to their new position.
    const nodeUpdate = node.merge(nodeEnter).transition(transition)
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    const nodeExit = node.exit().transition(transition).remove()
        .attr("transform", d => `translate(${source.y},${source.x})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0);

    // Update the links…
    const link = gLink.selectAll("path")
      .data(links, d => d.target.id);

    // Enter any new links at the parent's previous position.
    const linkEnter = link.enter().append("path")
        .attr("d", d => {
          const o = {x: source.x0, y: source.y0};
          return diagonal({source: o, target: o});
        });

    // Transition links to their new position.
    link.merge(linkEnter).transition(transition)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition(transition).remove()
        .attr("d", d => {
          const o = {x: source.x, y: source.y};
          return diagonal({source: o, target: o});
        });

    // Stash the old positions for transition.
    root.eachBefore(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  update(root);

  return svg1.node();
    })();
    document.getElementById("tree").appendChild(chart);



    //第二部分：画时段图
    //数据准备
    // const DOM = {
    //     svg(width, height) {
    //         const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    //         svg.setAttribute('viewBox', [0, 0, width, height]);
    //         svg.setAttribute('width', width);
    //         svg.setAttribute('height', height);
    //         return svg
    //     },
    // };
    //
    // const early_data = early_csv
    //     .map((d) => {
    //         return {
    //             ...d,
    //             start_year: +d.start_year,
    //             end_year: +d.end_year,
    //         }
    //     });
    //
    //
    // const new_early_data=[];
    //
    // divide_category_species_name.forEach(function (data1,key1) {
    //     data1.forEach(function (data2,key2) {
    //         data2.forEach(function (data3) {
    //             let littleList=[];
    //             early_data.forEach(function (data4) {
    //                 if(data4["species_name"]===data3){
    //                     if(littleList.length===0){
    //                         littleList.push(data4);
    //                     }else {
    //                         let old_year = parseInt(littleList[0]["end_year"]) - parseInt(littleList[0]["start_year"]);
    //                         let new_year = parseInt(data4["end_year"]) - parseInt(data4["start_year"]);
    //                         if (new_year > old_year) {
    //                             littleList[0] = data4;
    //                         }
    //                     }
    //
    //                 }
    //             });
    //             new_early_data.push(littleList[0])
    //         })
    //     })
    // });
    //
    //
    // // all_category.forEach(function (data1) {
    // //     let temp=[];
    // //     early_data.forEach(function (data2) {
    // //
    // //         if(data2["category"]===data1){
    // //             temp.push(data2)
    // //         }
    // //
    // //     });
    // //
    // //         let temp_species_name=[];
    // //         temp.forEach(function (data3) {
    // //             temp_species_name.push(data3["species_name"]);
    // //         });
    // //
    // //         temp_species_name=new Set(temp_species_name.sort());
    // //
    // //         temp_species_name.forEach(function (data5) {
    // //             let temptemp=[];
    // //             temp.forEach(function (data6) {
    // //                 if(data6["species_name"]===data5){
    // //                     temptemp.push(data6);
    // //                 }
    // //             });
    // //
    // //             let temptemptemp=[];
    // //             temptemp.forEach(function (data4) {
    // //
    // //             if(temptemptemp.length===0){
    // //                 temptemptemp.push(data4);
    // //             }else{
    // //                 let old_year=parseInt(temptemptemp[0]["end_year"])-parseInt(temptemptemp[0]["start_year"]);
    // //                 let new_year=parseInt(data4["end_year"])-parseInt(data4["start_year"]);
    // //                 if(new_year>old_year){
    // //                     temptemptemp[0]=data4;
    // //                 }
    // //             }
    // //
    // //
    // //         });
    // //             new_early_data.push(temptemptemp[0]);
    // //         });
    // //
    // //
    // // });
    //
    // console.log(new_early_data);
    //
    // const new_early_csv_species_name =[new_early_data.map((obj) => obj.species_name)];
    //
    // const color = d3.scaleOrdinal(d3.schemeSet2).domain(new_early_csv_species_name);
    //
    // const height = 1400;
    // const width=1000;
    // // const width = anotherHeight;
    //
    // const padding = { top: 30, right: 30, bottom: 30, left: 30 };
    //
    // const y = d3
    //     .scaleBand()
    //     .domain(d3.range(new_early_data.length))
    //     .range([0, height - padding.bottom - padding.top])
    //     .padding(0.2);
    //
    // const x = d3
    //     .scaleLinear()
    //     .domain([d3.min(new_early_data, (d) => d.start_year), d3.max(new_early_data, (d) => d.end_year)])
    //     .range([0, width - padding.left - padding.right]);
    //
    //
    // const createTooltip = function (el) {
    //     el.style('position', 'absolute')
    //         .style('pointer-events', 'none')
    //         .style('top', 0)
    //         .style('opacity', 0)
    //         .style('background', 'white')
    //         .style('border-radius', '5px')
    //         .style('box-shadow', '0 0 10px rgba(0,0,0,.25)')
    //         .style('padding', '10px')
    //         .style('line-height', '1.3')
    //         .style('font', '11px sans-serif')
    // };
    //
    // const getRect = function (d) {
    //     const el = d3.select(this);
    //     const sx = x(d.start_year);
    //     const w = x(d.end_year) - x(d.start_year);
    //     // const isLabelRight = sx > width / 2 ? sx + w < width : sx - w > 0;
    //     const isLabelRight = true;
    //
    //     el.style('cursor', 'pointer');
    //
    //     el.append('rect').attr('x', sx).attr('height', y.bandwidth()).attr('width', w).attr('fill', d.color);
    //
    //     el.append('text')
    //         .text(d.species_name)
    //         .attr('x', isLabelRight ? sx - 5 : sx + w + 5)
    //         .attr('y', 2.5)
    //         .attr("font-size",10)
    //         .attr('fill', 'black')
    //         .style('text-anchor', isLabelRight ? 'end' : 'start')
    //         .style('dominant-baseline', 'hanging')
    //
    // };
    //
    //
    // const dataBySpeciesName = d3
    //     .nest()
    //     .key((d) => d.species_name)
    //     .entries(new_early_data);
    //
    //
    // const formatDate = (d) => (d < 0 ? `${-d}BC` : `${d}AD`);
    // const axisTop = d3.axisTop(x).tickPadding(2).tickFormat(formatDate);
    //
    // const axisBottom = d3.axisBottom(x).tickPadding(2).tickFormat(formatDate);
    //
    //
    // const chart1 = (() => {
    //     const filteredData = new_early_data;
    //
    //     filteredData.forEach((d) => (d.color = d3.color(color(d.species_name))));
    //
    //     const parent = document.createElement('div');
    //
    //     // parent.classList.add("timeGraph");
    //
    //     const svg = d3.select(DOM.svg(width + 200, height));
    //
    //     const g = svg.append('g').attr('transform', (d, i) => `translate(${padding.left} ${padding.top})`);
    //
    //     const groups = g.selectAll('g').data(filteredData).enter().append('g').attr('class', 'civ');
    //
    //     const tooltip = d3.select(document.createElement('div')).call(createTooltip);
    //
    //     const line = svg
    //         .append('line')
    //         .attr('y1', padding.top - 10)
    //         .attr('y2', height - padding.bottom)
    //         .attr('stroke', 'rgba(0,0,0,0.2)')
    //         .style('pointer-events', 'none');
    //
    //     groups.attr('transform', (d, i) => `translate(0 ${y(i)})`);
    //
    //     groups
    //         .each(getRect)
    //         .on('mouseover', function (d) {
    //             d3.select(this).select('rect').attr('fill', d.color.darker())
    //         })
    //         .on('mouseleave', function (d) {
    //             d3.select(this).select('rect').attr('fill', d.color);
    //             tooltip.style('opacity', 0)
    //         });
    //
    //     svg.append('g')
    //         .attr('transform', (d, i) => `translate(${padding.left} ${padding.top - 10})`)
    //         .call(axisTop);
    //
    //     svg.append('g')
    //         .attr('transform', (d, i) => `translate(${padding.left} ${height - padding.bottom})`)
    //         .call(axisBottom);
    //
    //     svg.on('mousemove', function (d) {
    //         let [x, y] = d3.mouse(this);
    //         line.attr('transform', `translate(${x} 0)`);
    //         y += 20;
    //         if (x > width / 2) x -= 100;
    //
    //         tooltip.style('left', x + 'px').style('top', y + 'px')
    //     });
    //
    //     parent.appendChild(svg.node());
    //     parent.appendChild(tooltip.node());
    //     parent.groups = groups;
    //     const civs = d3.selectAll('.civ');
    //
    //     civs.data(filteredData, (d) => d.species_name)
    //         .transition()
    //         // .delay((d,i)=>i*10)
    //         .ease(d3.easeCubic)
    //         .attr('transform', (d, i) => `translate(0 ${y(i)})`);
    //     return parent
    // })();
    //
    // document.getElementById("time").appendChild(chart1)


    //第三部分，画动态timeline图
        const early_data = early_csv
        .map((d) => {
            return {
                ...d,
                start_year: +d.start_year,
                end_year: +d.end_year,
            }
        });


        //未过滤数据
        const new_early_data=[];
        let giveLane=0;
        divide_category_species_name.forEach(function (data1,key1) {
        data1.forEach(function (data2,key2) {
            data2.forEach(function (data3) {
                let littleList=[];
                early_data.forEach(function (data4) {
                    if(data4["species_name"]===data3){
                            data4['lane']=giveLane;
                            littleList.push(data4);
                    }
                });
                for(let i=0;i<littleList.length;i++){
                    new_early_data.push(littleList[i])
                }
                giveLane=giveLane+1;
            })
        })
    });

        let new_early_csv_species_name =new Set();
        new_early_data.forEach(function (data) {
            new_early_csv_species_name.add(data['species_name'])
        });


        let lanes=[];
        new_early_csv_species_name.forEach(function (data) {
            lanes.push(data)
        });

        const laneLength = lanes.length;

        const finalData = new_early_data.map((d) => {
        return {
            ...d,
            lane: +d.lane,
        }
    });

    const timeBegin = d3.min(finalData, (d) => d.start_year);
    const timeEnd = d3.max(finalData, (d) => d.end_year);

    const m = [20, 15, 15, 240]; // top right bottom left
    const w = 960 - m[1] - m[3];
    const h = 4700 - m[0] - m[2];

    const miniHeight = laneLength * 12 + 50;
    const mainHeight = h - miniHeight - 50;

    const x = d3.scaleLinear().domain([timeBegin, timeEnd]).range([0, w]);

    const axisX = d3.axisBottom().scale(x);

    const x1 = d3.scaleLinear().range([0, w]);
    const y1 = d3.scaleLinear().domain([0, laneLength]).range([0, mainHeight]);

    const y2 = d3.scaleLinear().domain([0, laneLength]).range([0, miniHeight]);

    const timeChart = d3
        .select('#time')
        .append('svg')
        .attr('width', w + m[1] + m[3])
        .attr('height', h + m[0] + m[2])
        .attr('class', 'chart');

    timeChart
        .append('defs')
        .append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('width', w)
        .attr('height', mainHeight);

    const main = timeChart
        .append('g')
        .attr('transform', 'translate(' + m[3] + ',' + m[0] + ')')
        .attr('width', w)
        .attr('height', mainHeight)
        .attr('class', 'main');

    const mini = timeChart
        .append('g')
        .attr('transform', 'translate(' + m[3] + ',' + (mainHeight + m[0]) + ')')
        .attr('width', w)
        .attr('height', miniHeight)
        .attr('class', 'mini');

    // main lanes and texts
    main.append('g')
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
        .attr('stroke', 'lightgray');

    main.append('g')
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
        .attr('class', 'laneText');

    // mini lanes and texts
    mini.append('g')
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
        .attr('stroke', 'lightgray');

    mini.append('g')
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
        .attr('class', 'laneText');


    const itemRects = main.append('g').attr('clip-path', 'url(#clip)');

    // mini item rects
    mini.append('g')
        .selectAll('.miniItems')
        .data(finalData)
        .enter()
        .append('rect')
        .attr('class', function (d) {
            return 'miniItem' + d.lane
        })
        .attr('class','minicolor')
        .attr('x', function (d) {
            return x(d.start_year)
        })
        .attr('y', function (d) {
            return y2(d.lane + 0.5) - 5
        })
        .attr('width', function (d) {
            return x(d.end_year) - x(d.start_year)
        })
        .attr('height', 10);


    timeChart
        .append('g')
        .attr('transform', `translate(${m[1] + m[3]},${mainHeight + miniHeight + 50})`)
        .attr('fill', '#000')
        // .attr("text-anchor", "end")
        .attr('font-weight', 'bold')
        .call(axisX);


    mini.append('g')
        .selectAll('.miniLabels')
        .data(finalData)
        .enter()
        .append('text')
        .text(function (d) {
            return d.species_name
        })
        .attr('x', function (d) {
            return x(d.start_year)
        })
        .attr('y', function (d) {
            return y2(d.lane + 0.5)
        })
        .attr('dy', '.5ex');



    // brush
    const brush = d3
        .brushX()
        .extent([
            [0, 0],
            [w, miniHeight],
        ])
        .on('brush', display);

    mini.append('g')
        .attr('class', 'x brush')
        .call(brush)
        .selectAll('rect')
        .attr('y', 1)
        .attr('height', miniHeight - 1);


        function display() {
        // v3变到v5语法改变
        const extent = d3.event.selection || [0, 825];
        // v3变到v5语法改变
        const [minExtent, maxExtent] = extent.map((val) => x.invert(val));

        const visItems = finalData.filter(function (d) {
            return !(d.start_year > maxExtent || d.end_year < minExtent)
        });
        x1.domain([minExtent, maxExtent]);

        // update main item rects
        const rects = itemRects
            .selectAll('rect')
            .data(visItems, function (d) {
                return d.species_name
            })
            .attr('x', function (d) {
                return x1(d.start_year)
            })
            .attr('width', function (d) {
                return x1(d.end_year) - x1(d.start_year)
            });

        rects
            .enter()
            .append('rect')
            .attr('class', function (d) {
                return 'miniItem' + d.lane
            })
            .attr('class','minicolor')
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
            });

        rects.exit().remove();

        // update the item labels
        const labels = itemRects
            .selectAll('text')
            .data(visItems, function (d) {
                return d.species_name
            })
            .attr('x', function (d) {
                return x1(Math.max(d.start_year, minExtent) + 2)
            });

        labels
            .enter()
            .append('text')
            .text(function (d) {
                return d.species_name
            })
            .attr('x', function (d) {
                return x1(Math.max(d.start_year, minExtent))
            })
            .attr('y', function (d) {
                return y1(d.lane + 0.5)
            })
            .attr('text-anchor', 'start');

        labels.exit().remove()
    }


});
