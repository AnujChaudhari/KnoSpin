"use client";

import React, { useEffect, useState, useRef } from "react";

// Mocking toast
const toast = {
  success: (msg) => console.log("Toast Success:", msg),
  error: (msg) => console.error("Toast Error:", msg)
};

// Mocking next/navigation
const useParams = () => ({ groupId: "mock-group-123" });
const useRouter = () => ({ push: (url) => console.log("Navigating to:", url) });

// Mocking next/link
const Link = ({ href, children, className }) => (
  <a href={href} className={className} onClick={(e) => { e.preventDefault(); console.log("Link clicked:", href); }}>
    {children}
  </a>
);

// Mocking Firebase Auth Context
const useAuth = () => ({
  user: { uid: "mock-user-1", isAdmin: true },
});

// Mocking Firebase Firestore
const db = {};
const doc = () => ({});
const getDoc = async () => ({
  exists: () => true,
  id: "mock-group-123",
  data: () => ({
    name: "TRS Helper",
    description: `ओए TRS वीरों 🙌<br/><br/>मैं भी तुम्हीं में से एक हूँ - क्लास में बैक बेंच पर (या कभी फ्रंट में जब अटेंडेंस कम हो), प्रोजेक्ट्स की टेंशन में, साइड में कुछ नया सीखने का चक्कर। साथ ही थोड़ा मार्केटिंग का शौक है। तो दोनों मिलाकर लेकर आया हूँ ये ग्रुप।<br/><br/>बात ये है:<br/>मैंने एक क्विकशॉप बनाया है - नाम सुनके मत उलझना, यहाँ चाय-बिस्किट नहीं बिकता। यहाँ बिकते हैं:<br/><br/><b>कोर्स</b> (वो वाले जो तुम्हें असली पैसे कमाना सिखाएँ - प्रोग्रामिंग, मार्केटिंग, डिज़ाइन, फ्रीलांसिंग)<br/><b>डिजिटल प्रोडक्ट्स</b> (रेडीमेड नोट्स, टेम्पलेट, प्रोजेक्ट आइडियाज, चीटशीट - जो तुम्हारा समय बचाएँ)<br/><b>फिजिकल प्रोडक्ट्स</b> (वो गैजेट्स या एक्सेसरीज़ जो तुम ढूंढ रहे हो)`,
    createdBy: "mock-user-1",
    inviteCode: "abc-123-xyz",
    privacy: "public",
    iconUrl: "https://via.placeholder.com/150"
  })
});
const collection = () => ({});
const getDocs = async () => ({
  size: 42,
  docs: [
    {
       id: "post-1",
       data: () => ({
         authorName: "Amit Kumar",
         authorId: "user-2",
         text: "Has anyone started working on the final year project?",
         createdAt: { toDate: () => new Date(), toMillis: () => Date.now() }
       })
    }
  ]
});
const addDoc = async () => ({ id: "new-doc-id" });
const updateDoc = async () => {};
const deleteDoc = async () => {};
const serverTimestamp = () => new Date();


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

