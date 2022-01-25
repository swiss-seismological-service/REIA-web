import Highcharts from 'highcharts';

export default class Graph {
    constructor(results) {
        this.data = {
            title: {
                text: null,
            },
            chart: {
                type: 'bar',
            },
            legend: {
                enabled: false,
            },
            xAxis: {
                categories: null,
                title: {
                    text: null,
                },
            },
            yAxis: {
                type: 'logarithmic',
                title: {
                    text: null,
                    align: 'high',
                },
                labels: {
                    overflow: 'justify',
                },
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: false,
                    },
                },
            },
            credits: {
                enabled: false,
            },
            series: [
                {
                    data: null,
                },
            ],
        };

        this.plot();

        results.then((d) => {
            let x = [];
            let y = [];

            d.cantonal_losses.forEach((loss) => {
                y.push(loss.canton);
                x.push(loss.loss_value);
            });

            this.data.xAxis.categories = y;
            this.data.series[0].data = x;
            this.plot();
        });
    }

    plot = () => {
        const el = document.getElementById('graph_verletzte');
        if (this.data.xAxis.categories) {
            const chart = Highcharts.chart('graph_verletzte', this.data);
            window.addEventListener('beforeprint', () => {
                chart.reflow();
            });
            el.nextSibling.remove();
        } else {
            const chld = `<h2>Loading...</h2>`;
            el.insertAdjacentHTML('afterend', chld);
        }
    };
}
