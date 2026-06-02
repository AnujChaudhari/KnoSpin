"use client";
import { useState } from "react";

export default function CourseForm({ onSubmit, initialData = {} }) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    price: initialData.price ?? "",
    category: initialData.category || "",
    instructor: initialData.instructor || "",
    language: initialData.language || "hindi",
    isPublished: initialData.isPublished || false,
  });
  const [thumbnail, setThumbnail] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFileChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form, thumbnail);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 max-w-2xl">
      <input name="title" value={form.title} onChange={handleChange} placeholder="Course Title" required className="input-field" />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Course Description (HTML allowed)" className="input-field" rows={5} />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm">Price (₹) – 0 for free</label>
          <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="499" required className="input-field" />
        </div>
        <div>
          <label className="text-sm">Category</label>
          <input name="category" value={form.category} onChange={handleChange} placeholder="e.g., Technology" className="input-field" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm">Instructor Name</label>
          <input name="instructor" value={form.instructor} onChange={handleChange} placeholder="Instructor" className="input-field" />
        </div>
        <div>
          <label className="text-sm">Language</label>
          <select name="language" value={form.language} onChange={handleChange} className="input-field">
            <option value="hindi">Hindi</option>
            <option value="english">English</option>
            <option value="hinglish">Hinglish</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm">Course Thumbnail</label>
        <input type="file" onChange={handleFileChange} accept="image/*" className="input-field" />
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleChange} /> Publish immediately
      </label>
      <button type="submit" className="btn-gradient w-full">Save Course</button>
    </form>
  );
}
