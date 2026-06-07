import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // or service account JSON
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}
const db = getFirestore();

export async function POST(req: NextRequest) {
  try {
    const { groupId, callerName, callerId } = await req.json();

    const membersSnap = await db.collection("groups").doc(groupId).collection("members").get();
    const memberIds = membersSnap.docs.map((doc) => doc.data().userId).filter((id) => id !== callerId);

    const tokens: string[] = [];
    for (const uid of memberIds) {
      const tokenDoc = await db.collection("fcmTokens").doc(uid).get();
      if (tokenDoc.exists) tokens.push(tokenDoc.data()!.token);
    }

    if (tokens.length === 0) {
      return NextResponse.json({ success: false, message: "No active tokens" });
    }

    const callRoom = `Group_${groupId.replace(/[^a-zA-Z0-9]/g, "_")}`;

    const message = {
      tokens,
      notification: {
        title: `📞 ${callerName} started a group call`,
        body: "Tap to join the call",
      },
      data: { callRoom, groupId, type: "group-call" },
      android: { priority: "high" as const, notification: { sound: "default", channelId: "group_calls" } },
      apns: { payload: { aps: { sound: "default" } } },
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    return NextResponse.json({ success: true, successCount: response.successCount });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
