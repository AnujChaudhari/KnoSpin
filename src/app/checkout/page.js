"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp, doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { loadRazorpay } from "@/lib/razorpay";
import { sendOrderConfirmation } from "@/lib/emailjs";
import { sendOrderConfirmationViaResend } from "@/lib/resend";
import { toast } from "react-hot-toast";

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

  // Fetch user profile for coin balance
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setUserProfile(snap.data());
    };
    fetchProfile();
  }, [user]);

  // Calculate discount from coins (1 coin = ₹1)
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

    // --- Coins deduction ---
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
        orderId: "", // will update after docRef
        createdAt: serverTimestamp(),
      });
    }

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

            // Update coin transaction with orderId
            if (useCoins && coinDiscount > 0) {
              const txSnap = await getDocs(query(collection(db, "wallet_transactions"),
                where("userId", "==", user.uid), where("orderId", "==", ""), orderBy("createdAt", "desc"), limit(1)));
              if (!txSnap.empty) {
                await updateDoc(doc(db, "wallet_transactions", txSnap.docs[0].id), { orderId: docRef.id });
              }
            }

            sendOrderConfirmation({ ...orderData, orderId: docRef.id, total: finalTotal }).catch(err => console.error("EmailJS failed:", err));
            sendOrderConfirmationViaResend({
              ...orderData,
              orderId: docRef.id,
              total: finalTotal,
              address_name: address.name,
              address_phone: address.phone,
              address_street: address.street,
              address_city: address.city,
              address_pincode: address.pincode,
              to_email: user.email,
              to_name: address.name,
            }).catch(err => console.error("Resend failed:", err));
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

      // Update coin transaction with orderId
      if (useCoins && coinDiscount > 0) {
        const txSnap = await getDocs(query(collection(db, "wallet_transactions"),
          where("userId", "==", user.uid), where("orderId", "==", ""), orderBy("createdAt", "desc"), limit(1)));
        if (!txSnap.empty) {
          await updateDoc(doc(db, "wallet_transactions", txSnap.docs[0].id), { orderId: docRef.id });
        }
      }

      sendOrderConfirmation({ ...orderData, orderId: docRef.id, total: finalTotal }).catch(err => console.error("EmailJS failed:", err));
      sendOrderConfirmationViaResend({
        ...orderData,
        orderId: docRef.id,
        total: finalTotal,
        address_name: address.name,
        address_phone: address.phone,
        address_street: address.street,
        address_city: address.city,
        address_pincode: address.pincode,
        to_email: user.email,
        to_name: address.name,
      }).catch(err => console.error("Resend failed:", err));
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

        {/* 💎 Coins Redemption Section */}
        {userProfile && userProfile.coinBalance > 0 && (
          <div className="card">
            <h2 className="font-semibold mb-3">💎 Use Coins</h2>
            <p className="text-sm mb-2">Available: <strong>{userProfile.coinBalance}</strong> coins (1 coin = ₹1 discount)</p>
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
              <p className="text-green-600 text-sm mt-1">You save ₹{coinDiscount} with coins!</p>
            )}
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
