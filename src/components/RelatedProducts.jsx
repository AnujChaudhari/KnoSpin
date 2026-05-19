"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import ProductCard from "@/components/ProductCard";

export default function RelatedProducts({ category, currentProductId }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!category) return;
    const fetchRelated = async () => {
      const q = query(collection(db, "products"), where("category", "==", category));
      const snap = await getDocs(q);
      const all = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // मौजूदा प्रोडक्ट हटाएँ और अधिकतम 4 दिखाएँ
      const filtered = all.filter(p => p.id !== currentProductId).slice(0, 4);
      setProducts(filtered);
    };
    fetchRelated();
  }, [category, currentProductId]);

  if (products.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold mb-6">You May Also Like</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
