/**
 * Định dạng số thành chuỗi với dấu ngăn cách hàng nghìn bằng dấu chấm
 * Ví dụ: 1000000 -> "1.000.000"
 * @param value - Giá trị số hoặc chuỗi cần định dạng
 * @returns Chuỗi đã được định dạng với dấu chấm
 */
export function formatSalary(value: string | number): string {
    if (value === "" || value === null || value === undefined) {
        return "";
    }

    // Chuyển đổi sang chuỗi và loại bỏ tất cả ký tự không phải số
    const numericValue = value.toString().replace(/[^\d]/g, "");

    if (numericValue === "") {
        return "";
    }

    // Thêm dấu chấm ngăn cách hàng nghìn
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Chuyển đổi chuỗi đã định dạng về số thuần
 * Ví dụ: "1.000.000" -> "1000000"
 * @param formattedValue - Chuỗi đã định dạng với dấu chấm
 * @returns Chuỗi số thuần không có dấu ngăn cách
 */
export function parseSalary(formattedValue: string): string {
    if (!formattedValue) {
        return "";
    }

    // Loại bỏ tất cả dấu chấm và các ký tự không phải số
    return formattedValue.replace(/\./g, "").replace(/[^\d]/g, "");
}

/**
 * Xử lý sự kiện thay đổi input cho trường lương
 * Tự động định dạng giá trị khi người dùng nhập
 * @param value - Giá trị từ input
 * @returns Giá trị đã được định dạng
 */
export function handleSalaryInput(value: string): string {
    // Loại bỏ tất cả ký tự không phải số
    const numericOnly = value.replace(/[^\d]/g, "");
    
    // Định dạng lại với dấu chấm
    return formatSalary(numericOnly);
}
