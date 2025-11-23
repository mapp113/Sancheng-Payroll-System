export interface TimesheetParam {
  keyword: string;
  date: string;
  index: string;
  totalPages: string;
};

export type TimesheetRecord = {
  employeeCode: string;
  fullName: string;
  positionName: string;
  daysHours: string;
  otHours: string;
  timeOff: string;
  usedleave: string;
};

export type TimesheetParamsContextType = {
  timesheetParams: TimesheetParam;
  setTimesheetParams: React.Dispatch<React.SetStateAction<TimesheetParam>>;
};

export type TimesheetDataContextType = {
  timesheetData: TimesheetRecord[];
  setTimesheetData: React.Dispatch<React.SetStateAction<TimesheetRecord[]>>;
};

export type CreateDraftParamContextType = {
  createDraftParams: CreateDraftParams | null;
  setCreateDraftParams: React.Dispatch<React.SetStateAction<CreateDraftParams | null>>;
};

export interface CreateDraftParams {
  employeeCode: string[];
  date: string;
}