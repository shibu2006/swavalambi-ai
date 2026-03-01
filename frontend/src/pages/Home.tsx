import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Briefcase, BookOpen, Lock, MapPin, Phone, Building2, Tag, ExternalLink, Loader2 } from 'lucide-react';
import BottomNav from '../components/BottomNav';

const API_BASE = 'http://localhost:8000/api';

// ── Types ────────────────────────────────────────────────────────────────────
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  vacancies: number;
  apply_url: string;
}

interface Scheme {
  id: string;
  name: string;
  ministry: string;
  description: string;
  categories: string[];
  tags: string[];
  url: string;
}

interface TrainingCenter {
  id: string;
  name: string;
  address: string;
  courses: string[];
  center_type: string;
  url: string;
}

interface Recommendations {
  jobs: Job[];
  schemes: Scheme[];
  training_centers: TrainingCenter[];
  message: string;
}

// ── Sub-components ───────────────────────────────────────────────────────────

const JobCard = ({ job, locked, onLockedClick }: { job: Job; locked: boolean; onLockedClick: () => void }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
    {locked && <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10" />}
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
          <Briefcase className="text-primary" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-sm leading-tight">{job.title}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            <Building2 size={11} className="text-gray-400" />
            <span className="text-gray-500 text-xs">{job.company}</span>
          </div>
        </div>
      </div>
      {job.vacancies > 1 && (
        <span className="text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-full shrink-0">
          {job.vacancies} openings
        </span>
      )}
    </div>
    <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
      <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>
    </div>
    <div className="mt-3 flex justify-between items-center relative z-20">
      <span className="text-primary font-bold text-sm">{job.salary}</span>
      {locked ? (
        <button
          onClick={onLockedClick}
          className="bg-gray-200 text-gray-500 flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl"
        >
          <Lock size={12} /> Locked
        </button>
      ) : (
        <a
          href={job.apply_url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1"
        >
          Apply <ExternalLink size={12} />
        </a>
      )}
    </div>
  </div>
);

const SchemeCard = ({ scheme, locked, onLockedClick }: { scheme: Scheme; locked: boolean; onLockedClick: () => void }) => (
  <div className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-xl border border-primary/20 relative overflow-hidden">
    {locked && <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10" />}
    <div className="flex items-start justify-between mb-2 relative z-20">
      <div>
        <h3 className="font-bold text-gray-800 text-sm leading-tight">{scheme.name}</h3>
        <p className="text-gray-500 text-xs mt-0.5">{scheme.ministry}</p>
      </div>
    </div>
    <p className="text-xs text-gray-600 leading-relaxed mb-3 relative z-20">{scheme.description}…</p>
    {scheme.tags.length > 0 && (
      <div className="flex flex-wrap gap-1 mb-3 relative z-20">
        {scheme.tags.slice(0, 3).map((t, i) => (
          <span key={i} className="flex items-center gap-0.5 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            <Tag size={9} />{t}
          </span>
        ))}
      </div>
    )}
    <div className="relative z-20">
      {locked ? (
        <button
          onClick={onLockedClick}
          className="w-full flex justify-center items-center gap-2 bg-gray-200 text-gray-500 font-bold py-2.5 rounded-xl text-sm"
        >
          <Lock size={14} /> Locked
        </button>
      ) : (
        <a
          href={scheme.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-primary text-white font-bold py-2.5 rounded-xl text-sm"
        >
          Apply for Scheme <ExternalLink size={14} />
        </a>
      )}
    </div>
  </div>
);

const TrainingCard = ({ center }: { center: TrainingCenter }) => (
  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
    <div className="flex items-start gap-3 mb-3">
      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
        <BookOpen className="text-blue-600" size={18} />
      </div>
      <div>
        <span className="bg-blue-200 text-blue-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
          {center.center_type || 'Govt Certified'}
        </span>
        <h3 className="font-bold text-gray-800 text-sm mt-1 leading-tight">{center.name}</h3>
        {center.address && (
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin size={10} />{center.address}
          </p>
        )}
      </div>
    </div>
    {center.courses.length > 0 && (
      <div className="mb-3 flex flex-wrap gap-1">
        {center.courses.map((c, i) => (
          <span key={i} className="text-[10px] bg-white text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
            {c}
          </span>
        ))}
      </div>
    )}
    <a
      href={center.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-sm"
    >
      View Centre <ExternalLink size={14} />
    </a>
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    {[1, 2].map(i => (
      <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 h-28">
        <div className="flex gap-3">
          <div className="w-11 h-11 bg-gray-200 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [skillRating, setSkillRating] = useState(0);
  const [intent, setIntent] = useState('job');
  const [skill, setSkill] = useState('');
  const [showNudge, setShowNudge] = useState(false);
  const [recs, setRecs] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isLocked = skillRating < 3;

  useEffect(() => {
    const ratingStr = localStorage.getItem('swavalambi_skill_rating');
    const intentStr = localStorage.getItem('swavalambi_intent');
    const skillStr  = localStorage.getItem('swavalambi_skill') || 'tailor'; // fallback
    if (ratingStr) setSkillRating(parseInt(ratingStr, 10));
    if (intentStr) setIntent(intentStr);
    setSkill(skillStr);
  }, []);

  // Fetch recommendations once we have skill + intent
  useEffect(() => {
    if (!skill) return;
    const sessionId = sessionStorage.getItem('swavalambi_session_id') || 'anon';
    setLoading(true);
    setError('');

    fetch(`${API_BASE}/recommendations/fetch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        profession_skill: skill,
        intent,
        skill_rating: skillRating,
      }),
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setRecs(data))
      .catch(err => setError(`Could not load recommendations (${err})`))
      .finally(() => setLoading(false));
  }, [skill, intent, skillRating]);

  const handleLockedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowNudge(true);
    setTimeout(() => setShowNudge(false), 3000);
  };

  return (
    <div className="font-sans text-gray-900 bg-gray-50 pb-24 min-h-screen relative">
      {/* Lock nudge toast */}
      {showNudge && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-red-100 border border-red-300 text-red-800 p-4 rounded-xl shadow-2xl z-50">
          <p className="font-bold text-sm">Requires Level 3 Badge 🔒</p>
          <p className="text-xs mt-1">Complete an assessment to unlock this opportunity.</p>
        </div>
      )}

      {/* Header */}
      <header className="bg-white px-6 pt-12 pb-6 rounded-b-[24px] shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {skill ? `${skill.charAt(0).toUpperCase() + skill.slice(1)} Hub` : 'My Dashboard'}
            </h1>
            <p className="text-gray-500 text-sm mt-1 capitalize">
              {intent === 'job' ? '🔍 Finding jobs for you' : intent === 'upskill' ? '📚 Upskilling resources' : '💰 Loan & scheme support'}
            </p>
          </div>
          <div className="relative">
            <Link to="/profile" className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <span className="text-primary font-bold text-sm">Lvl {skillRating}</span>
              <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-8">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-8 text-gray-400">
            <Loader2 className="animate-spin" size={28} />
            <p className="text-sm">Finding the best matches for you…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Jobs */}
        {!loading && intent === 'job' && (
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-bold text-gray-800">Job Openings</h2>
              <a
                href="https://betacloud.ncs.gov.in/job-listing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-sm font-semibold"
              >See All</a>
            </div>
            {recs?.jobs?.length ? (
              <div className="space-y-3">
                {recs.jobs.map(job => (
                  <JobCard key={job.id} job={job} locked={isLocked} onLockedClick={() => { setShowNudge(true); setTimeout(() => setShowNudge(false), 3000); }} />
                ))}
              </div>
            ) : !loading ? (
              <LoadingSkeleton />
            ) : null}
          </section>
        )}

        {/* Training Centers */}
        {!loading && intent === 'upskill' && (
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-bold text-gray-800">Training Centres Near You</h2>
              <a href="https://www.skillindiadigital.gov.in" target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-semibold">Skill India</a>
            </div>
            {recs?.training_centers?.length ? (
              <div className="space-y-3">
                {recs.training_centers.map(c => <TrainingCard key={c.id} center={c} />)}
              </div>
            ) : !loading ? (
              <LoadingSkeleton />
            ) : null}
          </section>
        )}

        {/* Government Schemes */}
        {!loading && (
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-bold text-gray-800">
                {intent === 'loan' ? 'Loan & Govt Schemes' : 'Government Schemes'}
              </h2>
              <a href="https://www.myscheme.gov.in" target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-semibold">myScheme</a>
            </div>
            {recs?.schemes?.length ? (
              <div className="space-y-3">
                {recs.schemes.map(s => (
                  <SchemeCard key={s.id} scheme={s} locked={isLocked} onLockedClick={() => { setShowNudge(true); setTimeout(() => setShowNudge(false), 3000); }} />
                ))}
              </div>
            ) : !loading ? (
              <LoadingSkeleton />
            ) : null}
          </section>
        )}

        {/* Nudge to complete assessment */}
        {isLocked && !loading && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-sm text-amber-800">
            <p className="font-bold">🏆 Unlock Full Access</p>
            <p className="mt-1">Complete your skill assessment to apply for jobs and schemes.</p>
            <Link to="/assistant" className="mt-3 block text-center bg-primary text-white font-bold py-2.5 rounded-xl text-sm">
              Start Assessment →
            </Link>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
