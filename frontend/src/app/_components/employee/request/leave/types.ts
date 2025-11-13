export interface RequestLeaveData {
  employeeCode: string;
  fromDate: string;
  toDate: string;
  leaveType: string;
  duration: string;
  isPaidLeave: boolean;
  reason: string;
  attachment?: File | null;
}