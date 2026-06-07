import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";

export async function POST(request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ error: "User document not found. Please complete signup." }, { status: 404 });
    }

    const data = userSnap.data();

    // 🔒 केवल free users spin kar sakte hain
    if (data.subscriptionTier && data.subscriptionTier !== "free") {
      return NextResponse.json({ error: "Spin is only available for free users." }, { status: 403 });
    }

    // ⏳ Cooldown check (24 घंटे)
    const now = new Date();
    const lastSpin = data.lastSpinAt?.toDate?.();
    const cooldownMs = 24 * 60 * 60 * 1000; // 24 hours

    if (lastSpin && (now - lastSpin) < cooldownMs) {
      const nextAvailable = new Date(lastSpin.getTime() + cooldownMs);
      return NextResponse.json({
        error: "Already spun today. Come back tomorrow.",
        nextAvailable: nextAvailable.toISOString(),
      }, { status: 429 });
    }

    // 🎲 Random coins (1–100)
    const win = Math.floor(Math.random() * 100) + 1;

    // ✅ सही field name: coinBalance (na ki coins)
    await updateDoc(userRef, {
      coinBalance: increment(win),
      lastSpinAt: serverTimestamp(),
      totalSpins: increment(1),
      xp: increment(5),
    });

    return NextResponse.json({
      coins: win,
      message: `You won ${win} coins!`,
    });
  } catch (error) {
    console.error("Spin API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
