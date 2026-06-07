import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment, setDoc, serverTimestamp } from "firebase/firestore";

export async function POST(request) {
  const { productId } = await request.json();
  const userId = request.headers.get("x-user-id"); // आपको क्लाइंट से भेजना होगा या सेशन से लें
  if (!userId || !productId) {
    return NextResponse.json({ error: "Missing userId or productId" }, { status: 400 });
  }

  // 1. प्रोडक्ट और यूजर की जानकारी लें
  const productRef = doc(db, "products", productId);
  const productSnap = await getDoc(productRef);
  if (!productSnap.exists()) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  const product = productSnap.data();
  if (!product.isDigital || !product.coinPrice) {
    return NextResponse.json({ error: "Not a purchasable digital product" }, { status: 400 });
  }

  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const userData = userSnap.data();

  // 2. कोइन बैलेंस चेक
  if ((userData.coins || 0) < product.coinPrice) {
    return NextResponse.json({ error: "Insufficient coins" }, { status: 400 });
  }

  // 3. कोइन काटें
  await updateDoc(userRef, {
    coins: increment(-product.coinPrice),
  });

  // 4. डाउनलोड टोकन बनाएँ
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  await setDoc(doc(db, "downloads", token), {
    userId,
    productId,
    productName: product.name,
    downloadCount: 0,
    downloadLimit: product.downloadLimit || 5,
    digitalFileUrl: product.digitalFileUrl || null,
    digitalUrl: product.digitalUrl || null,
    orderId: "coins_purchase",
    createdAt: serverTimestamp(),
  });

  // 5. वॉलेट ट्रांजेक्शन रिकॉर्ड
  await addDoc(collection(db, "wallet_transactions"), {
    userId,
    type: "purchase",
    amount: 0,
    coins: -product.coinPrice,
    description: `Coins used to purchase ${product.name}`,
    productId,
    createdAt: serverTimestamp(),
  });

  return NextResponse.json({ success: true, downloadToken: token });
}
