"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { toast } from "react-hot-toast";

export default function AdminGroupMembersPage() {
  const params = useParams();
  const groupId = params.groupId;
  const [members, setMembers] = useState([]);

  const fetchMembers = async () => {
    const snap = await getDocs(collection(db, "groups", groupId, "members"));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setMembers(list);
  };

  useEffect(() => { fetchMembers(); }, [groupId]);

  const handleRemove = async (memberId) => {
    if (confirm("Remove this member from the group?")) {
      await deleteDoc(doc(db, "groups", groupId, "members", memberId));
      toast.success("Member removed");
      fetchMembers();
    }
  };

  return (
    <div className="p-4 md:p-0">
      <h2 className="text-2xl font-bold mb-4">Group Members</h2>
      <div className="space-y-3">
        {members.map(member => (
          <div key={member.id} className="card flex justify-between items-center">
            <div>
              <p className="font-medium">{member.userId?.slice(0, 8)}...</p>
              <p className="text-xs text-gray-500">Role: {member.role}</p>
            </div>
            <button
              onClick={() => handleRemove(member.id)}
              className="text-red-500 hover:underline text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
