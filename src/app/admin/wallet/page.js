"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, updateDoc, doc, increment } from "firebase/firestore";
import { toast } from "react-hot-toast";

export default function AdminWalletPage() {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState(0);
  const [coins, setCoins] = useState(0);
  const [description, setDescription] = useState("");

  const handleAddBonus = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email required");

    // Find user by email
    const usersSnap = await getDocs(query(collection(db, "users"), where("email", "==", email)));
    if (usersSnap.empty) return toast.error("User not found");

    const userId = usersSnap.docs[0].id;

    if (amount > 0) {
      await updateDoc(doc(db, "users", userId), { walletBalance: increment(amount) });
      await addDoc(collection(db, "wallet_transactions"), {
        userId,
        type: "admin_bonus",
        amount,
        coins: 0,
        description: description || "Admin bonus",
        createdAt: serverTimestamp(),
      });
    }

    if (coins > 0) {
      await updateDoc(doc(db, "users", userId), { coinBalance: increment(coins) });
      await addDoc(collection(db, "wallet_transactions"), {
        userId,
        type: "admin_bonus",
        amount: 0,
        coins,
        description: description || "Admin bonus coins",
        createdAt: serverTimestamp(),
      });
    }

    toast.success(`Added ₹${amount} and ${coins} coins to ${email}`);
    setEmail("");
    setAmount(0);
    setCoins(0);
    setDescription("");
  };

  return (
    <div className="p-4 md:p-0">
      <h2 className="text-2xl font-bold mb-6">Wallet & Coin Management</h2>
      <form onSubmit={handleAddBonus} className="card space-y-4 max-w-xl">
        <input
          type="email"
          placeholder="User Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="input-field"
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Amount (₹)</label>
            <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="input-field" />
          </div>
          <div>
            <label className="text-sm">Coins</label>
            <input type="number" value={coins} onChange={e => setCoins(Number(e.target.value))} className="input-field" />
          </div>
        </div>
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="input-field"
        />
        <button type="submit" className="btn-gradient w-full">Add Bonus</button>
      </form>
    </div>
  );
}
