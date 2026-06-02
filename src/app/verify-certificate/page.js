"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function VerifyCertificatePage() {
  const searchParams = useSearchParams();
  const certId = searchParams.get("certId");

  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!certId) return;
    const fetch = async () => {
      const snap = await getDoc(doc(db, "certificates", certId));
      if (snap.exists()) setCert(snap.data());
      setLoading(false);
    };
    fetch();
  }, [certId]);

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (!cert) return <div className="text-center py-16"><h2 className="text-2xl font-bold text-red-600">Certificate Not Found</h2><p className="text-gray-500">The certificate ID is invalid.</p></div>;

  return (
    <div className="max-w-xl mx-auto p-4 py-12">
      <div className="card text-center space-y-4">
        <h1 className="text-2xl font-bold text-green-600">✅ Certificate Verified</h1>
        <p><strong>Name:</strong> {cert.userName}</p>
        <p><strong>Course:</strong> {cert.courseTitle}</p>
        <p><strong>Score:</strong> {cert.score}/{cert.total}</p>
        <p><strong>Issued on:</strong> {new Date(cert.issuedAt?.toDate()).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p className="text-xs text-gray-400 mt-4">This certificate was issued by Quick Shop.</p>
      </div>
    </div>
  );
}
