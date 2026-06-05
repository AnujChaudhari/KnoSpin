"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import Link from "next/link";

/* ────── Inline SVG Icons ────── */
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
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
);
const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
);
const PencilIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const DotsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
  </svg>
);
const BoldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" /><path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
  </svg>
);
const ItalicIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />
  </svg>
);
const UnderlineIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3" /><line x1="4" y1="21" x2="20" y2="21" />
  </svg>
);
const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" />
  </svg>
);
const EmojiIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
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
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const editDescRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!groupId) return;

    const fetchData = async () => {
      try {
        const groupSnap = await getDoc(doc(db, "groups", groupId));
        if (!groupSnap.exists()) { toast.error("Group not found"); router.push("/community/groups"); return; }
        const groupData = { id: groupSnap.id, ...groupSnap.data() };
        setGroup(groupData);
        setEditName(groupData.name || "");

        const membersSnap = await getDocs(collection(db, "groups", groupId, "members"));
        setMemberCount(membersSnap.size);
        if (user) {
          const already = membersSnap.docs.some(d => d.data().userId === user.uid);
          setIsMember(already);
        }

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

  const canEdit = user && (user.uid === group?.createdBy || user.isAdmin);
  const canDelete = user && (user.uid === group?.createdBy || user.isAdmin);

  const handleStartEdit = () => {
    setEditName(group.name);
    setEditing(true);
    setMenuOpen(false);
    setTimeout(() => {
      if (editDescRef.current) {
        editDescRef.current.innerHTML = group.description || "";
      }
    }, 50);
  };

  const handleSaveEdit = async () => {
    const newName = editName.trim();
    if (!newName) { toast.error("Group name cannot be empty"); return; }
    const newDescription = editDescRef.current?.innerHTML || "";
    try {
      await updateDoc(doc(db, "groups", groupId), {
        name: newName,
        description: newDescription,
      });
      setGroup(prev => ({ ...prev, name: newName, description: newDescription }));
      setEditing(false);
      toast.success("Group updated!");
    } catch (err) {
      toast.error("Failed to update group");
    }
  };

  const handleDeleteGroup = () => {
    setMenuOpen(false);
    if (!canDelete) return toast.error("You are not authorized to delete this group");
    const confirmInput = prompt(`To delete this group, enter the creator's User ID:\n(${group.createdBy})`);
    if (confirmInput === group.createdBy) {
      if (confirm("Are you absolutely sure? This action cannot be undone.")) {
        deleteDoc(doc(db, "groups", groupId))
          .then(() => {
            toast.success("Group deleted successfully");
            router.push("/community/groups");
          })
          .catch(err => toast.error("Failed to delete group"));
      }
    } else if (confirmInput !== null) {
      toast.error("User ID did not match. Group not deleted.");
    }
  };

  const handleToolbar = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    editDescRef.current?.focus();
  };

  const handleEmoji = () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.style.position = 'fixed';
    input.style.opacity = 0;
    document.body.appendChild(input);
    input.focus();
    setTimeout(() => {
      if (input.value === '') {
        document.execCommand('insertText', false, '😊');
      } else {
        document.execCommand('insertText', false, input.value);
      }
      input.remove();
    }, 500);
  };

  if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (!group) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Group Header - Professional App UI */}
      <div className="card mb-6 overflow-hidden">
        {/* Row 1: Icon + Group Name + Action Buttons (Share/Add Post/Dots) */}
        <div className="flex items-center gap-3 mb-3">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 flex-shrink-0 overflow-hidden">
            {group.iconUrl ? (
              <img src={group.iconUrl} alt={group.name} className="w-full h-full object-cover" />
            ) : (
              <GroupIcon />
            )}
          </div>
          {/* Group Name */}
          {editing ? (
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="input-field text-xl font-bold flex-1 min-w-0"
              placeholder="Group Name"
            />
          ) : (
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex-1 break-words">{group.name}</h1>
          )}
          {/* Action Buttons (Share, Add Post) + Dots Menu */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {isMember && (
              <>
                <button onClick={() => setShowInvite(!showInvite)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition" title="Invite">
                  <ShareIcon />
                </button>
                <Link href={`/community/groups/${groupId}/post/create`} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition" title="Create Post">
                  <PlusIcon />
                </Link>
              </>
            )}
            {!isMember && (
              <button onClick={handleJoin} className="btn-gradient text-sm px-3 py-1.5">Join</button>
            )}
            {/* Three-dot menu for Edit/Delete */}
            {(canEdit || canDelete) && !editing && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  title="More options"
                >
                  <DotsIcon />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-10 py-1">
                    {canEdit && (
                      <button
                        onClick={handleStartEdit}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <PencilIcon /> Edit Group
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={handleDeleteGroup}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <TrashIcon /> Delete Group
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Description with "more" button on the right side */}
        {!editing && (
          <div className="mb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="prose dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 flex-1 break-words">
                {showFullDescription ? (
                  <div dangerouslySetInnerHTML={{ __html: group.description || '' }} />
                ) : (
                  <div className="line-clamp-3" dangerouslySetInnerHTML={{ __html: group.description || '' }} />
                )}
              </div>
              {group.description && group.description.replace(/<[^>]*>/g, '').length > 150 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-primary-600 dark:text-primary-400 text-xs font-medium whitespace-nowrap mt-0.5 hover:underline"
                >
                  {showFullDescription ? 'less' : 'more'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Row 3: Members count & Privacy */}
        {!editing && (
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><MembersIcon /> {memberCount} members</span>
            <span>{group.privacy === 'private' ? 'Private group' : 'Public group'}</span>
          </div>
        )}

        {/* Editing mode UI */}
        {editing && (
          <div className="mt-4 space-y-3">
            <div className="flex gap-1 mb-2 flex-wrap">
              <button type="button" onClick={() => handleToolbar('bold')} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"><BoldIcon /></button>
              <button type="button" onClick={() => handleToolbar('italic')} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"><ItalicIcon /></button>
              <button type="button" onClick={() => handleToolbar('underline')} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"><UnderlineIcon /></button>
              <button type="button" onClick={() => handleToolbar('insertUnorderedList')} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"><ListIcon /></button>
              <button type="button" onClick={handleEmoji} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"><EmojiIcon /></button>
            </div>
            <div
              ref={editDescRef}
              contentEditable
              className="card min-h-[100px] p-4 outline-none text-sm break-words"
              style={{ whiteSpace: 'pre-wrap' }}
            />
            <div className="flex gap-2 justify-end flex-wrap">
              <button onClick={() => setEditing(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={handleSaveEdit} className="btn-gradient">Save Changes</button>
            </div>
          </div>
        )}

        {/* Invite section (only when toggled) */}
        {showInvite && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <code className="text-xs sm:text-sm break-all">{`https://quickshoppro.vercel.app/community/groups/join?invite=${group.inviteCode}`}</code>
            <button onClick={copyInviteLink} className="btn-gradient text-xs px-3 py-1.5 flex items-center gap-1 flex-shrink-0">
              <CopyIcon /> Copy
            </button>
          </div>
        )}
      </div>

      {/* Post Feed */}
      {posts.length === 0 && <p className="text-center text-gray-500 py-12">No posts yet. Be the first to share!</p>}
      <div className="space-y-4">
        {posts.map(post => {
          const renderWithMentions = (text) => {
            if (!text) return "";
            return text.replace(/@([a-zA-Z0-9_.]+)/g, '<span class="text-primary-600 font-medium">@$1</span>');
          };
          return (
            <div key={post.id} className="card">
              <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                <div>
                  <span className="font-medium dark:text-white">{post.authorName}</span>
                  <span className="text-xs text-gray-400 ml-2">{new Date(post.createdAt?.toDate()).toLocaleString()}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: 'Check this post', url: `${window.location.origin}/community/groups/${groupId}?post=${post.id}` }).catch(() => {});
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
                    }} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
                  )}
                </div>
              </div>
              <div className="prose dark:prose-invert max-w-none text-sm dark:text-gray-200 break-words" dangerouslySetInnerHTML={{ __html: renderWithMentions(post.text) }} />
              {post.imageUrl && <img src={post.imageUrl} alt="Post attachment" className="mt-3 rounded-xl max-h-96 object-contain w-full" />}
              {post.videoId && <YouTubeEmbed videoId={post.videoId} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
