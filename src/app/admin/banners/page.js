"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "react-hot-toast";

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({ title: "", subtitle: "", link: "" });
  const [imageFile, setImageFile] = useState(null);

  const fetchBanners = async () => {
    const snap = await getDocs(collection(db, "heroBanners"));
    setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!imageFile) return toast.error("Select an image");
    toast.loading("Uploading...");
    const imageUrl = await uploadToCloudinary(imageFile);
    toast.dismiss();
    await addDoc(collection(db, "heroBanners"), {
      ...form,
      image: imageUrl,
      active: true,
      createdAt: serverTimestamp(),
    });
    toast.success("Banner added");
    setForm({ title: "", subtitle: "", link: "" });
    setImageFile(null);
    fetchBanners();
  };

  const toggleActive = async (id, currentActive) => {
    await updateDoc(doc(db, "heroBanners", id), { active: !currentActive });
    toast.success("Toggled");
    fetchBanners();
  };

  const deleteBanner = async (id) => {
    await deleteDoc(doc(db, "heroBanners", id));
    toast.success("Deleted");
    fetchBanners();
  };

  return (
    <div className="p-4 md:p-0">
      <h2 className="text-2xl font-bold mb-4">Hero Banners</h2>
      <form onSubmit={handleAdd} className="card space-y-4 mb-6">
        <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="input-field" />
        <input placeholder="Subtitle" value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} required className="input-field" />
        <input placeholder="Link (e.g., /products?filter=sale)" value={form.link} onChange={e => setForm({...form, link: e.target.value})} required className="input-field" />
        <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} required className="input-field" />
        <button type="submit" className="btn-gradient">Add Banner</button>
      </form>
      <div className="space-y-3">
        {banners.map(banner => (
          <div key={banner.id} className="card flex justify-between items-center">
            <div>
              <p className="font-semibold">{banner.title}</p>
              <p className="text-sm">{banner.subtitle}</p>
              <p className="text-xs text-gray-500">Active: {banner.active ? "Yes" : "No"}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggleActive(banner.id, banner.active)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                {banner.active ? "Hide" : "Show"}
              </button>
              <button onClick={() => deleteBanner(banner.id)} className="p-2 bg-red-100 text-red-500 rounded">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
