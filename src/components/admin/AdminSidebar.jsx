"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiHome, HiShoppingBag, HiCollection, HiUsers, HiTag } from "react-icons/hi";

const links = [
  { href: "/admin", label: "Dashboard", icon: <HiHome /> },
  { href: "/admin/products", label: "Products", icon: <HiShoppingBag /> },
  { href: "/admin/orders", label: "Orders", icon: <HiCollection /> },
  { href: "/admin/users", label: "Users", icon: <HiUsers /> },
  { href: "/admin/categories", label: "Categories", icon: <HiTag /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r p-6 hidden md:block">
      <Link href="/" className="text-2xl font-bold text-primary-600 mb-8 block">Quick Shop</Link>
      <nav className="flex flex-col gap-3">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 p-3 rounded-lg transition ${
              pathname === link.href ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {link.icon} {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
