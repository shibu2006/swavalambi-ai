import { Link } from 'react-router-dom';
import { ArrowLeft, Briefcase, Check, Clock, Calendar, ShieldCheck, IndianRupee, Wrench } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function Status() {
  return (
    <div className="bg-background-light text-slate-900 min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-background-light/80 backdrop-blur-md border-b border-primary/10">
        <div className="flex items-center p-4 justify-between max-w-md mx-auto w-full">
          <Link
            to="/home"
            className="text-slate-900 flex size-10 shrink-0 items-center justify-center cursor-pointer hover:bg-primary/10 rounded-full transition-colors"
          >
            <ArrowLeft />
          </Link>
          <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
            Application Status
          </h1>
        </div>

        <div className="max-w-md mx-auto w-full px-4">
          <div className="flex gap-8 border-b border-primary/10">
            <button className="flex flex-col items-center justify-center border-b-2 border-primary pb-3 pt-2 group">
              <p className="text-sm font-bold text-primary group-hover:text-primary">
                All Applications
              </p>
            </button>
            <button className="flex flex-col items-center justify-center border-b-2 border-transparent pb-3 pt-2 group">
              <p className="text-sm font-medium text-slate-500 group-hover:text-primary transition-colors">
                Active
              </p>
            </button>
            <button className="flex flex-col items-center justify-center border-b-2 border-transparent pb-3 pt-2 group">
              <p className="text-sm font-medium text-slate-500 group-hover:text-primary transition-colors">
                Completed
              </p>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto max-w-md mx-auto w-full p-4 space-y-6 pb-24">
        <div className="bg-white rounded-xl shadow-sm border border-primary/5 overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-3">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Briefcase size={24} />
                </div>
                <div>
                  <p className="text-xs font-medium text-primary uppercase tracking-wider">
                    Job Application
                  </p>
                  <h3 className="font-bold text-base">Senior Tailor at Meera Boutique</h3>
                </div>
              </div>
              <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                In Review
              </span>
            </div>

            <div className="mt-6 mb-4 px-2">
              <div className="relative flex justify-between">
                <div className="absolute top-2.5 left-0 w-full h-0.5 bg-slate-200 -z-0"></div>
                <div className="absolute top-2.5 left-0 w-1/3 h-0.5 bg-primary -z-0"></div>
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="size-5 rounded-full bg-primary flex items-center justify-center text-white">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-[10px] font-medium">Applied</span>
                </div>
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="size-5 rounded-full bg-primary flex items-center justify-center text-white ring-4 ring-white">
                    <Clock size={12} strokeWidth={3} />
                  </div>
                  <span className="text-[10px] font-bold text-primary">Review</span>
                </div>
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="size-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                    <Calendar size={12} />
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">Interview</span>
                </div>
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="size-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                    <ShieldCheck size={12} />
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">Result</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">Applied on 12 Oct, 2023</p>
              <Link
                to="/job/1"
                className="bg-primary text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-primary/5 overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-3">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <IndianRupee size={24} />
                </div>
                <div>
                  <p className="text-xs font-medium text-primary uppercase tracking-wider">
                    Loan Application
                  </p>
                  <h3 className="font-bold text-base">PM Vishwakarma Loan</h3>
                </div>
              </div>
              <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700">
                Approved
              </span>
            </div>

            <div className="mt-6 mb-4 px-2">
              <div className="relative flex justify-between">
                <div className="absolute top-2.5 left-0 w-full h-0.5 bg-slate-200 -z-0"></div>
                <div className="absolute top-2.5 left-0 w-full h-0.5 bg-green-500 -z-0"></div>
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="size-5 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-[10px] font-medium">Verified</span>
                </div>
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="size-5 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-[10px] font-medium text-green-600">Sanctioned</span>
                </div>
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="size-5 rounded-full bg-green-500 flex items-center justify-center text-white ring-4 ring-white">
                    <IndianRupee size={12} strokeWidth={3} />
                  </div>
                  <span className="text-[10px] font-bold text-green-600">Disbursal</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">Loan ID: VL-772910</p>
              <button className="border border-primary text-primary text-xs font-bold py-2 px-4 rounded-lg hover:bg-primary/5 transition-colors">
                Get Summary
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-primary/5 overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-3">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Wrench size={24} />
                </div>
                <div>
                  <p className="text-xs font-medium text-primary uppercase tracking-wider">
                    Job Application
                  </p>
                  <h3 className="font-bold text-base">Master Pattern Maker</h3>
                </div>
              </div>
              <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-orange-100 text-orange-700">
                Interview
              </span>
            </div>

            <div className="bg-primary/5 p-3 rounded-lg mb-4 flex items-center gap-3">
              <Calendar className="text-primary" size={20} />
              <div>
                <p className="text-xs font-bold">Interview Scheduled</p>
                <p className="text-[11px] text-slate-600">Tomorrow at 10:30 AM via Zoom</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">ID: #98122</p>
              <button className="bg-primary text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors">
                Join Call
              </button>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
