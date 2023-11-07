import { formatLocale } from 'd3-format';

export function round(value, precision) {
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

export function numberToString(number) {
    let formatter = formatLocale({ thousands: "'", grouping: [3] }).format(',.0f');
    if (number < 1000000) return formatter(number);
    if (number < 1000000000) return `${number / 1000000} Mio.`;
    return `${number / 1000000000} Mia.`;
}

export function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

export function parseUTCDate(dateString) {
    // try to parse as UTC
    let zdate = `${dateString}Z`;
    let ts = Date.parse(zdate);
    if (Number.isNaN(ts)) {
        ts = Date.parse(dateString);
    }
    let date = new Date(ts);
    return date;
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
