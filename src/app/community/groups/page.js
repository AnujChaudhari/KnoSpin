"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, startAfter, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";

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

/* ────── Types ────── */
interface Group {
  id: string;
  name: string;
  description?: string;
  city?: string;
  state?: string;
  privacy: string;
  category?: string;
  iconUrl?: string;
  createdBy: string;
  createdAt?: any;
  memberCount?: number;
}

type SortOption = "newest" | "oldest" | "name_asc" | "name_desc" | "members_desc";

/* ────── Custom Hooks ────── */
function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key]);
  
  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue];
}

/* ────── Main Component ────── */
export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [privacyFilter, setPrivacyFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [loading, setLoading] = useState(true);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>("recentGroupSearches", []);
  const [showFilters, setShowFilters] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebounce(search, 300);
  const isFilterApplied = cityFilter !== "" || stateFilter !== "" || categoryFilter !== "" || privacyFilter !== "" || search !== "";

  // Categories for filter
  const categories = [
    { value: "", label: "All Categories" },
    { value: "technology", label: "💻 Technology" },
    { value: "programming", label: "📝 Programming" },
    { value: "design", label: "🎨 Design" },
    { value: "business", label: "💼 Business" },
    { value: "education", label: "📚 Education" },
    { value: "health", label: "💪 Health & Fitness" },
    { value: "gaming", label: "🎮 Gaming" },
    { value: "music", label: "🎵 Music" },
    { value: "art", label: "🎭 Art & Culture" },
    { value: "general", label: "📌 General" },
  ];

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const snap = await getDocs(collection(db, "groups"));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Group));
        
        // Fetch member counts for each group
        const counts: Record<string, number> = {};
        await Promise.all(
          list.map(async (group) => {
            const membersSnap = await getDocs(collection(db, "groups", group.id, "members"));
            counts[group.id] = membersSnap.size;
          })
        );
        
        setMemberCounts(counts);
        setAllGroups(list);
        setGroups(list);
      } catch (error) {
        console.error("Failed to fetch groups:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  // Generate search suggestions
  useEffect(() => {
    if (debouncedSearch.length > 1) {
      const suggestions = allGroups
        .filter(g => g.name?.toLowerCase().includes(debouncedSearch.toLowerCase()))
        .slice(0, 5)
        .map(g => g.name);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearch, allGroups]);

  // Get unique cities and states
  const cities = useMemo(() => {
    return [...new Set(allGroups.map(g => g.city).filter(Boolean))].sort();
  }, [allGroups]);
  
  const states = useMemo(() => {
    return [...new Set(allGroups.map(g => g.state).filter(Boolean))].sort();
  }, [allGroups]);

  // Filter and sort groups
  const filteredGroups = useMemo(() => {
    let result = [...allGroups];
    
    // Search filter
    if (debouncedSearch) {
      result = result.filter(g =>
        g.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        g.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }
    
    // City filter
    if (cityFilter) {
      result = result.filter(g => g.city === cityFilter);
    }
    
    // State filter
    if (stateFilter) {
      result = result.filter(g => g.state === stateFilter);
    }
    
    // Category filter
    if (categoryFilter) {
      result = result.filter(g => g.category === categoryFilter);
    }
    
    // Privacy filter
    if (privacyFilter) {
      result = result.filter(g => g.privacy === privacyFilter);
    }
    
    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
        case "oldest":
          return (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0);
        case "name_asc":
          return (a.name || "").localeCompare(b.name || "");
        case "name_desc":
          return (b.name || "").localeCompare(a.name || "");
        case "members_desc":
          return (memberCounts[b.id] || 0) - (memberCounts[a.id] || 0);
        default:
          return 0;
      }
    });
    
    return result;
  }, [allGroups, debouncedSearch, cityFilter, stateFilter, categoryFilter, privacyFilter, sortBy, memberCounts]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setCityFilter("");
    setStateFilter("");
    setCategoryFilter("");
    setPrivacyFilter("");
    setSortBy("newest");
    setShowSuggestions(false);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (search && !recentSearches.includes(search)) {
      const newSearches = [search, ...recentSearches].slice(0, 5);
      setRecentSearches(newSearches);
    }
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearch(suggestion);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const removeRecentSearch = (term: string) => {
    setRecentSearches(recentSearches.filter(t => t !== term));
  };

  // Get member count display
  const getMemberCount = (groupId: string) => {
    const count = memberCounts[groupId] || 0;
    return `${count} member${count === 1 ? "" : "s"}`;
  };

  // Get category icon
  const getCategoryIcon = (category?: string) => {
    const icons: Record<string, string> = {
      technology: "💻",
      programming: "📝",
      design: "🎨",
      business: "💼",
      education: "📚",
      health: "💪",
      gaming: "🎮",
      music: "🎵",
      art: "🎭",
    };
    return icons[category || ""] || "👥";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Community Groups
            </h1>
            <p className="text-gray-400 mt-1">Connect, share, and grow together</p>
          </div>
          {user && (
            <Link
              href="/community/groups/create"
              className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold py-3 px-6 rounded-xl inline-flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-primary-500/25"
            >
              <PlusIcon className="w-5 h-5" /> Create Group
            </Link>
          )}
        </div>

        {/* Search Bar with Suggestions */}
        <form onSubmit={handleSearchSubmit} className="relative mb-6">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search groups by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => search && setShowSuggestions(true)}
              className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-800 text-white placeholder-gray-500 rounded-2xl py-4 pl-12 pr-12 outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <XIcon />
              </button>
            )}
          </div>
          
          {/* Search Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-10 overflow-hidden">
              {searchSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors flex items-center gap-3 text-gray-300"
                >
                  <SearchIcon className="w-4 h-4 text-gray-500" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Recent Searches */}
        {recentSearches.length > 0 && !search && !loading && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs text-gray-500">Recent:</span>
            {recentSearches.map((term, idx) => (
              <button
                key={idx}
                onClick={() => setSearch(term)}
                className="px-3 py-1.5 bg-gray-800/50 hover:bg-gray-800 rounded-full text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
              >
                {term}
                <XIcon 
                  className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" 
                  onClick={(e) => { e.stopPropagation(); removeRecentSearch(term); }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Filter Toggle & Active Filters */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 rounded-xl text-gray-300 hover:text-white transition-colors"
          >
            <FilterIcon />
            Filters
            <ChevronDownIcon className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
          
          {isFilterApplied && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
            >
              <XIcon className="w-3 h-3" /> Clear all
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-2.5 px-3 outline-none focus:ring-1 focus:ring-primary-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Privacy</label>
              <select
                value={privacyFilter}
                onChange={(e) => setPrivacyFilter(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-2.5 px-3 outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">All</option>
                <option value="public">🌍 Public</option>
                <option value="private">🔒 Private</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">State</label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-2.5 px-3 outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">All States</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">City</label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                disabled={!stateFilter}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-2.5 px-3 outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
              >
                <option value="">All Cities</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {!stateFilter && <p className="text-xs text-gray-500 mt-1">Select state first</p>}
            </div>
          </div>
        )}

        {/* Sort Options */}
        <div className="flex justify-end mb-6">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-gray-900/50 border border-gray-800 text-white rounded-xl py-2 px-4 text-sm outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="newest">📅 Newest First</option>
            <option value="oldest">📅 Oldest First</option>
            <option value="members_desc">👥 Most Members</option>
            <option value="name_asc">🔤 A to Z</option>
            <option value="name_desc">🔤 Z to A</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="mb-6 pb-2 border-b border-gray-800">
          <p className="text-gray-400 text-sm">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                Loading groups...
              </span>
            ) : (
              `${filteredGroups.length} group${filteredGroups.length === 1 ? "" : "s"} found`
            )}
          </p>
        </div>

        {/* Active Filter Chips */}
        {isFilterApplied && (
          <div className="flex flex-wrap gap-2 mb-6">
            {search && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-500/20 text-primary-300 rounded-full text-sm">
                Search: "{search}"
                <button onClick={() => setSearch("")}><XIcon className="w-3 h-3" /></button>
              </span>
            )}
            {categoryFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-gray-300 rounded-full text-sm">
                {categories.find(c => c.value === categoryFilter)?.label}
                <button onClick={() => setCategoryFilter("")}><XIcon className="w-3 h-3" /></button>
              </span>
            )}
            {privacyFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-gray-300 rounded-full text-sm capitalize">
                {privacyFilter === "public" ? "🌍 Public" : "🔒 Private"}
                <button onClick={() => setPrivacyFilter("")}><XIcon className="w-3 h-3" /></button>
              </span>
            )}
            {stateFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-gray-300 rounded-full text-sm">
                📍 {stateFilter}{cityFilter ? `, ${cityFilter}` : ""}
                <button onClick={() => { setStateFilter(""); setCityFilter(""); }}><XIcon className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mb-4" />
            <p className="text-gray-400">Loading communities...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredGroups.length === 0 && (
          <div className="text-center py-20 bg-gray-900/30 rounded-3xl border border-gray-800">
            <GroupIcon className="w-20 h-20 mx-auto text-gray-700" />
            <p className="text-gray-400 mt-4 text-lg">
              {isFilterApplied ? "No groups match your filters." : "No groups yet."}
            </p>
            {user && !isFilterApplied && (
              <Link
                href="/community/groups/create"
                className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105"
              >
                <PlusIcon /> Create the first group
              </Link>
            )}
            {!user && !isFilterApplied && (
              <p className="text-gray-500 text-sm mt-2">Login to create a community.</p>
            )}
          </div>
        )}

        {/* Groups Grid */}
        {!loading && filteredGroups.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group, index) => (
              <Link
                key={group.id}
                href={`/community/groups/${group.id}`}
                className="group bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-2xl p-5 hover:border-primary-500/50 hover:bg-gray-900/60 transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-500 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Group Icon */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-600/30 to-primary-400/20 flex items-center justify-center text-primary-400 flex-shrink-0 overflow-hidden">
                    {group.iconUrl ? (
                      <Image 
                        src={group.iconUrl} 
                        alt={group.name} 
                        width={56} 
                        height={56} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">{getCategoryIcon(group.category)}</span>
                    )}
                  </div>
                  
                  {/* Group Info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-white text-lg line-clamp-1 group-hover:text-primary-400 transition-colors">
                        {group.name}
                      </h3>
                    </div>
                    
                    {group.description && (
                      <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                        {group.description.replace(/<[^>]*>/g, "").slice(0, 100)}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs text-gray-500">
                      {/* Location */}
                      {(group.city || group.state) && (
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="w-3 h-3" /> 
                          {[group.city, group.state].filter(Boolean).join(", ")}
                        </span>
                      )}
                      
                      {/* Privacy */}
                      <span className="flex items-center gap-1 capitalize">
                        {group.privacy === 'private' ? <LockIcon className="w-3 h-3" /> : <GlobeIcon className="w-3 h-3" />}
                        {group.privacy}
                      </span>
                      
                      {/* Members */}
                      <span className="flex items-center gap-1">
                        <UsersIcon className="w-3 h-3" />
                        {getMemberCount(group.id)}
                      </span>
                    </div>
                    
                    {/* Category Badge */}
                    {group.category && group.category !== "general" && (
                      <div className="mt-2">
                        <span className="text-xs px-2 py-0.5 bg-gray-800 rounded-full text-gray-400">
                          {categories.find(c => c.value === group.category)?.label || group.category}
                        </span>
                      </div>
                    )}
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
