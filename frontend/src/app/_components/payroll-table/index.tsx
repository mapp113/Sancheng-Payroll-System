import TableHeader from "./table-header";
import TableBody from "./table-body";
import Pagination from "./pagination";


export default function PayrollPage() {
  
  return (
    <div>
      {/* TODO: Làm khung tròn */}
      <h1>Employee Payroll</h1>
      <TableHeader />
      <TableBody />
      <Pagination />
    </div>
  );
}