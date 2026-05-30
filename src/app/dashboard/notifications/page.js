"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import Link from "next/link";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const q = query(collection(db, "notifications"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setNotifications(list);
    };
    fetch();
  }, [user]);

  const markAllRead = async () => {
    for (const n of notifications) {
      if (!n.read) await updateDoc(doc(db, "notifications", n.id), { read: true });
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (!user) return <p className="p-8">Please login.</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <button onClick={markAllRead} className="btn-gradient">Mark All Read</button>
      </div>
      <div className="space-y-3">
        {notifications.map(n => (
          <div key={n.id} className={`card ${!n.read ? 'border-l-4 border-primary-500' : ''}`}>
            <Link href={n.link || "#"} className="font-semibold">{n.title}</Link>
            <p className="text-sm">{n.message}</p>
            <p className="text-xs text-gray-500">{new Date(n.createdAt?.toDate()).toLocaleString()}</p>
          </div>
        ))}
        {notifications.length === 0 && <p className="text-gray-500">No notifications yet.</p>}
      </div>
    </div>
  );
}
