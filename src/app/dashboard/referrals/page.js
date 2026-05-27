"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, serverTimestamp } from "firebase/firestore";
import { HiShare, HiTrophy, HiCurrencyRupee, HiClipboardCopy, HiUserGroup, HiGift } from "react-icons/hi";
import { toast } from "react-hot-toast";

export default function ReferralDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoadingProfile(false);
      setLoadingRefs(false);
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

      // Fetch referrals
      try {
        const refSnap = await getDocs(query(
          collection(db, "referrals"),
          where("referrerId", "==", user.uid),
          orderBy("createdAt", "desc")
        ));
        setReferrals(refSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching referrals:", err);
        setReferrals([]);
      }
      setLoadingRefs(false);
    };
    fetchData();
  }, [user]);

  const handleCopy = () => {
    if (!profile?.referralCode) return;
    navigator.clipboard.writeText(profile.referralCode);
    setCopied(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <HiUserGroup className="text-6xl mx-auto text-gray-300 mb-4" />
        <p className="text-xl mb-4">Please login to access referral program.</p>
      </div>
    );
  }

  if (loadingProfile) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tierColors = {
    bronze: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
    silver: "text-gray-400 bg-gray-100 dark:bg-gray-800",
    gold: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
  };

  const tierLimits = {
    bronze: { next: 5, label: "Silver", desc: "Refer 5 friends to reach Silver" },
    silver: { next: 15, label: "Gold", desc: "Refer 15 friends to reach Gold" },
    gold: { next: null, label: "Max", desc: "You're at the top tier!" },
  };

  const currentTier = profile?.referralTier || "bronze";
  const nextTier = tierLimits[currentTier];
  const totalRefs = profile?.totalReferrals || 0;

  const shareText = `🔥 Join Quick Shop using my referral code *${profile?.referralCode}* and get rewards! Sign up: https://quickshoppro.vercel.app/signup?ref=${profile?.referralCode}`;

  const shareUrl = `https://quickshoppro.vercel.app/signup?ref=${profile?.referralCode}`;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">🔗 Refer & Earn</h1>
      <p className="text-gray-500 mb-6">Invite friends, earn rewards when they shop!</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card text-center">
          <HiTrophy className={`mx-auto text-2xl ${currentTier === "gold" ? "text-yellow-500" : currentTier === "silver" ? "text-gray-400" : "text-orange-600"}`} />
          <p className="text-xl font-bold capitalize">{currentTier}</p>
          <p className="text-xs text-gray-500">Your Tier</p>
        </div>
        <div className="card text-center">
          <HiUserGroup className="mx-auto text-blue-500 text-2xl" />
          <p className="text-xl font-bold">{totalRefs}</p>
          <p className="text-xs text-gray-500">Referrals</p>
        </div>
        <div className="card text-center">
          <HiCurrencyRupee className="mx-auto text-green-500 text-2xl" />
          <p className="text-xl font-bold">₹{(profile?.referralEarnings || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500">Earned</p>
        </div>
        <div className="card text-center">
          <HiGift className="mx-auto text-purple-500 text-2xl" />
          <p className="text-xl font-bold">{(profile?.coinBalance || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500">Coins</p>
        </div>
      </div>

      {/* Tier Progress Bar */}
      {nextTier.next && (
        <div className="card mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Progress to {nextTier.label}</span>
            <span className="text-sm text-gray-500">{totalRefs} / {nextTier.next}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
            <div
              className="bg-primary-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((totalRefs / nextTier.next) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">{nextTier.desc}</p>
        </div>
      )}

      {/* Referral Code & Share */}
      <div className="card mb-6">
        <h3 className="font-bold text-lg mb-3">Your Referral Code</h3>
        <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 p-4 rounded-xl">
          <span className="text-2xl md:text-3xl font-mono font-bold tracking-widest flex-grow text-center">
            {profile?.referralCode || "------"}
          </span>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              copied
                ? "bg-green-500 text-white"
                : "btn-gradient"
            }`}
          >
            {copied ? "✅ Copied!" : <><HiClipboardCopy /> Copy</>}
          </button>
        </div>

        {/* Share Buttons */}
        <div className="mt-4">
          <p className="text-sm font-medium mb-3">Share via:</p>
          <div className="flex gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-center py-3 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
            >
              📱 WhatsApp
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-center py-3 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
            >
              ✈️ Telegram
            </a>
          </div>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: "Join Quick Shop", text: shareText, url: shareUrl });
              } else {
                handleCopy();
              }
            }}
            className="w-full mt-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-center py-3 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
          >
            <HiShare /> More Sharing Options
          </button>
        </div>
      </div>

      {/* How it Works */}
      <div className="card mb-6">
        <h3 className="font-bold text-lg mb-3">How It Works</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
            <p className="text-sm">Share your referral code with friends</p>
          </div>
          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
            <p className="text-sm">Friend signs up using your code</p>
          </div>
          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
            <p className="text-sm">Friend places & receives their first order</p>
          </div>
          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center text-sm font-bold flex-shrink-0">✓</span>
            <p className="text-sm font-medium text-green-600">You earn ₹20 + 50 coins reward!</p>
          </div>
        </div>
      </div>

      {/* Referral History */}
      <div>
        <h3 className="font-bold text-lg mb-4">Referral History</h3>
        {loadingRefs && (
          <div className="space-y-2">
            {[1,2].map(i => (
              <div key={i} className="animate-pulse card h-16"></div>
            ))}
          </div>
        )}
        {!loadingRefs && referrals.length === 0 && (
          <div className="text-center py-8">
            <HiUserGroup className="text-4xl mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No referrals yet</p>
            <p className="text-xs text-gray-400 mt-1">Share your code to start earning!</p>
          </div>
        )}
        {!loadingRefs && (
          <div className="space-y-2">
            {referrals.map(ref => (
              <div key={ref.id} className="card flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">Code: {ref.referralCode}</p>
                  <p className="text-xs text-gray-500">
                    {ref.createdAt?.toDate?.()
                      ? new Date(ref.createdAt.toDate()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : "Recent"}
                  </p>
                </div>
                <div className="text-right">
                  {ref.status === "completed" && (
                    <div>
                      <span className="text-green-600 font-bold text-sm">+₹{ref.rewardAmount}</span>
                      <br />
                      <span className="text-yellow-600 text-xs">+{ref.rewardCoins} coins</span>
                    </div>
                  )}
                  {ref.status === "pending" && (
                    <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs px-2 py-1 rounded-full">
                      Pending
                    </span>
                  )}
                  {ref.status === "rejected" && (
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-600 text-xs px-2 py-1 rounded-full">
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-2">The more you share, the more you earn!</p>
        <a href="/leaderboard" className="text-primary-600 text-sm font-medium hover:underline">
          View Leaderboard →
        </a>
      </div>
    </div>
  );
}
