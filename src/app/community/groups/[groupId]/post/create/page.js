"use client";
export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { compressImage } from "@/lib/compressImage";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

/* ────── प्रीमियम SVG आइकॉन ────── */
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
const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
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

/* ────── Sanitize HTML (remove unwanted styles, keep basic formatting) ────── */
const sanitizeHTML = (html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // Allow only these tags
  const allowedTags = ['B', 'I', 'U', 'STRONG', 'EM', 'BR', 'P', 'UL', 'OL', 'LI', 'A'];
  const walk = (node) => {
    if (node.nodeType === 1) { // element
      if (!allowedTags.includes(node.tagName)) {
        while (node.firstChild) {
          node.parentNode.insertBefore(node.firstChild, node);
        }
        node.parentNode.removeChild(node);
        return;
      }
      // Remove all attributes except href for A
      if (node.tagName !== 'A') {
        while (node.attributes.length > 0) {
          node.removeAttribute(node.attributes[0].name);
        }
      } else {
        // keep only href
        const href = node.getAttribute('href');
        while (node.attributes.length > 0) {
          node.removeAttribute(node.attributes[0].name);
        }
        if (href) node.setAttribute('href', href);
      }
    }
    // Recursively process child nodes
    let child = node.firstChild;
    while (child) {
      const next = child.nextSibling;
      walk(child);
      child = next;
    }
  };
  walk(doc.body);
  return doc.body.innerHTML;
};

export default function CreatePostPage() {
  const params = useParams();
  const groupId = params.groupId;
  const { user } = useAuth();
  const router = useRouter();

  const editorRef = useRef(null);
  const [images, setImages] = useState([]);
  const [posting, setPosting] = useState(false);

  // Handle paste to strip unwanted CSS
  const handlePaste = (e) => {
    e.preventDefault();
    // Try to get plain text first, if not then HTML
    const plainText = e.clipboardData.getData('text/plain');
    if (plainText) {
      // Convert plain text to HTML (respect line breaks)
      const html = plainText.replace(/\n/g, '<br>');
      document.execCommand('insertHTML', false, html);
    } else {
      const html = e.clipboardData.getData('text/html');
      if (html) {
        const clean = sanitizeHTML(html);
        document.execCommand('insertHTML', false, clean);
      }
    }
  };

  // Toolbar handlers (works on selected text)
  const handleToolbar = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  // Emoji picker (simple native)
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

  // Image handling
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 6) {
      toast.error("You can upload up to 6 images.");
      return;
    }
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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
    setPosting(true);
    try {
      toast.loading("Uploading images...");
      const imageUrls = [];
      for (const img of images) {
        const compressed = await compressImage(img.file, 1024, 200);
        const url = await uploadToCloudinary(compressed);
        imageUrls.push(url);
      }
      toast.dismiss();

      const videoId = extractYouTubeId(htmlContent);
      const authorName = user.email?.split('@')[0] || "Student";

      await addDoc(collection(db, "posts"), {
        groupId,
        authorId: user.uid,
        authorName,
        text: htmlContent,
        imageUrl: imageUrls.length > 0 ? imageUrls[0] : "",
        imageUrls,
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
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col min-h-[100dvh]">
      <h1 className="text-2xl font-bold text-white mb-4">Create Post ✍️</h1>

      {/* Toolbar */}
      <div className="flex gap-1 mb-3 flex-wrap">
        {[
          { cmd: 'bold', icon: <BoldIcon /> },
          { cmd: 'italic', icon: <ItalicIcon /> },
          { cmd: 'underline', icon: <UnderlineIcon /> },
          { cmd: 'insertUnorderedList', icon: <ListIcon /> },
        ].map(btn => (
          <button
            key={btn.cmd}
            onMouseDown={(e) => {
              e.preventDefault();
              handleToolbar(btn.cmd);
            }}
            className="p-2 rounded-lg bg-[#0a0a0a] border border-gray-800 text-gray-300 hover:bg-gray-800 transition"
          >
            {btn.icon}
          </button>
        ))}
        <button onClick={handleEmoji} className="p-2 rounded-lg bg-[#0a0a0a] border border-gray-800 text-gray-300 hover:bg-gray-800 transition">
          <EmojiIcon />
        </button>
      </div>

      {/* Editor with paste handler */}
      <div className="flex-1 flex flex-col min-h-0">
        <div
          ref={editorRef}
          contentEditable
          onPaste={handlePaste}
          className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-4 flex-1 overflow-y-auto outline-none text-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          style={{ whiteSpace: 'pre-wrap', minHeight: '200px' }}
          data-placeholder="Write something awesome..."
        />

        {/* Image Upload Section */}
        <div className="mt-4 flex-shrink-0">
          <label className="text-sm flex items-center gap-1 mb-1 text-gray-400">
            <ImageIcon /> Attach Images ({images.length}/6)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="bg-[#0a0a0a] border border-gray-800 text-white rounded-xl py-2 px-3 w-full outline-none focus:ring-1 focus:ring-primary-500"
            disabled={images.length >= 6}
          />
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-800">
                  <img src={img.preview} alt={`Preview ${idx+1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-0 right-0 p-0.5 bg-black/60 rounded-bl-lg"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Submit Button */}
      <div className="sticky bottom-0 bg-black/90 backdrop-blur-sm py-3 -mx-4 px-4 border-t border-gray-800 mt-4">
        <button
          onClick={handleSubmit}
          disabled={posting}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
        >
          {posting ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <SendIcon />
          )}
          {posting ? "Publishing..." : "Post"}
        </button>
      </div>
    </div>
  );
}
