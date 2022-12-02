export default function round(value, precision) {
    let multiplier = 10 ** (precision || 0);
    let rounded = Math.round(value * multiplier) / multiplier;

    if (Number.isInteger(rounded)) {
        rounded = `${rounded.toString()}.`;
        for (let i = 0; i < precision; i++) {
            rounded = `${rounded}0`;
        }
    }

    return rounded;
}
