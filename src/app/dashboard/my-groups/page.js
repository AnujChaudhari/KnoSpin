"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import Link from "next/link";

/* ────── Premium SVG Icons ────── */
const GroupIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M5 12h14m-7-7l7 7-7 7" />
  </svg>
);

export default function MyGroupsPage() {
  const { user } = useAuth();
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchMyGroups = async () => {
      try {
        // Fetch groups where user is a member (via subcollection query; firestore limitations – we'll fetch all groups and check membership locally for small data)
        const allGroupsSnap = await getDocs(collection(db, "groups"));
        const allGroups = allGroupsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const userGroups = [];

        for (const group of allGroups) {
          const memSnap = await getDocs(query(collection(db, "groups", group.id, "members"), where("userId", "==", user.uid)));
          if (!memSnap.empty) {
            userGroups.push({ ...group, role: memSnap.docs[0].data().role });
          }
        }
        setMyGroups(userGroups);
      } catch (err) {
        console.error("Failed to load my groups", err);
      }
      setLoading(false);
    };
    fetchMyGroups();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-xl mb-4">Please login to view your groups.</p>
        <Link href="/login" className="btn-gradient inline-block">Login</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Groups 👥</h1>
        {user?.studentVerified && (
          <Link href="/community/groups/create" className="btn-gradient flex items-center gap-2 text-sm">
            <PlusIcon /> Create Group
          </Link>
        )}
      </div>

      {myGroups.length === 0 && (
        <div className="text-center py-20">
          <GroupIcon />
          <p className="text-gray-500 mt-4">You haven't joined any group yet.</p>
          <Link href="/community/groups" className="btn-gradient mt-4 inline-block">Browse Groups</Link>
        </div>
      )}

      <div className="space-y-3">
        {myGroups.map(group => (
          <Link
            key={group.id}
            href={`/community/groups/${group.id}`}
            className="card flex items-center gap-4 hover:shadow-md transition group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 flex-shrink-0">
              <GroupIcon />
            </div>
            <div className="flex-grow">
              <h3 className="font-bold">{group.name}</h3>
              <p className="text-xs text-gray-500">{group.role === 'admin' ? 'Admin' : 'Member'} · {group.privacy}</p>
            </div>
            <ArrowRightIcon />
          </Link>
        ))}
      </div>
    </div>
  );
}
