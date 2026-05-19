"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, updateDoc, doc } from "firebase/firestore";
import { toast } from "react-hot-toast";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [trackingInput, setTrackingInput] = useState({}); // { [orderId]: url }

  useEffect(() => {
    const fetchOrders = async () => {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(list);
      // Existing tracking URLs pre-fill
      const initialTracking = {};
      list.forEach(o => {
        if (o.trackingUrl) initialTracking[o.id] = o.trackingUrl;
      });
      setTrackingInput(initialTracking);
    };
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    toast.success("Status updated");
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const saveTrackingUrl = async (orderId) => {
    const url = trackingInput[orderId] || '';
    await updateDoc(doc(db, "orders", orderId), { trackingUrl: url });
    toast.success("Tracking link saved");
  };

  return (
    <div className="p-4 md:p-0">
      <h2 className="text-2xl font-bold mb-4">Orders</h2>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="card">
            <p className="font-semibold">Order #{order.id.slice(0,8)}</p>
            <p>Total: ₹{order.total}</p>
            <p>Status: {order.status}</p>
            <p>Items: {order.items?.length || 0}</p>
            <div className="mt-2 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <input
                type="text"
                placeholder="Tracking URL"
                value={trackingInput[order.id] || ''}
                onChange={e => setTrackingInput({ ...trackingInput, [order.id]: e.target.value })}
                className="input-field flex-grow"
              />
              <button onClick={() => saveTrackingUrl(order.id)} className="btn-gradient whitespace-nowrap">
                Save Link
              </button>
            </div>
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
