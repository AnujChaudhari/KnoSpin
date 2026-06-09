"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import Link from "next/link";

/* ────── प्रीमियम SVG आइकॉन ────── */
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
const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
);
const YouTubeEmbed = ({ videoId }) => (
  <div className="aspect-video rounded-xl overflow-hidden shadow bg-black mt-3">
    <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`} title="YouTube video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
  </div>
);

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.groupId;
  const { user } = useAuth();
  const router = useRouter();

  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberCount, setMemberCount] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  // ✅ डेटा फ़ेच को useCallback में लपेटें ताकि हर बार ताज़ा डेटा मिले
  const fetchData = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const groupSnap = await getDoc(doc(db, "groups", groupId));
      if (!groupSnap.exists()) {
        toast.error("Group not found");
        router.push("/community/groups");
        return;
      }
      setGroup({ id: groupSnap.id, ...groupSnap.data() });

      const membersSnap = await getDocs(collection(db, "groups", groupId, "members"));
      setMemberCount(membersSnap.size);
      if (user) {
        setIsMember(membersSnap.docs.some(d => d.data().userId === user.uid));
      } else {
        setIsMember(false);
      }

      const postsSnap = await getDocs(collection(db, "posts"));
      const allPosts = postsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const groupPosts = allPosts.filter(p => p.groupId === groupId && !p.isDeleted);
      groupPosts.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setPosts(groupPosts);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load group");
    }
    setLoading(false);
  }, [groupId, user, router]);

  // पहली बार लोड और जब भी यूज़र बदले, डेटा लाएँ
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleJoin = async () => {
    if (!user) { toast.error("Please login"); return; }
    try {
      await addDoc(collection(db, "groups", groupId, "members"), {
        userId: user.uid,
        role: "member",
        joinedAt: serverTimestamp(),
      });
      setIsMember(true);
      setMemberCount(prev => prev + 1);
      toast.success("Joined group! 🎉");
    } catch (err) { toast.error("Failed to join"); }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`https://quickshoppro.vercel.app/community/groups/join?invite=${group.inviteCode}`);
    toast.success("Invite link copied!");
  };

  if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (!group) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Group Header Card – Pure Black Theme */}
      <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary-600/20 flex items-center justify-center text-primary-400 flex-shrink-0">
            <GroupIcon />
          </div>
          <div className="flex-grow min-w-0">
            <h1 className="text-2xl font-bold text-white">{group.name}</h1>
            {group.description && <p className="text-gray-400 text-sm mt-1">{group.description}</p>}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MembersIcon /> {memberCount} members</span>
              <span>{group.privacy === 'private' ? 'Private' : 'Public'}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {!isMember && (
              <button onClick={handleJoin} className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2 px-4 rounded-xl transition">Join Group</button>
            )}
            {isMember && (
              <>
                <button onClick={() => setShowInvite(!showInvite)} className="p-2 bg-gray-800 rounded-lg" title="Invite"><ShareIcon /></button>
                <Link href={`/community/groups/${groupId}/post/create`} className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2 px-4 rounded-xl flex items-center gap-1 transition"><PlusIcon /> Post</Link>
              </>
            )}
          </div>
        </div>
        {showInvite && (
          <div className="mt-4 p-3 bg-gray-800 rounded-xl flex items-center justify-between">
            <code className="text-sm text-gray-300">{`https://quickshoppro.vercel.app/community/groups/join?invite=${group.inviteCode}`}</code>
            <button onClick={copyInviteLink} className="bg-primary-600 text-white text-xs font-semibold py-1.5 px-3 rounded-lg ml-2 flex items-center gap-1"><CopyIcon /> Copy</button>
          </div>
        )}
      </div>

      {/* Posts Feed */}
      {posts.length === 0 && <p className="text-center text-gray-500 py-12">No posts yet. Be the first to share!</p>}
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="font-medium text-white">{post.authorName}</span>
                <span className="text-xs text-gray-500 ml-2">{new Date(post.createdAt?.toDate()).toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => {
                  if (navigator.share) navigator.share({ title: 'Check this post', url: `${window.location.origin}/community/groups/${groupId}?post=${post.id}` });
                  else { navigator.clipboard.writeText(`${window.location.origin}/community/groups/${groupId}?post=${post.id}`); toast.success("Link copied!"); }
                }} className="text-gray-500 hover:text-primary-400"><ShareIcon /></button>
                {user && (user.uid === post.authorId || user.isAdmin) && (
                  <button onClick={async () => {
                    if (confirm("Delete post?")) { await updateDoc(doc(db, "posts", post.id), { isDeleted: true }); setPosts(posts.filter(p => p.id !== post.id)); toast.success("Deleted"); }
                  }} className="text-gray-500 hover:text-red-400"><TrashIcon /></button>
                )}
              </div>
            </div>
            <div className="prose dark:prose-invert max-w-none text-sm text-gray-300" dangerouslySetInnerHTML={{ __html: post.text }} />
            {post.imageUrl && <img src={post.imageUrl} alt="Post attachment" className="mt-3 rounded-xl max-h-96 object-contain w-full" />}
            {post.videoId && <YouTubeEmbed videoId={post.videoId} />}
          </div>
        ))}
      </div>
    </div>
  );
}
