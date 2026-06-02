"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/* ────── प्रीमियम SVG सर्च आइकन ────── */
const ProfessionalSearchIcon = () => (
  <svg
    className="w-5 h-5 text-gray-400 transition-colors duration-200"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="my-6">
      <div className="relative max-w-2xl mx-auto group">
        {/* सर्च आइकन - बिलकुल Amazon/Flipkart की तरह */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <ProfessionalSearchIcon />
        </div>

        {/* इनपुट फील्ड */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-12 pr-20 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none transition-all duration-200 shadow-sm hover:shadow-md dark:placeholder-gray-400"
        />

        {/* सर्च बटन */}
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-5 py-2 rounded-xl text-sm transition-all duration-200 active:scale-95"
        >
          Search
        </button>
      </div>
    </form>
  );
}
