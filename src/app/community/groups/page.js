"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
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

const MapPinIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <ellipse cx="12" cy="12" rx="4" ry="10" />
    <path d="M2 12h20" />
  </svg>
);

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      const snap = await getDocs(collection(db, "groups"));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setGroups(list);
      setLoading(false);
    };
    fetchGroups();
  }, []);

  const cities = [...new Set(groups.map(g => g.city).filter(Boolean))];
  const states = [...new Set(groups.map(g => g.state).filter(Boolean))];

  const filtered = groups.filter(g => {
    const matchSearch = g.name?.toLowerCase().includes(search.toLowerCase()) ||
                        g.description?.toLowerCase().includes(search.toLowerCase());
    const matchCity = cityFilter ? g.city === cityFilter : true;
    const matchState = stateFilter ? g.state === stateFilter : true;
    return matchSearch && matchCity && matchState;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Community Groups 👥</h1>
        {user && (
          <Link href="/community/groups/create" className="btn-gradient flex items-center gap-2">
            <PlusIcon /> Create Group
          </Link>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <span className="absolute left-3 top-3 text-gray-400"><SearchIcon /></span>
          <input
            type="text"
            placeholder="Search groups..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="input-field sm:w-40">
          <option value="">All Cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} className="input-field sm:w-40">
          <option value="">All States</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <GroupIcon />
          <p className="text-gray-500 mt-4">No groups found. {user ? "Create one!" : "Login to create groups."}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(group => (
          <Link key={group.id} href={`/community/groups/${group.id}`} className="card group hover:shadow-lg transition">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 flex-shrink-0 overflow-hidden">
                {group.iconUrl ? (
                  <img src={group.iconUrl} alt={group.name} className="w-full h-full object-cover" />
                ) : (
                  <GroupIcon />
                )}
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-lg">{group.name}</h3>
                <div
                  className="text-sm text-gray-500 line-clamp-2 prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: group.description || "" }}
                />
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  {group.city && <span className="flex items-center gap-1"><MapPinIcon /> {group.city}, {group.state}</span>}
                  <span className="flex items-center gap-1">
                    {group.privacy === 'private' ? <LockIcon /> : <GlobeIcon />}
                    {group.privacy === 'private' ? 'Private' : 'Public'}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
