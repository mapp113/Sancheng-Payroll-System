export interface LeaveResponseData {
  id: string;
  employeeCode: string;
  fromDate: string;
  toDate: string;
  leaveTypeCode: string;
  status: string;
  note?: string;
}

export interface LeaveDetailResponse {
  id: string;
  employeeCode: string;
  fullName: string;
  fromDate: string;
  toDate: string;
  leaveTypeCode: string;
  status: string;
  file?: string;
  reason: string;
  note?: string;
  duration: string;
  isPaidLeave: boolean;
  approvalDate?: string;
}

export interface ListOTResponseData {
  stt: number;
}