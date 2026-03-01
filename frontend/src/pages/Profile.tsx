import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings, Star, FileText, Award, ShieldCheck, Bell, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import BottomNav from '../components/BottomNav';

const API_BASE = 'http://localhost:8000/api';

const LEVEL_LABELS: Record<number, string> = {
  0: 'Beginner',
  1: 'Novice',
  2: 'Developing',
  3: 'Competent',
  4: 'Proficient',
  5: 'Expert',
};

const INTENT_LABELS: Record<string, string> = {
  job: 'Job Seeker',
  upskill: 'Skill Learner',
  loan: 'Entrepreneur',
};

export default function Profile() {
  const [name, setName] = useState('');
  const [skill, setSkill] = useState('');
  const [skillRating, setSkillRating] = useState(0);
  const [intent, setIntent] = useState('job');

  useEffect(() => {
    // Start with localStorage values as immediate fallback
    const userId     = localStorage.getItem('swavalambi_user_id') || '';
    const localName  = localStorage.getItem('swavalambi_name') || '';
    const localSkill = localStorage.getItem('swavalambi_skill') || '';
    const localRating = parseInt(localStorage.getItem('swavalambi_skill_rating') || '0', 10);
    const localIntent = localStorage.getItem('swavalambi_intent') || 'job';

    setName(localName);
    setSkill(localSkill);
    setSkillRating(localRating);
    setIntent(localIntent);

    // Fetch from DynamoDB if user is logged in
    if (userId && userId !== 'demo') {
      fetch(`${API_BASE}/users/${encodeURIComponent(userId)}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (!data) return;
          if (data.name)         { setName(data.name); localStorage.setItem('swavalambi_name', data.name); }
          if (data.skill)        { setSkill(data.skill); localStorage.setItem('swavalambi_skill', data.skill); }
          if (data.skill_rating != null) { setSkillRating(data.skill_rating); localStorage.setItem('swavalambi_skill_rating', String(data.skill_rating)); }
          if (data.intent)       { setIntent(data.intent); localStorage.setItem('swavalambi_intent', data.intent); }
        })
        .catch(() => {/* silently use localStorage fallback */});
    }
  }, []);

  const skillLabel   = skill ? skill.charAt(0).toUpperCase() + skill.slice(1) : 'Artisan';
  const levelLabel   = LEVEL_LABELS[skillRating] ?? 'Beginner';
  const roleLabel    = skill ? `Skilled ${skillLabel}` : 'Skilled Worker';
  const intentLabel  = INTENT_LABELS[intent] ?? 'Job Seeker';
  const displayName  = name || roleLabel;
  // Initials: first letter of real name, or skill, or 'A'
  const initials     = (name || skill || 'A').charAt(0).toUpperCase();

  return (
    <div className="bg-background-light text-slate-900 min-h-screen flex flex-col">
      <header className="flex items-center bg-background-light p-4 justify-between sticky top-0 z-10 border-b border-slate-200">
        <Link
          to="/home"
          className="text-slate-900 flex size-10 items-center justify-center cursor-pointer hover:bg-slate-200 rounded-full transition-colors"
        >
          <ArrowLeft />
        </Link>
        <h2 className="text-lg font-bold leading-tight flex-1 text-center">Profile</h2>
        <div className="flex w-10 items-center justify-end">
          <button className="flex items-center justify-center text-slate-900 hover:bg-slate-200 rounded-full p-2 transition-colors">
            <Settings size={24} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {/* Avatar + name */}
        <section className="flex p-6">
          <div className="flex w-full flex-col gap-4 items-center">
            <div className="flex gap-4 flex-col items-center">
              {/* Initials avatar — no external image */}
              <div className="w-32 h-32 rounded-full bg-primary/15 border-4 border-primary/30 flex items-center justify-center shadow-lg">
                <span className="text-5xl font-extrabold text-primary">{initials}</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-2xl font-bold tracking-tight">{displayName}</p>
                <p className="text-slate-500 text-sm mt-0.5">{roleLabel}</p>
                <div className="mt-2 flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                  <Star className="text-primary fill-current" size={16} />
                  <p className="text-primary text-sm font-semibold">
                    Level {skillRating} — {levelLabel}
                  </p>
                </div>
                <p className="text-slate-500 mt-2 text-base">{intentLabel}</p>
              </div>
            </div>
            <div className="flex gap-2 w-full mt-2">
              <Link
                to="/assistant"
                className="flex-1 text-center bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-md shadow-primary/20 transition-colors text-sm"
              >
                {skillRating === 0 ? 'Start Assessment' : 'Retake Assessment'}
              </Link>
              <button className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary font-bold py-3 rounded-xl border border-primary/20 transition-colors text-sm">
                Share Profile
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-4 grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white p-3 rounded-xl text-center border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-500">Skill Level</p>
            <p className="text-lg font-bold text-primary">{skillRating}/5</p>
          </div>
          <div className="bg-white p-3 rounded-xl text-center border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-500">Badges</p>
            <p className="text-lg font-bold text-primary">{skillRating > 0 ? skillRating : 0}</p>
          </div>
          <div className="bg-white p-3 rounded-xl text-center border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-500">Status</p>
            <p className="text-lg font-bold text-primary">{skillRating >= 3 ? '🔓' : '🔒'}</p>
          </div>
        </section>

        {/* Documents */}
        <section>
          <div className="flex items-center justify-between px-4 pb-4">
            <h3 className="text-lg font-bold">My Documents</h3>
            <button className="text-primary text-sm font-medium hover:underline">Add New</button>
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 pb-2 hide-scrollbar">
            <div className="flex flex-col gap-2 min-w-[140px] group cursor-pointer">
              <div className="w-full aspect-[3/4] bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-2 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <FileText className="text-primary" size={48} />
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">PDF</span>
              </div>
              <div>
                <p className="text-sm font-semibold truncate">Resume_Final.pdf</p>
                <p className="text-xs text-slate-500">Add your resume</p>
              </div>
            </div>

            <Link to="/certificate" className="flex flex-col gap-2 min-w-[140px] group cursor-pointer">
              <div className="w-full aspect-[3/4] bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-2 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Award className="text-primary" size={48} />
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">Cert</span>
              </div>
              <div>
                <p className="text-sm font-semibold truncate">Skill Certificate</p>
                <p className="text-xs text-slate-500">{skillRating >= 3 ? 'View certificate' : 'Complete assessment'}</p>
              </div>
            </Link>

            <div className="flex flex-col gap-2 min-w-[140px] group cursor-pointer">
              <div className="w-full aspect-[3/4] bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-2 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <ShieldCheck className={skillRating >= 3 ? 'text-green-600' : 'text-slate-300'} size={48} />
                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${skillRating >= 3 ? 'text-green-600 bg-green-100' : 'text-slate-400 bg-slate-100'}`}>
                  {skillRating >= 3 ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold truncate">ID Proof / KYC</p>
                <p className="text-xs text-slate-500">Aadhaar / PAN</p>
              </div>
            </div>
          </div>
        </section>

        {/* Account Settings */}
        <section className="mt-8 px-4 flex flex-col gap-2">
          <h3 className="text-lg font-bold mb-2">Account Settings</h3>
          <button className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors shadow-sm text-left w-full">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Star size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Skill & Assessment</p>
              <p className="text-xs text-slate-500">{skillLabel} · Level {skillRating}</p>
            </div>
            <ChevronRight className="text-slate-400 shrink-0" size={20} />
          </button>

          <button className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors shadow-sm text-left w-full">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Notification Settings</p>
              <p className="text-xs text-slate-500">App alerts and emails</p>
            </div>
            <ChevronRight className="text-slate-400 shrink-0" size={20} />
          </button>

          <button className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors shadow-sm text-left w-full">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <HelpCircle size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Help & Support</p>
              <p className="text-xs text-slate-500">FAQ and Contact center</p>
            </div>
            <ChevronRight className="text-slate-400 shrink-0" size={20} />
          </button>

          <Link
            to="/"
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:bg-red-50 transition-colors shadow-sm text-left w-full mt-2"
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
            }}
          >
            <div className="size-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <LogOut size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-red-600">Logout</p>
              <p className="text-xs text-slate-500">Sign out of your account</p>
            </div>
          </Link>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
