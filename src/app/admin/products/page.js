"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { HiPencil, HiTrash } from "react-icons/hi";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

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

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href="/admin/products/add" className="btn-gradient">Add Product</Link>
      </div>
      <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="w-full p-3 border rounded-xl mb-4 dark:bg-gray-700" />
      <div className="space-y-3">
        {filtered.map(product => (
          <motion.div key={product.id} className="card flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img src={product.images[0]} className="w-16 h-16 object-cover rounded-lg" />
              <div>
                <h4 className="font-semibold">{product.name}</h4>
                <p className="text-primary-600">₹{product.price} | Stock: {product.stock || 0}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/products/edit/${product.id}`} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><HiPencil /></Link>
              <button onClick={() => deleteProduct(product.id)} className="p-2 bg-red-100 text-red-500 rounded-lg"><HiTrash /></button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}