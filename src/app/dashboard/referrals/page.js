"use client";
export const dynamic = 'force-dynamic';

import { useAuth } from "@/context/AuthContext";

export default function ReferralDashboard() {
  const auth = useAuth();
  const user = auth?.user;

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-xl mb-4">Please login to view your referrals.</p>
        <a href="/login" className="btn-gradient inline-block">Login</a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Referral Program</h1>
      <p>Your referral dashboard will appear here.</p>
    </div>
  );
}
