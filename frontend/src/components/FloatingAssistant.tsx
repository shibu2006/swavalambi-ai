import { useState } from 'react';
import { Bot, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FloatingAssistant() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/assistant');
  };

  return (
    <>
      {/* Floating Action Button - Positioned within mobile viewport */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 z-50 pointer-events-none">
        <div className="flex justify-end pointer-events-auto">
          <button
            onClick={handleClick}
            className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-transform group relative"
            aria-label="Open AI Assistant"
          >
            <Bot size={28} />
            
            {/* Pulse animation ring */}
            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20"></span>
            
            {/* Tooltip */}
            <span className="absolute right-16 bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              AI Assistant
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
