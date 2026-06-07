import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request) {
  const { plan, cycle } = await request.json();

  const prices = {
    premium_lite: { yearly: 349, monthly: 32 },
    premium_pro: { yearly: 599, monthly: 56 },
  };

  const amount = prices[plan]?.[cycle] * 100; // paise mein
  if (!amount) return NextResponse.json({ error: "Invalid plan or cycle" }, { status: 400 });

  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: `sub_${Date.now()}`,
  });

  return NextResponse.json(order);
}
