"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

/* ───────── प्रीमियम इनलाइन SVG आइकॉन ───────── */
const TrophyIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a4 4 0 014 4v2h2.5A1.5 1.5 0 0120 9.5V11a6 6 0 01-5 5.92V19h3v2H6v-2h3v-2.08A6 6 0 014 11V9.5A1.5 1.5 0 015.5 8H8V6a4 4 0 014-4zm0 2a2 2 0 00-2 2v2h4V6a2 2 0 00-2-2zM5.5 10H8v2a4 4 0 01-2.46-.54A.5.5 0 015.5 10zM18.5 10a.5.5 0 01.04 1.46A4 4 0 0116 12v-2h2.5z" />
  </svg>
);

const RupeeIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 4h10M7 8h10M7 12h6M7 16h4" />
    <circle cx="12" cy="20" r="2" />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

export default function ReferralDashboard() {
  const auth = useAuth();
  const user = auth?.user;
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
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          setReferralCode(data.referralCode || "N/A");
          setTotalReferrals(data.totalReferrals || 0);
          setReferralEarnings(data.referralEarnings || 0);
          setCoinBalance(data.coinBalance || 0);
          setReferralTier(data.referralTier || "bronze");
        }

        const q = query(collection(db, "referrals"), where("referrerId", "==", user.uid));
        const refSnap = await getDocs(q);
        const list = refSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setReferrals(list);
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
          <TrophyIcon />
          <p className={`text-xl font-bold mt-1 ${getTierColor(referralTier)}`}>
            {referralTier?.toUpperCase() || "BRONZE"}
          </p>
          <p className="text-xs text-gray-500">Tier</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold">{totalReferrals || 0}</p>
          <p className="text-xs text-gray-500">Referrals</p>
        </div>
        <div className="card text-center">
          <RupeeIcon />
          <p className="text-xl font-bold mt-1">₹{referralEarnings || 0}</p>
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
            className="btn-gradient text-sm flex items-center gap-1"
          >
            <CopyIcon /> Copy
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
            <ShareIcon />
            <p className="text-gray-500 mt-2">No referrals yet. Share your code!</p>
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
