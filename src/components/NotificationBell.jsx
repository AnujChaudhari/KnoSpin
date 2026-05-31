"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import Link from "next/link";
import { HiBell, HiCheck } from "react-icons/hi";

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
    const interval = setInterval(fetchNotifications, 30000); // हर 30s में ऑटो-रिफ़्रेश
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
      <button onClick={() => setOpen(!open)} className="relative p-2">
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
            <button onClick={markAllRead} className="text-xs text-primary-600 flex items-center gap-1">
              <HiCheck className="w-4 h-4" /> Mark all read
            </button>
          </div>
          <div className="divide-y">
            {loading && <p className="p-4 text-sm text-gray-500">Loading...</p>}
            {!loading && notifications.length === 0 && <p className="p-4 text-sm text-gray-500">No notifications</p>}
            {notifications.map(notif => (
              <div key={notif.id} className={`p-4 ${notif.read ? 'opacity-60' : 'bg-gray-50 dark:bg-gray-700'}`}>
                <div className="flex justify-between">
                  <Link href={notif.link || "#"} onClick={() => markAsRead(notif.id)} className="text-sm font-medium">
                    {notif.title}
                  </Link>
                  <button onClick={() => markAsRead(notif.id)} className="text-xs text-primary-600">
                    {notif.read ? '✓' : 'Mark read'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt?.toDate()).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
