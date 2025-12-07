/**
 * Format number with thousand separators (dots)
 * @param value - The number to format
 * @returns Formatted string with dots as thousand separators (e.g., 1.000.000)
 */
export function formatNumber(value: number | string): string {
    if (value === null || value === undefined) return "0";
    
    const num = typeof value === "string" ? parseFloat(value) : value;
    
    if (isNaN(num)) return "0";
    
    // Convert to string and split by decimal point
    const parts = num.toString().split(".");
    
    // Add dots as thousand separators to integer part
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    // Join back with comma as decimal separator (optional)
    return parts.join(",");
}
