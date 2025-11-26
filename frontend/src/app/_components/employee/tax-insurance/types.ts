import { createContext } from "react";


// Tax
export interface TaxListResponse {
  id: number;
  name: string;
  fromValue: number;
  toValue: number;
  percentage: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  active: boolean;
}

export interface CreateTaxLevelRequest {
  name: string;
  fromValue: number;
  toValue: number;
  percentage: number;
  effectiveFrom?: string;
  effectiveTo?: string;
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
  effectiveFrom?: string;
  effectiveTo?: string;
  active?: boolean;
}

export interface CreateInsurancePolicyRequest {
  insurancePolicyName: string;
  employeePercentage: number;
  companyPercentage: number;
  maxAmount: number;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface InsuranceListContextType {
  insurancePolicies: InsuranceListResponse[];
  setInsurancePolicies: React.Dispatch<React.SetStateAction<InsuranceListResponse[]>>;
}

export const InsuranceListContext = createContext<InsuranceListContextType | undefined>(undefined);