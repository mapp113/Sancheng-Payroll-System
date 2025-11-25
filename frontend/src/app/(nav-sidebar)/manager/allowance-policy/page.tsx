import LegalPolicyTable from "@/app/_components/hr/allowance-policy/legal-policy/legal-policy-table";
import AllowanceTable from "@/app/_components/hr/allowance-policy/allowance/allowance-table";

export default function AllowancePolicyPage() {
  return (
    <div className="w-full h-full p-6">
      <h1 className="w-full px-10 py-5 text-2xl font-bold mb-4 bg-[#c0f2fd] rounded-2xl">Quản lí chính sách trợ cấp</h1>
      <div className="">
        <h2 className="text-xl font-semibold mb-2">Chính sách pháp lí</h2>
        <div className="w-full h-[30dvh] bg-[#d5f1f5] rounded-2xl">
          <LegalPolicyTable />
        </div>
      </div>
      <div className="">
        <div className="flex flex-row justify-between items-center mb-2">
          <h2 className="text-xl font-semibold mb-2">Các loại khoản trợ cấp</h2>
          <button className="bg-[#89cdfe] hover:bg-[#63ade3] text-blue-900 border border-blue-900 rounded-lg p-2 mr-4 cursor-pointer">+ Thêm trợ cấp, khoản mới</button>
        </div>
        <div className="w-full h-[30dvh] bg-[#d5f1f5] rounded-2xl">
          <AllowanceTable />
        </div>
      </div>
    </div>
  )
}