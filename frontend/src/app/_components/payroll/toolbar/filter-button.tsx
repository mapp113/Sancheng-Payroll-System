"use client";

import { useContext, useState, useRef, useEffect } from "react";
import { Funnel } from "lucide-react";
import { DataContext, ParamsContext } from "../payroll-context";
import { PayrollQuery } from "../query";

const OPTIONS = [
  { value: "id", label: "Employee Code" },
  { value: "fullName", label: "Name" },
  { value: "positionName", label: "Position" },
  { value: "netSalary", label: "Salary" },
];

export default function FilterButton() {
  const params = useContext(ParamsContext)!;
  const payrollData = useContext(DataContext)!;

  const [open, setOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // đóng popup khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // đổi option filter
  function selectFilter(value: string) {
    // cập nhật context params
    params.setPayrollParams({
      ...params.payrollParams,
      sortBy: value,
      page: "0",
    });
    const newParams = {
      ...params.payrollParams,
      sortBy: value,
    };


    PayrollQuery(newParams).then((data) => {
      payrollData.setPayrollData(data.content);
    });

    setOpen(false);
  }

  return (
    <div className="relative inline-block" ref={wrapperRef}>
      {/* button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 border border-black rounded-sm px-2 py-1 cursor-pointer select-none bg-white text-sm leading-none"
      >
        <Funnel className="inline-block w-4 h-4" />
        <span>Filters</span>
      </button>

      {/* dropdown panel */}
      {open && (
        <div
          className="
            absolute top-full left-0 mt-1
            w-36
            rounded-sm border border-black bg-white shadow
            text-sm text-black
            z-50
          "
        >
          <ul className="p-2 space-y-2">
            {OPTIONS.map((opt) => (
              <li key={opt.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="filter-field"
                  className="cursor-pointer"
                  checked={params.payrollParams.sortBy === opt.value}
                  onChange={() => selectFilter(opt.value)}
                />
                <span className="cursor-pointer select-none">{opt.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
