"use client";
export const dynamic = 'force-dynamic';

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { compressImage } from "@/lib/compressImage";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

/* ────── Inline SVG Toolbar Icons ────── */
const BoldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" /><path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
  </svg>
);
const ItalicIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />
  </svg>
);
const UnderlineIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3" /><line x1="4" y1="21" x2="20" y2="21" />
  </svg>
);
const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" />
  </svg>
);
const EmojiIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);
const ImageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
  </svg>
);
const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

/* ────── YouTube ID extractor ────── */
const extractYouTubeId = (text) => {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?youtu\.be\/([^?&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?&]+)/,
  ];
  for (const pat of patterns) {
    const match = text.match(pat);
    if (match) return match[1];
  }
  return null;
};

export default function CreatePostPage() {
  const params = useParams();
  const groupId = params.groupId;
  const { user } = useAuth();
  const router = useRouter();

  const editorRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [posting, setPosting] = useState(false);

  const handleToolbar = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const handleEmoji = () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.style.position = 'fixed';
    input.style.opacity = '0';
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

  const handleSubmit = async () => {
    if (!user) { toast.error("Please login"); return; }
    const htmlContent = editorRef.current?.innerHTML;
    if (!htmlContent || htmlContent === '<br>' || htmlContent === '<p><br></p>') {
      toast.error("Please write something");
      return;
    }
    setPosting(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        const compressed = await compressImage(imageFile, 1024, 200);
        imageUrl = await uploadToCloudinary(compressed);
      }
      const videoId = extractYouTubeId(htmlContent);
      const authorName = user.email?.split('@')[0] || "Student";

      await addDoc(collection(db, "posts"), {
        groupId,
        authorId: user.uid,
        authorName,
        text: htmlContent,
        imageUrl,
        videoId,
        createdAt: serverTimestamp(),
        isDeleted: false,
      });
      toast.success("Post published!");
      router.push(`/community/groups/${groupId}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish");
    }
    setPosting(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Create Post ✍️</h1>

      {/* Toolbar */}
      <div className="flex gap-1 mb-3 flex-wrap">
        <button onClick={() => handleToolbar('bold')} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"><BoldIcon /></button>
        <button onClick={() => handleToolbar('italic')} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"><ItalicIcon /></button>
        <button onClick={() => handleToolbar('underline')} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"><UnderlineIcon /></button>
        <button onClick={() => handleToolbar('insertUnorderedList')} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"><ListIcon /></button>
        <button onClick={handleEmoji} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"><EmojiIcon /></button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="card min-h-[200px] p-4 outline-none text-sm"
        style={{ whiteSpace: 'pre-wrap' }}
        data-placeholder="Write something awesome..."
      />

      {/* Image Upload */}
      <div className="mt-4">
        <label className="text-sm flex items-center gap-1 mb-1"><ImageIcon /> Attach Image (optional)</label>
        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="input-field" />
        {imageFile && <p className="text-xs text-green-600 mt-1">Image selected: {imageFile.name}</p>}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={posting}
        className="btn-gradient w-full mt-6 flex items-center justify-center gap-2"
      >
        {posting ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <SendIcon />}
        {posting ? "Publishing..." : "Post"}
      </button>
    </div>
  );
}
