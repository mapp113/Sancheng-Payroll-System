"use client"

import Link from "next/link"
import {FormEvent, useState} from "react"
import {useRouter} from "next/navigation"

import {
    AUTH_INPUT_BACKGROUND,
    AUTH_PRIMARY_GRADIENT,
    AuthCard,
    AuthCardHeader,
} from "@app/_components/common/auth-card"

import {login, resolveRedirectPath} from "@app/_components/common/login"
import {useTranslations} from "@/lib/translations"

export default function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setLoading(true)
        setErrorMessage(null)

        try {
            // fake delay để UI có cảm giác loading, giữ lại nếu bạn thích
            await new Promise((resolve) => setTimeout(resolve, 600))

            // gọi API login
            const authenticatedUser = await login({username, password})

            // lưu session
            if (typeof window !== "undefined") {
                window.sessionStorage.setItem(
                    "scpm.auth.user",
                    JSON.stringify(authenticatedUser)
                )
                window.sessionStorage.setItem(
                    "scpm.auth.token",
                    authenticatedUser.token
                )
            }

            // luôn đi /payroll
            const destination = resolveRedirectPath(authenticatedUser)
            router.push(destination)
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage("Đăng nhập thất bại. Vui lòng thử lại.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthCard className="max-w-[400px]">
            <AuthCardHeader title="Login" subtitle="Welcome!"/>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {/* Username */}
                <div>
                    <label
                        className="mb-2 block text-sm text-white/90"
                        htmlFor="username"
                    >
                        Username :
                    </label>
                    <input
                        id="username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder="Enter your username"
                        required
                        className="w-full rounded-xl px-4 py-3 text-black outline-none placeholder-black/50 focus:ring-2 focus:ring-white/40"
                        style={{background: AUTH_INPUT_BACKGROUND}}
                    />
                </div>

                {/* Password */}
                <div>
                    <label
                        className="mb-2 block text-sm text-white/90"
                        htmlFor="password"
                    >
                        Password :
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter your password"
                        required
                        className="w-full rounded-xl px-4 py-3 text-black outline-none placeholder-black/50 focus:ring-2 focus:ring-white/40"
                        style={{background: AUTH_INPUT_BACKGROUND}}
                    />
                </div>

                {/* Forgot password link */}
                <div className="text-center">
                    <Link
                        href="/forgotpassword"
                        className="text-sm text-white/90 hover:underline"
                    >
                        Forgot password?
                    </Link>
                </div>

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md py-2 text-lg font-semibold text-white shadow-[0_6px_0_rgba(46,115,201,0.35)] hover:opacity-95 disabled:opacity-60"
                    style={{background: AUTH_PRIMARY_GRADIENT}}
                >
                    {loading ? "Processing..." : "Login"}
                </button>

                {/* Error message */}
                {errorMessage ? (
                    <p
                        className="text-center text-sm font-medium text-red-100"
                        role="alert"
                    >
                        {errorMessage}
                    </p>
                ) : null}
            </form>
        </AuthCard>
    )
}
