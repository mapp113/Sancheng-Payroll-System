import {jwtDecode} from "jwt-decode"

export type LoginPayload = {
    username: string
    password: string
}

export type AuthenticatedUser = {
    fullName: string
    role: string
    token: string
}

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

type LoginSuccessResponse = {
    message?: string
    token: string
}

type LoginErrorResponse = {
    message?: string
}
type JwtPayload = {
    full_name?: string
    name?: string
    role_name?: string
}
// ánh xạ role → đường dẫn
const ROLE_REDIRECTS: Record<string, string> = {
    ADMIN: "/admin",
    HR: "/payroll",
    MANAGER: "/payroll",
    ACCOUNTANT: "/home",
    EMPLOYEE: "/employees",
}

export async function login(payload: LoginPayload): Promise<AuthenticatedUser> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
    })


    // ❌ Nếu lỗi
    if (!response.ok) {
        let message =
            "Đăng nhập thất bại. Vui lòng kiểm tra thông tin và thử lại."
        try {
            const data = (await response.json()) as LoginErrorResponse
            if (data?.message?.trim()) message = data.message

        } catch {
        }

        throw new Error(message)
    }

    // ✅ Nếu thành công
    const data = (await response.json()) as LoginSuccessResponse
    localStorage.setItem("access_token", data.token);

    //  const decoded: any = jwtDecode(data.token)
    const decoded = jwtDecode<JwtPayload>(data.token)

    const fullName = decoded.full_name ?? decoded.name ?? ""
    const role = decoded.role_name?.toUpperCase?.() ?? "EMPLOYEE"

    return {
        fullName,
        role,
        token: data.token,
    }
}

// 🔁 Lấy đường dẫn redirect theo role
export function resolveRedirectPath(user: AuthenticatedUser): string {
    const path = ROLE_REDIRECTS[user.role] ?? "/payroll"
    return path
}
