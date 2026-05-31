"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "react-hot-toast";

export default function DailyReward() {
  const { user } = useAuth();
  const [claimed, setClaimed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [reward, setReward] = useState(null);

  const claimDailyReward = useCallback(async (userId) => {
    if (!userId) return null;
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    const today = new Date().toDateString();

    // अगर आज पहले ही क्लेम कर चुके हैं
    if (data.lastDailyClaim === today) {
      setClaimed(true);
      return null;
    }

    // कितने लगातार दिन (streak) – अगर कल क्लेम किया था तो बढ़ाएँ, नहीं तो 1
    let streak = data.dailyStreak || 0;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (data.lastDailyClaim === yesterday) {
      streak += 1;
    } else {
      streak = 1;
    }

    // रिवॉर्ड कैलकुलेट करें: बेस 2 कॉइन + स्ट्रीक के हिसाब से (अधिकतम 20)
    const baseCoins = 2;
    const streakBonus = Math.min(streak * 2, 20);
    const totalCoins = baseCoins + streakBonus;
    const xpGain = 10; // रोज़ाना XP

    await updateDoc(userRef, {
      coinBalance: increment(totalCoins),
      xp: increment(xpGain),
      dailyStreak: streak,
      lastDailyClaim: today,
    });

    setClaimed(true);
    return { coins: totalCoins, xp: xpGain, streak };
  }, []);

  useEffect(() => {
    if (!user) {
      setClaimed(false);
      setShowPopup(false);
      setReward(null);
      return;
    }

    // पहले से क्लेम हो चुका है तो दोबारा मत करो
    if (claimed) return;

    const run = async () => {
      const res = await claimDailyReward(user.uid);
      if (res) {
        setReward(res);
        setShowPopup(true);
        toast.success(`🎁 Daily reward: +${res.coins} coins, +${res.xp} XP (Streak: ${res.streak})`);
        // 5 सेकंड बाद पॉपअप हटाएँ
        setTimeout(() => setShowPopup(false), 5000);
      }
    };

    run();
  }, [user, claimed, claimDailyReward]);

  if (!showPopup || !reward) return null;

  return (
    <div className="fixed bottom-20 right-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl z-50 border border-gray-200 dark:border-gray-700 animate-fade-in">
      <p className="font-bold text-lg">🎁 Daily Reward!</p>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        +{reward.coins} coins | +{reward.xp} XP
      </p>
      <p className="text-xs text-gray-500">Streak: {reward.streak} day{reward.streak > 1 ? 's' : ''}</p>
      <button
        onClick={() => setShowPopup(false)}
        className="text-xs text-primary-500 mt-2 hover:underline"
      >
        Close
      </button>
    </div>
  );
}
