"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiHome, HiShoppingBag, HiCollection, HiUsers, HiTag, HiMenu, HiX, HiPhotograph } from "react-icons/hi";
import { useState } from "react";

const links = [
  { href: "/admin", label: "Dashboard", icon: <HiHome /> },
  { href: "/admin/products", label: "Products", icon: <HiShoppingBag /> },
  { href: "/admin/orders", label: "Orders", icon: <HiCollection /> },
  { href: "/admin/users", label: "Users", icon: <HiUsers /> },
  { href: "/admin/categories", label: "Categories", icon: <HiTag /> },
  { href: "/admin/banners", label: "Banners", icon: <HiPhotograph /> },
  { href: "/admin/referrals", label: "Referrals", icon: <HiUsers /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-primary-600 text-white p-2 rounded-full shadow-lg"
        onClick={() => setOpen(!open)}
      >
        {open ? <HiX /> : <HiMenu />}
      </button>
      {open && <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 border-r p-6 z-40 transform transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:h-screen overflow-y-auto`}>
        <Link href="/" className="text-2xl font-bold text-primary-600 mb-8 block" onClick={() => setOpen(false)}>Quick Shop</Link>
        <nav className="flex flex-col gap-3">
          {links.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${pathname === link.href ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              {link.icon} {link.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
