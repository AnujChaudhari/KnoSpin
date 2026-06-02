"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc, serverTimestamp, collection, addDoc, deleteDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "react-hot-toast";
import CourseForm from "@/components/admin/CourseForm";
import LessonForm from "@/components/admin/LessonForm";
import QuestionForm from "@/components/admin/QuestionForm";

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId;
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      const snap = await getDoc(doc(db, "courses", courseId));
      if (snap.exists()) {
        setCourse({ id: snap.id, ...snap.data() });
      } else {
        toast.error("Course not found");
        router.push("/admin/courses");
      }
    };
    fetchCourse();
  }, [courseId, router]);

  const fetchLessons = async () => {
    const snap = await getDocs(collection(db, "courses", courseId, "lessons"));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => (a.order || 0) - (b.order || 0));
    setLessons(list);
  };

  const fetchQuestions = async () => {
    const snap = await getDocs(collection(db, "courses", courseId, "questions"));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => (a.order || 0) - (b.order || 0));
    setQuestions(list);
  };

  useEffect(() => {
    if (courseId) {
      fetchLessons();
      fetchQuestions();
    }
  }, [courseId]);

  const handleCourseUpdate = async (formData, thumbnailFile) => {
    toast.loading("Updating course...");
    let thumbnailUrl = course.thumbnail;
    if (thumbnailFile) {
      thumbnailUrl = await uploadToCloudinary(thumbnailFile);
    }
    await updateDoc(doc(db, "courses", courseId), {
      ...formData,
      thumbnail: thumbnailUrl,
      price: Number(formData.price),
      updatedAt: serverTimestamp(),
    });
    toast.dismiss();
    toast.success("Course updated!");
    setCourse(prev => ({ ...prev, ...formData, thumbnail: thumbnailUrl }));
  };

  // Lesson handlers
  const handleAddLesson = async (lessonData) => {
    const maxOrder = lessons.reduce((max, l) => Math.max(max, l.order || 0), 0);
    await addDoc(collection(db, "courses", courseId, "lessons"), {
      ...lessonData,
      order: maxOrder + 1,
      isCoursePublished: course.isPublished,
    });
    toast.success("Lesson added");
    setShowLessonForm(false);
    fetchLessons();
  };

  const handleUpdateLesson = async (lessonId, lessonData) => {
    await updateDoc(doc(db, "courses", courseId, "lessons", lessonId), {
      ...lessonData,
      isCoursePublished: course.isPublished,
    });
    toast.success("Lesson updated");
    setEditingLesson(null);
    fetchLessons();
  };

  const handleDeleteLesson = async (lessonId) => {
    if (confirm("Delete this lesson?")) {
      await deleteDoc(doc(db, "courses", courseId, "lessons", lessonId));
      toast.success("Lesson deleted");
      fetchLessons();
    }
  };

  // Question handlers
  const handleAddQuestion = async (questionData) => {
    const maxOrder = questions.reduce((max, q) => Math.max(max, q.order || 0), 0);
    await addDoc(collection(db, "courses", courseId, "questions"), {
      ...questionData,
      order: maxOrder + 1,
    });
    toast.success("Question added");
    setShowQuestionForm(false);
    fetchQuestions();
  };

  const handleDeleteQuestion = async (qId) => {
    if (confirm("Delete this question?")) {
      await deleteDoc(doc(db, "courses", courseId, "questions", qId));
      toast.success("Question deleted");
      fetchQuestions();
    }
  };

  if (!course) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 md:p-0 space-y-8">
      <h2 className="text-2xl font-bold">Edit Course: {course.title}</h2>

      {/* Course Details Form */}
      <CourseForm onSubmit={handleCourseUpdate} initialData={course} />

      {/* Lessons Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Lessons ({lessons.length})</h3>
          <button
            onClick={() => setShowLessonForm(true)}
            className="btn-gradient text-sm flex items-center gap-1"
          >
            + Add Lesson
          </button>
        </div>

        {showLessonForm && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <h4 className="font-semibold mb-3">New Lesson</h4>
            <LessonForm
              onSubmit={handleAddLesson}
              onCancel={() => setShowLessonForm(false)}
            />
          </div>
        )}

        {editingLesson && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <h4 className="font-semibold mb-3">Edit Lesson</h4>
            <LessonForm
              initialData={editingLesson}
              onSubmit={(data) => handleUpdateLesson(editingLesson.id, data)}
              onCancel={() => setEditingLesson(null)}
            />
          </div>
        )}

        <div className="space-y-3">
          {lessons.map((lesson, idx) => (
            <div key={lesson.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400">{idx + 1}</span>
                <div>
                  <p className="font-medium">{lesson.title}</p>
                  <p className="text-xs text-gray-500">{lesson.duration} min | {lesson.freePreview ? "Free Preview" : "Premium"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingLesson(lesson)}
                  className="text-xs text-primary-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteLesson(lesson.id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Questions Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Test Questions ({questions.length})</h3>
          <button
            onClick={() => setShowQuestionForm(true)}
            className="btn-gradient text-sm flex items-center gap-1"
          >
            + Add Question
          </button>
        </div>

        {showQuestionForm && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <h4 className="font-semibold mb-3">New Question</h4>
            <QuestionForm
              onSubmit={handleAddQuestion}
              onCancel={() => setShowQuestionForm(false)}
            />
          </div>
        )}

        <div className="space-y-2">
          {questions.map((q, idx) => (
            <div key={q.id} className="p-3 bg-white dark:bg-gray-600 rounded-lg flex justify-between items-center">
              <div className="flex-1">
                <p className="font-medium">{idx+1}. {q.question}</p>
                <p className="text-xs text-gray-500">Correct: {q.options[q.correct]}</p>
              </div>
              <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-500 text-xs ml-4 hover:underline">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
