/* global d3 */
d3.csv('./data/all_data_early.csv').then(function (early_csv) {
    const DOM = {
        svg(width, height) {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', [0, 0, width, height]);
            svg.setAttribute('width', width);
            svg.setAttribute('height', height);
            return svg
        },
    };


    // sort中按start升序排序
    // ...操作符把d的所有属性在那写一遍
    const early_data = early_csv
        .map((d) => {
            return {
                ...d,
                start_year: +d.start_year,
                end_year: +d.end_year,
            }
        })
        .sort((a, b) => a.start_year - b.start_year);

    // 环境如果不支持 Set 时的丐版 O(n) 去重，数据只能是字符串类型
    // const temp = {}
    // const hasOwnProperty = Object.prototype.hasOwnProperty
    // early_csv_species_name = early_csv.filter(obj => hasOwnProperty.call(temp, obj.species_name) ? false : (temp[obj.species_name] = true))

    const early_csv_species_name = [...new Set(early_csv.map((obj) => obj.species_name))];

    const color = d3.scaleOrdinal(d3.schemeSet2).domain(early_csv_species_name);

    const height = 2100;
    const width = 650;
    const margin = { top: 30, right: 30, bottom: 30, left: 30 };
    const y = d3
        .scaleBand()
        .domain(d3.range(early_data.length))
        .range([0, height - margin.bottom - margin.top])
        .padding(0.2);

    const x = d3
        .scaleLinear()
        .domain([d3.min(early_data, (d) => d.start_year), d3.max(early_data, (d) => d.end_year)])
        .range([0, width - margin.left - margin.right]);

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
    };
    const getRect = function (d) {
        const el = d3.select(this);
        const sx = x(d.start_year);
        const w = x(d.end_year) - x(d.start_year);
        const isLabelRight = sx > width / 2 ? sx + w < width : sx - w > 0;

        el.style('cursor', 'pointer');

        el.append('rect').attr('x', sx).attr('height', y.bandwidth()).attr('width', w).attr('fill', d.color);

        el.append('text')
            .text(d.species_name)
            .attr('x', isLabelRight ? sx - 5 : sx + w + 5)
            .attr('y', 2.5)
            .attr('fill', 'black')
            .style('text-anchor', isLabelRight ? 'end' : 'start')
            .style('dominant-baseline', 'hanging')
    };

    const dataBySpeciesName = d3
        .nest()
        .key((d) => d.species_name)
        .entries(early_data);


    const formatDate = (d) => (d < 0 ? `${-d}BC` : `${d}AD`);
    const axisTop = d3.axisTop(x).tickPadding(2).tickFormat(formatDate);

    const axisBottom = d3.axisBottom(x).tickPadding(2).tickFormat(formatDate);

    const chart = (() => {
        const filteredData = early_data;

        filteredData.forEach((d) => (d.color = d3.color(color(d.species_name))));

        const parent = document.createElement('div');

        parent.classList.add("timeGraph");

        const svg = d3.select(DOM.svg(width + 200, height));

        const g = svg.append('g').attr('transform', (d, i) => `translate(${margin.left} ${margin.top})`);

        const groups = g.selectAll('g').data(filteredData).enter().append('g').attr('class', 'civ');

        const tooltip = d3.select(document.createElement('div')).call(createTooltip);

        const line = svg
            .append('line')
            .attr('y1', margin.top - 10)
            .attr('y2', height - margin.bottom)
            .attr('stroke', 'rgba(0,0,0,0.2)')
            .style('pointer-events', 'none');

        groups.attr('transform', (d, i) => `translate(0 ${y(i)})`);

        groups
            .each(getRect)
            .on('mouseover', function (d) {
                d3.select(this).select('rect').attr('fill', d.color.darker())
            })
            .on('mouseleave', function (d) {
                d3.select(this).select('rect').attr('fill', d.color)
                tooltip.style('opacity', 0)
            });

        svg.append('g')
            .attr('transform', (d, i) => `translate(${margin.left} ${margin.top - 10})`)
            .call(axisTop);

        svg.append('g')
            .attr('transform', (d, i) => `translate(${margin.left} ${height - margin.bottom})`)
            .call(axisBottom);

        // svg.on('mousemove', function (d) {
        //     let [x, y] = d3.mouse(this);
        //     line.attr('transform', `translate(${x} 0)`);
        //     y += 20;
        //     if (x > width / 2) x -= 100;
        //
        //     tooltip.style('left', x + 'px').style('top', y + 'px')
        // });

        parent.appendChild(svg.node());
        parent.appendChild(tooltip.node());
        parent.groups = groups;
        const civs = d3.selectAll('.civ');

        civs.data(filteredData, (d) => d.species_name)
            .transition()
            // .delay((d,i)=>i*10)
            .ease(d3.easeCubic)
            .attr('transform', (d, i) => `translate(0 ${y(i)})`);
        return parent
    })();

    document.body.appendChild(chart)

});
