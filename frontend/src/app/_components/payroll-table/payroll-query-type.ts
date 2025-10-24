import { Dispatch, SetStateAction } from "react";

export interface payrollQuery{
  filter: [string, Dispatch<SetStateAction<string>>],
  search: [string, Dispatch<SetStateAction<string>>],
  date: [string, Dispatch<SetStateAction<string>>],
  index: [string, Dispatch<SetStateAction<string>>]
}

export interface payrollParam{
  date: string,
  page: string,
  size: string,
  sortBy: string,
  sortOrder: string,
  keyword: string
}