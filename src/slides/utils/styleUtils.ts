import {ElementPositioning} from "../models";

export const parseCssValue = (value: string | undefined | number): { numeric: number; unit: string } | null => {
    if (value === undefined || value === null || value === 'auto' || value === 'inherit' || typeof value === 'number') {
        if (typeof value === 'number') return { numeric: value, unit: 'px' };
        return null;
    }

    const match = String(value).match(/^(-?[\d.]+)([a-zA-Z%]*)$/);
    if (match) {
        return { numeric: parseFloat(match[1]), unit: match[2] || 'px' };
    }
    return null;
};


export const scaleCssValue = (value: string | undefined | number, scaleFactor: number): string | undefined | number => {
    if (value === undefined || value === null || typeof value === 'number' && isNaN(value)) return undefined;
    if (value === 'auto' || value === 'inherit' || value === '0') return value;

    const parsed = parseCssValue(value);

    if (parsed) {
        if (parsed.unit === 'px') {
            const scaledValue = parseFloat((parsed.numeric * scaleFactor).toFixed(3));
            return `${scaledValue}px`;
        }
        return String(value);
    }
    return String(value);
};

export const scalePositioning = (positioning: ElementPositioning | undefined, scaleFactor: number): ElementPositioning | undefined => {
    if (!positioning) return undefined;

    const scaled: ElementPositioning = { ...positioning }; // Shallow copy

    if (scaled.top) scaled.top = scaleCssValue(scaled.top, scaleFactor) as string;
    if (scaled.left) scaled.left = scaleCssValue(scaled.left, scaleFactor) as string;
    if (scaled.right) scaled.right = scaleCssValue(scaled.right, scaleFactor) as string;
    if (scaled.bottom) scaled.bottom = scaleCssValue(scaled.bottom, scaleFactor) as string;
    if (scaled.width) scaled.width = scaleCssValue(scaled.width, scaleFactor) as string;
    if (scaled.height) scaled.height = scaleCssValue(scaled.height, scaleFactor) as string;
    // zIndex is not scaled

    return scaled;
};