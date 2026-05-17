"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-hot-toast";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  const fetchCategories = async () => {
    const snap = await getDocs(collection(db, "categories"));
    setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchCategories(); }, []);

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    await addDoc(collection(db, "categories"), { name: newCategory.trim(), createdAt: serverTimestamp() });
    setNewCategory("");
    toast.success("Category added");
    fetchCategories();
  };

  const deleteCategory = async (id) => {
    await deleteDoc(doc(db, "categories", id));
    toast.success("Deleted");
    fetchCategories();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Categories</h2>
      <div className="flex gap-2 mb-4">
        <input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="New category" className="input-field flex-grow" />
        <button onClick={addCategory} className="btn-gradient">Add</button>
      </div>
      <div className="space-y-2">
        {categories.map(cat => (
          <div key={cat.id} className="card flex justify-between items-center">
            <span>{cat.name}</span>
            <button onClick={() => deleteCategory(cat.id)} className="text-red-500">🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}
