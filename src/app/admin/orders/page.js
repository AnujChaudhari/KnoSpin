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
import { sendNotification } from "@/lib/notifications"; // ✅ NEW
import { toast } from "react-hot-toast";

/* ───────── SVG Icons (same as before) ───────── */
const UserIcon = () => ( /* ... same ... */ );
const PhoneIcon = () => ( /* ... same ... */ );
const ConfirmIcon = () => ( /* ... same ... */ );
const CancelIcon = () => ( /* ... same ... */ );
const ShippedIcon = () => ( /* ... same ... */ );
const DeliveredIcon = () => ( /* ... same ... */ );
const SaveIcon = () => ( /* ... same ... */ );

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

  // ========== REFERRAL REWARD AUTOMATION (with Notifications) ==========
  const processReferralReward = async (order) => {
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

      // 5. Add wallet transaction
      await addDoc(collection(db, "wallet_transactions"), {
        userId: referredBy,
        type: "referral_reward",
        amount: rewardAmount,
        coins: rewardCoins,
        description: `Referral reward – user completed first order`,
        orderId: order.id,
        createdAt: serverTimestamp(),
      });

      // 6. Update referrer's stats & XP
      await updateDoc(doc(db, "users", referredBy), {
        walletBalance: increment(rewardAmount),
        coinBalance: increment(rewardCoins),
        totalReferrals: increment(1),
        referralEarnings: increment(rewardAmount),
        xp: increment(100),
      });

      // ✅ NOTIFY REFERRER
      sendNotification(
        referredBy,
        "referral",
        "🎉 Referral Reward Credited!",
        `You earned ₹${rewardAmount} + ${rewardCoins} coins because your referral completed their first order.`,
        "/dashboard/referrals"
      );

      // 7. Tier upgrade
      const updatedUserSnap = await getDoc(doc(db, "users", referredBy));
      const totalRefs = updatedUserSnap.data().totalReferrals || 0;
      let newTier = "bronze";
      if (totalRefs >= 15) newTier = "gold";
      else if (totalRefs >= 5) newTier = "silver";
      await updateDoc(doc(db, "users", referredBy), { referralTier: newTier });

      // 8. Pyramid bonus (grand referrer)
      if (userData.referredBy) {
        const grandReferrerId = userData.referredBy;
        if (grandReferrerId) {
          await updateDoc(doc(db, "users", grandReferrerId), {
            coinBalance: increment(5),
            referralEarnings: increment(5),
            xp: increment(10),
          });
          await addDoc(collection(db, "wallet_transactions"), {
            userId: grandReferrerId,
            type: "referral_reward",
            amount: 0,
            coins: 5,
            description: "Pyramid bonus for grand referral",
            createdAt: serverTimestamp(),
          });

          // ✅ NOTIFY GRAND REFERRER
          sendNotification(
            grandReferrerId,
            "referral",
            "🎁 Pyramid Bonus!",
            "You received 5 coins because someone you referred made a successful referral.",
            "/dashboard/referrals"
          );
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

      const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      setOrders(updatedOrders);

      const orderToProcess = updatedOrders.find(o => o.id === orderId);
      if (orderToProcess) {
        await processReferralReward(orderToProcess);
      }

      // ✅ Optional: notify customer on status change
      if (orderToProcess?.userId) {
        sendNotification(
          orderToProcess.userId,
          "order",
          `📦 Order ${newStatus}`,
          `Your order #${orderId.slice(0,8)} is now ${newStatus}.`,
          "/dashboard/orders"
        );
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

            {order.address && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <UserIcon /> {order.address.name} &nbsp;|&nbsp; <PhoneIcon /> {order.address.phone}
              </p>
            )}

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
              <button onClick={() => saveTrackingUrl(order.id)} className="btn-gradient whitespace-nowrap flex items-center gap-1">
                <SaveIcon /> Save Link
              </button>
            </div>

            <div className="flex gap-2 mt-2">
              {order.status === "pending" && (
                <>
                  <button onClick={() => updateStatus(order.id, "confirmed")} className="bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-1">
                    <ConfirmIcon /> Confirm
                  </button>
                  <button onClick={() => updateStatus(order.id, "cancelled")} className="bg-red-500 text-white px-3 py-1 rounded flex items-center gap-1">
                    <CancelIcon /> Cancel
                  </button>
                </>
              )}
              {order.status === "confirmed" && (
                <button onClick={() => updateStatus(order.id, "shipped")} className="bg-green-500 text-white px-3 py-1 rounded flex items-center gap-1">
                  <ShippedIcon /> Mark Shipped
                </button>
              )}
              {order.status === "shipped" && (
                <button onClick={() => updateStatus(order.id, "delivered")} className="bg-purple-500 text-white px-3 py-1 rounded flex items-center gap-1">
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
