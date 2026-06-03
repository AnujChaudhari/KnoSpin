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
import { HiBold, HiItalic, HiUnderline, HiListBulleted, HiEmojiHappy, HiPhotograph, HiPaperAirplane } from "react-icons/hi";

/* ────── YouTube Detection Helper ────── */
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

/* ────── Content Moderation Helpers ────── */
const containsBadWords = (text) => {
  // अपनी आवश्यकतानुसार शब्द जोड़ें/हटाएँ
  const badWords = ['gali1', 'gali2', 'mc', 'bc', 'chod', 'bhadwa'];
  const lower = text.toLowerCase();
  return badWords.some(word => lower.includes(word));
};

const containsMaliciousUrl = (text) => {
  const urlPattern = /https?:\/\/[^\s]+/g;
  const urls = text.match(urlPattern) || [];
  // संदिग्ध URL जैसे javascript:, data: या बिना https वाले
  return urls.some(url => !url.startsWith('https://') || url.includes('javascript:') || url.includes('data:'));
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

  const handleEmojiPicker = () => {
    // Simple native emoji picker – on mobile/desktop opens OS emoji panel
    const input = document.createElement('input');
    input.type = 'text';
    input.style.position = 'fixed';
    input.style.opacity = 0;
    input.addEventListener('input', (e) => {
      document.execCommand('insertText', false, e.target.value);
      input.remove();
    });
    document.body.appendChild(input);
    input.focus();
    // On mobile this may not open the keyboard; fallback: insert a default emoji
    setTimeout(() => {
      if (input.value === '') {
        document.execCommand('insertText', false, '😊');
        input.remove();
      }
    }, 500);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please login");
      return;
    }
    const htmlContent = editorRef.current?.innerHTML;
    if (!htmlContent || htmlContent === '<br>' || htmlContent === '<p><br></p>') {
      toast.error("Please write something");
      return;
    }

    // ✅ कंटेंट मॉडरेशन चेक
    if (containsBadWords(htmlContent)) {
      toast.error("Post contains inappropriate language. Please remove it.");
      return;
    }
    if (containsMaliciousUrl(htmlContent)) {
      toast.error("Post contains suspicious URLs. Please remove them.");
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
        <button onClick={() => handleToolbar('bold')} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"><HiBold /></button>
        <button onClick={() => handleToolbar('italic')} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"><HiItalic /></button>
        <button onClick={() => handleToolbar('underline')} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"><HiUnderline /></button>
        <button onClick={() => handleToolbar('insertUnorderedList')} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"><HiListBulleted /></button>
        <button onClick={handleEmojiPicker} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"><HiEmojiHappy /></button>
      </div>

      {/* Rich Text Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="card min-h-[200px] p-4 outline-none text-sm"
        style={{ whiteSpace: 'pre-wrap' }}
        data-placeholder="Write something awesome..."
        placeholder="Write something awesome..."
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); document.execCommand('insertLineBreak'); } }}
      />

      {/* Image Upload */}
      <div className="mt-4">
        <label className="text-sm flex items-center gap-1 mb-1"><HiPhotograph /> Attach Image (optional)</label>
        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="input-field" />
        {imageFile && <p className="text-xs text-green-600 mt-1">Image selected: {imageFile.name}</p>}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={posting}
        className="btn-gradient w-full mt-6 flex items-center justify-center gap-2"
      >
        {posting ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <HiPaperAirplane />}
        {posting ? "Publishing..." : "Post"}
      </button>
    </div>
  );
}
