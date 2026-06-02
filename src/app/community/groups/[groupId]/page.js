"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, where, orderBy, addDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { HiPlus, HiShare, HiClipboardCopy, HiTrash, HiPhotograph } from "react-icons/hi";

/* ────── Premium SVG Icons ────── */
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

  useEffect(() => {
    if (!groupId) return;

    const fetchData = async () => {
      try {
        const groupSnap = await getDoc(doc(db, "groups", groupId));
        if (!groupSnap.exists()) { toast.error("Group not found"); router.push("/community/groups"); return; }
        setGroup({ id: groupSnap.id, ...groupSnap.data() });

        // Members count (client-side, but may be many; limit read? For small groups it's fine)
        const membersSnap = await getDocs(collection(db, "groups", groupId, "members"));
        setMemberCount(membersSnap.size);
        if (user) {
          const already = membersSnap.docs.some(d => d.data().userId === user.uid);
          setIsMember(already);
        }

        // Posts (client‑side sort, no index)
        const postsSnap = await getDocs(collection(db, "posts"));
        const allPosts = postsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const groupPosts = allPosts.filter(p => p.groupId === groupId && !p.isDeleted);
        groupPosts.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setPosts(groupPosts);
      } catch (err) { console.error(err); toast.error("Failed to load group"); }
      setLoading(false);
    };
    fetchData();
  }, [groupId, user]);

  const handleJoin = async () => {
    if (!user) { toast.error("Please login"); return; }
    if (!user.studentVerified) { toast.error("Only verified students can join"); return; }
    try {
      await addDoc(collection(db, "groups", groupId, "members"), {
        userId: user.uid,
        role: "member",
        joinedAt: serverTimestamp(),
      });
      setIsMember(true);
      setMemberCount(prev => prev + 1);
      toast.success("Joined group!");
    } catch (err) { toast.error("Failed to join"); }
  };

  const copyInviteLink = () => {
    const link = `https://quickshoppro.vercel.app/community/groups/join?invite=${group.inviteCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied!");
  };

  if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (!group) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Group Header */}
      <div className="card mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 flex-shrink-0">
            <GroupIcon />
          </div>
          <div className="flex-grow">
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <p className="text-gray-500">{group.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MembersIcon /> {memberCount} members</span>
              <span>{group.privacy === 'private' ? 'Private' : 'Public'}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {!isMember && (
              <button onClick={handleJoin} className="btn-gradient text-sm">Join Group</button>
            )}
            {isMember && (
              <>
                <button onClick={() => setShowInvite(!showInvite)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg" title="Invite">
                  <ShareIcon />
                </button>
                <Link href={`/community/groups/${groupId}/post/create`} className="btn-gradient text-sm flex items-center gap-1">
                  <HiPlus /> Post
                </Link>
              </>
            )}
          </div>
        </div>
        {showInvite && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-between">
            <code className="text-sm">{`https://quickshoppro.vercel.app/community/groups/join?invite=${group.inviteCode}`}</code>
            <button onClick={copyInviteLink} className="btn-gradient text-xs ml-2">Copy</button>
          </div>
        )}
      </div>

      {/* Post Feed */}
      {posts.length === 0 && <p className="text-center text-gray-500 py-12">No posts yet. Be the first to share!</p>}
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="font-medium">{post.authorName}</span>
                <span className="text-xs text-gray-400 ml-2">{new Date(post.createdAt?.toDate()).toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: 'Check this post', url: `${window.location.origin}/community/groups/${groupId}?post=${post.id}` });
                  } else {
                    navigator.clipboard.writeText(`${window.location.origin}/community/groups/${groupId}?post=${post.id}`);
                    toast.success("Post link copied!");
                  }
                }} className="text-gray-400 hover:text-primary-600"><ShareIcon /></button>
                {user && (user.uid === post.authorId || user.isAdmin) && (
                  <button onClick={async () => {
                    if (confirm("Delete post?")) {
                      await updateDoc(doc(db, "posts", post.id), { isDeleted: true });
                      setPosts(posts.filter(p => p.id !== post.id));
                      toast.success("Post deleted");
                    }
                  }} className="text-gray-400 hover:text-red-500"><HiTrash /></button>
                )}
              </div>
            </div>
            {/* Rich Text (HTML) */}
            <div className="prose dark:prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: post.text }} />
            {/* Image */}
            {post.imageUrl && <img src={post.imageUrl} alt="Post attachment" className="mt-3 rounded-xl max-h-96 object-contain w-full" />}
            {/* YouTube Embed */}
            {post.videoId && <YouTubeEmbed videoId={post.videoId} />}
          </div>
        ))}
      </div>
    </div>
  );
}
