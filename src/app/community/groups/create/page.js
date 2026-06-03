"use client";
export const dynamic = 'force-dynamic';

import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { compressImage } from "@/lib/compressImage";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

/* ────── इनलाइन SVG आइकॉन ────── */
const BoldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"/><path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"/></svg>
);
const ItalicIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
);
const UnderlineIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>
);
const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>
);
const EmojiIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
);
const ImageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
);
const GroupIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
);

export default function CreateGroupPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", category: "", privacy: "public", city: "", state: "" });
  const [iconFile, setIconFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const editorRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleToolbar = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const handleEmoji = () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.style.position = 'fixed';
    input.style.opacity = 0;
    document.body.appendChild(input);
    input.focus();
    setTimeout(() => {
      if (input.value === '') {
        document.execCommand('insertText', false, '😊');
      } else {
        document.execCommand('insertText', false, input.value);
      }
      input.remove();
    }, 500);
  };

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
      let iconUrl = "";
      if (iconFile) {
        // 50KB से कम होना चाहिए, compressImage इसका ध्यान रखेगा
        const compressed = await compressImage(iconFile, 200, 50); // maxWidth 200px, maxSizeKB 50
        iconUrl = await uploadToCloudinary(compressed);
      }

      const descriptionHTML = editorRef.current?.innerHTML || "";

      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const docRef = await addDoc(collection(db, "groups"), {
        ...form,
        description: descriptionHTML,  // रिच टेक्स्ट HTML
        iconUrl,                        // ग्रुप आइकॉन URL
        createdBy: user.uid,
        inviteCode,
        createdAt: serverTimestamp(),
      });

      // निर्माता को एडमिन मेंबर बनाएँ
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2"><GroupIcon /> Create New Group</h1>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Group Name" required className="input-field" />

        {/* रिच टेक्स्ट डिस्क्रिप्शन */}
        <div>
          <label className="text-sm mb-1 block">Description</label>
          <div className="flex gap-1 mb-2 flex-wrap">
            <button type="button" onClick={() => handleToolbar('bold')} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"><BoldIcon /></button>
            <button type="button" onClick={() => handleToolbar('italic')} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"><ItalicIcon /></button>
            <button type="button" onClick={() => handleToolbar('underline')} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"><UnderlineIcon /></button>
            <button type="button" onClick={() => handleToolbar('insertUnorderedList')} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"><ListIcon /></button>
            <button type="button" onClick={handleEmoji} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"><EmojiIcon /></button>
          </div>
          <div
            ref={editorRef}
            contentEditable
            className="card min-h-[150px] p-4 outline-none text-sm"
            style={{ whiteSpace: 'pre-wrap' }}
            data-placeholder="Describe your group..."
          />
        </div>

        {/* ग्रुप आइकॉन */}
        <div>
          <label className="text-sm flex items-center gap-1 mb-1"><ImageIcon /> Group Icon (JPG/PNG, max 50KB)</label>
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={(e) => setIconFile(e.target.files[0])}
            className="input-field"
          />
          {iconFile && <p className="text-xs text-green-600 mt-1">Icon selected: {iconFile.name}</p>}
        </div>

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
          {creating ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <GroupIcon />}
          {creating ? "Creating..." : "Create Group"}
        </button>
      </form>
    </div>
  );
}
