import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, Bot, GraduationCap, ClipboardList, User } from 'lucide-react';
import { clsx } from 'clsx';

export default function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/jobs', icon: Briefcase, label: 'Jobs' },
    { path: '/upskill', icon: GraduationCap, label: 'Upskill' },
    { path: '/schemes', icon: ClipboardList, label: 'Schemes' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] border-t border-slate-200 bg-white px-4 pb-6 pt-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = path === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "flex flex-1 flex-col items-center gap-1 transition-colors",
                isActive ? "text-primary" : "text-slate-400 hover:text-primary"
              )}
            >
              <Icon size={24} className={isActive ? "fill-current" : ""} />
              <p className="text-[10px] font-medium leading-none">{item.label}</p>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
