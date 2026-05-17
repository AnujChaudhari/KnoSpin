"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, query, limit, getDocs, orderBy } from "firebase/firestore";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import Newsletter from "@/components/Newsletter";
import { HiFire, HiTrendingUp, HiTag } from "react-icons/hi";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [sale, setSale] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchData() {
      // सभी प्रोडक्ट्स को हाल के अनुसार लाएँ
      const snap = await getDocs(
        query(collection(db, "products"), orderBy("createdAt", "desc"), limit(8))
      );
      const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setFeatured(products.filter(p => p.featured));
      setTrending(products.slice(0, 4));
      setSale(products.filter(p => p.onSale));

      // कैटेगरीज़
      const catSnap = await getDocs(collection(db, "categories"));
      setCategories(catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchData();
  }, []);

  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-6 rounded-3xl bg-gradient-to-r from-primary-600 to-purple-600 text-white p-6 md:p-12 flex flex-col md:flex-row items-center justify-between"
      >
        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold">Summer Sale is ON! 🔥</h1>
          <p className="text-lg opacity-90">Up to 60% off on selected items. Grab now!</p>
          <a
            href="/products?filter=sale"
            className="inline-block bg-white text-primary-600 font-semibold px-6 py-3 rounded-full mt-4 hover:bg-gray-100 transition"
          >
            Shop Now
          </a>
        </div>
        <img
          src="https://res.cloudinary.com/demo/image/upload/v1/samples/shoe.jpg"
          alt="hero"
          className="w-60 md:w-80 mt-6 md:mt-0 rounded-2xl"
        />
      </motion.section>

      {/* Search */}
      <SearchBar />

      {/* Categories */}
      {categories.length > 0 && (
        <section className="my-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <HiTag /> Shop by Category
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {categories.map(cat => (
              <a
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="glassmorphism min-w-[120px] p-4 rounded-xl flex flex-col items-center text-center snap-start"
              >
                <img
                  src={cat.image || "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/beach-boat.jpg"}
                  className="w-12 h-12 rounded-full object-cover mb-2"
                />
                <span className="text-sm font-medium">{cat.name}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="my-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <HiFire className="text-red-500" /> Featured Products
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
          {featured.length === 0 && (
            <p className="col-span-full text-center text-gray-500">
              No featured products yet. Add some from the admin panel.
            </p>
          )}
        </div>
      </section>

      {/* Trending */}
      <section className="my-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <HiTrendingUp /> Trending Now
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {trending.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
          {trending.length === 0 && (
            <p className="col-span-full text-center text-gray-500">
              No trending products yet.
            </p>
          )}
        </div>
      </section>

      {/* Flash Sale */}
      {sale.length > 0 && (
        <section className="my-10 bg-red-50 dark:bg-red-900/20 rounded-3xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">
            ⚡ Flash Sale
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sale.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
