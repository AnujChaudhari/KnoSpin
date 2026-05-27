"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { HiShare, HiTrophy, HiCurrencyRupee } from "react-icons/hi";

export default function ReferralDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [coinBalance, setCoinBalance] = useState(0);
  const [referralTier, setReferralTier] = useState("bronze");
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user profile
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          setReferralCode(data.referralCode || "N/A");
          setTotalReferrals(data.totalReferrals || 0);
          setReferralEarnings(data.referralEarnings || 0);
          setCoinBalance(data.coinBalance || 0);
          setReferralTier(data.referralTier || "bronze");
        }

        // Fetch referrals
        const refSnap = await getDocs(
          query(
            collection(db, "referrals"),
            where("referrerId", "==", user.uid),
            orderBy("createdAt", "desc")
          )
        );
        setReferrals(refSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching referrals:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-xl mb-4">Please login to view your referrals.</p>
        <a href="/login" className="btn-gradient inline-block">Login</a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const shareText = `Join Quick Shop using my referral code ${referralCode} and get rewards! Sign up here: https://quickshoppro.vercel.app/signup?ref=${referralCode}`;

  const getTierColor = (tier) => {
    if (tier === "gold") return "text-yellow-500";
    if (tier === "silver") return "text-gray-400";
    return "text-orange-600";
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Referral Program</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <HiTrophy className={`mx-auto text-2xl ${getTierColor(referralTier)}`} />
          <p className={`text-xl font-bold ${getTierColor(referralTier)}`}>
            {referralTier?.toUpperCase() || "BRONZE"}
          </p>
          <p className="text-xs text-gray-500">Tier</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold">{totalReferrals || 0}</p>
          <p className="text-xs text-gray-500">Referrals</p>
        </div>
        <div className="card text-center">
          <HiCurrencyRupee className="mx-auto text-green-500 text-2xl" />
          <p className="text-xl font-bold">₹{referralEarnings || 0}</p>
          <p className="text-xs text-gray-500">Earned</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold">{coinBalance || 0}</p>
          <p className="text-xs text-gray-500">Coins</p>
        </div>
      </div>

      {/* Referral Code & Share */}
      <div className="card mb-8">
        <h3 className="font-bold text-lg mb-2">Your Referral Code</h3>
        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-4 rounded-xl">
          <span className="text-2xl font-mono font-bold tracking-widest">
            {referralCode || "N/A"}
          </span>
          <button
            onClick={() => {
              if (referralCode && referralCode !== "N/A") {
                navigator.clipboard.writeText(referralCode);
                alert("Copied!");
              }
            }}
            className="btn-gradient text-sm"
          >
            Copy
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 bg-green-500 text-white text-center py-2 rounded-lg text-sm"
          >
            📱 WhatsApp
          </a>
          <a
            href={`https://t.me/share/url?url=https://quickshoppro.vercel.app/signup?ref=${referralCode}&text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 bg-blue-500 text-white text-center py-2 rounded-lg text-sm"
          >
            ✈️ Telegram
          </a>
        </div>
      </div>

      {/* Referral History */}
      <div>
        <h3 className="font-bold text-lg mb-4">Referral History</h3>
        {referrals.length === 0 && (
          <div className="card text-center py-8">
            <HiShare className="text-4xl mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">No referrals yet. Share your code!</p>
          </div>
        )}
        <div className="space-y-2">
          {referrals.map(ref => (
            <div key={ref.id} className="card flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">Code: {ref.referralCode || "N/A"}</p>
                <p className="text-xs text-gray-500">
                  Status:{" "}
                  <span className={`font-bold ${
                    ref.status === "completed" ? "text-green-600" :
                    ref.status === "rejected" ? "text-red-600" : "text-yellow-600"
                  }`}>
                    {ref.status || "pending"}
                  </span>
                </p>
              </div>
              {ref.status === "completed" && (
                <span className="text-green-600 font-bold">+₹{ref.rewardAmount || 0}</span>
              )}
              {ref.status === "pending" && (
                <span className="text-yellow-600 text-sm">Pending</span>
              )}
              {ref.status === "rejected" && (
                <span className="text-red-600 text-sm">Rejected</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
