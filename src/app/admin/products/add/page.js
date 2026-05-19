"use client";
export const dynamic = 'force-dynamic';

import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp, doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "react-hot-toast";
import ProductForm from "@/components/admin/ProductForm";

export default function AddProductPage() {
  const router = useRouter();

  const handleSubmit = async (form, images) => {
    toast.loading("Uploading...");
    const imageUrls = [];
    for (const file of images) {
      const url = await uploadToCloudinary(file);
      imageUrls.push(url);
    }
    toast.dismiss();

    // Generate product code
    const counterRef = doc(db, "counters", "productCode");
    const counterSnap = await getDoc(counterRef);
    let nextNumber = 1;
    if (counterSnap.exists()) {
      nextNumber = counterSnap.data().value + 1;
      await updateDoc(counterRef, { value: increment(1) });
    } else {
      await setDoc(counterRef, { value: 1 });
    }
    const productCode = "Q" + String(nextNumber).padStart(5, '0'); // e.g., Q00001

    await addDoc(collection(db, "products"), {
      ...form,
      productCode,
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
    <div>
      <h2 className="text-2xl font-bold mb-4">Add Product</h2>
      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
}
