import PayrollTable from "@/app/_components/payroll-table";
import PayrollToolbar from "@/app/_components/payroll-toolbar";

export default function payrollPage() {
  
  return (
    <>
      <PayrollToolbar />
      <PayrollTable />
    </>
  );
}