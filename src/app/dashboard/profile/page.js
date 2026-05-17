"use client";
export const dynamic = 'force-dynamic';

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setName(snap.data().name || "");
        setPhone(snap.data().phone || "");
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    await setDoc(doc(db, "users", user.uid), {
      name,
      phone,
      email: user.email,
      updatedAt: serverTimestamp(),
    });
    toast.success("Profile updated!");
  };

  if (!user) return <p>Please login first.</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <input type="email" value={user.email} disabled className="input-field bg-gray-100" />
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" className="input-field" />
        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number" className="input-field" />
        <button type="submit" className="btn-gradient w-full">Save Profile</button>
      </form>
    </div>
  );
}
