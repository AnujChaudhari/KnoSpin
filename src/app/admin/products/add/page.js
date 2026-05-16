"use client";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

export default function AddProductPage() {
  const router = useRouter();

  const handleSubmit = async (formData, imageFiles) => {
    // Upload images to Cloudinary
    toast.loading("Uploading images...");
    const imageUrls = [];
    for (const file of imageFiles) {
      const url = await uploadToCloudinary(file);
      imageUrls.push(url);
    }
    toast.dismiss();
    await addDoc(collection(db, "products"), {
      ...formData,
      images: imageUrls,
      createdAt: serverTimestamp(),
    });
    toast.success("Product added!");
    router.push("/admin/products");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
}