"use client";
export const dynamic = 'force-dynamic';

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-20">
        <p>Please login to view your dashboard.</p>
        <Link href="/login" className="btn-gradient inline-block mt-4">Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <Link href="/dashboard/orders" className="card hover:bg-gray-100 dark:hover:bg-gray-700">
          📦 My Orders
        </Link>
        <Link href="/dashboard/profile" className="card hover:bg-gray-100 dark:hover:bg-gray-700">
          👤 My Profile
        </Link>
        <Link href="/dashboard/addresses" className="card hover:bg-gray-100 dark:hover:bg-gray-700">
          📍 Saved Addresses
        </Link>
      </div>
    </div>
  );
}
