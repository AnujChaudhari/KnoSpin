"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchOrders();
  }, [user]);

  if (!user) return <p className="p-4">Please login to view your orders.</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Orders</h2>
      {orders.length === 0 && <p>No orders yet.</p>}
      {orders.map(order => (
        <div key={order.id} className="card mb-3">
          <p className="font-semibold">Order #{order.id.slice(0,8)}</p>
          <p>Total: ₹{order.total}</p>
          <p>Status: {order.status}</p>
          {order.trackingUrl && (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary-600 underline mt-1 inline-block"
            >
              📦 Track your order
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
