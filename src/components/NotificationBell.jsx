"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import Link from "next/link";

/* इनलाइन SVG */
const BellIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
);
const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
);
const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
);

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, "notifications"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setNotifications(list);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // बाहर क्लिक करने पर बंद करें
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id) => {
    await updateDoc(doc(db, "notifications", id), { read: true });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    for (const n of notifications) {
      if (!n.read) await updateDoc(doc(db, "notifications", n.id), { read: true });
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (!user) return null;

  return (
    <>
      {/* बेल बटन */}
      <button onClick={() => setOpen(true)} className="relative p-2">
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* मोबाइल: फ़ुल-स्क्रीन मोडल | डेस्कटॉप: ड्रॉपडाउन */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-0 md:absolute md:inset-auto md:right-0 md:top-12" ref={panelRef}>
          {/* ओवरले (मोबाइल) */}
          <div className="fixed inset-0 bg-black/50 md:hidden" onClick={() => setOpen(false)} />
          {/* पैनल */}
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 w-full max-w-md mx-4 md:w-80 md:mx-0 max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold">Notifications</h3>
              <button onClick={() => setOpen(false)} className="md:hidden"><CloseIcon /></button>
              <button onClick={markAllRead} className="text-xs text-primary-600 hidden md:flex items-center gap-1"><CheckIcon /> Mark all read</button>
            </div>
            <div className="divide-y">
              {loading && <p className="p-4 text-sm text-gray-500">Loading...</p>}
              {!loading && notifications.length === 0 && <p className="p-4 text-sm text-gray-500">No notifications</p>}
              {notifications.map(notif => (
                <div key={notif.id} className={`p-4 ${notif.read ? 'opacity-60' : 'bg-gray-50 dark:bg-gray-700'}`}>
                  <div className="flex justify-between">
                    <Link href={notif.link || "#"} onClick={() => { markAsRead(notif.id); setOpen(false); }} className="text-sm font-medium">
                      {notif.title || "Notification"}
                    </Link>
                    <button onClick={() => markAsRead(notif.id)} className="text-xs text-primary-600">{notif.read ? '✓' : 'Mark read'}</button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{notif.message || ""}</p>
                  <p className="text-xs text-gray-400 mt-1">{notif.createdAt?.toDate?.() ? new Date(notif.createdAt.toDate()).toLocaleString() : ""}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
