"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useLocation } from "@/hooks/useLocation";

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
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const GlobeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <ellipse cx="12" cy="12" rx="4" ry="10" />
    <path d="M2 12h20" />
  </svg>
);
const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);
const MapPinIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default function CreateGroupPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { states, loading: locLoading, getDistricts, districts } = useLocation();

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    privacy: "public",
    city: "",
    state: "",
  });
  const [creating, setCreating] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "state") getDistricts(value);
  };

  const generateInviteCode = () =>
    Math.random().toString(36).substring(2, 10).toUpperCase();

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
        <h1 className="text-2xl font-bold mb-2 text-white">Login Required</h1>
        <p className="text-gray-400">Please login to create a community group.</p>
        <a href="/login" className="mt-4 inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-5 rounded-xl transition">
          Login
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-white">
        <GroupIcon /> Create New Group
      </h1>

      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        {/* Group Name */}
        <div>
          <label className="text-sm text-gray-300 mb-1 block">Group Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter a unique group name"
            required
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm text-gray-300 mb-1 block">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="What is this group about?"
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
            rows={3}
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-sm text-gray-300 mb-1 block">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">General</option>
            <option value="programming">Programming</option>
            <option value="design">Design</option>
            <option value="exam-prep">Exam Prep</option>
            <option value="college">College</option>
            <option value="school">School</option>
          </select>
        </div>

        {/* State & City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-300 mb-1 block flex items-center gap-1">
              <MapPinIcon /> State
            </label>
            <select
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary-500"
              disabled={locLoading}
            >
              <option value="">Select State (optional)</option>
              {states.map((s) => (
                <option key={s.state} value={s.state}>{s.state}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-300 mb-1 block flex items-center gap-1">
              <MapPinIcon /> City
            </label>
            <select
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary-500"
              disabled={!form.state}
            >
              <option value="">Select City (optional)</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Privacy */}
        <div>
          <label className="text-sm text-gray-300 mb-1 block">Privacy</label>
          <select
            name="privacy"
            value={form.privacy}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="public">Public – anyone can join</option>
            <option value="private">Private – invite only</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={creating}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-70"
        >
          {creating ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <PlusIcon />
          )}
          {creating ? "Creating..." : "Create Group"}
        </button>
      </form>
    </div>
  );
}
