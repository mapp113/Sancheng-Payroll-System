interface ConfirmPopBoxProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmPopBox({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Xác nhận",
  cancelText = "Hủy"
}: ConfirmPopBoxProps) {
  return (
    <div className="h-full w-full fixed flex justify-center items-center top-0 left-0 bg-black/30 z-50">
      <div className="w-fit max-w-md p-6 bg-white rounded-2xl shadow-lg">
        <div className="space-y-4">
          {/* Header */}
          <div className="border-b border-[#CCE1F0] pb-3">
            <h2 className="text-xl font-bold text-[#1D3E6A]">{title}</h2>
          </div>

          {/* Message */}
          <div className="py-4">
            <p className="text-[#56749A]">{message}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-[#CCE1F0] text-[#56749A] rounded-lg hover:bg-[#F4FBFF] transition cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
