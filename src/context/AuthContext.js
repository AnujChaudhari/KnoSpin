"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";
import { toast } from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  async function checkAdmin(uid) {
    if (!uid) {
      setIsAdmin(false);
      return;
    }
    try {
      const docRef = doc(db, "admins", uid);
      const snap = await getDoc(docRef);
      setIsAdmin(snap.exists());
    } catch (error) {
      console.error("Admin check failed:", error);
      setIsAdmin(false);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await checkAdmin(currentUser.uid);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // साइनअप – अकाउंट बनाने के बाद ईमेल वेरिफ़िकेशन भेजें
  const signup = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    toast.success("Account created! Please verify your email before login.");
    // साइनअप के बाद ऑटो लॉगिन न करें – वेरिफ़िकेशन ज़रूरी है
    await signOut(auth);
    return userCredential;
  };

  // लॉगिन – ईमेल वेरिफ़िकेशन चेक करें
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential.user.emailVerified) {
      toast.error("Please verify your email first. Check your inbox.");
      await signOut(auth);
      throw new Error("Email not verified");
    }
    return userCredential;
  };

  const logout = () => signOut(auth);

  const googleLogin = () => signInWithPopup(auth, googleProvider);

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const value = {
    user,
    loading,
    isAdmin,
    signup,
    login,
    logout,
    googleLogin,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
