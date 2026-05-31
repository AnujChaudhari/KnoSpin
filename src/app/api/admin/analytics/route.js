import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    const ordersSnap = await getDocs(collection(db, "orders"));
    const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const productsSnap = await getDocs(collection(db, "products"));
    const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const usersSnap = await getDocs(collection(db, "users"));
    const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const categoriesSnap = await getDocs(collection(db, "categories"));
    const categories = categoriesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const referralsSnap = await getDocs(collection(db, "referrals"));
    const referrals = referralsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Calculate revenue etc. (same as before, but ensure no undefined)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const totalRevenue = orders
      .filter(o => o.status === "delivered" || o.paymentStatus === "paid")
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const todayRevenue = orders
      .filter(o => {
        const createdAt = o.createdAt?.toDate?.() || new Date(o.createdAt);
        return createdAt >= today && (o.status === "delivered" || o.paymentStatus === "paid");
      })
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const monthRevenue = orders
      .filter(o => {
        const createdAt = o.createdAt?.toDate?.() || new Date(o.createdAt);
        return createdAt >= startOfMonth && (o.status === "delivered" || o.paymentStatus === "paid");
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

    // Daily sales last 7 days (simplified)
    const dailySales = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0,0,0,0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23,59,59,999);
      const dayOrders = orders.filter(o => {
        const createdAt = o.createdAt?.toDate?.() || new Date(o.createdAt);
        return createdAt >= dayStart && createdAt <= dayEnd;
      });
      dailySales.push({
        date: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((s, o) => s + (o.total || 0), 0)
      });
    }

    // Top products
    const productSales = {};
    orders.forEach(o => {
      o.items?.forEach(item => {
        if (!productSales[item.productId]) productSales[item.productId] = { name: item.name, count: 0, revenue: 0 };
        productSales[item.productId].count += item.quantity || 1;
        productSales[item.productId].revenue += (item.price * (item.quantity || 1));
      });
    });
    const topProducts = Object.values(productSales).sort((a,b) => b.revenue - a.revenue).slice(0,5);

    // Top referrers
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

    return NextResponse.json({
      totalRevenue,
      todayRevenue,
      monthRevenue,
      totalOrders: orders.length,
      pendingOrders: statusCounts.pending,
      confirmedOrders: statusCounts.confirmed,
      shippedOrders: statusCounts.shipped,
      deliveredOrders: statusCounts.delivered,
      cancelledOrders: statusCounts.cancelled,
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
