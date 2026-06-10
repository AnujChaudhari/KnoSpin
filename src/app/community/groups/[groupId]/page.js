"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc, getDoc, collection, getDocs, addDoc,
  updateDoc, deleteDoc, serverTimestamp, query, where, limit, getCountFromServer
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { sendNotification } from "@/lib/notifications";
import Link from "next/link";

/* ────────────── SVG Icons ────────────── */
const GroupIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>;
const MembersIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M20 8v6" /><path d="M23 11h-6" /></svg>;
const ShareIcon = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.59 13.51l6.83 3.98" /><path d="M15.41 6.51l-6.82 3.98" /></svg>;
const CopyIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>;
const PlusIcon = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>;
const PencilIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const BoldIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" /><path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" /></svg>;
const ItalicIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg>;
const UnderlineIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3" /><line x1="4" y1="21" x2="20" y2="21" /></svg>;
const ListIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></svg>;
const EmojiIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>;
const DotsVerticalIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>;
const VideoIcon = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>;

const YouTubeEmbed = ({ videoId }) => (
  <div className="aspect-video rounded-2xl overflow-hidden shadow-sm bg-black mt-4">
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

/* ────────────── kMeet CALL MODAL ────────────── */
const KMeetModal = ({ groupId, onClose }) => {
  const roomName = `QuickShop_${groupId.replace(/[^a-zA-Z0-9]/g, "_")}`;
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full h-full sm:h-[90vh] sm:max-w-6xl bg-[#111] sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/10">
        <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-2 text-white/90">
            <VideoIcon />
            <span className="font-semibold text-sm tracking-wide">Live Group Call</span>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-red-500 text-white rounded-full transition-all active:scale-95">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <iframe src={`https://kmeet.infomaniak.com/${roomName}`} allow="camera; microphone; fullscreen; display-capture" className="w-full flex-1 border-0" title="Group Call" />
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Optimized Architecture: Light queries & Server Side Count
  useEffect(() => {
    if (!groupId) return;

    const fetchData = async () => {
      try {
        const postsQuery = query(collection(db, "posts"), where("groupId", "==", groupId));
        const countQuery = getCountFromServer(collection(db, "groups", groupId, "members"));
        
        // Pure Targeted User Check (No massive downloads)
        const userCheckQuery = user 
          ? query(collection(db, "groups", groupId, "members"), where("userId", "==", user.uid), limit(1))
          : null;

        const [groupSnap, countSnap, userCheckSnap, postsSnap] = await Promise.all([
          getDoc(doc(db, "groups", groupId)),
          countQuery,
          userCheckQuery ? getDocs(userCheckQuery) : Promise.resolve(null),
          getDocs(postsQuery)
        ]);

        if (!groupSnap.exists()) {
          toast.error("Group not found");
          router.push("/community/groups");
          return;
        }

        const groupData = { id: groupSnap.id, ...groupSnap.data() };
        setGroup(groupData);
        setEditName(groupData.name || "");

        // Set efficient server count
        setMemberCount(countSnap.data().count);
        
        if (user && userCheckSnap) {
          setIsMember(!userCheckSnap.empty);
        }

        const groupPosts = postsSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((p) => !p.isDeleted);
        
        groupPosts.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setPosts(groupPosts);

      } catch (err) {
        console.error("Optimized fetch pipeline intercepted: ", err);
        toast.error("Loaded via offline pipeline");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [groupId, user, router]);

  const handleJoin = async () => {
    if (!user) { toast.error("Please login first"); return; }
    try {
      await addDoc(collection(db, "groups", groupId, "members"), {
        userId: user.uid,
        role: "member",
        joinedAt: serverTimestamp(),
      });
      setIsMember(true);
      setMemberCount((prev) => prev + 1);
      toast.success("Welcome to the group! 🎉");
    } catch (err) {
      toast.error("Failed to join");
    }
  };

  const copyInviteLink = () => {
    const link = `https://quickshoppro.vercel.app/community/groups/join?invite=${group.inviteCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied to clipboard!");
  };

  const canEdit = user && (user.uid === group?.createdBy || user.isAdmin);
  const canDelete = user && (user.uid === group?.createdBy || user.isAdmin);

  const handleStartEdit = () => {
    setShowMenu(false);
    setEditName(group.name);
    setEditing(true);
    setTimeout(() => {
      if (editDescRef.current) editDescRef.current.innerHTML = group.description || "";
    }, 50);
  };

  const handleSaveEdit = async () => {
    const newName = editName.trim();
    if (!newName) return toast.error("Name cannot be empty");
    const newDescription = editDescRef.current?.innerHTML || "";
    try {
      await updateDoc(doc(db, "groups", groupId), { name: newName, description: newDescription });
      setGroup((prev) => ({ ...prev, name: newName, description: newDescription }));
      setEditing(false);
      toast.success("Saved successfully");
    } catch (err) {
      toast.error("Failed to save changes");
    }
  };

  const handleDeleteGroup = () => {
    setShowMenu(false);
    if (!canDelete) return toast.error("Unauthorized");
    const confirmInput = prompt(`To confirm deletion, enter Creator ID:\n(${group.createdBy})`);
    if (confirmInput === group.createdBy) {
      if (confirm("Are you completely sure?")) {
        deleteDoc(doc(db, "groups", groupId))
          .then(() => {
            toast.success("Group deleted");
            router.push("/community/groups");
          })
          .catch(() => toast.error("Error deleting group"));
      }
    } else if (confirmInput !== null) {
      toast.error("ID mismatch. Cancelled.");
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
      document.execCommand("insertText", false, input.value || "😊");
      input.remove();
    }, 500);
  };

  const startCall = async () => {
    if (!user) return toast.error("Login required");
    setSendingNotification(true);
    try {
      const membersSnap = await getDocs(collection(db, "groups", groupId, "members"));
      const promises = membersSnap.docs
        .map(d => d.data())
        .filter(d => d.userId !== user.uid)
        .map(d => sendNotification(
          d.userId, "system", "Video Call Started",
          `${user.email?.split('@')[0] || "Someone"} started a call in ${group.name}.`,
          `/community/groups/${groupId}`
        ));
      await Promise.all(promises);
      if (promises.length > 0) toast.success(`Notified ${promises.length} members`);
    } catch (err) {
      console.error(err);
    } fill (sendingNotification) {
      setSendingNotification(false);
      setShowCall(true);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );
  if (!group) return null;

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 md:py-8 min-h-screen">
      
      {/* ===== PREMIUM GROUP CARD ===== */}
      <div className="bg-white dark:bg-[#111] rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 mb-6 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary-500/10 to-transparent dark:from-primary-500/5 opacity-50 pointer-events-none" />
        
        <div className="p-5 sm:p-7 relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-primary-50 to-primary-100 dark:from-white/5 dark:to-white/10 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0 overflow-hidden shadow-inner">
                {group.iconUrl ? <img src={group.iconUrl} alt={group.name} className="w-full h-full object-cover" /> : <GroupIcon />}
              </div>
              <div className="flex-1 min-w-0">
                {editing ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-transparent text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white border-b border-primary-500 focus:outline-none pb-1"
                    placeholder="Group Name"
                  />
                ) : (
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate tracking-tight">
                    {group.name}
                  </h1>
                )}
                {!editing && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 px-2.5 py-0.5 rounded-full">
                      <MembersIcon /> {memberCount}
                    </span>
                    <span className="capitalize bg-gray-100 dark:bg-white/5 px-2.5 py-0.5 rounded-full">
                      {group.privacy}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Menu Options */}
            {!editing && (canEdit || canDelete) && (
              <div className="relative flex-shrink-0" ref={menuRef}>
                <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 transition-colors">
                  <DotsVerticalIcon />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 z-20 overflow-hidden">
                    {canEdit && (
                      <button onClick={handleStartEdit} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                        <PencilIcon /> Edit Group
                      </button>
                    )}
                    {canDelete && (
                      <button onClick={handleDeleteGroup} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition">
                        <TrashIcon /> Delete Group
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ===== COMPACT ACTION BAR ===== */}
          {!editing && isMember && user && (
            <div className="flex items-center gap-1.5 mt-6 w-full overflow-hidden">
              <button
                onClick={() => setShowInvite(!showInvite)}
                className="flex-1 flex justify-center items-center gap-1 px-2 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl text-gray-800 dark:text-gray-200 text-xs font-bold transition-all active:scale-95 truncate"
              >
                <ShareIcon /> Share
              </button>
              <Link
                href={`/community/groups/${groupId}/post/create`}
                className="flex-1 flex justify-center items-center gap-1 px-2 py-2.5 bg-primary-600 hover:bg-primary-700 shadow-sm shadow-primary-500/30 rounded-xl text-white text-xs font-bold transition-all active:scale-95 text-center truncate"
              >
                <PlusIcon /> Post
              </Link>
              <button
                onClick={startCall}
                disabled={sendingNotification}
                className="flex-1 flex justify-center items-center gap-1 px-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 shadow-sm shadow-emerald-500/30 rounded-xl text-white text-xs font-bold transition-all active:scale-95 disabled:opacity-70 truncate"
              >
                <VideoIcon /> {sendingNotification ? "..." : "Call"}
              </button>
            </div>
          )}

          {!editing && (!isMember || !user) && (
            <button onClick={handleJoin} className="w-full mt-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-sm transition-all active:scale-95">
              {user ? "Join Group" : "Login to Join Group"}
            </button>
          )}

          {/* Invite Code Reveal */}
          {showInvite && !editing && user && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-gray-100 dark:border-white/5 animate-in fade-in slide-in-from-top-2">
              <code className="text-sm break-all text-gray-600 dark:text-gray-300 w-full text-center sm:text-left">{`.../join?invite=${group.inviteCode}`}</code>
              <button onClick={copyInviteLink} className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/20 transition-colors">
                <CopyIcon /> Copy
              </button>
            </div>
          )}

          {/* ===== EDIT MODE EDITOR ===== */}
          {editing && (
            <div className="mt-6 animate-in fade-in">
              <div className="flex gap-1.5 mb-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
                {[
                  { icon: <BoldIcon />, cmd: "bold" },
                  { icon: <ItalicIcon />, cmd: "italic" },
                  { icon: <UnderlineIcon />, cmd: "underline" },
                  { icon: <ListIcon />, cmd: "insertUnorderedList" },
                ].map((btn, i) => (
                  <button key={i} type="button" onClick={() => handleToolbar(btn.cmd)} className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-gray-700 dark:text-gray-200">
                    {btn.icon}
                  </button>
                ))}
                <button type="button" onClick={handleEmoji} className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-gray-700 dark:text-gray-200">
                  <EmojiIcon />
                </button>
              </div>
              <div
                ref={editDescRef}
                contentEditable
                className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl p-4 min-h-[120px] outline-none focus:ring-2 focus:ring-primary-500/50 text-gray-900 dark:text-white text-sm [&_*]:dark:!text-white [&_*]:dark:!bg-transparent transition-all"
                style={{ whiteSpace: "pre-wrap" }}
              />
              <div className="flex gap-3 justify-end mt-4">
                <button onClick={() => setEditing(false)} className="px-5 py-2.5 bg-gray-100 dark:bg-white/10 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
                <button onClick={handleSaveEdit} className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors">Save Changes</button>
              </div>
            </div>
          )}

          {/* ===== DESCRIPTION ===== */}
          {!editing && group.description && (
            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/5">
              <div className={`prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed break-words [&_*]:dark:!text-gray-200 [&_*]:dark:!bg-transparent ${!showFullDescription ? "line-clamp-3" : ""}`}>
                <div dangerouslySetInnerHTML={{ __html: group.description }} />
              </div>
              {group.description.replace(/<[^>]*>/g, "").length > 120 && (
                <button onClick={() => setShowFullDescription(!showFullDescription)} className="mt-2 text-primary-600 dark:text-primary-400 text-sm font-semibold hover:underline">
                  {showFullDescription ? "Show Less" : "Read More"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== UNAUTHENTICATED APP-STYLE LOGIN WALL ===== */}
      {!user && (
        <div className="p-6 text-center bg-gradient-to-br from-primary-500/15 to-transparent dark:from-primary-500/5 border border-primary-500/20 backdrop-blur-md rounded-3xl my-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="text-xl mb-1">👋 Join the Community</div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">Login Required</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4 leading-relaxed">
            You are viewing a limited layout. Please log in to read full discussions, see media attachments, and launch live rooms.
          </p>
          <button 
            onClick={() => router.push("/login")} 
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-primary-500/20"
          >
            Sign In / Login
          </button>
        </div>
      )}

      {/* ===== POSTS FEED ===== */}
      <div className="space-y-4 sm:space-y-6">
        {posts.length === 0 && (
          <div className="text-center py-12 px-4 bg-white/50 dark:bg-[#111]/50 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
            <p className="text-gray-500 dark:text-gray-400 font-medium">No posts yet. Be the first to start a conversation!</p>
          </div>
        )}
        
        {posts.map((post) => {
          const renderWithMentions = (text) => text?.replace(/@([a-zA-Z0-9_.]+)/g, '<span class="text-primary-600 dark:text-primary-400 font-semibold bg-primary-50 dark:bg-primary-500/10 px-1 rounded">@$1</span>') || "";
          
          const cleanText = post.text ? post.text.replace(/<[^>]*>/g, '') : '';
          const previewText = cleanText.length > 80 ? cleanText.substring(0, 80) + "..." : cleanText;

          return (
            <div key={post.id} className="bg-white dark:bg-[#111] rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 p-5 sm:p-6 transition-all relative overflow-hidden">
              <div className="flex justify-between items-start mb-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-lg font-bold text-gray-600 dark:text-gray-300 flex-shrink-0">
                    {post.authorName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base leading-tight">{post.authorName}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(post.createdAt?.toDate()).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                    </span>
                  </div>
                </div>
                
                {user && (
                  <div className="flex gap-1 bg-gray-50 dark:bg-white/5 rounded-full p-1">
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/community/groups/${groupId}?post=${post.id}`;
                        navigator.share ? navigator.share({ url }) : (navigator.clipboard.writeText(url), toast.success("Link copied!"));
                      }}
                      className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                    >
                      <ShareIcon />
                    </button>
                    {(user.uid === post.authorId || user.isAdmin) && (
                      <button
                        onClick={async () => {
                          if (confirm("Delete this post?")) {
                            await updateDoc(doc(db, "posts", post.id), { isDeleted: true });
                            setPosts(posts.filter((p) => p.id !== post.id));
                            toast.success("Deleted");
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {/* ===== CONDITIONAL CONTENT AREA (LOGIN GATE) ===== */}
              {user ? (
                <>
                  <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-gray-700 dark:text-gray-200 break-words [&_*]:dark:!text-gray-200 [&_*]:dark:!bg-transparent" dangerouslySetInnerHTML={{ __html: renderWithMentions(post.text) }} />
                  {post.imageUrl && (
                    <div className="mt-4 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5">
                      <img src={post.imageUrl} alt="Post media" className="w-full max-h-[400px] object-cover hover:scale-[1.02] transition-transform duration-500" loading="lazy" />
                    </div>
                  )}
                  {post.videoId && <YouTubeEmbed videoId={post.videoId} />}
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-400 dark:text-gray-500 text-sm sm:text-base break-all line-clamp-2 select-none filter blur-[1px]">
                    {previewText || "🔒 Content is locked"}
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                    <span>🔒 Login to reveal full post</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* kMeet Modal */}
      {showCall && user && <KMeetModal groupId={groupId} onClose={() => setShowCall(false)} />}
    </div>
  );
}
