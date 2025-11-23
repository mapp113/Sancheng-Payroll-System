import { useContext, useEffect, useState } from "react";
import { fetchTaxLevels, createTaxLevel, updateTaxLevel, deleteTaxLevel } from "./query";
import { TaxLevelListContext, CreateTaxLevelRequest, TaxListResponse } from "./types";
import { Trash } from "lucide-react";
import FormPopBox from "@/app/_components/common/pop-box/form";
import ConfirmPopBox from "@/app/_components/common/pop-box/confirm";
import { useNotification } from "@/app/_components/common/pop-box/notification/notification-context";

export default function TaxLevelComponent() {
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateTaxLevelRequest>({
    name: "",
    fromValue: 0,
    toValue: 0,
    percentage: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const taxLevelsContext = useContext(TaxLevelListContext);
  const { addNotification } = useNotification();
  const [userRole, setUserRole] = useState<string>("");
  
  useEffect(() => {
    fetchTaxLevels(taxLevelsContext, setLoading);
    
    // Get user role from session storage
    const userStr = sessionStorage.getItem("scpm.auth.user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role || "");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "name" ? value : Number(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const success = await createTaxLevel(formData);
      
      if (success) {
        addNotification("ok", "Thành công", "Thêm bậc thuế thành công!");
        // Refresh data
        await fetchTaxLevels(taxLevelsContext, setLoading);
        // Reset form and close
        setFormData({ name: "", fromValue: 0, toValue: 0, percentage: 0 });
        setShowAddForm(false);
      } else {
        addNotification("error", "Lỗi", "Không thể thêm bậc thuế. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error creating tax level:", error);
      addNotification("error", "Lỗi", "Đã xảy ra lỗi khi thêm bậc thuế.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (tax: TaxListResponse) => {
    setEditingId(tax.id);
    setFormData({
      name: tax.name,
      fromValue: tax.fromValue,
      toValue: tax.toValue,
      percentage: tax.percentage,
    });
    setShowEditForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    
    setSubmitting(true);
    try {
      const success = await updateTaxLevel(editingId, formData);
      
      if (success) {
        addNotification("ok", "Thành công", "Cập nhật bậc thuế thành công!");
        // Refresh data
        await fetchTaxLevels(taxLevelsContext, setLoading);
        // Reset form and close
        setFormData({ name: "", fromValue: 0, toValue: 0, percentage: 0 });
        setShowEditForm(false);
        setEditingId(null);
      } else {
        addNotification("error", "Lỗi", "Không thể cập nhật bậc thuế. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error updating tax level:", error);
      addNotification("error", "Lỗi", "Đã xảy ra lỗi khi cập nhật bậc thuế.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    setDeleteTarget({ id, name });
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const success = await deleteTaxLevel(deleteTarget.id);
      
      if (success) {
        addNotification("ok", "Thành công", "Xóa bậc thuế thành công!");
        // Refresh data
        await fetchTaxLevels(taxLevelsContext, setLoading);
      } else {
        addNotification("error", "Lỗi", "Không thể xóa bậc thuế. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error deleting tax level:", error);
      addNotification("error", "Lỗi", "Đã xảy ra lỗi khi xóa bậc thuế.");
    } finally {
      setShowConfirm(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex-1 bg-[#e0f7fa] rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Bậc thuế thu nhập cá nhân</h2>
        {userRole !== "EMPLOYEE" && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-[#81d4fa] rounded-md hover:bg-[#4fc3f7] transition-colors cursor-pointer"
          >
            + Thêm mới
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left font-medium">Bậc</th>
              <th className="px-4 py-3 text-left font-medium">Thu nhập tính thuế từ</th>
              <th className="px-4 py-3 text-left font-medium">Thu nhập tính thuế đến</th>
              <th className="px-4 py-3 text-left font-medium">Thuế suất</th>
              <th className="px-4 py-3 text-left font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : taxLevelsContext?.taxLevels.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              taxLevelsContext?.taxLevels.map((tax, index) => (
                <tr key={tax.id} className="border-b">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{tax.fromValue.toLocaleString()}</td>
                  <td className="px-4 py-3">{tax.toValue.toLocaleString()}</td>
                  <td className="px-4 py-3">{tax.percentage}%</td>
                  <td className="px-4 py-3">
                    {userRole !== "EMPLOYEE" && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(tax)}
                          className="px-3 py-1 bg-[#81d4fa] rounded hover:bg-[#4fc3f7] transition-colors text-sm cursor-pointer"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(tax.id, tax.name)}
                          className="px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        >
                          <Trash />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Tax Level Form */}
      {showAddForm && (
        <FormPopBox>
          <div className="space-y-6 min-w-[500px]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#CCE1F0] pb-4">
              <h2 className="text-2xl font-bold text-[#1D3E6A]">Thêm Bậc Thuế Mới</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="rounded-full p-2 text-[#56749A] hover:bg-[#E6F7FF] transition cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1D3E6A]">Tên bậc thuế</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-[#CCE1F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81d4fa]"
                  placeholder="Nhập tên bậc thuế"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1D3E6A]">Thu nhập tính thuế từ</label>
                <input
                  type="number"
                  name="fromValue"
                  value={formData.fromValue}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-[#CCE1F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81d4fa]"
                  placeholder="Nhập giá trị từ"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1D3E6A]">Thu nhập tính thuế đến</label>
                <input
                  type="number"
                  name="toValue"
                  value={formData.toValue}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-[#CCE1F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81d4fa]"
                  placeholder="Nhập giá trị đến"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1D3E6A]">Thuế suất (%)</label>
                <input
                  type="number"
                  name="percentage"
                  value={formData.percentage}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-4 py-2 border border-[#CCE1F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81d4fa]"
                  placeholder="Nhập thuế suất"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-[#CCE1F0] text-[#56749A] rounded-lg hover:bg-[#F4FBFF] transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-[#81d4fa] text-white rounded-lg hover:bg-[#4fc3f7] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Đang thêm..." : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </FormPopBox>
      )}

      {/* Edit Tax Level Form */}
      {showEditForm && (
        <FormPopBox>
          <div className="space-y-6 min-w-[500px]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#CCE1F0] pb-4">
              <h2 className="text-2xl font-bold text-[#1D3E6A]">Chỉnh Sửa Bậc Thuế</h2>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditingId(null);
                  setFormData({ name: "", fromValue: 0, toValue: 0, percentage: 0 });
                }}
                className="rounded-full p-2 text-[#56749A] hover:bg-[#E6F7FF] transition cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1D3E6A]">Tên bậc thuế</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-[#CCE1F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81d4fa]"
                  placeholder="Nhập tên bậc thuế"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1D3E6A]">Thu nhập tính thuế từ</label>
                <input
                  type="number"
                  name="fromValue"
                  value={formData.fromValue}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-[#CCE1F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81d4fa]"
                  placeholder="Nhập giá trị từ"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1D3E6A]">Thu nhập tính thuế đến</label>
                <input
                  type="number"
                  name="toValue"
                  value={formData.toValue}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-[#CCE1F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81d4fa]"
                  placeholder="Nhập giá trị đến"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1D3E6A]">Thuế suất (%)</label>
                <input
                  type="number"
                  name="percentage"
                  value={formData.percentage}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-4 py-2 border border-[#CCE1F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81d4fa]"
                  placeholder="Nhập thuế suất"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingId(null);
                    setFormData({ name: "", fromValue: 0, toValue: 0, percentage: 0 });
                  }}
                  className="flex-1 px-4 py-2 border border-[#CCE1F0] text-[#56749A] rounded-lg hover:bg-[#F4FBFF] transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-[#81d4fa] text-white rounded-lg hover:bg-[#4fc3f7] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </FormPopBox>
      )}

      {/* Confirm Delete Dialog */}
      {showConfirm && deleteTarget && (
        <ConfirmPopBox
          title="Xác nhận xóa"
          message={`Bạn có chắc chắn muốn xóa bậc thuế "${deleteTarget.name}" không?`}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowConfirm(false);
            setDeleteTarget(null);
          }}
          confirmText="Xóa"
          cancelText="Hủy"
        />
      )}
    </div>
  );
}