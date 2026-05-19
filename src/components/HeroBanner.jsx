"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function HeroBanner() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    const fetchBanners = async () => {
      const q = query(collection(db, "heroBanners"), where("active", "==", true));
      const snap = await getDocs(q);
      setBanners(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchBanners();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrent(prev => (prev === banners.length - 1 ? 0 : prev + 1));
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrent(prev => (prev === 0 ? banners.length - 1 : prev - 1));
  }, [banners.length]);

  // Auto-slide every 4 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    intervalRef.current = setInterval(nextSlide, 4000);
    return () => clearInterval(intervalRef.current);
  }, [banners.length, nextSlide]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  if (banners.length === 0) return null;

  const banner = banners[current];

  return (
    <section
      className="relative my-6 rounded-3xl overflow-hidden bg-gradient-to-r from-primary-600 to-purple-600 text-white"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image */}
      <img
        src={banner.image || "https://via.placeholder.com/800x400?text=Summer+Sale"}
        alt={banner.title}
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />

      {/* Content */}
      <div className="relative z-10 p-6 md:p-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-4 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold">{banner.title}</h1>
          <p className="text-lg opacity-90">{banner.subtitle}</p>
          <Link
            href={banner.link || "/products"}
            className="inline-block bg-white text-primary-600 font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition"
          >
            Shop Now
          </Link>
        </div>
        {/* Front Image (optional) */}
        <img
          src={banner.image || "https://via.placeholder.com/300x300?text=Sale"}
          alt={banner.title}
          className="w-60 md:w-80 rounded-2xl shadow-lg"
        />
      </div>

      {/* Navigation Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === current ? "bg-white scale-110" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
