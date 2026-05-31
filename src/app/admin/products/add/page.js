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

  const handleSubmit = async (formData, images) => {
    // 🛡️ सुरक्षा जाँच – प्राइस 0 या गायब हो तो एरर दें
    if (!formData.price || Number(formData.price) <= 0) {
      toast.error("Please set a valid Original Price and Discount. Price cannot be zero.");
      return;
    }

    toast.loading("Uploading images...");
    const imageUrls = [];
    for (const file of images) {
      const url = await uploadToCloudinary(file);
      imageUrls.push(url);
    }
    toast.dismiss();

    // Generate product code (Q00001...)
    const counterRef = doc(db, "counters", "productCode");
    const counterSnap = await getDoc(counterRef);
    let nextNumber = 1;
    if (counterSnap.exists()) {
      nextNumber = counterSnap.data().value + 1;
      await updateDoc(counterRef, { value: increment(1) });
    } else {
      await setDoc(counterRef, { value: 1 });
    }
    const productCode = "Q" + String(nextNumber).padStart(5, '0');

    // Save product (digitalUrl automatically included via ...formData)
    await addDoc(collection(db, "products"), {
      ...formData,
      productCode,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      discountPercentage: formData.discountPercentage ? Number(formData.discountPercentage) : null,
      stock: Number(formData.stock),
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
