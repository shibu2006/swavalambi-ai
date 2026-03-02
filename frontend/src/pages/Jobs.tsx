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
  type: string;
  description: string;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSkill, setUserSkill] = useState("");

  useEffect(() => {
    // Get user's skill from localStorage
    const skill = localStorage.getItem("swavalambi_skill") || "";
    setUserSkill(skill);

    // TODO: Fetch jobs from backend based on user's skill
    // For now, showing mock data
    const mockJobs: Job[] = [
      {
        id: "1",
        title: `${skill || "Skilled"} Worker`,
        company: "Local Business",
        location: "Nearby",
        salary: "₹15,000 - ₹25,000/month",
        type: "Full-time",
        description: `Looking for experienced ${skill || "skilled"} worker for immediate joining.`
      },
      {
        id: "2",
        title: `${skill || "Skilled"} Assistant`,
        company: "Growing Company",
        location: "City Center",
        salary: "₹12,000 - ₹20,000/month",
        type: "Part-time",
        description: `Part-time opportunity for ${skill || "skilled"} professional.`
      }
    ];

    setJobs(mockJobs);
    setLoading(false);
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
          <div className="text-center py-12">
            <p className="text-slate-500">Loading jobs...</p>
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
                    <h3 className="font-bold text-slate-800 text-lg">{job.title}</h3>
                    <p className="text-slate-600 text-sm">{job.company}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    {job.type}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <MapPin size={16} />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <IndianRupee size={16} />
                    <span>{job.salary}</span>
                  </div>
                </div>

                <p className="text-slate-600 text-sm mb-4">{job.description}</p>

                <button className="w-full bg-primary text-white font-medium py-2 rounded-lg hover:bg-primary-dark transition-colors">
                  Apply Now
                </button>
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
