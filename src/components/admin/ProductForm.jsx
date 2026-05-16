"use client";
import { useState } from "react";
import { useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProductForm({ onSubmit, initialData = {} }) {
  const [form, setForm] = useState({
    name: initialData.name || "",
    description: initialData.description || "",
    price: initialData.price || "",
    originalPrice: initialData.originalPrice || "",
    category: initialData.category || "",
    stock: initialData.stock || "",
    featured: initialData.featured || false,
    onSale: initialData.onSale || false,
  });
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCats = async () => {
      const snap = await getDocs(collection(db, "categories"));
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchCats();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form, images);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 max-w-2xl">
      <input name="name" value={form.name} onChange={handleChange} placeholder="Product Name" required className="input-field" />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="input-field" rows={3} />
      <div className="grid grid-cols-2 gap-4">
        <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price" required className="input-field" />
        <input name="originalPrice" type="number" value={form.originalPrice} onChange={handleChange} placeholder="Original Price" className="input-field" />
      </div>
      <select name="category" value={form.category} onChange={handleChange} required className="input-field">
        <option value="">Select Category</option>
        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
      </select>
      <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="Stock" className="input-field" />
      <label className="flex items-center gap-2">
        <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} /> Featured
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="onSale" checked={form.onSale} onChange={handleChange} /> On Sale
      </label>
      <input type="file" multiple onChange={handleImageChange} accept="image/*" className="input-field" />
      <button type="submit" className="btn-gradient w-full">Save Product</button>
    </form>
  );
}