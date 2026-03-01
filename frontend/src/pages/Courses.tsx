import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Award } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function Courses() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light text-slate-900">
      <header className="flex items-center bg-background-light p-4 pb-2 justify-between sticky top-0 z-50 border-b border-slate-200">
        <Link
          to="/home"
          className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 cursor-pointer transition-colors"
        >
          <ArrowLeft />
        </Link>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          Recommended Courses
        </h2>
        <div className="flex w-10 items-center justify-end">
          <button className="flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-slate-200 transition-colors">
            <Search size={20} />
          </button>
        </div>
      </header>

      <div className="p-4">
        <div
          className="bg-cover bg-center flex flex-col justify-end overflow-hidden rounded-xl min-h-[220px] relative group"
          style={{
            backgroundImage:
              'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.2) 60%, rgba(0, 0, 0, 0) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuC5OI4aAkD1onYktZssbdIOdvVavJ3KEDW5zSUSgwPeCqFEbhGnb9cIz0k6mm7-g-0cQuU5-dNVFvLicg3FOZGkUomhScpbzdvomk2LzbqjmDj_C5yxsUSm9Oik5xbps-37kOftT55FJdffhYxPsL2Pn5EpKBFzPvG_C91ax-rcy12hnCzOMskt1JlDNWTGU5sv1G97Y7j42XACWSJqI7Xzb5b4MW08lj64z_dQhTBOJdY6EvZctQPBgqzW2Jgl-eZPOJbTr0pZuWw8")',
          }}
        >
          <div className="p-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold mb-2">
              <Award size={14} />
              PARTNERSHIP
            </div>
            <h1 className="text-white text-3xl font-extrabold leading-tight">
              Skill India Digital Hub
            </h1>
            <p className="text-slate-200 text-sm mt-1 max-w-md">
              Empowering the workforce of tomorrow through certified vocational excellence.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-2 flex items-center justify-between">
        <h3 className="text-lg font-bold leading-tight tracking-tight">Partnered Programs</h3>
        <span className="text-primary text-sm font-semibold cursor-pointer">See all</span>
      </div>

      <div className="flex flex-col gap-4 p-4 pb-24">
        <div className="flex flex-col items-stretch justify-start rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
          <div
            className="w-full h-48 bg-center bg-cover"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCv1oysGT8oE3iL4GkU6TraRYr0kJUuM-PB-ufHJv_d4PiBZ6XbXqVHECi9n_CWDD1QqAJU38A7tNxTsUSqS5fRE7vydN7iwZfw-Jx9WBQexe3is7k0HmXiB7-aGmdePGemMutC0lV7epNr7TTmgpcLd7FyzuO5Htsuyfqu5LknPsOSvDxJybG-B_QZpiEr6fxwMXsRTTGP5-YR--mHFwYlPJb_zPtyhefFGflyP9uMh25vrCCDj-qzoPbTqlFpPw8q1aRF7tXX8QQI")',
            }}
          ></div>
          <div className="flex w-full flex-col gap-3 p-5">
            <div>
              <p className="text-xl font-bold leading-tight mb-1">Advanced Garment Construction</p>
              <p className="text-slate-500 text-sm font-medium">
                12 Weeks • Advanced Certification
              </p>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Master the art of high-end tailoring, couture techniques, and complex garment
              structures for the fashion industry.
            </p>
            <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1 text-primary">
                <Award size={18} />
                <span className="text-xs font-bold">NSDC Verified</span>
              </div>
              <button className="flex items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity">
                View on Skill India
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-stretch justify-start rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
          <div
            className="w-full h-48 bg-center bg-cover"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAlviQAVBVFozoQIMTyFHVKgVs0i9TcbEyABLzDtHG4yKqFDhTJ5u0IeOTDbCRRggMfORKhuuB1bmvlHz-vqGR2_IovFZIzwo4Bzc6j1vYvT2_Oy_BWZ1jj23FlHNmBZcKUMkxAcF17ShMowLICsON-boHhm-wgvm44CEiV9M-4y5ZGkras-o5utRIE0KnMLvR3jAg5HsL_m_oT34Q1wd9w0sDIMDUBWYZpRqVwynpCyyacsH53z3u47yr7Ht6_FhkPMuoJpuyZeIl_")',
            }}
          ></div>
          <div className="flex w-full flex-col gap-3 p-5">
            <div>
              <p className="text-xl font-bold leading-tight mb-1">Pattern Making for Professionals</p>
              <p className="text-slate-500 text-sm font-medium">
                8 Weeks • Intermediate Certification
              </p>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Learn precise drafting techniques, draping, and digital pattern grading used by top
              design houses globally.
            </p>
            <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1 text-primary">
                <Award size={18} />
                <span className="text-xs font-bold">NSDC Verified</span>
              </div>
              <button className="flex items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity">
                View on Skill India
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-stretch justify-start rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
          <div
            className="w-full h-48 bg-center bg-cover"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA4Th0vmLr5wDxwNqBgQfRNDq7iPzvLBoh7M8hHCa9MAH57S5nuao2EB8KCaqZ0uz7fYuvUGU92_b9lJLb2C-zqrp-AuN4BeoLsjhZNL9b8OydyZNwUsq4q70NP2vwPRtRz5lu-2-4aItfnGk1RartdpHQj_dJAi7-E5iTqzI2FADmQbKAJVzABZYz8di2ZcQzIM36YSCXrTLksrARfgISmKVOqnkEeSVLsUHAnfUS2kbTl3q3EDbJrVY6na9WURq_UmFh7n1WfRl1S")',
            }}
          ></div>
          <div className="flex w-full flex-col gap-3 p-5">
            <div>
              <p className="text-xl font-bold leading-tight mb-1">Digital Literacy for Business</p>
              <p className="text-slate-500 text-sm font-medium">
                4 Weeks • Foundational Certification
              </p>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Essential digital skills for modern entrepreneurs including online marketing, financial
              tools, and digital communication.
            </p>
            <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1 text-primary">
                <Award size={18} />
                <span className="text-xs font-bold">NSDC Verified</span>
              </div>
              <button className="flex items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity">
                View on Skill India
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
