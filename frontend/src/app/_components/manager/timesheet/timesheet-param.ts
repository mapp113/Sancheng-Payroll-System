export interface timesheetQuery {
  keyword: [string, React.Dispatch<React.SetStateAction<string>>];
  date: [string, React.Dispatch<React.SetStateAction<string>>];
  index: [string, React.Dispatch<React.SetStateAction<string>>];
}

export type hoursWorked = {
  totalTime: number;
  overTime: number;
}

export type TimesheetRow = {
  id: string;
  name: string;
  position: string;
  hoursWorked: hoursWorked;
  timeOff: string;
  note: string;
};