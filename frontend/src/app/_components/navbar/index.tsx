'use client'
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, ChevronDown, CircleChevronDown, Clock } from 'lucide-react';
import localFont from "next/font/local";

const iceland = localFont({ src: "../../../../public/fonts/Iceland-Regular.ttf", variable: "--font-iceland" })

export default function Navbar() {
  const pathname = usePathname();
  const noLayoutRoutes = ['/login', '/register']; // exclude routes

  const hideLayout = noLayoutRoutes.includes(pathname);
  return (
    <>
      {hideLayout ? (
        <></>
      ) : (
        <nav className="fixed top-0 inset-x-0 z-50 h-16 bg-[#4AB4DE] text-[#345EA8] px-4 flex items-center justify-between">
          {/* Nhóm bên phải: logo + tên dashboard */}
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src="/logo.jpg" />
              <AvatarFallback>Logo</AvatarFallback>
            </Avatar>
            <span className={`${iceland.className} text-2xl font-bold`}>HR Dashboard</span>
          </div>

          {/* Nhóm bên trái: clock + notification + avatar */}
          <div className="flex items-center gap-4">
            <span id="notification" className="flex items-center gap-1 cursor-pointer">
              <Bell />
              <ChevronDown />
            </span>
            <span id="clock" className="flex items-center gap-1 cursor-pointer">
              <Clock />
              <ChevronDown />
            </span>
            <span className="flex items-center gap-1 cursor-pointer">
              <Avatar className="w-12 h-12">
                <AvatarImage src="/logo.jpg" />
                <AvatarFallback>Avatar</AvatarFallback>
              </Avatar>
              <span id="username">Nguyễn Văn A</span>
            </span>
            <span id="clock" className="flex items-center gap-1 cursor-pointer">
              <CircleChevronDown />
            </span>
          </div>
        </nav>
      )}
    </>
  )
}