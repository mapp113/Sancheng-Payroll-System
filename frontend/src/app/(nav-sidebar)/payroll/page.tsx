import PayrollTable from "@/app/_components/payroll-table";
import PayrollToolbar from "@/app/_components/payroll-toolbar";

export default function payrollPage() {
  return (
    <div className="flex flex-col h-full p-3 box-border">
      <PayrollToolbar />
      <div className="flex-1 mt-2">
        {/* Vùng bảng chiếm hết phần còn lại, không cuộn */}
        <section className="h-full rounded-xl flex flex-col justify-between">
          <PayrollTable />
        </section>
      </div>
    </div>
  );
}
