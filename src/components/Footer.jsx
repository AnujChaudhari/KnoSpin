"use client";
import Link from "next/link";

/* ───────── प्रीमियम SVG आइकॉन ───────── */
const HomeIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ShopIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const CartIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const LeaderboardIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="border-t bg-white dark:bg-gray-800 mt-12">
      {/* ========== Mobile Bottom Navigation ========== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t z-50 flex justify-around py-2">
        <Link href="/" className="flex flex-col items-center text-xs gap-1 text-gray-600 dark:text-gray-300 hover:text-primary-600">
          <HomeIcon /> Home
        </Link>
        <Link href="/products" className="flex flex-col items-center text-xs gap-1 text-gray-600 dark:text-gray-300 hover:text-primary-600">
          <ShopIcon /> Shop
        </Link>
        <Link href="/cart" className="flex flex-col items-center text-xs gap-1 text-gray-600 dark:text-gray-300 hover:text-primary-600">
          <CartIcon /> Cart
        </Link>
        <Link href="/dashboard" className="flex flex-col items-center text-xs gap-1 text-gray-600 dark:text-gray-300 hover:text-primary-600">
          <UserIcon /> Account
        </Link>
      </div>

      {/* ========== Desktop Footer ========== */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Column 1 – About */}
          <div>
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Quick Shop
            </Link>
            <p className="text-sm text-gray-500 mt-3 leading-relaxed">
              Your one-stop mobile store for digital and physical products. Fast delivery, easy returns, and exciting rewards.
            </p>
          </div>

          {/* Column 2 – Quick Links */}
          <div>
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <HeartIcon /> Quick Links
            </h4>
            <ul className="text-sm space-y-3">
              <li><Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">Home</Link></li>
              <li><Link href="/products" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">All Products</Link></li>
              <li><Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">My Account</Link></li>
              <li><Link href="/dashboard/referrals" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">Refer & Earn</Link></li>
              <li><Link href="/leaderboard" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition flex items-center gap-1"><LeaderboardIcon /> Leaderboard</Link></li>
            </ul>
          </div>

          {/* Column 3 – Support & Policies */}
          <div>
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <InfoIcon /> Support & Policies
            </h4>
            <ul className="text-sm space-y-3">
              <li><Link href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">Contact Us</Link></li>
              <li><Link href="/faq" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">FAQ</Link></li>
              <li><Link href="/returns" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">Returns & Refunds</Link></li>
              <li><Link href="/shipping" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">Shipping Policy</Link></li>
              <li><Link href="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">Terms & Conditions</Link></li>
              <li><Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">About Us</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Quick Shop. All rights reserved.
        </div>
      </div>

      {/* Spacer for mobile fixed footer */}
      <div className="md:hidden h-14"></div>
    </footer>
  );
}
