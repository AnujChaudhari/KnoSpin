"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image";
import { HiMenu, HiX, HiShoppingCart, HiHeart, HiUser } from "react-icons/hi";
import ThemeToggle from "./ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="glassmorphism sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="https://res.cloudinary.com/dnattha6y/image/upload/v1779014682/t7hzjqu3hi8fxnnopbua.png"
            alt="Quick Shop Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            Quick Shop
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/cart" className="relative">
            <HiShoppingCart className="w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
            {menuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-white dark:bg-gray-800"
          >
            <div className="flex flex-col p-4 space-y-3">
              <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link href="/products" onClick={() => setMenuOpen(false)}>All Products</Link>
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  {isAdmin && <Link href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
                  <button onClick={() => { logout(); setMenuOpen(false); }} className="text-left text-red-500">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link href="/signup" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
      {/* Desktop Nav */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 pb-2 gap-6 text-sm">
        <Link href="/products">All Products</Link>
        {user ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            {isAdmin && <Link href="/admin">Admin</Link>}
            <button onClick={logout} className="text-red-500">Logout</button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </header>
  );
}
