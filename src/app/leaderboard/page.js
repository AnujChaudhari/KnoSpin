"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

/* ────── प्रीमियम SVG आइकॉन ────── */
const TrophyIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a4 4 0 014 4v2h2.5A1.5 1.5 0 0120 9.5V11a6 6 0 01-5 5.92V19h3v2H6v-2h3v-2.08A6 6 0 014 11V9.5A1.5 1.5 0 015.5 8H8V6a4 4 0 014-4zm0 2a2 2 0 00-2 2v2h4V6a2 2 0 00-2-2zM5.5 10H8v2a4 4 0 01-2.46-.54A.5.5 0 015.5 10zM18.5 10a.5.5 0 01.04 1.46A4 4 0 0116 12v-2h2.5z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const FireIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2c-3.3 3.3-5 6.2-5 9.5 0 3.5 2.2 6.5 5 7.9.5-.3 1-.7 1.3-1.2 1-1.5.7-3.8-.3-5.6-.6-1-1.3-1.8-2-2.5-.5 1.2-.2 2.7.2 3.5.6 1.3 1.6 2.1 2.8 2.3 2.4.3 4.5-1.6 4.5-4 0-3.3-2.2-6.2-5.5-9.5z" />
  </svg>
);

const MedalIcon = ({ place }) => {
  if (place === 0) return <span className="text-2xl">🥇</span>;
  if (place === 1) return <span className="text-2xl">🥈</span>;
  if (place === 2) return <span className="text-2xl">🥉</span>;
  return <span className="text-lg font-bold text-gray-400">#{place + 1}</span>;
};

export default function LeaderboardPage() {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // लीडरबोर्ड के लिए users को XP के हिसाब से लाना (ज्यादातर एक्टिविटी)
        const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(20));
        const snap = await getDocs(q);
        const users = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(u => (u.xp || 0) > 0 || (u.totalReferrals || 0) > 0); // कम से कम कुछ एक्टिविटी हो
        setTopUsers(users);
      } catch (error) {
        console.error("Leaderboard fetch error:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const getLevelColor = (level) => {
    if (level >= 10) return "bg-purple-500 text-white";
    if (level >= 5) return "bg-blue-500 text-white";
    if (level >= 3) return "bg-green-500 text-white";
    return "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200";
  };

  const getTierColor = (tier) => {
    if (tier === "gold") return "text-yellow-500";
    if (tier === "silver") return "text-gray-400";
    return "text-orange-600";
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <TrophyIcon />
          Leaderboard
        </h1>
        <p className="text-gray-500 mt-2">Top performers based on XP, referrals, and achievements</p>
      </div>

      <div className="space-y-4">
        {topUsers.map((user, idx) => (
          <div key={user.id} className="card flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            {/* रैंक / मेडल */}
            <div className="w-10 text-center flex-shrink-0">
              <MedalIcon place={idx} />
            </div>

            {/* यूजर इन्फो */}
            <div className="flex-grow min-w-0">
              <p className="font-semibold truncate">{user.email?.split('@')[0] || "User"}</p>
              <div className="flex items-center gap-2 mt-1">
                {/* टियर बैज */}
                {user.referralTier && (
                  <span className={`text-xs font-bold ${getTierColor(user.referralTier)}`}>
                    {user.referralTier.toUpperCase()}
                  </span>
                )}
                {/* लेवल बैज */}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getLevelColor(user.level || 1)}`}>
                  Lv.{user.level || 1}
                </span>
              </div>
            </div>

            {/* स्टैट्स */}
            <div className="flex items-center gap-4 text-right flex-shrink-0">
              <div title="Referrals">
                <div className="flex items-center gap-1">
                  <span className="text-sm">{user.totalReferrals || 0}</span>
                  <span className="text-xs text-gray-400">refs</span>
                </div>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-600"></div>
              <div title="XP">
                <div className="flex items-center gap-1">
                  <FireIcon />
                  <span className="font-mono font-bold text-sm">{(user.xp || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {topUsers.length === 0 && !loading && (
        <div className="text-center py-16">
          <StarIcon />
          <p className="text-gray-500 mt-4">No one has earned XP yet. Start referring and shopping to climb the ranks!</p>
          <a href="/dashboard/referrals" className="btn-gradient mt-4 inline-block">Start Referring</a>
        </div>
      )}

      <div className="mt-8 card text-center">
        <p className="text-lg font-semibold mb-2">🔥 Want to see your name here?</p>
        <p className="text-sm text-gray-500 mb-4">Earn XP by placing orders, referring friends, spinning the wheel, and unlocking achievements.</p>
        <a href="/dashboard/achievements" className="btn-gradient inline-block">View Achievements</a>
      </div>
    </div>
  );
}
