import { Link } from 'react-router-dom';
import { ArrowLeft, Share2, Download, Link as LinkIcon, Award, ShieldCheck } from 'lucide-react';

export default function Certificate() {
  return (
    <div className="bg-background-light text-slate-900 min-h-screen flex flex-col">
      <header className="flex items-center bg-background-light p-4 sticky top-0 z-10 border-b border-slate-200">
        <Link
          to="/profile"
          className="text-slate-900 flex size-10 shrink-0 items-center justify-center cursor-pointer"
        >
          <ArrowLeft />
        </Link>
        <h2 className="text-slate-900 text-lg font-bold flex-1 text-center">Certificate</h2>
        <div className="flex w-10 items-center justify-end">
          <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-primary/10 text-primary">
            <Share2 size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        <div className="relative bg-white rounded-xl shadow-2xl p-6 md:p-12 overflow-hidden border-8 border-double border-primary">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-30 opacity-[0.03] text-[8rem] font-black whitespace-nowrap pointer-events-none text-primary">
            SWAVALAMBI
          </div>

          <div className="flex flex-col items-center text-center space-y-6 relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary p-2 rounded-lg">
                <Award className="text-white" size={32} />
              </div>
              <span className="text-2xl font-extrabold tracking-tighter text-slate-900">
                Swavalambi
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-primary text-3xl md:text-5xl font-extrabold uppercase tracking-widest">
                Certificate
              </h1>
              <p className="text-slate-500 font-semibold tracking-[0.2em] uppercase text-sm">
                Of Professional Competence
              </p>
            </div>

            <div className="w-24 h-1 bg-primary/30 mx-auto rounded-full"></div>

            <div className="space-y-2">
              <p className="text-slate-600 italic font-medium">This is to officially certify that</p>
              <h3 className="text-slate-900 text-3xl md:text-5xl font-bold py-4">Rajesh Kumar</h3>
              <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                has been successfully validated and awarded the proficiency status of
              </p>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 w-full max-w-lg">
              <p className="text-primary font-bold text-xl md:text-2xl">Level 3 - Competent</p>
              <p className="text-slate-900 font-medium text-lg mt-1">
                Tailoring & Machine Stitching
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full pt-12">
              <div className="flex flex-col items-center justify-end space-y-2">
                <div className="w-full border-b border-slate-300 pb-2 italic font-serif text-slate-700">
                  Digital Signature
                </div>
                <p className="text-xs uppercase font-bold text-slate-500">Program Director</p>
              </div>

              <div className="flex flex-col items-center justify-center relative">
                <div className="absolute -top-12">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-24 h-24 bg-primary/20 rounded-full animate-pulse"></div>
                    <div className="text-primary flex items-center justify-center bg-white rounded-full p-2 border-4 border-primary">
                      <ShieldCheck size={48} className="fill-current text-white" />
                    </div>
                  </div>
                </div>
                <p className="mt-16 text-xs uppercase font-bold text-slate-500">Official Seal</p>
              </div>

              <div className="flex flex-col items-center justify-end space-y-2">
                <div className="w-full border-b border-slate-300 pb-2 italic font-serif text-slate-700">
                  Swavalambi Auth.
                </div>
                <p className="text-xs uppercase font-bold text-slate-500">Issuing Authority</p>
              </div>
            </div>

            <div className="pt-8 flex flex-col md:flex-row justify-between w-full text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
              <p>Certificate ID: SWV-2023-RK-9921</p>
              <p>Issued on: October 24, 2023</p>
              <p>Verify at: swavalambi.app/verify</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Download size={20} />
            Download PDF
          </button>

          <div className="flex gap-4">
            <button className="flex-1 bg-primary/10 text-primary font-bold py-3 rounded-xl border border-primary/20 flex items-center justify-center gap-2">
              <LinkIcon size={20} />
              Add to LinkedIn
            </button>
            <button className="flex-1 bg-primary/10 text-primary font-bold py-3 rounded-xl border border-primary/20 flex items-center justify-center gap-2">
              <Share2 size={20} />
              Share with Network
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
