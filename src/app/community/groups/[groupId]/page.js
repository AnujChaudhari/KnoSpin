"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import Link from "next/link";

/* ────── Premium SVG Icons ────── */
const GroupIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const MembersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <path d="M20 8v6" />
    <path d="M23 11h-6" />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="M8.59 13.51l6.83 3.98" />
    <path d="M15.41 6.51l-6.82 3.98" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

const YouTubeEmbed = ({ videoId }) => (
  <div className="aspect-video rounded-xl overflow-hidden shadow bg-black mt-3">
    <iframe
      width="100%"
      height="100%"
      src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
      title="YouTube video"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="w-full h-full"
    />
  </div>
);

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.groupId;
  const auth = useAuth();
  const user = auth?.user;
  const isAdmin = auth?.isAdmin;
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
        // Fetch group details
        const groupSnap = await getDoc(doc(db, "groups", groupId));
        if (!groupSnap.exists()) {
          toast.error("Group not found");
          router.push("/community/groups");
          return;
        }
        setGroup({ id: groupSnap.id, ...groupSnap.data() });

        // Count members
        const membersSnap = await getDocs(collection(db, "groups", groupId, "members"));
        setMemberCount(membersSnap.size);

        // Check if current user is a member
        if (user) {
          const already = membersSnap.docs.some(d => d.data().userId === user.uid);
          setIsMember(already);
        }

        // Fetch all posts (client-side filter + sort)
        const postsSnap = await getDocs(collection(db, "posts"));
        const allPosts = postsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const groupPosts = allPosts
          .filter(p => p.groupId === groupId && !p.isDeleted)
          .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setPosts(groupPosts);
      } catch (err) {
        console.error("Error loading group:", err);
        toast.error("Failed to load group");
      }
      setLoading(false);
    };

    fetchData();
  }, [groupId, user, router]);

  const handleJoin = async () => {
    if (!user) {
      toast.error("Please login to join");
      return;
    }
    try {
      await addDoc(collection(db, "groups", groupId, "members"), {
        userId: user.uid,
        role: "member",
        joinedAt: serverTimestamp(),
      });
      setIsMember(true);
      setMemberCount(prev => prev + 1);
      toast.success("Joined group! 🎉");
    } catch (err) {
      console.error(err);
      toast.error("Failed to join group");
    }
  };

  const copyInviteLink = () => {
    const link = `https://quickshoppro.vercel.app/community/groups/join?invite=${group.inviteCode}`;
    navigator.clipboard.writeText(link).then(() => {
      toast.success("Invite link copied!");
    }).catch(() => {
      toast.error("Failed to copy");
    });
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await updateDoc(doc(db, "posts", postId), { isDeleted: true });
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success("Post deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete post");
    }
  };

  const canDeletePost = (post) => {
    if (!user) return false;
    // Author can delete, admin can delete
    return user.uid === post.authorId || isAdmin;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!group) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Group Header Card */}
      <div className="card mb-6">
        <div className="flex items-start gap-4">
          {/* Group Icon */}
          <div className="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 flex-shrink-0">
            <GroupIcon />
          </div>

          {/* Group Info */}
          <div className="flex-grow">
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <p className="text-gray-500 mt-1">{group.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MembersIcon /> {memberCount} members
              </span>
              <span>{group.privacy === 'private' ? '🔒 Private' : '🌐 Public'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            {!isMember && (
              <button
                onClick={handleJoin}
                className="btn-gradient text-sm whitespace-nowrap"
              >
                Join Group
              </button>
            )}
            {isMember && (
              <>
                <button
                  onClick={() => setShowInvite(!showInvite)}
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  title="Invite people"
                >
                  <ShareIcon />
                </button>
                <Link
                  href={`/community/groups/${groupId}/post/create`}
                  className="btn-gradient text-sm flex items-center gap-1 whitespace-nowrap"
                >
                  <PlusIcon /> Post
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Invite Link Section */}
        {showInvite && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-between gap-2">
            <code className="text-sm break-all flex-grow">
              {`https://quickshoppro.vercel.app/community/groups/join?invite=${group.inviteCode}`}
            </code>
            <button
              onClick={copyInviteLink}
              className="btn-gradient text-xs px-3 py-1 flex items-center gap-1 whitespace-nowrap"
            >
              <CopyIcon /> Copy
            </button>
          </div>
        )}
      </div>

      {/* Post Feed */}
      {posts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No posts yet 📭</p>
          {isMember && (
            <p className="text-gray-400 text-sm mt-2">Be the first to share something!</p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="card hover:shadow-md transition">
            {/* Post Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                {/* Author Avatar */}
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 text-sm font-bold flex-shrink-0">
                  {post.authorName?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <span className="font-medium text-sm">{post.authorName || "Anonymous"}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {post.createdAt?.toDate
                      ? new Date(post.createdAt.toDate()).toLocaleString()
                      : ''}
                  </span>
                </div>
              </div>

              {/* Share & Delete Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/community/groups/${groupId}?post=${post.id}`;
                    if (navigator.share) {
                      navigator.share({ title: 'Check this post', url }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(url);
                      toast.success("Post link copied!");
                    }
                  }}
                  className="text-gray-400 hover:text-primary-600 p-1"
                  title="Share post"
                >
                  <ShareIcon />
                </button>
                {canDeletePost(post) && (
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                    title="Delete post"
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>
            </div>

            {/* Post Content (Rich Text) */}
            <div
              className="prose dark:prose-invert max-w-none text-sm mb-3"
              dangerouslySetInnerHTML={{ __html: post.text }}
            />

            {/* Image Attachment */}
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt="Post attachment"
                className="mt-3 rounded-xl max-h-96 object-contain w-full bg-gray-100 dark:bg-gray-700"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}

            {/* YouTube Video Embed */}
            {post.videoId && <YouTubeEmbed videoId={post.videoId} />}
          </div>
        ))}
      </div>
    </div>
  );
}
