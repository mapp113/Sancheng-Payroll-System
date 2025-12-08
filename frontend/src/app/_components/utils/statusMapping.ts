/**
 * Map status code to Vietnamese display text
 * @param status - The status code from API
 * @returns Vietnamese status text
 */
export function mapStatus(status: string): string {
    const statusMap: Record<string, string> = {
        'draft': 'nháp',
        'pending': 'Chờ duyệt',
        'approved': 'Đã duyệt',
        'rejected': 'Từ chối',
        'paid': 'Đã thanh toán',
        'completed': 'Hoàn thành',
    };
    
    return statusMap[status.toLowerCase()] || status;
}
