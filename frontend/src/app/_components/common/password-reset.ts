const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:8080"

type ApiResponse = {
    status?: number
    message?: string
}

type ForgotPayload = {
    email: string
}

type VerifyPayload = {
    email: string
    code: string
}

type ResetPayload = {
    email: string
    code: string
    newPassword: string
}

async function callAuthApi(
    path: string,
    payload: unknown,
    fallbackSuccess: string,
    fallbackError: string,
): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/${path}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        try {
            const error = (await response.json()) as ApiResponse
            throw new Error(error.message ?? fallbackError)
        } catch (error) {
            if (error instanceof Error && error.message !== fallbackError) {
                throw error
            }
            throw new Error(fallbackError)
        }
    }

    try {
        const data = (await response.json()) as ApiResponse
        return data.message ?? fallbackSuccess
    } catch {
        return fallbackSuccess
    }
}

export const requestPasswordReset = (payload: ForgotPayload) =>
    callAuthApi("forgot-password", payload, "Mã xác thực đã được gửi", "Không thể gửi mã xác thực. Vui lòng thử lại")

export const verifyPasswordResetCode = (payload: VerifyPayload) =>
    callAuthApi("verify-reset-code", payload, "Mã xác thực hợp lệ", "Mã xác thực không hợp lệ")

export const resetPassword = (payload: ResetPayload) =>
    callAuthApi("reset-password", payload, "Đặt lại mật khẩu thành công", "Đặt lại mật khẩu thất bại. Vui lòng thử lại")