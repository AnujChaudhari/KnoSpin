"use client";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import CartItem from "@/components/CartItem";
import CouponInput from "@/components/CouponInput";
import { motion } from "framer-motion";

export default function CartPage() {
  const { cart, cartTotal, clearCart } = useCart();

  if (cart.length === 0) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold">Cart is empty</h2>
      <Link href="/" className="btn-gradient mt-4 inline-block">Shop now</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart ({cart.length})</h1>
      <div className="space-y-4">
        {cart.map(item => (
          <CartItem key={item.productId} item={item} />
        ))}
      </div>
      <CouponInput />
      <div className="mt-6 flex justify-between items-center">
        <span className="text-xl font-bold">Total: ₹{cartTotal}</span>
        <button onClick={clearCart} className="text-red-500">Clear Cart</button>
      </div>
      <Link href="/checkout" className="btn-gradient w-full mt-6 block text-center py-3">Proceed to Checkout</Link>
    </div>
  );
}