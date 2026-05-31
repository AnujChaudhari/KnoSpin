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
  updateDoc,
  increment,
} from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";
import { toast } from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// एडमिन ईमेल जिन्हें ईमेल वेरिफ़िकेशन की ज़रूरत नहीं
const ADMIN_EMAILS = ["kc812213@gmail.com"];

// 6-अक्षर का रेफ़रल कोड बनाएँ
function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // ---------- एडमिन स्टेटस चेक ----------
  async function checkAdmin(uid) {
    if (!uid) {
      setIsAdmin(false);
      return;
    }
    try {
      const snap = await getDoc(doc(db, "admins", uid));
      setIsAdmin(snap.exists());
    } catch (error) {
      console.error("Admin check failed:", error);
      setIsAdmin(false);
    }
  }

  // ---------- यूज़र डॉक्युमेंट अपने आप बनाएँ (गैमिफ़िकेशन फ़ील्ड्स के साथ) ----------
  async function ensureUserDocument(currentUser) {
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        email: currentUser.email,
        referralCode: generateReferralCode(),
        walletBalance: 0,
        coinBalance: 10,            // साइनअप बोनस
        totalReferrals: 0,
        referralEarnings: 0,
        referralTier: "bronze",
        xp: 50,                     // शुरुआती XP
        level: 1,
        achievements: [],
        dailyStreak: 0,
        referralStreak: 0,
        lastLoginDate: null,
        createdAt: serverTimestamp(),
      });
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await ensureUserDocument(currentUser);
        await checkAdmin(currentUser.uid);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ---------- साइनअप (रेफ़रल + पिरामिड बोनस ट्रैकिंग) ----------
  const signup = async (email, password, referralCodeUsed = null) => {
    // 1. Firebase Auth खाता बनाएँ
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    // 2. ईमेल वेरिफ़िकेशन भेजें
    await sendEmailVerification(newUser);

    // 3. अपना रेफ़रल कोड बनाएँ
    const myReferralCode = generateReferralCode();

    // 4. Firestore में यूज़र दस्तावेज़ तैयार करें
    const userData = {
      email: newUser.email,
      referralCode: myReferralCode,
      walletBalance: 0,
      coinBalance: 10,          // साइनअप बोनस
      totalReferrals: 0,
      referralEarnings: 0,
      referralTier: "bronze",
      xp: 50,                   // शुरुआती XP
      level: 1,
      achievements: [],
      dailyStreak: 0,
      referralStreak: 0,
      lastLoginDate: null,
      createdAt: serverTimestamp(),
    };

    // 5. अगर रेफ़रल कोड इस्तेमाल किया गया है
    if (referralCodeUsed) {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("referralCode", "==", referralCodeUsed));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const referrerDoc = snap.docs[0];
        const referrerId = referrerDoc.id;
        const referrerData = referrerDoc.data();

        // नए यूज़र को बताएँ कि किसने रेफ़र किया
        userData.referredBy = referrerId;

        // रेफ़रल दस्तावेज़ बनाएँ (पूरा होने पर रिवॉर्ड मिलेगा)
        await addDoc(collection(db, "referrals"), {
          referrerId: referrerId,
          referredId: newUser.uid,
          referralCode: referralCodeUsed,
          status: "pending",
          rewardAmount: 20,
          rewardCoins: 50,          // रेफ़रर को 50 coins
          pyramidRewardGiven: false,
          createdAt: serverTimestamp(),
          completedAt: null,
        });

        // पिरामिड बोनस ट्रैकिंग: अगर रेफ़रर खुद किसी का रेफ़र है
        if (referrerData.referredBy) {
          const originalReferrerId = referrerData.referredBy;
          // पिरामिड बोनस के लिए अलग रेफ़रल रिकॉर्ड (5 coins)
          await addDoc(collection(db, "referrals"), {
            referrerId: originalReferrerId,
            referredId: newUser.uid,
            referralCode: referralCodeUsed,
            status: "pending",
            rewardAmount: 0,
            rewardCoins: 5,         // पिरामिड बोनस
            isPyramid: true,
            originalReferrer: referrerId,
            createdAt: serverTimestamp(),
            completedAt: null,
          });
        }
      }
    }

    // 6. Firestore में यूज़र दस्तावेज़ सेव करें
    await setDoc(doc(db, "users", newUser.uid), userData);

    // 7. सफलता संदेश और साइन आउट
    toast.success("Account created! Please verify your email before login.");
    await signOut(auth);
    return userCredential;
  };

  // ---------- लॉगिन (एडमिन / वेरिफ़ाइड यूज़र) ----------
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // एडमिन ईमेल को वेरिफ़िकेशन से छूट
    if (ADMIN_EMAILS.includes(email)) {
      return userCredential;
    }

    // आम यूज़र के लिए ईमेल वेरिफ़िकेशन अनिवार्य
    if (!userCredential.user.emailVerified) {
      toast.error("Please verify your email first. Check your inbox.");
      await signOut(auth);
      throw new Error("Email not verified");
    }
    return userCredential;
  };

  // ---------- लॉगआउट ----------
  const logout = () => signOut(auth);

  // ---------- गूगल लॉगिन ----------
  const googleLogin = () => signInWithPopup(auth, googleProvider);

  // ---------- पासवर्ड रीसेट ----------
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
