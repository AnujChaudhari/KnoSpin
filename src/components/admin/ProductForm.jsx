"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "react-hot-toast";

// Premium SVG Icons (Inline)
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21,15 16,10 5,21" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

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
    isDigital: initialData.isDigital || false,
    digitalCategory: initialData.digitalCategory || "",
    downloadLimit: initialData.downloadLimit || 5,
    digitalUrl: initialData.digitalUrl || "",
    coinPrice: initialData.coinPrice || "",           // ✅ NEW FIELD
  });
  const [images, setImages] = useState([]);
  const [digitalFile, setDigitalFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState(null);
  const [newCategoryPreview, setNewCategoryPreview] = useState(null);
  const [addingCategory, setAddingCategory] = useState(false);

  // Auto-calculate sale price
  const [salePrice, setSalePrice] = useState(initialData.price || "");
  const [priceError, setPriceError] = useState("");

  useEffect(() => {
    const orig = parseFloat(form.originalPrice);
    const disc = parseFloat(form.discountPercentage);
    if (!isNaN(orig) && orig > 0) {
      if (!isNaN(disc) && disc >= 0 && disc <= 100) {
        const discounted = orig - (orig * disc) / 100;
        setSalePrice(discounted.toFixed(2));
        setPriceError("");
      } else if (form.discountPercentage === "") {
        setSalePrice(orig.toFixed(2));
        setPriceError("");
      } else {
        setSalePrice("");
        setPriceError("Invalid discount %");
      }
    } else {
      setSalePrice("");
      setPriceError("Enter valid MRP");
    }
  }, [form.originalPrice, form.discountPercentage]);

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

  const handleCategoryImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCategoryImage(file);
      setNewCategoryPreview(URL.createObjectURL(file));
    }
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
      setNewCategoryPreview(null);
      setShowCategoryModal(false);
      fetchCategories();
    } catch (err) {
      toast.error("Failed to add category");
    }
    setAddingCategory(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!salePrice || salePrice === "0.00") {
      toast.error("Please set a valid Original Price and Discount");
      return;
    }

    let digitalFileUrl = initialData.digitalFileUrl || "";
    let digitalFileName = initialData.digitalFileName || "";

    if (form.isDigital && digitalFile) {
      toast.loading("Uploading digital file...");
      digitalFileUrl = await uploadToCloudinary(digitalFile);
      digitalFileName = digitalFile.name;
      toast.dismiss();
    }

    const finalData = {
      ...form,
      price: parseFloat(salePrice),
      digitalFileUrl,
      digitalFileName,
      digitalFileSize: digitalFile?.size || initialData.digitalFileSize || 0,
      digitalUrl: form.digitalUrl,
      coinPrice: form.coinPrice ? Number(form.coinPrice) : null,   // ✅ save coinPrice
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
            <input name="originalPrice" type="number" value={form.originalPrice} onChange={handleChange} placeholder="MRP" className="input-field" />
          </div>
          <div>
            <label className="text-sm">Discount (%)</label>
            <input name="discountPercentage" type="number" value={form.discountPercentage} onChange={handleChange} placeholder="e.g., 10" min="0" max="100" className="input-field" />
          </div>
        </div>

        {salePrice && (
          <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
            <span className="font-bold text-green-700 dark:text-green-400 text-lg">Sale Price: ₹{salePrice}</span>
            {form.discountPercentage > 0 && (
              <span className="text-sm bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full">
                {form.discountPercentage}% off
              </span>
            )}
            <span className="text-xs text-gray-500">(auto-calculated)</span>
          </div>
        )}
        {priceError && <p className="text-red-500 text-sm -mt-2">{priceError}</p>}

        <div>
          <label className="text-sm mb-1 block">Category</label>
          <div className="flex gap-2">
            <select name="category" value={form.category} onChange={handleChange} className="input-field flex-grow" required>
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button type="button" onClick={() => setShowCategoryModal(true)} className="btn-gradient flex items-center gap-1 px-3 whitespace-nowrap">
              <PlusIcon />
              <span className="hidden sm:inline">New Category</span>
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
            <input type="checkbox" name="isDigital" checked={form.isDigital} onChange={handleChange} className="w-4 h-4" />
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
                <label className="text-sm">Upload Digital File (Cloudinary)</label>
                <input type="file" onChange={(e) => setDigitalFile(e.target.files[0])} className="input-field" accept=".pdf,.zip,.rar,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.mp4,.mp3" />
                <p className="text-xs text-gray-400 mt-1">Max 50MB | PDF, ZIP, DOC, PPT, TXT, Images, Video</p>
              </div>

              {/* External URL field */}
              <div>
                <label className="text-sm">External Download URL (optional)</label>
                <input
                  type="url"
                  name="digitalUrl"
                  value={form.digitalUrl || ''}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/... or any direct link"
                  className="input-field"
                />
                <p className="text-xs text-gray-400 mt-1">If you prefer to use an external link, paste it here. It will be delivered uniquely per purchase.</p>
              </div>

              {/* Price in Coins – NEW */}
              <div>
                <label className="text-sm">Price in Coins (for digital products only)</label>
                <input
                  type="number"
                  name="coinPrice"
                  value={form.coinPrice || ''}
                  onChange={handleChange}
                  min={0}
                  placeholder="e.g., 100"
                  className="input-field w-32"
                />
                <p className="text-xs text-gray-400 mt-1">Leave 0 or empty to not allow coin purchase</p>
              </div>

              <div>
                <label className="text-sm">Download Limit</label>
                <input type="number" name="downloadLimit" value={form.downloadLimit} onChange={handleChange} min={1} max={100} className="input-field w-32" />
                <p className="text-xs text-gray-400 mt-1">Max downloads allowed per purchase (1-100)</p>
              </div>

              {/* ⚠️ Warning for free limits */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-xl text-xs text-yellow-700 dark:text-yellow-400">
                ⚠️ Using free services – large uploads may hit limits. If you face any issue, DM <strong>@QuickShopPro</strong> on Telegram.
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
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Add New Category</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-gray-600"><CloseIcon /></button>
            </div>
            <input
              type="text"
              placeholder="Category Name"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              className="input-field"
            />
            <div>
              <label className="text-sm mb-1 block flex items-center gap-1"><ImageIcon /> Category Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCategoryImageChange}
                className="input-field"
              />
              {newCategoryPreview && (
                <img src={newCategoryPreview} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-lg border" />
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCategoryModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={handleAddCategory} disabled={addingCategory} className="btn-gradient flex items-center gap-1">
                <PlusIcon /> {addingCategory ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
