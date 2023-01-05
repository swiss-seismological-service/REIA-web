import i18next from 'i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

export async function initI18next() {
    await i18next
        .use(HttpApi)
        .use(LanguageDetector)
        .init({
            //   lng: "de",
            supportedLngs: ['en', 'de', 'fr', 'it'],
            fallbackLng: 'de',
            // debug: true,
            ns: ['report', 'explanation'],
            backend: {
                loadPath: '/lang/{{lng}}-{{ns}}.json',
            },
            detection: {
                caches: ['localStorage', 'cookie'],
            },
        });
}

export function translatePageElements() {
    const translatableElements = document.querySelectorAll('[data-i18n-key]');
    translatableElements.forEach((el) => {
        const key = el.getAttribute('data-i18n-key');
        el.innerHTML = i18next.t(key);
    });
}
export function bindLocaleSwitcher(switcher, update) {
    const initialValue = i18next.resolvedLanguage;
    switcher.value = initialValue;
    update(initialValue);
    switcher.onchange = (e) => {
        i18next.changeLanguage(e.target.value).then(translatePageElements);
        update(e.target.value);
    };
}
