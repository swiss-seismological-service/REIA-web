import { getEarthquake } from './utils/api';
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
    const originid = params.get('originid');
    const canton = params.get('canton');

    if (!originid) {
        window.location.replace('/overview.html');
    }

    const earthquakeInfo = getEarthquake(originid);

    const info = new RIAInfo(earthquakeInfo, canton || 'CH'); // eslint-disable-line
    const scales = new RIAScale(earthquakeInfo, canton || 'CH');
    const maps = new RIAMaps(earthquakeInfo, canton || 'CH');

    const graphs = new RIAGraphs(earthquakeInfo, canton || 'CH');

    earthquakeInfo.then(() => {
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
