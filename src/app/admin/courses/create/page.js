"use client";
export const dynamic = 'force-dynamic';

import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "react-hot-toast";
import CourseForm from "@/components/admin/CourseForm";

export default function CreateCoursePage() {
  const router = useRouter();

  const handleSubmit = async (formData, thumbnailFile) => {
    toast.loading("Saving course...");
    let thumbnailUrl = "";
    if (thumbnailFile) {
      thumbnailUrl = await uploadToCloudinary(thumbnailFile);
    }
    await addDoc(collection(db, "courses"), {
      ...formData,
      thumbnail: thumbnailUrl,
      price: Number(formData.price),
      isPublished: formData.isPublished || false,
      totalStudents: 0,
      createdAt: serverTimestamp(),
    });
    toast.dismiss();
    toast.success("Course created!");
    router.push("/admin/courses");
  };

  return (
    <div className="p-4 md:p-0">
      <h2 className="text-2xl font-bold mb-6">Create New Course</h2>
      <CourseForm onSubmit={handleSubmit} />
    </div>
  );
}
