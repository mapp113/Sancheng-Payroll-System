
import Sidebar from "../../_components/navigation-sidebar";

export default function PayrollLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      <div className="w-20">
        <Sidebar select={4} />
      </div>
      <main className="flex-1 overflow-hidden p-4">
        {children}
      </main>
    </div>
  );
}