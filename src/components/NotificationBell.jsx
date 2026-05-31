"use client";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import Link from "next/link";
import { HiBell, HiCheck } from "react-icons/hi";

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setHasError(false);
      return;
    }

    // सुरक्षित क्वेरी – कोई orderBy नहीं, कोई index नहीं चाहिए
    const q = query(collection(db, "notifications"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setNotifications(list);
        setHasError(false); // अगर पहले एरर थी तो हटाएँ
      },
      (error) => {
        console.error("Notification listener error:", error);
        setHasError(true); // एरर होने पर यूज़र को पता चले
        setNotifications([]);
      }
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user]);

  // अगर कोई एरर आई या यूज़र नहीं है तो कुछ न दिखाएँ
  if (!user || hasError) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (e) {
      // साइलेंट फेल – कोई एरर न दिखाएँ
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const n of unread) {
      await markAsRead(n.id);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 focus:outline-none"
        aria-label="Notifications"
      >
        <HiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-bold">Notifications</h3>
            <button
              onClick={markAllRead}
              className="text-xs text-primary-600 flex items-center gap-1"
            >
              <HiCheck className="w-4 h-4" /> Mark all read
            </button>
          </div>
          <div className="divide-y">
            {notifications.length === 0 && (
              <p className="p-4 text-sm text-gray-500">No notifications</p>
            )}
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-4 ${notif.read ? 'opacity-60' : 'bg-gray-50 dark:bg-gray-700'}`}
              >
                <div className="flex justify-between">
                  <Link
                    href={notif.link || "#"}
                    onClick={() => markAsRead(notif.id)}
                    className="text-sm font-medium"
                  >
                    {notif.title || "Notification"}
                  </Link>
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="text-xs text-primary-600"
                  >
                    {notif.read ? '✓' : 'Mark read'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">{notif.message || ""}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {notif.createdAt?.toDate ? new Date(notif.createdAt.toDate()).toLocaleString() : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
