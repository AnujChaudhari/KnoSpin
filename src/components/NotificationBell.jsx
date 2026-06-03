"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import Link from "next/link";

/* ────────── प्रीमियम SVG आइकॉन ────────── */
const BellIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const EmptyBell = () => (
  <svg className="w-12 h-12 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, "notifications"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setNotifications(list);
    } catch (err) {
      console.error("Notification fetch error:", err);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id) => {
    await updateDoc(doc(db, "notifications", id), { read: true });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const n of unread) {
      await updateDoc(doc(db, "notifications", n.id), { read: true });
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        aria-label="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown – Desktop */}
      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div
            className="
              fixed md:absolute
              inset-x-4 top-16 md:inset-auto md:right-0 md:top-full md:mt-2
              mx-auto md:mx-0 max-w-sm md:w-80
              bg-white dark:bg-gray-800
              rounded-2xl shadow-2xl
              z-50 max-h-96 overflow-hidden
              flex flex-col
            "
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-lg">Notifications</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllRead}
                  className="text-xs text-primary-600 flex items-center gap-1 hover:underline"
                >
                  <CheckIcon /> Mark all read
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="md:hidden p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-grow divide-y divide-gray-200 dark:divide-gray-700">
              {loading && (
                <div className="p-4 text-center text-sm text-gray-500">
                  Loading...
                </div>
              )}
              {!loading && notifications.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
                  <EmptyBell />
                  <p>No notifications yet</p>
                </div>
              )}
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-4 ${notif.read ? 'opacity-60' : 'bg-gray-50 dark:bg-gray-700/50'}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <Link
                      href={notif.link || "#"}
                      onClick={() => { markAsRead(notif.id); setOpen(false); }}
                      className="text-sm font-medium hover:text-primary-600 transition flex-grow"
                    >
                      {notif.title}
                    </Link>
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="text-xs text-primary-600 hover:underline flex-shrink-0"
                    >
                      {notif.read ? '✓' : 'Mark read'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {notif.createdAt?.toDate ? new Date(notif.createdAt.toDate()).toLocaleString() : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
