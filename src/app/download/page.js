"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";

export default function DownloadPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading"); // loading | error | redirecting
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid download link.");
      return;
    }
    const downloadFile = async () => {
      const docRef = doc(db, "downloads", token);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        setStatus("error");
        setMessage("Download not found or link expired.");
        return;
      }
      const data = snap.data();
      if (data.downloadCount >= data.downloadLimit) {
        setStatus("error");
        setMessage("Download limit exceeded. Contact support: @QuickShopPro on Telegram.");
        return;
      }

      // Increment download count
      await updateDoc(docRef, {
        downloadCount: increment(1),
        lastDownload: serverTimestamp(),
      });

      // Determine URL: prefer external URL, then uploaded file
      const url = data.digitalUrl || data.digitalFileUrl;
      if (!url) {
        setStatus("error");
        setMessage("No downloadable file found. DM @QuickShopPro on Telegram.");
        return;
      }

      // Redirect to actual file
      window.location.href = url;
    };

    downloadFile();
  }, [token]);

  if (status === "loading") return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-lg">Preparing your download...</p>
    </div>
  );

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Download Error</h1>
        <p className="text-gray-600">{message}</p>
        <p className="text-xs text-gray-400">If you believe this is a mistake, contact <strong>@QuickShopPro</strong> on Telegram.</p>
      </div>
    </div>
  );
}
