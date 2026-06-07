"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

const rewards = [5, 10, 20, 50, 100, 5, 10, 20];
const SEGMENT_COUNT = 8;
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;
const SEGMENT_COLORS = [
  "#FF6B6B", "#FECA57", "#48DBFB", "#FF9FF3",
  "#54A0FF", "#5F27CD", "#00D2D3", "#1DD1A1",
];

const Pointer = () => (
  <svg className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10" width="20" height="20" viewBox="0 0 20 20">
    <polygon points="10,0 0,15 20,15" fill="#333" />
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
  const [rotation, setRotation] = useState(0);
  const [subscriptionTier, setSubscriptionTier] = useState("free");
  const wheelRef = useRef(null);

  const refreshUserData = async () => {
    if (!user) return;
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      const data = snap.data();
      setUserLevel(data.level || 1);
      setUserXp(data.xp || 0);
      setUserCoins(data.coinBalance || 0);
      setTotalSpins(data.totalSpins || 0);
      setSubscriptionTier(data.subscriptionTier || "free");

      const lastSpin = data.lastSpinAt?.toDate?.();
      if (lastSpin) {
        const cooldownEnd = new Date(lastSpin.getTime() + 24 * 60 * 60 * 1000);
        setSpinUsed(new Date() < cooldownEnd);
      } else {
        setSpinUsed(false);
      }
    }
  };

  useEffect(() => {
    if (!user) return;
    refreshUserData();
  }, [user]);

  const handleSpin = async () => {
    if (!user) return toast.error("Please login first");
    if (spinUsed) return toast.error("Already used today's spin! Come back tomorrow.");
    setSpinning(true);
    setResult(null);

    // ✅ Firestore rules allow these fields only
    const win = Math.floor(Math.random() * 100) + 1;

    // Animate wheel
    const randomIndex = Math.floor(Math.random() * SEGMENT_COUNT);
    const fullSpins = 5 * 360;
    const targetAngle = fullSpins + (SEGMENT_ANGLE * (SEGMENT_COUNT - randomIndex)) + Math.random() * SEGMENT_ANGLE;
    setRotation(prev => prev + targetAngle);

    setTimeout(async () => {
      try {
        // सीधे Firestore अपडेट करें (API की जरूरत नहीं)
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          coinBalance: increment(win),
          lastSpinAt: serverTimestamp(),
          totalSpins: increment(1),
          xp: increment(5),
        });

        // ताज़ा डेटा फ़ेच करें
        await refreshUserData();

        setSpinning(false);
        setResult(win);
        toast.success(`You won ${win} coins! 🎉`);
      } catch (err) {
        console.error(err);
        toast.error("Failed to update coins. Please try again.");
        setSpinning(false);
      }
    }, 5000);
  };

  if (!user || subscriptionTier !== "free") return null;

  const gradientParts = SEGMENT_COLORS.map((color, i) => {
    const start = i * SEGMENT_ANGLE;
    const end = (i + 1) * SEGMENT_ANGLE;
    return `${color} ${start}deg ${end}deg`;
  });
  const conicGradient = `conic-gradient(${gradientParts.join(", ")})`;

  return (
    <div className="card text-center max-w-sm mx-auto">
      <h3 className="font-bold text-lg mb-4">🎡 Daily Spin & Win</h3>

      <div className="flex justify-center items-center gap-4 mb-6 flex-wrap">
        <div className="bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full text-sm font-bold text-purple-700 dark:text-purple-300">Lv. {userLevel}</div>
        <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full text-sm font-bold text-blue-700 dark:text-blue-300">{userXp} XP</div>
        <div className="bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full text-sm font-bold text-yellow-700 dark:text-yellow-300">🪙 {userCoins}</div>
        <div className="bg-pink-100 dark:bg-pink-900/30 px-3 py-1 rounded-full text-sm font-bold text-pink-700 dark:text-pink-300">🔄 {totalSpins}</div>
      </div>

      <div className="relative w-60 h-60 mx-auto mb-4">
        <Pointer />
        <div
          ref={wheelRef}
          className="w-full h-full rounded-full border-4 border-white dark:border-gray-600 shadow-2xl"
          style={{
            background: conicGradient,
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? "transform 5s cubic-bezier(0.15, 0.6, 0.3, 1)" : "none",
          }}
        >
          {rewards.map((reward, i) => {
            const angle = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
            const radian = (angle * Math.PI) / 180;
            const x = 50 + 35 * Math.cos(radian);
            const y = 50 + 35 * Math.sin(radian);
            return (
              <span
                key={i}
                className="absolute text-white font-bold text-xs drop-shadow-lg"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                }}
              >
                {reward}
              </span>
            );
          })}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-gray-700 rounded-full shadow-inner" />
      </div>

      {result && (
        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl mb-4 animate-fade-in">
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
