"use client";

import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useState } from "react";

export default function NavigationSidebar({select}: { select: number }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const selected = "rounded-xl bg-[#4AB4DE]";

    const menuItems = [
        { id: 1, href: "/admin", icon: Users, label: "Danh sách Người dùng" },
    ];

    return (
        <aside className={`fixed top-16 bottom-0 left-0 z-40 ${isExpanded ? 'w-64' : 'w-20'} bg-[#CCE1F0] p-4 flex flex-col transition-all duration-300`}>
            <ul className="space-y-2 flex-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <li key={item.id} className={`${select === item.id ? selected : "hover:bg-[#B3D9F0]"} rounded-xl transition-colors duration-200`}>
                            <a href={item.href} className="flex items-center gap-3 p-2 rounded-xl" title={item.label}>
                                <Icon size={32} className="flex-shrink-0" />
                                {isExpanded && (
                                    <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                        {item.label}
                                    </span>
                                )}
                            </a>
                        </li>
                    );
                })}
            </ul>
            <div className="mt-auto pt-4 border-t border-gray-300">
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="hover:bg-[#4AB4DE] rounded-xl p-2 transition-colors w-full flex items-center justify-center cursor-pointer"
                    aria-label={isExpanded ? "Thu nhỏ sidebar" : "Mở rộng sidebar"}
                >
                    {isExpanded ? <ChevronLeft size={32} /> : <ChevronRight size={32} />}
                </button>
            </div>
        </aside>
    );
}
