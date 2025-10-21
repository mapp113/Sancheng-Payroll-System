"use client";

import { useEffect, useMemo, useState } from "react";
import Pagination from "./pagination";
import PayrollHeader from "./table-header";
import PayrollBody from "./table-body";
import type { PayrollRow } from "./table-item";

// ===== CẤU HÌNH =====
const PAGE_SIZE = 5;
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

export default function PayrollPage() {
  const [rows, setRows] = useState<PayrollRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Fetch chỉ ở đây
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        // Thay endpoint theo API thật của bạn
        const res = await fetch("/api/payroll", { signal: ac.signal, cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data = (json?.data ?? []) as PayrollRow[];
        setRows(data);
      } catch {
        setRows(USE_SAMPLE_ON_ERROR ? sample : []);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  // Giới hạn trang hợp lệ khi dữ liệu đổi
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
        <Pagination currentPage={page} totalPages={totalPages} onPageChangeAction={(p: number) => setPage(p)} />
      )}
    </div>
  );
}
