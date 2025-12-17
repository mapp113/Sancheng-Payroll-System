"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "warning";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-[#15803D]" />;
      case "error":
        return <XCircle className="h-5 w-5 text-[#B91C1C]" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-[#F59E0B]" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-[#DCFCE7] border-[#15803D] text-[#15803D]";
      case "error":
        return "bg-[#FEE2E2] border-[#B91C1C] text-[#B91C1C]";
      case "warning":
        return "bg-[#FEF3C7] border-[#F59E0B] text-[#F59E0B]";
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] flex items-center gap-3 rounded-xl border-l-4 px-4 py-3 shadow-lg animate-slide-in ${getStyles()}`}
      style={{
        minWidth: "300px",
        maxWidth: "500px",
      }}
    >
      {getIcon()}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="rounded-full p-1 hover:bg-black/10 transition"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
