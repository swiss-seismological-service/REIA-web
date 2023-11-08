import i18next from 'i18next';
import { getLoss } from '../utils/api';

class RIAScale {
    constructor(riskAssessment, sheetType) {
        this.fatalities = document.getElementById('loss-casualties');
        this.displaced = document.getElementById('loss-displaced');
        this.structural = document.getElementById('loss-buildingcosts');
        this.lossGraph = document.getElementById('loss-graph');
        this.damageGraph = document.getElementById('damage-graph');
        this.fatalitiesPromise = null;
        this.displacedPromise = null;
        this.structuralPromise = null;

        riskAssessment.then((info) => {
            if (info.losscalculation) {
                this.addScaleData(info.losscalculation?._oid, sheetType);
                this.addGraphData(
                    info.losscalculation?._oid,
                    info.damagecalculation?._oid,
                    sheetType
                );
            }
        });
    }

    returnPromises = () => [
        this.fatalitiesPromise,
        this.displacedPromise,
        this.structuralPromise,
        this.lossGraph.readyPromise,
        this.damageGraph.readyPromise,
    ];

    addGraphData = (lossId, damageId, sheetType) => {
        if (sheetType === 'CH') {
            this.lossGraph.parentElement.parentElement.style.display = 'block';
            this.damageGraph.parentElement.parentElement.style.display = 'block';
        }
        this.lossGraph.setAttribute('language', i18next.language);
        this.lossGraph.setAttribute('losscalculation', lossId);

        this.damageGraph.setAttribute('language', i18next.language);
        this.damageGraph.setAttribute('damagecalculation', damageId);
    };

    addScaleData(lossId, sheetType) {
        let tag = sheetType === 'CH' ? null : sheetType;
        let sum = sheetType === 'CH';

        this.fatalities.setAttribute('language', i18next.language);
        this.fatalities.setAttribute('losscategory', 'fatalities');
        this.fatalitiesPromise = getLoss(lossId, 'fatalities', 'Canton', tag, sum);
        // this.fatalities.setData(this.fatalitiesPromise);
        this.fatalitiesPromise.then((data) => {
            this.fatalities.setAttribute('data', JSON.stringify(data));
        });

        this.displaced.setAttribute('language', i18next.language);
        this.displaced.setAttribute('losscategory', 'displaced');
        this.displacedPromise = getLoss(lossId, 'displaced', 'Canton', tag, sum);
        this.displaced.setData(this.displacedPromise);

        this.structural.setAttribute('language', i18next.language);
        this.structural.setAttribute('losscategory', 'structural');
        this.structuralPromise = getLoss(lossId, 'structural', 'Canton', tag, sum);
        this.structural.setData(this.structuralPromise);
    }
}
export default RIAScale;
