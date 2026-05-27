"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { HiShare, HiTrophy, HiCurrencyRupee } from "react-icons/hi";

export default function ReferralDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (userSnap.exists()) setProfile(userSnap.data());

      const refSnap = await getDocs(query(collection(db, "referrals"), where("referrerId", "==", user.uid)));
      setReferrals(refSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchData();
  }, [user]);

  if (!user) return <p className="p-8 text-center">Please login first.</p>;
  if (!profile) return <p className="p-8 text-center">Loading...</p>;

  const shareText = `Join Quick Shop using my referral code ${profile.referralCode} and get rewards! Sign up here: https://quickshoppro.vercel.app/signup?ref=${profile.referralCode}`;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Referral Program</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <HiTrophy className="mx-auto text-yellow-500 text-2xl" />
          <p className="text-2xl font-bold">{profile.referralTier}</p>
          <p className="text-xs text-gray-500">Tier</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold">{profile.totalReferrals}</p>
          <p className="text-xs text-gray-500">Referrals</p>
        </div>
        <div className="card text-center">
          <HiCurrencyRupee className="mx-auto text-green-500 text-2xl" />
          <p className="text-2xl font-bold">₹{profile.referralEarnings}</p>
          <p className="text-xs text-gray-500">Earned</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold">{profile.coinBalance}</p>
          <p className="text-xs text-gray-500">Coins</p>
        </div>
      </div>

      {/* Referral Code & Share */}
      <div className="card mb-8">
        <h3 className="font-bold text-lg mb-2">Your Referral Code</h3>
        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-4 rounded-xl">
          <span className="text-2xl font-mono font-bold tracking-widest">{profile.referralCode}</span>
          <button
            onClick={() => { navigator.clipboard.writeText(profile.referralCode); alert("Copied!"); }}
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
            href={`https://t.me/share/url?url=https://quickshoppro.vercel.app/signup?ref=${profile.referralCode}&text=${encodeURIComponent(shareText)}`}
            target="_blank"
            className="flex-1 bg-blue-500 text-white text-center py-2 rounded-lg text-sm"
          >
            ✈️ Telegram
          </a>
        </div>
      </div>

      {/* Referral History */}
      <div>
        <h3 className="font-bold text-lg mb-4">Referral History</h3>
        {referrals.length === 0 && <p className="text-gray-500">No referrals yet. Share your code!</p>}
        <div className="space-y-2">
          {referrals.map(ref => (
            <div key={ref.id} className="card flex justify-between items-center">
              <div>
                <p className="font-medium">Code: {ref.referralCode}</p>
                <p className="text-xs text-gray-500">Status: {ref.status}</p>
              </div>
              {ref.status === "completed" && (
                <span className="text-green-600 font-bold">+₹{ref.rewardAmount}</span>
              )}
              {ref.status === "pending" && (
                <span className="text-yellow-600 text-sm">Pending</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
