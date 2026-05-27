import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";

export async function GET() {
  try {
    // Orders data
    const ordersSnap = await getDocs(collection(db, "orders"));
    const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Products data
    const productsSnap = await getDocs(collection(db, "products"));
    const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Users data
    const usersSnap = await getDocs(collection(db, "users"));
    const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Categories data
    const categoriesSnap = await getDocs(collection(db, "categories"));
    const categories = categoriesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Referrals data
    const referralsSnap = await getDocs(collection(db, "referrals"));
    const referrals = referralsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // ====== CALCULATIONS ======

    // Total Revenue (delivered & confirmed orders)
    const totalRevenue = orders
      .filter(o => o.status === "delivered" || o.status === "confirmed" || o.paymentStatus === "paid")
      .reduce((sum, o) => sum + (o.total || 0), 0);

    // Today's Revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = orders
      .filter(o => {
        const createdAt = o.createdAt?.toDate?.() || new Date(o.createdAt);
        return createdAt >= today && (o.status === "delivered" || o.status === "confirmed" || o.paymentStatus === "paid");
      })
      .reduce((sum, o) => sum + (o.total || 0), 0);

    // This Month Revenue
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthRevenue = orders
      .filter(o => {
        const createdAt = o.createdAt?.toDate?.() || new Date(o.createdAt);
        return createdAt >= startOfMonth && (o.status === "delivered" || o.status === "confirmed" || o.paymentStatus === "paid");
      })
      .reduce((sum, o) => sum + (o.total || 0), 0);

    // Total Orders
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === "pending").length;
    const confirmedOrders = orders.filter(o => o.status === "confirmed").length;
    const shippedOrders = orders.filter(o => o.status === "shipped").length;
    const deliveredOrders = orders.filter(o => o.status === "delivered").length;
    const cancelledOrders = orders.filter(o => o.status === "cancelled").length;

    // Order Status Distribution
    const orderStatusData = [
      { name: "Pending", value: pendingOrders, color: "#fbbf24" },
      { name: "Confirmed", value: confirmedOrders, color: "#3b82f6" },
      { name: "Shipped", value: shippedOrders, color: "#8b5cf6" },
      { name: "Delivered", value: deliveredOrders, color: "#10b981" },
      { name: "Cancelled", value: cancelledOrders, color: "#ef4444" },
    ];

    // Daily Sales (last 7 days)
    const dailySales = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayOrders = orders.filter(o => {
        const createdAt = o.createdAt?.toDate?.() || new Date(o.createdAt);
        return createdAt >= dayStart && createdAt <= dayEnd;
      });

      dailySales.push({
        date: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
      });
    }

    // Top Products (by order frequency)
    const productSales = {};
    orders.forEach(o => {
      o.items?.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.name, count: 0, revenue: 0 };
        }
        productSales[item.productId].count += item.quantity || 1;
        productSales[item.productId].revenue += (item.price * (item.quantity || 1));
      });
    });
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Top Referrers
    const topReferrers = users
      .filter(u => u.totalReferrals > 0)
      .sort((a, b) => (b.totalReferrals || 0) - (a.totalReferrals || 0))
      .slice(0, 5)
      .map(u => ({
        email: u.email?.split('@')[0] || "User",
        referrals: u.totalReferrals || 0,
        earnings: u.referralEarnings || 0,
        tier: u.referralTier || "bronze",
      }));

    // Category Distribution
    const categoryCount = {};
    products.forEach(p => {
      const catName = categories.find(c => c.id === p.category)?.name || "Uncategorized";
      categoryCount[catName] = (categoryCount[catName] || 0) + 1;
    });
    const categoryData = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));

    // Referral Stats
    const totalReferrals = referrals.length;
    const completedReferrals = referrals.filter(r => r.status === "completed").length;
    const pendingReferrals = referrals.filter(r => r.status === "pending").length;

    return NextResponse.json({
      totalRevenue,
      todayRevenue,
      monthRevenue,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalProducts: products.length,
      totalUsers: users.length,
      totalCategories: categories.length,
      totalReferrals,
      completedReferrals,
      pendingReferrals,
      orderStatusData,
      dailySales,
      topProducts,
      topReferrers,
      categoryData,
    });
  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
