"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }
    const docRef = doc(db, "wishlists", user.uid);
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setWishlist(snap.data().items || []);
      } else {
        setWishlist([]);
      }
    });
    return unsub;
  }, [user]);

  const toggleWishlist = async (productId) => {
    const exists = wishlist.includes(productId);
    let newList;
    if (exists) {
      newList = wishlist.filter((id) => id !== productId);
    } else {
      newList = [...wishlist, productId];
    }
    setWishlist(newList);
    if (user) {
      await setDoc(doc(db, "wishlists", user.uid), { items: newList });
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}
