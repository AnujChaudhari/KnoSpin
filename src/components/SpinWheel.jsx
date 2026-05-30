"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp, increment } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

const rewards = [5, 10, 20, 50, 100, 5, 10, 20]; // coins

export default function SpinWheel() {
  const { user } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [spinUsed, setSpinUsed] = useState(false);
  const [userLevel, setUserLevel] = useState(1);
  const [userXp, setUserXp] = useState(0);
  const [userCoins, setUserCoins] = useState(0);

  // Fetch user's current level, XP, and coins on mount
  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setUserLevel(data.level || 1);
        setUserXp(data.xp || 0);
        setUserCoins(data.coinBalance || 0);
        const lastSpin = data.lastSpinDate;
        const today = new Date().toDateString();
        if (lastSpin === today) setSpinUsed(true);
      }
    };
    fetchUserData();
  }, [user]);

  const handleSpin = async () => {
    if (!user) return toast.error("Please login first");
    if (spinUsed) return toast.error("Already used today's spin! Come back tomorrow.");
    setSpinning(true);
    setResult(null);

    // Simulate spinning delay
    setTimeout(async () => {
      const win = rewards[Math.floor(Math.random() * rewards.length)];
      setResult(win);
      setSpinning(false);
      setSpinUsed(true);

      // Update user document: coins, XP, last spin date
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        coinBalance: increment(win),
        xp: increment(5),          // ✅ 5 XP per spin
        lastSpinDate: new Date().toDateString(),
      });

      // Recalculate level based on new XP
      const updatedSnap = await getDoc(userRef);
      if (updatedSnap.exists()) {
        const data = updatedSnap.data();
        const newXp = data.xp || 0;
        const newLevel = Math.floor(Math.sqrt(newXp / 100));
        if (newLevel > (data.level || 1)) {
          await updateDoc(userRef, { level: newLevel });
          toast.success(`🎉 Level Up! You are now Level ${newLevel}!`);
        }
        setUserLevel(newLevel);
        setUserXp(newXp);
        setUserCoins(data.coinBalance || 0);
      }

      // Record transaction
      await addDoc(collection(db, "wallet_transactions"), {
        userId: user.uid,
        type: "admin_bonus",
        amount: 0,
        coins: win,
        description: "Daily spin reward",
        createdAt: serverTimestamp(),
      });

      toast.success(`You won ${win} coins! 🎉`);
    }, 3000);
  };

  return (
    <div className="card text-center max-w-sm mx-auto">
      <h3 className="font-bold text-lg mb-4">🎡 Daily Spin & Win</h3>

      {/* Level & XP Display */}
      <div className="flex justify-center items-center gap-4 mb-4">
        <div className="bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full text-sm font-bold text-purple-700 dark:text-purple-300">
          Lv. {userLevel}
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full text-sm font-bold text-blue-700 dark:text-blue-300">
          {userXp} XP
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full text-sm font-bold text-yellow-700 dark:text-yellow-300">
          🪙 {userCoins}
        </div>
      </div>

      <div className={`text-6xl mb-4 ${spinning ? 'animate-spin' : ''}`}>
        🎰
      </div>

      {result && (
        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl mb-4">
          <p className="text-2xl font-bold text-green-600">+{result} Coins!</p>
          <p className="text-xs text-green-700 mt-1">+5 XP</p>
        </div>
      )}

      <button
        onClick={handleSpin}
        disabled={spinning || spinUsed}
        className={`btn-gradient w-full ${spinUsed ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {spinUsed ? "Come Back Tomorrow" : spinning ? "Spinning..." : "Spin Now!"}
      </button>
      <p className="text-xs text-gray-500 mt-2">1 free spin per day • Earn 5 XP & coins!</p>
    </div>
  );
}
