import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";

export async function POST(request) {
  const { userId } = await request.json();
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const data = userSnap.data();
  const now = new Date();
  const lastSpin = data.lastSpinAt?.toDate?.();
  const cooldownHours = 24;

  if (lastSpin && (now - lastSpin) < cooldownHours * 60 * 60 * 1000) {
    const nextAvailable = new Date(lastSpin.getTime() + cooldownHours * 60 * 60 * 1000);
    return NextResponse.json({ error: "Cooldown active", nextAvailable: nextAvailable.toISOString() }, { status: 429 });
  }

  const win = Math.floor(Math.random() * 100) + 1; // 1–100 coins

  await updateDoc(userRef, {
    coins: increment(win),
    lastSpinAt: serverTimestamp(),
    totalSpins: increment(1),
    xp: increment(5),
  });

  return NextResponse.json({ coins: win, message: `You won ${win} coins!` });
}
