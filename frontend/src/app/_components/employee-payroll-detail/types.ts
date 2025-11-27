export interface PayrollInfoField {
    label: string;
    value: string;
}

export interface PayrollLineItem {
    label: string;
    description?: string;
    value: number;
    subItems?: PayrollLineItem[];
}

export interface EmployeePayrollTotals {
    totalIncome?: number;
    totalGross?: number;
    totalDeduct: number;
    netIncome?: number;
}

export interface PayrollEmployeeProfile {
    name: string;
    code: string;
    position: string;
    department?: string;
    avatarUrl?: string;
}

export interface EmployeePayrollDetailData {
    title: string;
    role: string;
    periodLabel?: string;
    employee?: PayrollEmployeeProfile;
    generalInformation: PayrollInfoField[];
    incomeItems: PayrollLineItem[];
    deductionItems: PayrollLineItem[];
    backPayItems?: PayrollLineItem[];
    totals: EmployeePayrollTotals;
}