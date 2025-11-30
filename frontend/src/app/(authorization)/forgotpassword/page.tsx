"use client"

import Link from "next/link"
import {FormEvent, useEffect, useState} from "react"

import {
    AUTH_INPUT_BACKGROUND,
    AUTH_PRIMARY_GRADIENT,
    AuthCard,
    AuthCardHeader,
} from "../../_components/common/auth-card"
import {
    requestPasswordReset,
    resetPassword,
    verifyPasswordResetCode,
} from "@app/_components/common/password-reset"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [sending, setSending] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [resetting, setResetting] = useState(false)
    const [sent, setSent] = useState(false)
    const [verified, setVerified] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const [message, setMessage] = useState<string | null>(null)
    const [messageType, setMessageType] = useState<"success" | "error" | null>(null)

    useEffect(() => {
        if (!sent || countdown <= 0) return

        const timer = setInterval(() => {
            setCountdown((value) => Math.max(0, value - 1))
        }, 1000)

        return () => clearInterval(timer)
    }, [sent, countdown])

    useEffect(() => {
        setVerified(false)
    }, [email, code])

    const showMessage = (type: "success" | "error", content: string) => {
        setMessageType(type)
        setMessage(content)
    }

    const handleSend = async () => {
        const normalizedEmail = email.trim()
        if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
            showMessage("error", "Email không hợp lệ")
            return
        }

        setSending(true)
        setMessage(null)
        setMessageType(null)

        try {
            const response = await requestPasswordReset({email: normalizedEmail})
            setSent(true)
            setVerified(false)
            setCountdown(60)
            showMessage("success", response)
        } catch (error) {
            if (error instanceof Error) showMessage("error", error.message)
        } finally {
            setSending(false)
        }
    }

    const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const normalizedEmail = email.trim()
        const trimmedCode = code.trim()

        if (!normalizedEmail || !trimmedCode) {
            showMessage("error", "Email và mã xác thực là bắt buộc")
            return
        }

        setVerifying(true)
        setMessage(null)
        setMessageType(null)

        try {
            const response = await verifyPasswordResetCode({
                email: normalizedEmail,
                code: trimmedCode,
            })
            setVerified(true)
            showMessage("success", response)
        } catch (error) {
            if (error instanceof Error) showMessage("error", error.message)
        } finally {
            setVerifying(false)
        }
    }

    const handleReset = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const normalizedEmail = email.trim()
        const trimmedCode = code.trim()

        if (!verified) {
            showMessage("error", "Vui lòng xác minh mã trước khi đặt lại mật khẩu")
            return
        }

        if (newPassword.length < 6) {
            showMessage("error", "Mật khẩu phải có ít nhất 6 ký tự")
            return
        }

        if (newPassword !== confirmPassword) {
            showMessage("error", "Mật khẩu xác nhận không khớp")
            return
        }

        setResetting(true)
        setMessage(null)
        setMessageType(null)

        try {
            const response = await resetPassword({
                email: normalizedEmail,
                code: trimmedCode,
                newPassword,
            })
            showMessage("success", response)
            setNewPassword("")
            setConfirmPassword("")
        } catch (error) {
            if (error instanceof Error) showMessage("error", error.message)
        } finally {
            setResetting(false)
        }
    }

    return (
        <AuthCard className="max-w-[420px]">
            <AuthCardHeader title="Quên Mật Khẩu"/>

            <div className="space-y-6">
                <div>
                    <label className="mb-2 block text-sm text-white/90" htmlFor="email">
                        Email
                    </label>
                    <div className="relative">
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="Nhập email"
                            className="w-full rounded-xl px-4 py-3 pr-24 text-black outline-none placeholder-black/50 focus:ring-2 focus:ring-white/40"
                            style={{background: AUTH_INPUT_BACKGROUND}}
                            required
                        />
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={sending || (sent && countdown > 0)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1 text-sm text-white shadow disabled:opacity-60"
                            style={{background: AUTH_PRIMARY_GRADIENT}}
                        >
                            {sending ? "Sending..." : countdown > 0 ? `${countdown}s` : "Gửi"}
                        </button>
                    </div>

                    {sent ? (
                        <p className="mt-2 text-xs text-white/80">
                            Mã xác thực đã được gửi tới email của bạn.
                            {countdown > 0
                                ? ` Bạn có thể gửi lại sau ${countdown}s.`
                                : " Bạn có thể gửi lại ngay."}
                        </p>
                    ) : (
                        <p className="mt-2 text-[10px] text-transparent">.</p>
                    )}
                </div>

                <form className="space-y-5" onSubmit={handleVerify}>
                    <div>
                        <label className="mb-2 block text-sm text-white/90" htmlFor="code">
                            Mã xác thực
                        </label>
                        <input
                            id="code"
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                            className="w-full rounded-xl px-4 py-3 text-black outline-none focus:ring-2 focus:ring-white/40"
                            style={{background: AUTH_INPUT_BACKGROUND}}
                            placeholder="Nhập mã 6 chữ số"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={verifying}
                        className="w-full rounded-md py-2 text-base font-semibold text-white shadow-[0_6px_0_rgba(46,115,201,0.35)] hover:opacity-95 disabled:opacity-60"
                        style={{background: AUTH_PRIMARY_GRADIENT}}
                    >
                        {verifying ? "Checking..." : "Verify code"}
                    </button>
                </form>

                <form className="space-y-4" onSubmit={handleReset}>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm text-white/90" htmlFor="new-password">
                                Mật khẩu mới
                            </label>
                            <input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                                disabled={!verified}
                                minLength={6}
                                className="w-full rounded-xl px-4 py-3 text-black outline-none disabled:bg-gray-200 focus:ring-2 focus:ring-white/40"
                                style={{background: AUTH_INPUT_BACKGROUND}}
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm text-white/90" htmlFor="confirm-password">
                                Xác nhận mật khẩu
                            </label>
                            <input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                disabled={!verified}
                                minLength={6}
                                className="w-full rounded-xl px-4 py-3 text-black outline-none disabled:bg-gray-200 focus:ring-2 focus:ring-white/40"
                                style={{background: AUTH_INPUT_BACKGROUND}}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!verified || resetting}
                        className="w-full rounded-md py-2 text-base font-semibold text-white shadow-[0_6px_0_rgba(46,115,201,0.35)] hover:opacity-95 disabled:opacity-60"
                        style={{background: AUTH_PRIMARY_GRADIENT}}
                    >
                        {resetting ? "Updating..." : "Đặt lại mật khẩu"}
                    </button>
                </form>

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
                        Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </AuthCard>
    )
}
