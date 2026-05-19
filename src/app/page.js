"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, limit, getDocs, orderBy } from "firebase/firestore";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import Newsletter from "@/components/Newsletter";
import HeroBanner from "@/components/HeroBanner";
import { HiFire, HiTrendingUp, HiTag } from "react-icons/hi";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [sale, setSale] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const snap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc"), limit(8)));
      const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeatured(products.filter(p => p.featured));
      setTrending(products.slice(0, 4));
      setSale(products.filter(p => p.onSale));
      const catSnap = await getDocs(collection(db, "categories"));
      setCategories(catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchData();
  }, []);

  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto">
      {/* Hero Banner with slider */}
      <HeroBanner />

      {/* Search */}
      <SearchBar />

      {/* Categories */}
      {categories.length > 0 && (
        <section className="my-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><HiTag /> Shop by Category</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {categories.map(cat => (
              <a key={cat.id} href={`/products?category=${cat.id}`} className="glassmorphism min-w-[120px] p-4 rounded-xl flex flex-col items-center text-center snap-start">
                <img src={cat.image || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded-full object-cover mb-2" />
                <span className="text-sm font-medium">{cat.name}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="my-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><HiFire className="text-red-500" /> Featured Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="my-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><HiTrendingUp /> Trending Now</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {trending.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Flash Sale */}
      {sale.length > 0 && (
        <section className="my-10 bg-red-50 dark:bg-red-900/20 rounded-3xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">⚡ Flash Sale</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sale.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <Newsletter />
    </div>
  );
}
