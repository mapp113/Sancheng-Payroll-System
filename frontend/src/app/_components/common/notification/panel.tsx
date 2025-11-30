"use client";
import { useEffect, useState } from "react";
import { Notification } from "./types";
import { useLanguage } from "@/lib/language-context";
import { CheckCircle, Clock, FileText, DollarSign, Calendar } from "lucide-react";

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const userStr = window.sessionStorage.getItem("scpm.auth.user");
      if (!userStr) return;

      const parsed = JSON.parse(userStr);
      const token = parsed?.token;
      if (!token) return;

      const response = await fetch("http://localhost:8080/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const userStr = window.sessionStorage.getItem("scpm.auth.user");
      if (!userStr) return;

      const parsed = JSON.parse(userStr);
      const token = parsed?.token;
      if (!token) return;

      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === id ? { ...notif, isRead: true } : notif
          )
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "SALARY":
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case "OT_REQUEST":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "LEAVE_REQUEST":
        return <Calendar className="h-5 w-5 text-orange-600" />;
      case "APPROVED":
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationTypeLabel = (type: Notification["type"]) => {
    const labels = {
      SALARY: language === "vi" ? "Lương" : "Salary",
      OT_REQUEST: language === "vi" ? "Yêu cầu làm thêm" : "Overtime Request",
      LEAVE_REQUEST: language === "vi" ? "Yêu cầu nghỉ phép" : "Leave Request",
      APPROVED: language === "vi" ? "Đã duyệt" : "Approved",
    };
    return labels[type];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return language === "vi" ? "Vừa xong" : "Just now";
    if (diffMins < 60)
      return language === "vi" ? `${diffMins} phút trước` : `${diffMins} mins ago`;
    if (diffHours < 24)
      return language === "vi" ? `${diffHours} giờ trước` : `${diffHours} hours ago`;
    if (diffDays < 7)
      return language === "vi" ? `${diffDays} ngày trước` : `${diffDays} days ago`;

    return date.toLocaleDateString(language === "vi" ? "vi-VN" : "en-US");
  };

  return (
    <div className="absolute right-0 mt-2 w-96 max-h-[32rem] overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 z-50">
      <div className="bg-[#4AB4DE] px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          {language === "vi" ? "Thông báo" : "Notifications"}
        </h2>
      </div>

      <div className="max-h-[28rem] overflow-y-auto">
        {loading ? (
          <div className="px-4 py-8 text-center text-gray-500">
            {language === "vi" ? "Đang tải..." : "Loading..."}
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            {language === "vi"
              ? "Không có thông báo mới"
              : "No new notifications"}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notif.isRead ? "bg-blue-50" : ""
                }`}
                onClick={() => !notif.isRead && markAsRead(notif.id)}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm font-medium text-gray-900 ${
                          !notif.isRead ? "font-semibold" : ""
                        }`}
                      >
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1.5"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {getNotificationTypeLabel(notif.type)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(notif.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}