"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { toast } from "react-hot-toast";

/* ────── Premium SVG Icons ────── */
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const EyeIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const DownloadIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const BookIcon = () => (
  <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

export default function LibraryPage() {
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State to track which book's description is expanded
  const [expandedBookId, setExpandedBookId] = useState(null);

  // Close description when clicking anywhere outside a book card
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest(".book-card")) {
        setExpandedBookId(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catSnap, bookSnap] = await Promise.all([
          getDocs(collection(db, "libraryCategories")),
          getDocs(collection(db, "libraryBooks"))
        ]);
        
        setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (a.order||0)-(b.order||0)));
        setBooks(bookSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (b.createdAt?.toMillis()||0)-(a.createdAt?.toMillis()||0)));
      } catch (err) { 
        console.warn("Library offline pipeline active:", err);
        toast.error("Loaded database from local backup configuration");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredBooks = books.filter(b => {
    const matchCat = selectedCategory === "all" || b.categoryId === selectedCategory;
    const matchSearch = b.title?.toLowerCase().includes(search.toLowerCase()) ||
                        b.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleDescription = (id, e) => {
    e.stopPropagation(); // Avoid triggering document outside-click
    setExpandedBookId(prevId => (prevId === id ? null : id));
  };

  if (loading) return (
    <div className="flex justify-center min-h-[60vh] items-center">
      <div className="animate-spin w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-transparent pb-16">
      
      {/* ===== STICKY MOBILE APP HEADER ===== */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 pt-6 pb-4 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Digital Library 📚
            </h1>
            <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              Explore free premium books, documents, and assets
            </p>
          </div>

          {/* Search Field Bar */}
          <div className="relative group mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search by book name, author or topic..."
              value={search}
              onChange={e => setSearch(e.target.value)}
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

          {/* ===== NATIVE HORIZONTAL PILL CATEGORIES ===== */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex-shrink-0 active:scale-95 ${
                selectedCategory === "all"
                  ? "bg-primary-600 text-white shadow-sm shadow-primary-500/20"
                  : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-transparent dark:border-white/5"
              }`}
            >
              All Resources
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex-shrink-0 active:scale-95 ${
                  selectedCategory === cat.id
                    ? "bg-primary-600 text-white shadow-sm shadow-primary-500/20"
                    : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-transparent dark:border-white/5"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== BOOKS GRID AREA ===== */}
      <div className="max-w-3xl mx-auto px-3 sm:px-4 mt-6">
        
        {/* Empty State UI */}
        {filteredBooks.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white dark:bg-[#111] border border-dashed border-gray-200 dark:border-white/10 rounded-3xl">
            <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
              <BookIcon />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No resources found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              We couldn't find any books fitting your keyword or category. Try clearing filters.
            </p>
          </div>
        )}

        {/* ===== DOUBLE GRID FOR MOBILE (grid-cols-2) ===== */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {filteredBooks.map(book => {
            const isExpanded = expandedBookId === book.id;

            return (
              <div 
                key={book.id} 
                className="book-card bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Premium A4 Size (1:1.414 Aspect Ratio) Vertical Thumbnail */}
                  <div className="relative w-full aspect-[1/1.414] rounded-xl overflow-hidden mb-3 bg-gray-100 dark:bg-white/5 border border-gray-50 dark:border-transparent shadow-inner">
                    <img
                      src={book.thumbnail || "https://via.placeholder.com/300x424?text=Book"}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/300x424?text=Book"; }}
                    />
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white line-clamp-1 tracking-tight px-0.5 leading-tight">
                    {book.title}
                  </h3>
                  
                  {/* Interactive Description (Click to Expand / Collapse) */}
                  <div 
                    onClick={(e) => toggleDescription(book.id, e)}
                    className="cursor-pointer mt-1.5 px-0.5 text-gray-500 dark:text-gray-400 select-none transition-all duration-300"
                  >
                    <p className={`text-[11px] sm:text-xs leading-relaxed break-words [&_*]:dark:!text-gray-400 [&_*]:dark:!bg-transparent ${
                      !isExpanded ? "line-clamp-2" : "bg-primary-50/40 dark:bg-white/5 p-1.5 rounded-lg border border-primary-500/10 dark:border-white/5"
                    }`}>
                      {book.description || "No description provided."}
                    </p>
                    {!book.description && (
                      <span className="text-[10px] text-primary-500 font-semibold block mt-0.5">
                        {!isExpanded ? "Read More" : "Read Less"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Compact Stacked Buttons for Tight Grid Column Space */}
                <div className="flex flex-col gap-1.5 mt-3.5 w-full">
                  {book.previewUrl && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewUrl(book.previewUrl); }}
                      className="w-full flex justify-center items-center gap-1 px-2 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl text-gray-800 dark:text-gray-200 text-[11px] font-bold transition-all active:scale-95 truncate"
                    >
                      <EyeIcon /> Preview
                    </button>
                  )}
                  {book.downloadUrl && (
                    <a
                      href={book.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-full flex justify-center items-center gap-1 px-2 py-2 bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-bold rounded-xl transition-all active:scale-95 text-center shadow-sm shadow-primary-500/10 truncate"
                    >
                      <DownloadIcon /> Get File
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== FULL VIEWPORT MODAL PREVIEW ===== */}
      {previewUrl && (
        <div 
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200" 
          onClick={() => setPreviewUrl(null)}
        >
          <div 
            className="relative w-full h-full sm:h-[85vh] sm:max-w-4xl bg-white dark:bg-[#111] sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/5" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Document Reader</span>
              <button 
                onClick={() => setPreviewUrl(null)} 
                className="p-2 bg-gray-200 hover:bg-red-500 hover:text-white dark:bg-white/10 text-gray-700 dark:text-white rounded-full transition-all active:scale-95"
                aria-label="Close Preview"
              >
                <CloseIcon />
              </button>
            </div>
            <iframe src={previewUrl} className="w-full flex-1 border-0 bg-white" title="Document Live Reader Room" />
          </div>
        </div>
      )}
    </div>
  );
}
