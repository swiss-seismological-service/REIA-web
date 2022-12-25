import * as d3 from 'd3';
import loadImage from '../utils/images';
import { getCantonalInjuries } from '../utils/api';
import getLatestCalculation from '../utils/data';
import CantonalGraph from '../utils/CantonalGraph';

class RIAGraphs {
    constructor(earthquakeInfo, sheetType) {
        this.injuredElement = document.getElementById('graph-injured');
        this.damagesElement = document.getElementById('graph-damages');

        this.injuredPromise = null;
        this.damagesPromise = null;
        if (sheetType === 'CH') {
            earthquakeInfo.then((info) => this.insertGraphs(info));
        }
    }

    returnPromises = () => [this.injuredPromise, this.damagesPromise];

    insertGraphs(info) {
        let damage = getLatestCalculation(info, 'damage');
        let loss = getLatestCalculation(info, 'loss');

        this.injuredElement.style.display = 'block';
        let injuredGraphElement = this.injuredElement.querySelector('div:last-of-type');
        this.injuredPromise = getCantonalInjuries(loss._oid).then((data) => {
            const thegraph = CantonalGraph(data, {
                marginLeft: 30,
                marginRight: 20,
                widthDamage: 0,
                gutter: 60,
                x: (d) => [d.quantile10, d.mean, d.quantile90, d.percentage],
                y: (d) => d.tag,
                xType: d3.scaleLog,
                xTickFormat: (d) =>
                    d === 1
                        ? '0'
                        : d3.formatLocale({ thousands: "'", grouping: [3] }).format(',.0f')(d),
                xDomain: [1, 50000],
                xTickValues: [0, 5, 50, 500, 5000],
                width: 600,
                height: 350,
                displayValue: false,
            });
            injuredGraphElement.append(thegraph);
        });

        this.damagesElement.style.display = 'block';
        let damagesGraphElement = this.damagesElement.getElementsByTagName('img')[0];
        this.damagesPromise = loadImage('images/graph_schaden.png', damagesGraphElement);
    }
}

export default RIAGraphs;
