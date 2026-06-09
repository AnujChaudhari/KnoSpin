"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

/* ────── Premium SVG Icons ────── */
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

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 300);
  const isFilterApplied = cityFilter !== "" || stateFilter !== "" || search !== "";

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

  const cities = useMemo(() => [...new Set(groups.map(g => g.city).filter(Boolean))], [groups]);
  const states = useMemo(() => [...new Set(groups.map(g => g.state).filter(Boolean))], [groups]);

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-white">Community Groups 👥</h1>
        {user && (
          <Link
            href="/community/groups/create"
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-5 rounded-xl inline-flex items-center gap-2 transition active:scale-95"
          >
            <PlusIcon /> Create Group
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search groups..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-xl py-3 pl-10 pr-10 outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Search groups"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              aria-label="Clear search"
            >
              <XIcon />
            </button>
          )}
        </div>
        <select
          value={cityFilter}
          onChange={e => setCityFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-xl py-3 px-4 outline-none sm:w-44"
          aria-label="Filter by city"
        >
          <option value="">All Cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={stateFilter}
          onChange={e => setStateFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-xl py-3 px-4 outline-none sm:w-44"
          aria-label="Filter by state"
        >
          <option value="">All States</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isFilterApplied && (
        <div className="flex justify-end mb-4">
          <button onClick={clearFilters} className="text-sm text-primary-400 hover:underline flex items-center gap-1">
            <XIcon className="w-3 h-3" /> Clear all filters
          </button>
        </div>
      )}

      <div className="mb-4 text-sm text-gray-400">
        {loading ? "Loading..." : `${filteredGroups.length} group${filteredGroups.length === 1 ? "" : "s"} found`}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-20 bg-gray-800 rounded-2xl">
          <GroupIcon className="w-16 h-16 mx-auto text-gray-600" />
          <p className="text-gray-400 mt-4">
            {isFilterApplied ? "No groups match your filters." : "No groups yet."}
          </p>
          {user && !isFilterApplied && (
            <Link href="/community/groups/create" className="mt-4 inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-5 rounded-xl transition active:scale-95">
              <PlusIcon /> Create the first group
            </Link>
          )}
          {!user && !isFilterApplied && (
            <p className="text-gray-500 text-sm mt-2">Login to create a group.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGroups.map(group => (
            <Link
              key={group.id}
              href={`/community/groups/${group.id}`}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-primary-500 transition-all duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center text-primary-400 flex-shrink-0 overflow-hidden">
                  {group.iconUrl ? (
                    <img src={group.iconUrl} alt={group.name} className="w-full h-full object-cover" />
                  ) : (
                    <GroupIcon className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-lg text-white line-clamp-1">{group.name}</h3>
                  {group.description && (
                    <p className="text-sm text-gray-400 line-clamp-2 mt-1">{group.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
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
      )}
    </div>
  );
}
