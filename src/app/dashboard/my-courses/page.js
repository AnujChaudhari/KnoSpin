"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import Link from "next/link";

/* ────────── Premium SVG Icons ────────── */
const BookOpenIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
  </svg>
);

const PlayIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
);

const TestIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);

const CertificateIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M5 12h14m-7-7l7 7-7 7"/>
  </svg>
);

const ProgressBar = ({ progress }) => (
  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mt-2">
    <div
      className="bg-gradient-to-r from-primary-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
      style={{ width: `${progress}%` }}
    />
  </div>
);

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [coursesMap, setCoursesMap] = useState({});
  const [certificatesMap, setCertificatesMap] = useState({}); // courseId -> certId
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch enrollments
        const q = query(
          collection(db, "enrollments"),
          where("userId", "==", user.uid)
        );
        const snap = await getDocs(q);
        let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Client-side sort: newest first
        list.sort((a, b) => (b.enrolledAt?.toMillis() || 0) - (a.enrolledAt?.toMillis() || 0));

        setEnrollments(list);

        // Fetch course details for each enrollment (batch)
        const courseIds = [...new Set(list.map(e => e.courseId))];
        const courseMap = {};
        for (const cid of courseIds) {
          const courseSnap = await getDoc(doc(db, "courses", cid));
          if (courseSnap.exists()) {
            courseMap[cid] = { id: courseSnap.id, ...courseSnap.data() };
          }
        }
        setCoursesMap(courseMap);

        // Fetch certificates for this user and these courses
        const certQuery = query(
          collection(db, "certificates"),
          where("userId", "==", user.uid),
          where("courseId", "in", courseIds)
        );
        const certSnap = await getDocs(certQuery);
        const certMap = {};
        certSnap.docs.forEach(d => {
          const data = d.data();
          certMap[data.courseId] = d.id;
        });
        setCertificatesMap(certMap);
      } catch (err) {
        console.error("Failed to load enrollments:", err);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-xl mb-4">Please login to view your courses.</p>
        <Link href="/login" className="btn-gradient inline-block">Login</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">My Courses 📚</h1>
      <p className="text-gray-500 mb-8">Continue where you left off</p>

      {enrollments.length === 0 && (
        <div className="text-center py-20">
          <BookOpenIcon />
          <p className="text-gray-500 mt-4">You haven't enrolled in any course yet.</p>
          <Link href="/courses" className="btn-gradient mt-4 inline-block">Browse Courses</Link>
        </div>
      )}

      <div className="space-y-4">
        {enrollments.map(enrollment => {
          const course = coursesMap[enrollment.courseId];
          if (!course) return null; // Course might have been deleted

          const certId = certificatesMap[course.id]; // undefined if no certificate

          return (
            <div key={enrollment.id} className="card flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Thumbnail */}
              <div className="w-full sm:w-24 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                <img
                  src={course.thumbnail || "https://via.placeholder.com/96x64?text=Course"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/96x64?text=Course"; }}
                />
              </div>

              {/* Info + Progress */}
              <div className="flex-grow">
                <Link href={`/courses/${course.id}`} className="font-bold text-lg hover:text-primary-600">
                  {course.title}
                </Link>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <span>{enrollment.progress || 0}% complete</span>
                  <ProgressBar progress={enrollment.progress || 0} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {/* Continue / Start Lesson */}
                <Link
                  href={
                    enrollment.lastAccessedLessonId
                      ? `/courses/${course.id}/lessons/${enrollment.lastAccessedLessonId}`
                      : `/courses/${course.id}`
                  }
                  className="btn-gradient text-sm flex items-center gap-2 whitespace-nowrap"
                >
                  {enrollment.progress > 0 ? "Continue" : "Start"} <PlayIcon />
                </Link>

                {/* Certificate or Test Button */}
                {certId ? (
                  <Link
                    href={`/courses/${course.id}/certificate?certId=${certId}`}
                    className="bg-green-500 hover:bg-green-600 text-white text-sm flex items-center gap-1 px-3 py-1.5 rounded-lg whitespace-nowrap"
                  >
                    <CertificateIcon /> View Certificate
                  </Link>
                ) : enrollment.progress === 100 ? (
                  <Link
                    href={`/courses/${course.id}/test`}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm flex items-center gap-1 px-3 py-1.5 rounded-lg whitespace-nowrap"
                  >
                    <TestIcon /> Take Test
                  </Link>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
