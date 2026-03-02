import React, { useState, useEffect } from "react";
import { ArrowLeft, GraduationCap, Clock, Award, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNav from "../components/BottomNav";

interface Course {
  id: string;
  title: string;
  provider: string;
  duration: string;
  level: string;
  description: string;
  link?: string;
}

export default function Upskill() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSkill, setUserSkill] = useState("");
  const [skillRating, setSkillRating] = useState(0);

  useEffect(() => {
    // Get user's skill and rating from localStorage
    const skill = localStorage.getItem("swavalambi_skill") || "";
    const rating = parseInt(localStorage.getItem("swavalambi_skill_rating") || "0");
    setUserSkill(skill);
    setSkillRating(rating);

    // TODO: Fetch courses from backend based on user's skill and level
    // For now, showing mock data
    const mockCourses: Course[] = [
      {
        id: "1",
        title: `Advanced ${skill || "Skills"} Training`,
        provider: "Skill India",
        duration: "3 months",
        level: rating < 3 ? "Beginner" : "Intermediate",
        description: `Comprehensive training program to enhance your ${skill || "professional"} skills with hands-on practice.`,
        link: "https://www.skillindia.gov.in/"
      },
      {
        id: "2",
        title: `${skill || "Professional"} Certification Course`,
        provider: "NSDC",
        duration: "6 months",
        level: "Advanced",
        description: `Get certified and boost your career with industry-recognized certification.`,
        link: "https://nsdcindia.org/"
      },
      {
        id: "3",
        title: "Digital Skills for Artisans",
        provider: "Online Platform",
        duration: "1 month",
        level: "Beginner",
        description: "Learn how to market your skills online and reach more customers.",
        link: "#"
      }
    ];

    setCourses(mockCourses);
    setLoading(false);
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
          <div className="text-center py-12">
            <p className="text-slate-500">Loading courses...</p>
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
                    <h3 className="font-bold text-slate-800 text-lg">{course.title}</h3>
                    <p className="text-slate-600 text-sm">{course.provider}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Clock size={16} />
                    <span>{course.duration}</span>
                  </div>
                </div>

                <p className="text-slate-600 text-sm mb-4">{course.description}</p>

                <button
                  onClick={() => {
                    if (course.link && course.link !== "#") {
                      window.open(course.link, "_blank");
                    }
                  }}
                  className="w-full bg-primary text-white font-medium py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                >
                  <span>Learn More</span>
                  <ExternalLink size={16} />
                </button>
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
