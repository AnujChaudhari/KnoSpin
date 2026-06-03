"use client";
import { useState, useRef } from "react";
import { HiChevronLeft, HiChevronRight, HiZoomIn, HiZoomOut, HiX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

// इनलाइन SVG प्लेसहोल्डर (जब कोई इमेज न हो)
const EmptyImagePlaceholder = () => (
  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
    <rect width="24" height="24" rx="3" fill="none" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

// इमेज लोड न होने पर दिखाने के लिए एक सादा डेटा URL (SVG)
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='20'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ImageSlider({ images }) {
  const [current, setCurrent] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // अगर images एरे खाली या undefined है
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-80 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
        <EmptyImagePlaceholder />
      </div>
    );
  }

  const prev = () => setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const next = () => setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  // टच स्वाइप
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  };

  const openZoom = () => {
    setIsZoomed(true);
    setZoomLevel(1);
  };
  const closeZoom = () => setIsZoomed(false);
  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.5, 0.5));

  return (
    <div className="w-full space-y-4">
      {/* ========== Main Image Container ========== */}
      <div className="relative w-full bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg group">
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={images[current]}
            alt={`Product image ${current + 1}`}
            className="w-full h-80 md:h-96 object-contain cursor-pointer"
            onClick={openZoom}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
          />
        </AnimatePresence>

        {/* Left / Right Arrows – centered vertically */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-700/90 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-gray-600 focus:opacity-100"
              aria-label="Previous image"
            >
              <HiChevronLeft className="w-5 h-5 text-gray-800 dark:text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-700/90 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-gray-600 focus:opacity-100"
              aria-label="Next image"
            >
              <HiChevronRight className="w-5 h-5 text-gray-800 dark:text-white" />
            </button>
          </>
        )}

        {/* Image counter */}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {current + 1} / {images.length}
        </div>
      </div>

      {/* ========== Thumbnail Strip ========== */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto py-2 px-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                idx === current
                  ? "border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800"
                  : "border-gray-200 dark:border-gray-600 opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
              />
            </button>
          ))}
        </div>
      )}

      {/* ========== Zoom Modal ========== */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeZoom}
        >
          <div className="relative max-w-5xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[current]}
              alt="Zoomed product"
              className="max-w-full max-h-[80vh] object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
              onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={zoomIn} className="bg-white/90 p-2 rounded-full shadow"><HiZoomIn /></button>
              <button onClick={zoomOut} className="bg-white/90 p-2 rounded-full shadow"><HiZoomOut /></button>
              <button onClick={closeZoom} className="bg-white/90 p-2 rounded-full shadow"><HiX /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
