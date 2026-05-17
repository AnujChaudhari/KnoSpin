"use client";
export const dynamic = 'force-dynamic';
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Logged in!");
      router.push("/");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="glassmorphism p-8 rounded-3xl w-full max-w-md space-y-6">
        <h2 className="text-3xl font-bold text-center">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 border rounded-xl dark:bg-gray-700" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 border rounded-xl dark:bg-gray-700" />
          <button type="submit" className="btn-gradient w-full py-3">Login</button>
        </form>
        <div className="text-center">
          <button onClick={googleLogin} className="flex items-center justify-center gap-2 w-full border p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">
            <FcGoogle className="w-5 h-5" /> Continue with Google
          </button>
        </div>
        <p className="text-center text-sm">
          Forgot password? <Link href="/forgot-password" className="text-primary-600">Reset</Link>
        </p>
        <p className="text-center text-sm">Don't have an account? <Link href="/signup" className="text-primary-600">Sign up</Link></p>
      </div>
    </div>
  );
}
