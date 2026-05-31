"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { HiTrendingUp, HiCurrencyRupee, HiShoppingBag, HiUsers } from "react-icons/hi";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading analytics...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-8 text-center">No data available.</div>;

  // Safe accessors
  const safe = (val) => val ?? 0;

  return (
    <div className="p-4 md:p-0 space-y-8">
      <h1 className="text-3xl font-bold">📊 Analytics Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card"><HiCurrencyRupee className="text-green-500 text-2xl" /><p className="text-2xl font-bold">₹{safe(data.totalRevenue).toLocaleString()}</p><p className="text-xs">Total Revenue</p></div>
        <div className="card"><HiTrendingUp className="text-blue-500 text-2xl" /><p className="text-2xl font-bold">₹{safe(data.todayRevenue).toLocaleString()}</p><p className="text-xs">Today</p></div>
        <div className="card"><HiShoppingBag className="text-purple-500 text-2xl" /><p className="text-2xl font-bold">{safe(data.totalOrders)}</p><p className="text-xs">Total Orders</p></div>
        <div className="card"><HiUsers className="text-orange-500 text-2xl" /><p className="text-2xl font-bold">{safe(data.totalUsers)}</p><p className="text-xs">Users</p></div>
      </div>

      {/* Order Status Pie */}
      {data.orderStatusData && (
        <div className="card">
          <h3 className="font-bold text-lg mb-4">Order Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data.orderStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {data.orderStatusData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Daily Sales */}
      {data.dailySales && (
        <div className="card">
          <h3 className="font-bold text-lg mb-4">Last 7 Days Sales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f680" name="Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Products & Referrers */}
      <div className="grid md:grid-cols-2 gap-6">
        {data.topProducts && (
          <div className="card">
            <h3 className="font-bold text-lg mb-4">Top Products</h3>
            {data.topProducts.map((p,i) => (
              <div key={i} className="flex justify-between py-2 border-b last:border-0">
                <span className="truncate">{p.name}</span>
                <span className="font-bold">₹{p.revenue}</span>
              </div>
            ))}
          </div>
        )}
        {data.topReferrers && (
          <div className="card">
            <h3 className="font-bold text-lg mb-4">Top Referrers</h3>
            {data.topReferrers.map((r,i) => (
              <div key={i} className="flex justify-between py-2 border-b last:border-0">
                <span>{r.email}</span>
                <span className="font-bold">{r.referrals} refs</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
