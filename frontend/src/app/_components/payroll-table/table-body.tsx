import PayrollItem, { PayrollRow } from "./table-item";

export default function PayrollBody({ rows }: { rows: PayrollRow[] }) {
  return (
    <tbody className="">
      {rows.map((r) => (
        <PayrollItem key={r.id} row={r} />
      ))}
    </tbody>
  );
}