"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";

export default function CertificatePage() {
  const params = useParams();
  const courseId = params.courseId;
  const searchParams = useSearchParams();
  const certId = searchParams.get("certId");

  const [cert, setCert] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!certId) return;
    const fetch = async () => {
      const certSnap = await getDoc(doc(db, "certificates", certId));
      if (certSnap.exists()) setCert(certSnap.data());
      const courseSnap = await getDoc(doc(db, "courses", courseId));
      if (courseSnap.exists()) setCourse(courseSnap.data());
      setLoading(false);
    };
    fetch();
  }, [certId, courseId]);

  if (loading) return <div className="flex justify-center min-h-screen items-center"><div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (!cert || !course) return <div className="text-center py-12">Certificate not found</div>;

  const verificationUrl = `https://quickshoppro.vercel.app/verify-certificate?certId=${certId}`;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="relative bg-white dark:bg-gray-800 p-8 md:p-12 rounded-2xl shadow-2xl border-4 border-primary-500" id="certificate-content">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">Quick Shop</h1>
        </div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Certificate of Completion</h2>
          <p className="text-gray-500 mt-2">This is to certify that</p>
          <p className="text-3xl font-bold mt-2">{cert.userName}</p>
          <p className="text-gray-600 mt-4">has successfully completed the course</p>
          <p className="text-2xl font-bold mt-2">{course.title}</p>
          <p className="text-gray-600 mt-4">with a score of <strong>{cert.score}/{cert.total}</strong> on {new Date(cert.issuedAt?.toDate()).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex justify-between items-end mt-10">
          {/* QR Code */}
          <div>
            <QRCodeSVG value={verificationUrl} size={120} />
            <p className="text-xs mt-2 text-gray-500">Scan to verify</p>
          </div>
          {/* Signature / Stamp placeholder */}
          <div className="text-center">
            <div className="w-32 h-1 bg-gray-400 mb-1"></div>
            <p className="text-sm text-gray-500">Authorized Signatory</p>
          </div>
        </div>
      </div>
      <div className="text-center mt-8 no-print">
        <button onClick={() => window.print()} className="btn-gradient mr-4">Print Certificate</button>
      </div>
    </div>
  );
}
