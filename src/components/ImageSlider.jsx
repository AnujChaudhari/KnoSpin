"use client";
import { useState, useRef } from "react";
import { HiChevronLeft, HiChevronRight, HiZoomIn, HiZoomOut, HiX } from "react-icons/hi";

export default function ImageSlider({ images }) {
  const [current, setCurrent] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const hasMoved = useRef(false);

  if (!images || images.length === 0) return null;

  const prev = () => setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const next = () => setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  // Touch handlers – स्वाइप और टैप दोनों संभालें
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    hasMoved.current = false;
  };
  const handleTouchMove = (e) => {
    hasMoved.current = true;
  };
  const handleTouchEnd = (e) => {
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
    // अगर ज्यादा हरकत नहीं हुई, तो इसे टैप मानकर ज़ूम खोलें
    if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10 && !hasMoved.current) {
      openZoom();
      return;
    }
    // स्वाइप के लिए
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) next();
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
      <div className="relative w-full bg-gray-100 dark:bg-gray-700 rounded-2xl">
        {/* इमेज कंटेनर – अब object-contain से पूरी इमेज फ़्रेम में दिखेगी */}
        <img
          src={images[current]}
          alt={`Product image ${current + 1}`}
          className="w-full h-80 object-contain cursor-pointer"
          onClick={openZoom}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        {/* नेविगेशन एरो (केवल एकाधिक इमेज होने पर) */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 text-primary-600 p-2 rounded-full shadow hover:bg-white"
            >
              <HiChevronLeft />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 text-primary-600 p-2 rounded-full shadow hover:bg-white"
            >
              <HiChevronRight />
            </button>

            {/* डॉट्स */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrent(idx); }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === current ? "bg-primary-500 scale-110" : "bg-gray-400 dark:bg-gray-500"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* इमेज काउंटर */}
        <p className="text-xs text-center py-1 text-gray-500">
          {current + 1} / {images.length}
        </p>
      </div>

      {/* ज़ूम मोडल */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={closeZoom}
        >
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
