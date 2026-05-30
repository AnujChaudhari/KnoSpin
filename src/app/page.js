"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, query, limit, getDocs, orderBy } from "firebase/firestore";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import Newsletter from "@/components/Newsletter";
import HeroBanner from "@/components/HeroBanner";
import SpinWheel from "@/components/SpinWheel";

/* ───────── प्रीमियम SVG आइकॉन ───────── */
const FireIcon = () => (
  <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2c-3.3 3.3-5 6.2-5 9.5 0 3.5 2.2 6.5 5 7.9.5-.3 1-.7 1.3-1.2 1-1.5.7-3.8-.3-5.6-.6-1-1.3-1.8-2-2.5-.5 1.2-.2 2.7.2 3.5.6 1.3 1.6 2.1 2.8 2.3 2.4.3 4.5-1.6 4.5-4 0-3.3-2.2-6.2-5.5-9.5z" />
  </svg>
);

const TrendingIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline strokeLinecap="round" strokeLinejoin="round" points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline strokeLinecap="round" strokeLinejoin="round" points="17 6 23 6 23 12" />
  </svg>
);

const TagIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line strokeLinecap="round" strokeLinejoin="round" x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline strokeLinecap="round" strokeLinejoin="round" points="23 4 23 10 17 10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
  </svg>
);

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [sale, setSale] = useState([]);
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const snap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc"), limit(8)));
      const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeatured(products.filter(p => p.featured));
      setTrending(products.slice(0, 4));
      setSale(products.filter(p => p.onSale));
      const catSnap = await getDocs(collection(db, "categories"));
      setCategories(catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Failed to fetch homepage data:", err);
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // जब यूजर वापस इस टैब पर आए तो डेटा रिफ्रेश करें
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto">
      {/* Hero Banner with slider */}
      <HeroBanner />

      {/* Search */}
      <SearchBar />

      {/* Daily Spin Wheel Section */}
      <section className="my-10">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">🎡 Daily Spin & Win</h2>
          <SpinWheel />
        </div>
      </section>

      {/* Categories */}
      <section className="my-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TagIcon /> Shop by Category
          </h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            title="Refresh categories"
          >
            <RefreshIcon />
          </button>
        </div>
        {categories.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {categories.map(cat => (
              <a
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="glassmorphism min-w-[120px] p-4 rounded-xl flex flex-col items-center text-center snap-start"
              >
                <img
                  src={cat.image || 'https://via.placeholder.com/50'}
                  alt={cat.name}
                  className="w-12 h-12 rounded-full object-cover mb-2"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/50'; }}
                />
                <span className="text-sm font-medium">{cat.name}</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">No categories found. Add some from admin panel.</p>
        )}
      </section>

      {/* Featured Products */}
      <section className="my-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FireIcon /> Featured Products
        </h2>
        {featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">No featured products yet.</p>
        )}
      </section>

      {/* Trending */}
      <section className="my-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <TrendingIcon /> Trending Now
        </h2>
        {trending.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trending.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">No trending products yet.</p>
        )}
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
