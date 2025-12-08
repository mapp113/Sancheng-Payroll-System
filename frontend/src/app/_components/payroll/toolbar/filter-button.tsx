"use client";

import { useContext, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Funnel } from "lucide-react";
import { DataContext, ParamsContext } from "../payroll-context";
import { PayrollQuery } from "../query";

const OPTIONS = [
  { value: "id", label: "Mã nhân viên" },
  { value: "fullName", label: "Tên" },
  { value: "positionName", label: "Chức vụ" },
  { value: "netSalary", label: "Lương" },
];

export default function FilterButton() {
  const params = useContext(ParamsContext)!;
  const payrollData = useContext(DataContext)!;

  const [open, setOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

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

  // cập nhật vị trí button khi mở dropdown
  useEffect(() => {
    if (open && buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
  }, [open]);

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
    <>
      <div className="relative inline-block" ref={wrapperRef}>
        {/* button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full border border-[#E2E8F0] px-4 py-2 cursor-pointer select-none bg-white text-sm hover:border-[#4AB4DE] transition-colors"
        >
          <Funnel className="inline-block w-4 h-4" />
          <span>Lọc</span>
        </button>
      </div>

      {/* dropdown panel - rendered via portal */}
      {open && buttonRect && createPortal(
        <div
          style={{
            position: 'fixed',
            top: `${buttonRect.bottom + 8}px`,
            left: `${buttonRect.left}px`,
          }}
          className="w-40 rounded-lg border border-[#E2E8F0] bg-white shadow-lg text-sm text-gray-700 z-[100]"
        >
          <ul className="p-2 space-y-1">
            {OPTIONS.map((opt) => (
              <li key={opt.value} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[#F1F5F9] cursor-pointer" onClick={() => selectFilter(opt.value)}>
                <input
                  type="radio"
                  name="filter-field"
                  className="cursor-pointer accent-[#4AB4DE]"
                  checked={params.payrollParams.sortBy === opt.value}
                  onChange={() => selectFilter(opt.value)}
                />
                <span className="cursor-pointer select-none">{opt.label}</span>
              </li>
            ))}
          </ul>
        </div>,
        document.body
      )}
    </>
  );
}
