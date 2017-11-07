(() => {
    // Draw canvas
    const margin = { top: 40, right: 50, bottom: 40, left: 50 };
    const height = window.screen.height * 0.5 - (margin.top + margin.bottom);
    const width = window.screen.width * 0.75 - (margin.left + margin.right);

    const svg = d3.select('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Set up Titles/Axis Labels/Legend
    const graphTitle = g.append('text').attr('id', 'graph-title')

    const graphTitleSubtext = g.append('text').attr('transform', `translate(0, 10)`)

    const xAxis = g.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0, ${height + 5})`)

    const xAxisLabel = xAxis.append('text')
        .attr('class', 'axis-label')
        .attr('transform', `translate(${width / 2}, 35)`)

    const yAxis = g.append('g').attr('class', 'axis')

    const yAxisLabel = yAxis.append('text')
        .attr('class', 'axis-label')
        .attr('transform', `translate(-35, ${height / 2}) rotate(-90)`)

    const legend = g.append('g')
        .attr('class', 'legend')

    // set up event listeners
    const select = document.getElementById('graph-select');

    fetchData(select.value)
    select.addEventListener('change', () => fetchData(select.value))

    const color = {
        'facebook_user_rank_avg': '#3B5998',
        'youtube_user_rank_avg': '#c4302b'
    }

    function fetchData(route) {
        d3.json('/api/' + route, res => {
            const { data } = res;
            switch (route) {
                case 'state-social':
                    data.sort((a, b) => {
                        const totalSocialA = a['facebook_user_rank_avg'] + a['youtube_user_rank_avg'];
                        const totalSocialB = b['facebook_user_rank_avg'] + b['youtube_user_rank_avg'];
                        return totalSocialB - totalSocialA;
                    });
                    updateSocialGraph(data);
                    break;
                case 'race-economic-stability':
                    console.log(data);
                    updateRaceEcoGraph(data)
                    break;
                case 'gender-income-spending':
                    console.log(data);
                    updateGenderIncGraph(data)
                    break;
                default:
                    break;
            }
        })
    }
    function updateSocialGraph(data) {
        // Set x and y scales
        const x = d3.scaleBand()
            .domain(data.map(val => val.state))
            .paddingInner(0.05)
            .rangeRound([0, width])
            .align(0.1);

        const y = d3.scaleLinear()
            .domain([40, 1])
            .rangeRound([1, height]);

        xAxis.call(d3.axisBottom(x));
        yAxis.call(d3.axisLeft(y));

        graphTitle.text('Average Propensity of The Use of Social Media vs States')
            .attr('transform', function () {
                return `translate(${width / 2 - this.getComputedTextLength()/2}, -15)`
            })

        graphTitleSubtext.text('(The lower the more likelier to use social media)')
            .attr('transform', function () {
                return `translate(${width / 2 - this.getComputedTextLength() /2}, 0)`
            })

        xAxisLabel.text('States');
        yAxisLabel.text('Average Propensity')

        const legendkeys = legend.selectAll('g')
            .data(['Youtube', 'Facebook'])
            .enter().append('g')
            .attr('transform', (d, i) => `translate(0, ${i * 35})`);

        legendkeys.append('rect')
            .attr('x', width - 30)
            .attr('width', 30)
            .attr('height', 30)
            .attr('fill', (d, i) => ['#c4302b', '#3B5998'][i]);

        legendkeys.append('text')
            .attr('x', width - 35)
            .attr('y', 10)
            .attr('dy', "0.5em")
            .text(function (d) { return d; });

        // Draw the data
        g.append('g')
            .selectAll('g')
            .data(d3.stack().keys(['facebook_user_rank_avg', 'youtube_user_rank_avg'])(data))
            .enter().append('g')
            .attr('fill', d => color[d.key])
            .selectAll('rect')
            .data(d => d)
            .enter().append('rect')
            .attr("x", function (d) { return x(d.data.state); })
            .attr("y", function (d) { return y(d[1]); })
            .attr("height", function (d) { return y(d[0]) - y(d[1]); })
            .attr("width", x.bandwidth());
    }
    function updateRaceEcoGraph(data) {
        graphTitle.text()
        xAxis.call(d3.axisBottom(x));
        xAxisLabel.text('States');
        yAxis.call(d3.axisLeft(y));
        yAxisLabel.text('');
    }
    function updateGenderIncGraph(data) {
        xAxis.call(d3.axisBottom(x));
        xAxisLabel.text('States');
        yAxis.call(d3.axisLeft(y));
        yAxisLabel.text('');
    }
})()