Promise.all([d3.csv('./data/all_data_early.csv'), d3.json('./data/all_data_early.json')]).then(([early_csv, early_json]) => {
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

    const divide_category_species_name=new Map();
    divide_category.forEach(function(value,key){
        let tempSet=value;
        let tempMap=new Map();
        tempSet.forEach(function (d) {
            tempMap.set(d,category_species_name.get(d));
        });
        divide_category_species_name.set(key,tempMap)
　　　　});



    const early_data = early_csv
        .map((d) => {
            return {
                ...d,
                start_year: +d.start_year,
                end_year: +d.end_year,
            }
        });

    const new_early_data=[];

    divide_category_species_name.forEach(function (data1,key1) {
        data1.forEach(function (data2,key2) {
            data2.forEach(function (data3) {
                let littleList=[];
                early_data.forEach(function (data4) {
                    if(data4["species_name"]===data3){
                        if(littleList.length===0){
                            littleList.push(data4);
                        }else {
                            let old_year = parseInt(littleList[0]["end_year"]) - parseInt(littleList[0]["start_year"]);
                            let new_year = parseInt(data4["end_year"]) - parseInt(data4["start_year"]);
                            if (new_year > old_year) {
                                littleList[0] = data4;
                            }
                        }

                    }
                });
                new_early_data.push(littleList[0])
            })
        })
    });

    //X轴
    const padding = {top: 20, right: 40, bottom: 20, left: 10};
    const width=1500;
    const height=300;
    const x = d3
        .scaleLinear()
        .domain([d3.min(new_early_data, (d) => d.start_year), d3.max(new_early_data, (d) => d.end_year)])
        .range([padding.left, width - padding.right])
        ;

    const formatDate = (d) => (d < 0 ? `${-d}BC` : `${d}AD`);


    const xAaxis = d3.axisBottom(x).tickFormat(formatDate);


    //准备数据
    // -298 -201
    const minYear=d3.min(new_early_data, (d) => d.start_year);
    const maxYear=d3.max(new_early_data, (d) => d.end_year);

    //到底分多少段，可能要改
    const thresholds = x.ticks(maxYear-minYear);
    const species_nameListLength=maxYear-minYear;

    //准备种数据
    let species_nameList=new Array(species_nameListLength).fill(0);
    let new_data=[];
    new_early_data.forEach(function (data) {
        let min=data.start_year;
        let max=data.end_year;
        for(let i=min;i<=max;i++){
            new_data.push(i);
        }

    });



    new_early_data.forEach(function (data) {
         let min=data.start_year;
         let max=data.end_year;

         let afterMin=min+298;
         let afterMax=max+298;
         for(let i=afterMin;i<afterMax;i++){
             species_nameList[i]+=1;
         }
    });


    const bins = d3.histogram()
                    .domain(x.domain())
                    .thresholds(thresholds)
                    (new_data);


    function kde(kernel, thresholds, data) {
        // return thresholds.map(t => [t, d3.mean(data, d => kernel(t - d))])
        return thresholds.map(t => [t, d3.mean(data, d => kernel(t - d))])
    }

    function epanechnikov(bandwidth) {
    return x => Math.abs(x /= bandwidth) <= 1 ? 0.75 * (1 - x * x) / bandwidth : 0;
}


     const y = d3.scaleLinear()
            .domain([0, d3.max(species_nameList)])
            .range([height - padding.bottom, padding.top]);


    const yAaxis = d3.axisLeft(y);



    const svg=d3.select('#barGraph')
                .append("svg")
                .attr("width",width)
                .attr("height",height);

    const rectWidth=x(thresholds[1])-x(thresholds[0]);
    const rectStep=rectWidth;
    const cha=x(thresholds[0])-padding.left;

    let rect=svg.selectAll("rect")
        .data(species_nameList)
        .enter()
        .append('rect')
        .attr("fill","steelblue")
        .attr('x',function (d,i) {
                return padding.left+i*rectStep+10

        })
        .attr('y',function (d) {
            return height-padding.bottom-d;
        })
        .attr('width',function (d,i) {
            // if(i===0){
            //     return x(ticks[0])-x(minYear);
            // }else{
                return rectWidth;
            // }
        })
        .attr('height',function (d) {
            return d;
        });


    svg.append('g')
        .attr('transform', `translate(${padding.left},${height - padding.bottom})`)
        .attr("fill", "#000")
        .attr("text-anchor", "end")
        .attr("font-weight", "bold")
        .call(xAaxis);

    svg.append('g')
        .attr("transform", `translate(${padding.left+9},0)`)
        .attr("text-anchor", "end")
        .attr("font-weight", "bold")
        .attr("font-size","8px")
        .call(yAaxis);


    const range=document.getElementById("range");
    range.addEventListener(
         'input',
         (e) =>{
             let p = d3.select("#thisPath");
             p.remove();
             let bandwidth=range.value;
             myDrawFunction(bandwidth);
         },
        false,
    );

    function myDrawFunction(bandwidth) {
        // 需要能调整bandwidth
        const density = kde(epanechnikov(bandwidth), thresholds,new_data);

        const line = d3.line()
                .curve(d3.curveBasis)
                .x(d => x(d[0]))
                .y(d => y(d[1]*600));


        svg.append("path")
            .datum(density)
            .attr("id","thisPath")
            .attr("fill", "none")
            .attr("stroke", "#000")
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("d", line);
    }


});