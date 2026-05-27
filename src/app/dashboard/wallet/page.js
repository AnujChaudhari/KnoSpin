"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, query, where, orderBy, getDocs, serverTimestamp } from "firebase/firestore";
import { HiCurrencyRupee, HiCash, HiClock, HiGift } from "react-icons/hi";

export default function WalletPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoadingProfile(false);
      setLoadingTx(false);
      return;
    }
    const fetchData = async () => {
      // Ensure user document exists
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      
      if (!userSnap.exists()) {
        // Create user document with default values
        const defaultProfile = {
          email: user.email,
          referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          walletBalance: 0,
          coinBalance: 0,
          totalReferrals: 0,
          referralEarnings: 0,
          referralTier: "bronze",
          name: "",
          phone: "",
          createdAt: serverTimestamp(),
        };
        await setDoc(userDocRef, defaultProfile);
        setProfile(defaultProfile);
      } else {
        setProfile(userSnap.data());
      }
      setLoadingProfile(false);

      // Fetch transactions
      try {
        const txSnap = await getDocs(query(
          collection(db, "wallet_transactions"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        ));
        setTransactions(txSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching transactions:", err);
        // If index doesn't exist yet, show empty
        setTransactions([]);
      }
      setLoadingTx(false);
    };
    fetchData();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <HiCurrencyRupee className="text-6xl mx-auto text-gray-300 mb-4" />
        <p className="text-xl mb-4">Please login to view your wallet.</p>
      </div>
    );
  }

  if (loadingProfile) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const walletBalance = profile?.walletBalance || 0;
  const coinBalance = profile?.coinBalance || 0;

  const typeLabels = {
    referral_reward: "Referral Reward",
    cashback: "Cashback",
    purchase: "Purchase",
    admin_bonus: "Admin Bonus",
    coupon_reward: "Coupon Reward",
  };

  const getTypeIcon = (type) => {
    if (type === "referral_reward") return <HiGift className="text-pink-500" />;
    if (type === "cashback") return <HiCash className="text-green-500" />;
    if (type === "admin_bonus") return <HiGift className="text-purple-500" />;
    return <HiClock className="text-gray-500" />;
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">My Wallet</h1>
      <p className="text-gray-500 mb-6">Manage your balance, coins, and transactions</p>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-green-500"></div>
          <HiCurrencyRupee className="mx-auto text-green-500 text-3xl mt-2" />
          <p className="text-3xl font-bold mt-2">₹{walletBalance.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Wallet Balance</p>
        </div>
        <div className="card text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500"></div>
          <HiCash className="mx-auto text-yellow-500 text-3xl mt-2" />
          <p className="text-3xl font-bold mt-2">{coinBalance.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Coins (1 coin = ₹1)</p>
        </div>
      </div>

      {/* Quick Info */}
      {coinBalance > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            💡 You have {coinBalance} coins! Use them during checkout for instant discount.
          </p>
        </div>
      )}

      {/* Transaction History */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Transaction History</h3>
        {!loadingTx && transactions.length > 0 && (
          <span className="text-xs text-gray-500">{transactions.length} transactions</span>
        )}
      </div>

      {loadingTx && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse card h-16"></div>
          ))}
        </div>
      )}

      {!loadingTx && transactions.length === 0 && (
        <div className="text-center py-8">
          <HiClock className="text-4xl mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No transactions yet</p>
          <p className="text-xs text-gray-400 mt-1">Refer friends to earn rewards!</p>
        </div>
      )}

      {!loadingTx && (
        <div className="space-y-3">
          {transactions.map(tx => (
            <div key={tx.id} className="card flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-lg">
                {getTypeIcon(tx.type)}
              </div>
              <div className="flex-grow">
                <p className="font-medium text-sm">{typeLabels[tx.type] || tx.type}</p>
                <p className="text-xs text-gray-500">{tx.description}</p>
                {tx.createdAt && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(tx.createdAt.seconds * 1000).toLocaleDateString('en-IN', { 
                      day: 'numeric', month: 'short', year: 'numeric' 
                    })}
                  </p>
                )}
              </div>
              <div className="text-right">
                {tx.amount > 0 && (
                  <p className="text-green-600 font-bold text-sm">+₹{tx.amount}</p>
                )}
                {tx.amount < 0 && (
                  <p className="text-red-600 font-bold text-sm">-₹{Math.abs(tx.amount)}</p>
                )}
                {tx.coins > 0 && (
                  <p className="text-yellow-600 text-xs">+{tx.coins} coins</p>
                )}
                {tx.coins < 0 && (
                  <p className="text-orange-600 text-xs">{tx.coins} coins</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
