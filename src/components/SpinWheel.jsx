"use client";
import { useState } from "react";
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

  // Check if already spun today
  useState(() => {
    if (!user) return;
    const checkSpin = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const lastSpin = snap.data().lastSpinDate;
        const today = new Date().toDateString();
        if (lastSpin === today) setSpinUsed(true);
      }
    };
    checkSpin();
  }, [user]);

  const handleSpin = async () => {
    if (!user) return toast.error("Please login first");
    if (spinUsed) return toast.error("Already used today's spin! Come back tomorrow.");
    setSpinning(true);
    setResult(null);

    // Simulate spin
    setTimeout(async () => {
      const win = rewards[Math.floor(Math.random() * rewards.length)];
      setResult(win);
      setSpinning(false);
      setSpinUsed(true);

      // Save to user
      await updateDoc(doc(db, "users", user.uid), {
        coinBalance: increment(win),
        lastSpinDate: new Date().toDateString(),
      });

      await addDoc(collection(db, "wallet_transactions"), {
        userId: user.uid,
        type: "admin_bonus",
        amount: 0,
        coins: win,
        description: `Daily spin reward`,
        createdAt: serverTimestamp(),
      });

      toast.success(`You won ${win} coins! 🎉`);
    }, 3000);
  };

  return (
    <div className="card text-center max-w-sm mx-auto">
      <h3 className="font-bold text-lg mb-4">🎡 Daily Spin & Win</h3>
      <div className={`text-6xl mb-4 ${spinning ? 'animate-spin' : ''}`}>
        🎰
      </div>
      {result && (
        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl mb-4">
          <p className="text-2xl font-bold text-green-600">+{result} Coins!</p>
        </div>
      )}
      <button
        onClick={handleSpin}
        disabled={spinning || spinUsed}
        className={`btn-gradient w-full ${spinUsed ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {spinUsed ? "Come Back Tomorrow" : spinning ? "Spinning..." : "Spin Now!"}
      </button>
      <p className="text-xs text-gray-500 mt-2">1 free spin per day</p>
    </div>
  );
}
