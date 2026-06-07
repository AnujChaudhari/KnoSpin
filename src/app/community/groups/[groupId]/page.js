"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc, getDoc, collection, getDocs, addDoc,
  updateDoc, deleteDoc, serverTimestamp
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { sendNotification } from "@/lib/notifications";
import Link from "next/link";

/* ────────────── SVG Icons ────────────── */
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
const PencilIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
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
const DotsVerticalIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
  </svg>
);
const PhoneIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0122 16.92z" />
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

/* ────────────── JITSI CALL MODAL (no TypeScript) ────────────── */
const JitsiCallModal = ({ groupId, onClose }) => {
  const roomName = `Group_${groupId.replace(/[^a-zA-Z0-9]/g, "_")}`;
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-2">
      <div className="relative w-full max-w-5xl h-[90vh] bg-gray-900 rounded-xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 bg-red-600 rounded-full text-white hover:bg-red-700 transition"
        >
          ✕
        </button>
        <iframe
          src={`https://meet.jit.si/${roomName}?config.startWithAudioMuted=false&config.startWithVideoMuted=false`}
          allow="camera; microphone; fullscreen; display-capture"
          className="w-full h-full border-0"
          title="Group Call"
        />
      </div>
    </div>
  );
};

/* ────────────── MAIN COMPONENT ────────────── */
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
  const [showMenu, setShowMenu] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);
  const editDescRef = useRef(null);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch group data, members, posts
  useEffect(() => {
    if (!groupId) return;

    const fetchData = async () => {
      try {
        const groupSnap = await getDoc(doc(db, "groups", groupId));
        if (!groupSnap.exists()) {
          toast.error("Group not found");
          router.push("/community/groups");
          return;
        }
        const groupData = { id: groupSnap.id, ...groupSnap.data() };
        setGroup(groupData);
        setEditName(groupData.name || "");

        const membersSnap = await getDocs(collection(db, "groups", groupId, "members"));
        setMemberCount(membersSnap.size);
        if (user) {
          const already = membersSnap.docs.some((d) => d.data().userId === user.uid);
          setIsMember(already);
        }

        const postsSnap = await getDocs(collection(db, "posts"));
        const allPosts = postsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const groupPosts = allPosts.filter((p) => p.groupId === groupId && !p.isDeleted);
        groupPosts.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setPosts(groupPosts);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load group");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [groupId, user, router]);

  const handleJoin = async () => {
    if (!user) { toast.error("Please login"); return; }
    try {
      await addDoc(collection(db, "groups", groupId, "members"), {
        userId: user.uid,
        role: "member",
        joinedAt: serverTimestamp(),
      });
      setIsMember(true);
      setMemberCount((prev) => prev + 1);
      toast.success("Joined group!");
    } catch (err) {
      toast.error("Failed to join");
    }
  };

  const copyInviteLink = () => {
    const link = `https://quickshoppro.vercel.app/community/groups/join?invite=${group.inviteCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied!");
  };

  const canEdit = user && (user.uid === group?.createdBy || user.isAdmin);
  const canDelete = user && (user.uid === group?.createdBy || user.isAdmin);

  const handleStartEdit = () => {
    setShowMenu(false);
    setEditName(group.name);
    setEditing(true);
    setTimeout(() => {
      if (editDescRef.current) {
        editDescRef.current.innerHTML = group.description || "";
      }
    }, 50);
  };

  const handleSaveEdit = async () => {
    const newName = editName.trim();
    if (!newName) {
      toast.error("Group name cannot be empty");
      return;
    }
    const newDescription = editDescRef.current?.innerHTML || "";
    try {
      await updateDoc(doc(db, "groups", groupId), {
        name: newName,
        description: newDescription,
      });
      setGroup((prev) => ({ ...prev, name: newName, description: newDescription }));
      setEditing(false);
      toast.success("Group updated!");
    } catch (err) {
      toast.error("Failed to update group");
    }
  };

  const handleDeleteGroup = () => {
    setShowMenu(false);
    if (!canDelete) return toast.error("You are not authorized to delete this group");
    const confirmInput = prompt(`To delete this group, enter the creator's User ID:\n(${group.createdBy})`);
    if (confirmInput === group.createdBy) {
      if (confirm("Are you absolutely sure? This action cannot be undone.")) {
        deleteDoc(doc(db, "groups", groupId))
          .then(() => {
            toast.success("Group deleted successfully");
            router.push("/community/groups");
          })
          .catch(() => toast.error("Failed to delete group"));
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
    const input = document.createElement("input");
    input.type = "text";
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.focus();
    setTimeout(() => {
      if (input.value === "") {
        document.execCommand("insertText", false, "😊");
      } else {
        document.execCommand("insertText", false, input.value);
      }
      input.remove();
    }, 500);
  };

  /* ---- send notification directly to Firestore (no API needed) ---- */
  const startCall = async () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }
    setSendingNotification(true);
    try {
      // Fetch all group members
      const membersSnap = await getDocs(collection(db, "groups", groupId, "members"));
      const promises = [];
      membersSnap.docs.forEach((memberDoc) => {
        const memberData = memberDoc.data();
        if (memberData.userId !== user.uid) {
          // Send notification to other members
          const notifPromise = sendNotification(
            memberData.userId,
            "system",
            "Video Call Started",
            `${user.email || "Someone"} started a video call in the group. Join now!`,
            `/community/groups/${groupId}`
          );
          promises.push(notifPromise);
        }
      });
      await Promise.all(promises);
      if (promises.length > 0) {
        toast.success(`Call notification sent to ${promises.length} member${promises.length > 1 ? 's' : ''}`);
      } else {
        toast("No other members to notify, but you can start the call.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not send notifications, but you can still start the call.");
    } finally {
      setSendingNotification(false);
      setShowCall(true);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  if (!group) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Group Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 mb-6 overflow-hidden">
        <div className="p-5 md:p-6">
          {/* ===== TOP ROW ===== */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 flex-shrink-0 overflow-hidden">
                {group.iconUrl ? (
                  <img src={group.iconUrl} alt={group.name} className="w-full h-full object-cover" />
                ) : (
                  <GroupIcon />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {editing ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input-field text-2xl font-bold w-full"
                    placeholder="Group Name"
                  />
                ) : (
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">
                    {group.name}
                  </h1>
                )}
                {!editing && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <MembersIcon /> {memberCount} members
                    </span>
                    <span className="capitalize">{group.privacy}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3‑dot menu (edit/delete) */}
            {!editing && (canEdit || canDelete) && (
              <div className="relative flex-shrink-0" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  aria-label="Group options"
                >
                  <DotsVerticalIcon />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-10 py-1">
                    {canEdit && (
                      <button
                        onClick={handleStartEdit}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      >
                        <PencilIcon /> Edit Group
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={handleDeleteGroup}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      >
                        <TrashIcon /> Delete Group
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ===== ACTION BUTTONS (Share, Post, Call) – only for members ===== */}
          {!editing && isMember && (
            <div className="flex flex-wrap items-center justify-end gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setShowInvite(!showInvite)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <ShareIcon /> Share
              </button>
              <Link
                href={`/community/groups/${groupId}/post/create`}
                className="flex items-center gap-2 px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
              >
                <PlusIcon /> Post
              </Link>
              <button
                onClick={startCall}
                disabled={sendingNotification}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                <PhoneIcon /> {sendingNotification ? "Notifying..." : "Start Call"}
              </button>
            </div>
          )}

          {/* Join button for non-members */}
          {!editing && !isMember && (
            <div className="flex justify-end mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={handleJoin} className="btn-gradient text-sm px-5 py-2">
                Join Group
              </button>
            </div>
          )}

          {/* Invite link section */}
          {showInvite && !editing && (
            <div className="mt-5 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <code className="text-xs break-all text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 w-full overflow-x-auto">
                {`https://quickshoppro.vercel.app/community/groups/join?invite=${group.inviteCode}`}
              </code>
              <button
                onClick={copyInviteLink}
                className="btn-gradient text-xs px-3 py-1.5 flex items-center gap-1 flex-shrink-0"
              >
                <CopyIcon /> Copy
              </button>
            </div>
          )}

          {/* ===== EDIT MODE ===== */}
          {editing && (
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex gap-1 mb-3 flex-wrap">
                <button type="button" onClick={() => handleToolbar("bold")} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <BoldIcon />
                </button>
                <button type="button" onClick={() => handleToolbar("italic")} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <ItalicIcon />
                </button>
                <button type="button" onClick={() => handleToolbar("underline")} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <UnderlineIcon />
                </button>
                <button type="button" onClick={() => handleToolbar("insertUnorderedList")} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <ListIcon />
                </button>
                <button type="button" onClick={handleEmoji} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <EmojiIcon />
                </button>
              </div>
              <div
                ref={editDescRef}
                contentEditable
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 min-h-[120px] outline-none text-gray-900 dark:text-white text-sm"
                style={{ whiteSpace: "pre-wrap" }}
              />
              <div className="flex gap-2 justify-end mt-4">
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button onClick={handleSaveEdit} className="btn-gradient">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* ===== GROUP DESCRIPTION (view mode) ===== */}
          {!editing && group.description && (
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div
                className={`prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-100 leading-relaxed break-words ${
                  !showFullDescription ? "line-clamp-4" : ""
                }`}
              >
                <div dangerouslySetInnerHTML={{ __html: group.description }} />
              </div>
              {group.description.replace(/<[^>]*>/g, "").length > 150 && (
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline"
                  >
                    {showFullDescription ? "Show Less" : "Read More..."}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== POSTS FEED ===== */}
      {posts.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-12">No posts yet. Be the first to share!</p>
      )}
      <div className="space-y-5">
        {posts.map((post) => {
          const renderWithMentions = (text) => {
            if (!text) return "";
            return text.replace(/@([a-zA-Z0-9_.]+)/g, '<span class="text-primary-600 font-medium">@$1</span>');
          };
          return (
            <div
              key={post.id}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 transition-colors"
            >
              <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">{post.authorName}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {new Date(post.createdAt?.toDate()).toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator
                          .share({
                            title: "Check this post",
                            url: `${window.location.origin}/community/groups/${groupId}?post=${post.id}`,
                          })
                          .catch(() => {});
                      } else {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/community/groups/${groupId}?post=${post.id}`
                        );
                        toast.success("Post link copied!");
                      }
                    }}
                    className="text-gray-400 hover:text-primary-600"
                  >
                    <ShareIcon />
                  </button>
                  {user && (user.uid === post.authorId || user.isAdmin) && (
                    <button
                      onClick={async () => {
                        if (confirm("Delete post?")) {
                          await updateDoc(doc(db, "posts", post.id), { isDeleted: true });
                          setPosts(posts.filter((p) => p.id !== post.id));
                          toast.success("Post deleted");
                        }
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              </div>
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-100 break-words"
                dangerouslySetInnerHTML={{ __html: renderWithMentions(post.text) }}
              />
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post attachment"
                  className="mt-3 rounded-xl max-h-96 object-contain w-full"
                />
              )}
              {post.videoId && <YouTubeEmbed videoId={post.videoId} />}
            </div>
          );
        })}
      </div>

      {/* Jitsi Call Modal */}
      {showCall && <JitsiCallModal groupId={groupId} onClose={() => setShowCall(false)} />}
    </div>
  );
}
