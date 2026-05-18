"use client";
export const dynamic = 'force-dynamic';

import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "react-hot-toast";
import ProductForm from "@/components/admin/ProductForm";

export default function AddProductPage() {
  const router = useRouter();

  const handleSubmit = async (form, images) => {
    toast.loading("Uploading images...");
    const imageUrls = [];
    for (const file of images) {
      const url = await uploadToCloudinary(file);
      imageUrls.push(url);
    }
    toast.dismiss();
    await addDoc(collection(db, "products"), {
      ...form,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      stock: Number(form.stock),
      images: imageUrls,
      createdAt: serverTimestamp(),
    });
    toast.success("Product added!");
    router.push("/admin/products");
  };

  return (
    <div className="p-4 md:p-0">
      <h2 className="text-2xl font-bold mb-6">Add Product</h2>
      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
}
