import Image from "next/image"
import type { HTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

export const AUTH_CARD_BACKGROUND = "#3aa0d1"
export const AUTH_INPUT_BACKGROUND = "#e8cdb6"
const AUTH_PRIMARY_FROM = "#2e73c9"
const AUTH_PRIMARY_TO = "#2b5ec7"
export const AUTH_PRIMARY_GRADIENT = `linear-gradient(180deg, ${AUTH_PRIMARY_FROM}, ${AUTH_PRIMARY_TO})`

export function AuthCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            data-slot="auth-card"
            className={cn(
                "relative w-full rounded-2xl bg-[#3aa0d1] px-10 py-10 shadow-[0_6px_0_rgba(46,115,201,0.35)]",
                className
            )}
            style={{ background: AUTH_CARD_BACKGROUND }}
            {...props}
        />
    )
}

type AuthCardHeaderProps = {
    title: string
    subtitle?: ReactNode
    logoSrc?: string
    logoAlt?: string
    titleClassName?: string
    subtitleClassName?: string
}

export function AuthCardHeader({
                                   title,
                                   subtitle,
                                   logoSrc = "/logo.jpg",
                                   logoAlt = "Sancheng Logistics",
                                   titleClassName,
                                   subtitleClassName,
                               }: AuthCardHeaderProps) {
    return (
        <div className="mb-6 flex items-center justify-between">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-white shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
                <Image src={logoSrc} alt={logoAlt} width={40} height={40} className="object-contain" priority />
            </div>
            <div className="-ml-14 flex-1 text-center">
                <h1 className={cn("text-[22px] font-semibold text-white", titleClassName)}>{title}</h1>
                {subtitle ? (
                    <p className={cn("mt-1 text-sm text-white/80", subtitleClassName)}>{subtitle}</p>
                ) : null}
            </div>
        </div>
    )
}