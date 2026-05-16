"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { motion } from "framer-motion";
import StatCard from "@/components/admin/StatCard";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });

  useEffect(() => {
    async function fetchStats() {
      const prodCount = (await getCountFromServer(collection(db, "products"))).data().count;
      const orderCount = (await getCountFromServer(collection(db, "orders"))).data().count;
      const userCount = (await getCountFromServer(collection(db, "users"))).data().count;
      // Revenue: sum of total from orders with status 'delivered' or 'paid' (simplified)
      setStats({ products: prodCount, orders: orderCount, users: userCount, revenue: 0 });
    }
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Products" value={stats.products} icon="🛍️" />
        <StatCard title="Orders" value={stats.orders} icon="📦" />
        <StatCard title="Users" value={stats.users} icon="👥" />
        <StatCard title="Revenue" value={`₹${stats.revenue}`} icon="💰" />
      </div>
    </div>
  );
}