"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";

/* ────────── प्रीमियम SVG आइकॉन (कोई बदलाव नहीं) ────────── */
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
);
const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
  </svg>
);
const BookOpenIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
  </svg>
);

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const q = query(collection(db, "courses"), where("isPublished", "==", true));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // 🔽 क्लाइंट-साइड सॉर्ट (सबसे नया पहले)
        list.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setCourses(list);
        const cats = [...new Set(list.map(c => c.category).filter(Boolean))];
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load courses:", err);
      }
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const filtered = courses.filter(c => {
    const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter ? c.category === categoryFilter : true;
    const matchPrice = priceFilter === "all"
      ? true
      : priceFilter === "free" ? (c.price === 0) : (c.price > 0);
    return matchSearch && matchCategory && matchPrice;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">Explore Courses 📚</h1>
      <p className="text-gray-500 mb-8">Learn from expert instructors in Hindi & English</p>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <span className="absolute left-3 top-3 text-gray-400"><SearchIcon /></span>
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-field sm:w-48"
        >
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <div className="flex gap-2">
          <button
            onClick={() => setPriceFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${priceFilter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
          >
            All
          </button>
          <button
            onClick={() => setPriceFilter("free")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${priceFilter === 'free' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
          >
            Free 🆓
          </button>
          <button
            onClick={() => setPriceFilter("premium")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${priceFilter === 'premium' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
          >
            Premium 💎
          </button>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-2xl">😕</p>
          <p className="text-gray-500 mt-2">No courses found. Try a different search!</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(course => (
          <Link key={course.id} href={`/courses/${course.id}`} className="card group hover:shadow-lg transition">
            <div className="relative w-full h-40 rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-700">
              <img
                src={course.thumbnail || "https://via.placeholder.com/400x200?text=Course+Image"}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.target.src = "https://via.placeholder.com/400x200?text=Course+Image"; }}
              />
              <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full ${course.price === 0 ? 'bg-green-500 text-white' : 'bg-purple-500 text-white'}`}>
                {course.price === 0 ? 'Free' : `₹${course.price}`}
              </span>
            </div>
            <h3 className="font-bold text-lg line-clamp-2 mb-1">{course.title}</h3>
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1"><UserIcon /> {course.instructor || "Instructor"}</span>
              <span className="flex items-center gap-1"><BookOpenIcon /> {course.totalStudents || 0} learners</span>
            </div>
            {course.price > 0 ? (
              <span className="btn-gradient text-xs py-1 px-4 inline-block">Buy Now</span>
            ) : (
              <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs py-1 px-4 rounded-full font-medium">Enroll for Free</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
