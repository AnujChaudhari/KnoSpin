"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", price: "", stock: "", description: "", category: ""
  });
  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.loading("Uploading...");
    const imageUrls = [];
    for (const file of images) {
      const url = await uploadToCloudinary(file);
      imageUrls.push(url);
    }
    await addDoc(collection(db, "products"), {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      images: imageUrls,
      createdAt: serverTimestamp(),
    });
    toast.dismiss();
    toast.success("Product added!");
    router.push("/admin/products");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Add Product</h2>
      <form onSubmit={handleSubmit} className="card space-y-4 max-w-xl">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Product Name" required className="input-field" />
        <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price" required className="input-field" />
        <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="Stock" className="input-field" />
        <input name="description" value={form.description} onChange={handleChange} placeholder="Description" className="input-field" />
        <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="input-field" />
        <input type="file" multiple onChange={handleImageChange} accept="image/*" className="input-field" />
        <button type="submit" className="btn-gradient w-full">Add Product</button>
      </form>
    </div>
  );
}
