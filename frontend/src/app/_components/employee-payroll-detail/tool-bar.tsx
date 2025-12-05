"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {ArrowLeft, Download} from "lucide-react";

interface EmployeePayrollDetailToolbarProps {
    title: string;
    subtitle?: string;
}

export default function EmployeePayrollDetailToolbar({
                                                         title,
                                                         subtitle,
                                                     }: EmployeePayrollDetailToolbarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleBack = () => {
        const page = searchParams.get("page") || "0";
        const month = searchParams.get("month") || "";
        const search = searchParams.get("search") || "";
        const sortBy = searchParams.get("sortBy") || "";
        
        const params = new URLSearchParams();
        params.set("page", page);
        if (month) params.set("month", month);
        if (search) params.set("search", search);
        if (sortBy) params.set("sortBy", sortBy);
        
        router.push(`/payroll?${params.toString()}`);
    };

    return (
        <div className="rounded-2xl border border-black bg-[#E6F7FF] p-4 shadow-[6px_6px_0_#CCE1F0]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-black bg-[#89CDFE] px-5 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#1D3E6A] transition hover:bg-[#7ABFEF]"
                    >
                        <ArrowLeft className="h-4 w-4"/>
                        Quay Lại
                    </button>

                    <div className="flex flex-col gap-1 text-left">
                        <span className="text-base font-semibold text-[#1D3E6A]">{title}</span>
                        {subtitle ? <span
                            className="text-xs uppercase tracking-[0.3em] text-[#56749A]">{subtitle}</span> : null}
                    </div>
                </div>

                <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-black bg-white px-5 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#1D3E6A] transition hover:bg-[#F4FBFF]"
                >
                    <Download className="h-4 w-4"/>
                    Tải Xuống
                </button>
            </div>
        </div>
    );
}