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
  const tokensParam = searchParams.get("tokens");
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [downloadLinks, setDownloadLinks] = useState([]);

  // Parse download tokens (if any)
  useEffect(() => {
    if (tokensParam) {
      const links = tokensParam.split(',').map(item => {
        const [name, token] = item.split(':');
        return { name: decodeURIComponent(name || 'Download'), token: token?.trim() };
      }).filter(l => l.token);
      setDownloadLinks(links);
    }
  }, [tokensParam]);

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
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const hasDigitalItems = order.items?.some(item => item.isDigital) || downloadLinks.length > 0;

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

        {/* ===== DIGITAL DOWNLOADS SECTION ===== */}
        {hasDigitalItems && (
          <div className="border-t pt-4 mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">📥 Your Digital Downloads</h3>
            {downloadLinks.length > 0 ? (
              <>
                <ul className="space-y-3">
                  {downloadLinks.map((link, idx) => (
                    <li key={idx} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                      <span className="font-medium truncate">{link.name}</span>
                      <a
                        href={`/download?token=${link.token}`}
                        className="btn-gradient text-xs py-1 px-3 whitespace-nowrap"
                      >
                        Download Now
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-3 bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded-lg">
                  ⚠️ <strong>One‑time download:</strong> Each link works only once (or up to its allowed limit). Save the file immediately after download.
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your digital downloads will be available here once payment is confirmed. Please check back shortly.
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              If you face any issue, DM <strong>@QuickShopPro</strong> on Telegram.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center mt-8 gap-4">
        <Link href="/" className="btn-gradient">Continue Shopping</Link>
        <Link href="/dashboard/orders" className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg">My Orders</Link>
      </div>
    </div>
  );
}
