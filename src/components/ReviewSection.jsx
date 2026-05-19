"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

export default function ReviewSection({ productId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;
    const fetchReviews = async () => {
      const q = query(collection(db, "reviews"), where("productId", "==", productId), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchReviews();
  }, [productId]);

  const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "No rating";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to submit a review");
      return;
    }
    if (!comment.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "reviews"), {
        productId,
        userId: user.uid,
        userName: user.email,
        rating,
        comment,
        createdAt: serverTimestamp(),
      });
      setComment("");
      setRating(5);
      toast.success("Review submitted!");
      const q = query(collection(db, "reviews"), where("productId", "==", productId), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      toast.error("Failed to submit review");
    }
    setLoading(false);
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Reviews & Ratings</h3>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl font-bold">{avgRating}</span>
        <span className="text-yellow-500 text-lg">⭐</span>
        <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
      </div>
      <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-xl bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <label>Your Rating:</label>
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="input-field w-20">
            {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n>1?'s':''}</option>)}
          </select>
        </div>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write your review..." className="input-field" rows={3}></textarea>
        <button type="submit" disabled={loading} className="btn-gradient mt-2">
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
      <div className="space-y-3">
        {reviews.map(review => (
          <div key={review.id} className="border-b pb-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{review.userName}</span>
              <span className="text-yellow-500">{"⭐".repeat(review.rating)}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
