import { formatLocale } from 'd3-format';

export async function loadImage(url, elem) {
    // Programmatically load an image from a URL, return a promise,
    // and set the src attribute of an element

    return new Promise((resolve, reject) => {
        elem.onload = () => resolve(elem);
        elem.onerror = reject;
        elem.src = url;
    });
}

export function round(value, precision) {
    // Round a number to a given precision
    if (typeof value !== 'number') return null;

    let multiplier = 10 ** (precision || 0);
    let rounded = Math.round(value * multiplier) / multiplier;

    if (Number.isInteger(rounded) && precision > 0) {
        rounded = `${rounded.toString()}.`;
        for (let i = 0; i < precision; i++) {
            rounded = `${rounded}0`;
        }
    }
    return rounded;
}

export function thousandsFormatter(number) {
    if (number === null || number === undefined) return null;
    let formatter = formatLocale({ thousands: "'", grouping: [3] }).format(',.0f');
    return formatter(number);
}

export function numberToString(number, language = 'de') {
    const numberTranslations = {
        fr: {
            million: 'M',
            billion: 'Md',
        },
        it: {
            million: 'Mln',
            billion: 'Mrd',
        },
        de: {
            million: 'Mio.',
            billion: 'Mrd.',
        },
        en: {
            million: 'M',
            billion: 'B',
        },
    };

    // Convert a number to a string with thousands separators
    if (number < 1000000) return thousandsFormatter(number);
    if (number < 1000000000) return `${number / 1000000} ${numberTranslations[language].million}`;
    return `${number / 1000000000} ${numberTranslations[language].billion}`;
}

export function clamp(num, min, max) {
    // Clamp a number between a minimum and a maximum value

    return Math.min(Math.max(num, min), max);
}

export function parseDate(dateString, targetTimeZone = 'CET') {
    // Parse a date string and set timezone
    // depending on targetTimeZone.
    // If there is no timezone information in the dateString,
    // assume UTC

    if (typeof dateString !== 'string') return null;

    let zdate = `${dateString}Z`;
    let ts = Date.parse(zdate);
    if (Number.isNaN(ts)) {
        ts = Date.parse(dateString);
    }

    let date = new Date(ts);
    let supportedTimeZone = Intl.supportedValuesOf('timeZone').includes(targetTimeZone);

    let timeZoneDate = supportedTimeZone
        ? new Date(date.toLocaleString('en-US', { targetTimeZone }))
        : new Date(date.toLocaleString('en-US', { timeZone: 'CET' }));
    return timeZoneDate;
}

export function formatDate(date) {
    return `${String(date.getDate()).padStart(2, 0)}.${String(date.getMonth() + 1).padStart(
        2,
        0
    )}.${date.getFullYear()}`;
}

export function formatTime(date) {
    return `${String(date.getHours()).padStart(2, 0)}:${String(date.getMinutes()).padStart(2, 0)}`;
}

export async function injectSVG(path, element) {
    // Inject an SVG file into an element
    return new Promise((resolve) => {
        if (!element) resolve();
        else {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', path);
            xhr.overrideMimeType('image/svg+xml');
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    element.replaceWith(xhr.responseXML.documentElement);
                    resolve(xhr.responseXML.documentElement);
                } else if (xhr.readyState === 4 && xhr.status !== 200) {
                    console.error(`Could not load ${path}`); // eslint-disable-line
                    resolve();
                }
            };
            xhr.send();
        }
    });
}

export function b64encode(str) {
    // Encode a string as base64
    return window.btoa(decodeURIComponent(encodeURIComponent(str)));
}

export function b64decode(str) {
    // Decode a base64 string
    return decodeURIComponent(encodeURIComponent(window.atob(str)));
}

export function importFolder(r) {
    return Object.fromEntries(r.keys().map((x) => [x.replace('./', ''), r(x)]));
}
