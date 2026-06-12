"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HiLibrary } from "react-icons/hi";

/* ────── सभी आइकॉन इनलाइन SVG ────── */
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const ProductsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
);
const OrdersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
);
const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>
);
const CategoriesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
);
const BannersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
);
const ReferralsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8l4 4-4 4"/></svg>
);
const WalletIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="16" cy="12" r="2"/><path d="M2 10h4"/></svg>
);
const AnalyticsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
);
const CoursesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
);
const ShieldCheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
);
const UserGroupIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
);
const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);
const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
);
const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
);

const links = [
  { href: "/admin", label: "Dashboard", icon: <HomeIcon /> },
  { href: "/admin/products", label: "Products", icon: <ProductsIcon /> },
  { href: "/admin/orders", label: "Orders", icon: <OrdersIcon /> },
  { href: "/admin/users", label: "Users", icon: <UsersIcon /> },
  { href: "/admin/categories", label: "Categories", icon: <CategoriesIcon /> },
  { href: "/admin/banners", label: "Banners", icon: <BannersIcon /> },
  { href: "/admin/referrals", label: "Referrals", icon: <ReferralsIcon /> },
  { href: "/admin/wallet", label: "Wallet Control", icon: <WalletIcon /> },
  { href: "/admin/analytics", label: "Analytics", icon: <AnalyticsIcon /> },
  { href: "/admin/courses", label: "Courses", icon: <CoursesIcon /> },
  { href: "/admin/library/categories", label: "Library", icon: <HiLibrary className="w-5 h-5" /> }, // 👈 Added React-Icon Library Here
  { href: "/admin/verifications", label: "Verifications", icon: <ShieldCheckIcon /> },
  { href: "/admin/community/groups", label: "Community Groups", icon: <UserGroupIcon /> },
  { href: "/admin/notifications", label: "Notify Users", icon: <BellIcon /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Sticky Floating Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-primary-600 text-white p-2.5 rounded-full shadow-lg transition-transform active:scale-90"
        onClick={() => setOpen(!open)}
        aria-label="Toggle Navigation Menu"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Modern Blur Overlay for mobile view */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Premium Dashboard Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 h-full w-66 bg-white dark:bg-[#111] border-r border-gray-100 dark:border-white/5 p-6 z-40 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:h-screen overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}
      >
        {/* Main Brand Identifier */}
        <div className="mb-8 pt-2 md:pt-0">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="text-2xl font-black bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent tracking-tight"
          >
            Quick Shop
          </Link>
          <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Admin Panel</span>
        </div>

        {/* Navigation Core Stack */}
        <nav className="flex flex-col gap-1.5">
          {links.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                  isActive
                    ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span className={`transition-colors ${isActive ? "text-primary-600 dark:text-primary-400" : "text-gray-400 dark:text-gray-500"}`}>
                  {link.icon}
                </span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
