"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, limit, setDoc, serverTimestamp } from "firebase/firestore";

/* ────── Inline SVG Icons ────── */
const CurrencyRupeeIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6M9 12h6M9 16h4" />
    <circle cx="12" cy="20" r="2" />
  </svg>
);

const CashIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <circle cx="16" cy="12" r="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2 10h4" />
  </svg>
);

const GiftIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-8-8h16M4 12h16" />
    <rect x="2" y="6" width="20" height="4" rx="1" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 6c0-2.21 1.79-4 4-4s4 1.79 4 4" />
  </svg>
);

const ClockIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline strokeLinecap="round" strokeLinejoin="round" points="12 6 12 12 16 14" />
  </svg>
);

const SadEmojiIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 15s1.5-2 4-2 4 2 4 2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeLinecap="round" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeLinecap="round" />
  </svg>
);

const SparklesIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2zm0 14l-1.5 5.5L5 23l5.5 1.5L12 30l1.5-5.5L19 23l-5.5-1.5L12 16z" />
  </svg>
);

export default function WalletPage() {
  const auth = useAuth();
  const user = auth?.user;
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoadingProfile(false);
      setLoadingTx(false);
      return;
    }

    const fetchData = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        
        if (!userSnap.exists()) {
          const defaultProfile = {
            email: user.email || "",
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
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please try again.");
      }
      setLoadingProfile(false);

      // Fetch transactions – बिना orderBy के (कोई index नहीं चाहिए)
      try {
        const q = query(
          collection(db, "wallet_transactions"),
          where("userId", "==", user.uid),
          limit(50)
        );
        const txSnap = await getDocs(q);
        let txList = txSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        txList.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        txList = txList.slice(0, 50);
        setTransactions(txList);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setTransactions([]);
      }
      setLoadingTx(false);
    };

    fetchData();
  }, [user]);

  // ===== NOT LOGGED IN =====
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
            <CurrencyRupeeIcon className="text-5xl text-gray-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Wallet Locked</h2>
          <p className="text-gray-500 mb-6">Please login to access your wallet</p>
          <a href="/login" className="btn-gradient inline-block">Login Now</a>
        </div>
      </div>
    );
  }

  // ===== LOADING STATE =====
  if (loadingProfile) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">My Wallet</h1>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
          </div>
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center py-16">
          <SadEmojiIcon className="text-5xl mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-bold mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-gradient">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ===== MAIN CONTENT =====
  const walletBalance = profile?.walletBalance || 0;
  const coinBalance = profile?.coinBalance || 0;

  const typeLabels = {
    referral_reward: "Referral Reward 🎁",
    cashback: "Cashback 💸",
    purchase: "Purchase 🛒",
    admin_bonus: "Admin Bonus ⭐",
    coupon_reward: "Coupon Reward 🎫",
  };

  const getTypeColor = (type) => {
    switch(type) {
      case "referral_reward": return "bg-pink-100 dark:bg-pink-900/30 text-pink-600";
      case "cashback": return "bg-green-100 dark:bg-green-900/30 text-green-600";
      case "admin_bonus": return "bg-purple-100 dark:bg-purple-900/30 text-purple-600";
      case "purchase": return "bg-blue-100 dark:bg-blue-900/30 text-blue-600";
      case "coupon_reward": return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600";
      default: return "bg-gray-100 dark:bg-gray-700 text-gray-600";
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">My Wallet</h1>
      <p className="text-gray-500 mb-6">Manage your balance, coins, and rewards</p>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card text-center relative overflow-hidden border-t-4 border-green-500">
          <div className="absolute -top-2 -right-2 opacity-10">
            <CurrencyRupeeIcon className="text-8xl" />
          </div>
          <CurrencyRupeeIcon className="mx-auto text-green-500 text-2xl mt-2 relative z-10" />
          <p className="text-3xl font-bold mt-2 relative z-10">
            ₹{walletBalance.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-500 mt-1 relative z-10">Wallet Balance</p>
        </div>
        <div className="card text-center relative overflow-hidden border-t-4 border-yellow-500">
          <div className="absolute -top-2 -right-2 opacity-10">
            <CashIcon className="text-8xl" />
          </div>
          <CashIcon className="mx-auto text-yellow-500 text-2xl mt-2 relative z-10" />
          <p className="text-3xl font-bold mt-2 relative z-10">
            {coinBalance.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-500 mt-1 relative z-10">Coins (1 coin = ₹1)</p>
        </div>
      </div>

      {/* Coin Usage Info */}
      {coinBalance > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl mb-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <SparklesIcon className="text-blue-500 text-xl flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                💡 You have <strong>{coinBalance} coins</strong> available!
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Use them during checkout for instant discount on your next purchase.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Transaction History</h3>
        {!loadingTx && transactions.length > 0 && (
          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            {transactions.length} entries
          </span>
        )}
      </div>

      {/* Loading Transactions */}
      {loadingTx && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex items-center gap-4 card">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600"></div>
              <div className="flex-grow space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
              <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loadingTx && transactions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
            <ClockIcon className="text-3xl text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No transactions yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Refer friends to earn rewards and start building your wallet!
          </p>
          <a href="/dashboard/referrals" className="btn-gradient inline-block mt-4 text-sm">
            Start Referring
          </a>
        </div>
      )}

      {/* Transaction List */}
      {!loadingTx && transactions.length > 0 && (
        <div className="space-y-2">
          {transactions.map(tx => (
            <div key={tx.id} className="card flex items-center gap-3 hover:shadow-md transition-shadow duration-200">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${getTypeColor(tx.type)}`}>
                {tx.type === "referral_reward" && <GiftIcon />}
                {tx.type === "cashback" && <CashIcon />}
                {tx.type === "admin_bonus" && <SparklesIcon />}
                {tx.type === "purchase" && <CurrencyRupeeIcon />}
                {!["referral_reward","cashback","admin_bonus","purchase"].includes(tx.type) && <ClockIcon />}
              </div>
              <div className="flex-grow min-w-0">
                <p className="font-medium text-sm truncate">
                  {typeLabels[tx.type] || tx.type}
                </p>
                {tx.description && (
                  <p className="text-xs text-gray-500 truncate">{tx.description}</p>
                )}
                {tx.createdAt && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(tx.createdAt.seconds * 1000).toLocaleDateString('en-IN', { 
                      day: 'numeric', month: 'short', year: 'numeric' 
                    })}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                {tx.amount > 0 && (
                  <p className="text-green-600 font-bold text-sm">+₹{tx.amount}</p>
                )}
                {tx.amount < 0 && (
                  <p className="text-red-600 font-bold text-sm">-₹{Math.abs(tx.amount)}</p>
                )}
                {tx.coins > 0 && (
                  <p className="text-yellow-600 text-xs font-medium">+{tx.coins} 🪙</p>
                )}
                {tx.coins < 0 && (
                  <p className="text-orange-600 text-xs font-medium">{tx.coins} 🪙</p>
                )}
                {tx.amount === 0 && tx.coins === 0 && (
                  <p className="text-gray-400 text-xs">--</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
