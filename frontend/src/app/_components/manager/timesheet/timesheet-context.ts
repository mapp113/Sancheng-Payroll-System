import { createContext } from "react";
import type { TimesheetParamsContextType, TimesheetDataContextType, CreateDraftParamContextType } from "./type";

export const ParamsContext = createContext<TimesheetParamsContextType | null>(null);
export const DataContext = createContext<TimesheetDataContextType | null>(null);
export const CreateDraftParamContext = createContext<CreateDraftParamContextType | null>(null);