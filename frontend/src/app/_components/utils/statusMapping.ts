/**
 * Map status code to Vietnamese display text
 * @param status - The status code from API
 * @returns Vietnamese status text
 */
export function mapStatus(status: string): string {
    const statusMap: Record<string, string> = {
        'draft': 'Nháp',
        'pending': 'Chờ duyệt',
        'approved': 'Đã duyệt',
        'rejected': 'Từ chối',
        'paid': 'Đã thanh toán',
        'completed': 'Hoàn thành',
    };
    
    return statusMap[status.toLowerCase()] || status;
}

/**
 * Remove Vietnamese diacritics and convert to lowercase for comparison
 */
export const normalizeVietnamese = (str: string): string => {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d");
};

/**
 * Convert Vietnamese status text to status code
 * Returns the original string if no match found
 */
export const vietnameseToStatusCode = (text: string): string => {
    const normalizedInput = normalizeVietnamese(text.trim());
    
    const reverseStatusMap: Record<string, string> = {
        'nhap': 'draft',
        'cho duyet': 'pending',
        'da duyet': 'approved',
        'tu choi': 'rejected',
        'da thanh toan': 'paid',
        'hoan thanh': 'completed',
    };
    
    return reverseStatusMap[normalizedInput] || text;
};

/**
 * Convert Vietnamese leave status text to status code
 * Returns the original string if no match found
 */
export const vietnameseToLeaveStatusCode = (text: string): string => {
    const normalizedInput = normalizeVietnamese(text.trim());
    
    const reverseStatusMap: Record<string, string> = {
        'cho duyet': 'PENDING',
        'da duyet': 'APPROVED',
        'tu choi': 'REJECTED',
    };
    
    return reverseStatusMap[normalizedInput] || text;
};
