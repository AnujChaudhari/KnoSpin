"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { HiStar } from "react-icons/hi";

export default function ReviewSection({ productId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (!productId) return;
    const fetchReviews = async () => {
      const q = query(collection(db, "reviews"), where("productId", "==", productId), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchReviews();
  }, [productId]);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error("Please login to submit a review"); return; }
    if (!comment.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "reviews"), {
        productId,
        userId: user.uid,
        userName: user.email?.split('@')[0] || "User",
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
    } catch (err) { toast.error("Failed to submit review"); }
    setLoading(false);
  };

  return (
    <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
      <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>
      
      {/* Average Rating */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
        <span className="text-4xl font-bold text-primary-600">{avgRating}</span>
        <div>
          <div className="flex text-yellow-500 text-lg">
            {[1,2,3,4,5].map(i => (
              <HiStar key={i} className={i <= Math.round(Number(avgRating)) ? "text-yellow-500" : "text-gray-300"} />
            ))}
          </div>
          <p className="text-sm text-gray-500">{reviews.length} reviews</p>
        </div>
      </div>

      {/* Review Form */}
      {user && (
        <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-xl bg-gray-50 dark:bg-gray-700">
          <p className="font-medium mb-3">Write a Review</p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">Your Rating:</span>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-2xl focus:outline-none"
                >
                  <HiStar className={i <= (hoverRating || rating) ? "text-yellow-500" : "text-gray-300"} />
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            className="input-field"
            rows={3}
          />
          <button type="submit" disabled={loading} className="btn-gradient mt-3">
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 && !user && <p className="text-gray-500">No reviews yet. Login to write one!</p>}
        {reviews.map(review => (
          <div key={review.id} className="border-b pb-4 last:border-0">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-sm">
                  {review.userName?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="font-medium text-sm">{review.userName}</span>
              </div>
              <div className="flex text-yellow-500 text-sm">
                {[1,2,3,4,5].map(i => (
                  <HiStar key={i} className={i <= review.rating ? "text-yellow-500" : "text-gray-300"} />
                ))}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
