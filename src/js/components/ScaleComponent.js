import i18next from 'i18next';
import { getLoss } from '../utils/api';

class RIAScale {
    constructor(riskAssessment, sheetType) {
        this.casualties = document.getElementById('loss-casualties');
        this.displaced = document.getElementById('loss-displaced');
        this.buildingCosts = document.getElementById('loss-buildingcosts');

        this.casualtiesPromise = null;
        this.displacedPromise = null;
        this.buildingsPromise = null;

        riskAssessment.then((info) => {
            let loss = info.losscalculation;
            this.addScaleData(loss._oid, sheetType);
        });
    }

    returnPromises = () => [this.casualtiesPromise, this.displacedPromise, this.buildingsPromise];

    addScaleData(lossId, sheetType) {
        let tag = sheetType === 'CH' ? null : sheetType;
        let sum = sheetType === 'CH';

        this.casualtiesPromise = getLoss(lossId, 'fatalities', 'Canton', tag, sum).then((data) => {
            [data] = data;
            this.casualties.setAttribute('mean', data.loss_mean);
            this.casualties.setAttribute('q10', data.loss_pc10);
            this.casualties.setAttribute('q90', data.loss_pc90);
            this.casualties.setAttribute('none', i18next.t('report:keine_f'));
        });
        this.displacedPromise = getLoss(lossId, 'displaced', 'Canton', tag, sum).then((data) => {
            [data] = data;
            this.displaced.setAttribute('mean', data.loss_mean);
            this.displaced.setAttribute('q10', data.loss_pc10);
            this.displaced.setAttribute('q90', data.loss_pc90);
            this.displaced.setAttribute('none', i18next.t('report:keine_f'));
        });
        this.buildingsPromise = getLoss(lossId, 'structural', 'Canton', tag, sum).then((data) => {
            [data] = data;
            this.buildingCosts.setAttribute('mean', data.loss_mean);
            this.buildingCosts.setAttribute('q10', data.loss_pc10);
            this.buildingCosts.setAttribute('q90', data.loss_pc90);
            this.buildingCosts.setAttribute('none', i18next.t('report:keine'));
        });
    }
}
export default RIAScale;
