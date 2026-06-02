"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

/* ... (SVG आइकॉन वही रहने दें, कोड में नीचे पूरा पेस्ट करें) */

export default function CreateGroupPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "", category: "", privacy: "public", city: "", state: "" });
  const [creating, setCreating] = useState(false);

  // ... (आइकॉन)

  const handleChange = (e) => { ... };

  const generateInviteCode = () => Math.random().toString(36).substring(2, 10).toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login first");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Group name is required");
      return;
    }
    setCreating(true);
    try {
      const inviteCode = generateInviteCode();
      const docRef = await addDoc(collection(db, "groups"), {
        ...form,
        createdBy: user.uid,
        inviteCode,
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, "groups", docRef.id, "members"), {
        userId: user.uid,
        role: "admin",
        joinedAt: serverTimestamp(),
      });
      toast.success("Group created!");
      router.push(`/community/groups/${docRef.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create group");
    }
    setCreating(false);
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Login Required</h1>
        <p className="text-gray-500">Please login to create a community group.</p>
        <a href="/login" className="btn-gradient mt-4 inline-block">Login</a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2"><GroupIcon /> Create New Group</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        {/* ... बाकी फॉर्म वैसा ही */}
      </form>
    </div>
  );
}
