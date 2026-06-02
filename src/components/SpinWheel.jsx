"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp, increment } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { unlockAchievement } from "@/lib/gamification";

const rewards = [5, 10, 20, 50, 100, 5, 10, 20];

// 🎡 प्रोफेशनल इनलाइन SVG व्हील आइकन
const WheelIcon = ({ spinning }) => (
  <svg
    viewBox="0 0 100 100"
    className={`w-20 h-20 transition-transform duration-300 ${spinning ? "animate-spin" : ""}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="4"
  >
    {/* बाहरी रिंग */}
    <circle cx="50" cy="50" r="42" strokeWidth="8" />
    {/* अंदरूनी तीलियाँ (स्पोक्स) */}
    <line x1="50" y1="8" x2="50" y2="92" />
    <line x1="8" y1="50" x2="92" y2="50" />
    <line x1="20" y1="20" x2="80" y2="80" />
    <line x1="80" y1="20" x2="20" y2="80" />
    {/* बीच का गोला */}
    <circle cx="50" cy="50" r="10" fill="currentColor" />
  </svg>
);

export default function SpinWheel() {
  const { user } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [spinUsed, setSpinUsed] = useState(false);
  const [userLevel, setUserLevel] = useState(1);
  const [userXp, setUserXp] = useState(0);
  const [userCoins, setUserCoins] = useState(0);
  const [totalSpins, setTotalSpins] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setUserLevel(data.level || 1);
        setUserXp(data.xp || 0);
        setUserCoins(data.coinBalance || 0);
        setTotalSpins(data.totalSpins || 0);
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

    setTimeout(async () => {
      const win = rewards[Math.floor(Math.random() * rewards.length)];
      setResult(win);
      setSpinning(false);
      setSpinUsed(true);

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        coinBalance: increment(win),
        xp: increment(5),
        lastSpinDate: new Date().toDateString(),
        totalSpins: increment(1),
      });

      const updatedSnap = await getDoc(userRef);
      if (updatedSnap.exists()) {
        const data = updatedSnap.data();
        const newXp = data.xp || 0;
        const newLevel = Math.floor(Math.sqrt(newXp / 100));
        if (newLevel > (data.level || 1)) {
          await updateDoc(userRef, { level: newLevel });
          toast.success(`🎉 Level Up! You are now Level ${newLevel}!`);
        }
        const newTotalSpins = data.totalSpins || 0;
        setTotalSpins(newTotalSpins);
        setUserLevel(newLevel);
        setUserXp(newXp);
        setUserCoins(data.coinBalance || 0);

        if (newTotalSpins >= 10) {
          await unlockAchievement(user.uid, "spin_master");
        }
      }

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

      <div className="flex justify-center items-center gap-4 mb-4 flex-wrap">
        <div className="bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full text-sm font-bold text-purple-700 dark:text-purple-300">
          Lv. {userLevel}
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full text-sm font-bold text-blue-700 dark:text-blue-300">
          {userXp} XP
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full text-sm font-bold text-yellow-700 dark:text-yellow-300">
          🪙 {userCoins}
        </div>
        <div className="bg-pink-100 dark:bg-pink-900/30 px-3 py-1 rounded-full text-sm font-bold text-pink-700 dark:text-pink-300">
          🔄 {totalSpins}
        </div>
      </div>

      {/* प्रोफेशनल SVG व्हील आइकन */}
      <div className="mb-4 flex justify-center">
        <WheelIcon spinning={spinning} />
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
