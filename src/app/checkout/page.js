"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  addDoc, collection, serverTimestamp, doc, getDoc,
  updateDoc, increment, getDocs, query, where, orderBy, limit, setDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { loadRazorpay } from "@/lib/razorpay";
import { sendOrderConfirmation } from "@/lib/emailjs";
import { sendOrderConfirmationViaResend } from "@/lib/resend";
import { sendNotification } from "@/lib/notifications";          // ✅ new
import { toast } from "react-hot-toast";

/* ---------- Premium Inline SVG Icons ---------- */
const LocationIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const CoinIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);
const CashIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
);
const OnlinePayIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);
const SecureIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
const WarningIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  // ---------- state ----------
  const [address, setAddress] = useState({ name: "", phone: "", street: "", city: "", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState("razorpay");   // default to online if digital
  const [userProfile, setUserProfile] = useState(null);
  const [useCoins, setUseCoins] = useState(false);
  const [coinsToUse, setCoinsToUse] = useState(0);
  const [placing, setPlacing] = useState(false);

  // ---------- derived flags ----------
  const hasPhysical = cart.some(item => !item.isDigital);
  const hasDigital  = cart.some(item => item.isDigital);
  const allDigital  = cart.every(item => item.isDigital);            // pure digital order
  const coinsAllowed = allDigital && (userProfile?.coinBalance ?? 0) > 0;
  const coinDiscount = useCoins ? Math.min(coinsToUse, userProfile?.coinBalance ?? 0) : 0;
  const finalTotal = Math.max(0, cartTotal - coinDiscount);

  // ---------- fetch user profile ----------
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setUserProfile(snap.data());
    };
    fetchProfile();
  }, [user]);

  // ---------- place order ----------
  const handlePlaceOrder = async () => {
    if (!user) return toast.error("Please login first");
    if (cart.length === 0) return toast.error("Cart is empty");

    // address only for physical items
    if (hasPhysical && (!address.name || !address.phone)) {
      return toast.error("Fill all address fields");
    }

    // digital orders → force online payment
    if (hasDigital && paymentMethod !== "razorpay") {
      return toast.error("Orders with digital products require online payment.");
    }

    if (placing) return;
    setPlacing(true);

    const orderData = {
      userId: user.uid,
      email: user.email,
      items: cart,
      total: finalTotal,
      address: hasPhysical ? address : null,
      paymentMethod,
      status: "pending",
      createdAt: serverTimestamp(),
      cancellationDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isCancelled: false,
      cancelledAt: null,
      trackingUrl: '',
    };

    // ---- coins deduction (if used) ----
    if (useCoins && coinDiscount > 0) {
      await updateDoc(doc(db, "users", user.uid), {
        coinBalance: increment(-coinDiscount),
      });
      // placeholder transaction – orderId will be updated after order creation
      const txRef = await addDoc(collection(db, "wallet_transactions"), {
        userId: user.uid,
        type: "purchase",
        amount: 0,
        coins: -coinDiscount,
        description: "Coins used for order discount",
        orderId: "",          // will be patched
        createdAt: serverTimestamp(),
      });
    }

    // ----- finalize order (common for both COD & Razorpay) -----
    const finalizeOrder = async (paymentDetails = {}) => {
      const docRef = await addDoc(collection(db, "orders"), {
        ...orderData,
        ...paymentDetails,
      });

      // patch coin transaction with real order id
      if (useCoins && coinDiscount > 0) {
        const txSnap = await getDocs(query(
          collection(db, "wallet_transactions"),
          where("userId", "==", user.uid),
          where("orderId", "==", ""),
          orderBy("createdAt", "desc"),
          limit(1)
        ));
        if (!txSnap.empty) {
          await updateDoc(doc(db, "wallet_transactions", txSnap.docs[0].id), { orderId: docRef.id });
        }
      }

      // ----- emails & notification -----
      const emailParams = {
        ...orderData,
        orderId: docRef.id,
        total: finalTotal,
        address_name: address.name || "",
        address_phone: address.phone || "",
        address_street: address.street || "",
        address_city: address.city || "",
        address_pincode: address.pincode || "",
        to_email: user.email,
        to_name: address.name || user.email,
        items: cart.map(item => ({
          ...item,
          subtotal: (item.price * item.quantity).toFixed(2)
        })),
      };
      sendOrderConfirmation(emailParams).catch(err => console.error("EmailJS:", err));
      sendOrderConfirmationViaResend(emailParams).catch(err => console.error("Resend:", err));
      // 🔔 notification
      sendNotification(user.uid, "order", "Order Placed",
        `Your order #${docRef.id} has been placed. Total: ₹${finalTotal}`, "/dashboard/orders");

      // ----- digital download tokens -----
      let tokenParam = "";
      const digitalItems = cart.filter(item => item.isDigital);
      if (digitalItems.length > 0) {
        const tokens = [];
        for (const item of digitalItems) {
          const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
          await setDoc(doc(db, "downloads", token), {
            userId: user.uid,
            productId: item.productId,
            productName: item.name,
            downloadCount: 0,
            downloadLimit: item.downloadLimit || 5,
            digitalFileUrl: item.digitalFileUrl || null,
            digitalUrl: item.digitalUrl || null,
            orderId: docRef.id,
            createdAt: serverTimestamp(),
          });
          tokens.push(`${encodeURIComponent(item.name)}:${token}`);
        }
        tokenParam = tokens.join(',');
      }

      clearCart();
      const redirectUrl = `/order-confirmation?id=${docRef.id}${tokenParam ? `&tokens=${encodeURIComponent(tokenParam)}` : ''}`;
      router.push(redirectUrl);
    };

    // ----- Razorpay flow -----
    if (paymentMethod === "razorpay") {
      try {
        const res = await fetch("/api/razorpay/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: finalTotal }),
        });
        const data = await res.json();
        const isLoaded = await loadRazorpay();
        if (!isLoaded) { setPlacing(false); return toast.error("Razorpay SDK failed to load"); }

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
              await finalizeOrder({
                paymentId: response.razorpay_payment_id,
                paymentStatus: "paid",
              });
              toast.success("Payment successful!");
            } else {
              toast.error("Payment verification failed");
              setPlacing(false);
            }
          },
          theme: { color: "#3b82f6" },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        toast.error("Payment initiation failed");
        console.error(err);
        setPlacing(false);
      }
    } else {
      // COD (allowed only when no digital items)
      await finalizeOrder({ paymentStatus: "pending" });
      toast.success("Order placed successfully!");
    }
  };

  // ---------- UI ----------
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <SecureIcon />
        Secure Checkout
      </h1>

      <div className="space-y-6">
        {/* ----- Shipping Address (only when physical present) ----- */}
        {hasPhysical && (
          <div className="card">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <LocationIcon /> Shipping Address
            </h2>
            <input placeholder="Full Name" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="input-field" />
            <input placeholder="Phone" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="input-field" />
            <input placeholder="Street" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="input-field" />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="City" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="input-field" />
              <input placeholder="Pincode" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} className="input-field" />
            </div>
          </div>
        )}

        {/* ----- coins redemption (only for all‑digital carts) ----- */}
        {coinsAllowed && (
          <div className="card">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <CoinIcon /> Use Coins (Digital Products Only)
            </h2>
            <p className="text-sm mb-2">
              Available: <strong>{userProfile.coinBalance}</strong> coins (1 coin = ₹1 discount)
            </p>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useCoins}
                onChange={(e) => {
                  setUseCoins(e.target.checked);
                  if (!e.target.checked) setCoinsToUse(0);
                }}
              />
              Use coins for discount
            </label>
            {useCoins && (
              <input
                type="number"
                min={1}
                max={userProfile.coinBalance}
                value={coinsToUse}
                onChange={(e) => setCoinsToUse(Math.min(Number(e.target.value), userProfile.coinBalance))}
                placeholder="Enter coins to use"
                className="input-field mt-2"
              />
            )}
            {coinDiscount > 0 && (
              <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                <CoinIcon /> You save ₹{coinDiscount} with coins!
              </p>
            )}
          </div>
        )}

        {/* ----- payment method ----- */}
        <div className="card">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <OnlinePayIcon /> Payment Method
          </h2>
          <div className="flex flex-wrap gap-4">
            {!hasDigital && (
              <button
                onClick={() => setPaymentMethod("cod")}
                className={`py-3 px-5 rounded-xl border flex items-center gap-2 transition ${
                  paymentMethod === "cod"
                    ? "bg-primary-600 text-white border-primary-600 shadow-lg"
                    : "border-gray-300 hover:border-gray-400 dark:border-gray-600"
                }`}
              >
                <CashIcon /> Cash on Delivery
              </button>
            )}
            <button
              onClick={() => setPaymentMethod("razorpay")}
              className={`py-3 px-5 rounded-xl border flex items-center gap-2 transition ${
                paymentMethod === "razorpay"
                  ? "bg-primary-600 text-white border-primary-600 shadow-lg"
                  : "border-gray-300 hover:border-gray-400 dark:border-gray-600"
              }`}
            >
              <OnlinePayIcon /> Pay Online
            </button>
          </div>
          {hasDigital && (
            <div className="mt-3 flex items-start gap-2 text-amber-600 dark:text-amber-400 text-sm">
              <WarningIcon />
              <span>Cash on Delivery is not available for orders containing digital products. Please choose Pay Online.</span>
            </div>
          )}
        </div>

        {/* ----- total & CTA ----- */}
        <div className="card">
          <div className="flex justify-between items-center text-lg font-bold">
            <div>
              {coinDiscount > 0 && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CoinIcon /> Coin Discount: -₹{coinDiscount}
                </p>
              )}
              <span>Total: ₹{finalTotal}</span>
            </div>
            <button onClick={handlePlaceOrder} disabled={placing} className="btn-gradient px-6 py-3">
              {placing ? "Placing..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
