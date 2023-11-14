import i18next from 'i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { importFolder } from '../utils/utilities';

const translations = importFolder(require.context('../../data/lang', false, /.json$/));

export async function initI18next() {
    await i18next
        .use(HttpApi)
        .use(LanguageDetector)
        .init({
            supportedLngs: ['en', 'de', 'fr', 'it'],
            fallbackLng: 'de',
            ns: ['report', 'explanation'],
            backend: {
                loadPath: (lng, ns) => translations[`${lng}-${ns}.json`],
            },
            detection: {
                caches: ['localStorage', 'cookie'],
            },
        });
    i18next.services?.formatter.add('preposition_title', (value, lng) => {
        if (lng === 'fr') {
            let vocals = ['a', 'e', 'i', 'y', 'o', 'u'];
            if (
                vocals.includes(value[0].toLowerCase()) ||
                (value[0].toLowerCase() === 'h' && vocals.includes(value[1].toLowerCase()))
            ) {
                return `d'${value}`;
            }
            return `de ${value}`;
        }
        if (lng === 'it') {
            let vocals = ['a', 'e', 'i', 'y', 'o', 'u'];
            if (vocals.includes(value[0].toLowerCase())) {
                return `ad ${value}`;
            }
            return `a ${value}`;
        }
        return value;
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
