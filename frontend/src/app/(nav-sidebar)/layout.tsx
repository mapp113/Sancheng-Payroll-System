import Navbar from "../_components/navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="h-16">
        <Navbar />
      </div>
      {children}
    </div>
  );
}

