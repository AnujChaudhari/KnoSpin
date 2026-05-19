"use client";
import { useState } from "react";

export default function ProductForm({ onSubmit, initialData = {} }) {
  const [form, setForm] = useState({
    name: initialData.name || "",
    description: initialData.description || "",
    originalPrice: initialData.originalPrice || "",
    discountPercentage: initialData.discountPercentage || "",
    category: initialData.category || "",
    stock: initialData.stock || "",
    featured: initialData.featured || false,
    onSale: initialData.onSale || false,
  });
  const [images, setImages] = useState([]);
  const [price, setPrice] = useState(initialData.price || ""); // computed

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedForm = { ...form, [name]: type === "checkbox" ? checked : value };
    setForm(updatedForm);
    // Auto-calculate price when originalPrice or discountPercentage changes
    if (name === "originalPrice" || name === "discountPercentage") {
      const orig = parseFloat(updatedForm.originalPrice) || 0;
      const disc = parseFloat(updatedForm.discountPercentage) || 0;
      if (orig > 0 && disc >= 0 && disc <= 100) {
        const discounted = orig - (orig * disc / 100);
        setPrice(discounted.toFixed(2));
      } else {
        setPrice("");
      }
    }
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass computed price along with form
    const finalData = {
      ...form,
      price: price || form.originalPrice, // fallback if no discount
      discountPercentage: form.discountPercentage || null,
      originalPrice: form.originalPrice || null,
    };
    onSubmit(finalData, images);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 max-w-2xl">
      <input name="name" value={form.name} onChange={handleChange} placeholder="Product Name" required className="input-field" />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="input-field" rows={3} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm">Original Price (MRP)</label>
          <input name="originalPrice" type="number" value={form.originalPrice} onChange={handleChange} placeholder="Original Price" className="input-field" />
        </div>
        <div>
          <label className="text-sm">Discount (%)</label>
          <input name="discountPercentage" type="number" value={form.discountPercentage} onChange={handleChange} placeholder="e.g., 10" min="0" max="100" className="input-field" />
        </div>
      </div>

      {/* Show computed price if valid */}
      {price && (
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
          <span className="font-bold text-green-700 dark:text-green-400">Sale Price: ₹{price}</span>
          <span className="text-xs text-gray-500">(auto-calculated)</span>
        </div>
      )}

      <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="input-field" />
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
