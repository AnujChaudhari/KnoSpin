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
    // Digital product fields
    isDigital: initialData.isDigital || false,
    digitalCategory: initialData.digitalCategory || "",
    downloadLimit: initialData.downloadLimit || 5,
  });
  const [images, setImages] = useState([]);
  const [digitalFile, setDigitalFile] = useState(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let digitalFileUrl = initialData.digitalFileUrl || "";
    let digitalFileName = initialData.digitalFileName || "";
    
    // Upload digital file if new one selected
    if (form.isDigital && digitalFile) {
      toast.loading("Uploading digital file...");
      digitalFileUrl = await uploadToCloudinary(digitalFile);
      digitalFileName = digitalFile.name;
      toast.dismiss();
    }
    
    const finalData = {
      ...form,
      digitalFileUrl,
      digitalFileName,
      digitalFileSize: digitalFile?.size || initialData.digitalFileSize || 0,
    };
    
    onSubmit(finalData, images);
  };

  return (
    <>
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

        {/* Digital Product Section */}
        <div className="border-t pt-4 mt-2">
          <label className="flex items-center gap-2 mb-3 cursor-pointer">
            <input
              type="checkbox"
              name="isDigital"
              checked={form.isDigital}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <span className="font-semibold">Digital Product</span>
            <span className="text-xs text-gray-400">(PDF, ZIP, Course, eBook, etc.)</span>
          </label>

          {form.isDigital && (
            <div className="space-y-3 pl-6 border-l-2 border-purple-400">
              <div>
                <label className="text-sm">Digital Category</label>
                <select name="digitalCategory" value={form.digitalCategory} onChange={handleChange} className="input-field">
                  <option value="">Select Type</option>
                  <option value="pdf">📄 PDF Document</option>
                  <option value="zip">📦 ZIP File</option>
                  <option value="course">🎓 Online Course</option>
                  <option value="template">📋 Template</option>
                  <option value="notes">📝 Study Notes</option>
                  <option value="ai_prompt">🤖 AI Prompt</option>
                  <option value="ebook">📚 eBook</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm">Upload Digital File</label>
                <input
                  type="file"
                  onChange={(e) => setDigitalFile(e.target.files[0])}
                  className="input-field"
                  accept=".pdf,.zip,.rar,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.mp4,.mp3"
                />
                <p className="text-xs text-gray-400 mt-1">Max file size: 50MB | Supported: PDF, ZIP, DOC, PPT, TXT, Images, Video</p>
                {initialData.digitalFileName && !digitalFile && (
                  <p className="text-sm text-green-600 mt-1">✅ Current: {initialData.digitalFileName}</p>
                )}
              </div>
              
              <div>
                <label className="text-sm">Download Limit</label>
                <input
                  type="number"
                  name="downloadLimit"
                  value={form.downloadLimit}
                  onChange={handleChange}
                  min={1}
                  max={100}
                  className="input-field w-32"
                />
                <p className="text-xs text-gray-400 mt-1">Max downloads allowed per purchase (1-100)</p>
              </div>
            </div>
          )}
        </div>

        <input type="file" multiple onChange={handleImageChange} accept="image/*" className="input-field" />
        <p className="text-xs text-gray-400 -mt-2">Product images (not the digital file)</p>
        
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
