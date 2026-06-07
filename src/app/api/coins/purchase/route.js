// src/app/api/coins/purchase/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
} from "firebase/firestore";

export async function POST(request) {
  try {
    const { userId, productId } = await request.json();

    // 1. Basic validation
    if (!userId || !productId) {
      return NextResponse.json(
        { error: "Missing userId or productId" },
        { status: 400 }
      );
    }

    // 2. Fetch product
    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const product = productSnap.data();

    // 3. Ensure product is digital and has a coin price
    if (!product.isDigital || !product.coinPrice || product.coinPrice <= 0) {
      return NextResponse.json(
        { error: "This product cannot be purchased with coins" },
        { status: 400 }
      );
    }

    // 4. Fetch user
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userData = userSnap.data();

    // 5. Check coin balance
    const currentCoins = userData.coins || 0;
    if (currentCoins < product.coinPrice) {
      return NextResponse.json(
        {
          error: `Insufficient coins. You have ${currentCoins} coins, but need ${product.coinPrice}.`,
        },
        { status: 400 }
      );
    }

    // 6. Deduct coins
    await updateDoc(userRef, {
      coins: increment(-product.coinPrice),
    });

    // 7. Create download token
    const token =
      Math.random().toString(36).substring(2) + Date.now().toString(36);
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

    // 8. Record transaction in wallet_transactions
    await addDoc(collection(db, "wallet_transactions"), {
      userId,
      type: "purchase",
      amount: 0,
      coins: -product.coinPrice,
      description: `Coins used to purchase "${product.name}"`,
      productId,
      createdAt: serverTimestamp(),
    });

    // 9. Return success with download token
    return NextResponse.json({ success: true, downloadToken: token });
  } catch (error) {
    console.error("Coins purchase error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
