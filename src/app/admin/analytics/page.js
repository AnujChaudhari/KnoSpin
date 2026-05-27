"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { HiTrendingUp, HiCurrencyRupee, HiShoppingBag, HiUsers, HiClipboardList, HiTruck } from "react-icons/hi";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <div className="p-8 text-center">Loading analytics...</div>;

  return (
    <div className="p-4 md:p-0 space-y-8">
      <h1 className="text-3xl font-bold">📊 Analytics Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card"><HiCurrencyRupee className="text-green-500 text-2xl" /><p className="text-2xl font-bold">₹{data.totalRevenue?.toLocaleString()}</p><p className="text-xs text-gray-500">Total Revenue</p></div>
        <div className="card"><HiTrendingUp className="text-blue-500 text-2xl" /><p className="text-2xl font-bold">₹{data.todayRevenue?.toLocaleString()}</p><p className="text-xs text-gray-500">Today</p></div>
        <div className="card"><HiShoppingBag className="text-purple-500 text-2xl" /><p className="text-2xl font-bold">{data.totalOrders}</p><p className="text-xs text-gray-500">Total Orders</p></div>
        <div className="card"><HiUsers className="text-orange-500 text-2xl" /><p className="text-2xl font-bold">{data.totalUsers}</p><p className="text-xs text-gray-500">Users</p></div>
      </div>

      {/* Order Status Pie Chart */}
      <div className="card">
        <h3 className="font-bold text-lg mb-4">Order Status Distribution</h3>
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

      {/* Daily Sales Chart */}
      <div className="card">
        <h3 className="font-bold text-lg mb-4">Last 7 Days Sales</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.dailySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f680" name="Revenue (₹)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products & Top Referrers */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold text-lg mb-4">Top Products</h3>
          {data.topProducts.map((p, i) => (
            <div key={i} className="flex justify-between py-2 border-b last:border-0">
              <span className="truncate">{p.name}</span>
              <span className="font-bold">₹{p.revenue}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 className="font-bold text-lg mb-4">Top Referrers</h3>
          {data.topReferrers.map((r, i) => (
            <div key={i} className="flex justify-between py-2 border-b last:border-0">
              <span>{r.email}</span>
              <span className="font-bold">{r.referrals} refs</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="card"><p className="text-2xl font-bold text-yellow-600">{data.pendingOrders}</p><p className="text-xs">Pending</p></div>
        <div className="card"><p className="text-2xl font-bold text-blue-600">{data.confirmedOrders}</p><p className="text-xs">Confirmed</p></div>
        <div className="card"><p className="text-2xl font-bold text-purple-600">{data.shippedOrders}</p><p className="text-xs">Shipped</p></div>
        <div className="card"><p className="text-2xl font-bold text-green-600">{data.deliveredOrders}</p><p className="text-xs">Delivered</p></div>
      </div>

      {/* Referral Stats */}
      <div className="card">
        <h3 className="font-bold text-lg mb-4">Referral Program Stats</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><p className="text-2xl font-bold">{data.totalReferrals}</p><p className="text-xs">Total</p></div>
          <div><p className="text-2xl font-bold text-green-600">{data.completedReferrals}</p><p className="text-xs">Completed</p></div>
          <div><p className="text-2xl font-bold text-yellow-600">{data.pendingReferrals}</p><p className="text-xs">Pending</p></div>
        </div>
      </div>
    </div>
  );
}
