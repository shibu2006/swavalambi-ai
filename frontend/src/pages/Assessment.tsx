import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, GraduationCap, Briefcase, ChevronRight } from 'lucide-react';

export default function Assessment() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light text-slate-900">
      <header className="flex items-center bg-background-light p-4 justify-between border-b border-primary/10">
        <Link
          to="/assistant"
          className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 cursor-pointer"
        >
          <ArrowLeft />
        </Link>
        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
          AI Skill Assessment
        </h2>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        <div className="p-4">
          <div
            className="relative bg-cover bg-center flex flex-col justify-end overflow-hidden rounded-xl min-h-[220px] shadow-lg"
            style={{
              backgroundImage:
                'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAZdvf0H1Lou64wx0DRTXexV2hHLR8zwkGIOAdjGv8QhsJWZrrUeWi5GQEc-9FKqzbTpdmYQXQesIvNjhIgkVkwlV74eVMrUSA8TMAX9LGZ7bW1PFDWiyk5863AnWv9B_f3ZcwEVDEOXd4IaxweKOdXfoyKD2mnhwcEeEEskNaJZHSrQT9n1Us41_zF4VviBvIk0Ra58AzaZUpeNtPDGpVrKMEJzY-IDJdqb_ZVvDveKUjnOVmoveaKV66Ll7WJ74C5uRbrS9y119bU")',
            }}
          >
            <div className="p-5">
              <span className="inline-block bg-primary text-white text-xs font-bold px-2 py-1 rounded mb-2 uppercase tracking-wider">
                Analysis Complete
              </span>
              <h1 className="text-white text-3xl font-bold leading-tight">Skill Validated</h1>
              <p className="text-slate-200 text-sm mt-1">
                Assessment based on your uploaded blazer sample
              </p>
            </div>
          </div>
        </div>

        <section className="px-4 py-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-primary/5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">
                  Overall Level
                </p>
                <h3 className="text-2xl font-bold text-primary">Intermediate</h3>
              </div>
              <div className="size-16 rounded-full border-4 border-primary flex items-center justify-center">
                <span className="text-lg font-bold">B2</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Stitch Consistency</span>
                  <span className="text-sm font-bold text-primary">92%</span>
                </div>
                <div className="w-full bg-primary/10 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pattern Alignment</span>
                  <span className="text-sm font-bold text-primary">Excellent</span>
                </div>
                <div className="w-full bg-primary/10 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Seam Finishing</span>
                  <span className="text-sm font-bold text-primary">85%</span>
                </div>
                <div className="w-full bg-primary/10 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Sparkles className="text-primary" />
            Recommended Next Steps
          </h3>

          <div className="space-y-3">
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-start gap-4">
              <div className="bg-primary text-white p-2 rounded-lg">
                <GraduationCap />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">Advanced Lining Techniques</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Master hidden seams and silk lining to reach Professional level.
                </p>
                <Link
                  to="/courses"
                  className="mt-3 text-primary text-xs font-bold flex items-center gap-1"
                >
                  VIEW COURSE <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-start gap-4">
              <div className="bg-slate-100 text-slate-600 p-2 rounded-lg">
                <Briefcase />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">Junior Cutter - Savile Row Studio</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Your pattern alignment score makes you a strong candidate.
                </p>
                <Link
                  to="/job/1"
                  className="mt-3 text-primary text-xs font-bold flex items-center gap-1"
                >
                  APPLY NOW <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
