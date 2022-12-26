import { clamp } from './numbers';

export function ColorScale(canvasElement = null, width = null, height = null) {
    if (!canvasElement) {
        canvasElement = document.createElement('CANVAS');
        canvasElement.width = width;
        canvasElement.height = height;
    } else {
        width = canvasElement.width;
        height = canvasElement.height;
    }

    let context = canvasElement.getContext('2d', { willReadFrequently: true });
    context.clearRect(0, 0, width, height);
    const gradient = context.createLinearGradient(0, 0, width, 0);

    gradient.addColorStop(0.1, 'rgba(204, 255, 102, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 0, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 153, 0, 1)');
    gradient.addColorStop(0.7, 'rgba(255, 0, 0, 1)');
    gradient.addColorStop(0.9, 'rgba(128, 0, 0, 1)');
    gradient.addColorStop(1, 'rgba(128, 0, 0, 1)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    return context;
}

export function ColorScaleMarker(start, center, end, canvasElement) {
    let { width, height } = canvasElement;

    let context = canvasElement.getContext('2d');
    context.clearRect(0, 0, width, height);
    const gradient = context.createLinearGradient(0, 0, width, 0);

    if (start >= 0.01) {
        gradient.addColorStop(Math.min(start, 0.9), 'rgba(211, 211, 211, 1)');
    }
    gradient.addColorStop(center, 'rgba(211, 211, 211, 0)');
    if (end <= 0.99) {
        gradient.addColorStop(Math.max(end, 0.1), 'rgba(211, 211, 211, 1)');
    }
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    return context;
}

export function getPercentage(value, thresholds) {
    let index = thresholds.findIndex((el) => el > value);
    if (index < 0) return 1;
    let [smaller, bigger] = thresholds.slice(index - 1, index + 1);
    let minLog = Math.log10(Math.max(smaller, 1));
    let maxLog = Math.log10(bigger);
    return (
        ((Math.log10(clamp(value, 1, bigger)) - minLog) / (maxLog - minLog)) * 0.2 +
        (index - 1) * 0.2
    );
}
