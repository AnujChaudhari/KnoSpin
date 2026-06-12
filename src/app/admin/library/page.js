"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp
} from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "react-hot-toast";

/* ────── Inline SVG Icons ────── */
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const PencilIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

export default function AdminLibraryPage() {
  const [activeTab, setActiveTab] = useState("categories");

  /* ========== CATEGORIES STATE ========== */
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCat, setEditingCat] = useState(null);
  const [editCatName, setEditCatName] = useState("");

  /* ========== BOOKS STATE ========== */
  const [books, setBooks] = useState([]);
  const [bookForm, setBookForm] = useState({
    title: "", description: "", thumbnail: null,
    categoryId: "", previewUrl: "", downloadUrl: "", order: 0
  });
  const [editingBookId, setEditingBookId] = useState(null);

  /* ========== FETCH DATA ========== */
  const fetchCategories = async () => {
    const snap = await getDocs(collection(db, "libraryCategories"));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => (a.order || 0) - (b.order || 0));
    setCategories(list);
  };

  const fetchBooks = async () => {
    const snap = await getDocs(collection(db, "libraryBooks"));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
    setBooks(list);
  };

  useEffect(() => { fetchCategories(); fetchBooks(); }, []);

  /* ========== CATEGORY HANDLERS ========== */
  const addCategory = async () => {
    if (!newCategory.trim()) return;
    await addDoc(collection(db, "libraryCategories"), {
      name: newCategory.trim(),
      order: categories.length + 1,
      createdAt: serverTimestamp(),
    });
    setNewCategory("");
    toast.success("Category added");
    fetchCategories();
  };

  const updateCategory = async (id) => {
    if (!editCatName.trim()) return;
    await updateDoc(doc(db, "libraryCategories", id), { name: editCatName.trim() });
    setEditingCat(null);
    setEditCatName("");
    toast.success("Category updated");
    fetchCategories();
  };

  const deleteCategory = async (id) => {
    if (confirm("Delete this category?")) {
      await deleteDoc(doc(db, "libraryCategories", id));
      toast.success("Category deleted");
      fetchCategories();
    }
  };

  /* ========== BOOK HANDLERS ========== */
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!bookForm.title || !bookForm.categoryId) {
      return toast.error("Title and category are required");
    }
    let thumbnailUrl = "";
    if (bookForm.thumbnail) {
      toast.loading("Uploading thumbnail...");
      thumbnailUrl = await uploadToCloudinary(bookForm.thumbnail);
      toast.dismiss();
    }
    const data = { ...bookForm, thumbnail: thumbnailUrl, createdAt: serverTimestamp() };
    if (editingBookId) {
      await updateDoc(doc(db, "libraryBooks", editingBookId), data);
      toast.success("Book updated");
    } else {
      await addDoc(collection(db, "libraryBooks"), data);
      toast.success("Book added");
    }
    setBookForm({ title: "", description: "", thumbnail: null, categoryId: "", previewUrl: "", downloadUrl: "", order: 0 });
    setEditingBookId(null);
    fetchBooks();
  };

  const editBook = (book) => {
    setBookForm({
      title: book.title, description: book.description, thumbnail: null,
      categoryId: book.categoryId, previewUrl: book.previewUrl || "",
      downloadUrl: book.downloadUrl || "", order: book.order || 0
    });
    setEditingBookId(book.id);
    setActiveTab("books");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteBook = async (id) => {
    if (confirm("Delete this book?")) {
      await deleteDoc(doc(db, "libraryBooks", id));
      toast.success("Book deleted");
      fetchBooks();
    }
  };

  return (
    <div className="p-4 md:p-0">
      <h2 className="text-2xl font-bold mb-6">📚 Library Management</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 rounded-t-lg font-medium text-sm transition ${
            activeTab === "categories" ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-700"
          }`}
        >
          Categories
        </button>
        <button
          onClick={() => setActiveTab("books")}
          className={`px-4 py-2 rounded-t-lg font-medium text-sm transition ${
            activeTab === "books" ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-700"
          }`}
        >
          Books
        </button>
      </div>

      {/* ==================== CATEGORIES TAB ==================== */}
      {activeTab === "categories" && (
        <div>
          <div className="flex gap-2 mb-6">
            <input
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              placeholder="New category name"
              className="input-field flex-grow"
            />
            <button onClick={addCategory} className="btn-gradient flex items-center gap-1">
              <PlusIcon /> Add
            </button>
          </div>

          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat.id} className="card flex justify-between items-center">
                {editingCat === cat.id ? (
                  <div className="flex gap-2 flex-grow">
                    <input
                      value={editCatName}
                      onChange={e => setEditCatName(e.target.value)}
                      className="input-field flex-grow"
                    />
                    <button onClick={() => updateCategory(cat.id)} className="btn-gradient text-sm">Save</button>
                    <button onClick={() => setEditingCat(null)} className="text-sm text-gray-500">Cancel</button>
                  </div>
                ) : (
                  <>
                    <span>{cat.name}</span>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingCat(cat.id); setEditCatName(cat.name); }} className="text-primary-600"><PencilIcon /></button>
                      <button onClick={() => deleteCategory(cat.id)} className="text-red-500"><TrashIcon /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {categories.length === 0 && <p className="text-gray-500">No categories yet.</p>}
          </div>
        </div>
      )}

      {/* ==================== BOOKS TAB ==================== */}
      {activeTab === "books" && (
        <div>
          <form onSubmit={handleBookSubmit} className="card space-y-4 mb-8">
            <h3 className="font-bold text-lg">{editingBookId ? "Edit Book" : "Add New Book"}</h3>
            <input
              value={bookForm.title}
              onChange={e => setBookForm({ ...bookForm, title: e.target.value })}
              placeholder="Book Title"
              required
              className="input-field"
            />
            <textarea
              value={bookForm.description}
              onChange={e => setBookForm({ ...bookForm, description: e.target.value })}
              placeholder="Short description"
              className="input-field"
              rows={2}
            />
            <select
              value={bookForm.categoryId}
              onChange={e => setBookForm({ ...bookForm, categoryId: e.target.value })}
              required
              className="input-field"
            >
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <div>
              <label className="text-sm">Book Thumbnail</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setBookForm({ ...bookForm, thumbnail: e.target.files[0] })}
                className="input-field"
              />
              {editingBookId && bookForm.thumbnail === null && (
                <p className="text-xs text-green-600">Leave empty to keep current thumbnail.</p>
              )}
            </div>
            <input
              value={bookForm.previewUrl}
              onChange={e => setBookForm({ ...bookForm, previewUrl: e.target.value })}
              placeholder="Preview URL (for in‑app viewing)"
              className="input-field"
            />
            <input
              value={bookForm.downloadUrl}
              onChange={e => setBookForm({ ...bookForm, downloadUrl: e.target.value })}
              placeholder="Download URL (direct link)"
              className="input-field"
            />
            <input
              type="number"
              value={bookForm.order}
              onChange={e => setBookForm({ ...bookForm, order: parseInt(e.target.value) || 0 })}
              placeholder="Display order (optional)"
              className="input-field w-32"
            />
            <button type="submit" className="btn-gradient w-full flex items-center justify-center gap-2">
              <PlusIcon /> {editingBookId ? "Update Book" : "Add Book"}
            </button>
            {editingBookId && (
              <button
                type="button"
                onClick={() => {
                  setEditingBookId(null);
                  setBookForm({ title: "", description: "", thumbnail: null, categoryId: "", previewUrl: "", downloadUrl: "", order: 0 });
                }}
                className="w-full text-sm text-gray-500"
              >
                Cancel Editing
              </button>
            )}
          </form>

          <h3 className="text-xl font-bold mb-4">Existing Books ({books.length})</h3>
          <div className="space-y-3">
            {books.map(book => (
              <div key={book.id} className="card flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <img src={book.thumbnail || "https://via.placeholder.com/48"} alt={book.title} className="w-12 h-12 object-cover rounded-lg" />
                  <div>
                    <h4 className="font-bold">{book.title}</h4>
                    <p className="text-xs text-gray-500">{book.description?.slice(0, 80)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editBook(book)} className="text-primary-600"><PencilIcon /></button>
                  <button onClick={() => deleteBook(book.id)} className="text-red-500"><TrashIcon /></button>
                </div>
              </div>
            ))}
            {books.length === 0 && <p className="text-gray-500">No books yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
