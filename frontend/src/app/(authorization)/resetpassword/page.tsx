"use client"

import Link from "next/link"
import {FormEvent, useState} from "react"
import {useSearchParams} from "next/navigation"

import {
    AUTH_INPUT_BACKGROUND,
    AUTH_PRIMARY_GRADIENT,
    AuthCard,
    AuthCardHeader,
}
    from "@app/_components/common/auth-card"
import {resetPassword} from "@app/_components/common/password-reset"

export default function ResetPasswordPage() {
    const searchParams = useSearchParams()
    const [email, setEmail] = useState(() => searchParams.get("email") ?? "")
    const [code, setCode] = useState(() => searchParams.get("code") ?? "")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [messageType, setMessageType] = useState<"success" | "error" | null>(null)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const normalizedEmail = email.trim()
        const trimmedCode = code.trim()

        if (!normalizedEmail || !trimmedCode) {
            setMessageType("error")
            setMessage("Email và mã xác thực là bắt buộc")
            return
        }

        if (password.length < 6) {
            setMessageType("error")
            setMessage("Mật khẩu phải có ít nhất 6 ký tự")
            return
        }

        if (password !== confirmPassword) {
            setMessageType("error")
            setMessage("Mật khẩu xác nhận không khớp")
            return
        }

        setSubmitting(true)
        setMessage(null)
        setMessageType(null)

        try {
            const responseMessage = await resetPassword({
                email: normalizedEmail,
                code: trimmedCode,
                newPassword: password,
            })
            setMessageType("success")
            setMessage(responseMessage)
            setPassword("")
            setConfirmPassword("")
        } catch (error) {
            if (error instanceof Error) {
                setMessageType("error")
                setMessage(error.message)
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AuthCard className="max-w-[420px]">
            <AuthCardHeader title="Reset password"/>

            <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                    <label className="mb-2 block text-sm text-white/90" htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full rounded-xl px-4 py-3 text-black outline-none placeholder-black/50 focus:ring-2 focus:ring-white/40"
                        style={{background: AUTH_INPUT_BACKGROUND}}
                        required
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm text-white/90" htmlFor="code">
                        Verification code
                    </label>
                    <input
                        id="code"
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                        className="w-full rounded-xl px-4 py-3 text-black outline-none focus:ring-2 focus:ring-white/40"
                        style={{background: AUTH_INPUT_BACKGROUND}}
                        required
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm text-white/90" htmlFor="password">
                        New password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="w-full rounded-xl px-4 py-3 text-black outline-none focus:ring-2 focus:ring-white/40"
                        style={{background: AUTH_INPUT_BACKGROUND}}
                        minLength={6}
                        required
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm text-white/90" htmlFor="confirm-password">
                        Confirm password
                    </label>
                    <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className="w-full rounded-xl px-4 py-3 text-black outline-none focus:ring-2 focus:ring-white/40"
                        style={{background: AUTH_INPUT_BACKGROUND}}
                        minLength={6}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-md py-2 text-lg font-semibold text-white shadow-[0_6px_0_rgba(46,115,201,0.35)] hover:opacity-95 disabled:opacity-60"
                    style={{background: AUTH_PRIMARY_GRADIENT}}
                >
                    {submitting ? "Processing..." : "Reset password"}
                </button>

                {message ? (
                    <p
                        className={`text-center text-sm font-medium ${
                            messageType === "error" ? "text-red-200" : "text-emerald-200"
                        }`}
                    >
                        {message}
                    </p>
                ) : null}

                <div className="pt-1 text-center">
                    <Link href="/login" className="text-sm text-white/90 hover:underline">
                        Back to login
                    </Link>
                </div>
            </form>
        </AuthCard>
    )
}