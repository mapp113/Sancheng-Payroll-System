export function formatDecimal(value: number, fractionDigits = 2) {
    return value.toFixed(fractionDigits);
}

export function formatTime(value?: number | string | null) {
    if (value === null || typeof value === "undefined") {
        return "--";
    }

    if (typeof value === "string") {
        return value;
    }

    return formatDecimal(value);
}

export function formatHours(value?: number | null, {fallback = "N/A"} = {}) {
    if (value === null || typeof value === "undefined") {
        return fallback;
    }

    return `${formatDecimal(value)}hrs`;
}
