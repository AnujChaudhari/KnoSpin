"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export default function AchievementsPage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [allAchievements, setAllAchievements] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (userSnap.exists()) setUserData(userSnap.data());
      const achSnap = await getDocs(collection(db, "achievements"));
      setAllAchievements(achSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetch();
  }, [user]);

  if (!user) return <p>Please login.</p>;
  if (!userData) return <p>Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">🏆 Achievements</h1>
      <div className="grid grid-cols-2 gap-4">
        {allAchievements.map(ach => {
          const unlocked = userData.achievements?.includes(ach.id);
          return (
            <div key={ach.id} className={`card ${unlocked ? 'bg-green-50 dark:bg-green-900/20' : 'opacity-50'}`}>
              <span className="text-2xl">{ach.icon}</span>
              <h3 className="font-bold">{ach.name}</h3>
              <p className="text-xs">{ach.description}</p>
              {!unlocked && <span className="text-xs text-gray-400">Locked</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
