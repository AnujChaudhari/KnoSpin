"use client";
import Link from "next/link";
import { HiHome, HiShoppingCart, HiUser, HiHeart } from "react-icons/hi";

export default function Footer() {
  return (
    <footer className="border-t bg-white dark:bg-gray-800 mt-12">
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t z-50 flex justify-around py-2">
        <Link href="/" className="flex flex-col items-center text-xs">
          <HiHome className="w-5 h-5" /> Home
        </Link>
        <Link href="/products" className="flex flex-col items-center text-xs">
          <HiShoppingCart className="w-5 h-5" /> Shop
        </Link>
        <Link href="/cart" className="flex flex-col items-center text-xs">
          <HiShoppingCart className="w-5 h-5" /> Cart
        </Link>
        <Link href="/dashboard" className="flex flex-col items-center text-xs">
          <HiUser className="w-5 h-5" /> Account
        </Link>
      </div>

      {/* Desktop Footer */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8">
          <div>
            <h4 className="font-bold mb-3">Quick Shop</h4>
            <p className="text-sm text-gray-500">Your one-stop mobile store.</p>
          </div>
          <div>
            <h4 className="font-bold mb-3">Quick Links</h4>
            <ul className="text-sm space-y-2">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/products">All Products</Link></li>
              <li><Link href="/dashboard">My Account</Link></li>
              <li><Link href="/cart">Cart</Link></li>
              <li><Link href="/leaderboard">Leaderboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">Support</h4>
            <ul className="text-sm space-y-2">
  <li><Link href="/contact">Contact Us</Link></li>
  <li><Link href="/faq">FAQ</Link></li>
  <li><Link href="/returns">Returns & Refunds</Link></li>
  <li><Link href="/shipping">Shipping Policy</Link></li>
  <li><Link href="/privacy">Privacy Policy</Link></li>
  <li><Link href="/terms">Terms & Conditions</Link></li>
  <li><Link href="/about">About Us</Link></li>
</ul>
          </div>
        </div>
        <div className="text-center text-sm text-gray-500 mt-8">
          © {new Date().getFullYear()} Quick Shop. All rights reserved.
        </div>
      </div>

      {/* Spacer for mobile fixed footer */}
      <div className="md:hidden h-14"></div>
    </footer>
  );
}
