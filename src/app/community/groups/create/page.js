"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

/* ────── Premium SVG Icons ────── */
const GroupIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function CreateGroupPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "", category: "", privacy: "public", city: "", state: "" });
  const [creating, setCreating] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const generateInviteCode = () => Math.random().toString(36).substring(2, 10).toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.studentVerified) {
      toast.error("Only verified students can create groups");
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
      // Add creator as admin member
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

  if (!user?.studentVerified) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-500">Only verified students can create community groups.</p>
        <a href="/community/verify" className="btn-gradient mt-4 inline-block">Get Verified</a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2"><GroupIcon /> Create New Group</h1>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Group Name" required className="input-field" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Group Description" className="input-field" rows={3} />
        <div className="grid grid-cols-2 gap-4">
          <input name="city" value={form.city} onChange={handleChange} placeholder="City (optional)" className="input-field" />
          <input name="state" value={form.state} onChange={handleChange} placeholder="State (optional)" className="input-field" />
        </div>
        <div>
          <label className="text-sm mb-1 block">Category</label>
          <select name="category" value={form.category} onChange={handleChange} className="input-field">
            <option value="">General</option>
            <option value="programming">Programming</option>
            <option value="design">Design</option>
            <option value="exam-prep">Exam Prep</option>
            <option value="college">College</option>
            <option value="school">School</option>
          </select>
        </div>
        <div>
          <label className="text-sm mb-1 block">Privacy</label>
          <select name="privacy" value={form.privacy} onChange={handleChange} className="input-field">
            <option value="public">Public – anyone can join</option>
            <option value="private">Private – invite only</option>
          </select>
        </div>
        <button type="submit" disabled={creating} className="btn-gradient w-full flex items-center justify-center gap-2">
          {creating ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <PlusIcon />}
          {creating ? "Creating..." : "Create Group"}
        </button>
      </form>
    </div>
  );
}
