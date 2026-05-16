import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { HiHeart, HiOutlineHeart, HiShoppingCart } from "react-icons/hi";
import { useState } from "react";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState(false);

  return (
    <motion.div whileHover={{ y: -5 }} className="card group">
      <Link href={`/product/${product.id}`}>
        <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3 bg-gray-100 dark:bg-gray-700">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {product.onSale && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">Sale</span>
          )}
        </div>
        <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-lg font-bold text-primary-600">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-xs line-through text-gray-400">₹{product.originalPrice}</span>
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