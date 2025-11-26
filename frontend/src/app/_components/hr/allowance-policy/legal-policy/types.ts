export interface LegalPolicyResponse {
  id: number;
  code: string;
  description: string;
  calculationType: string;
  applyScope: string;
  amount: number;
  percent: number;
  effectiveFrom: string;
  effectiveTo: string;
}