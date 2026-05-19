"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast";
import ImageSlider from "@/components/ImageSlider";
import ReviewSection from "@/components/ReviewSection";
import RelatedProducts from "@/components/RelatedProducts";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id;
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      const snap = await getDoc(doc(db, "products", productId));
      if (snap.exists()) {
        setProduct({ id: snap.id, ...snap.data() });
      } else {
        toast.error("Product not found");
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="grid md:grid-cols-2 gap-6">
        <ImageSlider images={product.images} />
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          {product.productCode && (
            <p className="text-sm text-gray-500">Code: {product.productCode}</p>
          )}
          <p className="text-2xl font-bold text-primary-600">₹{product.price}</p>
          {product.originalPrice && (
            <p className="text-lg line-through text-gray-400">
              ₹{product.originalPrice}
            </p>
          )}
          <p className="text-gray-600 dark:text-gray-300">
            {product.description}
          </p>
          <p>Stock: {product.stock || 0}</p>
          <button
            onClick={() => {
              addToCart(product);
              toast.success("Added to cart!");
            }}
            className="btn-gradient w-full mt-4"
          >
            Add to Cart
          </button>
        </div>
      </div>
      <ReviewSection productId={product.id} />
              <RelatedProducts category={product.category} currentProductId={product.id} />
    </div>
  );
}
