"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Pagination from "./pagination";
import PayrollHeader from "./table-header";
import PayrollBody from "./table-body";
import type { PayrollRow } from "./table-item";
import { payrollQuery, payrollParam } from "./payroll-query-type";

// ===== CẤU HÌNH =====
export const PAGE_SIZE = 5;
// Bật/tắt fallback dữ liệu mẫu khi fetch lỗi
const USE_SAMPLE_ON_ERROR = true;

// ===== DỮ LIỆU MẪU =====
const sample: PayrollRow[] = [
  { id: "SC-111", name: "Tran Van B",   position: "Admin",      salary: 1000, status: "yellow" },
  { id: "SC-101", name: "Nguyen Ngoc A",position: "HR",         salary: 1024, status: "green"  },
  { id: "SC-102", name: "Tran Thi C",   position: "Employee",   salary: 1000, status: "yellow" },
  { id: "SC-201", name: "Nguyen Vu A",  position: "Employee",   salary: 1000, status: "green"  },
  { id: "SC-200", name: "Do Van B",     position: "Accounting", salary: 1000, status: "red"    },
];

export async function fetchPayrollData(
  arg1?: payrollParam | AbortSignal,
  arg2?: AbortSignal
): Promise<PayrollRow[]> {
  // allow backwards-compatible call: fetchPayrollData(signal)
  const isAbortSignal = (v: unknown): v is AbortSignal => {
    return (
      typeof v === "object" &&
      v !== null &&
      "aborted" in v &&
      typeof (v as { aborted?: unknown }).aborted === "boolean"
    );
  };

  const params = isAbortSignal(arg1) ? undefined : (arg1 as payrollParam | undefined);
  const signal = isAbortSignal(arg1) ? arg1 : arg2;

  try {
    const qs = new URLSearchParams();
    if (params) {
      if (params.sortBy != null && params.sortBy !== "") qs.append("sortBy", String(params.sortBy));
      if (params.date != null && params.date !== "") qs.append("date", String(params.date));
      if (params.keyword != null && params.keyword !== "") qs.append("keyword", String(params.keyword));
      if (params.page != null && params.page !== "") qs.append("index", String(params.page));
    }

    const url = "/api/payroll" + (qs.toString() ? `?${qs.toString()}` : "");
    console.log(url);
    const res = await fetch(url, { signal, cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return (json?.data ?? []) as PayrollRow[];
  } catch {
    return USE_SAMPLE_ON_ERROR ? sample : [];
  }
}

export default function PayrollPage({ filter, date, search, index, reloadFlag }: payrollQuery & { reloadFlag: number }) {
  const [rows, setRows] = useState<PayrollRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [, setPageIndex] = index; // Extract the setter from index prop

  // Gom tham số build một lần theo props
  const buildParams = useCallback(() => ({
  sortBy: filter[0],
  date: date?.[0],
  keyword: search[0],
  page: (index?.[0] ?? "1"),
  size: PAGE_SIZE.toString(),
  sortOrder: "asc",
}), [filter, date, search, index]);

  // === TÍNH NĂNG BỔ SUNG: reload ===
  const reload = useCallback(async (signal?: AbortSignal) => {
  setLoading(true);
  try {
      const data = await fetchPayrollData(buildParams(), signal);
      return setRows(data);
    } finally {
      return setLoading(false);
    }
}, [buildParams]);

  // Tự fetch mỗi khi bộ lọc thay đổi
  useEffect(() => {
    const ac = new AbortController();
    reload(ac.signal);
    return () => ac.abort();
  }, [reload, reloadFlag]);

  // Reset về trang 1 khi query thay đổi
  useEffect(() => {
    setPage(1);
  }, [filter, date, search, index]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageRows = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page]
  );

  return (
    <div className="h-full w-full border border-black rounded-lg mt-7 p-4">
      <h1 className="text-2xl font-semibold mb-5">Employees Payroll</h1>

      {/* Nút reload thủ công */}
      <button
        className="mb-3 rounded border px-3 py-1 text-sm hidden"
        onClick={() => reload()}
        disabled={loading}
      >
        {loading ? "Loading…" : "Reload"}
      </button>

      <div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-[12%]" />
            <col className="w-[22%]" />
            <col className="w-[18%]" />
            <col className="w-[12%]" />
            <col className="w-[10%]" />
            <col className="w-[18%]" />
            <col className="w-[8%]" />
          </colgroup>

          <PayrollHeader />

          {loading ? (
            <tbody>
              <tr>
                <td colSpan={7} className="px-4 py-6 text-sm text-gray-500">Loading…</td>
              </tr>
            </tbody>
          ) : rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={7} className="px-4 py-6 text-sm text-gray-500 text-center">No result</td>
              </tr>
            </tbody>
          ) : (
            <PayrollBody rows={pageRows} />
          )}
        </table>
      </div>

      {!loading && rows.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChangeAction={(p: number) => {
            setPage(p);
            setPageIndex(p.toString()); // Update the page state in parent component
          }}
        />
      )}
    </div>
  );
}
