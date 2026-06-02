"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import Link from "next/link";

/* ────────── प्रीमियम SVG आइकॉन ────────── */
const SpinnerIcon = () => (
  <svg className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" viewBox="0 0 24 24" />
);

const CheckCircleIcon = () => (
  <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const GroupIcon = () => (
  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

export default function JoinGroupPage() {
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("invite");
  const router = useRouter();
  const { user } = useAuth();
  const [status, setStatus] = useState("loading"); // loading, notfound, already, joined, error

  useEffect(() => {
    if (!inviteCode) {
      setStatus("notfound");
      return;
    }

    const join = async () => {
      // लॉगिन ज़रूरी है
      if (!user) {
        toast.error("Please login to join group");
        router.push(`/login?redirect=${encodeURIComponent(window.location.href)}`);
        return;
      }

      try {
        // इनवाइट कोड से ग्रुप खोजें
        const groupQuery = query(collection(db, "groups"), where("inviteCode", "==", inviteCode));
        const snap = await getDocs(groupQuery);

        if (snap.empty) {
          setStatus("notfound");
          return;
        }

        const groupDoc = snap.docs[0];
        const groupId = groupDoc.id;
        const groupData = groupDoc.data();

        // पहले से मेंबर तो नहीं?
        const memQuery = query(collection(db, "groups", groupId, "members"), where("userId", "==", user.uid));
        const memSnap = await getDocs(memQuery);
        if (!memSnap.empty) {
          setStatus("already");
          return;
        }

        // ग्रुप में शामिल हों (सिर्फ़ लॉगिन पर्याप्त, कोई वेरिफिकेशन नहीं)
        await addDoc(collection(db, "groups", groupId, "members"), {
          userId: user.uid,
          role: "member",
          joinedAt: serverTimestamp(),
        });

        toast.success(`Welcome to "${groupData.name}"!`);
        setStatus("joined");
        router.push(`/community/groups/${groupId}`);
      } catch (err) {
        console.error("Join error:", err);
        setStatus("error");
        toast.error("Failed to join group. Please try again.");
      }
    };

    join();
  }, [inviteCode, user, router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      {/* लोडिंग */}
      {status === "loading" && (
        <div className="space-y-4">
          <SpinnerIcon />
          <p className="text-gray-500">Joining group...</p>
        </div>
      )}

      {/* इनवाइट अमान्य */}
      {status === "notfound" && (
        <div className="max-w-sm">
          <WarningIcon />
          <h2 className="text-2xl font-bold mb-2">Invalid Invite Link</h2>
          <p className="text-gray-500 mb-6">
            This invite link is not valid or has been removed. Please ask the group admin for a new link.
          </p>
          <Link href="/community/groups" className="btn-gradient inline-block">
            Browse Groups
          </Link>
        </div>
      )}

      {/* पहले से मेंबर */}
      {status === "already" && (
        <div className="max-w-sm">
          <CheckCircleIcon />
          <h2 className="text-2xl font-bold mb-2">Already a Member</h2>
          <p className="text-gray-500 mb-6">
            You are already part of this group. No need to join again!
          </p>
          <Link href="/dashboard/my-groups" className="btn-gradient inline-block">
            View My Groups
          </Link>
        </div>
      )}

      {/* सफलता (joined – क्षणिक, दिखता नहीं क्योंकि redirect हो जाता है) */}
      {status === "joined" && (
        <div className="max-w-sm">
          <CheckCircleIcon />
          <h2 className="text-2xl font-bold mb-2">Joined Successfully! 🎉</h2>
          <p className="text-gray-500">Redirecting to the group...</p>
        </div>
      )}

      {/* अनचाही एरर */}
      {status === "error" && (
        <div className="max-w-sm">
          <WarningIcon />
          <h2 className="text-2xl font-bold mb-2">Something Went Wrong</h2>
          <p className="text-gray-500 mb-6">
            We couldn't process your join request. Please try again later.
          </p>
          <Link href="/community/groups" className="btn-gradient inline-block">
            Back to Groups
          </Link>
        </div>
      )}
    </div>
  );
}
