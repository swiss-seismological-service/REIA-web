import { getRiskAssessment } from './utils/api';

import { initI18next, translatePageElements } from './components/i18nComponent';

import lossScale from './webcomponents/LossScale'; // eslint-disable-line
import LossGraph from './webcomponents/LossGraph'; // eslint-disable-line
import DamageGraph from './webcomponents/DamageGraph'; // eslint-disable-line

import RIAInfo from './components/InfoComponent';
import RIAScale from './components/ScaleComponent';
import RIAMaps from './components/MapComponent';

(async function () { // eslint-disable-line
    await initI18next();

    const params = new URLSearchParams(window.location.search);
    const oid = params.get('oid');
    const canton = params.get('canton');

    const riskAssessment = getRiskAssessment(oid);

    const info = new RIAInfo(riskAssessment, canton || 'CH'); // eslint-disable-line
    const scales = new RIAScale(riskAssessment, canton || 'CH');
    const maps = new RIAMaps(riskAssessment, canton || 'CH');

    riskAssessment.then(() => {
        let promises = scales.returnPromises().concat(maps.returnPromises());

        Promise.all(promises).then(() => {
            window.status = 'ready_to_print';
            console.log('ready_to_print'); // eslint-disable-line
        });
    });
    translatePageElements();
})();
