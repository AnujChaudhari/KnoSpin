"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

/* ────── Premium SVG Icons ────── */
const GroupIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const MapPinIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const SearchIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const PlusIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const LockIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const GlobeIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const XIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChevronDownIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* ────── Custom Hook: Debounce ────── */
function useDebounce(value: string, delay: number = 300): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/* ────── Types ────── */
interface DistrictData {
  state: string;
  districts: string[];
}

interface Group {
  id: string;
  name: string;
  description?: string;
  city?: string;
  state?: string;
  privacy?: string;
  iconUrl?: string;
  createdAt?: { toMillis: () => number };
}

/* ────── Skeleton Loader Component ────── */
const GroupCardSkeleton = () => (
  <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-3xl p-5 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex-shrink-0" />
      <div className="flex-1 space-y-3 py-1">
        <div className="h-4 bg-gray-200 dark:bg-white/10 rounded-md w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-md w-full" />
        <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-md w-2/3" />
        <div className="flex gap-2 mt-3">
          <div className="h-6 w-20 bg-gray-100 dark:bg-white/5 rounded-full" />
          <div className="h-6 w-16 bg-gray-100 dark:bg-white/5 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  
  const debouncedSearch = useDebounce(search, 300);
  const isFilterApplied = cityFilter !== "" || stateFilter !== "" || search !== "";

  // ========== NEW: Location Data from Public JSON ==========
  const [locationData, setLocationData] = useState<DistrictData[]>([]);
  const [statesList, setStatesList] = useState<string[]>([]);
  const [citiesByState, setCitiesByState] = useState<Record<string, string[]>>({});
  const [loadingLocation, setLoadingLocation] = useState(true);

  // Step 1: Fetch States & Districts JSON from public folder
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        // यह आपके public फोल्डर से JSON लोड करेगा
        const response = await fetch("/states-and-districts.json");
        const result = await response.json();
        
        // JSON structure: { states: [{ state: "Uttar Pradesh", districts: [...] }] }
        const statesArray = result.states || result;
        
        setLocationData(statesArray);
        
        // Extract unique states
        const states = statesArray.map((item: DistrictData) => item.state);
        setStatesList(states);
        
        // Create a lookup map: state -> districts
        const cityMap: Record<string, string[]> = {};
        statesArray.forEach((item: DistrictData) => {
          cityMap[item.state] = item.districts;
        });
        setCitiesByState(cityMap);
        
        setLoadingLocation(false);
      } catch (error) {
        console.error("Error loading states/districts JSON:", error);
        setLoadingLocation(false);
      }
    };
    
    fetchLocationData();
  }, []);

  // Step 2: Fetch groups from Firebase
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const snap = await getDocs(collection(db, "groups"));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Group));
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

  // Memoized filter options - from groups only (existing data)
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

  // ========== NEW: Get Districts based on selected State ==========
  const getDistrictsForState = (stateName: string): string[] => {
    return citiesByState[stateName] || [];
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-10 min-h-screen">
        <div className="h-8 w-40 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse mb-6" />
        <div className="h-14 w-full bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse mb-6" />
        <div className="flex gap-3 mb-8">
          <div className="h-10 w-28 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
          <div className="h-10 w-28 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => <GroupCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-transparent pb-24 md:pb-10">
      
      {/* ===== STICKY MOBILE APP HEADER ===== */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 pt-6 pb-4 px-4 sm:px-6 mb-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Communities
            </h1>
            
            {/* Desktop Create Button */}
            {user && (
              <Link
                href="/community/groups/create"
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-sm transition-transform active:scale-95"
              >
                <PlusIcon className="w-5 h-5" /> Create
              </Link>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Find a group..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-100 dark:bg-white/5 border border-transparent focus:border-primary-500/30 focus:bg-white dark:focus:bg-[#111] text-gray-900 dark:text-white rounded-2xl py-3.5 pl-12 pr-12 outline-none transition-all placeholder:text-gray-500 font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-200 dark:bg-white/10 rounded-full p-1 transition-colors"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Scrollable Filters (Pills) */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar pb-1 [&::-webkit-scrollbar]:hidden">
            {/* City Filter */}
            <div className="relative flex-shrink-0">
              <select
                value={cityFilter}
                onChange={e => setCityFilter(e.target.value)}
                className={`appearance-none outline-none pl-4 pr-10 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  cityFilter 
                    ? "bg-primary-50 dark:bg-primary-500/10 border-primary-200 dark:border-primary-500/20 text-primary-700 dark:text-primary-400" 
                    : "bg-white dark:bg-[#111] border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300"
                }`}
              >
                <option value="">All Cities</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* State Filter */}
            <div className="relative flex-shrink-0">
              <select
                value={stateFilter}
                onChange={e => setStateFilter(e.target.value)}
                className={`appearance-none outline-none pl-4 pr-10 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  stateFilter 
                    ? "bg-primary-50 dark:bg-primary-500/10 border-primary-200 dark:border-primary-500/20 text-primary-700 dark:text-primary-400" 
                    : "bg-white dark:bg-[#111] border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300"
                }`}
              >
                <option value="">All States</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Clear Filters Badge */}
            {isFilterApplied && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 flex-shrink-0 px-3 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
              >
                <XIcon className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Results Info */}
        <p className="mb-4 text-sm font-medium text-gray-500 dark:text-gray-400 px-1">
          {filteredGroups.length} {filteredGroups.length === 1 ? "Community" : "Communities"}
        </p>

        {/* ===== EMPTY STATE ===== */}
        {filteredGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-white dark:bg-[#111] border border-dashed border-gray-200 dark:border-white/10 rounded-3xl mt-4">
            <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
              <GroupIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {isFilterApplied ? "No matches found" : "It's quiet here"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto mb-6">
              {isFilterApplied ? "Try adjusting your search or filters to find what you're looking for." : "There are no communities yet. Be the first to start one!"}
            </p>
            {user && !isFilterApplied && (
              <Link href="/community/groups/create" className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-sm transition-transform active:scale-95 flex items-center gap-2">
                <PlusIcon className="w-5 h-5" /> Create Community
              </Link>
            )}
          </div>
        )}

        {/* ===== GROUPS GRID ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredGroups.map(group => (
            <Link
              key={group.id}
              href={`/community/groups/${group.id}`}
              className="group bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-3xl p-5 hover:shadow-lg dark:hover:border-white/10 transition-all duration-300 active:scale-[0.98]"
            >
              <div className="flex gap-4">
                {/* Group Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-50 to-primary-100 dark:from-white/5 dark:to-white/10 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0 overflow-hidden shadow-inner border border-primary-100 dark:border-transparent">
                  {group.iconUrl ? (
                    <img src={group.iconUrl} alt={group.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <GroupIcon />
                  )}
                </div>
                
                {/* Group Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate tracking-tight mb-1">
                    {group.name}
                  </h3>
                  
                  <div
                    className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-snug [&_*]:!text-sm [&_*]:!text-gray-500 [&_*]:dark:!text-gray-400 [&_*]:!bg-transparent"
                    dangerouslySetInnerHTML={{ __html: group.description || "No description provided." }}
                  />
                  
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {(group.city || group.state) && (
                      <span className="flex items-center gap-1 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md text-[11px] font-semibold tracking-wide">
                        <MapPinIcon className="w-3 h-3" /> 
                        <span className="truncate max-w-[100px]">{[group.city, group.state].filter(Boolean).join(", ")}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md text-[11px] font-semibold capitalize tracking-wide">
                      {group.privacy === 'private' ? <LockIcon /> : <GlobeIcon />}
                      {group.privacy || "public"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ===== MOBILE FAB (Floating Action Button) ===== */}
      {user && (
        <div className="fixed bottom-6 right-4 md:hidden z-50">
          <Link
            href="/community/groups/create"
            className="flex items-center justify-center w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg shadow-primary-500/40 active:scale-90 transition-transform"
            aria-label="Create Group"
          >
            <PlusIcon className="w-7 h-7" />
          </Link>
        </div>
      )}
    </div>
  );
}
