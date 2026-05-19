"use client";
import { useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

export default function ImageSlider({ images }) {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) return null;

  const prev = () => setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const next = () => setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div className="relative w-full">
      <img
        src={images[current]}
        alt={`Product image ${current + 1}`}
        className="w-full h-80 object-cover rounded-2xl"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          >
            <HiChevronLeft />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          >
            <HiChevronRight />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full ${
                  idx === current ? "bg-primary-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </>
      )}
      <p className="text-xs text-center mt-1 text-gray-500">
        {current + 1} / {images.length}
      </p>
    </div>
  );
}
