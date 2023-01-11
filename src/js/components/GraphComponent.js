import * as d3 from 'd3';
import { getCantonalInjuries, getCantonalStructuralDamage } from '../utils/api';
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
            const thegraph = CantonalGraph(data, 1, {
                marginLeft: 30,
                marginRight: 20,
                widthDamage: 0,
                gutter: 60,
                x: (d) => [d.quantile10, d.mean, d.quantile90],
                y: (d) => d.tag,
                xType: d3.scaleSymlog,
                xScaleClamp: true,
                symlogConstant: 1,
                xTickFormat: (d) =>
                    d === 1
                        ? 'keine'
                        : d3.formatLocale({ thousands: "'", grouping: [3] }).format(',.0f')(d),
                xDomain: [1, 50000],
                xTickValues: [1, 5, 50, 500, 5000],
                width: 600,
                height: 350,
                displayValue: false,
            });
            injuredGraphElement.append(thegraph);
        });

        this.damagesElement.style.display = 'block';
        let damagesGraphElement = this.damagesElement.querySelector('div:last-of-type');
        this.damagesPromise = getCantonalStructuralDamage(damage._oid).then((data) => {
            const thegraph2 = CantonalGraph(data, 2, {
                marginLeft: 30,
                marginRight: 20,
                gutter: 40,
                x: (d) => [d.quantile10, d.mean, d.quantile90, d.percentage],
                y: (d) => d.tag,
                xType: d3.scaleSymlog,
                symlogConstant: 1,
                xScaleClamp: true,
                xTickFormat: (d) =>
                    d === 1
                        ? 'keine'
                        : d3.formatLocale({ thousands: "'", grouping: [3] }).format(',.0f')(d),
                xDomain: [1, 500000],
                xTickValues: [1, 50, 500, 5000, 50000],
                width: 600,
                height: 350,
                displayValue: true,
            });
            damagesGraphElement.append(thegraph2);
        });
    }
}

export default RIAGraphs;
