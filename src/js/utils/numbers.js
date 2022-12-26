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
    if (number < 1000000) return number;
    if (number < 1000000000) return `${number / 1000000} Mio.`;
    return `${number / 1000000000} Mia.`;
}

export function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}
