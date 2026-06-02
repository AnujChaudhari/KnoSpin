"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("सभी");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const snap = await getDocs(collection(db, "courses"));
        let all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // केवल पब्लिश्ड कोर्स दिखाएँ
        all = all.filter(c => c.isPublished);
        setCourses(all);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
      setLoading(false);
    };
    fetchCourses();
  }, []);

  // अनोखी कैटेगरी निकालें
  const categories = ["सभी", ...new Set(courses.map(c => c.category).filter(Boolean))];

  // क्लाइंट-साइड फ़िल्टर
  const filtered = courses.filter(c => {
    const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "सभी" || c.category === category;
    return matchSearch && matchCat;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">📚 सभी कोर्स</h1>

      {/* सर्च और फ़िल्टर बार */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="कोर्स खोजें..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field flex-grow"
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="input-field w-48"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* कोर्स ग्रिड */}
      {filtered.length === 0 && (
        <p className="text-center text-gray-500 py-12">कोई कोर्स नहीं मिला।</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(course => (
          <Link key={course.id} href={`/courses/${course.id}`} className="card group">
            <img
              src={course.thumbnail || "https://via.placeholder.com/400x200?text=Course"}
              alt={course.title}
              className="w-full h-48 object-cover rounded-xl mb-4 group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.src = "https://via.placeholder.com/400x200?text=Course"; }}
            />
            <h3 className="font-bold text-lg mb-1">{course.title}</h3>
            <p className="text-sm text-gray-500 mb-2">{course.instructor}</p>
            <div className="flex justify-between items-center">
              <span className="text-primary-600 font-bold">
                {course.price === 0 ? "मुफ़्त" : `₹${course.price}`}
              </span>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                {course.category}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
