"use client"

import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"

import {
    AUTH_INPUT_BACKGROUND,
    AUTH_PRIMARY_GRADIENT,
    AuthCard,
    AuthCardHeader,
} from "../../_components/common/auth-card"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    const [seconds, setSeconds] = useState(0)

    useEffect(() => {
        if (!sent || seconds <= 0) {
            return
        }

        const timer = setInterval(() => {
            setSeconds((value) => value - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [sent, seconds])

    const handleSend = async () => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Email không hợp lệ")
            return
        }

        setSending(true)

        try {
            // note: Replace with POST /api/auth/forgotpassword
            await new Promise((resolve) => setTimeout(resolve, 800))
            setSent(true)
            setSeconds(60)
        } finally {
            setSending(false)
        }
    }

    const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!code.trim()) {
            alert("Nhập mã xác thực")
            return
        }

        // note: Verify code & redirect to reset password
        await new Promise((resolve) => setTimeout(resolve, 600))
        alert("Mã hợp lệ (demo). Chuyển sang đặt mật khẩu mới.")
    }

    return (
        <AuthCard className="max-w-[420px]">
            <AuthCardHeader title="Forgot password" />

            <form className="space-y-5" onSubmit={handleVerify}>
                <div>
                    <label className="mb-2 block text-sm text-white/90" htmlFor="email">
                        Email:
                    </label>
                    <div className="relative">
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="Enter your email:"
                            required
                            className="w-full rounded-xl px-4 py-3 pr-24 text-black outline-none placeholder-black/50 focus:ring-2 focus:ring-white/40"
                            style={{ background: AUTH_INPUT_BACKGROUND }}
                        />
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={sending || (sent && seconds > 0)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1 text-sm text-white shadow disabled:opacity-60"
                            style={{ background: AUTH_PRIMARY_GRADIENT }}
                        >
                            {sending ? "Sending..." : seconds > 0 ? `${seconds}s` : "Send"}
                        </button>
                    </div>
                    {sent ? (
                        <p className="mt-2 text-[12px] text-white/80">
                            A verification code has been sent to your email.
                            {seconds > 0 ? ` You’ll be able to resend in ${seconds}s.` : " You can resend now."}
                        </p>
                    ) : (
                        <p className="mt-2 text-[12px] text-transparent">.</p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm text-white/90" htmlFor="code">
                        Verification Code
                    </label>
                    <input
                        id="code"
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                        className="w-full rounded-xl px-4 py-3 text-black outline-none focus:ring-2 focus:ring-white/40"
                        style={{ background: AUTH_INPUT_BACKGROUND }}
                    />
                </div>

                <button
                    type="submit"
                    className="w-full rounded-md py-2 text-lg font-semibold text-white shadow-[0_6px_0_rgba(46,115,201,0.35)] hover:opacity-95"
                    style={{ background: AUTH_PRIMARY_GRADIENT }}
                >
                    Verify
                </button>

                <div className="pt-1">
                    <Link href="/login" className="inline-flex items-center gap-2 text-sm text-white/90 hover:underline">
                        <span>‹</span> Back to login
                    </Link>
                </div>
            </form>
        </AuthCard>
    )
}