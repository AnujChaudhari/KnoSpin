"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import Link from "next/link";

const GroupIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const MembersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M20 8v6" /><path d="M23 11h-6" />
  </svg>
);
const ShareIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.59 13.51l6.83 3.98" /><path d="M15.41 6.51l-6.82 3.98" />
  </svg>
);
const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
);

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.groupId;
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [memberCount, setMemberCount] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;
    const fetchData = async () => {
      const groupSnap = await getDoc(doc(db, "groups", groupId));
      if (!groupSnap.exists()) { toast.error("Group not found"); return; }
      setGroup({ id: groupSnap.id, ...groupSnap.data() });
      const membersSnap = await getDocs(collection(db, "groups", groupId, "members"));
      setMemberCount(membersSnap.size);
      if (user) setIsMember(membersSnap.docs.some(d => d.data().userId === user.uid));
      setLoading(false);
    };
    fetchData();
  }, [groupId, user]);

  const handleJoin = async () => {
    if (!user) return toast.error("Please login");
    await addDoc(collection(db, "groups", groupId, "members"), { userId: user.uid, role: "member", joinedAt: serverTimestamp() });
    setIsMember(true); setMemberCount(prev => prev + 1); toast.success("Joined!");
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`https://quickshoppro.vercel.app/community/groups/join?invite=${group.inviteCode}`);
    toast.success("Invite link copied!");
  };

  if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (!group) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="card mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 flex-shrink-0"><GroupIcon /></div>
          <div className="flex-grow">
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <p className="text-gray-500">{group.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MembersIcon /> {memberCount} members</span>
              <span>{group.privacy === 'private' ? 'Private' : 'Public'}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {!isMember && <button onClick={handleJoin} className="btn-gradient text-sm">Join Group</button>}
            {isMember && <>
              <button onClick={() => setShowInvite(!showInvite)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg" title="Invite"><ShareIcon /></button>
              <Link href={`/community/groups/${groupId}/post/create`} className="btn-gradient text-sm flex items-center gap-1"><PlusIcon /> Post</Link>
            </>}
          </div>
        </div>
        {showInvite && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-between">
            <code className="text-sm">{`https://quickshoppro.vercel.app/community/groups/join?invite=${group.inviteCode}`}</code>
            <button onClick={copyInviteLink} className="btn-gradient text-xs ml-2 flex items-center gap-1"><CopyIcon /> Copy</button>
          </div>
        )}
      </div>
      {/* कोई पोस्ट सेक्शन नहीं */}
    </div>
  );
}
