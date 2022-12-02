export default function round(value, precision) {
    let multiplier = 10 ** (precision || 0);
    return Math.round(value * multiplier) / multiplier;
}
