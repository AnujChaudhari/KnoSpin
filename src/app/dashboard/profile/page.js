"use client";
export const dynamic = 'force-dynamic';

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import { HiUser, HiMail, HiPhone, HiLockClosed, HiBadgeCheck } from "react-icons/hi";

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || "");
        setPhone(data.phone || "");
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        name,
        phone,
        email: user.email,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Failed to update profile");
    }
    setSaving(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return toast.error("Fill all fields");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    setChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast.success("Password changed!");
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.message || "Failed to change password");
    }
    setChangingPassword(false);
  };

  if (!user) return <p className="p-8 text-center">Please login first.</p>;
  if (loading) return <p className="p-8 text-center">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {/* Profile Info Card */}
      <div className="card mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl font-bold text-primary-600">
            {name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-xl font-bold">{name || "User"}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            {user.emailVerified && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <HiBadgeCheck /> Verified
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm flex items-center gap-1 mb-1"><HiUser /> Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm flex items-center gap-1 mb-1"><HiMail /> Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="input-field bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="text-sm flex items-center gap-1 mb-1"><HiPhone /> Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Your phone number"
              className="input-field"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-gradient w-full">
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>

      {/* Password Change Card */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2"><HiLockClosed /> Password</h3>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-primary-600 text-sm"
          >
            {showPasswordForm ? "Cancel" : "Change"}
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="input-field"
            />
            <input
              type="password"
              placeholder="New Password (min 6 chars)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="input-field"
            />
            <button type="submit" disabled={changingPassword} className="btn-gradient w-full">
              {changingPassword ? "Changing..." : "Change Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
