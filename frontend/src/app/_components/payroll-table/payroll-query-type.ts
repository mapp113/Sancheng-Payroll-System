import { Dispatch, SetStateAction } from "react";

export interface payrollQuery{
  filter: [string, Dispatch<SetStateAction<string>>],
  search: [string, Dispatch<SetStateAction<string>>],
  date: [string, Dispatch<SetStateAction<string>>]
}