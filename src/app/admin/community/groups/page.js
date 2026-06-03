"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { HiSearch } from "react-icons/hi";
import Link from "next/link";

/* ────── SVG Icons ────── */
const DeleteIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const GroupIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const MembersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" />
    <path d="M20 8v6" /><path d="M23 11h-6" />
  </svg>
);

export default function AdminCommunityGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");

  const fetchGroups = async () => {
    const snap = await getDocs(collection(db, "groups"));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
    setGroups(list);
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleDelete = async (groupId) => {
    if (confirm("Are you sure you want to delete this group?")) {
      await deleteDoc(doc(db, "groups", groupId));
      toast.success("Group deleted");
      fetchGroups();
    }
  };

  const filtered = groups.filter(g => g.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-0">
      <h2 className="text-2xl font-bold mb-4">Community Groups Management</h2>
      <div className="relative mb-4">
        <span className="absolute left-3 top-3 text-gray-400"><HiSearch /></span>
        <input placeholder="Search groups..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
      </div>
      <div className="space-y-3">
        {filtered.map(group => (
          <div key={group.id} className="card flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                <GroupIcon />
              </div>
              <div>
                <h4 className="font-bold">{group.name}</h4>
                <p className="text-xs text-gray-500">Created by: {group.createdBy?.slice(0,8)} | {group.privacy}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Members button – new */}
              <Link
                href={`/admin/community/groups/${group.id}/members`}
                className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg hover:bg-blue-200 flex items-center gap-1"
                title="Manage Members"
              >
                <MembersIcon />
                <span className="text-xs">Members</span>
              </Link>
              {/* Delete button */}
              <button onClick={() => handleDelete(group.id)} className="p-2 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-lg">
                <DeleteIcon />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
