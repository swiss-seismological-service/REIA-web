import OverviewComponent from './webcomponents/CalculationsComponent'; // eslint-disable-line
import { initI18next, translatePageElements, bindLocaleSwitcher } from './components/i18nComponent';

// Init
(async function () { // eslint-disable-line
    await initI18next();
    const switcher = document.querySelector('[data-i18n-switcher]');
    const overview = document.querySelector('overview-component');

    if (switcher)
        bindLocaleSwitcher(switcher, (l) => {
            overview.setAttribute('lang', l);
        });

    translatePageElements();
})();
