import EmployeePayrollDetail from "@/app/_components/employee-payroll-detail";
//import {hrPayrollDetail} from "@/app/_components/employee-payroll-detail/data/hr";
import EmployeePayrollDetailToolbar from "@/app/_components/employee-payroll-detail/tool-bar";
import type {
    EmployeePayrollDetailData,
    PayrollInfoField,
    PayrollLineItem,
} from "@/app/_components/employee-payroll-detail/types";

// export default function PayrollDetailPage() {
//     return (
//         <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pb-12">
//             <EmployeePayrollDetailToolbar
//                 title={hrPayrollDetail.title}
//                 subtitle={hrPayrollDetail.periodLabel}
//             />
//             <EmployeePayrollDetail detail={hrPayrollDetail}/>
//         </div>
//     );
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type PayrollDetailSearchParams = {
    employeeCode?: string;
    month?: string;
};

type PaySummaryComponentResponse = {
    name: string;
    type: string;
    amount: number;
    note?: string | null;
};

type PaySummaryDetailResponse = {
    employeeCode: string;
    month: string;
    grossIncome: number;
    assessableIncome: number;
    taxableIncome: number;
    taxAmount: number;
    bhAmount: number;
    netSalary: number;
    otHour: number;
    otAmount: number;
    baseSalaryAmt: number;
    components: PaySummaryComponentResponse[];
};

type EmployeeInfoResponse = {
    employeeCode: string;
    fullName: string;
    username: string;
    email: string;
    dob: string;
    phoneNo: string;
    taxNo: string | null;
    socialNo: string;
    bankNumber: number | null;
    dependentsNo: number | null;
    positionId: number | null;
    positionName: string | null;
};

type PaySummaryListItemResponse = {
    employeeCode: string;
    fullName: string;
    positionName: string;
    netSalary: number;
    status: string;
    payslipUrl: string | null;
};

type PaySummaryPageResponse = {
    content?: PaySummaryListItemResponse[];
};

const FALLBACK_PAYROLL_MONTH = "2025-10-01";

const monthFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
});

export default async function PayrollDetailPage({
                                                    searchParams,
                                                }: {
    searchParams?: PayrollDetailSearchParams;
}) {
    const employeeCode = searchParams?.employeeCode?.trim();
    const monthParam = searchParams?.month?.trim();
    const monthForApi = monthParam
        ? normaliseMonthParam(monthParam)
        : getDefaultPayrollMonth();
    const periodLabel = formatPeriod(monthForApi) ?? monthForApi;

    try {
        const resolvedEmployeeCode = employeeCode
            ?? (await fetchDefaultEmployeeCodeForMonth(monthForApi));

        if (!resolvedEmployeeCode) {
            return (
                <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pb-12">
                    <EmployeePayrollDetailToolbar
                        title="Employee Payroll Detail"
                        subtitle={periodLabel}
                    />
                    <div
                        className="rounded-2xl border border-dashed border-[#4AB4DE] bg-[#F4FBFF] p-10 text-center text-[#1D3E6A]">
                        No payroll records were found for {periodLabel}. Please choose a different month.
                    </div>
                </div>
            );
        }

        const [paySummary, employeeInfo] = await Promise.all([
            fetchPayrollDetail(resolvedEmployeeCode, monthForApi),
            fetchEmployeeInfo(resolvedEmployeeCode),
        ]);

        const detail = mapToEmployeePayrollDetail(paySummary, employeeInfo ?? undefined);

        return (
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pb-12">
                <EmployeePayrollDetailToolbar
                    title={detail.title}
                    subtitle={detail.periodLabel}
                />
                <EmployeePayrollDetail detail={detail}/>
            </div>
        );
    } catch (error) {
        console.error("Failed to load payroll detail", error);
        return (
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pb-12">
                <EmployeePayrollDetailToolbar title="Employee Payroll Detail"/>
                <div
                    className="rounded-2xl border border-dashed border-[#4AB4DE] bg-[#F4FBFF] p-10 text-center text-[#1D3E6A]">
                    Unable to load payroll details for the selected employee and month.
                </div>
            </div>
        );
    }
}

function normaliseMonthParam(month: string): string {
    if (/^\d{4}-\d{2}$/.test(month)) {
        return `${month}-01`;
    }
    return month;
}

function getDefaultPayrollMonth(): string {
    return FALLBACK_PAYROLL_MONTH;
}

