import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment, serverTimestamp, addDoc, collection } from "firebase/firestore";

export async function POST(request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      return NextResponse.json({ error: "User document not found" }, { status: 404 });
    }

    const data = userSnap.data();

    // ✅ केवल free users ही spin कर सकते हैं
    if (data.subscriptionTier && data.subscriptionTier !== "free") {
      return NextResponse.json({ error: "Spin is only for free users" }, { status: 403 });
    }

    // 24 घंटे का cooldown
    const now = new Date();
    const lastSpin = data.lastSpinAt?.toDate?.();
    const cooldownMs = 24 * 60 * 60 * 1000;
    if (lastSpin && (now - lastSpin) < cooldownMs) {
      const nextAvailable = new Date(lastSpin.getTime() + cooldownMs);
      return NextResponse.json({
        error: "Already spun today. Come back tomorrow.",
        nextAvailable: nextAvailable.toISOString(),
      }, { status: 429 });
    }

    // 1–100 रैंडम coins
    const win = Math.floor(Math.random() * 100) + 1;

    // ✅ सही फ़ील्ड नाम `coinBalance` का उपयोग करें
    await updateDoc(userRef, {
      coinBalance: increment(win),   // ✅ यहाँ बदलाव – `coins` नहीं
      lastSpinAt: serverTimestamp(),
      xp: increment(5),
      totalSpins: increment(1),
    });

    // वॉलेट ट्रांज़ैक्शन रिकॉर्ड (ऐच्छिक, लेकिन अच्छा)
    await addDoc(collection(db, "wallet_transactions"), {
      userId,
      type: "admin_bonus",
      amount: 0,
      coins: win,
      description: "Daily spin reward",
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ coins: win, message: `You won ${win} coins!` });
  } catch (error) {
    console.error("Spin API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
