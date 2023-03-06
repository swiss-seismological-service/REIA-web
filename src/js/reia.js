import { getRiskAssessment } from './utils/api';
import { initI18next, translatePageElements } from './components/i18nComponent';
import LossComponent from './webcomponents/LossComponent'; // eslint-disable-line
import RIAGraphs from './components/GraphComponent';
import RIAInfo from './components/InfoComponent';
import RIAScale from './components/ScaleComponent';
import RIAMaps from './components/MapComponent';

(async function () { // eslint-disable-line
    // Init
    await initI18next();

    const params = new URLSearchParams(window.location.search);
    const oid = params.get('oid');
    const canton = params.get('canton');

    if (!oid) {
        window.location.replace('/overview.html');
    }

    const riskAssessment = getRiskAssessment(oid);

    const info = new RIAInfo(riskAssessment, canton || 'CH'); // eslint-disable-line
    const scales = new RIAScale(riskAssessment, canton || 'CH');
    const maps = new RIAMaps(riskAssessment, canton || 'CH');

    const graphs = new RIAGraphs(riskAssessment, canton || 'CH');

    riskAssessment.then(() => {
        let promises = scales
            .returnPromises()
            .concat(maps.returnPromises(), graphs.returnPromises());

        Promise.all(promises).then(() => {
            window.status = 'ready_to_print';
            console.log('ready_to_print'); // eslint-disable-line
        });
    });

    translatePageElements();
})();
