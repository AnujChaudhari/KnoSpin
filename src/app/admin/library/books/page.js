"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "react-hot-toast";

export default function AdminLibraryBooks() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", thumbnail: null, categoryId: "", previewUrl: "", downloadUrl: "", order: 0 });
  const [editing, setEditing] = useState(null);

  const fetchBooks = async () => {
    const snap = await getDocs(collection(db, "libraryBooks"));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    list.sort((a,b) => (b.createdAt?.toMillis()||0)-(a.createdAt?.toMillis()||0));
    setBooks(list);
  };
  const fetchCategories = async () => {
    const snap = await getDocs(collection(db, "libraryCategories"));
    setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchBooks(); fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.categoryId) return toast.error("Title and category required");
    let thumbnailUrl = "";
    if (form.thumbnail) {
      toast.loading("Uploading thumbnail...");
      thumbnailUrl = await uploadToCloudinary(form.thumbnail);
      toast.dismiss();
    }
    const data = { ...form, thumbnail: thumbnailUrl, createdAt: serverTimestamp() };
    if (editing) {
      await updateDoc(doc(db, "libraryBooks", editing), data);
      toast.success("Book updated");
    } else {
      await addDoc(collection(db, "libraryBooks"), data);
      toast.success("Book added");
    }
    setForm({ title: "", description: "", thumbnail: null, categoryId: "", previewUrl: "", downloadUrl: "", order: 0 });
    setEditing(null);
    fetchBooks();
  };

  const handleEdit = (book) => {
    setForm({ title: book.title, description: book.description, thumbnail: null, categoryId: book.categoryId, previewUrl: book.previewUrl || "", downloadUrl: book.downloadUrl || "", order: book.order || 0 });
    setEditing(book.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this book?")) {
      await deleteDoc(doc(db, "libraryBooks", id));
      toast.success("Deleted");
      fetchBooks();
    }
  };

  return (
    <div className="p-4 md:p-0">
      <h2 className="text-2xl font-bold mb-4">Manage Library Books</h2>
      <form onSubmit={handleSubmit} className="card space-y-4 mb-8">
        <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Book Title" required className="input-field" />
        <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="input-field" rows={2} />
        <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} required className="input-field">
          <option value="">Select Category</option>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
        <input type="file" onChange={e => setForm({...form, thumbnail: e.target.files[0]})} className="input-field" />
        <input value={form.previewUrl} onChange={e => setForm({...form, previewUrl: e.target.value})} placeholder="Preview URL (PDF/DOC)" className="input-field" />
        <input value={form.downloadUrl} onChange={e => setForm({...form, downloadUrl: e.target.value})} placeholder="Download URL" className="input-field" />
        <button type="submit" className="btn-gradient w-full">{editing ? "Update Book" : "Add Book"}</button>
      </form>

      <div className="space-y-3">
        {books.map(book => (
          <div key={book.id} className="card flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img src={book.thumbnail || "https://via.placeholder.com/48"} className="w-12 h-12 object-cover rounded" />
              <div>
                <h4 className="font-bold">{book.title}</h4>
                <p className="text-xs text-gray-500">{book.description?.slice(0,80)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(book)} className="text-primary-600 text-sm">Edit</button>
              <button onClick={() => handleDelete(book.id)} className="text-red-500 text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
