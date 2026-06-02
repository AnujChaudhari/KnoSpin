"use client";
import { useState } from "react";

export default function QuestionForm({ onSubmit, onCancel, initialData = {} }) {
  const [form, setForm] = useState({
    question: initialData.question || "",
    options: initialData.options || ["", "", "", ""],
    correct: initialData.correct || 0,
  });

  const handleOptionChange = (idx, value) => {
    const newOptions = [...form.options];
    newOptions[idx] = value;
    setForm({ ...form, options: newOptions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        name="question"
        value={form.question}
        onChange={(e) => setForm({ ...form, question: e.target.value })}
        placeholder="Question"
        required
        className="input-field"
      />
      {form.options.map((opt, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            type="radio"
            name="correct"
            checked={form.correct === idx}
            onChange={() => setForm({ ...form, correct: idx })}
            className="w-4 h-4"
          />
          <input
            value={opt}
            onChange={(e) => handleOptionChange(idx, e.target.value)}
            placeholder={`Option ${idx+1}`}
            required
            className="input-field flex-grow"
          />
        </div>
      ))}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-lg">Cancel</button>
        <button type="submit" className="btn-gradient">Save Question</button>
      </div>
    </form>
  );
}
