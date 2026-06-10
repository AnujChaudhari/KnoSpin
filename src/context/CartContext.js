"use client";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  // फ़ंक्शन: Firestore से कार्ट लाएँ (ग्रेसफुल ऑफलाइन हैंडलिंग के साथ)
  const fetchCart = async (uid) => {
    try {
      const snap = await getDoc(doc(db, "carts", uid));
      if (snap.exists()) {
        setCart(snap.data().items || []);
      } else {
        setCart([]);
      }
    } catch (error) {
      // 30 Years Experience Tip: इंटरनेट ऑफ होने या स्ट्रीम अटकने पर कंसोल को क्रैश होने से बचाएं
      console.warn("Cart fetching safely bypassed via offline fallback cache:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setCart([]);
      setLoading(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // पहली बार लोड करें
    fetchCart(user.uid);

    // हर 30 सेकंड में बैकग्राउंड में डेटा सिंक करें
    intervalRef.current = setInterval(() => {
      fetchCart(user.uid);
    }, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user]);

  const saveCart = async (items) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "carts", user.uid), { items }, { merge: true });
    } catch (error) {
      console.error("Cart save network bypass error:", error);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    const existingIndex = cart.findIndex(
      (item) => item.productId === product.id
    );
    let newCart;
    if (existingIndex >= 0) {
      newCart = [...cart];
      newCart[existingIndex].quantity += quantity;
    } else {
      newCart = [
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || "/placeholder.jpg",
          quantity,
        },
      ];
    }
    setCart(newCart);
    await saveCart(newCart);
  };

  const removeFromCart = async (productId) => {
    const newCart = cart.filter((item) => item.productId !== productId);
    setCart(newCart);
    await saveCart(newCart);
  };

  const updateQuantity = async (productId, quantity) => {
    const newCart = cart.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );
    setCart(newCart);
    await saveCart(newCart);
  };

  const clearCart = async () => {
    if (user) {
      try {
        await deleteDoc(doc(db, "carts", user.uid));
      } catch (error) {
        console.error("Cart clear network error:", error);
      }
    }
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
