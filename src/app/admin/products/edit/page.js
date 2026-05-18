"use client";
export const dynamic = 'force-dynamic';

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "react-hot-toast";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const snap = await getDoc(doc(db, "products", productId));
      if (snap.exists()) setInitialData({ id: snap.id, ...snap.data() });
      else { toast.error("Not found"); router.push("/admin/products"); }
    };
    fetchProduct();
  }, [productId, router]);

  const handleSubmit = async (form, images) => {
    const imageUrls = [...(initialData.images || [])];
    if (images.length) {
      toast.loading("Uploading...");
      for (const file of images) {
        const url = await uploadToCloudinary(file);
        imageUrls.push(url);
      }
      toast.dismiss();
    }
    await updateDoc(doc(db, "products", productId), {
      ...form,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      stock: Number(form.stock),
      images: imageUrls,
      updatedAt: serverTimestamp(),
    });
    toast.success("Updated!");
    router.push("/admin/products");
  };

  if (!initialData) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 md:p-0">
      <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
      <ProductForm onSubmit={handleSubmit} initialData={initialData} />
    </div>
  );
}
