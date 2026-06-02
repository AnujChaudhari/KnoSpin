"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

export default function TestPage() {
  const params = useParams();
  const courseId = params.courseId;
  const router = useRouter();
  const { user } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    if (!user || !courseId) return;

    const checkEligibility = async () => {
      // Check enrollment and progress = 100%
      const enrollQuery = query(
        collection(db, "enrollments"),
        where("userId", "==", user.uid),
        where("courseId", "==", courseId)
      );
      const snap = await getDocs(enrollQuery);
      if (snap.empty) {
        toast.error("You are not enrolled in this course");
        router.push(`/courses/${courseId}`);
        return;
      }
      const enrollment = snap.docs[0].data();
      if (enrollment.progress < 100) {
        toast.error("Complete all lessons first before taking the test");
        router.push(`/courses/${courseId}`);
        return;
      }
      setEligible(true);

      // Fetch questions
      const qSnap = await getDocs(collection(db, "courses", courseId, "questions"));
      const allQuestions = qSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Shuffle and pick first 10
      const shuffled = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);
      setQuestions(shuffled);
      setLoading(false);
    };

    checkEligibility();
  }, [user, courseId, router]);

  const handleOptionSelect = (qId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [qId]: optionIndex }));
  };

  const handleSubmit = () => {
    // Calculate score
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct) correctCount++;
    });
    const finalScore = correctCount;
    setScore(finalScore);
    setSubmitted(true);

    if (finalScore >= 7) { // 70% pass mark
      // Create certificate entry
      createCertificate(finalScore);
    }
  };

  const createCertificate = async (finalScore) => {
    try {
      const certRef = await addDoc(collection(db, "certificates"), {
        userId: user.uid,
        courseId,
        score: finalScore,
        total: questions.length,
        userName: user.displayName || user.email.split('@')[0],
        courseTitle: (await getDoc(doc(db, "courses", courseId))).data().title,
        issuedAt: serverTimestamp(),
      });
      toast.success("Congratulations! Certificate generated.");
      // Redirect to certificate page after 2 seconds
      setTimeout(() => {
        router.push(`/courses/${courseId}/certificate?certId=${certRef.id}`);
      }, 1500);
    } catch (err) {
      toast.error("Failed to generate certificate");
    }
  };

  if (!eligible) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Test Completed!</h1>
        <p className="text-xl">Your Score: <strong>{score}/{questions.length}</strong></p>
        {score >= 7 ? (
          <p className="text-green-600 mt-4">You passed! 🎉 Redirecting to your certificate...</p>
        ) : (
          <p className="text-red-500 mt-4">You did not pass. Please try again later.</p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Course Test</h1>
      <p className="text-sm text-gray-500 mb-6">Answer all questions. Pass mark: 70%</p>
      {questions.map((q, idx) => (
        <div key={q.id} className="card mb-4">
          <p className="font-bold mb-2">{idx+1}. {q.question}</p>
          {q.options.map((opt, oidx) => (
            <label key={oidx} className="flex items-center gap-2 mb-2 cursor-pointer">
              <input
                type="radio"
                name={q.id}
                checked={answers[q.id] === oidx}
                onChange={() => handleOptionSelect(q.id, oidx)}
                className="w-4 h-4"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      ))}
      <button
        onClick={handleSubmit}
        disabled={Object.keys(answers).length < questions.length}
        className="btn-gradient w-full"
      >
        Submit Test
      </button>
    </div>
  );
}
