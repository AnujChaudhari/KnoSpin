import { doc, updateDoc, getDoc, setDoc, increment, arrayUnion } from "firebase/firestore";
import { db } from "./firebase";

// XP award karne ka function
export const awardXP = async (userId, amount) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { xp: increment(amount) });
  // Level check
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const data = snap.data();
    const newLevel = Math.floor(Math.sqrt((data.xp || 0) / 100));
    if (newLevel > (data.level || 1)) {
      await updateDoc(userRef, { level: newLevel });
      // Level up achievement trigger (optional)
    }
  }
};

// Achievement unlock function
export const unlockAchievement = async (userId, achievementId) => {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;
  const data = snap.data();
  const achievements = data.achievements || [];
  if (achievements.includes(achievementId)) return; // already unlocked
  await updateDoc(userRef, { achievements: arrayUnion(achievementId) });
  // Fetch achievement data to give rewards
  const achSnap = await getDoc(doc(db, "achievements", achievementId));
  if (achSnap.exists()) {
    const ach = achSnap.data();
    await updateDoc(userRef, {
      xp: increment(ach.xpReward || 0),
      coinBalance: increment(ach.coinReward || 0),
    });
  }
};

// Daily login reward
export const claimDailyReward = async (userId) => {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;
  const data = snap.data();
  const today = new Date().toDateString();
  if (data.lastLoginDate === today) return; // already claimed
  let streak = data.dailyStreak || 0;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  streak = (data.lastLoginDate === yesterday) ? streak + 1 : 1;
  const coinBonus = Math.min(streak * 2, 20); // max 20 coins per day
  await updateDoc(userRef, {
    lastLoginDate: today,
    dailyStreak: streak,
    coinBalance: increment(coinBonus),
    xp: increment(10),
  });
  return { streak, coins: coinBonus };
};
