"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

/* ────── Premium SVG Icons (with accessibility) ────── */
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

/* ────── Custom Hook: Debounce ────── */
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/* ────── Skeleton Loader Component ────── */
const GroupCardSkeleton = () => (
  <div className="card animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="flex gap-3 mt-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </div>
      </div>
    </div>
  </div>
);

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  
  const debouncedSearch = useDebounce(search, 300);
  const isFilterApplied = cityFilter !== "" || stateFilter !== "" || search !== "";

  // Fetch groups once
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const snap = await getDocs(collection(db, "groups"));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setGroups(list);
      } catch (error) {
        console.error("Failed to fetch groups:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  // Memoized filter options
  const cities = useMemo(() => [...new Set(groups.map(g => g.city).filter(Boolean))], [groups]);
  const states = useMemo(() => [...new Set(groups.map(g => g.state).filter(Boolean))], [groups]);

  // Memoized filtered groups
  const filteredGroups = useMemo(() => {
    return groups.filter(g => {
      const matchSearch = debouncedSearch === "" ||
        g.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        g.description?.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchCity = cityFilter ? g.city === cityFilter : true;
      const matchState = stateFilter ? g.state === stateFilter : true;
      return matchSearch && matchCity && matchState;
    });
  }, [groups, debouncedSearch, cityFilter, stateFilter]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setCityFilter("");
    setStateFilter("");
  }, []);

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="h-9 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-grow h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="sm:w-40 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="sm:w-40 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <GroupCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          Community Groups 👥
        </h1>
        {user && (
          <Link
            href="/community/groups/create"
            className="btn-gradient flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-transform active:scale-95"
          >
            <PlusIcon /> Create Group
          </Link>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search groups by name or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 pr-10 w-full"
            aria-label="Search groups"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Clear search"
            >
              <XIcon />
            </button>
          )}
        </div>
        <select
          value={cityFilter}
          onChange={e => setCityFilter(e.target.value)}
          className="input-field sm:w-44"
          aria-label="Filter by city"
        >
          <option value="">All Cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={stateFilter}
          onChange={e => setStateFilter(e.target.value)}
          className="input-field sm:w-44"
          aria-label="Filter by state"
        >
          <option value="">All States</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Active filters indicator + clear button */}
      {isFilterApplied && (
        <div className="flex justify-end mb-4">
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            <XIcon className="w-3 h-3" /> Clear all filters
          </button>
        </div>
      )}

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {filteredGroups.length} {filteredGroups.length === 1 ? "group" : "groups"} found
      </div>

      {/* Empty state */}
      {filteredGroups.length === 0 && (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/30 rounded-2xl">
          <GroupIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 mt-4">
            {isFilterApplied ? "No groups match your filters." : "No groups yet."}
          </p>
          {user && !isFilterApplied && (
            <Link href="/community/groups/create" className="btn-gradient inline-flex mt-4">
              <PlusIcon /> Create the first group
            </Link>
          )}
          {!user && !isFilterApplied && (
            <p className="text-gray-400 text-sm mt-2">Login to create a group.</p>
          )}
        </div>
      )}

      {/* Groups grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGroups.map(group => (
          <Link
            key={group.id}
            href={`/community/groups/${group.id}`}
            className="card group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 flex-shrink-0 overflow-hidden">
                {group.iconUrl ? (
                  <img src={group.iconUrl} alt={group.name} className="w-full h-full object-cover" />
                ) : (
                  <GroupIcon className="w-6 h-6" />
                )}
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">
                  {group.name}
                </h3>
                <div
                  className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 prose dark:prose-invert max-w-none mt-1"
                  dangerouslySetInnerHTML={{ __html: group.description || "" }}
                />
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-400 dark:text-gray-500">
                  {(group.city || group.state) && (
                    <span className="flex items-center gap-1">
                      <MapPinIcon /> {[group.city, group.state].filter(Boolean).join(", ")}
                    </span>
                  )}
                  <span className="flex items-center gap-1 capitalize">
                    {group.privacy === 'private' ? <LockIcon /> : <GlobeIcon />}
                    {group.privacy}
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
