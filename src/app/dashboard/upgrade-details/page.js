"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const classOptions = ["11th", "12th", "1st Year", "2nd Year", "3rd Year", "4th Year", "Other"];
const universityBoards = ["CBSE", "ICSE", "State Board", "University of Delhi", "Mumbai University", "Other"];

export default function UpgradeDetailsPage() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "premium_lite";
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    classYear: "",
    university: "",
    subjects: [],
    syllabusFile: null,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectsChange = (e) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    setForm(prev => ({ ...prev, subjects: values }));
  };

  const handleFileChange = (e) => {
    setForm(prev => ({ ...prev, syllabusFile: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Login required");
    if (!form.fullName || !form.phone || !form.classYear || !form.university) {
      return toast.error("Please fill all required fields");
    }
    setSaving(true);
    try {
      // Upload syllabus if provided (use Cloudinary or Firebase Storage)
      let syllabusUrl = "";
      if (form.syllabusFile) {
        // For simplicity, use Cloudinary upload (already exists)
        const { uploadToCloudinary } = await import("@/lib/cloudinary");
        syllabusUrl = await uploadToCloudinary(form.syllabusFile);
      }
      await updateDoc(doc(db, "users", user.uid), {
        premiumDetails: {
          fullName: form.fullName,
          phone: form.phone,
          classYear: form.classYear,
          university: form.university,
          subjects: form.subjects,
          syllabusUrl,
          verified: false,
        },
      });
      toast.success("Details saved! Redirecting to payment...");
      // Redirect to payment page with plan
      router.push(`/checkout?plan=${plan}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save details");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
      <p className="text-gray-500 mb-8">This information is required before upgrading to {plan === 'premium_pro' ? 'Premium Pro' : 'Premium Lite'}.</p>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="text-sm">Full Name *</label>
          <input name="fullName" value={form.fullName} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="text-sm">Phone Number *</label>
          <input name="phone" type="tel" pattern="[0-9]{10}" value={form.phone} onChange={handleChange} required className="input-field" placeholder="10-digit mobile number" />
        </div>
        <div>
          <label className="text-sm">Class / Year *</label>
          <select name="classYear" value={form.classYear} onChange={handleChange} required className="input-field">
            <option value="">Select</option>
            {classOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm">University / Board *</label>
          <select name="university" value={form.university} onChange={handleChange} required className="input-field">
            <option value="">Select</option>
            {universityBoards.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm">Subjects Studying (optional)</label>
          <select multiple name="subjects" value={form.subjects} onChange={handleSubjectsChange} className="input-field h-24">
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
            <option value="Computer Science">Computer Science</option>
            <option value="English">English</option>
            <option value="Other">Other</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">Hold Ctrl (Cmd) to select multiple</p>
        </div>
        <div>
          <label className="text-sm">Upload Syllabus (optional)</label>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="input-field" />
        </div>
        <button type="submit" disabled={saving} className="btn-gradient w-full">
          {saving ? "Saving..." : "Continue to Payment"}
        </button>
      </form>
    </div>
  );
}
