import BottomItemNotification from "./bottom-item";
import { useNotification } from "./notification-context";

export default function BottomRightNotification() {
  const { notifications, removeNotification } = useNotification();
  
  return (
    <div id="bottom-right-notification" className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
      {notifications.map((notif) => (
        <BottomItemNotification
          key={notif.id}
          status={notif.status}
          title={notif.title}
          message={notif.message}
          duration={notif.duration}
          onRemove={() => removeNotification(notif.id)}
        />
      ))}
    </div>
  );
};