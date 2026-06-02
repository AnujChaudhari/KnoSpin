"use client";
import { useState } from "react";

export default function LessonForm({ onSubmit, onCancel, initialData = {} }) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    videoId: initialData.videoId || "",
    content: initialData.content || "",
    duration: initialData.duration || "",
    freePreview: initialData.freePreview || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input name="title" value={form.title} onChange={handleChange} placeholder="Lesson Title" required className="input-field" />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short description" className="input-field" rows={2} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm">YouTube Video ID</label>
          <input name="videoId" value={form.videoId} onChange={handleChange} placeholder="dQw4w9WgXcQ" className="input-field" />
        </div>
        <div>
          <label className="text-sm">Duration (minutes)</label>
          <input name="duration" type="number" value={form.duration} onChange={handleChange} placeholder="10" className="input-field" />
        </div>
      </div>
      <textarea name="content" value={form.content} onChange={handleChange} placeholder="Lesson content (HTML allowed)" className="input-field" rows={5} />
      <label className="flex items-center gap-2">
        <input type="checkbox" name="freePreview" checked={form.freePreview} onChange={handleChange} /> Free Preview
      </label>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-lg">Cancel</button>
        <button type="submit" className="btn-gradient">Save Lesson</button>
      </div>
    </form>
  );
}
