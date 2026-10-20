import React from 'react';
import { Play, Sun, Moon, Wrench } from 'lucide-react';

interface HeaderProps {
  onPlayClick: () => void;
  onOpenGarage: () => void;
  onOpenDailyChallenges?: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onPlayClick,
  onOpenGarage,
  theme,
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';

  const handleScrollToCars = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('cars');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onOpenGarage();
    }
  };

  return (
    <header className={`w-full border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
      isDark
        ? 'border-slate-800 bg-slate-950/85 text-slate-100'
        : 'border-slate-200 bg-white/90 text-slate-900 shadow-xs'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-6">
        <a
          href="/"
          className="tracking-tight whitespace-nowrap shrink-0 flex items-center gap-2.5 group"
        >
          <img
            src="/assets/logo.webp"
            alt="Metro Racers Logo - Free 3D Car Racing Game Online"
            width={40}
            height={40}
            className="w-10 h-10 rounded-xl object-contain shadow-xs border border-amber-500/30 group-hover:scale-105 transition-transform"
            loading="eager"
          />
          <div className="flex flex-col text-left">
            <span className="text-xl sm:text-2xl font-black font-game tracking-wider leading-none text-[#ffcc00] group-hover:text-amber-300 transition-colors">
              METRO RACERS
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 leading-tight">
              Formerly known as City Speed Heroes
            </span>
          </div>
        </a>

        {/* Zone 2: Nav links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs sm:text-sm font-medium opacity-90">
          <a href="#game-arena" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 font-semibold">
            Game Arena
          </a>
          <a href="#about-game" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
            About
          </a>
          <a href="#gameplay-guide" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
            How to Play
          </a>
          <a
            href="#cars"
            onClick={handleScrollToCars}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 font-bold text-amber-400"
          >
            Supercars Fleet
          </a>
        </nav>

        {/* Zone 3: Actions (Theme Light/Dark Switcher + Garage + Play Now) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Theme switcher */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
              isDark
                ? 'bg-slate-900 text-amber-400 border-slate-700 hover:bg-slate-800'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle Theme Lighting"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-800" />}
          </button>

          {/* Garage button */}
          <button
            onClick={onOpenGarage}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title="Open Garage to Upgrade Supercars"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-500" />
            <span>Garage</span>
          </button>

          {/* Play Now button */}
          <button
            onClick={onPlayClick}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-md shadow-amber-400/20 active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>Play Now</span>
          </button>
        </div>
      </div>
    </header>
  );
};

