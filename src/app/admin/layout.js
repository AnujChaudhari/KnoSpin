"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/login");
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !user || !isAdmin) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 ml-0 md:ml-64 overflow-x-hidden">{children}</main>
    </div>
  );
}