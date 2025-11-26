export interface OvertimeSummaryResponse {
  employeeCode: string;
  employeeName: string;
  year: number;
  totalOvertime: number;
  monthly: { month: number; hours: number }[];
}