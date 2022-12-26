import * as d3 from 'd3';

export default function CantonalGraph(
    data,
    unique,
    {
        x = (d) => d, // given d in data, returns the (quantitative) x-value
        y = (d, i) => i, // given d in data, returns the (ordinal) y-value
        width = 640, // the outer width of the chart, in pixels
        height = 500, // outer height, in pixels
        marginTop = 0.066 * height, // the top margin, in pixels
        marginRight = 40, // the right margin, in pixels
        marginBottom = 10, // the bottom margin, in pixels
        marginLeft = 40, // the left margin, in pixels
        gutter = 40,
        widthDamage = 35,
        paddingLeftDamage = 0.1,
        xType = d3.scaleLinear, // type of x-scale
        xDomain, // [xmin, xmax]
        xTickFormat,
        xTickValues = [0, 1, 100, 1000, 10000],
        yPaddingInner = 0.4, // amount of y-range to reserve to separate bars
        yPaddingOuter = 0.2,
        displayValue = true,
    } = {}
) {
    // SVG
    const svg = d3
        .create('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height])
        .attr('style', `width: ${width}px!important; height: ${height}px!important`);

    let defs = svg.append('defs');

    defs.append('linearGradient')
        .attr('id', `colorscale-gradient-${unique}`)
        .call((gradient) => {
            gradient
                .append('stop')
                .attr('offset', '0%')
                .attr('stop-color', 'rgba(204, 255, 102, 1)');
            gradient
                .append('stop')
                .attr('offset', '10%')
                .attr('stop-color', 'rgba(204, 255, 102, 1)');
            gradient
                .append('stop')
                .attr('offset', '30%')
                .attr('stop-color', 'rgba(255, 255, 0, 1)');
            gradient
                .append('stop')
                .attr('offset', '50%')
                .attr('stop-color', 'rgba(255, 153, 0, 1)');
            gradient.append('stop').attr('offset', '70%').attr('stop-color', 'rgba(255, 0, 0, 1)');
            gradient.append('stop').attr('offset', '90%').attr('stop-color', 'rgba(128, 0, 0, 1)');
            gradient.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(128, 0, 0, 1)');
        });

    // convenience function to divide layout in two columns
    const half = Math.ceil(data.length / 2);
    function getHalf(i) {
        return Math.floor(i / half);
    }

    const dataHeight = height - marginTop - marginBottom;
    const dataWidth =
        (width - marginLeft - gutter - marginRight - widthDamage * (2 + 2 * paddingLeftDamage)) / 2;

    const xRange = [marginLeft, marginLeft + dataWidth];

    // compute range for the two separate y scales
    const yRange = [marginTop, marginTop + dataHeight];
    // Compute double the range so the step size is correct for the data.
    // Subtract 1 outer padding from 2*total height (step*yPadding)
    const yRangeFull = [
        marginTop,
        marginTop + 2 * dataHeight - (dataHeight / (half + 2 * yPaddingOuter)) * yPaddingOuter,
    ];

    // compute values
    const X = d3.map(data, x);
    const Y = d3.map(data, y);

    // Compute default domains, and unique the y-domain.
    if (xDomain === undefined) xDomain = [0, d3.max(X)];
    let yDomain = new d3.InternSet(Y);

    let yDomain1 = new d3.InternSet(d3.map(data.slice(0, half), y));
    let yDomain2 = new d3.InternSet(d3.map(data.slice(half), y));

    // Omit any data not present in the y-domain.
    const I = d3.range(X.length).filter((i) => yDomain.has(Y[i]));

    // Construct scales and axes.
    const xScale = xType(xDomain, xRange);
    if (xType === d3.scaleLog) xScale.clamp(true);

    const yScale = d3.scaleBand(yDomain, yRangeFull).paddingInner(yPaddingInner).paddingOuter(0.2);
    const yScale1 = d3.scaleBand(yDomain1, yRange).paddingInner(yPaddingInner).paddingOuter(0.2);
    const yAxis1 = d3.axisLeft(yScale1).tickSizeOuter(0);

    const yScale2 = d3.scaleBand(yDomain2, yRange).paddingInner(yPaddingInner).paddingOuter(0.2);
    const yAxis2 = d3.axisLeft(yScale2).tickSizeOuter(0);

    const xAxis = d3.axisTop(xScale).tickValues(xTickValues).tickFormat(xTickFormat);

    const rightColumnStart = dataWidth + gutter + widthDamage * (1 + paddingLeftDamage);
    const innerPadding = yScale.step() * yPaddingInner;
    const outerPadding = yScale.step() * yPaddingOuter;

    if (displayValue) {
        // PERCENT BACKDROP
        svg.append('rect')
            .attr('x', xScale(0) + dataWidth + widthDamage * paddingLeftDamage)
            .attr('y', yScale(Y[0]) - innerPadding / 2)
            .attr('width', widthDamage)
            .attr('height', dataHeight - outerPadding / 2)
            .style('fill', '#cbcbcb');

        svg.append('rect')
            .attr('x', xScale(0) + rightColumnStart + dataWidth + widthDamage * paddingLeftDamage)
            .attr('y', yScale(Y[0]) - innerPadding / 2)
            .attr('width', widthDamage)
            .attr('height', dataHeight - yScale.step() - outerPadding / 2)
            .style('fill', '#cbcbcb');

        const iconHeight = height * 0.05;

        // HOUSE SVG
        // LEFT
        const prom1 = d3.svg('images/icons/haus.svg').then((icon) => {
            const iconNode = d3.select(icon.documentElement).remove();
            svg.node().appendChild(iconNode.node());
        });

        // RIGHT
        const prom2 = d3.svg('images/icons/haus.svg').then((icon) => {
            const iconNode = d3.select(icon.documentElement).remove();
            svg.node().appendChild(iconNode.node());
        });

        // POSITION
        Promise.all([prom1, prom2]).then(() => {
            svg.selectAll('svg svg')
                .attr('width', iconHeight)
                .attr('height', iconHeight)
                .attr('y', yScale(Y[0]) - yScale.step() - innerPadding / 2)
                .attr(
                    'x',
                    (n, i) =>
                        xScale(0) +
                        i * rightColumnStart +
                        dataWidth +
                        widthDamage * paddingLeftDamage +
                        (widthDamage - iconHeight) / 2
                );

            svg.selectAll('svg svg path').attr('fill', '#cbcbcb');
        });

        // BARS VALUE DISPLAY
        svg.append('g')
            .attr('font-family', 'Verdana, Arial, sans-serif')
            .attr('text-anchor', 'end')
            .attr('font-size', '8')
            .attr('font-weight', 100)
            .selectAll('text')
            .data(I)
            .join('text')
            .attr(
                'x',
                (i) =>
                    xScale(0) +
                    dataWidth +
                    widthDamage * paddingLeftDamage +
                    widthDamage / 2 +
                    getHalf(i) * rightColumnStart
            )
            .attr('y', (i) => yScale(Y[i - getHalf(i) * half]) + yScale.step() / 2)
            .attr('dx', widthDamage * 0.25)
            .attr('dy', -0.007 * height)
            .text((i) => {
                if (Y[i] === 'CH') return '';
                if (X[i][3] < 1 && X[i][3] > 0) return '<1%';
                return `${d3.format('.0%')(X[i][3] / 100)}`;
            });
    }
    // DATA MASKING GRADIENTS
    defs.selectAll('foo')
        .data(I)
        .join('linearGradient')
        .attr('id', (i) => `mask-gradient-${unique}-${Y[i]}`)
        .call((gradient) => {
            gradient
                .append('stop')
                .attr(
                    'offset',
                    (i) => (xScale(X[i][0]) - xScale(0)) / (xScale(xDomain[1]) - xScale(0))
                )
                .attr('stop-color', 'white')
                .attr('stop-opacity', '0');
            gradient
                .append('stop')
                .attr(
                    'offset',
                    (i) => (xScale(X[i][1]) - xScale(0)) / (xScale(xDomain[1]) - xScale(0))
                )
                .attr('stop-color', 'white')
                .attr('stop-opacity', '1');
            gradient
                .append('stop')
                .attr(
                    'offset',
                    (i) => (xScale(X[i][2]) - xScale(0)) / (xScale(xDomain[1]) - xScale(0))
                )
                .attr('stop-color', 'white')
                .attr('stop-opacity', '0');
        });

    // BAR BACKDROP
    svg.append('g')
        .selectAll('rect')
        .data(I)
        .join('rect')
        .attr('fill', (i) => (Y[i] === 'CH' ? '#c6c5c4' : '#e6e7e9'))
        .attr('x', (i) => xScale(0) + getHalf(i) * rightColumnStart)
        .attr('y', (i) => yScale(Y[i - getHalf(i) * half]))
        .attr('width', dataWidth)
        .attr('height', yScale.bandwidth());

    // DATA BARS
    defs.append('mask')
        .attr('id', `data-mask-${unique}`)
        .selectAll('foo')
        .data(I)
        .join('rect')
        .attr('x', (i) => xScale(0) + getHalf(i) * rightColumnStart)
        .attr('y', (i) => yScale(Y[i - getHalf(i) * half]))
        .attr('width', dataWidth)
        .attr('height', yScale.bandwidth())
        .attr('fill', (i) => `url(#mask-gradient-${unique}-${Y[i]})`);

    svg.append('rect')
        .attr('x', xScale(0))
        .attr('y', yScale(0))
        .attr('width', dataWidth)
        .attr('height', height)
        .style('fill', `url(#colorscale-gradient-${unique})`)
        .attr('mask', `url(#data-mask-${unique})`);

    svg.append('rect')
        .attr('x', xScale(0) + rightColumnStart)
        .attr('y', yScale(0))
        .attr('width', dataWidth)
        .attr('height', height)
        .style('fill', `url(#colorscale-gradient-${unique})`)
        .attr('mask', `url(#data-mask-${unique})`);

    // Y AXIS LABELS
    //   LEFT
    svg.append('g')
        .attr('transform', `translate(${marginLeft},0)`)
        .call(yAxis1)
        .call((g) => g.selectAll('.domain').remove())
        .call((g) =>
            g
                .selectAll('text')
                .attr('font-size', '12px')
                .attr('font-family', 'Verdana, Arial, sans-serif')
        );

    // RIGHT
    svg.append('g')
        .attr('transform', `translate(${marginLeft + rightColumnStart},0)`)
        .call(yAxis2)
        .call((g) => g.selectAll('.domain').remove())
        .call((g) =>
            g
                .selectAll('text')
                .attr('font-size', '12px')
                .attr('font-family', 'Verdana, Arial, sans-serif')
        );

    // X-AXIS AND STROKES
    // LEFT
    svg.append('g')
        .attr('transform', `translate(0,${marginTop})`)
        .attr('stroke-width', '0.5')
        .call(xAxis)
        .call((g) =>
            g
                .selectAll('.tick line')
                .clone()
                .attr('y2', height - marginTop - marginBottom)
        )
        .call((g) => g.selectAll('.domain').remove())
        .call((g) => g.selectAll('.tick text').attr('font-size', '11px'));

    // RIGHT
    svg.append('g')
        .attr('transform', `translate(${rightColumnStart},${marginTop})`)
        .attr('stroke-width', '0.5')
        .call(xAxis)
        .call((g) =>
            g
                .selectAll('.tick line')
                .clone()
                .attr('y2', height - marginTop - marginBottom)
        )
        .call((g) => g.selectAll('.domain').remove())
        .call((g) => g.selectAll('.tick text').attr('font-size', '11px'));

    return svg.node();
}
