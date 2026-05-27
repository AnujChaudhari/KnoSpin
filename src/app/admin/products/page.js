"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import Link from "next/link";
import { toast } from "react-hot-toast";

// SVG Icons Components
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const DigitalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M12 18v-6" />
    <path d="M9 15l3-3 3 3" />
  </svg>
);

const PhysicalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.29 7 12 12 20.71 7" />
    <line x1="12" y1="22" x2="12" y2="12" />
  </svg>
);

const StockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, digital, physical
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, price-high, price-low, name

  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchProducts(); }, []);

  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      await deleteDoc(doc(db, "products", id));
      toast.success("Product deleted successfully");
      fetchProducts();
    }
  };

  // Filter by type
  let filtered = products;
  if (filterType === "digital") {
    filtered = filtered.filter(p => p.isDigital === true);
  } else if (filterType === "physical") {
    filtered = filtered.filter(p => !p.isDigital);
  }

  // Search filter
  filtered = filtered.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.productCode?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  // Sort
  if (sortBy === "oldest") {
    filtered = [...filtered].sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
  } else if (sortBy === "price-high") {
    filtered = [...filtered].sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sortBy === "price-low") {
    filtered = [...filtered].sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sortBy === "name") {
    filtered = [...filtered].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  } else {
    // newest default
    filtered = [...filtered].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }

  // Stats
  const totalProducts = products.length;
  const digitalCount = products.filter(p => p.isDigital).length;
  const physicalCount = products.filter(p => !p.isDigital).length;
  const outOfStock = products.filter(p => p.stock === 0 && !p.isDigital).length;

  // Digital category labels
  const digitalCategoryLabels = {
    pdf: "PDF",
    zip: "ZIP",
    course: "Course",
    template: "Template",
    notes: "Notes",
    ai_prompt: "AI Prompt",
    ebook: "eBook",
  };

  return (
    <div className="p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Products Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage all physical and digital products</p>
        </div>
        <Link href="/admin/products/add" className="btn-gradient flex items-center gap-2 whitespace-nowrap">
          <PlusIcon /> Add New Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card text-center py-3">
          <p className="text-2xl font-bold">{totalProducts}</p>
          <p className="text-xs text-gray-500">Total Products</p>
        </div>
        <div className="card text-center py-3 border-l-4 border-purple-500">
          <p className="text-2xl font-bold text-purple-600">{digitalCount}</p>
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <DigitalIcon /> Digital
          </p>
        </div>
        <div className="card text-center py-3 border-l-4 border-blue-500">
          <p className="text-2xl font-bold text-blue-600">{physicalCount}</p>
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <PhysicalIcon /> Physical
          </p>
        </div>
        <div className="card text-center py-3 border-l-4 border-red-500">
          <p className="text-2xl font-bold text-red-600">{outOfStock}</p>
          <p className="text-xs text-gray-500">Out of Stock</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-grow">
          <span className="absolute left-3 top-3">
            <SearchIcon />
          </span>
          <input
            placeholder="Search by name, code, or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All Products</option>
            <option value="digital">Digital Only</option>
            <option value="physical">Physical Only</option>
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="input-field w-auto"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-high">Price: High to Low</option>
            <option value="price-low">Price: Low to High</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-3">
        Showing {filtered.length} of {totalProducts} products
        {filterType !== "all" && ` (filtered by ${filterType})`}
      </p>

      {/* Product List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          <p className="text-gray-500 text-lg">No products found</p>
          <p className="text-gray-400 text-sm mt-1">
            {search ? "Try different search terms" : "Click 'Add New Product' to create your first product"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <div
              key={p.id}
              className={`card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-lg transition-shadow ${
                p.isDigital ? "border-l-4 border-purple-500" : ""
              }`}
            >
              <div className="flex items-center gap-4 flex-grow">
                {/* Product Image */}
                <div className="relative flex-shrink-0">
                  <img
                    src={p.images?.[0] || "/placeholder.jpg"}
                    alt={p.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  {/* Type Badge */}
                  <span
                    className={`absolute -top-2 -right-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.isDigital
                        ? "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-300"
                        : "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-300"
                    }`}
                  >
                    {p.isDigital ? "Digital" : "Physical"}
                  </span>
                </div>

                {/* Product Info */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-lg truncate">{p.name}</h4>
                    {p.isDigital && (
                      <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <DigitalIcon />
                        {digitalCategoryLabels[p.digitalCategory] || "Digital"}
                      </span>
                    )}
                    {p.featured && (
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                        ★ Featured
                      </span>
                    )}
                    {p.onSale && (
                      <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-0.5 rounded-full">
                        Sale
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    Code: <span className="font-mono font-medium">{p.productCode || "N/A"}</span>
                    {p.category && <span className="ml-3">📂 {p.category}</span>}
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-primary-600 font-bold text-lg">₹{p.price}</span>
                    {p.originalPrice && p.originalPrice > p.price && (
                      <span className="text-gray-400 line-through text-xs">₹{p.originalPrice}</span>
                    )}
                    {p.discountPercentage > 0 && (
                      <span className="text-green-600 text-xs font-medium bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                        {p.discountPercentage}% off
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    {!p.isDigital ? (
                      <span className="flex items-center gap-1">
                        <StockIcon />
                        Stock: <span className={p.stock === 0 ? "text-red-500 font-bold" : "font-medium"}>{p.stock || 0}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-purple-500">
                        <DigitalIcon />
                        Downloads limit: {p.downloadLimit || 5}
                      </span>
                    )}
                    {p.isDigital && p.digitalFileName && (
                      <span className="text-gray-400 truncate max-w-[150px]" title={p.digitalFileName}>
                        📎 {p.digitalFileName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                <Link
                  href={`/admin/products/edit/${p.id}`}
                  className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors group"
                  title="Edit Product"
                >
                  <EditIcon />
                </Link>
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  title="Delete Product"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
