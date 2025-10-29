"use client";

import {useEffect, useState} from "react";
import {usePathname} from "next/navigation";
import localFont from "next/font/local";
import {jwtDecode} from "jwt-decode";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Bell, ChevronDown, CircleChevronDown, Clock} from "lucide-react";

const iceland = localFont({
    src: "../../../../public/fonts/Iceland-Regular.ttf",
    variable: "--font-iceland",
});

// Interface cho token payload
interface JwtPayload {
    sub: string; // username trong token
    full_name: string;
    exp?: number;
    iat?: number;
}

export default function Navbar() {
    const pathname = usePathname();
    const noLayoutRoutes = ["/login", "/register"];
    const [username, setUsername] = useState<string | null>(null);

    // Ẩn navbar ở các route không cần layout
    if (pathname && noLayoutRoutes.includes(pathname)) return null;

    const dashboardTitle = pathname?.startsWith("/manager")
        ? "Manager Dashboard"
        : "HR Dashboard";

    useEffect(() => {
        try {
            const userStr = window.sessionStorage.getItem("scpm.auth.user");
            if (!userStr) return;

            const parsed = JSON.parse(userStr);
            const token = parsed?.token;
            if (!token) return;

            // Giải mã token để lấy sub
            const decoded = jwtDecode<JwtPayload>(token);
            setUsername(decoded.full_name || "Unknown User");
        } catch (error) {
            console.error("JWT decode error:", error);
            setUsername("Unknown User");
        }
    }, []);

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
