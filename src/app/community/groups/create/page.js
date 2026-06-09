"use client";

export const dynamic = 'force-dynamic';

import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { compressImage } from "@/lib/compressImage";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLocation } from "@/hooks/useLocation";

/* ────── SVG Icons ────── */
const BoldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
    <path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
  </svg>
);

const ItalicIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="19" y1="4" x2="10" y2="4" />
    <line x1="14" y1="20" x2="5" y2="20" />
    <line x1="15" y1="4" x2="9" y2="20" />
  </svg>
);

const UnderlineIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3" />
    <line x1="4" y1="21" x2="20" y2="21" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <circle cx="4" cy="6" r="1" />
    <circle cx="4" cy="12" r="1" />
    <circle cx="4" cy="18" r="1" />
  </svg>
);

const EmojiIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const GroupIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* ────── Types ────── */
interface FormData {
  name: string;
  category: string;
  privacy: "public" | "private";
  city: string;
  state: string;
}

/* ────── Premium Rich Text Editor Component ────── */
const RichTextEditor = ({ 
  initialValue, 
  onChange, 
  placeholder 
}: { 
  initialValue?: string; 
  onChange: (value: string) => void; 
  placeholder?: string;
}) => {
  const [value, setValue] = useState(initialValue || "");
  const editorRef = useRef<HTMLDivElement>(null);

  // Safe execCommand with fallback
  const execFormat = useCallback((command: string, value?: string) => {
    if (document.execCommand) {
      document.execCommand(command, false, value || '');
      editorRef.current?.focus();
    }
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const newValue = editorRef.current.innerHTML;
      setValue(newValue);
      onChange(newValue);
    }
  }, [onChange]);

  // Handle emoji insertion properly
  const handleEmoji = useCallback(() => {
    const emoji = '😊';
    execFormat('insertText', emoji);
  }, [execFormat]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialValue) {
      editorRef.current.innerHTML = initialValue || "";
    }
  }, [initialValue]);

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 flex-wrap pb-2">
        <button type="button" onClick={() => execFormat('bold')} className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors" title="Bold">
          <BoldIcon />
        </button>
        <button type="button" onClick={() => execFormat('italic')} className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors" title="Italic">
          <ItalicIcon />
        </button>
        <button type="button" onClick={() => execFormat('underline')} className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors" title="Underline">
          <UnderlineIcon />
        </button>
        <button type="button" onClick={() => execFormat('insertUnorderedList')} className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors" title="List">
          <ListIcon />
        </button>
        <button type="button" onClick={handleEmoji} className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors" title="Add Emoji">
          <EmojiIcon />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl p-4 min-h-[150px] outline-none focus:ring-2 focus:ring-primary-500/50 text-gray-900 dark:text-white text-sm transition-all"
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: initialValue || "" }}
      />
    </div>
  );
};

