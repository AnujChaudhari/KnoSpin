"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, where, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import Link from "next/link";

/* ────────── Premium SVG Icons ────────── */
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M19 12H5m7-7l-7 7 7 7"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M5 12h14m-7-7l7 7-7 7"/>
  </svg>
);
const PlayIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
);
const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);
const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

export default function LessonViewPage() {
  const params = useParams();
  const courseId = params.courseId;
  const lessonId = params.lessonId;
  const router = useRouter();
  const { user } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!courseId || !lessonId) return;

    const fetchData = async () => {
      try {
        // Fetch course
        const courseSnap = await getDoc(doc(db, "courses", courseId));
        if (!courseSnap.exists()) {
          toast.error("Course not found");
          setLoading(false);
          return;
        }
        const courseData = courseSnap.data();
        if (!courseData.isPublished) {
          toast.error("Course not available");
          setLoading(false);
          return;
        }
        setCourse({ id: courseSnap.id, ...courseData });

        // Fetch all lessons (client-side sort)
        const lessonsSnap = await getDocs(collection(db, "courses", courseId, "lessons"));
        const lessonsList = lessonsSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setAllLessons(lessonsList);

        // Find current lesson
        const currentLesson = lessonsList.find(l => l.id === lessonId);
        if (!currentLesson) {
          toast.error("Lesson not found");
          setLoading(false);
          return;
        }
        setLesson(currentLesson);

        // Check access
        if (!currentLesson.freePreview) {
          if (!user) {
            toast.error("Please login to access this lesson");
            router.push(`/courses/${courseId}`);
            return;
          }
          // Check enrollment
          const enrollQuery = query(
            collection(db, "enrollments"),
            where("userId", "==", user.uid),
            where("courseId", "==", courseId)
          );
          const enrollSnap = await getDocs(enrollQuery);
          if (enrollSnap.empty) {
            toast.error("Please enroll to view this lesson");
            router.push(`/courses/${courseId}`);
            return;
          }
          const enrollmentData = { id: enrollSnap.docs[0].id, ...enrollSnap.docs[0].data() };
          setEnrollment(enrollmentData);
          setCompleted(enrollmentData.completedLessons?.includes(lessonId) || false);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load lesson");
      }
      setLoading(false);
    };

    fetchData();
  }, [courseId, lessonId, user, router]);

  // Mark lesson as complete
  const handleMarkComplete = async () => {
    if (!user || !enrollment) {
      toast.error("You need to enroll first");
      return;
    }
    if (completed) {
      toast("Already marked as complete!");
      return;
    }
    setSaving(true);
    try {
      const updatedCompletedLessons = [...(enrollment.completedLessons || []), lessonId];
      const totalLessons = allLessons.length;
      const completedCount = updatedCompletedLessons.length;
      const progress = Math.round((completedCount / totalLessons) * 100);

      await updateDoc(doc(db, "enrollments", enrollment.id), {
        completedLessons: updatedCompletedLessons,
        progress: progress,
        lastAccessedLessonId: lessonId,
      });

      setEnrollment({
        ...enrollment,
        completedLessons: updatedCompletedLessons,
        progress: progress,
        lastAccessedLessonId: lessonId,
      });
      setCompleted(true);
      toast.success("Lesson marked complete! 🎉");
    } catch (err) {
      toast.error("Failed to update progress");
    }
    setSaving(false);
  };

  // Navigation helpers
  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!lesson || !course) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back to course link */}
      <Link
        href={`/courses/${courseId}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6"
      >
        <ArrowLeftIcon /> Back to {course.title}
      </Link>

      <div className="space-y-6">
        {/* Lesson Title + Duration */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{lesson.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1"><ClockIcon /> {lesson.duration || 0} min</span>
            {lesson.freePreview && (
              <span className="text-green-600 font-medium">Free Preview</span>
            )}
            {completed && (
              <span className="text-green-600 font-medium flex items-center gap-1">
                <CheckCircleIcon /> Completed
              </span>
            )}
          </div>
        </div>

        {/* YouTube Embed */}
        {lesson.videoId && (
          <div className="aspect-video rounded-2xl overflow-hidden shadow-lg bg-black">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${lesson.videoId}?rel=0&modestbranding=1`}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        )}

        {/* Text Content */}
        {lesson.content && (
          <div
            className="card prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: lesson.content }}
          />
        )}

        {/* Mark Complete Button (enrolled users only) */}
        {enrollment && (
          <div className="flex justify-center pt-4">
            <button
              onClick={handleMarkComplete}
              disabled={completed || saving}
              className={`btn-gradient flex items-center gap-2 ${
                completed ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {completed ? (
                <>
                  <CheckCircleIcon /> Completed
                </>
              ) : saving ? (
                'Saving...'
              ) : (
                <>
                  <CheckCircleIcon /> Mark as Complete
                </>
              )}
            </button>
          </div>
        )}

        {/* Previous / Next Navigation */}
        <div className="flex justify-between items-center pt-6 border-t">
          {prevLesson ? (
            <Link
              href={`/courses/${courseId}/lessons/${prevLesson.id}`}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              <ArrowLeftIcon /> {prevLesson.title}
            </Link>
          ) : (
            <div />
          )}
          {nextLesson ? (
            <Link
              href={`/courses/${courseId}/lessons/${nextLesson.id}`}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              {nextLesson.title} <ArrowRightIcon />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
