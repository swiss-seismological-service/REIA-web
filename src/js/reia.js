import i18next from 'i18next';
import { getRiskAssessment } from './utils/api';
import { initI18next, translatePageElements } from './components/i18nComponent';

import lossScale from './webcomponents/LossScale'; // eslint-disable-line
import LossGraph from './webcomponents/LossGraph'; // eslint-disable-line
import DamageGraph from './webcomponents/DamageGraph'; // eslint-disable-line
import InfoTable from './webcomponents/InfoTable'; // eslint-disable-line

import DataComponent from './components/DataComponent';

(async function () { // eslint-disable-line
    await initI18next();

    const params = new URLSearchParams(window.location.search);
    const oid = params.get('oid');
    const canton = params.get('canton');

    const riskAssessment = getRiskAssessment(oid);

    const dataComponent = new DataComponent(riskAssessment, canton || 'CH');

    riskAssessment.then(() => {
        let promises = dataComponent.returnPromises();

        Promise.all(promises).then(() => {
            window.status = 'ready_to_print';
            console.log('ready_to_print'); // eslint-disable-line
        });
    });

    // dynamically set language specific images
    let footerLogo = document.getElementById('logo_bafu_babs');
    footerLogo.src = `images/logos/logo_${i18next.resolvedLanguage}.svg`;

    let shakemapLegend = document.getElementById('legende-shakemap');
    shakemapLegend.src = `images/legende_shakemap_${i18next.resolvedLanguage}.svg`;

    translatePageElements();
})();
