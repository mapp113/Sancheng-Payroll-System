import { createContext } from "react";
import type { PayrollContextType, PayrollDataContextType } from "./type";

export const ParamsContext = createContext<PayrollContextType | null>(null);
export const DataContext = createContext<PayrollDataContextType | null>(null);