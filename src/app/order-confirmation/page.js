"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const router = useRouter();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) {
      router.push("/");
      return;
    }
    const fetchOrder = async () => {
      const snap = await getDoc(doc(db, "orders", orderId));
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      } else {
        router.push("/");
      }
    };
    fetchOrder();
  }, [orderId, router]);

  if (!order) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 my-12">
      <div className="text-center mb-8">
        <span className="text-5xl">🎉</span>
        <h1 className="text-3xl font-bold mt-4">Order Confirmed!</h1>
        <p className="text-gray-500">Thank you for your purchase.</p>
      </div>

      <div className="card space-y-4">
        <div className="flex justify-between">
          <span className="font-semibold">Order ID</span>
          <span>#{order.id.slice(0,8)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-bold">₹{order.total}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Payment Method</span>
          <span>{order.paymentMethod?.toUpperCase() || "COD"}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Status</span>
          <span className="text-blue-600">{order.status}</span>
        </div>
        {order.address && (
          <div className="border-t pt-4 mt-4">
            <p className="font-semibold mb-2">Shipping Address</p>
            <p>{order.address.name}</p>
            <p>{order.address.phone}</p>
            <p>{order.address.street}, {order.address.city} – {order.address.pincode}</p>
          </div>
        )}
        <div className="border-t pt-4 mt-4">
          <p className="font-semibold mb-2">Items</p>
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>{item.name} x {item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-8 gap-4">
        <Link href="/" className="btn-gradient">Continue Shopping</Link>
        <Link href="/dashboard/orders" className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg">My Orders</Link>
      </div>
    </div>
  );
}
