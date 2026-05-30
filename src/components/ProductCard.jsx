"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

/* ───────── प्रीमियम SVG आइकॉन ───────── */
const HeartIcon = ({ filled }) => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const CartIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2zm0 14l-1.5 5.5L5 23l5.5 1.5L12 30l1.5-5.5L19 23l-5.5-1.5L12 16z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const BookIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 010-5H20" />
  </svg>
);

const SaleIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.41 11.58l-9-9A2 2 0 0010.99 2H4a2 2 0 00-2 2v6.99a2 2 0 00.59 1.42l9 9a2 2 0 002.82 0l7-7a2 2 0 000-2.83zM6.5 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
  </svg>
);

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState(false);

  // Digital category icon mapping
  const getDigitalIcon = (category) => {
    switch (category) {
      case "pdf": return <DocumentIcon />;
      case "ebook": return <BookIcon />;
      case "course": return <SparklesIcon />;
      default: return <SparklesIcon />;
    }
  };

  return (
    <motion.div whileHover={{ y: -5 }} className="card group">
      <Link href={`/product/${product.id}`}>
        <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3 bg-gray-100 dark:bg-gray-700">
          <img
            src={product.images?.[0] || "https://via.placeholder.com/300x300?text=No+Image"}
            alt={product.name || "Product"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => { e.target.src = "https://via.placeholder.com/300x300?text=No+Image"; }}
          />

          {/* Sale Badge */}
          {product.onSale && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <SaleIcon />
              Sale
            </span>
          )}

          {/* Digital Badge */}
          {product.isDigital && (
            <span className={`absolute top-2 ${product.onSale ? 'left-16' : 'left-2'} bg-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1`}>
              {getDigitalIcon(product.digitalCategory)}
              Digital
            </span>
          )}
        </div>

        <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>

        {/* Product Code */}
        {product.productCode && (
          <p className="text-xs text-gray-400 mt-0.5">{product.productCode}</p>
        )}

        <div className="flex items-center gap-2 mt-1">
          <span className="text-lg font-bold text-primary-600">₹{product.price}</span>
          {product.originalPrice > product.price && (
            <span className="text-xs line-through text-gray-400">₹{product.originalPrice}</span>
          )}
          {product.discountPercentage > 0 && (
            <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full">
              -{product.discountPercentage}%
            </span>
          )}
        </div>
      </Link>

      <div className="flex justify-between mt-3">
        <button
          onClick={() => setWishlist(!wishlist)}
          className="text-gray-500 hover:text-red-500 transition"
          aria-label="Toggle wishlist"
        >
          <HeartIcon filled={wishlist} />
        </button>
        <button
          onClick={() => addToCart(product)}
          className="btn-gradient text-xs py-1 px-3 flex items-center gap-1"
        >
          <CartIcon /> Add
        </button>
      </div>
    </motion.div>
  );
}
