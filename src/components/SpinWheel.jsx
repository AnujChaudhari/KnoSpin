"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp, increment } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { unlockAchievement } from "@/lib/gamification";

const rewards = [5, 10, 20, 50, 100, 5, 10, 20]; // possible coin rewards
const SEGMENT_COUNT = 8;
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;

// रंग पट्टिका – हर सेगमेंट के लिए आकर्षक रंग
const segmentColors = [
  "#FF6B6B", // लाल-नारंगी
  "#FECA57", // पीला
  "#48DBFB", // हल्का नीला
  "#FF9FF3", // गुलाबी
  "#54A0FF", // गहरा नीला
  "#5F27CD", // बैंगनी
  "#00D2D3", // फ़िरोज़ी
  "#1DD1A1", // हरा
];

// छोटा सा तीर (pointer)
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
  const [rotation, setRotation] = useState(0); // वर्तमान कोण
  const wheelRef = useRef(null);

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

    // रैंडम सेगमेंट चुनें
    const randomSegmentIndex = Math.floor(Math.random() * SEGMENT_COUNT);
    const win = rewards[randomSegmentIndex];

    // कम से कम 5 पूरे चक्कर (1800 डिग्री) + चुने हुए सेगमेंट तक पहुँचने के लिए अतिरिक्त कोण
    const fullSpins = 5 * 360;
    const targetAngle = fullSpins + (SEGMENT_ANGLE * (SEGMENT_COUNT - randomSegmentIndex)) + Math.random() * SEGMENT_ANGLE;
    const newRotation = rotation + targetAngle;

    setRotation(newRotation);

    // स्पिन समाप्त होने पर डेटा अपडेट करें (एनीमेशन के बाद)
    setTimeout(async () => {
      setSpinning(false);
      setResult(win);
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
    }, 5000); // एनीमेशन की अवधि (5 सेकंड)
  };

  // conic-gradient स्ट्रिंग बनाएं – हर सेगमेंट को रंग और टेक्स्ट देना है
  const gradientParts = segmentColors.map((color, index) => {
    const start = index * SEGMENT_ANGLE;
    const end = (index + 1) * SEGMENT_ANGLE;
    return `${color} ${start}deg ${end}deg`;
  });
  const conicGradient = `conic-gradient(${gradientParts.join(", ")})`;

  return (
    <div className="card text-center max-w-sm mx-auto">
      <h3 className="font-bold text-lg mb-4">🎡 Daily Spin & Win</h3>

      {/* User stats */}
      <div className="flex justify-center items-center gap-4 mb-6 flex-wrap">
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

      {/* स्पिनर कंटेनर */}
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
          {/* सेगमेंट लेबल – हर सेगमेंट के बीच में इनाम की राशि */}
          {rewards.map((reward, index) => {
            const angle = (index * SEGMENT_ANGLE) + (SEGMENT_ANGLE / 2);
            const radian = (angle * Math.PI) / 180;
            const x = 50 + 35 * Math.cos(radian);
            const y = 50 + 35 * Math.sin(radian);
            return (
              <span
                key={index}
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
        {/* बीच का गोल बटन (वैकल्पिक) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-gray-700 rounded-full shadow-inner"></div>
      </div>

      {/* परिणाम संदेश */}
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
