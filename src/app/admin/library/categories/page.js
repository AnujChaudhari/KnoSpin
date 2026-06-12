"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-hot-toast";

export default function AdminLibraryCategories() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState("");

  const fetchCategories = async () => {
    const snap = await getDocs(collection(db, "libraryCategories"));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    list.sort((a,b) => (a.order||0)-(b.order||0));
    setCategories(list);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addDoc(collection(db, "libraryCategories"), { name: newName.trim(), order: categories.length + 1, createdAt: serverTimestamp() });
    setNewName("");
    toast.success("Category added");
    fetchCategories();
  };

  const handleUpdate = async (id) => {
    await updateDoc(doc(db, "libraryCategories", id), { name: editName });
    setEditing(null);
    toast.success("Updated");
    fetchCategories();
  };

  const handleDelete = async (id) => {
    if (confirm("Delete category?")) {
      await deleteDoc(doc(db, "libraryCategories", id));
      toast.success("Deleted");
      fetchCategories();
    }
  };

  return (
    <div className="p-4 md:p-0">
      <h2 className="text-2xl font-bold mb-4">Library Categories</h2>
      <div className="flex gap-2 mb-6">
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New category name" className="input-field flex-grow" />
        <button onClick={handleAdd} className="btn-gradient">Add</button>
      </div>
      <div className="space-y-2">
        {categories.map(cat => (
          <div key={cat.id} className="card flex justify-between items-center">
            {editing === cat.id ? (
              <div className="flex gap-2 flex-grow">
                <input value={editName} onChange={e => setEditName(e.target.value)} className="input-field flex-grow" />
                <button onClick={() => handleUpdate(cat.id)} className="btn-gradient text-sm">Save</button>
                <button onClick={() => setEditing(null)} className="text-sm">Cancel</button>
              </div>
            ) : (
              <>
                <span>{cat.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(cat.id); setEditName(cat.name); }} className="text-primary-600">Edit</button>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-500">Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
