import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const sendNotification = async (userId, type, title, message, link = "") => {
  try {
    await addDoc(collection(db, "notifications"), {
      userId,
      type,
      title,
      message,
      link,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Failed to send notification", err);
  }
};