const YouTubeEmbed = ({ videoId }) => (
  <div className="aspect-video rounded-xl overflow-hidden shadow bg-black mt-3 w-full">
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
  const [isMember, setIsMember] = useState(true); // Default to true for preview
  const [showInvite, setShowInvite] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [showMenu, setShowMenu] = useState(false); // State for 3-dot menu
  const [isDarkMode, setIsDarkMode] = useState(false); // Toggle for previewing dark mode

  const editDescRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    // Check system preference for dark mode initially
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
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
        
        // Mocking member check based on the mock data size
        setIsMember(membersSnap.size > 0);

        const postsSnap = await getDocs(collection(db, "posts"));
        const allPosts = postsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const groupPosts = allPosts; // In mock, just use all
        groupPosts.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setPosts(groupPosts);
      } catch (err) { console.error(err); toast.error("Failed to load group"); }
      setLoading(false);
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
    setShowMenu(false); // Close menu when starting edit
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
    setShowMenu(false); // Close menu before deleting
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

  if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;
  if (!group) return null;

  return (
    // Added a wrapper to force dark mode based on state for preview purposes,
    // usually handled by 'next-themes' or a global wrapper.
    <div className={`${isDarkMode ? 'dark bg-slate-900 min-h-screen' : 'bg-gray-50 min-h-screen'}`}>
      {/* Temporary Toggle for Preview */}
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)} 
        className="fixed bottom-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg"
      >
        Toggle {isDarkMode ? 'Light' : 'Dark'} Mode
      </button>

      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-8 w-full overflow-hidden">
        
        {/* Group Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-6 relative">
          
          {/* Top Row: Icon, Name, and Actions/Menu */}
          <div className="flex items-start justify-between gap-3 w-full">
            
            {/* Left Side: Icon & Title Area */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
               {/* Group Icon */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 flex-shrink-0 overflow-hidden shadow-sm">
                {group.iconUrl ? (
                  <img src={group.iconUrl} alt={group.name} className="w-full h-full object-cover" />
                ) : (
                  <GroupIcon />
                )}
              </div>

              {/* Title container - ensures it stays on one line nicely */}
              <div className="flex-1 min-w-0">
                 {editing ? (
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-xl sm:text-2xl font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Group Name"
                    />
                 ) : (
                   <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                     {group.name}
                   </h1>
                 )}
                 
                 {/* Member count directly under name */}
                 {!editing && (
                   <div className="flex items-center gap-3 mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1"><MembersIcon /> {memberCount} members</span>
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-xs font-medium">
                        {group.privacy === 'private' ? 'Private' : 'Public'}
                      </span>
                   </div>
                 )}
              </div>
            </div>

            {/* Right Side: Action Buttons and 3-Dot Menu */}
            {!editing && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Desktop view primary actions (Share/Post) can go here if space permits, 
                    but sticking to your request: Share/Post below, Menu here */}
                
                {(canEdit || canDelete) && (
                  <div className="relative" ref={menuRef}>
                    <button 
                      onClick={() => setShowMenu(!showMenu)} 
                      className="p-2 -mr-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                      aria-label="Group options"
                    >
                      <DotsVerticalIcon />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {showMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden z-20">
                        {canEdit && (
                          <button 
                            onClick={handleStartEdit} 
                            className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            <PencilIcon /> Edit Group
                          </button>
                        )}
                        {canDelete && (
                          <button 
                            onClick={handleDeleteGroup} 
                            className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <TrashIcon /> Delete Group
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons Row (Share / Post) */}
          {!editing && isMember && (
              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                  <button 
                      onClick={() => setShowInvite(!showInvite)} 
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors text-sm"
                  >
                    <ShareIcon /> Share
                  </button>
                  <Link 
                      href={`/community/groups/${groupId}/post/create`} 
                      className="flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm text-sm"
                  >
                    <PlusIcon /> Post
                  </Link>
              </div>
          )}

          {!editing && !isMember && (
             <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-end">
                 <button onClick={handleJoin} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm text-sm">
                    Join Group
                 </button>
             </div>
          )}

          {/* Invite Link Display */}
          {showInvite && !editing && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-gray-200 dark:border-slate-700">
              <code className="text-xs text-gray-700 dark:text-gray-300 break-all bg-white dark:bg-slate-800 px-2 py-1 rounded border border-gray-300 dark:border-slate-600 w-full sm:w-auto overflow-x-auto">
                  {`https://quickshoppro.vercel.app/community/groups/join?invite=${group.inviteCode}`}
              </code>
              <button onClick={copyInviteLink} className="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors flex-shrink-0">
                <CopyIcon /> Copy
              </button>
            </div>
          )}

          {/* Edit Form Area */}
          {editing && (
            <div className="mt-4 border-t border-gray-200 dark:border-slate-700 pt-4">
              <div className="flex gap-1 mb-3 flex-wrap bg-gray-50 dark:bg-slate-900 p-2 rounded-lg border border-gray-200 dark:border-slate-700">
                <button type="button" onClick={() => handleToolbar('bold')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"><BoldIcon /></button>
                <button type="button" onClick={() => handleToolbar('italic')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"><ItalicIcon /></button>
                <button type="button" onClick={() => handleToolbar('underline')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"><UnderlineIcon /></button>
                <button type="button" onClick={() => handleToolbar('insertUnorderedList')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"><ListIcon /></button>
                <button type="button" onClick={handleEmoji} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"><EmojiIcon /></button>
              </div>
              <div
                ref={editDescRef}
                contentEditable
                className="w-full min-h-[150px] p-4 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg outline-none text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 overflow-y-auto"
                style={{ whiteSpace: 'pre-wrap' }}
              />
              <div className="flex gap-2 justify-end mt-4">
                <button onClick={() => setEditing(false)} className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">Cancel</button>
                <button onClick={handleSaveEdit} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm">Save Changes</button>
              </div>
            </div>
          )}

          {/* Group Description Area (View Mode) */}
          {!editing && group.description && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 w-full">
              <div className="relative flex flex-col">
                
                {/* Description Container */}
                <div 
                    className={`
                        prose max-w-none text-sm break-words w-full
                        text-gray-800 dark:text-gray-200 
                        prose-a:text-blue-600 dark:prose-a:text-blue-400
                        prose-strong:text-gray-900 dark:prose-strong:text-white
                        ${!showFullDescription ? 'line-clamp-4' : ''}
                    `} 
                >
                   <div dangerouslySetInnerHTML={{ __html: group.description }} />
                </div>

                {/* Read More Button Container - Flex aligned to right */}
                {group.description.replace(/<[^>]*>/g, '').length > 150 && (
                  <div className="flex justify-end mt-2 w-full">
                      <button
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-md transition-colors"
                      >
                          {showFullDescription ? 'Show Less' : 'Read More...'}
                      </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {posts.length === 0 && <p className="text-center text-gray-500 py-12">No posts yet. Be the first to share!</p>}
        <div className="space-y-4 w-full">
          {posts.map(post => {
            const renderWithMentions = (text) => {
              if (!text) return "";
              return text.replace(/@([a-zA-Z0-9_.]+)/g, '<span class="text-blue-600 dark:text-blue-400 font-medium">@$1</span>');
            };
            return (
              <div key={post.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 w-full overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-medium text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">{post.authorName}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(post.createdAt?.toDate()).toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 ml-2">
                    <button onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: 'Check this post', url: `${window.location.origin}/community/groups/${groupId}?post=${post.id}` }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(`${window.location.origin}/community/groups/${groupId}?post=${post.id}`);
                        toast.success("Post link copied!");
                      }
                    }} className="text-gray-400 hover:text-blue-600 p-1"><ShareIcon /></button>
                    {user && (user.uid === post.authorId || user.isAdmin) && (
                      <button onClick={async () => {
                        if (confirm("Delete post?")) {
                          await updateDoc(doc(db, "posts", post.id), { isDeleted: true });
                          setPosts(posts.filter(p => p.id !== post.id));
                          toast.success("Post deleted");
                        }
                      }} className="text-gray-400 hover:text-red-500 p-1"><TrashIcon /></button>
                    )}
                  </div>
                </div>
                <div className="prose max-w-none text-sm text-gray-800 dark:text-gray-200 break-words w-full" dangerouslySetInnerHTML={{ __html: renderWithMentions(post.text) }} />
                {post.imageUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-900 flex justify-center">
                       <img src={post.imageUrl} alt="Post attachment" className="max-h-96 object-contain w-full h-auto" loading="lazy" />
                    </div>
                )}
                {post.videoId && <YouTubeEmbed videoId={post.videoId} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
