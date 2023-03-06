import i18next from 'i18next';
import { getBuildingCosts, getCasualties, getDisplaced } from '../utils/api';

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
        this.casualtiesPromise = getCasualties(lossId, sheetType).then((data) => {
            if (sheetType !== 'CH') [data] = data;
            this.casualties.setAttribute('mean', data.mean);
            this.casualties.setAttribute('q10', data.quantile10);
            this.casualties.setAttribute('q90', data.quantile90);
            this.casualties.setAttribute('none', i18next.t('report:keine_f'));
        });
        this.displacedPromise = getDisplaced(lossId, sheetType).then((data) => {
            if (sheetType !== 'CH') [data] = data;
            this.displaced.setAttribute('mean', data.mean);
            this.displaced.setAttribute('q10', data.quantile10);
            this.displaced.setAttribute('q90', data.quantile90);
            this.displaced.setAttribute('none', i18next.t('report:keine_f'));
        });
        this.buildingsPromise = getBuildingCosts(lossId, sheetType).then((data) => {
            if (sheetType !== 'CH') [data] = data;
            this.buildingCosts.setAttribute('mean', data.mean);
            this.buildingCosts.setAttribute('q10', data.quantile10);
            this.buildingCosts.setAttribute('q90', data.quantile90);
            this.buildingCosts.setAttribute('none', i18next.t('report:keine'));
        });
    }
}
export default RIAScale;
