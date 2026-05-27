"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { HiHeart, HiOutlineHeart, HiShoppingCart, HiSparkles, HiDocument, HiBookOpen } from "react-icons/hi";
import { useState } from "react";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState(false);

  // Digital category icon mapping
  const getDigitalIcon = (category) => {
    switch (category) {
      case "pdf": return <HiDocument className="w-3 h-3" />;
      case "ebook": return <HiBookOpen className="w-3 h-3" />;
      case "course": return <HiSparkles className="w-3 h-3" />;
      default: return <HiSparkles className="w-3 h-3" />;
    }
  };

  return (
    <motion.div whileHover={{ y: -5 }} className="card group">
      <Link href={`/product/${product.id}`}>
        <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3 bg-gray-100 dark:bg-gray-700">
          <img
            src={product.images?.[0] || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          
          {/* Sale Badge */}
          {product.onSale && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
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
          {product.originalPrice && (
            <span className="text-xs line-through text-gray-400">₹{product.originalPrice}</span>
          )}
          {product.discountPercentage > 0 && (
            <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full">
              {product.discountPercentage}% off
            </span>
          )}
        </div>
      </Link>

      <div className="flex justify-between mt-3">
        <button
          onClick={() => setWishlist(!wishlist)}
          className="text-gray-500 hover:text-red-500 transition"
        >
          {wishlist ? <HiHeart className="w-5 h-5 text-red-500" /> : <HiOutlineHeart className="w-5 h-5" />}
        </button>
        <button
          onClick={() => addToCart(product)}
          className="btn-gradient text-xs py-1 px-3 flex items-center gap-1"
        >
          <HiShoppingCart className="w-4 h-4" /> Add
        </button>
      </div>
    </motion.div>
  );
}
