"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { HiMenu, HiX, HiShoppingCart, HiUser, HiLogout } from "react-icons/hi";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell"; // ✅ वापस जोड़ा गया

export default function Header() {
  const { user, logout, isAdmin, loading } = useAuth();
  const { cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <header className="glassmorphism sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            Quick Shop
          </Link>
          <div className="w-6 h-6"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="glassmorphism sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Quick Shop
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <NotificationBell />  {/* ✅ बेल आइकन अब सक्रिय */}
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

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="md:hidden overflow-hidden bg-white dark:bg-gray-800 border-t">
          <div className="flex flex-col p-4 space-y-3">
            <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/courses" onClick={() => setMenuOpen(false)}>Courses</Link>
            <Link href="/community/groups" onClick={() => setMenuOpen(false)}>Community</Link>
            <Link href="/products" onClick={() => setMenuOpen(false)}>All Products</Link>
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                {isAdmin && <Link href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="text-left text-red-500 flex items-center gap-2"
                >
                  <HiLogout className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </nav>
      )}

      {/* Desktop Menu */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 pb-2 gap-6 text-sm items-center">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <Link href="/courses" className="hover:text-primary-600">Courses</Link>
        <Link href="/community/groups" className="hover:text-primary-600">Community</Link>
        <Link href="/products" className="hover:text-primary-600">All Products</Link>
        {user ? (
          <>
            <Link href="/dashboard" className="hover:text-primary-600 flex items-center gap-1">
              <HiUser className="w-4 h-4" /> Dashboard
            </Link>
            {isAdmin && <Link href="/admin" className="hover:text-primary-600">Admin</Link>}
            <button onClick={logout} className="text-red-500 hover:text-red-600 flex items-center gap-1">
              <HiLogout className="w-4 h-4" /> Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:text-primary-600">Login</Link>
            <Link href="/signup" className="btn-gradient text-xs py-1 px-3">Sign Up</Link>
          </>
        )}
      </div>
    </header>
  );
}
