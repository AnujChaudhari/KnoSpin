"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, updateDoc, doc } from "firebase/firestore";
import { toast } from "react-hot-toast";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    const fetchOrders = async () => {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    toast.success("Updated");
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Orders</h2>
      <div className="space-y-3">
        {orders.map(order => (
          <div key={order.id} className="card">
            <p>Order #{order.id.slice(0,8)} - ₹{order.total}</p>
            <p>Status: {order.status}</p>
            <div className="flex gap-2 mt-2">
              {order.status === "pending" && (
                <>
                  <button onClick={() => updateStatus(order.id, "confirmed")} className="bg-blue-500 text-white px-3 py-1 rounded">Confirm</button>
                  <button onClick={() => updateStatus(order.id, "cancelled")} className="bg-red-500 text-white px-3 py-1 rounded">Cancel</button>
                </>
              )}
              {order.status === "confirmed" && (
                <button onClick={() => updateStatus(order.id, "shipped")} className="bg-green-500 text-white px-3 py-1 rounded">Mark Shipped</button>
              )}
              {order.status === "shipped" && (
                <button onClick={() => updateStatus(order.id, "delivered")} className="bg-purple-500 text-white px-3 py-1 rounded">Mark Delivered</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
