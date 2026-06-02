"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import Link from "next/link";

/* ────────── प्रीमियम SVG आइकॉन ────────── */
const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
  </svg>
);
const BookOpenIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
  </svg>
);
const PlayIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
);
const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M19 12H5m7-7l-7 7 7 7"/>
  </svg>
);

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId;
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  // Fetch course + lessons + enrollment status
  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        const courseSnap = await getDoc(doc(db, "courses", courseId));
        if (!courseSnap.exists()) {
          toast.error("Course not found");
          setLoading(false);
          return;
        }
        const data = courseSnap.data();
        if (!data.isPublished) {
          toast.error("Course not available");
          setLoading(false);
          return;
        }
        setCourse({ id: courseSnap.id, ...data });

        // Fetch lessons subcollection (NO orderBy → client sort)
        const lessonsSnap = await getDocs(collection(db, "courses", courseId, "lessons"));
        const list = lessonsSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setLessons(list);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load course");
      }
      setLoading(false);
    };

    fetchCourse();
  }, [courseId]);

  // Check enrollment
  useEffect(() => {
    if (!user || !courseId) return;
    const check = async () => {
      const q = query(
        collection(db, "enrollments"),
        where("userId", "==", user.uid),
        where("courseId", "==", courseId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) setEnrolled(true);
    };
    check();
  }, [user, courseId]);

  // Free enrollment handler
  const handleFreeEnroll = async () => {
    if (!user) {
      toast.error("Please login to enroll");
      return;
    }
    if (enrolled) {
      toast.error("Already enrolled!");
      return;
    }
    setEnrolling(true);
    try {
      await addDoc(collection(db, "enrollments"), {
        userId: user.uid,
        courseId: courseId,
        enrolledAt: serverTimestamp(),
        completedLessons: [],
        progress: 0,
        lastAccessedLessonId: "",
      });
      await updateDoc(doc(db, "courses", courseId), {
        totalStudents: increment(1)
      });
      setEnrolled(true);
      toast.success("Enrolled successfully! 🎉");
    } catch (err) {
      toast.error("Enrollment failed, please try again");
    }
    setEnrolling(false);
  };

  // Premium placeholder
  const handlePremiumBuy = () => {
    toast("Premium enrollment coming soon! 🚀", { icon: '💎' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link href="/courses" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeftIcon /> Back to courses
      </Link>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div>
          <img
            src={course.thumbnail || "https://via.placeholder.com/600x400?text=Course+Image"}
            alt={course.title}
            className="w-full rounded-2xl shadow-lg"
            onError={(e) => { e.target.src = "https://via.placeholder.com/600x400?text=Course+Image"; }}
          />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold">{course.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><UserIcon /> {course.instructor || "Instructor"}</span>
            <span className="flex items-center gap-1"><BookOpenIcon /> {course.totalStudents || 0} learners</span>
          </div>

          {course.price === 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-green-600">Free</span>
              {!enrolled ? (
                <button
                  onClick={handleFreeEnroll}
                  disabled={enrolling}
                  className="btn-gradient ml-4 flex items-center gap-2"
                >
                  {enrolling ? "Enrolling..." : "Enroll for Free 🆓"}
                </button>
              ) : (
                <span className="ml-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full font-medium flex items-center gap-1">
                  <CheckIcon /> Enrolled
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-purple-600">₹{course.price}</span>
              <button
                onClick={handlePremiumBuy}
                className="btn-gradient ml-4 flex items-center gap-2"
              >
                Buy Now 💎
              </button>
            </div>
          )}

          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{course.description}</p>
        </div>
      </div>

      {/* Lessons list */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Course Curriculum 📖</h2>
        {lessons.length === 0 && <p className="text-gray-500">No lessons added yet.</p>}
        <div className="space-y-3">
          {lessons.map((lesson, idx) => (
            <div key={lesson.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400">{String(idx+1).padStart(2, '0')}</span>
                <div>
                  <p className="font-medium">{lesson.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><ClockIcon /> {lesson.duration || 0} min</span>
                    {lesson.freePreview && <span className="text-green-600 font-medium">Free Preview</span>}
                  </div>
                </div>
              </div>
              <div>
                {lesson.freePreview || enrolled ? (
                  <Link
                    href={`/courses/${courseId}/lessons/${lesson.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                  >
                    <PlayIcon /> Play
                  </Link>
                ) : (
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                    <LockIcon /> Locked
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
