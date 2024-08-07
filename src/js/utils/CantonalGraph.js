import { create, select } from 'd3-selection';
import { InternSet, max, range } from 'd3-array';
import { scaleBand, scaleSymlog } from 'd3-scale';
import { axisLeft, axisTop } from 'd3-axis';
import { format } from 'd3-format';
import { svg as fetchSVG } from 'd3-fetch';
import haus from '../../images/icons/haus.svg';

export default function CantonalGraph(
    data,
    unique,
    {
        x = (d) => d, // given d in data, returns the (quantitative) x-value
        y = (d, i) => i, // given d in data, returns the (ordinal) y-value
        width = 640,
        height = 500,
        marginTop = 0.066 * height,
        marginRight = 40,
        marginBottom = 10,
        marginLeft = 40,
        gutter = 40,
        widthDamage = 35,
        paddingLeftDamage = 0.1,
        xDomain, // [xmin, xmax]
        xTickFormat,
        xTickValues = [1, 100, 1000, 10000],
        yPaddingInner = 0.4,
        yPaddingOuter = 0.2,
        displayValue = true,
        symlogConstant = 1,
    } = {}
) {
    // SVG
    const svg = create('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height])
        .attr('style', 'max-width: 100%; height: auto; height: intrinsic;');

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

    for (let i = 0; i < data.length; i++) {
        if (data[i].quantile10 > data[i].mean) {
            data[i].quantile10 = data[i].mean - 0.001;
        }
    }

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
    const X = Array.from(data, x);
    const Y = Array.from(data, y);

    // make sure quantiles work
    X.forEach((el, i, arr) => {
        // eslint-disable-next-line prefer-destructuring
        if (el[2] < el[1]) arr[i][2] = el[1] + 10 ** -5;
    });

    // Compute default domains, and unique the y-domain.
    if (xDomain === undefined) xDomain = [0, max(X)];
    let yDomain = new InternSet(Y);

    let yDomain1 = new InternSet(Array.from(data.slice(0, half), y));
    let yDomain2 = new InternSet(Array.from(data.slice(half), y));

    // Omit any data not present in the y-domain.
    const I = range(X.length).filter((i) => yDomain.has(Y[i]));

    // Construct scales and axes.
    const xScale = scaleSymlog(xDomain, xRange);
    xScale.constant(symlogConstant);
    xScale.clamp(true);

    const yScale = scaleBand(yDomain, yRangeFull).paddingInner(yPaddingInner).paddingOuter(0.2);
    const yScale1 = scaleBand(yDomain1, yRange).paddingInner(yPaddingInner).paddingOuter(0.2);
    const yAxis1 = axisLeft(yScale1).tickSizeOuter(0);

    const yScale2 = scaleBand(yDomain2, yRange).paddingInner(yPaddingInner).paddingOuter(0.2);
    const yAxis2 = axisLeft(yScale2).tickSizeOuter(0);

    const xAxis = axisTop(xScale).tickValues(xTickValues).tickFormat(xTickFormat);

    const rightColumnStart = dataWidth + gutter + widthDamage * (1 + paddingLeftDamage);
    const innerPadding = yScale.step() * yPaddingInner;
    const outerPadding = yScale.step() * yPaddingOuter;

    if (displayValue) {
        // PERCENT BACKDROP
        svg.append('rect')
            .attr('x', xScale(xDomain[0]) + dataWidth + widthDamage * paddingLeftDamage)
            .attr('y', yScale(Y[0]) - innerPadding / 2)
            .attr('width', widthDamage)
            .attr('height', dataHeight - outerPadding / 2)
            .style('fill', '#cbcbcb');

        svg.append('rect')
            .attr('x', xScale(xDomain[0]) + 
                        rightColumnStart + dataWidth + widthDamage * paddingLeftDamage)
            .attr('y', yScale(Y[0]) - innerPadding / 2)
            .attr('width', widthDamage)
            .attr('height', dataHeight - yScale.step() - outerPadding / 2)
            .style('fill', '#cbcbcb');

        const iconHeight = height * 0.05;

        // HOUSE SVG
        // LEFT
        const prom1 = fetchSVG(haus).then((icon) => {
            const iconNode = select(icon.documentElement).remove();
            svg.node().appendChild(iconNode.node());
        });

        // RIGHT
        const prom2 = fetchSVG(haus).then((icon) => {
            const iconNode = select(icon.documentElement).remove();
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
                        xScale(xDomain[0]) +
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
                    xScale(xDomain[0]) +
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
                return `${format('.0%')(X[i][3] / 100)}`;
            });
    }
    // DATA MASKING GRADIENTS
    defs.selectAll('foo')
        .data(I)
        .join('linearGradient')
        .attr('id', (i) => `mask-gradient-${unique}-${Y[i]}`)
        .call((gradient) => {
            const range1 = (i) => xScale(X[i][1]) - xScale(X[i][0]);
            const range2 = (i) => xScale(X[i][2]) - xScale(X[i][1]);

            // Q10 @ 0
            gradient
                .append('stop')
                .attr(
                    'offset',
                (i) => 
                    (xScale(X[i][0]) - 
                xScale(xDomain[0])) / (xScale(xDomain[1]) - xScale(xDomain[0])) || 0
                )
                .attr('stop-color', 'white')
                .attr('stop-opacity', '0');
            // Q10 + stop @ x
            gradient
                .append('stop')
                .attr(
                    'offset',
                    (i) =>
                        (xScale(X[i][0]) - xScale(xDomain[0]) + 0.7 * range1(i)) /
                            (xScale(xDomain[1]) - xScale(xDomain[0])) || 0
                )
                .attr('stop-color', 'white')
                .attr('stop-opacity', '0.4');
            // Q10 + stop2 @ 1
            gradient
                .append('stop')
                .attr(
                    'offset',
                    (i) =>
                        (xScale(X[i][0]) - xScale(xDomain[0]) + 0.95 * range1(i)) /
                            (xScale(xDomain[1]) - xScale(xDomain[0])) || 0
                )
                .attr('stop-color', 'white')
                .attr('stop-opacity', '0.85');
            // mean @ 0
            gradient
                .append('stop')
                .attr(
                    'offset',
                    (i) =>
                        (xScale(max([X[i][1], xTickValues[0] + xTickValues[1] * 0.015])) -
                            xScale(xDomain[0])) /
                            (xScale(xDomain[1]) - xScale(xDomain[0])) || 0
                )
                .attr('stop-color', 'white')
                .attr('stop-opacity', '0.98');
            // Q90 + stop2 @ 0
            gradient
                .append('stop')
                .attr(
                    'offset',
                    (i) =>
                        (xScale(X[i][2]) -xScale(xDomain[0]) - 0.95 * range2(i)) /
                            (xScale(xDomain[1]) - xScale(xDomain[0])) || 0
                )
                .attr('stop-color', 'white')
                .attr('stop-opacity', '0.85');
            // Q90 + stop2 @ x
            gradient
                .append('stop')
                .attr(
                    'offset',
                    (i) =>
                        (xScale(X[i][2]) - xScale(xDomain[0]) - 0.7 * range2(i)) /
                            (xScale(xDomain[1]) - xScale(xDomain[0])) || 0
                )
                .attr('stop-color', 'white')
                .attr('stop-opacity', '0.4');
            // Q90 @ 1
            gradient
                .append('stop')
                .attr(
                    'offset',
                    (i) =>
                        (xScale(max([X[i][2], xTickValues[0] + xTickValues[1] * 0.05])) -
                            xScale(xDomain[0])) /
                            (xScale(xDomain[1]) - xScale(xDomain[0])) || 0
                )
                .attr('stop-color', 'white')
                .attr('stop-opacity', '0');
        });

    // BAR BACKDROP
    svg.append('g')
        .selectAll('rect')
        .data(I)
        .join('rect')
        .attr('fill', (i) => (Y[i] === 'CH' ? '#cbcbcb' : '#d3d3d3'))
        .attr('x', (i) => xScale(xDomain[0]) + getHalf(i) * rightColumnStart)
        .attr('y', (i) => yScale(Y[i - getHalf(i) * half]))
        .attr('width', dataWidth)
        .attr('height', yScale.bandwidth());

    // DATA BARS
    defs.append('mask')
        .attr('id', `data-mask-${unique}`)
        .selectAll('foo')
        .data(I)
        .join('rect')
        .attr('x', (i) => xScale(xDomain[0]) + getHalf(i) * rightColumnStart)
        .attr('y', (i) => yScale(Y[i - getHalf(i) * half]))
        .attr('width', dataWidth)
        .attr('height', yScale.bandwidth())
        .attr('fill', (i) => `url(#mask-gradient-${unique}-${Y[i]})`);

    svg.append('rect')
        .attr('x', xScale(xDomain[0]))
        .attr('y', yScale(Y[0]) - outerPadding)
        .attr('width', dataWidth)
        .attr('height', height - yScale(Y[0]) - outerPadding)
        .style('fill', `url(#colorscale-gradient-${unique})`)
        .attr('mask', `url(#data-mask-${unique})`);

    svg.append('rect')
        .attr('x', xScale(xDomain[0]) + rightColumnStart)
        .attr('y', yScale(Y[0]) - outerPadding)
        .attr('width', dataWidth)
        .attr('height', height - yScale(Y[0]) - outerPadding)
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
