"use client";

import { useEffect, useState } from "react";
import type { LegalPolicyResponse } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:8080";

export default function LegalPolicyTable() {
  const [policies, setPolicies] = useState<LegalPolicyResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLegalPolicies() {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${API_BASE_URL}/api/legal-policy`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch legal policies");
        }

        const data = await response.json();
        setPolicies(data);
      } catch (error) {
        console.error("Error fetching legal policies:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLegalPolicies();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto rounded-2xl">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-[#F8FAFC] z-10">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#1D3E6A] border-b-2 border-[#8dd5ea]">
              Mã chính sách
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#1D3E6A] border-b-2 border-[#8dd5ea]">
              Chi tiết
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#1D3E6A] border-b-2 border-[#8dd5ea]">
              Quy tắc tính
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-[#1D3E6A] border-b-2 border-[#8dd5ea]">
              Số lượng
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-[#1D3E6A] border-b-2 border-[#8dd5ea]">
              Giá trị phần trăm
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#1D3E6A] border-b-2 border-[#8dd5ea]">
              Ngày bắt đầu
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#1D3E6A] border-b-2 border-[#8dd5ea]">
              Ngày kết thúc
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#b8e9f7]">
          {policies.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            policies.map((policy, index) => (
              <tr
                key={policy.id}
                className={index % 2 === 0 ? "bg-white" : "bg-[#ebf9fc]"}
              >
                <td className="px-4 py-3 text-sm text-[#1D3E6A] font-medium">
                  {policy.code}
                </td>
                <td className="px-4 py-3 text-sm text-[#1D3E6A]">
                  {policy.description}
                </td>
                <td className="px-4 py-3 text-sm text-[#1D3E6A]">
                  {policy.calculationType}
                </td>
                <td className="px-4 py-3 text-sm text-end text-[#1D3E6A]">
                  {policy.amount ? policy.amount.toLocaleString() : "--"}
                </td>
                <td className="px-4 py-3 text-sm text-[#1D3E6A] text-right">
                  {policy.percent ? policy.percent + "%" : "--"}
                </td>
                <td className="px-4 py-3 text-sm text-[#1D3E6A]">
                  {policy.effectiveFrom}
                </td>
                <td className="px-4 py-3 text-sm text-center text-[#1D3E6A]">
                  {policy.effectiveTo || "--"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}