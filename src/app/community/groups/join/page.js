"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

export default function JoinGroupPage() {
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("invite");
  const router = useRouter();
  const { user } = useAuth();
  const [status, setStatus] = useState("loading"); // loading, notfound, already, joined, error

  useEffect(() => {
    if (!inviteCode) { setStatus("notfound"); return; }
    const join = async () => {
      if (!user) { toast.error("Please login to join"); router.push(`/login?redirect=${encodeURIComponent(window.location.href)}`); return; }
      if (!user.studentVerified) { toast.error("Only verified students can join"); setStatus("error"); return; }

      const groupQuery = query(collection(db, "groups"), where("inviteCode", "==", inviteCode));
      const snap = await getDocs(groupQuery);
      if (snap.empty) { setStatus("notfound"); return; }
      const groupDoc = snap.docs[0];
      const groupId = groupDoc.id;

      // Check already member
      const memQuery = query(collection(db, "groups", groupId, "members"), where("userId", "==", user.uid));
      const memSnap = await getDocs(memQuery);
      if (!memSnap.empty) { setStatus("already"); return; }

      await addDoc(collection(db, "groups", groupId, "members"), {
        userId: user.uid,
        role: "member",
        joinedAt: serverTimestamp(),
      });
      setStatus("joined");
      router.push(`/community/groups/${groupId}`);
    };
    join();
  }, [inviteCode, user]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      {status === "loading" && <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />}
      {status === "notfound" && <><h2 className="text-2xl font-bold">Invalid Invite</h2><p className="text-gray-500">This invite link is not valid.</p></>}
      {status === "already" && <><h2 className="text-2xl font-bold">Already a Member</h2><p className="text-gray-500">You are already part of this group.</p></>}
      {status === "error" && <><h2 className="text-2xl font-bold">Access Denied</h2><p className="text-gray-500">Only verified students can join community groups.</p></>}
    </div>
  );
}
