"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

// 🛡️ अस्थायी एडमिन ईमेल लिस्ट – बाद में हटाएँ
const ADMIN_EMAILS = ["kc812213@gmail.com"];  // <-- अपना असली ईमेल डालें

export default function AdminClientLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // एडमिन है या नहीं, इसकी जाँच – अब Firestore की बजाय ईमेल से
  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/login");
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Access Denied. Redirecting...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 ml-0 md:ml-64 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
