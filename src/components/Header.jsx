"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import dynamic from "next/dynamic";
import ThemeToggle from "./ThemeToggle";

// ✅ Lazy‑load NotificationBell – only when user is logged in
const NotificationBell = dynamic(() => import("./NotificationBell"), { ssr: false });

/* ---------- इनलाइन SVG आइकॉन ---------- */
const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const CartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
  </svg>
);
const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
);
const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function Header() {
  const { user, logout, isAdmin, loading } = useAuth();
  const { cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ────── लोडिंग स्केलेटन (हमेशा तुरंत दिखे) ──────
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  // ────── असली हेडर ──────
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* लोगो + नाम */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Quick Shop" className="h-7 md:h-8 w-auto" />
          <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            Quick Shop
          </span>
        </Link>

        {/* दाएँ आइकॉन */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {/* NotificationBell केवल लॉगिन यूज़र के लिए लोड करें */}
          {user && <NotificationBell />}
          <Link href="/cart" className="relative">
            <CartIcon />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* मोबाइल मेनू */}
      {menuOpen && (
        <nav className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 overflow-y-auto max-h-[80vh]">
          <div className="flex flex-col p-4 space-y-3">
            <Link href="/" onClick={() => setMenuOpen(false)} className="text-gray-800 dark:text-gray-200 font-medium">Home</Link>
            <Link href="/courses" onClick={() => setMenuOpen(false)} className="text-gray-800 dark:text-gray-200 font-medium">Courses</Link>
            <Link href="/community/groups" onClick={() => setMenuOpen(false)} className="text-gray-800 dark:text-gray-200 font-medium">Community</Link>
            <Link href="/products" onClick={() => setMenuOpen(false)} className="text-gray-800 dark:text-gray-200 font-medium">Products</Link>
            <Link href="/pricing" onClick={() => setMenuOpen(false)} className="text-gray-800 dark:text-gray-200 font-medium">Pricing</Link>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-1">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-medium">
                    <UserIcon /> Dashboard
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-gray-800 dark:text-gray-200 font-medium">
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="text-red-500 flex items-center gap-2 font-medium"
                  >
                    <LogoutIcon /> Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 font-medium">Login</Link>
                  <Link href="/signup" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 bg-primary-600 text-white rounded-lg font-medium">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* डेस्कटॉप मेनू */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 pb-2 gap-6 text-sm items-center border-t border-gray-100 dark:border-gray-800 pt-2">
        <Link href="/" className="hover:text-primary-600 dark:text-gray-300">Home</Link>
        <Link href="/courses" className="hover:text-primary-600 dark:text-gray-300">Courses</Link>
        <Link href="/community/groups" className="hover:text-primary-600 dark:text-gray-300">Community</Link>
        <Link href="/products" className="hover:text-primary-600 dark:text-gray-300">Products</Link>
        <Link href="/pricing" className="hover:text-primary-600 dark:text-gray-300">Pricing</Link>

        <div className="ml-auto flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-1 hover:text-primary-600 dark:text-gray-300">
                <UserIcon /> Dashboard
              </Link>
              {isAdmin && <Link href="/admin" className="hover:text-primary-600 dark:text-gray-300">Admin</Link>}
              <button onClick={logout} className="text-red-500 hover:text-red-600 flex items-center gap-1">
                <LogoutIcon /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-primary-600 dark:text-gray-300">Login</Link>
              <Link href="/signup" className="bg-primary-600 text-white text-xs font-semibold py-1.5 px-3 rounded-lg hover:bg-primary-700 transition">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
