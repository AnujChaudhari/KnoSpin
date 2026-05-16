import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generatedSignature === razorpay_signature) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false }, { status: 400 });
}