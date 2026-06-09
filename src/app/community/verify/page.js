"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { compressImage } from "@/lib/compressImage";
import { useLocation } from "@/hooks/useLocation";
import { toast } from "react-hot-toast";
import Link from "next/link";

/* ────── Premium SVG Icons ────── */
const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const CameraIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="9" y1="6" x2="15" y2="6" />
    <line x1="9" y1="10" x2="15" y2="10" />
    <line x1="9" y1="14" x2="15" y2="14" />
    <line x1="9" y1="18" x2="15" y2="18" />
  </svg>
);

const BookIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 010-5H20" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default function StudentVerificationPage() {
  const { user } = useAuth();
  const { states, districts, loading: locLoading, getDistricts } = useLocation();

  const [form, setForm] = useState({
    studentName: "",
    schoolCollegeName: "",
    classCourse: "",
    city: "",
    state: "",
  });
  const [idCardFile, setIdCardFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if already submitted a pending verification
  useState(() => {
    if (!user) {
      setChecking(false);
      return;
    }
    const checkExisting = async () => {
      const q = query(
        collection(db, "studentVerifications"),
        where("userId", "==", user.uid),
        where("status", "in", ["pending", "approved"])
      );
      const snap = await getDocs(q);
      if (!snap.empty) setAlreadySubmitted(true);
      setChecking(false);
    };
    checkExisting();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // जब स्टेट बदले तो डिस्ट्रिक्ट लोड करें
    if (name === "state") {
      getDistricts(value);
      setForm(prev => ({ ...prev, city: "" })); // पुराना शहर हटाएँ
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setIdCardFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login first");
      return;
    }
    if (!idCardFile) {
      toast.error("Please upload your ID card image");
      return;
    }
    if (!form.studentName || !form.schoolCollegeName || !form.city || !form.state) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const compressed = await compressImage(idCardFile, 1024, 500);
      const imageUrl = await uploadToCloudinary(compressed);
      await addDoc(collection(db, "studentVerifications"), {
        userId: user.uid,
        ...form,
        idCardImage: imageUrl,
        status: "pending",
        submittedAt: serverTimestamp(),
      });
      toast.success("Verification request submitted successfully!");
      setAlreadySubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error("Submission failed, please try again");
    }
    setSubmitting(false);
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <p className="text-xl mb-4">Please login to verify your student identity.</p>
        <Link href="/login" className="btn-gradient inline-block">Login</Link>
      </div>
    );
  }

  if (checking || locLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-green-100 dark:bg-green-900/20 p-6 rounded-2xl mb-4">
          <CheckCircleIcon />
        </div>
        <h2 className="text-2xl font-bold mb-2">Verification Request Submitted ✅</h2>
        <p className="text-gray-500 mb-6">Your student verification is under review. We'll notify you once approved.</p>
        <Link href="/dashboard" className="btn-gradient">Go to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Student Verification 🎓</h1>
      <p className="text-gray-500 mb-8">Verify your student identity to join community groups</p>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {/* Student Name */}
        <div>
          <label className="text-sm flex items-center gap-1 mb-1"><UserIcon /> Full Name</label>
          <input
            name="studentName"
            value={form.studentName}
            onChange={handleChange}
            placeholder="e.g., Rahul Sharma"
            required
            className="input-field"
          />
        </div>

        {/* School / College Name */}
        <div>
          <label className="text-sm flex items-center gap-1 mb-1"><BuildingIcon /> School / College Name</label>
          <input
            name="schoolCollegeName"
            value={form.schoolCollegeName}
            onChange={handleChange}
            placeholder="e.g., Delhi University"
            required
            className="input-field"
          />
        </div>

        {/* Class / Course */}
        <div>
          <label className="text-sm flex items-center gap-1 mb-1"><BookIcon /> Class / Course</label>
          <input
            name="classCourse"
            value={form.classCourse}
            onChange={handleChange}
            placeholder="e.g., B.Sc. Computer Science"
            required
            className="input-field"
          />
        </div>

        {/* State & City (Dropdowns) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm flex items-center gap-1 mb-1"><MapPinIcon /> State</label>
            <select
              name="state"
              value={form.state}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="">Select State</option>
              {states.map(s => (
                <option key={s.state} value={s.state}>{s.state}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm flex items-center gap-1 mb-1"><MapPinIcon /> City</label>
            <select
              name="city"
              value={form.city}
              onChange={handleChange}
              required
              className="input-field"
              disabled={!form.state}
            >
              <option value="">Select City</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ID Card Upload */}
        <div>
          <label className="text-sm flex items-center gap-1 mb-1"><CameraIcon /> ID Card Photo (max 500KB after compression)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="input-field"
            required
          />
          {idCardFile && (
            <p className="text-xs text-green-600 mt-1">File selected: {idCardFile.name}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-gradient w-full flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <UploadIcon />
          )}
          {submitting ? "Submitting..." : "Submit for Verification"}
        </button>
      </form>
    </div>
  );
}
