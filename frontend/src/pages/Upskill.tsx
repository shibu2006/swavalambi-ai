import React, { useState, useEffect } from "react";
import { ArrowLeft, GraduationCap, MapPin, Clock, Award, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNav from "../components/BottomNav";

interface Course {
  id: string;
  name: string;
  address: string;
  courses: string[];
  center_type: string;
  source: string;
  url: string;
}

export default function Upskill() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userSkill, setUserSkill] = useState("");
  const [skillRating, setSkillRating] = useState(0);

  useEffect(() => {
    // Get user's skill and rating from localStorage
    const skill = localStorage.getItem("swavalambi_skill") || "";
    const rating = parseInt(localStorage.getItem("swavalambi_skill_rating") || "0");
    setUserSkill(skill);
    setSkillRating(rating);

    const fetchLiveCenters = async () => {
      try {
        const sessionId = sessionStorage.getItem('swavalambi_session_id') || 'demo-session';
        const ratingStr = localStorage.getItem('swavalambi_skill_rating') || '0';
        const rating = parseInt(ratingStr, 10);

        const res = await fetch('http://localhost:8000/api/recommendations/fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            profession_skill: skill,
            intent: 'upskill', // specifically requesting training centers
            skill_rating: rating,
          }),
        });

        if (!res.ok) throw new Error('Failed to fetch training centers');
        
        const data = await res.json();
        setCourses(data.training_centers || []);
      } catch (err) {
        console.error("Error fetching live courses:", err);
        setError("Could not load nearest training centres. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLiveCenters();
  }, []);

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-700";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700";
      case "advanced":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link to="/home">
            <ArrowLeft className="text-slate-600" size={24} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Upskilling Courses</h1>
            <p className="text-sm text-slate-500">
              {userSkill ? `Enhance your ${userSkill} skills` : "Learn and grow your skills"}
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        {/* User Level Info */}
        {skillRating > 0 && (
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 mb-6 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-3 rounded-full">
                <Award className="text-primary" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Your Current Level</p>
                <p className="text-slate-800 font-bold text-lg">
                  Level {skillRating} - {skillRating < 3 ? "Beginner" : skillRating < 5 ? "Intermediate" : "Advanced"}
                </p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-medium">Finding nearby training centres...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl text-center">
            {error}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-600 font-medium">No courses available yet</p>
            <p className="text-slate-500 text-sm mt-2">
              Complete your assessment to get personalized course recommendations
            </p>
            <Link
              to="/assistant"
              className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-lg font-medium"
            >
              Start Assessment
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{course.name}</h3>
                    {course.address && (
                      <div className="flex items-center gap-1 mt-1 text-slate-500 text-sm">
                        <MapPin size={12} />
                        <span>{course.address}</span>
                      </div>
                    )}
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-full shrink-0">
                    {course.center_type || "Training Centre"}
                  </span>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {course.courses.map((c, i) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-md">
                      {c}
                    </span>
                  ))}
                </div>

                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center w-full bg-primary text-white font-medium py-2.5 rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
                >
                  View on Skill India
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Coming Soon Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-blue-800 font-medium">📚 More courses coming soon!</p>
          <p className="text-blue-600 text-sm mt-1">
            We're partnering with training providers to bring you the best learning opportunities
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
