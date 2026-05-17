"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer } from "firebase/firestore";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0 });

  useEffect(() => {
    async function fetchStats() {
      const prodCount = (await getCountFromServer(collection(db, "products"))).data().count;
      const orderCount = (await getCountFromServer(collection(db, "orders"))).data().count;
      const userCount = (await getCountFromServer(collection(db, "users"))).data().count;
      setStats({ products: prodCount, orders: orderCount, users: userCount });
    }
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">📦 Products: {stats.products}</div>
        <div className="card">🛒 Orders: {stats.orders}</div>
        <div className="card">👥 Users: {stats.users}</div>
      </div>
    </div>
  );
}
