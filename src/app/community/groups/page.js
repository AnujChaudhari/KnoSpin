"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

/* ────── Premium SVG Icons (complete) ────── */
const GroupIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const MapPinIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const SearchIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const PlusIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const LockIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const GlobeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <ellipse cx="12" cy="12" rx="4" ry="10" />
    <path d="M2 12h20" />
  </svg>
);

const XIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const UsersIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <path d="M20 8v6" />
    <path d="M23 11h-6" />
  </svg>
);

const FilterIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
    <polygon points="22 3 2 3 10 13 10 21 14 18 14 13 22 3" />
  </svg>
);

const ChevronDownIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* ────── Debounce Hook ────── */
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/* ────── Main Component ────── */
export default function GroupsPage() {
  const { user } = useAuth();
  const [allGroups, setAllGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [privacyFilter, setPrivacyFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebounce(search, 300);
  const isFilterApplied = cityFilter !== "" || stateFilter !== "" || privacyFilter !== "" || search !== "";

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const snap = await getDocs(collection(db, "groups"));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAllGroups(list);
      } catch (err) {
        console.error("Failed to fetch groups:", err);
        setError("Failed to load groups. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  // Filter & sort
  const filteredGroups = useMemo(() => {
    let result = [...allGroups];
    if (debouncedSearch) {
      result = result.filter(g =>
        g.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        g.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }
    if (cityFilter) result = result.filter(g => g.city === cityFilter);
    if (stateFilter) result = result.filter(g => g.state === stateFilter);
    if (privacyFilter) result = result.filter(g => g.privacy === privacyFilter);

    result.sort((a, b) => {
      switch (sortBy) {
        case "newest": return (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0);
        case "oldest": return (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0);
        case "name_asc": return (a.name || "").localeCompare(b.name || "");
        case "name_desc": return (b.name || "").localeCompare(a.name || "");
        default: return 0;
      }
    });
    return result;
  }, [allGroups, debouncedSearch, cityFilter, stateFilter, privacyFilter, sortBy]);

  const clearFilters = useCallback(() => {
    setSearch(""); setCityFilter(""); setStateFilter(""); setPrivacyFilter(""); setSortBy("newest");
  }, []);

  const cities = useMemo(() => [...new Set(allGroups.map(g => g.city).filter(Boolean))].sort(), [allGroups]);
  const states = useMemo(() => [...new Set(allGroups.map(g => g.state).filter(Boolean))].sort(), [allGroups]);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">

        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Community Groups 👥</h1>
            <p className="text-gray-400 text-sm mt-1">Connect, share, and grow together</p>
          </div>
          {user && (
            <Link href="/community/groups/create" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-5 rounded-xl inline-flex items-center gap-2 transition active:scale-95">
              <PlusIcon /> Create Group
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
          <input
            type="text"
            placeholder="Search groups..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-gray-800 text-white placeholder-gray-500 rounded-2xl py-3.5 pl-12 pr-12 outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
              <XIcon />
            </button>
          )}
        </div>

        {/* Filters toggle & sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-xl text-gray-300 hover:text-white transition">
            <FilterIcon /> Filters <ChevronDownIcon className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
          <div className="flex items-center gap-2">
            {isFilterApplied && (
              <button onClick={clearFilters} className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
                <XIcon className="w-3 h-3" /> Clear
              </button>
            )}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-[#0a0a0a] border border-gray-800 text-white rounded-xl py-2 px-3 text-sm outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name_asc">A to Z</option>
              <option value="name_desc">Z to A</option>
            </select>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-[#050505] border border-gray-800 rounded-2xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">State</label>
              <select value={stateFilter} onChange={e => { setStateFilter(e.target.value); setCityFilter(""); }} className="w-full bg-[#0a0a0a] border border-gray-800 text-white rounded-xl py-2.5 px-3 outline-none focus:ring-1 focus:ring-primary-500">
                <option value="">All States</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">City</label>
              <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} disabled={!stateFilter} className="w-full bg-[#0a0a0a] border border-gray-800 text-white rounded-xl py-2.5 px-3 outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50">
                <option value="">All Cities</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Privacy</label>
              <select value={privacyFilter} onChange={e => setPrivacyFilter(e.target.value)} className="w-full bg-[#0a0a0a] border border-gray-800 text-white rounded-xl py-2.5 px-3 outline-none focus:ring-1 focus:ring-primary-500">
                <option value="">All</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="mb-4 text-sm text-gray-400">{loading ? "Loading..." : `${filteredGroups.length} group${filteredGroups.length === 1 ? "" : "s"} found`}</div>

        {/* Loading / Error / Empty / Grid */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
        ) : error ? (
          <div className="text-center py-12"><p className="text-red-400 mb-4">{error}</p><button onClick={() => window.location.reload()} className="bg-primary-600 text-white py-2 px-4 rounded-xl">Try Again</button></div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-20 bg-[#050505] rounded-3xl border border-gray-800">
            <GroupIcon className="w-16 h-16 mx-auto text-gray-700" />
            <p className="text-gray-400 mt-4">{isFilterApplied ? "No groups match your filters." : "No groups yet."}</p>
            {user && !isFilterApplied && (
              <Link href="/community/groups/create" className="mt-4 inline-flex items-center gap-2 bg-primary-600 text-white font-semibold py-2.5 px-5 rounded-xl transition active:scale-95">
                <PlusIcon /> Create First Group
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map(group => (
              <Link key={group.id} href={`/community/groups/${group.id}`} className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-5 hover:border-primary-500/50 transition-all hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center text-primary-400 flex-shrink-0">
                    <GroupIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-bold text-white text-lg line-clamp-1">{group.name}</h3>
                    {group.description && <p className="text-sm text-gray-400 line-clamp-2 mt-1">{group.description.replace(/<[^>]*>/g, "").slice(0, 100)}</p>}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
                      {(group.city || group.state) && (
                        <span className="flex items-center gap-1"><MapPinIcon className="w-3 h-3" /> {[group.city, group.state].filter(Boolean).join(", ")}</span>
                      )}
                      <span className="flex items-center gap-1 capitalize">{group.privacy === 'private' ? <LockIcon className="w-3 h-3" /> : <GlobeIcon className="w-3 h-3" />}{group.privacy}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
