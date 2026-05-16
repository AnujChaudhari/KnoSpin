"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  updateDoc,
  increment,
} from "firebase/firestore";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCart([]);
      setLoading(false);
      return;
    }
    const cartRef = doc(db, "carts", user.uid);
    const unsub = onSnapshot(cartRef, (snap) => {
      if (snap.exists()) {
        setCart(snap.data().items || []);
      } else {
        setCart([]);
      }
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const saveCart = async (items) => {
    if (!user) return;
    const cartRef = doc(db, "carts", user.uid);
    await setDoc(cartRef, { items }, { merge: true });
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
          image: product.images[0],
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
      await deleteDoc(doc(db, "carts", user.uid));
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