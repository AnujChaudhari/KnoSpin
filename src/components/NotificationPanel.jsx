"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs, startAfter, updateDoc, doc } from "firebase/firestore";
import Link from "next/link";

// Inline SVG icons (no lucide-react)
const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);
const HeartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const CommentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  </svg>
);
const FollowIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const NOTIF_ICONS = {
  like: HeartIcon,
  comment: CommentIcon,
  follow: FollowIcon,
  default: BellIcon,
};

const TIME_AGO = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  const intervals = { year: 31536000, month: 2592000, week: 604800, day: 86400, hour: 3600, minute: 60 };
  for (const [unit, sec] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / sec);
    if (interval >= 1) return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
  }
  return "Just now";
};

export default function NotificationPanel({ isOpen, onClose }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Initial fetch (last 20, only recent 30 days)
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("createdAt", ">=", thirtyDaysAgo),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setNotifications(list);
    setLastVisible(snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null);
    setHasMore(snap.docs.length === 20);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  // Load more
  const loadMore = async () => {
    if (!lastVisible || !user) return;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("createdAt", ">=", thirtyDaysAgo),
      orderBy("createdAt", "desc"),
      startAfter(lastVisible),
      limit(20)
    );
    const snap = await getDocs(q);
    const more = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setNotifications(prev => [...prev, ...more]);
    setLastVisible(snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null);
    setHasMore(snap.docs.length === 20);
  };

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

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[400px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col transform transition-transform">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <BellIcon />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={markAllRead} className="text-xs text-primary-600 hover:underline">Mark all read</button>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><CloseIcon /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
              <BellIcon />
              <p>No notifications yet</p>
            </div>
          ) : (
            <ul className="divide-y">
              {notifications.map(notif => {
                const IconComp = NOTIF_ICONS[notif.type] || NOTIF_ICONS.default;
                return (
                  <li
                    key={notif.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${!notif.read ? 'bg-blue-50' : ''}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="flex gap-3">
                      <IconComp />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notif.title}</p>
                        <p className="text-sm text-gray-600 break-words">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{TIME_AGO(notif.createdAt?.toDate())}</p>
                      </div>
                      {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full self-center" />}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {hasMore && (
            <div className="p-3 text-center">
              <button onClick={loadMore} className="text-sm text-primary-600 hover:underline">Load more</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
