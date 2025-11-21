import { CircleAlert, CircleCheck, CircleX } from "lucide-react";
import { useEffect, useState } from "react";

export type Status = "ok" | "error" | "info";

interface BottomItemNotificationProps {
  status: Status;
  title: string;
  message: string;
  duration?: number; // Thời gian hiển thị (ms), mặc định 5000ms (5s)
  onRemove?: () => void; // Callback khi notification tự xóa
}

export default function BottomItemNotification({
  status,
  title,
  message,
  duration = 10000,
  onRemove
}: BottomItemNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Đợi animation fade out xong rồi mới gọi onRemove
      setTimeout(() => {
        if (onRemove) {
          onRemove();
        }
      }, 300); // 300ms cho animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onRemove]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`w-full h-fit transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
        } bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 border-l-4 ${
          status === "ok"
            ? "border-green-500"
            : status === "error"
            ? "border-red-500"
            : "border-blue-500"
        }`}
    >
      <div className="flex items-center mb-2">
        {status === "ok" ? <CircleCheck className="inline text-green-500" /> : null}
        {status === "error" ? <CircleX className="inline text-red-500" /> : null}
        {status === "info" ? <CircleAlert className="inline text-blue-500" /> : null}
        <span className="font-bold ml-2">{title}</span>
      </div>
      <div>
        <span>{message}</span>
      </div>
    </div>
  );
};