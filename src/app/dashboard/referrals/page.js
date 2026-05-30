"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { HiShare, HiTrophy, HiCurrencyRupee } from "react-icons/hi";

export default function ReferralDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Fetch user profile
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          setProfile(userSnap.data());
        } else {
          setProfile({
            referralCode: "N/A",
            totalReferrals: 0,
            referralEarnings: 0,
            coinBalance: 0,
            referralTier: "bronze",
          });
        }

        // 2. Fetch referrals – बिना orderBy के (कोई इंडेक्स नहीं चाहिए)
        try {
          const refSnap = await getDocs(
            query(
              collection(db, "referrals"),
              where("referrerId", "==", user.uid)
            )
          );
          const list = refSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          // क्लाइंट-साइड सॉर्ट: नए पहले
          list.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
          setReferrals(list);
        } catch (indexErr) {
          console.warn("Referral query failed:", indexErr);
          setReferrals([]); // खाली छोड़ें, कोई क्रैश नहीं
        }
      } catch (err) {
        console.error("Unexpected error:", err);
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
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const referralCode = profile?.referralCode || "N/A";
  const totalReferrals = profile?.totalReferrals || 0;
  const referralEarnings = profile?.referralEarnings || 0;
  const coinBalance = profile?.coinBalance || 0;
  const referralTier = profile?.referralTier || "bronze";

  const shareText = `Join Quick Shop using my referral code ${referralCode} and get rewards! Sign up here: https://quickshoppro.vercel.app/signup?ref=${referralCode}`;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Referral Program</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <HiTrophy className="mx-auto text-2xl text-yellow-500" />
          <p className="text-xl font-bold uppercase">{referralTier}</p>
          <p className="text-xs text-gray-500">Tier</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold">{totalReferrals}</p>
          <p className="text-xs text-gray-500">Referrals</p>
        </div>
        <div className="card text-center">
          <HiCurrencyRupee className="mx-auto text-green-500 text-2xl" />
          <p className="text-xl font-bold">₹{referralEarnings}</p>
          <p className="text-xs text-gray-500">Earned</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold">{coinBalance}</p>
          <p className="text-xs text-gray-500">Coins</p>
        </div>
      </div>

      <div className="card mb-8">
        <h3 className="font-bold text-lg mb-2">Your Referral Code</h3>
        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-4 rounded-xl">
          <span className="text-2xl font-mono font-bold tracking-widest">{referralCode}</span>
          <button
            onClick={() => { navigator.clipboard.writeText(referralCode); alert("Copied!"); }}
            className="btn-gradient text-sm"
          >
            Copy
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            className="flex-1 bg-green-500 text-white text-center py-2 rounded-lg text-sm"
          >
            📱 WhatsApp
          </a>
          <a
            href={`https://t.me/share/url?url=https://quickshoppro.vercel.app/signup?ref=${referralCode}&text=${encodeURIComponent(shareText)}`}
            target="_blank"
            className="flex-1 bg-blue-500 text-white text-center py-2 rounded-lg text-sm"
          >
            ✈️ Telegram
          </a>
        </div>
      </div>

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
              {ref.status === "completed" && <span className="text-green-600 font-bold">+₹{ref.rewardAmount || 0}</span>}
              {ref.status === "pending" && <span className="text-yellow-600 text-sm">Pending</span>}
              {ref.status === "rejected" && <span className="text-red-600 text-sm">Rejected</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
