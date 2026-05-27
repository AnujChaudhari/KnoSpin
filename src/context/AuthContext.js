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
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";
import { toast } from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Admin emails jinhe email verification ki zaroorat nahi
const ADMIN_EMAILS = ["kc812213@gmail.com"]; // 🔁 apna admin email dalen

// Generate a random 6‑character uppercase referral code
function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // ---------- check if current user is admin ----------
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

  // ---------- ensure Firestore user document exists ----------
  async function ensureUserDocument(currentUser) {
    if (!currentUser) return;
    const userDocRef = doc(db, "users", currentUser.uid);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      // Create brand new user document
      await setDoc(userDocRef, {
        email: currentUser.email,
        referralCode: generateReferralCode(),
        walletBalance: 0,
        coinBalance: 0,
        totalReferrals: 0,
        referralEarnings: 0,
        referralTier: "bronze",
        createdAt: serverTimestamp(),
      });
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await ensureUserDocument(currentUser);   // ✅ FIX: auto‑create user doc
        await checkAdmin(currentUser.uid);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ---------- SIGNUP with referral ----------
  const signup = async (email, password, referralCodeUsed = null) => {
    // 1. Firebase Auth se account banao
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    // 2. Email verification bhejo
    await sendEmailVerification(newUser);

    // 3. Unique referral code generate karo
    const myReferralCode = generateReferralCode();

    // 4. Firestore mein user document taiyaar karo
    const userData = {
      email: newUser.email,
      referralCode: myReferralCode,
      walletBalance: 0,
      coinBalance: 0,
      totalReferrals: 0,
      referralEarnings: 0,
      referralTier: "bronze",
      createdAt: serverTimestamp(),
    };

    // 5. Agar kisi ne referral code use kiya hai toh process karo
    if (referralCodeUsed) {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("referralCode", "==", referralCodeUsed));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const referrerDoc = querySnapshot.docs[0];
        const referrerId = referrerDoc.id;

        // Record who referred this user
        userData.referredBy = referrerId;

        // Create a referral record (pending – will complete after order delivery)
        await addDoc(collection(db, "referrals"), {
          referrerId: referrerId,
          referredId: newUser.uid,
          referralCode: referralCodeUsed,
          status: "pending",
          rewardAmount: 20,   // ₹20 per successful referral
          rewardCoins: 50,    // 50 coins
          createdAt: serverTimestamp(),
          completedAt: null,
        });
      }
    }

    // 6. Firestore mein user document save karo
    await setDoc(doc(db, "users", newUser.uid), userData);

    // 7. User ko batado aur signout kardo (verification ke liye)
    toast.success("Account created! Please verify your email before login.");
    await signOut(auth);
    return userCredential;
  };

  // ---------- LOGIN (email verified or admin) ----------
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Admin emails ko verification ki zaroorat nahi
    if (ADMIN_EMAILS.includes(email)) {
      return userCredential;
    }

    // Aam user ke liye email verified hona zaroori hai
    if (!userCredential.user.emailVerified) {
      toast.error("Please verify your email first. Check your inbox.");
      await signOut(auth);
      throw new Error("Email not verified");
    }
    return userCredential;
  };

  // ---------- LOGOUT ----------
  const logout = () => signOut(auth);

  // ---------- GOOGLE LOGIN (no referral needed here) ----------
  const googleLogin = () => signInWithPopup(auth, googleProvider);

  // ---------- PASSWORD RESET ----------
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
