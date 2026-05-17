"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { HiPencil, HiTrash } from "react-icons/hi";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
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
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Products</h2>
        <Link href="/admin/products/add" className="btn-gradient">Add Product</Link>
      </div>
      <div className="space-y-3">
        {products.map(p => (
          <div key={p.id} className="card flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img src={p.images?.[0] || "/placeholder.jpg"} className="w-16 h-16 object-cover rounded-lg" />
              <div>
                <h4 className="font-semibold">{p.name}</h4>
                <p className="text-primary-600">₹{p.price} | Stock: {p.stock || 0}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/products/edit/${p.id}`} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><HiPencil /></Link>
              <button onClick={() => deleteProduct(p.id)} className="p-2 bg-red-100 text-red-500 rounded-lg"><HiTrash /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
