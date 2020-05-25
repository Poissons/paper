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


    const padding = {top: 20, right: 40, bottom: 20, left: 40};
    // const padding = {top: 40, right: 40, bottom: 40, left: 200};
    const width=1000;
    const height=300;

    const x = d3
        .scaleLinear()
        .domain([d3.min(new_early_data, (d) => d.start_year), d3.max(new_early_data, (d) => d.end_year)])
        .range([padding.left, width - padding.right]);

    const formatDate = (d) => (d < 0 ? `${-d}BC` : `${d}AD`);

    const xAaxis = d3.axisBottom(x).tickFormat(formatDate);



    //准备数据
    const minYear=d3.min(new_early_data, (d) => d.start_year);
    const maxYear=d3.max(new_early_data, (d) => d.end_year);
    console.log(minYear,maxYear);
    const ticks=x.ticks();
    const ticksLength=ticks.length;

    let species_nameList=[0,0,0,0,0,0,0,0,0,0];

    //准备种数据
    new_early_data.forEach(function (data) {
         let min=data.start_year;
         let max=data.end_year;


         for(let i=0; i<=ticksLength; i++){
             if(i<ticksLength){
                 if((min<ticks[i])&&(ticks[i]<=max)){
                 species_nameList[i]+=1;
                }else if(max<=ticks[i]){
                 if(max>ticks[i-1]){
                     species_nameList[i]+=1;
                 }

             }
             }else{
                 if(max>ticks[i-1]){
                     species_nameList[i]+=1
                 }
             }

         }


    });


    //准备属数据



    const y = d3.scaleLinear()
            .domain([0, d3.max(species_nameList)])
            .range([height - padding.bottom, padding.top]);


    const yAaxis = d3.axisLeft(y);



    const svg=d3.select('#barGraph')
                .append("svg")
                .attr("width",width)
                .attr("height",height);


    svg.append('g')
        .attr('transform', `translate(${padding.left},${height - padding.bottom})`)
        .attr("fill", "#000")
        .attr("text-anchor", "end")
        .attr("font-weight", "bold")
        .call(xAaxis);


    svg.append('g')
        .attr("transform", `translate(${padding.left},0)`)
        .attr("text-anchor", "end")
        .attr("font-weight", "bold")
        .call(yAaxis);


    const rectWidth=x(ticks[1])-x(ticks[0]);
    const rectStep=rectWidth;
    console.log(rectWidth);

    let rect=svg.selectAll("rect")
        .data(species_nameList)
        .enter()
        .append('rect')
        .attr("fill","steelblue")
        .attr('x',function (d,i) {
            if(i===0){
                return padding.left+40
            }else{
                return padding.left+i*rectStep+21
            }
        })
        .attr('y',function (d) {
            return height-padding.bottom-d;
        })
        .attr('width',function (d,i) {
            if(i===0){
                return x(ticks[0])-x(minYear);
            }else{
                return rectWidth;
            }
        })
        .attr('height',function (d) {
            return d;
        });

    
    function kde(kernel, thresholds, data) {
        // return thresholds.map(t => [t, d3.mean(data, d => kernel(t - d))])
        return thresholds.map(t => [t, d3.mean(data, d => kernel(t - d))])
    }

    function epanechnikov(bandwidth) {
    return x => Math.abs(x /= bandwidth) <= 1 ? 0.75 * (1 - x * x) / bandwidth : 0;
}

  // const new_data=[-295,-295,-285,-285,-275,-275,-265,-265,-255,-255,-255,-255,-255,-255,-255,-255,-255,-255,-255,-255,-255,-255,-245,-245,-245,-245,-245,-245,-245,-245,-245,-245,-245,-245,-245,-235,-235,-235,-235,-235,-235,-235,-225,-225,-225,-225,-225,-215,-215,-215,-215,-215,-205,-205,-205,-205,-205];
    let new_data=[];
    let cha=(ticks[1]-ticks[0])/2;
    for(let i=0;i<=ticksLength; i++) {
        let count = species_nameList[i];
        if (i < ticksLength) {
            let item = ticks[i] - cha;
            while (count > 0) {
                new_data.push(item);
                count=count-1;
            }

        }
        else{
            let item = ticks[i-1] + cha;
            while (count > 0) {
                new_data.push(item);
                count=count-1;
            }
        }

    }

    const density = kde(epanechnikov(7), ticks,new_data);

    const line = d3.line()
    .curve(d3.curveBasis)
    .x(d => x(d[0]))
    .y(d => y(d[1]*1000));

    svg.append("path")
      .datum(density)
      .attr("fill", "none")
      .attr("stroke", "grey")
      .attr("stroke-width", 4)
      .attr("stroke-linejoin", "round")
      .attr("d", line);

});
