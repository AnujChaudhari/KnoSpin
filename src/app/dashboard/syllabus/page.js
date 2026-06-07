"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast } from "react-hot-toast";

export default function SyllabusPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const q = query(collection(db, "syllabus"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      setFiles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetch();
  }, [user]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const storageRef = ref(storage, `syllabus/${user.uid}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on("state_changed",
      null,
      (err) => { toast.error("Upload failed"); setUploading(false); },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, "syllabus"), {
          userId: user.uid,
          fileName: file.name,
          downloadURL,
          uploadedAt: serverTimestamp(),
          fileType: file.type,
          isPublic: false,
        });
        toast.success("Uploaded!");
        setUploading(false);
        // Refresh list
        const q = query(collection(db, "syllabus"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        setFiles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    );
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "syllabus", id));
    setFiles(prev => prev.filter(f => f.id !== id));
    toast.success("Deleted");
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">My Syllabus</h1>
      <div className="mb-6">
        <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" />
        <button onClick={() => fileInputRef.current.click()} disabled={uploading} className="btn-gradient">
          {uploading ? "Uploading..." : "Upload Syllabus"}
        </button>
      </div>
      <div className="space-y-3">
        {files.map(file => (
          <div key={file.id} className="card flex justify-between items-center">
            <a href={file.downloadURL} target="_blank" className="text-primary-600 underline">{file.fileName}</a>
            <button onClick={() => handleDelete(file.id)} className="text-red-500 text-sm">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
