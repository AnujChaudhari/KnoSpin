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

/* ───────── प्रीमियम SVG आइकॉन ───────── */
const LocationPinIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CoinIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 2" />
  </svg>
);

const WalletIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 10h4" />
  </svg>
);

const CashIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
);

const CardIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line strokeLinecap="round" x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
  </svg>
);

// --- Main Component ---
export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [address, setAddress] = useState({ name: "", phone: "", street: "", city: "", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponDiscount] = useState(0); // future integration
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

  // Determine cart composition
  const hasDigitalProduct = cart.some(item => item.isDigital);
  const allDigital = cart.every(item => item.isDigital);

  // Coin logic: only allowed when ALL items are digital
  const coinsAllowed = allDigital && userProfile?.coinBalance > 0;
  const coinDiscount = useCoins ? Math.min(coinsToUse, userProfile?.coinBalance || 0) : 0;
  const finalTotal = Math.max(0, cartTotal - couponDiscount - coinDiscount);

  const handlePlaceOrder = async () => {
    if (!user) return toast.error("Please login first");
    if (!address.name || !address.phone) return toast.error("Fill all address fields");

    // For digital only orders, force online payment
    if (allDigital && paymentMethod !== "razorpay") {
      toast.error("Digital products require online payment. Please select Pay Online.");
      return;
    }

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

    // Coins deduction (only if used)
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

    // Email parameters
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

            // Update coin transaction with order ID
            if (useCoins && coinDiscount > 0) {
              const txSnap = await getDocs(query(collection(db, "wallet_transactions"),
                where("userId", "==", user.uid), where("orderId", "==", ""), orderBy("createdAt", "desc"), limit(1)));
              if (!txSnap.empty) {
                await updateDoc(doc(db, "wallet_transactions", txSnap.docs[0].id), { orderId: docRef.id });
              }
            }

            // Send emails
            emailParams.orderId = docRef.id;
            sendOrderConfirmation({ ...emailParams, items: cart.map(i => ({...i, subtotal: (i.price*i.quantity).toFixed(2)})) })
              .catch(err => console.error("EmailJS:", err));
            sendOrderConfirmationViaResend(emailParams)
              .catch(err => console.error("Resend:", err));

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
      // COD (only possible when no digital items)
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

      emailParams.orderId = docRef.id;
      sendOrderConfirmation({ ...emailParams, items: cart.map(i => ({...i, subtotal: (i.price*i.quantity).toFixed(2)})) })
        .catch(err => console.error("EmailJS:", err));
      sendOrderConfirmationViaResend(emailParams)
        .catch(err => console.error("Resend:", err));

      clearCart();
      toast.success("Order placed with Cash on Delivery");
      router.push(`/order-confirmation?id=${docRef.id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <ShieldCheckIcon />
        Secure Checkout
      </h1>

      <div className="space-y-6">
        {/* Shipping Address */}
        <div className="card">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <LocationPinIcon /> Shipping Address
          </h2>
          <input placeholder="Full Name" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="input-field" />
          <input placeholder="Phone" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="input-field" />
          <input placeholder="Street" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="input-field" />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="City" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="input-field" />
            <input placeholder="Pincode" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} className="input-field" />
          </div>
        </div>

        {/* Coins Redemption – only for all‑digital orders */}
        {coinsAllowed && (
          <div className="card">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <CoinIcon /> Use Coins
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
                <WalletIcon /> You save ₹{coinDiscount} with coins!
              </p>
            )}
          </div>
        )}

        {/* Payment Method */}
        <div className="card">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <CardIcon /> Payment Method
          </h2>
          <div className="flex gap-4">
            {!hasDigitalProduct && (
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
              <WalletIcon /> Pay Online
            </button>
          </div>
          {hasDigitalProduct && (
            <div className="mt-3 flex items-start gap-2 text-amber-600 dark:text-amber-400 text-sm">
              <span className="flex-shrink-0 mt-0.5">⚠️</span>
              <span>Cash on Delivery is not available for orders containing digital products. Please choose Pay Online.</span>
            </div>
          )}
        </div>

        {/* Total & Place Order */}
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
            <button onClick={handlePlaceOrder} className="btn-gradient px-6 py-3">
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
