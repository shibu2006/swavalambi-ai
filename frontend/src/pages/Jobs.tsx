import React, { useState, useEffect } from "react";
import { ArrowLeft, Briefcase, MapPin, Clock, IndianRupee } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNav from "../components/BottomNav";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  vacancies: number;
  education: string;
  contact: string;
  posted_days_ago: number;
  source: string;
  apply_url: string;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userSkill, setUserSkill] = useState("");

  useEffect(() => {
    // Get user's skill from localStorage
    const skill = localStorage.getItem("swavalambi_skill") || "";
    setUserSkill(skill);

    const fetchLiveJobs = async () => {
      try {
        const sessionId = sessionStorage.getItem('swavalambi_session_id') || 'demo-session';
        const ratingStr = localStorage.getItem('swavalambi_skill_rating') || '3';
        const rating = parseInt(ratingStr, 10);

        const res = await fetch('http://localhost:8000/api/recommendations/fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            profession_skill: skill,
            intent: 'job', // specifically requesting jobs
            skill_rating: rating,
          }),
        });

        if (!res.ok) throw new Error('Failed to fetch jobs');
        
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch (err) {
        console.error("Error fetching live jobs:", err);
        setError("Could not load latest job openings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLiveJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link to="/home">
            <ArrowLeft className="text-slate-600" size={24} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Job Opportunities</h1>
            <p className="text-sm text-slate-500">
              {userSkill ? `For ${userSkill} professionals` : "Find your next opportunity"}
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-medium">Finding live job openings...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl text-center">
            {error}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-600 font-medium">No jobs available yet</p>
            <p className="text-slate-500 text-sm mt-2">
              Complete your assessment to get personalized job recommendations
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
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{job.title}</h3>
                    <p className="text-slate-600 text-sm mt-1">{job.company}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full shrink-0">
                    {job.source}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <MapPin size={16} className="text-primary" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <IndianRupee size={16} className="text-primary" />
                    <span className="font-semibold">{job.salary}</span>
                  </div>
                  {job.education && (
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500">Edu</span>
                      <span>{job.education}</span>
                    </div>
                  )}
                  <div className="text-xs text-slate-400 mt-2">
                    Posted {job.posted_days_ago} days ago • {job.vacancies} vacancies
                  </div>
                </div>

                <a 
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center w-full bg-primary text-white font-medium py-2.5 rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
                >
                  Apply on NCS
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Coming Soon Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-blue-800 font-medium">🚀 More jobs coming soon!</p>
          <p className="text-blue-600 text-sm mt-1">
            We're partnering with employers to bring you the best opportunities
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
