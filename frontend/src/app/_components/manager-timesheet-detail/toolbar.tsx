"use client";

import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";
import {ArrowLeft} from "lucide-react";

import {cn} from "@/lib/utils";

import type {TimesheetToolbarTab} from "./types";

interface ManagerTimesheetDetailToolbarProps {
    title: string;
    contextLabel?: string;
    tabs: TimesheetToolbarTab[];
    activeTab: string;
    onTabChange?: (label: string) => void;
}

export default function ManagerTimesheetDetailToolbar({
                                                          tabs,
                                                          activeTab,
                                                          onTabChange,
                                                      }: ManagerTimesheetDetailToolbarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleBack = () => {
        const page = searchParams.get("page") || "0";
        const month = searchParams.get("month") || "";
        const search = searchParams.get("search") || "";
        
        const params = new URLSearchParams();
        params.set("page", page);
        if (month) params.set("month", month);
        if (search) params.set("search", search);
        
        router.push(`/manager/timesheet?${params.toString()}`);
    };

    return (
        <div className="rounded-2xl border border-black bg-[#E6F7FF] p-4 shadow-[6px_6px_0_#CCE1F0]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex size-12 items-center justify-center rounded-full border border-black bg-white text-[#1D3E6A] transition hover:bg-[#F4FBFF]"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="h-6 w-6"/>
                    </button>

                    {/*<h1 className="text-xl font-semibold text-[#1D3E6A]">{title}</h1>*/}

                    <nav className="inline-flex items-center gap-1 rounded-full border border-black bg-white p-1">
                        {tabs.map((tab) => {
                            const isActive = tab.isActive ?? tab.label === activeTab;
                            const tabClassName = cn(
                                "rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#56749A] transition",
                                isActive && "bg-[#4AB4DE] text-white shadow-[3px_3px_0_#1D3E6A]"
                            );

                            if (tab.href) {
                                return (
                                    <Link key={tab.label} href={tab.href} className={tabClassName}>
                                        {tab.label}
                                    </Link>
                                );
                            }

                            return (
                                <button
                                    key={tab.label}
                                    type="button"
                                    onClick={() => onTabChange?.(tab.label)}
                                    className={tabClassName}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/*{contextLabel ? (*/}
                {/*    <span*/}
                {/*        className="text-xs font-semibold uppercase tracking-[0.4em] text-[#56749A]">{contextLabel}</span>*/}
                {/*) : null}*/}
            </div>
        </div>
    );
}
