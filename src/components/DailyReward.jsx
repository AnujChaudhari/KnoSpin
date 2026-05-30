"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { claimDailyReward } from "@/lib/gamification";
import { toast } from "react-hot-toast";

export default function DailyReward() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const res = await claimDailyReward(user.uid);
      if (res) {
        setShow(true);
        toast.success(`Daily bonus: +${res.coins} coins! Streak: ${res.streak} days`);
      }
    };
    check();
  }, [user]);

  if (!show) return null;
  return (
    <div className="fixed bottom-20 right-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl z-50">
      <p className="font-bold">🎁 Daily Reward Claimed!</p>
      <button onClick={() => setShow(false)} className="text-xs text-gray-500 mt-2">Close</button>
    </div>
  );
}
