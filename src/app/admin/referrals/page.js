"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, updateDoc, doc, addDoc, serverTimestamp, increment } from "firebase/firestore";
import { toast } from "react-hot-toast";

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [users, setUsers] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const refSnap = await getDocs(query(collection(db, "referrals"), orderBy("createdAt", "desc")));
    setReferrals(refSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    const userSnap = await getDocs(collection(db, "users"));
    const userMap = {};
    userSnap.docs.forEach(d => { userMap[d.id] = d.data(); });
    setUsers(userMap);
  };

  const approveReferral = async (ref) => {
    // Mark referral as completed
    await updateDoc(doc(db, "referrals", ref.id), {
      status: "completed",
      completedAt: serverTimestamp(),
    });

    // Reward referrer
    await addDoc(collection(db, "wallet_transactions"), {
      userId: ref.referrerId,
      type: "referral_reward",
      amount: ref.rewardAmount || 20,
      coins: ref.rewardCoins || 50,
      description: "Manual referral reward approval",
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "users", ref.referrerId), {
      walletBalance: increment(ref.rewardAmount || 20),
      coinBalance: increment(ref.rewardCoins || 50),
      totalReferrals: increment(1),
      referralEarnings: increment(ref.rewardAmount || 20),
    });

    toast.success("Referral approved & rewarded");
    fetchData();
  };

  const rejectReferral = async (ref) => {
    await updateDoc(doc(db, "referrals", ref.id), { status: "rejected" });
    toast.success("Referral rejected");
    fetchData();
  };

  return (
    <div className="p-4 md:p-0">
      <h2 className="text-2xl font-bold mb-6">Referral Management</h2>
      <div className="space-y-4">
        {referrals.map(ref => (
          <div key={ref.id} className="card">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <p><strong>Referrer:</strong> {users[ref.referrerId]?.email || ref.referrerId.slice(0,8)}</p>
                <p><strong>Referred:</strong> {users[ref.referredId]?.email || ref.referredId.slice(0,8)}</p>
                <p><strong>Code:</strong> {ref.referralCode}</p>
                <p><strong>Status:</strong> <span className={`font-bold ${ref.status === 'completed' ? 'text-green-600' : ref.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>{ref.status}</span></p>
              </div>
              {ref.status === "pending" && (
                <div className="flex gap-2 self-end">
                  <button onClick={() => approveReferral(ref)} className="bg-green-500 text-white px-4 py-2 rounded-lg">Approve & Reward</button>
                  <button onClick={() => rejectReferral(ref)} className="bg-red-500 text-white px-4 py-2 rounded-lg">Reject</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