async function fetchPayrollDetail(employeeCode: string, month: string): Promise<PaySummaryDetailResponse> {
    const params = new URLSearchParams({employeeCode, month});
    const response = await fetch(`${API_BASE_URL}/api/paysummaries/detail?${params.toString()}`, {
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Failed to load payroll detail");
    }

    return response.json() as Promise<PaySummaryDetailResponse>;
}

async function fetchEmployeeInfo(employeeCode: string): Promise<EmployeeInfoResponse | null> {
    const response = await fetch(`${API_BASE_URL}/api/employees/${employeeCode}`, {
        cache: "no-store",
    });

    if (!response.ok) {
        return null;
    }

    return response.json() as Promise<EmployeeInfoResponse>;
}

async function fetchDefaultEmployeeCodeForMonth(month: string): Promise<string | null> {
    const params = new URLSearchParams({
        date: month,
        page: "0",
        size: "1",
    });

    const response = await fetch(`${API_BASE_URL}/api/paysummaries?${params.toString()}`, {
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Failed to load payroll summaries");
    }

    const payload = await response.json() as PaySummaryPageResponse;
    const firstItem = payload.content?.[0];

    return firstItem?.employeeCode ?? null;
}

function mapToEmployeePayrollDetail(
    paySummary: PaySummaryDetailResponse,
    employee?: EmployeeInfoResponse,
): EmployeePayrollDetailData {
    const periodLabel = formatPeriod(paySummary.month) ?? paySummary.month;
    const generalInformation = buildGeneralInformation(paySummary, employee);
    const {
        incomeItems,
        deductionItems,
        backPayItems,
    } = splitComponentItems(paySummary.components, paySummary);

    const totalIncome = paySummary.grossIncome;
    const totalDeduct = paySummary.grossIncome - paySummary.netSalary;

    return {
        title: "Employee Payroll Detail",
        role: employee?.positionName ?? "Employee",
        periodLabel,
        employee: {
            name: employee?.fullName ?? paySummary.employeeCode,
            code: employee?.employeeCode ?? paySummary.employeeCode,
            position: employee?.positionName ?? "",
            department: undefined,
            avatarUrl: undefined,
        },
        generalInformation,
        incomeItems,
        deductionItems,
        backPayItems,
        totals: {
            totalIncome,
            totalGross: totalIncome,
            totalDeduct,
            netIncome: paySummary.netSalary,
        },
    };
}

function buildGeneralInformation(
    paySummary: PaySummaryDetailResponse,
    employee?: EmployeeInfoResponse,
): PayrollInfoField[] {
    const values: PayrollInfoField[] = [
        {
            label: "Employee Code",
            value: employee?.employeeCode ?? paySummary.employeeCode,
        },
        {
            label: "Position",
            value: employee?.positionName ?? "—",
        },
        {
            label: "Email",
            value: employee?.email ?? "—",
        },
        {
            label: "Phone",
            value: employee?.phoneNo ?? "—",
        },
        {
            label: "Tax Number",
            value: employee?.taxNo ?? "—",
        },
        {
            label: "Social Insurance No",
            value: employee?.socialNo ?? "—",
        },
    ];

    if (employee?.dob) {
        values.push({
            label: "Date of Birth",
            value: formatDate(employee.dob),
        });
    }

    if (employee?.dependentsNo != null) {
        values.push({
            label: "Dependents",
            value: String(employee.dependentsNo),
        });
    }

    return values;
}

function splitComponentItems(
    components: PaySummaryComponentResponse[],
    paySummary: PaySummaryDetailResponse,
): {
    incomeItems: PayrollLineItem[];
    deductionItems: PayrollLineItem[];
    backPayItems?: PayrollLineItem[];
} {
    const incomeItems: PayrollLineItem[] = [];
    const deductionItems: PayrollLineItem[] = [];
    const backPayItems: PayrollLineItem[] = [];

    if (paySummary.baseSalaryAmt != null) {
        incomeItems.push({label: "Base Salary", value: paySummary.baseSalaryAmt});
    }

    if (paySummary.otAmount != null) {
        incomeItems.push({
            label: "Overtime Pay",
            value: paySummary.otAmount,
            description: paySummary.otHour ? `${paySummary.otHour} hours` : undefined,
        });
    }

    components.forEach((component) => {
        const item = mapComponentToLineItem(component);
        const componentType = component.type?.toUpperCase?.() ?? "";
        switch (componentType) {
            case "ADDITION":
                incomeItems.push(item);
                break;
            case "INSURANCE":
            case "DEDUCTION":
            case "TAX":
                deductionItems.push(item);
                break;
            case "TAX_DEDUCTION":
                backPayItems.push(item);
                break;
            default:
                incomeItems.push(item);
                break;
        }
    });

    if (paySummary.taxAmount) {
        deductionItems.push({
            label: "Personal Income Tax",
            value: Math.abs(paySummary.taxAmount),
        });
    }

    if (!deductionItems.length && paySummary.bhAmount) {
        deductionItems.push({
            label: "Insurance Contributions",
            value: Math.abs(paySummary.bhAmount),
        });
    }

    return {
        incomeItems,
        deductionItems,
        backPayItems: backPayItems.length ? backPayItems : undefined,
    };
}

function mapComponentToLineItem(component: PaySummaryComponentResponse): PayrollLineItem {
    return {
        label: component.name,
        description: component.note?.trim() ? component.note : undefined,
        value: Math.abs(component.amount),
    };
}

function formatPeriod(value?: string): string | undefined {
    if (!value) return undefined;
    const date = toDate(value);
    if (!date) return undefined;
    return monthFormatter.format(date);
}

function formatDate(value?: string): string {
    const date = toDate(value);
    if (!date) return "—";
    return dateFormatter.format(date);
}

function toDate(value?: string): Date | null {
    if (!value) return null;
    const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
    return Number.isNaN(date.getTime()) ? null : date;
}