"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { HiTrendingUp, HiCurrencyRupee, HiShoppingBag, HiUsers, HiAcademicCap, HiUserGroup, HiCash } from "react-icons/hi";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="p-8 text-center">Loading analytics...</div>;
  if (error) return <div className="p-8 text-center"><p className="text-red-500 mb-4">Error: {error}</p><button onClick={fetchData} className="btn-gradient">Try Again</button></div>;
  if (!data) return <div className="p-8 text-center">No data available.</div>;

  const safe = (val) => val ?? 0;

  return (
    <div className="p-4 md:p-0 space-y-8">
      <h1 className="text-3xl font-bold">📊 Analytics Dashboard</h1>

      {/* ===== Row 1: E‑commerce ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card"><HiCurrencyRupee className="text-green-500 text-2xl" /><p className="text-2xl font-bold">₹{safe(data.totalRevenue).toLocaleString()}</p><p className="text-xs">Total Revenue</p></div>
        <div className="card"><HiTrendingUp className="text-blue-500 text-2xl" /><p className="text-2xl font-bold">₹{safe(data.todayRevenue).toLocaleString()}</p><p className="text-xs">Today</p></div>
        <div className="card"><HiShoppingBag className="text-purple-500 text-2xl" /><p className="text-2xl font-bold">{safe(data.totalOrders)}</p><p className="text-xs">Orders</p></div>
        <div className="card"><HiUsers className="text-orange-500 text-2xl" /><p className="text-2xl font-bold">{safe(data.totalUsers)}</p><p className="text-xs">Users</p></div>
      </div>

      {/* ===== Row 2: Courses & Community ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card"><HiAcademicCap className="text-indigo-500 text-2xl" /><p className="text-2xl font-bold">{safe(data.totalCourses)}</p><p className="text-xs">Courses</p></div>
        <div className="card"><HiAcademicCap className="text-teal-500 text-2xl" /><p className="text-2xl font-bold">{safe(data.totalEnrollments)}</p><p className="text-xs">Enrollments</p></div>
        <div className="card"><HiUserGroup className="text-pink-500 text-2xl" /><p className="text-2xl font-bold">{safe(data.totalGroups)}</p><p className="text-xs">Groups</p></div>
        <div className="card"><HiUserGroup className="text-cyan-500 text-2xl" /><p className="text-2xl font-bold">{safe(data.totalPosts)}</p><p className="text-xs">Posts</p></div>
      </div>

      {/* ===== Row 3: Wallet ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card"><HiCash className="text-yellow-500 text-2xl" /><p className="text-2xl font-bold">₹{safe(data.totalWalletAmount).toLocaleString()}</p><p className="text-xs">Wallet Amount</p></div>
        <div className="card"><HiCash className="text-amber-500 text-2xl" /><p className="text-2xl font-bold">{safe(data.totalCoinsGiven)}</p><p className="text-xs">Coins Given</p></div>
        <div className="card"><HiTrendingUp className="text-green-500 text-2xl" /><p className="text-2xl font-bold">{safe(data.completedReferrals)}</p><p className="text-xs">Ref. Completed</p></div>
        <div className="card"><HiTrendingUp className="text-red-500 text-2xl" /><p className="text-2xl font-bold">{safe(data.pendingReferrals)}</p><p className="text-xs">Ref. Pending</p></div>
      </div>

      {/* ===== Charts ===== */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Order Status */}
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

        {/* Daily Sales */}
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

        {/* Category Distribution */}
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

        {/* Daily Enrollments */}
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
