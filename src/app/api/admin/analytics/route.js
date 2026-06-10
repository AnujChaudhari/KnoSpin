import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    // सभी कलेक्शन एक साथ fetch करें (समानांतर)
    const [
      ordersSnap, productsSnap, usersSnap, categoriesSnap,
      referralsSnap, coursesSnap, enrollmentsSnap,
      walletSnap, groupsSnap, postsSnap
    ] = await Promise.all([
      getDocs(collection(db, "orders")),
      getDocs(collection(db, "products")),
      getDocs(collection(db, "users")),
      getDocs(collection(db, "categories")),
      getDocs(collection(db, "referrals")),
      getDocs(collection(db, "courses")),
      getDocs(collection(db, "enrollments")),
      getDocs(collection(db, "wallet_transactions")),
      getDocs(collection(db, "groups")),
      getDocs(collection(db, "posts")),
    ]);

    // Raw arrays
    const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const referrals = referralsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const courses = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const enrollments = enrollmentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const walletTxns = walletSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // ====== गणनाएँ ======
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

    // Category distribution (products)
    const catCount = {};
    products.forEach(p => {
      const cat = categoriesSnap.docs.find(c => c.id === p.category)?.data()?.name || "Uncategorized";
      catCount[cat] = (catCount[cat] || 0) + 1;
    });
    const categoryData = Object.entries(catCount).map(([name, value]) => ({ name, value }));

    // Referral stats
    const totalReferrals = referrals.length;
    const completedReferrals = referrals.filter(r => r.status === "completed").length;
    const pendingReferrals = referrals.filter(r => r.status === "pending").length;

    // New: Courses & Enrollments
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

    // Wallet summary
    const totalWalletAmount = walletTxns.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const totalCoinsGiven = walletTxns.reduce((sum, tx) => sum + (tx.coins || 0), 0);

    // Groups & Posts
    const totalGroups = groupsSnap.size;
    const totalPosts = postsSnap.size;

    return NextResponse.json({
      totalRevenue, todayRevenue, monthRevenue,
      totalOrders: orders.length,
      pendingOrders: statusCounts.pending,
      confirmedOrders: statusCounts.confirmed,
      shippedOrders: statusCounts.shipped,
      deliveredOrders: statusCounts.delivered,
      cancelledOrders: statusCounts.cancelled,
      totalProducts: products.length,
      totalUsers: users.length,
      totalCategories: categoriesSnap.size,
      totalReferrals, completedReferrals, pendingReferrals,
      orderStatusData, dailySales, topProducts, topReferrers, categoryData,
      // New fields
      totalCourses, publishedCourses, totalEnrollments, dailyEnrollments,
      totalWalletAmount, totalCoinsGiven,
      totalGroups, totalPosts,
    });
  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
