import { getBuildingCosts, getCasualties, getDisplaced } from '../utils/api';

class RIAScale {
    constructor(earthquakeInfo, sheetType) {
        this.casualties = document.getElementById('loss-casualties');
        this.displaced = document.getElementById('loss-displaced');
        this.buildingCosts = document.getElementById('loss-buildingcosts');
        earthquakeInfo.then((info) => {
            let lossId = info.calculation.find((calc) => calc._type === 'losscalculation');
            this.addScaleData(lossId._oid, sheetType);
        });
    }

    addScaleData(lossId, sheetType) {
        getCasualties(lossId, sheetType).then((data) => {
            this.casualties.setAttribute('mean', data.mean);
            this.casualties.setAttribute('q10', data.quantile10);
            this.casualties.setAttribute('q90', data.quantile90);
        });
        getDisplaced(lossId, sheetType).then((data) => {
            this.displaced.setAttribute('mean', data.mean);
            this.displaced.setAttribute('q10', data.quantile10);
            this.displaced.setAttribute('q90', data.quantile90);
        });
        getBuildingCosts(lossId, sheetType).then((data) => {
            this.buildingCosts.setAttribute('mean', data.mean);
            this.buildingCosts.setAttribute('q10', data.quantile10);
            this.buildingCosts.setAttribute('q90', data.quantile90);
        });
    }
}
export default RIAScale;
