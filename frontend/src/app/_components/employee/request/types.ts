export interface ListLeaveResponseData {
  employeeCode: string;
  fromDate: string;
  toDate: string;
  leaveType: string;
  duration: string;
  isPaidLeave: boolean;
  reason: string;
}

export interface ListOTResponseData {
  stt: number;
}