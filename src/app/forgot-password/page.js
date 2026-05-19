"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(email);
      toast.success("Password reset email sent!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="glassmorphism p-8 rounded-3xl w-full max-w-md space-y-6">
        <h2 className="text-3xl font-bold text-center">Reset Password</h2>
        <form onSubmit={handleReset} className="space-y-4">
          <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" />
          <button type="submit" className="btn-gradient w-full py-3">Send Reset Link</button>
        </form>
      </div>
    </div>
  );
}
