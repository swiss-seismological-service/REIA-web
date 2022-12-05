import { getEarthquake } from './utils/api';
import LossComponent from './webcomponents/LossComponent';
import OverviewComponent from './webcomponents/OverviewComponent';
import RIMaps from './components/MapComponent';
import RIAInfo from './components/InfoComponent';
import RIAScale from './components/ScaleComponent';
import RIAMaps from './components/MapComponent';

if (window.location.pathname !== '/overview.html') {
    const params = new URLSearchParams(window.location.search);
    const originid = params.get('originid');
    const canton = params.get('canton');

    if (!originid) {
        window.location.replace('/overview.html');
    }

    const earthquakeInfo = getEarthquake(originid);

    const info = new RIAInfo(earthquakeInfo, canton || 'CH');
    const scales = new RIAScale(earthquakeInfo, canton || 'CH');
    const maps = new RIAMaps(earthquakeInfo, canton || 'CH');

    earthquakeInfo.then(() => {
        let promises = scales.returnPromises().concat(maps.returnPromises());
        Promise.all(promises).then(() => {
            window.status = 'ready_to_print';
        });
    });
}
