"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp
} from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "react-hot-toast";

/* ────── Premium Inline SVG Icons ────── */
const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const PencilIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>;
const CategoryIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
const BookOpenIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>;
const UploadIcon = () => <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
const SearchIcon = () => <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;

export default function AdminLibraryPage() {
  const [activeTab, setActiveTab] = useState("categories");

  /* ========== STATES ========== */
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCat, setEditingCat] = useState(null);
  const [editCatName, setEditCatName] = useState("");

  const [books, setBooks] = useState([]);
  const [bookSearch, setBookSearch] = useState(""); // 🌟 Suggestional Feature state
  const [localImagePreview, setLocalImagePreview] = useState(null); // 🌟 Image preview state
  const [bookForm, setBookForm] = useState({
    title: "", description: "", thumbnail: null,
    categoryId: "", previewUrl: "", downloadUrl: "", order: 0
  });
  const [editingBookId, setEditingBookId] = useState(null);

  /* ========== FETCH LOGIC (try-catch Protected) ========== */
  const fetchCategories = async () => {
    try {
      const snap = await getDocs(collection(db, "libraryCategories"));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (a.order || 0) - (b.order || 0));
      setCategories(list);
    } catch (e) { console.error(e); }
  };

  const fetchBooks = async () => {
    try {
      const snap = await getDocs(collection(db, "libraryBooks"));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setBooks(list);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchCategories(); fetchBooks(); }, []);

  /* ========== CATEGORY HANDLERS ========== */
  const addCategory = async () => {
    if (!newCategory.trim()) return toast.error("Category name required");
    try {
      await addDoc(collection(db, "libraryCategories"), {
        name: newCategory.trim(),
        order: categories.length + 1,
        createdAt: serverTimestamp(),
      });
      setNewCategory("");
      toast.success("Category added successfully");
      fetchCategories();
    } catch (e) { toast.error("Operation failed"); }
  };

  const updateCategory = async (id) => {
    if (!editCatName.trim()) return;
    try {
      await updateDoc(doc(db, "libraryCategories", id), { name: editCatName.trim() });
      setEditingCat(null);
      setEditCatName("");
      toast.success("Category updated");
      fetchCategories();
    } catch (e) { toast.error("Update failed"); }
  };

  const deleteCategory = async (id) => {
    if (confirm("Delete this category?")) {
      try {
        await deleteDoc(doc(db, "libraryCategories", id));
        toast.success("Category deleted");
        fetchCategories();
      } catch (e) { toast.error("Deletion rejected"); }
    }
  };

  /* ========== BOOK HANDLERS ========== */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBookForm({ ...bookForm, thumbnail: file });
      setLocalImagePreview(URL.createObjectURL(file)); // Create localized dynamic blob URL
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!bookForm.title || !bookForm.categoryId) {
      return toast.error("Title and category are required");
    }
    
    try {
      let thumbnailUrl = bookForm.existingThumbnail || "";
      
      if (bookForm.thumbnail) {
        const loadToast = toast.loading("Uploading asset to Cloudinary...");
        thumbnailUrl = await uploadToCloudinary(bookForm.thumbnail);
        toast.dismiss(loadToast);
      }

      const data = {
        title: bookForm.title,
        description: bookForm.description,
        categoryId: bookForm.categoryId,
        previewUrl: bookForm.previewUrl,
        downloadUrl: bookForm.downloadUrl,
        order: bookForm.order,
        thumbnail: thumbnailUrl,
        updatedAt: serverTimestamp()
      };

      if (!editingBookId) {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, "libraryBooks"), data);
        toast.success("New book cataloged!");
      } else {
        await updateDoc(doc(db, "libraryBooks", editingBookId), data);
        toast.success("Book credentials updated!");
      }

      resetBookForm();
      fetchBooks();
    } catch (err) {
      toast.dismiss();
      toast.error("Pipeline breakdown. Try again.");
    }
  };

  const resetBookForm = () => {
    setBookForm({ title: "", description: "", thumbnail: null, categoryId: "", previewUrl: "", downloadUrl: "", order: 0 });
    setLocalImagePreview(null);
    setEditingBookId(null);
  };

  const editBook = (book) => {
    setBookForm({
      title: book.title, description: book.description, thumbnail: null,
      categoryId: book.categoryId, previewUrl: book.previewUrl || "",
      downloadUrl: book.downloadUrl || "", order: book.order || 0,
      existingThumbnail: book.thumbnail
    });
    setLocalImagePreview(book.thumbnail || null);
    setEditingBookId(book.id);
    setActiveTab("books");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteBook = async (id) => {
    if (confirm("Permanently wipe this entry from library?")) {
      try {
        await deleteDoc(doc(db, "libraryBooks", id));
        toast.success("Book entry purged");
        fetchBooks();
      } catch (e) { toast.error("Purge rejected"); }
    }
  };

  // 🌟 Filtered Books for Instant Search Utility
  const filteredBooks = books.filter(b => 
    b.title?.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.description?.toLowerCase().includes(bookSearch.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 md:py-8 min-h-screen">
      
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Library Console</h2>
        <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">Manage virtual assets, categories and documentation links</p>
      </div>

      {/* ===== APP-STYLE SEGMENTED TAB CONTROLLER ===== */}
      <div className="bg-gray-100 dark:bg-white/5 rounded-2xl p-1.5 flex gap-1 mb-6 border border-transparent dark:border-white/5">
        <button
          onClick={() => { setActiveTab("categories"); resetBookForm(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            activeTab === "categories" 
              ? "bg-white dark:bg-[#111] text-primary-600 dark:text-primary-400 shadow-sm" 
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <CategoryIcon /> Categories
        </button>
        <button
          onClick={() => setActiveTab("books")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            activeTab === "books" 
              ? "bg-white dark:bg-[#111] text-primary-600 dark:text-primary-400 shadow-sm" 
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <BookOpenIcon /> Catalog / Books
        </button>
      </div>

      {/* ==================== CATEGORIES TAB LAYOUT ==================== */}
      {activeTab === "categories" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111] rounded-3xl p-4 border border-gray-100 dark:border-white/5 flex gap-2 shadow-sm">
            <input
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              placeholder="Enter context category name..."
              className="flex-1 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 outline-none text-sm font-medium border border-transparent focus:border-primary-500/20"
            />
            <button onClick={addCategory} className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs active:scale-95 transition-all flex items-center gap-1 flex-shrink-0">
              <PlusIcon /> Add
            </button>
          </div>

          <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider">
              Available Context Classes
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {categories.map(cat => (
                <div key={cat.id} className="p-4 flex justify-between items-center transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5">
                  {editingCat === cat.id ? (
                    <div className="flex gap-2 w-full animate-in slide-in-from-top-1 duration-150">
                      <input
                        value={editCatName}
                        onChange={e => setEditCatName(e.target.value)}
                        className="flex-1 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm font-medium border border-primary-500/30 outline-none"
                      />
                      <button onClick={() => updateCategory(cat.id)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all">Save</button>
                      <button onClick={() => setEditingCat(null)} className="px-3 py-2 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-300 text-xs font-bold rounded-xl transition-all">Cancel</button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{cat.name}</span>
                      <div className="flex gap-1 bg-gray-50 dark:bg-white/5 rounded-full p-1">
                        <button onClick={() => { setEditingCat(cat.id); setEditCatName(cat.name); }} className="p-2 text-gray-400 hover:text-primary-500 rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors"><PencilIcon /></button>
                        <button onClick={() => deleteCategory(cat.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors"><TrashIcon /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {categories.length === 0 && <p className="p-6 text-center text-sm text-gray-500">No active category segments mapped.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ==================== BOOKS TAB LAYOUT ==================== */}
      {activeTab === "books" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Form Engine */}
          <form onSubmit={handleBookSubmit} className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 relative">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3 mb-2">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">{editingBookId ? "✏️ Edit Library Entry" : "📘 Catalog New Asset"}</h3>
              {editingBookId && <span className="bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Active Edit Session</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Book Identity Title</label>
                <input
                  value={bookForm.title}
                  onChange={e => setBookForm({ ...bookForm, title: e.target.value })}
                  placeholder="e.g. Plant Systematics Module 4"
                  required
                  className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary-500/20 text-gray-900 dark:text-white rounded-2xl p-3 outline-none transition-all font-medium text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Context Blueprint Class</label>
                <select
                  value={bookForm.categoryId}
                  onChange={e => setBookForm({ ...bookForm, categoryId: e.target.value })}
                  required
                  className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary-500/20 text-gray-900 dark:text-white rounded-2xl p-3 outline-none transition-all font-semibold text-sm appearance-none"
                >
                  <option value="" className="dark:bg-[#111]">Select Target Node</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id} className="dark:bg-[#111]">{cat.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Resource Meta Synopsis</label>
              <textarea
                value={bookForm.description}
                onChange={e => setBookForm({ ...bookForm, description: e.target.value })}
                placeholder="Write a clear breakdown summary of the asset..."
                className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary-500/20 text-gray-900 dark:text-white rounded-2xl p-3 outline-none transition-all font-medium text-sm"
                rows={3}
              />
            </div>

            {/* 🌟 PREMIUM FILE DROPZONE / LIVE PREVIEW ENGINE */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Art Thumbnail Coverage</label>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 relative">
                <div className="w-20 h-24 rounded-xl bg-gray-100 dark:bg-white/5 flex-shrink-0 flex items-center justify-center overflow-hidden border dark:border-white/5 shadow-inner">
                  {localImagePreview ? (
                    <img src={localImagePreview} alt="Live view container" className="w-full h-full object-cover animate-in fade-in" />
                  ) : (
                    <BookOpenIcon />
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="text-sm font-bold text-gray-800 dark:text-gray-200">Select Thumbnail Image</div>
                  <div className="text-xs text-gray-400">Supports JPEG, PNG asset formatting up to 5MB node specs.</div>
                  <label className="inline-flex mt-2 px-4 py-1.5 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-white/20 transition-all active:scale-95">
                    Browse File
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Secure Preview Link</label>
                <input
                  value={bookForm.previewUrl}
                  onChange={e => setBookForm({ ...bookForm, previewUrl: e.target.value })}
                  placeholder="https://drive.google.com/viewer..."
                  className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary-500/20 text-gray-900 dark:text-white rounded-2xl p-3 outline-none transition-all font-medium text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Direct Download Payload Link</label>
                <input
                  value={bookForm.downloadUrl}
                  onChange={e => setBookForm({ ...bookForm, downloadUrl: e.target.value })}
                  placeholder="https://server.storage/pdf/download..."
                  className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary-500/20 text-gray-900 dark:text-white rounded-2xl p-3 outline-none transition-all font-medium text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">Sort Order</label>
                <input
                  type="number"
                  value={bookForm.order}
                  onChange={e => setBookForm({ ...bookForm, order: parseInt(e.target.value) || 0 })}
                  className="w-20 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary-500/20 text-gray-900 dark:text-white rounded-xl p-2 text-center outline-none transition-all font-bold text-sm"
                />
              </div>
              
              <div className="flex gap-2">
                {editingBookId && (
                  <button type="button" onClick={resetBookForm} className="px-4 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 font-bold rounded-xl text-xs active:scale-95 transition-all">
                    Cancel
                  </button>
                )}
                <button type="submit" className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs active:scale-95 transition-all shadow-sm shadow-primary-500/20 flex items-center gap-1.5">
                  <PlusIcon /> {editingBookId ? "Save Engine Blueprint" : "Publish to Library"}
                </button>
              </div>
            </div>
          </form>

          {/* Existing Logs Title Header with Live Search Module */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">Active Catalogs ({filteredBooks.length})</h3>
              
              {/* 🌟 SUGGESTIONAL SEARCH UTILITY ENGINE */}
              <div className="relative min-w-[240px]">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
                <input
                  type="text"
                  placeholder="Filter active books list..."
                  value={bookSearch}
                  onChange={e => setBookSearch(e.target.value)}
                  className="w-full bg-white dark:bg-[#111] text-gray-900 dark:text-white rounded-full pl-9 pr-4 py-1.5 outline-none text-xs font-semibold border border-gray-100 dark:border-white/5"
                />
              </div>
            </div>

            {/* List Array Render */}
            <div className="space-y-2.5">
              {filteredBooks.map(book => (
                <div key={book.id} className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-3.5 flex justify-between items-center transition-all hover:shadow-sm">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img src={book.thumbnail || "https://via.placeholder.com/48"} alt={book.title} className="w-11 h-14 object-cover rounded-lg shadow-sm bg-gray-100 flex-shrink-0 border dark:border-white/5" loading="lazy" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate tracking-tight">{book.title}</h4>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-md mt-0.5">{book.description || "No description cataloged for this entity node."}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 bg-gray-50 dark:bg-white/5 rounded-full p-1 flex-shrink-0 ml-2">
                    <button onClick={() => editBook(book)} className="p-2 text-gray-400 hover:text-primary-500 rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors"><PencilIcon /></button>
                    <button onClick={() => deleteBook(book.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors"><TrashIcon /></button>
                  </div>
                </div>
              ))}
              {filteredBooks.length === 0 && <p className="text-center text-sm text-gray-400 py-8 bg-white dark:bg-[#111] border border-dashed border-gray-100 dark:border-white/5 rounded-2xl">No library catalog matches the filter parameter.</p>}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
