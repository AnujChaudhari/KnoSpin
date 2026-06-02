"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc, getDoc, collection, query, where, getDocs,
  updateDoc, arrayUnion, increment, orderBy
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import Link from "next/link";

/* ────────── प्रीमियम SVG आइकॉन ────────── */
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const BookOpenIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
  </svg>
);

export default function LessonViewPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId;
  const lessonId = params.lessonId;
  const { user } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [lessons, setLessons] = useState([]); // for navigation
  const [enrollment, setEnrollment] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!courseId || !lessonId || !user) return;
    const fetchData = async () => {
      try {
        // 1. चेक एनरोलमेंट (या फ्री प्रीव्यू के लिए लेसन)
        const enrollmentQuery = query(
          collection(db, "enrollments"),
          where("userId", "==", user.uid),
          where("courseId", "==", courseId)
        );
        const enrollmentSnap = await getDocs(enrollmentQuery);
        const enrolled = !enrollmentSnap.empty;
        let enrollmentData = null;
        if (enrolled) {
          enrollmentData = { id: enrollmentSnap.docs[0].id, ...enrollmentSnap.docs[0].data() };
          setEnrollment(enrollmentData);
          // क्या यह लेसन पहले से पूरा है?
          setCompleted(enrollmentData.completedLessons?.includes(lessonId));
        }

        // 2. फ़ेच करें सभी लेसन (नेविगेशन के लिए) और वर्तमान लेसन
        const lessonsQuery = query(
          collection(db, "courses", courseId, "lessons"),
          orderBy("order", "asc")
        );
        const lessonsSnap = await getDocs(lessonsQuery);
        const allLessons = lessonsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setLessons(allLessons);

        const currentLesson = allLessons.find(l => l.id === lessonId);
        if (!currentLesson) {
          toast.error("Lesson not found");
          router.push(`/courses/${courseId}`);
          return;
        }

        // 3. अगर प्रीमियम कोर्स है और एनरोल्ड नहीं है, तो केवल freePreview दिखाएँ
        // (यह चेक हम पहले से नहीं कर रहे क्योंकि कोर्स का प्राइस चाहिए, लेकिन लेसन में isCoursePublished है)
        // हम मान लेते हैं कि अगर enrolled नहीं है और lesson.freePreview false है, तो पहुँच नहीं देंगे
        if (!enrolled && !currentLesson.freePreview) {
          toast.error("Please enroll to access this lesson");
          router.push(`/courses/${courseId}`);
          return;
        }

        setLesson(currentLesson);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load lesson");
      }
      setLoading(false);
    };
    fetchData();
  }, [courseId, lessonId, user, router]);

  // "पाठ पूरा हुआ" हैंडलर
  const handleComplete = async () => {
    if (!user || !enrollment || completed) return;
    setUpdating(true);
    try {
      const enrollmentRef = doc(db, "enrollments", enrollment.id);
      await updateDoc(enrollmentRef, {
        completedLessons: arrayUnion(lessonId),
        lastAccessedLessonId: lessonId,
      });

      // प्रोग्रेस रीकैलकुलेट
      const updatedSnap = await getDoc(enrollmentRef);
      const updatedData = updatedSnap.data();
      const totalLessons = lessons.length;
      const completedCount = updatedData.completedLessons.length;
      const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
      await updateDoc(enrollmentRef, { progress });

      setCompleted(true);
      toast.success("Lesson marked complete! ✅");
    } catch (err) {
      toast.error("Failed to update progress");
    }
    setUpdating(false);
  };

  // अगला/पिछला लेसन खोजें
  const currentIndex = lessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!lesson) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* वापस कोर्स पर जाएँ */}
      <Link href={`/courses/${courseId}`} className="text-sm text-primary-600 hover:underline mb-4 inline-block">
        ← Back to Course
      </Link>

      {/* लेसन टाइटल और मेटा */}
      <h1 className="text-2xl md:text-3xl font-bold mb-2">{lesson.title}</h1>
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
        <span className="flex items-center gap-1"><ClockIcon /> {lesson.duration || 0} min</span>
        {lesson.freePreview && (
          <span className="text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full text-xs font-medium">Free Preview</span>
        )}
      </div>

      {/* वीडियो प्लेयर */}
      {lesson.videoId && (
        <div className="aspect-video mb-6 rounded-xl overflow-hidden bg-black">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${lesson.videoId}?rel=0&modestbranding=1`}
            title="Lesson Video"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="w-full h-full"
          />
        </div>
      )}

      {/* टेक्स्ट कंटेंट */}
      <div
        className="prose dark:prose-invert max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: lesson.content || "" }}
      />

      {/* पूरा हुआ बटन + नेविगेशन */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t">
        <div>
          {enrollment ? (
            completed ? (
              <span className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircleIcon /> Completed
              </span>
            ) : (
              <button
                onClick={handleComplete}
                disabled={updating}
                className="btn-gradient flex items-center gap-2"
              >
                {updating ? "Saving..." : <><CheckCircleIcon /> Mark Complete</>}
              </button>
            )
          ) : (
            <span className="text-gray-400 text-sm">Enroll to track progress</span>
          )}
        </div>

        <div className="flex gap-4">
          {prevLesson && (
            <Link
              href={`/courses/${courseId}/lessons/${prevLesson.id}`}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <ArrowLeftIcon /> Previous
            </Link>
          )}
          {nextLesson && (
            <Link
              href={`/courses/${courseId}/lessons/${nextLesson.id}`}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Next <ArrowRightIcon />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
