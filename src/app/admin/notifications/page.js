"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { toast } from "react-hot-toast";

/* ────── Premium SVG Icons ────── */
const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [target, setTarget] = useState("all"); // "all" or "specific"
  const [specificEmail, setSpecificEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    setSending(true);
    try {
      if (target === "all") {
        // Fetch all users and send notification
        const usersSnap = await getDocs(collection(db, "users"));
        const promises = [];
        usersSnap.docs.forEach(userDoc => {
          promises.push(
            addDoc(collection(db, "notifications"), {
              userId: userDoc.id,
              type: "system",
              title,
              message,
              link: link || "/dashboard/notifications",
              read: false,
              createdAt: serverTimestamp(),
            })
          );
        });
        await Promise.all(promises);
        toast.success(`Notification sent to all ${usersSnap.size} users`);
      } else {
        // Send to specific user by email
        if (!specificEmail.trim()) {
          toast.error("Please enter user email");
          return;
        }
        const userQuery = query(collection(db, "users"), where("email", "==", specificEmail.trim()));
        const snap = await getDocs(userQuery);
        if (snap.empty) {
          toast.error("User not found");
        } else {
          await addDoc(collection(db, "notifications"), {
            userId: snap.docs[0].id,
            type: "system",
            title,
            message,
            link: link || "/dashboard/notifications",
            read: false,
            createdAt: serverTimestamp(),
          });
          toast.success("Notification sent to user");
        }
      }
      setTitle("");
      setMessage("");
      setLink("");
    } catch (err) {
      toast.error("Failed to send notification");
    }
    setSending(false);
  };

  return (
    <div className="p-4 md:p-0">
      <h2 className="text-2xl font-bold mb-6">Send Notifications</h2>
      <div className="card space-y-4 max-w-xl">
        <div>
          <label className="text-sm">Target</label>
          <select value={target} onChange={e => setTarget(e.target.value)} className="input-field">
            <option value="all">All Users</option>
            <option value="specific">Specific User (by email)</option>
          </select>
        </div>
        {target === "specific" && (
          <input
            type="email"
            placeholder="User email"
            value={specificEmail}
            onChange={e => setSpecificEmail(e.target.value)}
            className="input-field"
          />
        )}
        <input
          type="text"
          placeholder="Notification Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="input-field"
        />
        <textarea
          placeholder="Notification Message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          className="input-field"
          rows={3}
        />
        <input
          type="text"
          placeholder="Link (optional, e.g., /dashboard/referrals)"
          value={link}
          onChange={e => setLink(e.target.value)}
          className="input-field"
        />
        <button
          onClick={handleSend}
          disabled={sending}
          className="btn-gradient w-full flex items-center justify-center gap-2"
        >
          {sending ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <SendIcon />}
          {sending ? "Sending..." : "Send Notification"}
        </button>
      </div>
    </div>
  );
}
