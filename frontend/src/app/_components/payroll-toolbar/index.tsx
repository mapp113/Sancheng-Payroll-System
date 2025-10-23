"use client"

import { CloudUpload, Search } from "lucide-react";
import FilterOption from "./filter-option";

const backButtonHandler = () => {
  alert("Back")
}

const exportButtonHandler = () => {
  alert("Export")
}

export default function PayrollToolbar() {
  return (
    <div className="flex items-end border-b border-black p-2">
      <button
        id="payroll-toolbar-back-button"
        className="mr-15 py-3 px-5 border rounded-sm text-xs border-black bg-[#89CDFE] text-[#345EA8] hover:bg-[#77b2dd] transition-all cursor-pointer"
        onClick={backButtonHandler}
      >
        BACK
      </button>

      <div className="flex items-center p-1 mr-15 border border-black rounded-xl">
        <Search className="inline mr-1" />
        <input
          id="payroll-toolbar-search-input"
          className="inline focus:outline-0"
          placeholder="Search"
        />
      </div>

      <FilterOption />

      {/* Đưa nhóm bên phải */}
      <div className="flex items-center gap-2 ml-auto">
        <div className="flex items-center p-1 border border-black rounded-lg">
          <input type="month" className="focus:outline-0" />
        </div>
        <button
          id="payroll-toolbar-export-button"
          className="p-2 rounded-md bg-[#7ADFEA] hover:bg-[#70ccd6] active:shadow-inner shadow-[0,0,0,0] transition-all flex items-center cursor-pointer"
          onClick={exportButtonHandler}
        >
          <CloudUpload className="inline mr-1" />
          Export
        </button>
      </div>
    </div>
  );
}