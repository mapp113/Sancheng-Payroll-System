export interface PayrollParam {
  keyword: string;
  sortBy: string;
  date: string;
  page: string;
  totalPage: string;
}

export type PayrollRecord = {
  employeeCode: string;
  fullName: string;
  positionName: string;
  netSalary: string;
  status: string;
  payslipUrl: string;
};

export type PayrollContextType = {
  payrollParams: PayrollParam;
  setPayrollParams: React.Dispatch<React.SetStateAction<PayrollParam>>;
};

export type PayrollDataContextType = {
  payrollData: PayrollRecord[];
  setPayrollData: React.Dispatch<React.SetStateAction<PayrollRecord[]>>;
};
