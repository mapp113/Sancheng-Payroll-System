"use client";

import {useEffect, useState} from "react";
import {usePathname} from "next/navigation";
import localFont from "next/font/local";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Bell, ChevronDown, CircleChevronDown, Clock, Languages} from "lucide-react";
import {useLanguage} from "@/lib/language-context";

const iceland = localFont({
    src: "../../../../public/fonts/Iceland-Regular.ttf",
    variable: "--font-iceland",
});

// Interface cho token payload
interface JwtPayload {
    // sub: string; // username trong token
    // full_name: string;
    sub?: string;
    full_name?: string;
    exp?: number;
    iat?: number;
}

function decodeJwt(token: string): JwtPayload | null {
    try {
        const [, payloadSegment] = token.split(".");
        if (!payloadSegment) {
            return null;
        }
        const normalizedPayload = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(normalizedPayload)
                .split("")
                .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Failed to decode JWT payload", error);
        return null;
    }
}

export default function Navbar() {
    const pathname = usePathname();
    const noLayoutRoutes = ["/login", "/register"];
    const shouldHideNavbar = pathname && noLayoutRoutes.includes(pathname);
    const [username, setUsername] = useState<string | null>(null);

    // Ẩn navbar ở các route không cần layout
    // if (pathname && noLayoutRoutes.includes(pathname)) return null;
    const {language, toggleLanguage} = useLanguage();
    // const dashboardTitle = pathname?.startsWith("/manager")
    //     ? "Manager Dashboard"
    //     : "HR Dashboard";
    const dashboardTitle = pathname?.startsWith("/admin")
        ? "Admin Dashboard"
        : pathname?.startsWith("/manager")
            ? "Manager Dashboard"
            : pathname?.startsWith("/employee")
                ? "Employee Dashboard"
                : "HR Dashboard";

    useEffect(() => {
        // try {
        //     const userStr = window.sessionStorage.getItem("scpm.auth.user");
        //     if (!userStr) return;
        const userStr = window.sessionStorage.getItem("scpm.auth.user");
        if (!userStr) {
            return;
        }

        try {
            const parsed = JSON.parse(userStr);
            const token = parsed?.token;
            // if (!token) return;
            if (!token) {
                return;
            }

            // Giải mã token để lấy sub
            // const decoded = jwtDecode<JwtPayload>(token);
            // setUsername(decoded.full_name || "Unknown User");
            const decoded = decodeJwt(token);
            if (!decoded) {
                setUsername("Unknown User");
                return;
            }

            setUsername(decoded.full_name || decoded.sub || "Unknown User");
        } catch (error) {
            console.error("JWT decode error:", error);
            setUsername("Unknown User");
        }
    }, []);

    if (shouldHideNavbar) return null;

    return (
        <nav
            className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between bg-[#4AB4DE] px-4 text-[#345EA8]">
            {/* trái: logo + tiêu đề */}
            <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                    <AvatarImage src="/logo.jpg" alt="Logo"/>
                    <AvatarFallback>Logo</AvatarFallback>
                </Avatar>
                <span className={`${iceland.className} text-2xl font-bold`}>
          {dashboardTitle}
        </span>
            </div>

            {/* phải: chuông, đồng hồ, user */}
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 rounded-full bg-white/40 px-3 py-1 text-sm font-semibold text-[#345EA8] transition hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#345EA8]"
                    aria-label={`Switch to ${language === "vi" ? "English" : "Vietnamese"}`}
                >
                    <Languages className="h-4 w-4" aria-hidden="true"/>
                    <span>{language === "vi" ? "Tiếng Việt" : "English"}</span>
                </button>
                <button id="notification" className="flex items-center gap-1">
                    <Bell/>
                    <ChevronDown/>
                </button>

                <button id="clock" className="flex items-center gap-1">
                    <Clock/>
                    <ChevronDown/>
                </button>

                <span className="flex items-center gap-1">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/logo.jpg" alt="User avatar"/>
            <AvatarFallback>Avatar</AvatarFallback>
          </Avatar>
          <span id="username">{username || "Loading..."}</span>
        </span>

                <CircleChevronDown/>
            </div>

        </nav>
    );
}