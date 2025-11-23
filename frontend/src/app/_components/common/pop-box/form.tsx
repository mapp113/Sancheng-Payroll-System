export default function FormPopBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full fixed flex justify-center items-start top-0 left-0 bg-black/30 z-50 pt-20">
      <div className="h-fit max-h-6/7 w-fit max-w-2/3 p-4 bg-white rounded-2xl shadow-lg overflow-y-auto">
        {children}
      </div>
    </div>
  );
}