import { Bell } from "lucide-react";
import { dummyNotifications } from "@/lib/dummy-data";

interface Props {
  onClose: () => void;
}

const NotificationsDropdown = ({ onClose }: Props) => {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-xl border border-border bg-card shadow-lg animate-fade-in">
        <div className="p-3 border-b border-border">
          <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {dummyNotifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            dummyNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex gap-3 p-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${
                  !notif.read ? "bg-accent/30" : ""
                }`}
              >
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  !notif.read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notif.read ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {!notif.read && (
                  <div className="mt-2 h-2 w-2 rounded-full bg-primary shrink-0" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsDropdown;