/* ────── Main Component ────── */
export default function CreateGroupPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { states, districts, loading: locationsLoading } = useLocation();
  
  const [form, setForm] = useState<FormData>({
    name: "",
    category: "",
    privacy: "public",
    city: "",
    state: ""
  });
  const [description, setDescription] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Available cities based on selected state (from JSON)
  const availableCities = form.state ? districts[form.state] || [] : [];

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const newForm = { ...prev, [name]: value };
      // Reset city when state changes
      if (name === 'state') {
        newForm.city = '';
      }
      return newForm;
    });
  }, []);

  const handleIconChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);
    
    if (!file) {
      setIconFile(null);
      setIconPreview(null);
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError('Only image files are allowed');
      return;
    }
    
    // Validate file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image must be less than 5MB');
      return;
    }
    
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please login first");
      router.push('/auth/login');
      return;
    }
    
    if (!form.name.trim()) {
      toast.error("Group name is required");
      return;
    }
    
    if (description.length > 10000) {
      toast.error("Description is too long (max 10,000 characters)");
      return;
    }
    
    setCreating(true);
    
    try {
      let iconUrl = "";
      if (iconFile) {
        // Compress image to 200px width, max 50KB
        const compressed = await compressImage(iconFile, 200, 50);
        iconUrl = await uploadToCloudinary(compressed);
      }
      
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const groupData = {
        name: form.name.trim(),
        description: description || "",
        category: form.category || "general",
        privacy: form.privacy,
        city: form.city || "",
        state: form.state || "",
        iconUrl,
        createdBy: user.uid,
        createdByEmail: user.email,
        inviteCode,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        postCount: 0,
        memberCount: 1,
      };
      
      const docRef = await addDoc(collection(db, "groups"), groupData);
      
      // Add creator as admin member
      await addDoc(collection(db, "groups", docRef.id, "members"), {
        userId: user.uid,
        userEmail: user.email,
        role: "admin",
        joinedAt: serverTimestamp(),
      });
      
      toast.success("Group created successfully! 🎉");
      router.push(`/community/groups/${docRef.id}`);
      
    } catch (err) {
      console.error("Create group error:", err);
      toast.error("Failed to create group. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  // Cleanup icon preview URL
  useEffect(() => {
    return () => {
      if (iconPreview) {
        URL.revokeObjectURL(iconPreview);
      }
    };
  }, [iconPreview]);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-transparent py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <GroupIcon />
            </span>
            Create New Community
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Build a space for like-minded people to connect and share
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., Tech Enthusiasts, Book Lovers Club"
              className="w-full px-4 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
              required
              maxLength={100}
            />
            <p className="text-xs text-gray-400 mt-1">{form.name.length}/100</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <RichTextEditor 
              initialValue={description}
              onChange={setDescription}
              placeholder="Describe what your community is about..."
            />
            <p className="text-xs text-gray-400 mt-1">You can use basic formatting and emojis</p>
          </div>

          {/* Group Icon */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Group Icon
            </label>
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary-50 to-primary-100 dark:from-white/5 dark:to-white/10 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-white/10 flex-shrink-0">
                {iconPreview ? (
                  <Image 
                    src={iconPreview} 
                    alt="Preview" 
                    width={80} 
                    height={80} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleIconChange}
                  className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 dark:file:bg-primary-500/10 dark:file:text-primary-400 hover:file:bg-primary-100 dark:hover:file:bg-primary-500/20 transition-colors cursor-pointer"
                />
                <p className="text-xs text-gray-400 mt-1">
                  JPG, PNG, or WebP. Max 5MB (will be compressed to 50KB)
                </p>
                {imageError && <p className="text-xs text-red-500 mt-1">{imageError}</p>}
              </div>
            </div>
          </div>

          {/* Location (State & City from JSON) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                State
              </label>
              <div className="relative">
                <select
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-transparent outline-none appearance-none text-gray-900 dark:text-white"
                  disabled={locationsLoading}
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <ChevronDownIcon />
              </div>
              {locationsLoading && <p className="text-xs text-gray-400 mt-1">Loading states...</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                City / District
              </label>
              <div className="relative">
                <select
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  disabled={!form.state || availableCities.length === 0}
                  className="w-full px-4 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-transparent outline-none appearance-none text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select District</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <ChevronDownIcon />
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-transparent outline-none text-gray-900 dark:text-white"
            >
              <option value="">General</option>
              <option value="technology">💻 Technology</option>
              <option value="programming">📝 Programming</option>
              <option value="design">🎨 Design</option>
              <option value="business">💼 Business</option>
              <option value="education">📚 Education</option>
              <option value="health">💪 Health & Fitness</option>
              <option value="gaming">🎮 Gaming</option>
              <option value="music">🎵 Music</option>
              <option value="art">🎭 Art & Culture</option>
            </select>
          </div>

          {/* Privacy */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Privacy Setting
            </label>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <input
                  type="radio"
                  name="privacy"
                  value="public"
                  checked={form.privacy === "public"}
                  onChange={handleChange}
                  className="mt-1 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <span className="font-semibold text-gray-900 dark:text-white">Public</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Anyone can see and join this group</p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <input
                  type="radio"
                  name="privacy"
                  value="private"
                  checked={form.privacy === "private"}
                  onChange={handleChange}
                  className="mt-1 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <span className="font-semibold text-gray-900 dark:text-white">Private</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Only members can see content, invite-only access</p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={creating}
            className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {creating ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                Creating Community...
              </>
            ) : (
              <>
                <GroupIcon />
                Create Community
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
