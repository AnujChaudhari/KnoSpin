"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import Link from "next/link";
import { toast } from "react-hot-toast";

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
      {products.map(p => (
        <div key={p.id} className="card flex justify-between items-center mb-2">
          <div>
            <h4 className="font-semibold">{p.name}</h4>
            <p>₹{p.price} | Stock: {p.stock || 0}</p>
          </div>
          <button onClick={() => deleteProduct(p.id)} className="text-red-500">🗑️</button>
        </div>
      ))}
    </div>
  );
}
