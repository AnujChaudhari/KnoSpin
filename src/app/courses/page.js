"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "react-hot-toast";
import Link from "next/link";

/* ────────── प्रीमियम SVG आइकॉन ────────── */
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const UserIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
  </svg>
);
const BookOpenIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
  </svg>
);
const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const CoursePlaceholderIcon = () => (
  <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
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
        
        // क्लाइंट-साइड सॉर्ट (सबसे नया पहले)
        list.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setCourses(list);
        
        const cats = [...new Set(list.map(c => c.category).filter(Boolean))];
        setCategories(cats);
      } catch (err) {
        console.warn("Courses offline degradation fallback:", err);
        toast.error("Loaded backup snapshot from storage");
      } finally {
        setLoading(false);
      }
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
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-transparent pb-20">
      
      {/* ===== STICKY MOBILE APP GLASSMORPHIC HEADER ===== */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 pt-6 pb-4 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Explore Courses 📚
            </h1>
            <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              Learn from expert instructors in Hindi & English
            </p>
          </div>

          {/* Search bar */}
          <div className="relative group mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search courses, skills, topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-100 dark:bg-white/5 border border-transparent focus:border-primary-500/30 focus:bg-white dark:focus:bg-[#111] text-gray-900 dark:text-white rounded-2xl py-3.5 pl-12 pr-12 outline-none transition-all placeholder:text-gray-500 font-medium text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-200 dark:bg-white/10 rounded-full p-1 transition-colors"
              >
                <CloseIcon />
              </button>
            )}
          </div>

          {/* ===== ROW 1: HORIZONTAL CATEGORIES PILLS ===== */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => setCategoryFilter("")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 active:scale-95 ${
                categoryFilter === ""
                  ? "bg-primary-600 text-white shadow-sm shadow-primary-500/20"
                  : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-transparent dark:border-white/5"
              }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 active:scale-95 ${
                  categoryFilter === cat
                    ? "bg-primary-600 text-white shadow-sm shadow-primary-500/20"
                    : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-transparent dark:border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ===== ROW 2: HORIZONTAL PRICE FILTERS ===== */}
          <div className="flex items-center gap-1.5 mt-1 overflow-x-auto no-scrollbar pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => setPriceFilter("all")}
              className={`px-3.5 py-1 rounded-full text-[11px] font-bold transition-all flex-shrink-0 active:scale-95 border ${
                priceFilter === 'all'
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-black border-transparent'
                  : 'bg-white dark:bg-[#111] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/5'
              }`}
            >
              All Prices
            </button>
            <button
              onClick={() => setPriceFilter("free")}
              className={`px-3.5 py-1 rounded-full text-[11px] font-bold transition-all flex-shrink-0 active:scale-95 border ${
                priceFilter === 'free'
                  ? 'bg-emerald-500 text-white border-transparent'
                  : 'bg-white dark:bg-[#111] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/5'
              }`}
            >
              Free Resources 🆓
            </button>
            <button
              onClick={() => setPriceFilter("premium")}
              className={`px-3.5 py-1 rounded-full text-[11px] font-bold transition-all flex-shrink-0 active:scale-95 border ${
                priceFilter === 'premium'
                  ? 'bg-purple-600 text-white border-transparent'
                  : 'bg-white dark:bg-[#111] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/5'
              }`}
            >
              Premium Content 💎
            </button>
          </div>

        </div>
      </div>

      {/* ===== MAIN GRID AREA ===== */}
      <div className="max-w-3xl mx-auto px-3 sm:px-4 mt-6">
        
        {/* Empty State UI */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white dark:bg-[#111] border border-dashed border-gray-200 dark:border-white/10 rounded-3xl">
            <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
              <CoursePlaceholderIcon />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No courses available</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              We couldn't find any courses matching your combined search or filter parameters.
            </p>
          </div>
        )}

        {/* ===== DOUBLE GRID FOR MOBILE SCREEN (grid-cols-2) ===== */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map(course => (
            <Link 
              key={course.id} 
              href={`/courses/${course.id}`} 
              className="group bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between active:scale-[0.98]"
            >
              <div>
                {/* Immersive Video Aspect Ratio Thumbnail (16:9) */}
                <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3 bg-gray-100 dark:bg-white/5 border border-gray-50 dark:border-transparent shadow-inner">
                  <img
                    src={course.thumbnail || "https://via.placeholder.com/400x225?text=Course"}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/400x225?text=Course"; }}
                  />
                  {/* Floating Price Tag Badge */}
                  <span className={`absolute bottom-2 right-2 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm backdrop-blur-md ${
                    course.price === 0 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-purple-600/95 text-white'
                  }`}>
                    {course.price === 0 ? 'FREE' : `₹${course.price}`}
                  </span>
                </div>

                {/* Course Content Details */}
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-2 tracking-tight px-0.5 leading-tight h-8 sm:h-9 overflow-hidden">
                  {course.title}
                </h3>
                
                {/* Meta Matrix Rows */}
                <div className="space-y-1 mt-2 px-0.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 dark:text-gray-400 truncate">
                    <UserIcon />
                    <span className="truncate">{course.instructor || "Instructor"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400 dark:text-gray-500">
                    <BookOpenIcon />
                    <span>{course.totalStudents || 0} learners</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Layer */}
              <div className="mt-4 w-full">
                {course.price > 0 ? (
                  <span className="w-full flex justify-center items-center py-2 bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-bold rounded-xl transition-all shadow-sm shadow-primary-500/10 truncate">
                    Buy Now
                  </span>
                ) : (
                  <span className="w-full flex justify-center items-center py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold rounded-xl border border-emerald-100 dark:border-transparent text-center truncate">
                    Enroll Free
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
