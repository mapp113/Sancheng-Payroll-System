"use client";

import {  useState } from "react";
import { InsuranceListContext, InsuranceListResponse, TaxLevelListContext, TaxListResponse } from "@/app/_components/employee/tax-insurance/types";
import TaxLevelComponent from "@/app/_components/employee/tax-insurance/tax";
import InsuranceComponent from "@/app/_components/employee/tax-insurance/insurance";

export default function TaxInsurancePage() {
  const [taxLevels, setTaxLevels] = useState<TaxListResponse[]>([]);
  const [insurancePolicies, setInsurancePolicies] = useState<InsuranceListResponse[]>([]);

  return (
    <div className="flex h-full flex-col gap-4 bg-[#F8FAFC] p-4 md:p-6">
      <header className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Thông Tin Về Thuế Và Bảo Hiểm</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4">
        {/* Bảng Thuế */}
        <section className="flex-1 rounded-2xl bg-white p-4 shadow-sm flex flex-col">
          <TaxLevelListContext.Provider value={{ taxLevels, setTaxLevels }}>
            <TaxLevelComponent />
          </TaxLevelListContext.Provider>
        </section>

        {/* Bảng Bảo hiểm */}
        <section className="flex-1 rounded-2xl bg-white p-4 shadow-sm flex flex-col">
          <InsuranceListContext.Provider value={{ insurancePolicies, setInsurancePolicies }}>
            <InsuranceComponent />
          </InsuranceListContext.Provider>
        </section>
      </div>
    </div>
  );
}