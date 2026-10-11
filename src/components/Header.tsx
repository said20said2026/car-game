import React from 'react';
import { Play } from 'lucide-react';

interface HeaderProps {
  onPlayClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onPlayClick }) => {
  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title wordmark */}
        <a
          href="/"
          className="text-lg sm:text-xl font-black font-game text-white tracking-tight whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="text-amber-400">سباق</span>
          <span>سيارات المدينة</span>
        </a>

        {/* Zone 2: 4-5 single line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-300">
          <a href="#game-container" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
            شاشة اللعبة
          </a>
          <a href="#instructions" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
            طريقة التحكم
          </a>
          <a href="#cars" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
            أنواع السيارات
          </a>
          <a href="#tips" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
            نصائح الفوز
          </a>
          <a href="#faq" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
            الأسئلة الشائعة
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onPlayClick}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-md shadow-amber-400/20 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>العب الآن</span>
          </button>
        </div>
      </div>
    </header>
  );
};
