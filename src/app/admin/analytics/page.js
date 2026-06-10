"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { HiTrendingUp, HiCurrencyRupee, HiShoppingBag, HiUsers, HiAcademicCap, HiUserGroup, HiCash } from "react-icons/hi";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const safeFetch = async (collName) => {
    try {
      const snap = await getDocs(collection(db, collName));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn(`Failed to fetch ${collName}:`, err);
      return []; // गिरने पर खाली ऐरे लौटाएँ
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [orders, products, users, categories, referrals, courses, enrollments, walletTxns, groups, posts] = await Promise.all([
        safeFetch("orders"), safeFetch("products"), safeFetch("users"),
        safeFetch("categories"), safeFetch("referrals"), safeFetch("courses"),
        safeFetch("enrollments"), safeFetch("wallet_transactions"),
        safeFetch("groups"), safeFetch("posts"),
      ]);

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Revenue
      const totalRevenue = orders
        .filter(o => o.status === "delivered" || o.paymentStatus === "paid")
        .reduce((sum, o) => sum + (o.total || 0), 0);
      const todayRevenue = orders
        .filter(o => {
          const d = o.createdAt?.toDate?.() || new Date(o.createdAt);
          return d >= today && (o.status === "delivered" || o.paymentStatus === "paid");
        })
        .reduce((sum, o) => sum + (o.total || 0), 0);
      const monthRevenue = orders
        .filter(o => {
          const d = o.createdAt?.toDate?.() || new Date(o.createdAt);
          return d >= startOfMonth && (o.status === "delivered" || o.paymentStatus === "paid");
        })
        .reduce((sum, o) => sum + (o.total || 0), 0);

      // Order status distribution
      const statusCounts = { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
      orders.forEach(o => { if (statusCounts.hasOwnProperty(o.status)) statusCounts[o.status]++; });
      const orderStatusData = Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
        color: { pending: "#fbbf24", confirmed: "#3b82f6", shipped: "#8b5cf6", delivered: "#10b981", cancelled: "#ef4444" }[name]
      }));

      // Daily Sales (last 7 days)
      const dailySales = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const start = new Date(d); start.setHours(0,0,0,0);
        const end = new Date(d); end.setHours(23,59,59,999);
        const dayOrders = orders.filter(o => {
          const created = o.createdAt?.toDate?.() || new Date(o.createdAt);
          return created >= start && created <= end;
        });
        dailySales.push({
          date: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
          orders: dayOrders.length,
          revenue: dayOrders.reduce((s, o) => s + (o.total || 0), 0)
        });
      }

      // Top Products
      const productSales = {};
      orders.forEach(o => {
        o.items?.forEach(item => {
          if (!productSales[item.productId]) productSales[item.productId] = { name: item.name, count: 0, revenue: 0 };
          productSales[item.productId].count += item.quantity || 1;
          productSales[item.productId].revenue += (item.price * (item.quantity || 1));
        });
      });
      const topProducts = Object.values(productSales).sort((a,b) => b.revenue - a.revenue).slice(0,5);

      // Top Referrers
      const topReferrers = users
        .filter(u => (u.totalReferrals || 0) > 0)
        .sort((a,b) => (b.totalReferrals || 0) - (a.totalReferrals || 0))
        .slice(0,5)
        .map(u => ({
          email: u.email?.split('@')[0] || "User",
          referrals: u.totalReferrals || 0,
          earnings: u.referralEarnings || 0,
          tier: u.referralTier || "bronze"
        }));

      // Category distribution
      const catCount = {};
      products.forEach(p => {
        const cat = categories.find(c => c.id === p.category)?.name || "Uncategorized";
        catCount[cat] = (catCount[cat] || 0) + 1;
      });
      const categoryData = Object.entries(catCount).map(([name, value]) => ({ name, value }));

      // Referral stats
      const totalReferrals = referrals.length;
      const completedReferrals = referrals.filter(r => r.status === "completed").length;
      const pendingReferrals = referrals.filter(r => r.status === "pending").length;

      // Courses & Enrollments
      const totalCourses = courses.length;
      const publishedCourses = courses.filter(c => c.isPublished).length;
      const totalEnrollments = enrollments.length;
      const dailyEnrollments = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const start = new Date(d); start.setHours(0,0,0,0);
        const end = new Date(d); end.setHours(23,59,59,999);
        const count = enrollments.filter(e => {
          const created = e.enrolledAt?.toDate?.() || new Date(e.enrolledAt);
          return created >= start && created <= end;
        }).length;
        dailyEnrollments.push({ date: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }), count });
      }

      // Wallet
      const totalWalletAmount = walletTxns.reduce((sum, tx) => sum + (tx.amount || 0), 0);
      const totalCoinsGiven = walletTxns.reduce((sum, tx) => sum + (tx.coins || 0), 0);

      // Groups & Posts
      const totalGroups = groups.length;
      const totalPosts = posts.length;

      setData({
        totalRevenue, todayRevenue, monthRevenue,
        totalOrders: orders.length,
        pendingOrders: statusCounts.pending, confirmedOrders: statusCounts.confirmed,
        shippedOrders: statusCounts.shipped, deliveredOrders: statusCounts.delivered,
        cancelledOrders: statusCounts.cancelled,
        totalProducts: products.length,
        totalUsers: users.length,
        totalCategories: categories.length,
        totalReferrals, completedReferrals, pendingReferrals,
        orderStatusData, dailySales, topProducts, topReferrers, categoryData,
        totalCourses, publishedCourses, totalEnrollments, dailyEnrollments,
        totalWalletAmount, totalCoinsGiven,
        totalGroups, totalPosts,
      });
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="p-8 text-center"><div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" /></div>;
  if (error) return (
    <div className="p-8 text-center">
      <p className="text-red-500 mb-4">Error: {error}</p>
      <button onClick={fetchData} className="btn-gradient">Try Again</button>
    </div>
  );
  if (!data) return null;

  const safe = (val) => val ?? 0;

  return (
    <div className="p-4 md:p-0 space-y-8">
      <h1 className="text-3xl font-bold">📊 Analytics Dashboard</h1>

      {/* E‑commerce */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card"><HiCurrencyRupee className="text-green-500 text-2xl" /><p className="text-2xl font-bold">₹{safe(data.totalRevenue).toLocaleString()}</p><p className="text-xs">Total Revenue</p></div>
        <div className="card"><HiTrendingUp className="text-blue-500 text-2xl" /><p className="text-2xl font-bold">₹{safe(data.todayRevenue).toLocaleString()}</p><p className="text-xs">Today</p></div>
        <div className="card"><HiShoppingBag className="text-purple-500 text-2xl" /><p className="text-2xl font-bold">{safe(data.totalOrders)}</p><p className="text-xs">Orders</p></div>
        <div className="card"><HiUsers className="text-orange-500 text-2xl" /><p className="text-2xl font-bold">{safe(data.totalUsers)}</p><p className="text-xs">Users</p></div>
      </div>

      {/* Courses & Community */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card"><HiAcademicCap className="text-indigo-500 text-2xl" /><p className="text-2xl font-bold">{safe(data.totalCourses)}</p><p className="text-xs">Courses</p></div>
        <div className="card"><HiAcademicCap className="text-teal-500 text-2xl" /><p className="text-2xl font-bold">{safe(data.totalEnrollments)}</p><p className="text-xs">Enrollments</p></div>
        <div className="card"><HiUserGroup className="text-pink-500 text-2xl" /><p className="text-2xl font-bold">{safe(data.totalGroups)}</p><p className="text-xs">Groups</p></div>
        <div className="card"><HiUserGroup className="text-cyan-500 text-2xl" /><p className="text-2xl font-bold">{safe(data.totalPosts)}</p><p className="text-xs">Posts</p></div>
      </div>

      {/* Wallet */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card"><HiCash className="text-yellow-500 text-2xl" /><p className="text-2xl font-bold">₹{safe(data.totalWalletAmount).toLocaleString()}</p><p className="text-xs">Wallet Amount</p></div>
        <div className="card"><HiCash className="text-amber-500 text-2xl" /><p className="text-2xl font-bold">{safe(data.totalCoinsGiven)}</p><p className="text-xs">Coins Given</p></div>
        <div className="card"><HiTrendingUp className="text-green-500 text-2xl" /><p className="text-2xl font-bold">{safe(data.completedReferrals)}</p><p className="text-xs">Ref. Completed</p></div>
        <div className="card"><HiTrendingUp className="text-red-500 text-2xl" /><p className="text-2xl font-bold">{safe(data.pendingReferrals)}</p><p className="text-xs">Ref. Pending</p></div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {data.orderStatusData && (
          <div className="card">
            <h3 className="font-bold text-lg mb-4">Order Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.orderStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {data.orderStatusData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        {data.dailySales && (
          <div className="card">
            <h3 className="font-bold text-lg mb-4">Daily Sales (7 days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.dailySales}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis />
                <Tooltip /><Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f680" name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        {data.categoryData && (
          <div className="card">
            <h3 className="font-bold text-lg mb-4">Products by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {data.categoryData.map((_, idx) => <Cell key={idx} fill={['#f97316','#3b82f6','#10b981','#8b5cf6','#f43f5e'][idx % 5]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        {data.dailyEnrollments && (
          <div className="card">
            <h3 className="font-bold text-lg mb-4">Daily Enrollments (7 days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.dailyEnrollments}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis allowDecimals={false} />
                <Tooltip /><Bar dataKey="count" fill="#8b5cf6" name="Enrollments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Products & Referrers */}
      <div className="grid md:grid-cols-2 gap-6">
        {data.topProducts && (
          <div className="card">
            <h3 className="font-bold text-lg mb-4">Top Products</h3>
            {data.topProducts.map((p,i) => (
              <div key={i} className="flex justify-between py-2 border-b last:border-0">
                <span className="truncate">{p.name}</span><span className="font-bold">₹{p.revenue}</span>
              </div>
            ))}
          </div>
        )}
        {data.topReferrers && (
          <div className="card">
            <h3 className="font-bold text-lg mb-4">Top Referrers</h3>
            {data.topReferrers.map((r,i) => (
              <div key={i} className="flex justify-between py-2 border-b last:border-0">
                <span>{r.email}</span><span className="font-bold">{r.referrals} refs</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
