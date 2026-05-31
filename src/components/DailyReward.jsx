"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { claimDailyReward } from "@/lib/gamification";
import { toast } from "react-hot-toast";
import { HiX, HiGift, HiLightningBolt } from "react-icons/hi";

export default function DailyReward() {
  const { user } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [rewardData, setRewardData] = useState(null);

  useEffect(() => {
    if (!user) return;

    const claim = async () => {
      try {
        const res = await claimDailyReward(user.uid);
        if (res) {
          setRewardData(res);
          setShowPopup(true);
          toast.success(
            `🎁 Daily Bonus: +${res.coins} Coins | Streak: ${res.streak} day${res.streak > 1 ? 's' : ''}`,
            { duration: 5000 }
          );
        }
      } catch (error) {
        console.error("Daily reward claim failed:", error);
      }
    };

    claim();
  }, [user]);

  if (!showPopup || !rewardData) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50 animate-slide-up">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-5 w-72">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <HiGift className="text-yellow-600 text-xl" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Daily Reward!</h4>
              <p className="text-xs text-gray-500">Come back tomorrow for more</p>
            </div>
          </div>
          <button
            onClick={() => setShowPopup(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-3 mb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <HiLightningBolt className="text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-600">+{rewardData.coins}</span>
            </div>
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
              🔥 {rewardData.streak} Day Streak!
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowPopup(false)}
          className="w-full btn-gradient text-sm py-2"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}
