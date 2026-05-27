"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  where,
  addDoc,
  serverTimestamp,
  increment
} from "firebase/firestore";
import { toast } from "react-hot-toast";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [trackingInput, setTrackingInput] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setOrders(list);
    const initialTracking = {};
    list.forEach(o => {
      if (o.trackingUrl) initialTracking[o.id] = o.trackingUrl;
    });
    setTrackingInput(initialTracking);
  };

  // ========== REFERRAL REWARD AUTOMATION ==========
  const processReferralReward = async (order) => {
    // Only process when status is "delivered"
    if (order.status !== "delivered") return;

    try {
      // Get the user who placed this order
      const userSnap = await getDoc(doc(db, "users", order.userId));
      if (!userSnap.exists()) return;

      const userData = userSnap.data();
      const referredBy = userData.referredBy;

      // If user wasn't referred by anyone, skip
      if (!referredBy) return;

      // Find a PENDING referral where referrer = referredBy and referred = order.userId
      const refSnap = await getDocs(
        query(
          collection(db, "referrals"),
          where("referrerId", "==", referredBy),
          where("referredId", "==", order.userId),
          where("status", "==", "pending")
        )
      );

      // No pending referral found, skip
      if (refSnap.empty) return;

      const referralDoc = refSnap.docs[0];
      const referralData = referralDoc.data();
      const rewardAmount = referralData.rewardAmount || 20;
      const rewardCoins = referralData.rewardCoins || 50;

      // 1. Mark referral as completed
      await updateDoc(doc(db, "referrals", referralDoc.id), {
        status: "completed",
        completedAt: serverTimestamp(),
      });

      // 2. Create wallet transaction for referrer
      await addDoc(collection(db, "wallet_transactions"), {
        userId: referredBy,
        type: "referral_reward",
        amount: rewardAmount,
        coins: rewardCoins,
        description: `Referral reward – user completed first order`,
        orderId: order.id,
        createdAt: serverTimestamp(),
      });

      // 3. Update referrer's wallet balance, coins & stats
      await updateDoc(doc(db, "users", referredBy), {
        walletBalance: increment(rewardAmount),
        coinBalance: increment(rewardCoins),
        totalReferrals: increment(1),
        referralEarnings: increment(rewardAmount),
      });

      // 4. Tier upgrade check
      const updatedUserSnap = await getDoc(doc(db, "users", referredBy));
      const totalRefs = updatedUserSnap.data().totalReferrals || 0;
      let newTier = "bronze";
      if (totalRefs >= 15) newTier = "gold";
      else if (totalRefs >= 5) newTier = "silver";

      await updateDoc(doc(db, "users", referredBy), {
        referralTier: newTier,
      });

      toast.success(`Referral reward of ₹${rewardAmount} + ${rewardCoins} coins credited!`);
    } catch (error) {
      console.error("Referral reward processing failed:", error);
    }
  };
  // ========== END REFERRAL REWARD ==========

  const updateStatus = async (orderId, newStatus) => {
    await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    toast.success("Status updated");
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    // Trigger referral reward processing
    const updatedOrder = orders.find(o => o.id === orderId);
    if (updatedOrder) {
      await processReferralReward({ ...updatedOrder, status: newStatus });
    }
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
            <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>

            {/* Customer Name & Phone */}
            {order.address && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                👤 {order.address.name} &nbsp;|&nbsp; 📞 {order.address.phone}
              </p>
            )}

            <p>Total: ₹{order.total}</p>
            <p>Status: {order.status}</p>
            <p>Items: {order.items?.length || 0}</p>

            {/* Tracking URL Input */}
            <div className="mt-2 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <input
                type="text"
                placeholder="Tracking URL"
                value={trackingInput[order.id] || ''}
                onChange={e =>
                  setTrackingInput({ ...trackingInput, [order.id]: e.target.value })
                }
                className="input-field flex-grow"
              />
              <button
                onClick={() => saveTrackingUrl(order.id)}
                className="btn-gradient whitespace-nowrap"
              >
                Save Link
              </button>
            </div>

            {/* Status Change Buttons */}
            <div className="flex gap-2 mt-2">
              {order.status === "pending" && (
                <>
                  <button
                    onClick={() => updateStatus(order.id, "confirmed")}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => updateStatus(order.id, "cancelled")}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </>
              )}
              {order.status === "confirmed" && (
                <button
                  onClick={() => updateStatus(order.id, "shipped")}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Mark Shipped
                </button>
              )}
              {order.status === "shipped" && (
                <button
                  onClick={() => updateStatus(order.id, "delivered")}
                  className="bg-purple-500 text-white px-3 py-1 rounded"
                >
                  Mark Delivered
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
