"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { HiPencil, HiTrash, HiEye, HiEyeOff, HiPlus } from "react-icons/hi";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const snap = await getDocs(collection(db, "courses"));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Client‑side sort – newest first
      list.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setCourses(list);
    } catch (err) {
      toast.error("Failed to load courses");
    }
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const togglePublish = async (id, current) => {
    await updateDoc(doc(db, "courses", id), { isPublished: !current });
    toast.success(current ? "Course unpublished" : "Course published");
    fetchCourses();
  };

  const deleteCourse = async (id) => {
    if (confirm("Are you sure you want to delete this course?")) {
      await deleteDoc(doc(db, "courses", id));
      toast.success("Course deleted");
      fetchCourses();
    }
  };

  return (
    <div className="p-4 md:p-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Courses</h2>
        <Link href="/admin/courses/create" className="btn-gradient flex items-center gap-2">
          <HiPlus /> Add Course
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      ) : courses.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No courses yet. Create your first course!</p>
      ) : (
        <div className="space-y-3">
          {courses.map(course => (
            <div key={course.id} className="card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={course.thumbnail || "https://via.placeholder.com/64x64?text=No+Img"}
                  alt={course.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-bold">{course.title}</h4>
                  <p className="text-sm text-gray-500">{course.price === 0 ? "Free" : `₹${course.price}`} | {course.totalStudents || 0} students</p>
                  <span className={`text-xs font-medium ${course.isPublished ? 'text-green-600' : 'text-red-500'}`}>
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 self-end sm:self-auto">
                <button
                  onClick={() => togglePublish(course.id, course.isPublished)}
                  className={`p-2 rounded-lg ${course.isPublished ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' : 'bg-green-100 dark:bg-green-900/30 text-green-600'}`}
                  title={course.isPublished ? "Unpublish" : "Publish"}
                >
                  {course.isPublished ? <HiEyeOff /> : <HiEye />}
                </button>
                <Link
                  href={`/admin/courses/${course.id}/edit`}
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                >
                  <HiPencil />
                </Link>
                <button
                  onClick={() => deleteCourse(course.id)}
                  className="p-2 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-lg"
                >
                  <HiTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
