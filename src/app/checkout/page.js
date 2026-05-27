"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp, doc, getDoc, updateDoc, increment, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { loadRazorpay } from "@/lib/razorpay";
import { sendOrderConfirmation } from "@/lib/emailjs";
import { sendOrderConfirmationViaResend } from "@/lib/resend";
import { toast } from "react-hot-toast";

// 🎨 Premium SVG Email Template Generator
const generateOrderEmailHTML = (orderData) => {
  const { items, orderId, total, address, email } = orderData;
  
  // Separate digital and physical items
  const digitalItems = items.filter(item => item.isDigital);
  const physicalItems = items.filter(item => !item.isDigital);

  // Generate items rows
  const itemsRows = items.map(item => `
    <tr style="border-bottom:1px solid #e5e7eb">
      <td style="padding:12px 8px;vertical-align:top">
        <p style="margin:0;font-weight:600;color:#111827">${item.name}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#6b7280">Qty: ${item.quantity}</p>
      </td>
      <td style="padding:12px 8px;text-align:right;font-weight:600;color:#111827">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  // Digital items section with download links
  const digitalSection = digitalItems.length > 0 ? `
    <div style="background:linear-gradient(135deg,#667eea,#764ba2);border-radius:16px;padding:24px;margin:24px 0;color:white">
      <h3 style="margin:0 0 16px;font-size:20px">📥 Your Digital Downloads</h3>
      ${digitalItems.map(item => `
        <div style="background:rgba(255,255,255,0.15);border-radius:12px;padding:16px;margin-bottom:12px">
          <p style="margin:0 0 8px;font-weight:600;font-size:16px">${item.name}</p>
          <a href="${item.digitalFileUrl || '#'}" 
             style="display:inline-block;background:white;color:#667eea;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
             ⬇ Download Now
          </a>
          <p style="margin:8px 0 0;font-size:12px;opacity:0.8">Downloads: ${item.downloadLimit || 5} available • Link expires in 7 days</p>
        </div>
      `).join('')}
    </div>
  ` : '';

  // Physical items note
  const physicalNote = physicalItems.length > 0 ? `
    <div style="background:#fef3c7;border-radius:12px;padding:16px;margin:24px 0">
      <p style="margin:0;color:#92400e;font-size:14px">📦 Your physical items will be shipped soon. Track your order in your dashboard.</p>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed! #${orderId}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:30px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.08)">
    <!-- 🎉 Header -->
    <tr>
      <td style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:40px 30px;text-align:center">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom:16px">
          <circle cx="40" cy="40" r="38" stroke="white" stroke-width="3" fill="none"/>
          <path d="M25 42L35 52L55 30" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h1 style="margin:0;color:white;font-size:28px;font-weight:700">Order Confirmed! 🎉</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:16px">Thank you for shopping with Quick Shop</p>
      </td>
    </tr>
    
    <!-- 📋 Content -->
    <tr>
      <td style="padding:30px">
        <!-- Order ID & Greeting -->
        <div style="margin-bottom:24px">
          <p style="margin:0;font-size:14px;color:#6b7280">Order ID: <strong style="color:#111827">#${orderId.slice(0,8)}</strong></p>
          <p style="margin:12px 0 0;font-size:16px;color:#111827">Hi <strong>${orderData.to_name || 'Customer'}</strong>,</p>
          <p style="margin:8px 0 0;font-size:15px;color:#4b5563">Great news! Your order has been placed successfully.</p>
        </div>

        ${digitalSection}
        
        <!-- 📦 Items Table -->
        <h3 style="margin:0 0 12px;font-size:18px;color:#111827">📦 Order Summary</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
          ${itemsRows}
          <tr>
            <td style="padding:16px 8px 0;font-weight:700;font-size:18px;color:#111827">Total</td>
            <td style="padding:16px 8px 0;text-align:right;font-weight:700;font-size:18px;color:#2563eb">₹${total.toFixed(2)}</td>
          </tr>
        </table>

        ${physicalNote}

        <!-- 📍 Shipping Address -->
        <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:24px">
          <p style="margin:0 0 8px;font-weight:600;color:#111827">📍 Shipping Address</p>
          <p style="margin:0;font-size:14px;color:#374151">${orderData.address_name || address?.name}</p>
          <p style="margin:4px 0 0;font-size:14px;color:#374151">${orderData.address_phone || address?.phone}</p>
          <p style="margin:4px 0 0;font-size:14px;color:#374151">${orderData.address_street || address?.street}, ${orderData.address_city || address?.city} – ${orderData.address_pincode || address?.pincode}</p>
        </div>

        <!-- 🔗 CTA Button -->
        <a href="https://quickshoppro.vercel.app/dashboard/orders" 
           style="display:block;text-align:center;background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;text-decoration:none;padding:14px 24px;border-radius:12px;font-weight:600;font-size:16px;margin-bottom:24px">
           📋 Track Your Order
        </a>

        <!-- 📱 WhatsApp -->
        <div style="text-align:center;margin-bottom:24px">
          <a href="https://wa.me/91${orderData.address_phone || address?.phone}?text=Order%20${orderId.slice(0,8)}%20confirmed!%20Total:%20₹${total.toFixed(2)}" 
             style="color:#25d366;text-decoration:none;font-size:14px;font-weight:500">
             💬 Share on WhatsApp
          </a>
        </div>

        <!-- 📞 Support -->
        <div style="border-top:1px solid #e5e7eb;padding-top:20px;text-align:center">
          <p style="margin:0;font-size:13px;color:#9ca3af">Need help? Contact us at <a href="mailto:support@quickshop.com" style="color:#2563eb">support@quickshop.com</a></p>
          <p style="margin:4px 0 0;font-size:12px;color:#9ca3af">© 2026 Quick Shop. All rights reserved.</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

// --- Main Component ---
export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [address, setAddress] = useState({ name: "", phone: "", street: "", city: "", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [useCoins, setUseCoins] = useState(false);
  const [coinsToUse, setCoinsToUse] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setUserProfile(snap.data());
    };
    fetchProfile();
  }, [user]);

  const coinDiscount = useCoins ? Math.min(coinsToUse, userProfile?.coinBalance || 0) : 0;
  const finalTotal = Math.max(0, cartTotal - couponDiscount - coinDiscount);

  const handlePlaceOrder = async () => {
    if (!user) return toast.error("Please login first");
    if (!address.name || !address.phone) return toast.error("Fill all address fields");

    const orderData = {
      userId: user.uid,
      email: user.email,
      items: cart,
      total: finalTotal,
      address,
      paymentMethod,
      status: "pending",
      createdAt: serverTimestamp(),
      cancellationDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isCancelled: false,
      cancelledAt: null,
      trackingUrl: '',
    };

    // Coins deduction
    if (useCoins && coinDiscount > 0) {
      await updateDoc(doc(db, "users", user.uid), {
        coinBalance: increment(-coinDiscount),
      });
      await addDoc(collection(db, "wallet_transactions"), {
        userId: user.uid,
        type: "purchase",
        amount: 0,
        coins: -coinDiscount,
        description: `Coins used for order discount`,
        orderId: "",
        createdAt: serverTimestamp(),
      });
    }

    // 📧 Email parameters (used for both COD & Razorpay)
    const emailParams = {
      ...orderData,
      orderId: "",
      total: finalTotal,
      address_name: address.name,
      address_phone: address.phone,
      address_street: address.street,
      address_city: address.city,
      address_pincode: address.pincode,
      to_email: user.email,
      to_name: address.name,
    };

    if (paymentMethod === "razorpay") {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalTotal }),
      });
      const data = await res.json();
      const isLoaded = await loadRazorpay();
      if (!isLoaded) return toast.error("Razorpay SDK failed to load");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "Quick Shop",
        order_id: data.id,
        handler: async function (response) {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, orderId: data.id }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            const docRef = await addDoc(collection(db, "orders"), {
              ...orderData,
              paymentId: response.razorpay_payment_id,
              paymentStatus: "paid",
            });

            // Update coin transaction
            if (useCoins && coinDiscount > 0) {
              const txSnap = await getDocs(query(collection(db, "wallet_transactions"),
                where("userId", "==", user.uid), where("orderId", "==", ""), orderBy("createdAt", "desc"), limit(1)));
              if (!txSnap.empty) {
                await updateDoc(doc(db, "wallet_transactions", txSnap.docs[0].id), { orderId: docRef.id });
              }
            }

            // 📧 Send emails
            emailParams.orderId = docRef.id;
            const emailHTML = generateOrderEmailHTML(emailParams);
            
            sendOrderConfirmation({ ...emailParams, items: cart.map(i => ({...i, subtotal: (i.price*i.quantity).toFixed(2)})) }).catch(err => console.error("EmailJS:", err));
            sendOrderConfirmationViaResend({ ...emailParams, html: emailHTML }).catch(err => console.error("Resend:", err));

            clearCart();
            toast.success("Order placed!");
            router.push(`/order-confirmation?id=${docRef.id}`);
          } else {
            toast.error("Payment verification failed");
          }
        },
        theme: { color: "#3b82f6" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      // COD
      const docRef = await addDoc(collection(db, "orders"), {
        ...orderData,
        paymentStatus: "pending",
      });

      if (useCoins && coinDiscount > 0) {
        const txSnap = await getDocs(query(collection(db, "wallet_transactions"),
          where("userId", "==", user.uid), where("orderId", "==", ""), orderBy("createdAt", "desc"), limit(1)));
        if (!txSnap.empty) {
          await updateDoc(doc(db, "wallet_transactions", txSnap.docs[0].id), { orderId: docRef.id });
        }
      }

      // 📧 Send emails
      emailParams.orderId = docRef.id;
      const emailHTML = generateOrderEmailHTML(emailParams);
      
      sendOrderConfirmation({ ...emailParams, items: cart.map(i => ({...i, subtotal: (i.price*i.quantity).toFixed(2)})) }).catch(err => console.error("EmailJS:", err));
      sendOrderConfirmationViaResend({ ...emailParams, html: emailHTML }).catch(err => console.error("Resend:", err));

      clearCart();
      toast.success("Order placed with Cash on Delivery");
      router.push(`/order-confirmation?id=${docRef.id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="space-y-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Shipping Address</h2>
          <input placeholder="Full Name" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="input-field" />
          <input placeholder="Phone" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="input-field" />
          <input placeholder="Street" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="input-field" />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="City" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="input-field" />
            <input placeholder="Pincode" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} className="input-field" />
          </div>
        </div>

        {userProfile && userProfile.coinBalance > 0 && (
          <div className="card">
            <h2 className="font-semibold mb-3">💎 Use Coins</h2>
            <p className="text-sm mb-2">Available: <strong>{userProfile.coinBalance}</strong> coins (1 coin = ₹1 discount)</p>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={useCoins} onChange={(e) => { setUseCoins(e.target.checked); if (!e.target.checked) setCoinsToUse(0); }} />
              Use coins for discount
            </label>
            {useCoins && (
              <input type="number" min={1} max={userProfile.coinBalance} value={coinsToUse} onChange={(e) => setCoinsToUse(Math.min(Number(e.target.value), userProfile.coinBalance))} placeholder="Enter coins to use" className="input-field mt-2" />
            )}
            {coinDiscount > 0 && <p className="text-green-600 text-sm mt-1">You save ₹{coinDiscount} with coins!</p>}
          </div>
        )}

        <div className="card">
          <h2 className="font-semibold mb-4">Payment Method</h2>
          <div className="flex gap-4">
            <button onClick={() => setPaymentMethod("cod")} className={`py-2 px-4 rounded-lg border ${paymentMethod==='cod'?'bg-primary-600 text-white border-primary-600':'border-gray-300'}`}>Cash on Delivery</button>
            <button onClick={() => setPaymentMethod("razorpay")} className={`py-2 px-4 rounded-lg border ${paymentMethod==='razorpay'?'bg-primary-600 text-white border-primary-600':'border-gray-300'}`}>Pay Online</button>
          </div>
        </div>
        <div className="card text-lg font-bold flex justify-between items-center">
          <div>
            {coinDiscount > 0 && <p className="text-sm text-green-600">Coin Discount: -₹{coinDiscount}</p>}
            <span>Total: ₹{finalTotal}</span>
          </div>
          <button onClick={handlePlaceOrder} className="btn-gradient">Place Order</button>
        </div>
      </div>
    </div>
  );
}
