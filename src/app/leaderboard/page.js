"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { HiTrophy } from "react-icons/hi";

export default function LeaderboardPage() {
  const [topReferrers, setTopReferrers] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const q = query(collection(db, "users"), orderBy("totalReferrals", "desc"), limit(20));
      const snap = await getDocs(q);
      const users = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.totalReferrals > 0);
      setTopReferrers(users);
    };
    fetchLeaderboard();
  }, []);

  const getMedal = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "";
  };

  const getTierColor = (tier) => {
    if (tier === "gold") return "text-yellow-500";
    if (tier === "silver") return "text-gray-400";
    return "text-orange-600";
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">🏆 Referral Leaderboard</h1>
      <p className="text-gray-500 mb-8">Top referrers earning the most rewards</p>

      <div className="space-y-3">
        {topReferrers.map((user, idx) => (
          <div key={user.id} className="card flex items-center gap-4">
            <div className="text-2xl w-10 text-center">
              {getMedal(idx) || `#${idx + 1}`}
            </div>
            <div className="flex-grow">
              <p className="font-medium">{user.email?.split('@')[0] || "User"}</p>
              <p className={`text-sm font-bold ${getTierColor(user.referralTier)}`}>
                {user.referralTier?.toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">{user.totalReferrals}</p>
              <p className="text-xs text-gray-500">referrals</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">₹{user.referralEarnings}</p>
              <p className="text-xs text-gray-500">earned</p>
            </div>
          </div>
        ))}
        {topReferrers.length === 0 && (
          <p className="text-center text-gray-500 py-8">No referrals yet. Be the first to refer!</p>
        )}
      </div>

      <div className="mt-8 card text-center">
        <p className="text-lg font-semibold mb-2">Want to top the leaderboard?</p>
        <a href="/dashboard/referrals" className="btn-gradient inline-block">Start Referring</a>
      </div>
    </div>
  );
}
