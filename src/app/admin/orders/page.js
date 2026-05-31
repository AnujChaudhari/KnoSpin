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

/* ───────── SVG Icons ───────── */
const UserIcon = () => (
  <svg className="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const ConfirmIcon = () => (
  <svg className="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const CancelIcon = () => (
  <svg className="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ShippedIcon = () => (
  <svg className="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 17V5a2 2 0 00-2-2H4a2 2 0 00-2 2v12m11 0h2m-2 0h-2m2-4h-4m4-4h-4m4-4h-4" />
  </svg>
);

const DeliveredIcon = () => (
  <svg className="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SaveIcon = () => (
  <svg className="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [trackingInput, setTrackingInput] = useState({});

  // ========== Fetch Orders ==========
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(list);
      const initialTracking = {};
      list.forEach(o => {
        if (o.trackingUrl) initialTracking[o.id] = o.trackingUrl;
      });
      setTrackingInput(initialTracking);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      toast.error("Could not load orders");
    }
  };

  // ========== REFERRAL REWARD AUTOMATION ==========
  const processReferralReward = async (order) => {
    // Only run when order is delivered
    if (order.status !== "delivered") return;

    try {
      // 1. Get the user who placed the order
      const userSnap = await getDoc(doc(db, "users", order.userId));
      if (!userSnap.exists()) return;
      const userData = userSnap.data();

      // 2. Check if this user was referred by someone
      const referredBy = userData.referredBy;
      if (!referredBy) return;

      // 3. Find a pending referral for this user/referrer pair
      const refSnap = await getDocs(
        query(
          collection(db, "referrals"),
          where("referrerId", "==", referredBy),
          where("referredId", "==", order.userId),
          where("status", "==", "pending")
        )
      );
      if (refSnap.empty) return;

      const referralDoc = refSnap.docs[0];
      const referralData = referralDoc.data();
      const rewardAmount = referralData.rewardAmount || 20;
      const rewardCoins = referralData.rewardCoins || 50;

      // 4. Mark referral as completed
      await updateDoc(doc(db, "referrals", referralDoc.id), {
        status: "completed",
        completedAt: serverTimestamp(),
      });

      // 5. Add wallet transaction for referrer
      await addDoc(collection(db, "wallet_transactions"), {
        userId: referredBy,
        type: "referral_reward",
        amount: rewardAmount,
        coins: rewardCoins,
        description: `Referral reward – user completed first order`,
        orderId: order.id,
        createdAt: serverTimestamp(),
      });

      // 6. Update referrer's balances and stats
      await updateDoc(doc(db, "users", referredBy), {
        walletBalance: increment(rewardAmount),
        coinBalance: increment(rewardCoins),
        totalReferrals: increment(1),
        referralEarnings: increment(rewardAmount),
      });

      // 7. Tier upgrade for referrer
      const updatedUserSnap = await getDoc(doc(db, "users", referredBy));
      const totalRefs = updatedUserSnap.data().totalReferrals || 0;
      let newTier = "bronze";
      if (totalRefs >= 15) newTier = "gold";
      else if (totalRefs >= 5) newTier = "silver";
      await updateDoc(doc(db, "users", referredBy), { referralTier: newTier });

      // 8. (Optional) Pyramid bonus – grand referrer gets 5 coins
      if (userData.referredBy) {
        const grandReferrerId = userData.referredBy;
        if (grandReferrerId) {
          await updateDoc(doc(db, "users", grandReferrerId), {
            coinBalance: increment(5),
            referralEarnings: increment(5),
          });
          await addDoc(collection(db, "wallet_transactions"), {
            userId: grandReferrerId,
            type: "referral_reward",
            amount: 0,
            coins: 5,
            description: "Pyramid bonus for grand referral",
            createdAt: serverTimestamp(),
          });
        }
      }

      toast.success(`Referral reward of ₹${rewardAmount} + ${rewardCoins} coins credited!`);
    } catch (error) {
      console.error("Referral reward processing failed:", error);
    }
  };

  // ========== Update Order Status ==========
  const updateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      toast.success("Status updated");

      // Refresh orders list
      const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      setOrders(updatedOrders);

      // Process referral reward if applicable
      const orderToProcess = updatedOrders.find(o => o.id === orderId);
      if (orderToProcess) {
        await processReferralReward(orderToProcess);
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // ========== Save Tracking URL ==========
  const saveTrackingUrl = async (orderId) => {
    const url = trackingInput[orderId] || '';
    try {
      await updateDoc(doc(db, "orders", orderId), { trackingUrl: url });
      toast.success("Tracking link saved");
    } catch (err) {
      toast.error("Failed to save tracking link");
    }
  };

  // ========== RENDER ==========
  return (
    <div className="p-4 md:p-0">
      <h2 className="text-2xl font-bold mb-4">Orders</h2>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="card">
            <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>

            {/* Customer info */}
            {order.address && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <UserIcon /> {order.address.name} &nbsp;|&nbsp; <PhoneIcon /> {order.address.phone}
              </p>
            )}

            <p>Total: ₹{order.total}</p>
            <p>Status: {order.status}</p>
            <p>Items: {order.items?.length || 0}</p>

            {/* Tracking URL */}
            <div className="mt-2 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <input
                type="text"
                placeholder="Tracking URL"
                value={trackingInput[order.id] || ''}
                onChange={e => setTrackingInput({ ...trackingInput, [order.id]: e.target.value })}
                className="input-field flex-grow"
              />
              <button
                onClick={() => saveTrackingUrl(order.id)}
                className="btn-gradient whitespace-nowrap flex items-center gap-1"
              >
                <SaveIcon /> Save Link
              </button>
            </div>

            {/* Status buttons */}
            <div className="flex gap-2 mt-2">
              {order.status === "pending" && (
                <>
                  <button
                    onClick={() => updateStatus(order.id, "confirmed")}
                    className="bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-1"
                  >
                    <ConfirmIcon /> Confirm
                  </button>
                  <button
                    onClick={() => updateStatus(order.id, "cancelled")}
                    className="bg-red-500 text-white px-3 py-1 rounded flex items-center gap-1"
                  >
                    <CancelIcon /> Cancel
                  </button>
                </>
              )}
              {order.status === "confirmed" && (
                <button
                  onClick={() => updateStatus(order.id, "shipped")}
                  className="bg-green-500 text-white px-3 py-1 rounded flex items-center gap-1"
                >
                  <ShippedIcon /> Mark Shipped
                </button>
              )}
              {order.status === "shipped" && (
                <button
                  onClick={() => updateStatus(order.id, "delivered")}
                  className="bg-purple-500 text-white px-3 py-1 rounded flex items-center gap-1"
                >
                  <DeliveredIcon /> Mark Delivered
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
