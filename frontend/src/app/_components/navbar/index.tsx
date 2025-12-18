"use client";
import Link from "next/link";
import {useEffect, useRef, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import localFont from "next/font/local";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {useTranslations} from "@/lib/translations";
import {
    Bell,
    ChevronDown,
    CircleChevronDown,
    Clock,
    Languages,
    User,
    Settings,
    LogOut,
    ArrowLeftRight
} from "lucide-react";
import {useLanguage} from "@/lib/language-context";
import NotificationPanel from "../common/notification/panel";
import {getDashboardTitle, getDashboardTitleByRole} from "../utils/dashboard-title-mapping";

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

// Interface cho user data trong session storage
interface UserData {
    token: string;
    role: string; // "EMPLOYEE" | "MANAGER" | "HR"
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
    const router = useRouter();
    const noLayoutRoutes = ["/login", "/register"];
    const shouldHideNavbar = pathname && noLayoutRoutes.includes(pathname);
    const [username, setUsername] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [dashboardTitle, setDashboardTitle] = useState("Dashboard");
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [hasNewNotification, setHasNewNotification] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    // Ẩn navbar ở các route không cần layout
    // if (pathname && noLayoutRoutes.includes(pathname)) return null;
    const {language, toggleLanguage} = useLanguage();

    useEffect(() => {
        // try {
        //     const userStr = window.sessionStorage.getItem("scpm.auth.user");
        //     if (!userStr) return;
        const userStr = window.sessionStorage.getItem("scpm.auth.user");
        if (!userStr) {
            return;
        }

        try {
            const parsed: UserData = JSON.parse(userStr);
            const token = parsed?.token;
            // if (!token) return;
            if (!token) {
                return;
            }

            // Lưu role
            setUserRole(parsed?.role || null);

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
        setDashboardTitle(getDashboardTitle());
        fetchUnreadCount();
        checkForNewNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    // Fetch unread notification count
    const fetchUnreadCount = async () => {
        try {
            const userStr = window.sessionStorage.getItem("scpm.auth.user");
            if (!userStr) return;

            const parsed: UserData = JSON.parse(userStr);
            const token = parsed?.token;
            if (!token) return;

            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/notifications/unread-count`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.count || 0);
            }
        } catch (error) {
            console.error("Failed to fetch unread count:", error);
        }
    };

    // Check for new notifications by comparing with last viewed time
    const checkForNewNotifications = async () => {
        try {
            const userStr = window.sessionStorage.getItem("scpm.auth.user");
            if (!userStr) return;

            const parsed: UserData = JSON.parse(userStr);
            const token = parsed?.token;
            if (!token) return;

            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/notifications`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const notifications = await response.json();
                if (notifications && notifications.length > 0) {
                    // Lấy thời gian của thông báo mới nhất
                    const latestNotificationTime = new Date(notifications[0].createdAt).getTime();

                    // Lấy thời gian xem lần cuối từ localStorage
                    const lastViewedTime = localStorage.getItem("scpm.notifications.lastViewed");

                    if (!lastViewedTime || latestNotificationTime > parseInt(lastViewedTime)) {
                        setHasNewNotification(true);
                    } else {
                        setHasNewNotification(false);
                    }
                } else {
                    setHasNewNotification(false);
                }
            }
        } catch (error) {
            console.error("Failed to check for new notifications:", error);
        }
    };

    // Mark notifications as viewed
    const markNotificationsAsViewed = () => {
        const currentTime = new Date().getTime();
        localStorage.setItem("scpm.notifications.lastViewed", currentTime.toString());
        setHasNewNotification(false);
    };

    // Đóng menu khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
        };

        if (isMenuOpen || isNotificationOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen, isNotificationOpen]);

    const handleLogout = () => {
        window.sessionStorage.removeItem("scpm.auth.user");
        window.sessionStorage.removeItem("scpm.auth.token");
        router.push("/login");
    };

    // Kiểm tra quyền chuyển đổi view dựa trên role
    const isManagerOrHR = userRole === "MANAGER" || userRole === "HR";
    const isEmployeeView = pathname?.startsWith("/employee");
    const canSwitchView = isManagerOrHR && (isManagerOrHR || isEmployeeView);

    const handleSwitchView = () => {
        setIsMenuOpen(false);
        if (isEmployeeView) {
            // Đang ở view nhân viên, chuyển về view gốc theo role
            if (userRole) {
                const title = getDashboardTitleByRole(userRole);
                localStorage.setItem("scpm.dashboard.title", title);
                setDashboardTitle(title);
                
                // Redirect dựa trên role
                if (userRole === "MANAGER") {
                    router.push("/manager/timesheet");
                } else if (userRole === "HR") {
                    router.push("/contract");
                }
            }
        } else if (isManagerOrHR) {
            // Đang ở view quản lý/HR, chuyển sang view nhân viên
            localStorage.setItem("scpm.dashboard.title", "Employee Dashboard");
            setDashboardTitle("Employee Dashboard");
            router.push("/employee");
        }
    };

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

                <div className="relative" ref={notificationRef}>
                    <button
                        id="notification"
                        className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                        onClick={() => {
                            const wasOpen = isNotificationOpen;
                            setIsNotificationOpen(!wasOpen);
                            if (!wasOpen) {
                                fetchUnreadCount();
                                checkForNewNotifications();
                                markNotificationsAsViewed();
                            }
                        }}
                        aria-label="Notifications"
                    >
                        <div className="relative">
                            <Bell/>
                            {unreadCount > 0 && (
                                <span
                                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                            {hasNewNotification && unreadCount === 0 && (
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </div>
                        <ChevronDown/>
                    </button>
                    {isNotificationOpen && (
                        <NotificationPanel/>
                    )}
                </div>

                {/* <button id="clock" className="flex items-center gap-1">
                    <Clock/>
                    <ChevronDown/>
                </button> */}


                {userRole === "ADMIN" ? (
                    <div className="flex items-center gap-2 rounded-full px-2 py-1">
                        <span id="username" className="font-semibold">
                            {username || "Loading..."}
                        </span>
                    </div>
                ) : (
                    <Link
                        href={
                            userRole === "MANAGER"
                                ? "/manager/profile"
                                : userRole === "HR"
                                    ? "/contract/profile"
                                    : "/employee/profile"
                        }
                        className="flex items-center gap-2 rounded-full px-2 py-1 transition hover:bg-white/50">
                        {/*<Avatar className="h-12 w-12">*/}
                        {/*    <AvatarImage src="/logo.jpg" alt="User avatar"/>*/}
                        {/*    <AvatarFallback>Avatar</AvatarFallback>*/}
                        {/*</Avatar>*/}
                        <span id="username" className="font-semibold">
                            {username || "Loading..."}
                        </span>
                    </Link>
                )}
                <div className="relative" ref={menuRef}>
                    <button
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="User menu"
                    >
                        <CircleChevronDown/>
                    </button>

                    {isMenuOpen && (
                        <div
                            className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                            <div className="py-1">
                                {canSwitchView && (
                                    <>
                                        <button
                                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                            onClick={handleSwitchView}
                                        >
                                            <ArrowLeftRight className="h-4 w-4"/>
                                            <span>
                                                {isEmployeeView
                                                    ? (language === "vi" ? "Chuyển sang quản lý" : "Switch to Manager")
                                                    : (language === "vi" ? "Chuyển sang nhân viên" : "Switch to Employee")
                                                }
                                            </span>
                                        </button>
                                        <hr className="my-1 border-gray-200"/>
                                    </>
                                )}
                                {/* <button
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        // Navigate to profile
                                    }}
                                >
                                    <User className="h-4 w-4" />
                                    <span>{language === "vi" ? "Hồ sơ" : "Profile"}</span>
                                </button>
                                <button
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        // Navigate to settings
                                    }}
                                >
                                    <Settings className="h-4 w-4" />
                                    <span>{language === "vi" ? "Cài đặt" : "Settings"}</span>
                                </button>
                                <hr className="my-1 border-gray-200" /> */}
                                <button
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4"/>
                                    <span>{language === "vi" ? "Đăng xuất" : "Logout"}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </nav>
    );
}