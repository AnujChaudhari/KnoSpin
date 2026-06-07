import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useSubscription() {
  const { user } = useAuth();
  const [tier, setTier] = useState("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetch = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        // Check expiry
        const expiry = data.subscriptionExpiry?.toDate?.();
        if (expiry && expiry < new Date()) {
          setTier("free"); // expired
        } else {
          setTier(data.subscriptionTier || "free");
        }
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  return { tier, loading };
}
