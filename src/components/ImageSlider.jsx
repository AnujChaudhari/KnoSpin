"use client";
import { useState, useRef } from "react";
import { HiChevronLeft, HiChevronRight, HiZoomIn, HiZoomOut, HiX } from "react-icons/hi";

export default function ImageSlider({ images }) {
  const [current, setCurrent] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  if (!images || images.length === 0) return null;

  const prev = () => setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const next = () => setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) { // swipe threshold
      if (diff > 0) next();
      else prev();
    }
  };

  const openZoom = () => {
    setIsZoomed(true);
    setZoomLevel(1);
  };
  const closeZoom = () => setIsZoomed(false);
  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 3));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 0.5));

  return (
    <>
      <div className="relative w-full">
        <img
          src={images[current]}
          alt={`Product image ${current + 1}`}
          className="w-full h-80 object-cover rounded-2xl cursor-pointer"
          onClick={openZoom}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
              <HiChevronLeft />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
              <HiChevronRight />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, idx) => (
                <span key={idx} className={`w-2 h-2 rounded-full ${idx === current ? "bg-primary-500" : "bg-gray-300"}`} />
              ))}
            </div>
          </>
        )}
        <p className="text-xs text-center mt-1 text-gray-500">{current + 1} / {images.length}</p>
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={closeZoom}>
          <div className="relative max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
            <img
              src={images[current]}
              alt="Zoomed product"
              className="max-w-full max-h-[80vh] object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={zoomIn} className="bg-white text-black p-2 rounded-full"><HiZoomIn /></button>
              <button onClick={zoomOut} className="bg-white text-black p-2 rounded-full"><HiZoomOut /></button>
              <button onClick={closeZoom} className="bg-white text-black p-2 rounded-full"><HiX /></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
