"use client";
import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { Funnel } from "lucide-react";

export default function FilterOption({ filter, onReload }: { filter: [string, Dispatch<SetStateAction<string>>]} & { onReload: () => void } ) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("ID");
  const panelRef = useRef<HTMLDivElement>(null);

  // Đóng khi click ra ngoài hoặc nhấn ESC
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleSelect = (value: string) => {
    setSelected(value);
    setOpen(false);
    filter[1](value);
    onReload();
  };

  return (
    <div className="relative inline-block">
      <button
        id="payroll-toolbar-filter-button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center p-1 border border-black rounded-sm text-sm cursor-pointer bg-white hover:bg-gray-100"
      >
        <Funnel className="inline mr-1 h-4 w-4" />
        {selected ? `Filter by: ${selected}` : "Filters"}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute left-0 mt-2 w-44 rounded-md border border-gray-400 bg-white shadow-md z-50 p-3"
        >
          <p className="text-sm font-medium mb-2">Filter by:</p>
          <div className="space-y-2 text-sm">
            {["ID", "Name", "Position", "Salary"].map((item) => (
              <label key={item} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="filter" value={item}
                  checked={selected === item}
                  onChange={() => handleSelect(item)} />
                {item}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
