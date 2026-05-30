"use client";
export const dynamic = 'force-dynamic';

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Premium SVG Icons
const OrderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3H3v18h18V8l-5-5z" /><path d="M16 3v5h5" /><path d="M8 13h8" /><path d="M8 17h5" />
  </svg>
);

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
);

const ReferralIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8l4 4-4 4" />
  </svg>
);

const WalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><circle cx="16" cy="12" r="2" /><path d="M2 10h4" />
  </svg>
);

const LeaderboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
  </svg>
);

// 🏆 New Trophy Icon for Achievements
const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2" />
    <path d="M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2" />
    <path d="M6 21h12" />
    <path d="M12 17V5" />
    <path d="M8 21h8" />
    <path d="M12 13a4 4 0 100-8 4 4 0 000 8z" />
  </svg>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setProfile(snap.data());
    };
    fetchProfile();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16 text-primary-400" stroke="currentColor" strokeWidth="1">
              <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
            </svg>
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white text-sm">!</div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to Quick Shop</h2>
        <p className="text-gray-500 mb-8 text-center max-w-sm">Login to access your orders, referrals, wallet and more.</p>
        <Link href="/login" className="btn-gradient px-8 py-3 text-lg">Login to Continue</Link>
      </div>
    );
  }

  const menuItems = [
    { href: "/dashboard/orders", label: "My Orders", icon: <OrderIcon />, desc: "Track, return & manage orders", color: "from-blue-500 to-cyan-500", bgLight: "bg-blue-50 dark:bg-blue-900/20", textColor: "text-blue-600 dark:text-blue-400" },
    { href: "/dashboard/profile", label: "My Profile", icon: <ProfileIcon />, desc: "Edit name, phone & password", color: "from-purple-500 to-pink-500", bgLight: "bg-purple-50 dark:bg-purple-900/20", textColor: "text-purple-600 dark:text-purple-400" },
    { href: "/dashboard/referrals", label: "Refer & Earn", icon: <ReferralIcon />, desc: "Invite friends, earn coins & cash", color: "from-orange-500 to-red-500", bgLight: "bg-orange-50 dark:bg-orange-900/20", textColor: "text-orange-600 dark:text-orange-400" },
    { href: "/dashboard/wallet", label: "My Wallet", icon: <WalletIcon />, desc: "Balance, coins & transactions", color: "from-green-500 to-emerald-500", bgLight: "bg-green-50 dark:bg-green-900/20", textColor: "text-green-600 dark:text-green-400" },
    { href: "/leaderboard", label: "Leaderboard", icon: <LeaderboardIcon />, desc: "Top referrers & rankings", color: "from-yellow-500 to-amber-500", bgLight: "bg-yellow-50 dark:bg-yellow-900/20", textColor: "text-yellow-600 dark:text-yellow-400" },
    { href: "/dashboard/achievements", label: "Achievements", icon: <TrophyIcon />, desc: "Your unlocked badges & rewards", color: "from-rose-500 to-pink-500", bgLight: "bg-rose-50 dark:bg-rose-900/20", textColor: "text-rose-600 dark:text-rose-400" },
    { href: "/dashboard/notifications", label: "Notifications", icon: <HiBell className="text-2xl"/>, desc: "View all alerts" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-500 rounded-3xl blur-xl opacity-20"></div>
        <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-gray-700/30 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {profile?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Hello, {profile?.name || user.email?.split('@')[0] || "User"} 👋</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              {profile?.referralTier && (
                <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                  profile.referralTier === 'gold' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  profile.referralTier === 'silver' ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                }`}>
                  {profile.referralTier?.toUpperCase()} TIER
                </span>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <p className="text-lg font-bold">{profile?.totalReferrals || 0}</p>
              <p className="text-xs text-gray-500">Referrals</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <p className="text-lg font-bold text-green-600">₹{profile?.referralEarnings || 0}</p>
              <p className="text-xs text-gray-500">Earned</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <p className="text-lg font-bold text-yellow-600">{profile?.coinBalance || 0}</p>
              <p className="text-xs text-gray-500">Coins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-3">
        {menuItems.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className={`w-14 h-14 rounded-2xl ${item.bgLight} flex items-center justify-center ${item.textColor} group-hover:scale-110 transition-transform duration-300`}>
              {item.icon}
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-lg">{item.label}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 group-hover:translate-x-1 transition-all duration-300" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        ))}
      </div>

      {/* Footer Note */}
      <p className="text-center text-xs text-gray-400 mt-8">
        Need help? Contact <a href="/contact" className="text-primary-500 underline">support</a>
      </p>
    </div>
  );
}
