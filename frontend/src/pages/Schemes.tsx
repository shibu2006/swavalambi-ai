import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Info, Tag, ExternalLink, Lock, Loader2, ChevronRight } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import FloatingAssistant from '../components/FloatingAssistant';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "http://localhost:8000/api";

// Map occupation to a relevant emoji for the dynamic hero banner
const SKILL_EMOJI: Record<string, string> = {
  tailor: '🧵', plumber: '🔧', carpenter: '🪚', electrician: '⚡',
  potter: '🏺', weaver: '🧶', painter: '🎨', mason: '🧱',
  blacksmith: '⚒️', cobbler: '👟', barber: '✂️', cook: '👨‍🍳',
  farmer: '🌾', driver: '🚗', mechanic: '🔩',
};

interface Scheme {
  id: string;
  name: string;
  ministry: string;
  description: string;
  categories: string[];
  tags: string[];
  url: string;
}

export default function Schemes() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [skill, setSkill] = useState('artisan');
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const ratingStr = localStorage.getItem('swavalambi_skill_rating');
    const skillStr  = localStorage.getItem('swavalambi_skill') || 'artisan';
    const intentStr = localStorage.getItem('swavalambi_intent') || 'loan';
    const sessionId = sessionStorage.getItem('swavalambi_session_id') || 'anon';

    const rating = ratingStr ? parseInt(ratingStr, 10) : 0;
    setIsLocked(rating < 3);
    setSkill(skillStr);

    setLoading(true);
    fetch(`${API_BASE}/recommendations/fetch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        profession_skill: skillStr,
        intent: intentStr === 'job' ? 'loan' : intentStr, // always fetch schemes
        skill_rating: rating,
      }),
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setSchemes(data.schemes || []))
      .catch(err => setError(`Could not load schemes (${err})`))
      .finally(() => setLoading(false));
  }, []);

  const skillLabel = skill.charAt(0).toUpperCase() + skill.slice(1);
  const emoji = SKILL_EMOJI[skill.toLowerCase()] ?? '🏛️';
  const featured = schemes[0] ?? null;
  const others = schemes.slice(1);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light text-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-background-light/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <Link to="/home" className="text-slate-900 flex size-10 items-center justify-center cursor-pointer rounded-full hover:bg-slate-200">
            <ArrowLeft />
          </Link>
          <h2 className="text-lg font-bold leading-tight tracking-tight">
            Govt Schemes & Loans
          </h2>
        </div>
        <button className="flex size-10 items-center justify-center rounded-full hover:bg-slate-200">
          <Info size={20} />
        </button>
      </header>

      <main className="flex-1 pb-24">

        {/* Dynamic gradient hero banner */}
        <div className="mx-4 mt-4 rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #ff8c00 0%, #ffb347 60%, #ffe0b2 100%)' }}>
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">
                For {skillLabel}s
              </p>
              <h3 className="text-white text-2xl font-extrabold leading-tight">
                Govt Schemes<br />& Loans
              </h3>
              <p className="text-white/80 text-xs mt-2 leading-relaxed max-w-[180px]">
                Empowering skilled workers with financial support & training
              </p>
            </div>
            <span className="text-7xl select-none">{emoji}</span>
          </div>
          <div className="bg-white/20 px-5 py-3 flex gap-4 text-white text-xs font-semibold">
            <span>✅ Collateral-free Loans</span>
            <span>✅ Skill Grants</span>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-12 text-gray-400">
            <Loader2 className="animate-spin" size={28} />
            <p className="text-sm">Finding best schemes for you…</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Featured scheme */}
        {!loading && featured && (
          <section className="px-4 py-4">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Featured Scheme
            </span>
            <div className="mt-2 bg-white rounded-xl border border-primary/20 shadow-sm overflow-hidden relative">
              {isLocked && <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10" />}
              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-800 leading-tight">{featured.name}</h3>
                <p className="text-primary text-xs font-semibold mt-1">{featured.ministry}</p>
                <p className="text-slate-600 text-sm leading-relaxed mt-2">{featured.description}…</p>

                {featured.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {featured.tags.slice(0, 4).map((t, i) => (
                      <span key={i} className="flex items-center gap-0.5 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                        <Tag size={9} />{t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 mt-4 relative z-20">
                  {isLocked ? (
                    <button className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-500 font-bold py-2.5 rounded-xl text-sm">
                      <Lock size={14} /> Locked (Level 3 Required)
                    </button>
                  ) : (
                    <a href={featured.url} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-bold py-2.5 rounded-xl text-sm hover:bg-primary-dark transition-colors">
                      Apply Now <ExternalLink size={14} />
                    </a>
                  )}
                  <a href={featured.url} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-primary/10 text-primary font-bold py-2.5 rounded-xl text-sm border border-primary/20 hover:bg-primary/20 transition-colors relative z-20">
                    Check Eligibility
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Other schemes */}
        {!loading && others.length > 0 && (
          <section className="px-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-800">Other Schemes</h3>
              <a href="https://www.myscheme.gov.in" target="_blank" rel="noopener noreferrer"
                className="text-primary text-sm font-semibold">View All</a>
            </div>
            <div className="flex flex-col gap-3">
              {others.map(s => (
                <div key={s.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 relative overflow-hidden">
                  {isLocked && <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10" />}
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <p className="font-bold text-slate-800 text-sm leading-tight">{s.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{s.ministry}</p>
                      {s.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {s.tags.slice(0, 3).map((t, i) => (
                            <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <a href={s.url} target="_blank" rel="noopener noreferrer"
                      className="text-primary shrink-0 relative z-20">
                      <ChevronRight size={20} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!loading && !error && schemes.length === 0 && (
          <div className="mx-4 mt-4 bg-amber-50 border border-amber-200 p-4 rounded-xl text-center text-sm text-amber-800">
            <p className="font-bold">No schemes found right now</p>
            <p className="mt-1">Complete the AI assessment to get personalised recommendations.</p>
            <Link to="/assistant" className="mt-3 block bg-primary text-white font-bold py-2.5 rounded-xl text-sm">
              Start Assessment →
            </Link>
          </div>
        )}

        {/* Locked nudge */}
        {isLocked && !loading && schemes.length > 0 && (
          <div className="mx-4 mt-2 bg-amber-50 border border-amber-200 p-4 rounded-xl text-sm text-amber-800">
            <p className="font-bold">🏆 Unlock to Apply</p>
            <p className="mt-1">Complete your skill assessment to access these schemes.</p>
            <Link to="/assistant" className="mt-3 block text-center bg-primary text-white font-bold py-2.5 rounded-xl text-sm">
              Start Assessment →
            </Link>
          </div>
        )}
      </main>

      <FloatingAssistant />
      <BottomNav />
    </div>
  );
}
