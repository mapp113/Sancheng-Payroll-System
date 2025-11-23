import { createContext } from "react";
import { ManagerTimeSheetDetailParam } from "./types";

export const TimesheetDetailParam = createContext<ManagerTimeSheetDetailParam|null>(null);