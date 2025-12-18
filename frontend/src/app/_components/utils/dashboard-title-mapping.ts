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

export function getUserMode(): string {
    // Lấy mode từ localStorage, nếu không có thì dựa vào role trong sessionStorage
    const savedMode = localStorage.getItem("scpm.user.mode");
    if (savedMode) {
        return savedMode;
    }
    
    // Fallback: xác định dựa vào role trong sessionStorage
    try {
        const userStr = window.sessionStorage.getItem("scpm.auth.user");
        if (userStr) {
            const parsed = JSON.parse(userStr);
            return parsed?.role || "EMPLOYEE";
        }
    } catch (error) {
        console.error("Error getting role from session:", error);
    }
    
    return "EMPLOYEE";
}

export function getDashboardTitle(): string {
    const mode = getUserMode();
    return getDashboardTitleByRole(mode);
}
