import { useContext, useEffect, useState } from "react";
import { InsuranceListContext, CreateInsurancePolicyRequest, InsuranceListResponse } from "./types";
import { fetchInsurancePolicies, createInsurancePolicy, updateInsurancePolicy, deleteInsurancePolicy } from "./query";
import { Trash } from "lucide-react";
import FormPopBox from "@/app/_components/common/pop-box/form";
import ConfirmPopBox from "@/app/_components/common/pop-box/confirm";
import { useNotification } from "@/app/_components/common/pop-box/notification/notification-context";
import { formatSalary, parseSalary, handleSalaryInput } from "@/app/_components/utils/formatSalary";

export default function InsuranceComponent() {
  const context = useContext(InsuranceListContext);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateInsurancePolicyRequest>({
    insurancePolicyName: "",
    employeePercentage: 0,
    companyPercentage: 0,
    maxAmount: "" as unknown as number,
    effectiveFrom: "",
    effectiveTo: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { addNotification } = useNotification();
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    fetchInsurancePolicies(context, setLoading);
    
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
    
    if (name === "maxAmount") {
      const formattedValue = handleSalaryInput(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue,
      } as unknown as typeof prev));
    } else if (name === "employeePercentage" || name === "companyPercentage") {
      setFormData(prev => ({
        ...prev,
        [name]: Number(value),
      } as unknown as typeof prev));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      } as unknown as typeof prev));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // effectiveFrom is required
    if (!formData.effectiveFrom) {
      addNotification("error", "Lỗi", "Vui lòng chọn Ngày hiệu lực (From date)", 4000);
      setSubmitting(false);
      return;
    }
    
    try {
      const payload = {
        ...formData,
        maxAmount: Number(parseSalary(String(formData.maxAmount))),
      };
      const success = await createInsurancePolicy(payload);
      
      if (success) {
        addNotification("ok", "Thành công", "Thêm bảo hiểm thành công!");
        // Refresh data
        await fetchInsurancePolicies(context, setLoading);
        // Reset form and close
        setFormData({ insurancePolicyName: "", employeePercentage: 0, companyPercentage: 0, maxAmount: "" as unknown as number, effectiveFrom: "", effectiveTo: "" });
        setShowAddForm(false);
      } else {
        addNotification("error", "Lỗi", "Không thể thêm bảo hiểm. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error creating insurance policy:", error);
      addNotification("error", "Lỗi", "Đã xảy ra lỗi khi thêm bảo hiểm.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (insurance: InsuranceListResponse) => {
    setEditingId(insurance.insurancePolicyId);
    setFormData({
      insurancePolicyName: insurance.insurancePolicyName,
      employeePercentage: insurance.employeePercentage,
      companyPercentage: insurance.companyPercentage,
      maxAmount: formatSalary(String(insurance.maxAmount)) as unknown as number,
      effectiveFrom: insurance.effectiveFrom || "",
      effectiveTo: insurance.effectiveTo || "",
    });
    setShowEditForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    
    setSubmitting(true);
    // effectiveFrom is required
    if (!formData.effectiveFrom) {
      addNotification("error", "Lỗi", "Vui lòng chọn Ngày hiệu lực (From date)", 4000);
      setSubmitting(false);
      return;
    }
    try {
      const payload = {
        ...formData,
        maxAmount: Number(parseSalary(String(formData.maxAmount))),
      };
      const success = await updateInsurancePolicy(editingId, payload);
      
      if (success) {
        addNotification("ok", "Thành công", "Cập nhật bảo hiểm thành công!");
        // Refresh data
        await fetchInsurancePolicies(context, setLoading);
        // Reset form and close
        setFormData({ insurancePolicyName: "", employeePercentage: 0, companyPercentage: 0, maxAmount: "" as unknown as number, effectiveFrom: "", effectiveTo: "" });
        setShowEditForm(false);
        setEditingId(null);
      } else {
        addNotification("error", "Lỗi", "Không thể cập nhật bảo hiểm. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error updating insurance policy:", error);
      addNotification("error", "Lỗi", "Đã xảy ra lỗi khi cập nhật bảo hiểm.");
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
      const success = await deleteInsurancePolicy(deleteTarget.id);
      
      if (success) {
        addNotification("ok", "Thành công", "Xóa bảo hiểm thành công!");
        // Refresh data
        await fetchInsurancePolicies(context, setLoading);
      } else {
        addNotification("error", "Lỗi", "Không thể xóa bảo hiểm. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error deleting insurance policy:", error);
      addNotification("error", "Lỗi", "Đã xảy ra lỗi khi xóa bảo hiểm.");
    } finally {
      setShowConfirm(false);
      setDeleteTarget(null);
    }
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Bảo hiểm</h2>
        {userRole === "HR" && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-[#4AB4DE] rounded-md hover:bg-[#3A9DC9] transition-colors cursor-pointer text-white"
          >
            +Thêm mới
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg overflow-hidden">
        <table className="w-full table-fixed">
          <colgroup>
            <col style={{width: '16%'}} />
            <col style={{width: '10%'}} />
            <col style={{width: '10%'}} />
            <col style={{width: '13%'}} />
            <col style={{width: '13%'}} />
            <col style={{width: '13%'}} />
            <col style={{width: '11%'}} />
            <col style={{width: '14%'}} />
          </colgroup>
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left font-medium">Loại bảo hiểm</th>
              <th className="px-4 py-3 text-left font-medium">Tỉ lệ nv</th>
              <th className="px-4 py-3 text-left font-medium">Tỉ lệ dn</th>
              <th className="px-4 py-3 text-left font-medium">Số tiền tối đa</th>
              <th className="px-4 py-3 text-left font-medium">Ngày hiệu lực</th>
              <th className="px-4 py-3 text-left font-medium">Ngày hết hạn</th>
              <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
              <th className="px-4 py-3 text-left font-medium"></th>
            </tr>
          </thead>
        </table>
        <div className="overflow-y-auto max-h-[400px]" style={{scrollbarGutter: 'stable'}}>
          <table className="w-full table-fixed">
            <colgroup>
              <col style={{width: '16%'}} />
              <col style={{width: '10%'}} />
              <col style={{width: '10%'}} />
              <col style={{width: '13%'}} />
              <col style={{width: '13%'}} />
              <col style={{width: '13%'}} />
              <col style={{width: '11%'}} />
              <col style={{width: '14%'}} />
            </colgroup>
            <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : context?.insurancePolicies.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              context?.insurancePolicies.map((insurance) => (
                <tr key={insurance.insurancePolicyId} className="border-b">
                  <td className="px-4 py-3">{insurance.insurancePolicyName}</td>
                  <td className="px-4 py-3">{insurance.employeePercentage * 100}%</td>
                  <td className="px-4 py-3">{insurance.companyPercentage * 100}%</td>
                  <td className="px-4 py-3">{insurance.maxAmount.toLocaleString()}</td>
                  <td className="px-4 py-3">{insurance.effectiveFrom || "-"}</td>
                  <td className="px-4 py-3">{insurance.effectiveTo || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${insurance.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {insurance.active ? 'Đang áp dụng' : 'Không áp dụng'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {userRole === "HR" && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(insurance)}
                          className="px-3 py-1 bg-[#4AB4DE] rounded hover:bg-[#3A9DC9] transition-colors text-sm cursor-pointer text-white"
                        >
                          Chỉnh sửa
                        </button>
                        <button 
                          onClick={() => handleDelete(insurance.insurancePolicyId, insurance.insurancePolicyName)}
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
      </div>

      {/* Add Insurance Policy Form */}
      {showAddForm && (
        <FormPopBox>
          <div className="space-y-6 min-w-[500px]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#CCE1F0] pb-4">
              <h2 className="text-2xl font-bold text-[#1D3E6A]">Thêm Bảo Hiểm Mới</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1D3E6A]">Tên loại bảo hiểm</label>
                <input
                  type="text"
                  name="insurancePolicyName"
                  value={formData.insurancePolicyName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-[#CCE1F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81d4fa]"
                  placeholder="Nhập tên loại bảo hiểm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1D3E6A]">Tỉ lệ nhân viên (%)</label>
                <input
                  type="number"
                  name="employeePercentage"
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-4 py-2 border border-[#CCE1F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81d4fa]"
                  placeholder="VD: 10% thì ghi 0,01"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1D3E6A]">Tỉ lệ doanh nghiệp (%)</label>
                <input
                  type="number"
                  name="companyPercentage"
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-4 py-2 border border-[#CCE1F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81d4fa]"
                  placeholder="VD: 10% thì ghi 0,01"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1D3E6A]">Số tiền tối đa</label>
                <input
                  type="text"
                  name="maxAmount"
                  value={formData.maxAmount}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-[#CCE1F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81d4fa]"
                  placeholder="VD: 5.000.000"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1D3E6A]">Ngày hiệu lực</label>
                <input
                  type="date"
                  name="effectiveFrom"
                  value={formData.effectiveFrom}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-[#CCE1F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81d4fa]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1D3E6A]">Ngày hết hạn</label>
                <input
                  type="date"
                  name="effectiveTo"
                  value={formData.effectiveTo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-[#CCE1F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81d4fa]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-[#4AB4DE] text-white rounded-lg hover:bg-[#3A9DC9] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Đang thêm..." : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </FormPopBox>
      )}

      {/* Edit Insurance Policy Form */}
      {showEditForm && (
        <FormPopBox>
          <div className="space-y-6 min-w-[500px]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#CCE1F0] pb-4">
              <h2 className="text-2xl font-bold text-[#1D3E6A]">Chỉnh Sửa Bảo Hiểm</h2>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditingId(null);
                  setFormData({ insurancePolicyName: "", employeePercentage: 0, companyPercentage: 0, maxAmount: "" as unknown as number, effectiveFrom: "", effectiveTo: "" });
                }}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1D3E6A]">Tên loại bảo hiểm</label>
                <input
                  type="text"
                  name="insurancePolicyName"
                  value={formData.insurancePolicyName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-[#CCE1F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81d4fa]"
                  placeholder="Nhập tên loại bảo hiểm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1D3E6A]">Tỉ lệ nhân viên (%)</label>
                <input
                  type="number"
                  name="employeePercentage"
                  value={formData.employeePercentage}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-4 py-2 border border-[#CCE1F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81d4fa]"
                  placeholder="Nhập tỉ lệ nhân viên"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1D3E6A]">Tỉ lệ doanh nghiệp (%)</label>
                <input
                  type="number"
                  name="companyPercentage"
                  value={formData.companyPercentage}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-4 py-2 border border-[#CCE1F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81d4fa]"
                  placeholder="Nhập tỉ lệ doanh nghiệp"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1D3E6A]">Số tiền tối đa</label>
                <input
                  type="text"
                  name="maxAmount"
                  value={formData.maxAmount}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-[#CCE1F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81d4fa]"
                  placeholder="VD: 5.000.000"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1D3E6A]">Ngày hiệu lực</label>
                <input
                  type="date"
                  name="effectiveFrom"
                  value={formData.effectiveFrom}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-[#CCE1F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81d4fa]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1D3E6A]">Ngày hết hạn</label>
                <input
                  type="date"
                  name="effectiveTo"
                  value={formData.effectiveTo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-[#CCE1F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81d4fa]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingId(null);
                    setFormData({ insurancePolicyName: "", employeePercentage: 0, companyPercentage: 0, maxAmount: 0, effectiveFrom: "", effectiveTo: "" });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-[#4AB4DE] text-white rounded-lg hover:bg-[#3A9DC9] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
          message={`Bạn có chắc chắn muốn xóa bảo hiểm "${deleteTarget.name}" không?`}
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