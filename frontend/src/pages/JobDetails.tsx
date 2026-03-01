import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  MapPin,
  Briefcase,
  IndianRupee,
  Clock,
  Info,
  CheckCircle2,
  Gift,
  HeartPulse,
  Utensils,
  TrendingUp,
  Map,
  MessageSquare,
} from 'lucide-react';

export default function JobDetails() {
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const ratingStr = localStorage.getItem('swavalambi_skill_rating');
    const intentStr = localStorage.getItem('swavalambi_intent');
    // Lock if skill is low, or if they explicitly selected 'loan' but are viewing a job
    if ((ratingStr && parseInt(ratingStr, 10) < 3) || intentStr === 'loan') {
      setIsLocked(true);
    }
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light text-slate-900">
      <header className="sticky top-0 z-50 flex items-center bg-background-light/80 backdrop-blur-md p-4 justify-between border-b border-primary/10">
        <div className="flex items-center gap-4">
          <Link
            to="/home"
            className="text-slate-900 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft />
          </Link>
          <h1 className="text-lg font-bold leading-tight tracking-tight">Job Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex size-10 items-center justify-center rounded-full hover:bg-primary/10 transition-colors">
            <Share2 size={20} />
          </button>
          <button className="flex size-10 items-center justify-center rounded-full hover:bg-primary/10 transition-colors">
            <Bookmark size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 pb-24">
        <div className="p-4">
          <div className="flex flex-col gap-6 bg-white p-6 rounded-xl border border-primary/5 shadow-sm">
            <div className="flex gap-5 items-start">
              <div
                className="bg-primary/10 aspect-square rounded-xl min-h-[96px] w-24 flex items-center justify-center border border-primary/20 overflow-hidden shrink-0 bg-cover"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB30qu-y6BZuSV_FLmuvl1dTGHE6reOq7dwKaQkI18RX2hXEj4bKmH_mu_fXN6cCFUfYaxYScIRTL4uN1O16tIaD3vsM2du64nMe5OpuZZACw1i5ZDRw_yNoeWm3WBDhItylW3lEez793KSVceF8LFFRC9jOD5GwvLcY27o9b4fQ1oY_5KYwKL3rPNv5sSbLW_UwAT2mYNhzqRMUdisFhneLWBbp5mxlC0pUp7QhrGWoaD9gPCT4IwMWQh3Blw4Ez3Yl0MS5Ogm2HOZ")',
                }}
              ></div>
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold leading-tight tracking-tight">Senior Tailor</h2>
                <p className="text-primary font-semibold text-lg">Meera Boutique</p>
                <div className="flex items-center gap-1 text-slate-500">
                  <MapPin size={14} />
                  <span className="text-sm font-medium">Surat, Gujarat</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex h-9 items-center justify-center gap-2 rounded-lg bg-primary/10 px-4 border border-primary/20">
                <Briefcase size={18} className="text-primary" />
                <p className="text-slate-900 text-sm font-semibold">Full-time</p>
              </div>
              <div className="flex h-9 items-center justify-center gap-2 rounded-lg bg-primary/10 px-4 border border-primary/20">
                <IndianRupee size={18} className="text-primary" />
                <p className="text-slate-900 text-sm font-semibold">₹15k - 22k /mo</p>
              </div>
              <div className="flex h-9 items-center justify-center gap-2 rounded-lg bg-primary/10 px-4 border border-primary/20">
                <Clock size={18} className="text-primary" />
                <p className="text-slate-900 text-sm font-semibold">2+ Years Exp</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 px-4 py-2">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Info className="text-primary" size={20} />
              <h3 className="text-lg font-bold leading-tight">About the Role</h3>
            </div>
            <p className="text-slate-600 text-base leading-relaxed">
              We are looking for a skilled Senior Tailor to join Meera Boutique. You will be
              responsible for high-quality garment construction and professional alterations for our
              premium boutique clientele. The ideal candidate has an eye for detail and mastery in
              various stitching techniques.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="text-primary" size={20} />
              <h3 className="text-lg font-bold leading-tight">Key Responsibilities</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex gap-3 text-slate-600">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"></span>
                <span>
                  Expertise in stitching Indian ethnic wear, including bridal lehengas and designer
                  blouses.
                </span>
              </li>
              <li className="flex gap-3 text-slate-600">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"></span>
                <span>
                  Taking accurate body measurements and suggesting style modifications to clients.
                </span>
              </li>
              <li className="flex gap-3 text-slate-600">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"></span>
                <span>
                  Ensuring final garment finishing meets the boutique's high-quality standards.
                </span>
              </li>
              <li className="flex gap-3 text-slate-600">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"></span>
                <span>
                  Managing production timelines to ensure on-time delivery for client orders.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Gift className="text-primary" size={20} />
              <h3 className="text-lg font-bold leading-tight">Benefits</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-primary/5">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <HeartPulse size={16} />
                </div>
                <span className="text-sm font-medium">Health Insurance</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-primary/5">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Clock size={16} />
                </div>
                <span className="text-sm font-medium">Flexible Hours</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-primary/5">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Utensils size={16} />
                </div>
                <span className="text-sm font-medium">Free Meals</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-primary/5">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <TrendingUp size={16} />
                </div>
                <span className="text-sm font-medium">Performance Bonus</span>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Map className="text-primary" size={20} />
              <h3 className="text-lg font-bold leading-tight">Location</h3>
            </div>
            <div
              className="relative h-48 w-full rounded-xl overflow-hidden border border-primary/10 bg-slate-200"
              style={{
                backgroundImage:
                  'linear-gradient(45deg, rgba(255, 140, 0, 0.1) 25%, transparent 25%, transparent 50%, rgba(255, 140, 0, 0.1) 50%, rgba(255, 140, 0, 0.1) 75%, transparent 75%, transparent)',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <MapPin className="text-primary" size={36} />
                  <span className="bg-white px-3 py-1 rounded-full text-xs font-bold shadow-lg mt-1 border border-primary/20">
                    Meera Boutique
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-primary/10 flex gap-4 items-center z-50">
        <button className="flex size-14 items-center justify-center rounded-xl bg-slate-100 text-slate-900 border border-primary/10">
          <MessageSquare />
        </button>
        {isLocked ? (
          <Link
            to="/home"
            className="flex-1 flex items-center justify-center h-14 bg-gray-200 text-gray-500 text-base font-bold rounded-xl shadow-sm border border-gray-300"
          >
            Locked (Level 3 Required)
          </Link>
        ) : (
          <button className="flex-1 h-14 bg-primary text-white text-base font-bold rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-transform">
            Apply Now
          </button>
        )}
      </footer>
    </div>
  );
}
