"use client";
export const dynamic = 'force-dynamic';

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/* ────────── Inline SVG Icons ────────── */
const BellIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);
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
const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2" /><path d="M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2" />
    <path d="M6 21h12" /><path d="M12 17V5" /><path d="M8 21h8" /><path d="M12 13a4 4 0 100-8 4 4 0 000 8z" />
  </svg>
);
const BookOpenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
  </svg>
);
const GroupIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const PremiumIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const SyllabusIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);
const CrownIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 19h20v1H2v-1zm4.6-5.6L12 2l5.4 11.4L22 6.4V17H2V6.4l4.6 7z" />
  </svg>
);
const SparklesIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2zm0 14l-1.5 5.5L5 23l5.5 1.5L12 30l1.5-5.5L19 23l-5.5-1.5L12 16z" />
  </svg>
);
const CheckBadgeIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);
const ArrowUpIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
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

  // ── Subscription Data ──
  const tier = profile?.subscriptionTier || "free";
  const expiry = profile?.subscriptionExpiry?.toDate?.();
  const expiryDate = expiry
    ? expiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;
  const isPremium = tier !== "free";
  const daysLeft = expiry ? Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24)) : null;
  const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;
  const isExpired = daysLeft !== null && daysLeft <= 0;

  const tierLabel = tier === "free" ? "Free" : tier === "premium_lite" ? "Premium Lite" : "Premium Pro";
  const tierGradient = tier === "free"
    ? "from-gray-400 to-gray-500"
    : tier === "premium_lite"
    ? "from-blue-500 to-cyan-500"
    : "from-purple-500 to-pink-500";
  const tierBgLight = tier === "free"
    ? "bg-gray-100 dark:bg-gray-700/50"
    : tier === "premium_lite"
    ? "bg-blue-100 dark:bg-blue-900/30"
    : "bg-purple-100 dark:bg-purple-900/30";

  const menuItems = [
    { href: "/dashboard/orders", label: "My Orders", icon: <OrderIcon />, desc: "Track, return & manage orders", bgLight: "bg-blue-50 dark:bg-blue-900/20", textColor: "text-blue-600 dark:text-blue-400" },
    { href: "/dashboard/profile", label: "My Profile", icon: <ProfileIcon />, desc: "Edit name, phone & password", bgLight: "bg-purple-50 dark:bg-purple-900/20", textColor: "text-purple-600 dark:text-purple-400" },
    { href: "/dashboard/referrals", label: "Refer & Earn", icon: <ReferralIcon />, desc: "Invite friends, earn coins & cash", bgLight: "bg-orange-50 dark:bg-orange-900/20", textColor: "text-orange-600 dark:text-orange-400" },
    { href: "/dashboard/wallet", label: "My Wallet", icon: <WalletIcon />, desc: "Balance, coins & transactions", bgLight: "bg-green-50 dark:bg-green-900/20", textColor: "text-green-600 dark:text-green-400" },
    { href: "/dashboard/syllabus", label: "My Syllabus", icon: <SyllabusIcon />, desc: "Upload & manage your syllabus files", bgLight: "bg-amber-50 dark:bg-amber-900/20", textColor: "text-amber-600 dark:text-amber-400" },
    { href: "/leaderboard", label: "Leaderboard", icon: <LeaderboardIcon />, desc: "Top referrers & rankings", bgLight: "bg-yellow-50 dark:bg-yellow-900/20", textColor: "text-yellow-600 dark:text-yellow-400" },
    { href: "/dashboard/achievements", label: "Achievements", icon: <TrophyIcon />, desc: "Your unlocked badges & rewards", bgLight: "bg-rose-50 dark:bg-rose-900/20", textColor: "text-rose-600 dark:text-rose-400" },
    { href: "/dashboard/notifications", label: "Notifications", icon: <BellIcon />, desc: "View all alerts", bgLight: "bg-gray-50 dark:bg-gray-700", textColor: "text-gray-600 dark:text-gray-300" },
    { href: "/dashboard/my-courses", label: "My Courses", icon: <BookOpenIcon />, desc: "Enrolled courses & progress", bgLight: "bg-teal-50 dark:bg-teal-900/20", textColor: "text-teal-600 dark:text-teal-400" },
    { href: "/dashboard/my-groups", label: "My Groups", icon: <GroupIcon />, desc: "Your community groups", bgLight: "bg-sky-50 dark:bg-sky-900/20", textColor: "text-sky-600 dark:text-sky-400" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* ========== PROFILE HEADER CARD ========== */}
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-500 rounded-3xl blur-xl opacity-20"></div>
        <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-gray-700/30 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {profile?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-grow">
              <h1 className="text-2xl font-bold">
                Hello, {profile?.name || user.email?.split('@')[0] || "User"} 👋
              </h1>
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
            {/* Tier Badge */}
            <div className={`hidden sm:flex flex-col items-center px-3 py-2 rounded-2xl ${tierBgLight}`}>
              <CrownIcon />
              <span className="text-xs font-bold mt-1">{tierLabel}</span>
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

      {/* ========== PREMIUM SUBSCRIPTION CARD ========== */}
      <div className={`relative overflow-hidden rounded-2xl mb-8 shadow-lg border ${
        isPremium
          ? 'border-yellow-300 dark:border-yellow-700 bg-gradient-to-br from-yellow-50 via-white to-white dark:from-yellow-900/20 dark:via-gray-800 dark:to-gray-800'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      }`}>
        {/* Background sparkle for premium */}
        {isPremium && (
          <div className="absolute -top-4 -right-4 opacity-20">
            <SparklesIcon />
          </div>
        )}

        <div className="relative p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            {/* Left – Plan info */}
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-8 h-8 rounded-xl bg-gradient-to-br ${tierGradient} flex items-center justify-center text-white`}>
                  <CrownIcon />
                </span>
                <h2 className="text-xl font-bold">{tierLabel}</h2>
                {isPremium && !isExpired && (
                  <CheckBadgeIcon />
                )}
              </div>

              {tier === "free" ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Upgrade to unlock premium features like notes, assignments, projects, and exclusive courses.
                </p>
              ) : isExpired ? (
                <p className="text-sm text-red-500 dark:text-red-400 mt-2 font-medium">
                  ⚠️ Your subscription has expired. Renew now to restore premium access.
                </p>
              ) : (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isExpiringSoon ? '⏰ Expiring soon' : '✅ Active'} • Expires on{' '}
                    <strong>{expiryDate}</strong>
                  </p>
                  {daysLeft !== null && daysLeft > 0 && (
                    <p className="text-xs text-gray-400">
                      {daysLeft} day{daysLeft > 1 ? 's' : ''} remaining
                    </p>
                  )}
                  {/* Feature tags */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tier === "premium_lite" && (
                      <>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">Notes & Assignments</span>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">Selected Courses</span>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">No Ads</span>
                      </>
                    )}
                    {tier === "premium_pro" && (
                      <>
                        <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">All Courses</span>
                        <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">15+ PD Subjects</span>
                        <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">Priority Support</span>
                        <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">Exclusive Webinars</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right – Action button */}
            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
              {tier === "free" && (
                <Link href="/pricing" className="btn-gradient flex items-center gap-2 px-5 py-2.5 text-sm whitespace-nowrap">
                  <ArrowUpIcon /> Upgrade Now
                </Link>
              )}
              {tier === "premium_lite" && (
                <Link href="/pricing" className="btn-gradient flex items-center gap-2 px-5 py-2.5 text-sm whitespace-nowrap">
                  <ArrowUpIcon /> Upgrade to Pro
                </Link>
              )}
              {tier === "premium_pro" && (
                <span className="text-sm text-gray-400 dark:text-gray-500">You're on the best plan!</span>
              )}
              {isExpired && (
                <Link href="/pricing" className="btn-gradient flex items-center gap-2 px-5 py-2.5 text-sm whitespace-nowrap">
                  <ArrowUpIcon /> Renew Now
                </Link>
              )}
              <Link href="/pricing" className="text-sm text-primary-600 hover:underline whitespace-nowrap">
                View All Plans
              </Link>
            </div>
          </div>

          {/* Progress bar for expiry (premium only) */}
          {isPremium && daysLeft !== null && daysLeft > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    isExpiringSoon ? 'bg-red-500' : tier === 'premium_lite' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${Math.min(100, ((30 - daysLeft) / 30) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========== MENU ITEMS ========== */}
      <div className="space-y-3">
        {menuItems.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className={`w-14 h-14 rounded-2xl ${item.bgLight || 'bg-gray-50 dark:bg-gray-700'} flex items-center justify-center ${item.textColor || 'text-gray-600 dark:text-gray-300'} group-hover:scale-110 transition-transform duration-300`}>
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

      {/* ========== FOOTER NOTE ========== */}
      <p className="text-center text-xs text-gray-400 mt-8">
        Need help? Contact <a href="/contact" className="text-primary-500 underline">support</a>
      </p>
    </div>
  );
}
