"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(email, password, referralCode.trim() || null);
      toast.success("Account created! Please verify your email before login.");
      router.push("/login");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="glassmorphism p-8 rounded-3xl w-full max-w-md space-y-6">
        <h2 className="text-3xl font-bold text-center">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="input-field"
          />
          <div>
            <input
              type="text"
              placeholder="Referral Code (optional)"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              className="input-field"
              maxLength={10}
            />
            <p className="text-xs text-gray-400 mt-1">
              Have a referral code? Enter it to earn rewards!
            </p>
          </div>
          <button type="submit" className="btn-gradient w-full py-3">
            Sign Up
          </button>
        </form>
        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
