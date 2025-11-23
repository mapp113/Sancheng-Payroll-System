import { createContext } from "react";


// Tax
export interface TaxListResponse {
  id: number;
  name: string;
  fromValue: number;
  toValue: number;
  percentage: number;
}

export interface CreateTaxLevelRequest {
  name: string;
  fromValue: number;
  toValue: number;
  percentage: number;
}

export interface TaxLevelListContextType {
  taxLevels: TaxListResponse[];
  setTaxLevels: React.Dispatch<React.SetStateAction<TaxListResponse[]>>;
}

export const TaxLevelListContext = createContext<TaxLevelListContextType | undefined>(undefined);


// Insurance
export interface InsuranceListResponse {
  insurancePolicyId: number;
  insurancePolicyName: string;
  employeePercentage: number;
  companyPercentage: number;
  maxAmount: number;
}

export interface CreateInsurancePolicyRequest {
  insurancePolicyName: string;
  employeePercentage: number;
  companyPercentage: number;
  maxAmount: number;
}

export interface InsuranceListContextType {
  insurancePolicies: InsuranceListResponse[];
  setInsurancePolicies: React.Dispatch<React.SetStateAction<InsuranceListResponse[]>>;
}

export const InsuranceListContext = createContext<InsuranceListContextType | undefined>(undefined);