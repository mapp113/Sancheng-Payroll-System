import LegalPolicyTable from "@/app/_components/hr/allowance-policy/legal-policy/legal-policy-table";
import AllowanceTable from "@/app/_components/hr/allowance-policy/allowance/allowance-table";

export default function AllowancePolicyPage() {
  return (
    <div className="flex h-full flex-col gap-4 bg-[#F8FAFC] p-4 md:p-6">
      <header className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Quản Lí Chính Sách Trợ Cấp</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        <section className="flex-1 overflow-hidden rounded-2xl bg-white p-4 shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Chính sách pháp lí</h2>
          <div className="flex-1 overflow-hidden">
            <LegalPolicyTable />
          </div>
        </section>

        <section className="flex-1 overflow-hidden rounded-2xl bg-white p-4 shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Các loại khoản trợ cấp</h2>
          <div className="flex-1 overflow-hidden">
            <AllowanceTable />
          </div>
        </section>
      </div>
    </div>
  )
}