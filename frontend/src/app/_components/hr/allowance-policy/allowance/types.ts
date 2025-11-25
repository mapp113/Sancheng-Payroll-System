export interface allowanceTypeResponse {
  id: number;
  name: string;
  description: string;
  isFixed: boolean;
  isTaxed: boolean;
  isInsured: boolean;
  taxTreatmentCode: string;
  policyCode: string;
}

export interface allowanceTypeRequest {
  name: string;
  description: string;
  isTaxed: boolean;
  isInsured: boolean;
  taxTreatmentCode: string;
  policyCode: string;
}