export function getDashboardTitleByRole(role: string): string {
    const ROLE_TITLES: Record<string, string> = {
        ADMIN: "Admin Dashboard",
        HR: "HR Dashboard",
        MANAGER: "Manager Dashboard",
        ACCOUNTANT: "Accountant Dashboard",
        EMPLOYEE: "Employee Dashboard",
    };
    
    return ROLE_TITLES[role] || "Dashboard";
}

export function getDashboardTitle(): string {
    // Lấy từ localStorage, nếu không có thì dựa vào role
    const savedTitle = localStorage.getItem("scpm.dashboard.title");
    if (savedTitle) {
        return savedTitle;
    }
    
    // Fallback: xác định dựa vào role trong sessionStorage
    try {
        const userStr = window.sessionStorage.getItem("scpm.auth.user");
        if (userStr) {
            const parsed = JSON.parse(userStr);
            const role = parsed?.role;
            return getDashboardTitleByRole(role);
        }
    } catch (error) {
        console.error("Error getting role from session:", error);
    }
    
    return "Dashboard";
}
