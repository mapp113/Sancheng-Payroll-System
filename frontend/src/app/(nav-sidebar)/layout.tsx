import Navbar from "../_components/navbar";
import Sidebar from "../_components/navigation-sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="h-16">
        <Navbar />
      </div>
      <div className="flex flex-1">
        <div className="w-20">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

