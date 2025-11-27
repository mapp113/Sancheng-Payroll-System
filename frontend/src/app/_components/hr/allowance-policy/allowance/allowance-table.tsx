"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { allowanceTypeResponse } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export default function AllowanceTable() {
  const [allowances, setAllowances] = useState<allowanceTypeResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllowances() {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${API_BASE_URL}/api/config/pay-component-type`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch allowances");
        }

        const data = await response.json();
        setAllowances(data);
      } catch (error) {
        console.error("Error fetching allowances:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAllowances();
  }, []);

  const handleEdit = (id: number) => {
    // TODO: Implement edit functionality
    console.log("Edit allowance:", id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa khoản trợ cấp này?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/config/pay-component-type/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete allowance");
      }

      // Refresh the list after deletion
      setAllowances(allowances.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error deleting allowance:", error);
      alert("Không thể xóa khoản trợ cấp này");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto rounded-2xl">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-[#b8e9f7] z-10">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#1D3E6A] border-b-2 border-[#8dd5ea]">
              Tên
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#1D3E6A] border-b-2 border-[#8dd5ea]">
              Chi tiết
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-[#1D3E6A] border-b-2 border-[#8dd5ea]">
              Tính thuế TNCN
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-[#1D3E6A] border-b-2 border-[#8dd5ea]">
              Tính BHXH
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#1D3E6A] border-b-2 border-[#8dd5ea]">
              Cách tính thuế
            </th>
            {/* <th className="px-4 py-3 text-center text-sm font-semibold text-[#1D3E6A] border-b-2 border-[#8dd5ea]">
              Thao tác
            </th> */}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#b8e9f7]">
          {allowances.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            allowances.map((allowance, index) => (
              <tr
                key={allowance.id}
                className={index % 2 === 0 ? "bg-white" : "bg-[#ebf9fc]"}
              >
                <td className="px-4 py-3 text-sm text-[#1D3E6A] font-medium">
                  {allowance.name}
                </td>
                <td className="px-4 py-3 text-sm text-[#1D3E6A]">
                  {allowance.description}
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    allowance.isTaxed 
                      ? "bg-green-100 text-green-700" 
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {allowance.isTaxed ? "Có" : "Không"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    allowance.isInsured 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {allowance.isInsured ? "Có" : "Không"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[#1D3E6A]">
                  {allowance.taxTreatmentCode || "-"}
                </td>
                {/* <td className="px-4 py-3 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(allowance.id)}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                      title="Chỉnh sửa"
                    >
                      <Pencil className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(allowance.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </td> */}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}