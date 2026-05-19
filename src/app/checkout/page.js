"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { loadRazorpay } from "@/lib/razorpay";
import { sendOrderConfirmation } from "@/lib/emailjs";
import { toast } from "react-hot-toast";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [address, setAddress] = useState({ name: "", phone: "", street: "", city: "", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Coupon logic can be added later

  const handlePlaceOrder = async () => {
    if (!user) return toast.error("Please login first");
    if (!address.name || !address.phone) return toast.error("Fill all address fields");

    const orderData = {
      userId: user.uid,
      email: user.email,
      items: cart,
      total: cartTotal - couponDiscount,
      address,
      paymentMethod,
      status: "pending",
      createdAt: serverTimestamp(),
    };

    if (paymentMethod === "razorpay") {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: cartTotal - couponDiscount }),
      });
      const data = await res.json();
      const isLoaded = await loadRazorpay();
      if (!isLoaded) return toast.error("Razorpay SDK failed to load");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "ShopHub",
        order_id: data.id,
        handler: async function (response) {
          // verify signature
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, orderId: data.id }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            // Save order with paymentId
            const docRef = await addDoc(collection(db, "orders"), {
              ...orderData,
              paymentId: response.razorpay_payment_id,
              paymentStatus: "paid",
            });
            sendOrderConfirmation({ ...orderData, orderId: docRef.id });
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
      // ईमेल भेजें
      sendOrderConfirmation({
        ...orderData,
        orderId: docRef.id,
      }).catch(err => console.error("Email send failed:", err));
      
      sendOrderConfirmation({ ...orderData, orderId: docRef.id });
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
        <div className="card">
          <h2 className="font-semibold mb-4">Payment Method</h2>
          <div className="flex gap-4">
            <button onClick={() => setPaymentMethod("cod")} className={`py-2 px-4 rounded-lg border ${paymentMethod==='cod'?'bg-primary-600 text-white border-primary-600':'border-gray-300'}`}>Cash on Delivery</button>
            <button onClick={() => setPaymentMethod("razorpay")} className={`py-2 px-4 rounded-lg border ${paymentMethod==='razorpay'?'bg-primary-600 text-white border-primary-600':'border-gray-300'}`}>No UPI Pay available </button>
          </div>
        </div>
        <div className="card text-lg font-bold flex justify-between">
          <span>Total: ₹{cartTotal - couponDiscount}</span>
          <button onClick={handlePlaceOrder} className="btn-gradient">Place Order</button>
        </div>
      </div>
    </div>
  );
}
