"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc, query, where } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { HiZoomIn, HiCheck, HiX, HiSearch } from "react-icons/hi";

/* ────── Premium SVG Icons ────── */
const ZoomIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const ApproveIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const RejectIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectingId, setRejectingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  const fetchVerifications = async () => {
    try {
      const snap = await getDocs(collection(db, "studentVerifications"));
      let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Client-side sort – newest first
      list.sort((a, b) => (b.submittedAt?.toMillis() || 0) - (a.submittedAt?.toMillis() || 0));
      setVerifications(list);
    } catch (err) {
      toast.error("Failed to load verifications");
    }
    setLoading(false);
  };

  useEffect(() => { fetchVerifications(); }, []);

  // Approve handler
  const handleApprove = async (verification) => {
    try {
      // Update user document
      await updateDoc(doc(db, "users", verification.userId), {
        studentVerified: true,
        verificationId: verification.id,
        city: verification.city,
        state: verification.state,
      });
      // Update verification record
      await updateDoc(doc(db, "studentVerifications", verification.id), {
        status: "approved",
        adminNote: "Approved",
      });
      toast.success("Student approved successfully!");
      fetchVerifications();
    } catch (err) {
      console.error(err);
      toast.error("Approval failed");
    }
  };

  // Reject handler
  const handleReject = async (verification) => {
    if (!rejectNote.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    try {
      await updateDoc(doc(db, "studentVerifications", verification.id), {
        status: "rejected",
        adminNote: rejectNote,
      });
      toast.success("Student verification rejected");
      setRejectingId(null);
      setRejectNote("");
      fetchVerifications();
    } catch (err) {
      console.error(err);
      toast.error("Rejection failed");
    }
  };

  // Filtering
  const filtered = verifications.filter(v => {
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    const matchSearch = v.studentName?.toLowerCase().includes(search.toLowerCase()) ||
                        v.userId?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-0">
      <h2 className="text-2xl font-bold mb-6">Student Verifications</h2>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <span className="absolute left-3 top-3 text-gray-400"><HiSearch /></span>
          <input
            type="text"
            placeholder="Search by name or user ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field sm:w-40"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 py-12">No verification requests found.</p>
      )}

      <div className="space-y-4">
        {filtered.map(verification => (
          <div key={verification.id} className="card flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h4 className="font-bold text-lg">{verification.studentName}</h4>
              <p className="text-sm text-gray-500">{verification.schoolCollegeName}</p>
              <p className="text-xs text-gray-400">{verification.classCourse}</p>
              <p className="text-xs text-gray-400">{verification.city}, {verification.state}</p>
              <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                verification.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700' :
                verification.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700' :
                'bg-red-100 dark:bg-red-900/30 text-red-700'
              }`}>
                {verification.status?.toUpperCase()}
              </span>
              {verification.adminNote && verification.status === 'rejected' && (
                <p className="text-xs text-red-500 mt-1">Reason: {verification.adminNote}</p>
              )}
            </div>
            <div className="flex gap-2 items-start self-end sm:self-center">
              {/* Zoom ID Card */}
              <button
                onClick={() => setSelectedImage(verification.idCardImage)}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                title="Zoom ID Card"
              >
                <ZoomIcon />
              </button>
              {/* Download ID Card */}
              <a
                href={verification.idCardImage}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                title="Download ID Card"
              >
                <DownloadIcon />
              </a>
              {/* Approve button (only for pending) */}
              {verification.status === 'pending' && (
                <button
                  onClick={() => handleApprove(verification)}
                  className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg hover:bg-green-200"
                  title="Approve"
                >
                  <ApproveIcon />
                </button>
              )}
              {/* Reject button (only for pending) */}
              {verification.status === 'pending' && (
                <button
                  onClick={() => setRejectingId(verification.id)}
                  className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-200"
                  title="Reject"
                >
                  <RejectIcon />
                </button>
              )}
            </div>

            {/* Rejection Reason Modal */}
            {rejectingId === verification.id && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setRejectingId(null)}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
                  <h3 className="text-xl font-bold">Reject Verification</h3>
                  <textarea
                    rows={3}
                    placeholder="Reason for rejection..."
                    value={rejectNote}
                    onChange={e => setRejectNote(e.target.value)}
                    className="input-field"
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setRejectingId(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
                    <button onClick={() => handleReject(verification)} className="btn-gradient">Reject</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Zoom Modal for ID Card */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
            <img src={selectedImage} alt="ID Card" className="max-w-full max-h-[80vh] object-contain rounded-2xl" />
            <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 bg-white text-black p-2 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
