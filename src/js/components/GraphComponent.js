import * as d3 from 'd3';
import i18next from 'i18next';
import { getCantonalInjuries, getCantonalStructuralDamage } from '../utils/api';
import CantonalGraph from '../utils/CantonalGraph';

class RIAGraphs {
    constructor(riskAssessment, sheetType) {
        this.injuredElement = document.getElementById('graph-injured');
        this.damagesElement = document.getElementById('graph-damages');

        this.injuredPromise = null;
        this.damagesPromise = null;
        if (sheetType === 'CH') {
            riskAssessment.then((info) => this.insertGraphs(info));
        }
    }

    returnPromises = () => [this.injuredPromise, this.damagesPromise];

    insertGraphs(info) {
        // let damage = getLatestCalculation(info, 'damage');
        let damage = info.damagecalculation;
        // let loss = getLatestCalculation(info, 'loss');
        let loss = info.losscalculation;

        this.injuredElement.style.display = 'block';
        let injuredGraphElement = this.injuredElement.querySelector('div:last-of-type');
        this.injuredPromise = getCantonalInjuries(loss._oid).then((data) => {
            console.log(data);
            const thegraph = CantonalGraph(data, 1, {
                marginLeft: 30,
                marginRight: 20,
                widthDamage: 0,
                gutter: 60,
                x: (d) => [d.loss_pc10, d.loss_mean, d.loss_pc90],
                y: (d) => d.tag,
                xType: d3.scaleSymlog,
                xScaleClamp: true,
                symlogConstant: 0.1,
                xTickFormat: (d) =>
                    d === 0.5
                        ? i18next.t('report:keine')
                        : d3.formatLocale({ thousands: "'", grouping: [3] }).format(',.0f')(d),
                xDomain: [0.5, 50000],
                xTickValues: [0.5, 5, 50, 500, 5000],
                width: 600,
                height: 375,
                displayValue: false,
            });
            injuredGraphElement.append(thegraph);
        });

        this.damagesElement.style.display = 'block';
        let damagesGraphElement = this.damagesElement.querySelector('div:last-of-type');
        this.damagesPromise = getCantonalStructuralDamage(damage._oid).then((data) => {
            console.log(data);
            const thegraph2 = CantonalGraph(data, 2, {
                marginLeft: 30,
                marginRight: 20,
                gutter: 40,
                x: (d) => [d.damage_pc10, d.damage_mean, d.damage_pc90, d.damage_percentage],
                y: (d) => d.tag[0],
                xType: d3.scaleSymlog,
                symlogConstant: 5.5,
                xScaleClamp: true,
                xTickFormat: (d) =>
                    d === 1
                        ? i18next.t('report:keine')
                        : d3.formatLocale({ thousands: "'", grouping: [3] }).format(',.0f')(d),
                xDomain: [1, 500000],
                xTickValues: [1, 50, 500, 5000, 50000],
                width: 600,
                height: 375,
                displayValue: true,
            });
            damagesGraphElement.append(thegraph2);
        });
    }
}

export default RIAGraphs;
