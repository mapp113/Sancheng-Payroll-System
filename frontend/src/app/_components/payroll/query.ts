import type { PayrollParam, PayrollRecord } from "./type";

const USE_SAMPLE_DATA = false;
const API_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/paysummaries`;
const SAMPLE_DATA: PayrollRecord[] = [
  {
    employeeCode: 'E001',
    fullName: 'John Doe',
    positionName: 'Software Engineer',
    netSalary: "60000",
    status: 'green',
    payslipUrl: 'Link to Payslip',
  },
  {
    employeeCode: 'E002',
    fullName: 'Jane Smith',
    positionName: 'Product Manager',
    netSalary: "80000",
    status: 'yellow',
    payslipUrl: 'Link to Payslip',
  }, {
    employeeCode: 'E003',
    fullName: 'John Doe',
    positionName: 'Software Engineer',
    netSalary: "60000",
    status: 'red',
    payslipUrl: 'Link to Payslip',
  },
];

export async function PayrollQuery(param: PayrollParam) : Promise<{content: PayrollRecord[], size:number}> {
  if (USE_SAMPLE_DATA) {
    return { content: SAMPLE_DATA, size: SAMPLE_DATA.length };
  }
  const token = sessionStorage.getItem("scpm.auth.token");
  const queryParams = new URLSearchParams();
  if (param.keyword) queryParams.set('keyword', param.keyword);
  if (param.sortBy) queryParams.set('sortBy', param.sortBy);
  if (param.date) queryParams.set('date', param.date + "-01");
  if (param.page) queryParams.set('page', param.page);
  const requestUrl = `${API_URL}?${queryParams.toString()}`;
  const response = await fetch(requestUrl, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return { content: data.content, size: data.totalPages };
}