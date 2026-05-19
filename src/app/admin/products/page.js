"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { HiPencil, HiTrash, HiPlus } from "react-icons/hi";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");  // <-- सही जगह

  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchProducts(); }, []);

  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
    toast.success("Deleted");
    fetchProducts();
  };

  // फ़िल्टर – कोड या नाम से खोजें
  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.productCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <Link href="/admin/products/add" className="btn-gradient flex items-center gap-2">
          <HiPlus /> Add Product
        </Link>
      </div>

      {/* सर्च इनपुट */}
      <input
        placeholder="Search by code or name"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="input-field mb-4"
      />

      {filtered.length === 0 && <p>No products yet. Click "Add Product" to create one.</p>}
      <div className="space-y-3">
        {filtered.map(p => (
          <div key={p.id} className="card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <img src={p.images?.[0] || "/placeholder.jpg"} className="w-16 h-16 object-cover rounded-lg" />
              <div>
                <h4 className="font-semibold">{p.name}</h4>
                <p className="text-xs text-gray-500">Code: {p.productCode || "N/A"}</p>
                <p className="text-primary-600">₹{p.price} | Stock: {p.stock || 0}</p>
              </div>
            </div>
            <div className="flex gap-2 self-end sm:self-auto">
              <Link href={`/admin/products/edit/${p.id}`} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><HiPencil /></Link>
              <button onClick={() => deleteProduct(p.id)} className="p-2 bg-red-100 text-red-500 rounded-lg"><HiTrash /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
