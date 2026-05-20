"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "react-hot-toast";

export default function ProductForm({ onSubmit, initialData = {} }) {
  const [form, setForm] = useState({
    name: initialData.name || "",
    description: initialData.description || "",
    price: initialData.price || "",
    originalPrice: initialData.originalPrice || "",
    discountPercentage: initialData.discountPercentage || "",
    category: initialData.category || "",
    stock: initialData.stock || "",
    featured: initialData.featured || false,
    onSale: initialData.onSale || false,
  });
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState(null);
  const [addingCategory, setAddingCategory] = useState(false);

  // Fetch existing categories
  const fetchCategories = async () => {
    const snap = await getDocs(collection(db, "categories"));
    setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return toast.error("Category name required");
    if (!newCategoryImage) return toast.error("Please select an image for category");
    setAddingCategory(true);
    try {
      toast.loading("Uploading category image...");
      const imageUrl = await uploadToCloudinary(newCategoryImage);
      toast.dismiss();
      await addDoc(collection(db, "categories"), {
        name: newCategoryName.trim(),
        image: imageUrl,
        createdAt: serverTimestamp(),
      });
      toast.success("Category added!");
      setNewCategoryName("");
      setNewCategoryImage(null);
      setShowCategoryModal(false);
      fetchCategories(); // Refresh dropdown
    } catch (err) {
      toast.error("Failed to add category");
    }
    setAddingCategory(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form, images);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="card space-y-4 max-w-2xl">
        {/* ... existing fields ... */}
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

        {/* Category Selection with Add New */}
        <div>
          <label className="text-sm mb-1 block">Category</label>
          <div className="flex gap-2">
            <select name="category" value={form.category} onChange={handleChange} className="input-field flex-grow" required>
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button type="button" onClick={() => setShowCategoryModal(true)} className="btn-gradient whitespace-nowrap px-3">
              + New Category
            </button>
          </div>
        </div>

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

      {/* Modal for adding new category */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCategoryModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold">Add New Category</h3>
            <input
              type="text"
              placeholder="Category Name"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              className="input-field"
            />
            <input
              type="file"
              accept="image/*"
              onChange={e => setNewCategoryImage(e.target.files[0])}
              className="input-field"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCategoryModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={handleAddCategory} disabled={addingCategory} className="btn-gradient">
                {addingCategory ? "Adding..." : "Add Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
