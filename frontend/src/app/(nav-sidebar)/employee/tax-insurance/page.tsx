"use client";

import {  useState } from "react";
import { InsuranceListContext, InsuranceListResponse, TaxLevelListContext, TaxListResponse } from "@/app/_components/employee/tax-insurance/types";
import TaxLevelComponent from "@/app/_components/employee/tax-insurance/tax";
import InsuranceComponent from "@/app/_components/employee/tax-insurance/insurance";

export default function TaxInsurancePage() {
  const [taxLevels, setTaxLevels] = useState<TaxListResponse[]>([]);
  const [insurancePolicies, setInsurancePolicies] = useState<InsuranceListResponse[]>([]);

  return (
    <div className="w-full h-full p-6">
      <div className="w-full p-5 bg-[#c6f3fd] text-2xl font-bold mb-6">
        Thông tin về Thuế và Bảo Hiểm
      </div>

      <div className="flex gap-6">
        {/* Bảng Thuế */}
        <TaxLevelListContext.Provider value={{ taxLevels, setTaxLevels }}>
          <TaxLevelComponent />
        </TaxLevelListContext.Provider>

        {/* Bảng Bảo hiểm */}
        <InsuranceListContext.Provider value={{ insurancePolicies, setInsurancePolicies }}>
          <InsuranceComponent />
        </InsuranceListContext.Provider>
      </div>
    </div>
  );
}