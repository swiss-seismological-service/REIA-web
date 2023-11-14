import OverviewComponent from './components/OverviewComponent';
import { initI18next, translatePageElements, bindLocaleSwitcher } from './components/i18nComponent';

// Init
// eslint-disable-next-line
(async function () {
    await initI18next();
    const switcher = document.querySelector('[data-i18n-switcher]');
    const overviewContainer = document.querySelector('#overview');
    const paginationContainer = document.querySelector('#pagination');

    const overview = new OverviewComponent(overviewContainer, paginationContainer);

    if (switcher)
        bindLocaleSwitcher(switcher, (l) => {
            overview.lang = l;
        });

    translatePageElements();
})();
