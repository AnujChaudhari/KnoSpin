"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { HiCurrencyRupee, HiCash, HiClock } from "react-icons/hi";

export default function WalletPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (userSnap.exists()) setProfile(userSnap.data());

      const txSnap = await getDocs(query(
        collection(db, "wallet_transactions"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      ));
      setTransactions(txSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchData();
  }, [user]);

  if (!user) return <p className="p-8 text-center">Please login first.</p>;
  if (!profile) return <p className="p-8 text-center">Loading...</p>;

  const typeLabels = {
    referral_reward: "Referral Reward",
    cashback: "Cashback",
    purchase: "Purchase",
    admin_bonus: "Admin Bonus",
    coupon_reward: "Coupon Reward",
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Wallet</h1>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card text-center">
          <HiCurrencyRupee className="mx-auto text-green-500 text-3xl" />
          <p className="text-3xl font-bold">₹{profile.walletBalance || 0}</p>
          <p className="text-xs text-gray-500">Wallet Balance</p>
        </div>
        <div className="card text-center">
          <HiCash className="mx-auto text-yellow-500 text-3xl" />
          <p className="text-3xl font-bold">{profile.coinBalance || 0}</p>
          <p className="text-xs text-gray-500">Coins</p>
        </div>
      </div>

      {/* Transaction History */}
      <h3 className="font-bold text-lg mb-4">Transaction History</h3>
      {transactions.length === 0 && <p className="text-gray-500">No transactions yet.</p>}
      <div className="space-y-3">
        {transactions.map(tx => (
          <div key={tx.id} className="card flex justify-between items-center">
            <div>
              <p className="font-medium">{typeLabels[tx.type] || tx.type}</p>
              <p className="text-xs text-gray-500">{tx.description}</p>
            </div>
            <div className="text-right">
              {tx.amount > 0 && <p className="text-green-600 font-bold">+₹{tx.amount}</p>}
              {tx.coins > 0 && <p className="text-yellow-600 text-sm">+{tx.coins} coins</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
