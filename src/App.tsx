/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Trophy, Target } from 'lucide-react';
import { Header } from './components/Header';
import { RacingGame, RacingGameHandle } from './components/RacingGame';
import { GarageModal } from './components/GarageModal';
import { PolicyModal, PolicyTab } from './components/PolicyModal';
import { AdSlot } from './components/AdSlot';
import { GameArticle } from './components/GameArticle';
import { Achievements } from './components/Achievements';
import { Leaderboard } from './components/Leaderboard';
import { DailyChallengesSection } from './components/DailyChallengesSection';
import { DailyChallengesModal } from './components/DailyChallengesModal';
import { Footer } from './components/Footer';
import { loadPlayerStats } from './utils/storage';

export default function App() {
  const racingRef = useRef<RacingGameHandle | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('fast_city_racing_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });
  const [isGarageOpen, setIsGarageOpen] = useState(false);
  const [isDailyChallengesOpen, setIsDailyChallengesOpen] = useState(false);
  const [selectedGarageCarId, setSelectedGarageCarId] = useState<string | undefined>(undefined);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState<PolicyTab>('privacy');
  const [coins, setCoins] = useState(() => {
    return loadPlayerStats().coins;
  });

  // Listen for coins updates from daily challenges or garage
  useEffect(() => {
    const handleCoinsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ coins: number }>;
      if (customEvent.detail && typeof customEvent.detail.coins === 'number') {
        setCoins(customEvent.detail.coins);
      } else {
        setCoins(loadPlayerStats().coins);
      }
    };
    window.addEventListener('coins_updated', handleCoinsUpdate);
    window.addEventListener('storage', handleCoinsUpdate);
    return () => {
      window.removeEventListener('coins_updated', handleCoinsUpdate);
      window.removeEventListener('storage', handleCoinsUpdate);
    };
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('fast_city_racing_theme', next);
    } catch {}
  };

  const handleOpenGarage = (carId?: string) => {
    setSelectedGarageCarId(carId);
    setIsGarageOpen(true);
  };

  // Support direct path and hash navigation for pages (e.g. /privacy, /terms, /contact, /about, /cars, /instructions)
  useEffect(() => {
    const defaultTitle = 'City Speed Heroes - Free 3D Car Racing Game Online | games-children.com';
    const defaultDescription = 'Play City Speed Heroes, the ultimate free 3D car racing game online on games-children.com. Drive supercar speeds, dodge traffic, unlock nitro boosts & upgrades with zero downloads on PC, Mac, Android & iOS across USA, Canada, Netherlands & worldwide.';
    const siteUrl = 'https://www.games-children.com';

    const updateMetaDescription = (desc: string) => {
      let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = desc;
    };

    const updateCanonical = (path: string) => {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = `${siteUrl}${path === '/' ? '' : path}`;
    };

    const handleRoute = () => {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
      const hash = window.location.hash.replace('#', '');
      const target = path || hash;

      if (['privacy', 'terms', 'disclaimer', 'contact', 'about'].includes(target)) {
        setPolicyTab(target as PolicyTab);
        setIsPolicyOpen(true);
        const titles: Record<string, string> = {
          privacy: 'Privacy Policy - City Speed Heroes | games-children.com',
          terms: 'Terms of Service - City Speed Heroes | games-children.com',
          disclaimer: 'Disclaimer - City Speed Heroes | games-children.com',
          contact: 'Contact Us & Support - City Speed Heroes | games-children.com',
          about: 'About Us - City Speed Heroes | games-children.com',
        };
        const descriptions: Record<string, string> = {
          privacy: 'Read our Privacy Policy, COPPA compliance, cookie disclosures, and data protection guidelines for City Speed Heroes.',
          terms: 'Review the Terms of Service and fair play guidelines for City Speed Heroes on games-children.com.',
          disclaimer: 'Legal disclaimer and safety advisory for City Speed Heroes browser car racing game.',
          contact: 'Get in touch with our team for feedback, bug reports, and customer support.',
          about: 'Learn about our mission to bring fast, safe, high-performance browser games to families and players worldwide.',
        };
        document.title = titles[target] || defaultTitle;
        updateMetaDescription(descriptions[target] || defaultDescription);
        updateCanonical(`/${target}`);
      } else if (target === 'cars') {
        setIsPolicyOpen(false);
        document.title = 'Supercars Fleet & Upgrades - City Speed Heroes | games-children.com';
        updateMetaDescription('Explore the 6 high-octane racing supercars, performance stats, turbo specs, and garage upgrades.');
        updateCanonical('/cars');
        setTimeout(() => {
          document.getElementById('cars')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (target === 'instructions') {
        setIsPolicyOpen(false);
        document.title = 'How to Play & Controls Guide - City Speed Heroes | games-children.com';
        updateMetaDescription('Master keyboard and touch controls, nitro boosts, drafting, and near-miss multipliers in City Speed Heroes.');
        updateCanonical('/instructions');
        setTimeout(() => {
          document.getElementById('instructions')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.title = defaultTitle;
        updateMetaDescription(defaultDescription);
        updateCanonical('/');
      }
    };

    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);
    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
    };
  }, []);

  const handleOpenPolicy = (tab: PolicyTab) => {
    setPolicyTab(tab);
    setIsPolicyOpen(true);
    try {
      window.history.pushState({ tab }, '', `/${tab}`);
    } catch {}
    const titles: Record<string, string> = {
      privacy: 'Privacy Policy - City Speed Heroes | games-children.com',
      terms: 'Terms of Service - City Speed Heroes | games-children.com',
      disclaimer: 'Disclaimer - City Speed Heroes | games-children.com',
      contact: 'Contact Us & Support - City Speed Heroes | games-children.com',
      about: 'About Us - City Speed Heroes | games-children.com',
    };
    document.title = titles[tab] || 'City Speed Heroes - Free 3D Car Racing Game Online';
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) canonical.href = `https://www.games-children.com/${tab}`;
  };

  const handleClosePolicy = () => {
    setIsPolicyOpen(false);
    try {
      window.history.pushState({}, '', '/');
    } catch {}
    document.title = 'City Speed Heroes - Free 3D Car Racing Game Online | games-children.com';
    const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (metaDesc) {
      metaDesc.content = 'Play City Speed Heroes, the ultimate free 3D car racing game online on games-children.com. Drive supercar speeds, dodge traffic, unlock nitro boosts & upgrades with zero downloads on PC, Mac, Android & iOS across USA, Canada, Netherlands & worldwide.';
    }
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) canonical.href = 'https://www.games-children.com';
  };

  const handlePlayNow = () => {
    const el = document.getElementById('game-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    // Launch game immediately
    racingRef.current?.startGame();
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors duration-200 selection:bg-amber-500 selection:text-slate-950 ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <Header
        onPlayClick={handlePlayNow}
        onOpenGarage={() => handleOpenGarage()}
        onOpenDailyChallenges={() => setIsDailyChallengesOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Main Hero Header (SEO Optimized for USA, Canada, Netherlands, Global) */}
        <div className="text-center sm:text-start space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-500 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold uppercase tracking-wider text-[10px]">
              Formerly known as City Speed Heroes
            </span>
            <span className="hidden sm:inline">·</span>
            <span>#1 Free Online 3D Car Racing Game</span>
            <span className="hidden sm:inline">·</span>
            <span>No Download Required</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-game tracking-tight leading-tight">
            Metro Racers - Free 3D Car Racing Game Online
          </h1>

          <p className="text-sm sm:text-base opacity-85 max-w-2xl leading-relaxed">
            Play Metro Racers online for free! Experience high-speed 3D car racing, dodge city traffic, unlock supercars, and break records directly in your browser with no download required.
          </p>

          <div className="pt-1 flex items-center gap-3 flex-wrap">
            <button
              onClick={handlePlayNow}
              className="btn-play-pulse px-6 sm:px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-slate-950 font-black text-sm sm:text-base rounded-xl shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 transition-all cursor-pointer inline-flex"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>Play Now - Start Race</span>
            </button>

            <a
              href="#cars"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('cars')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-5 py-3 rounded-xl font-bold text-sm border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                theme === 'dark'
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs'
              }`}
            >
              <span>Explore Supercars Fleet</span>
            </a>

            <a
              href="#leaderboard"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-5 py-3 rounded-xl font-bold text-sm border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                theme === 'dark'
                  ? 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-amber-500/30'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 shadow-xs'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Leaderboard 🏆</span>
            </a>

            <button
              onClick={() => setIsDailyChallengesOpen(true)}
              className={`px-5 py-3 rounded-xl font-bold text-sm border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                theme === 'dark'
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 shadow-xs'
              }`}
            >
              <Target className="w-4 h-4 text-amber-400" />
              <span>Daily Quests 🎯</span>
            </button>
          </div>
        </div>

        {/* Top AdSense slot */}
        <AdSlot slotId="header-leaderboard" format="horizontal" />

        {/* Main 3D Racing Game Canvas Section */}
        <section id="game-arena" className="scroll-mt-20">
          <div id="game-container" />
          <RacingGame
            ref={racingRef}
            onOpenGarage={() => handleOpenGarage()}
            coins={coins}
            onCoinsChange={setCoins}
          />
        </section>

        {/* SEO Optimized Text Sections (About Metro Racers & Controls Guide) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section
            id="about-game"
            className={`p-5 sm:p-6 rounded-2xl border transition-colors ${
              theme === 'dark'
                ? 'bg-slate-900/60 border-slate-800/80 text-slate-200'
                : 'bg-white border-slate-200 text-slate-800 shadow-xs'
            }`}
          >
            <h2 className="text-xl sm:text-2xl font-black font-game text-[#ffcc00] mb-2.5">
              About Metro Racers
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed opacity-90">
              Welcome to <strong>Metro Racers</strong>, the ultimate online entertainment portal combining the instant thrill of classic arcade mechanics with high-fidelity 3D modern car driving simulation. Engineered specifically for speed enthusiasts, this game offers an exceptional racing adventure directly inside your web browser. No installation or downloads required—enjoy seamless deployment on PC or mobile platforms instantly via <a href="https://www.games-children.com/" className="text-[#ffcc00] underline font-semibold">games-children.com</a>.
            </p>
          </section>

          <section
            id="gameplay-guide"
            className={`p-5 sm:p-6 rounded-2xl border transition-colors ${
              theme === 'dark'
                ? 'bg-slate-900/60 border-slate-800/80 text-slate-200'
                : 'bg-white border-slate-200 text-slate-800 shadow-xs'
            }`}
          >
            <h2 className="text-xl sm:text-2xl font-black font-game text-[#ffcc00] mb-2.5">
              How to Play & Controls
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed opacity-90">
              Master your lane swerving techniques, dodge heavy metropolitan traffic, trigger your nitro boosts, and execute drifting maneuvers to dominate the scoreboard. Check our integrated control layouts for keyboard inputs and mobile responsive touch controls within the main dashboard panels.
            </p>
          </section>
        </div>

        {/* Daily Quests, Special Missions & Reward Milestones */}
        <DailyChallengesSection
          theme={theme}
          onPlayNow={handlePlayNow}
          onCoinsChange={setCoins}
        />

        {/* Top 5 Leaderboard with LocalStorage Persistence */}
        <Leaderboard theme={theme} onPlayNow={handlePlayNow} />

        {/* Achievements and Milestones Section */}
        <Achievements stats={loadPlayerStats()} />

        {/* Mid-page AdSense Placement */}
        <AdSlot slotId="mid-game-banner" format="horizontal" />

        {/* Comprehensive SEO Game Article & Car Showroom */}
        <div>
          <GameArticle onOpenGarage={handleOpenGarage} />
        </div>

        {/* Bottom AdSense Placement */}
        <AdSlot slotId="bottom-banner" format="horizontal" />
      </main>

      {/* Daily Challenges & Rewards Modal */}
      <DailyChallengesModal
        isOpen={isDailyChallengesOpen}
        onClose={() => setIsDailyChallengesOpen(false)}
        onCoinsChange={setCoins}
      />

      {/* Garage & Car Wash Modal */}
      <GarageModal
        isOpen={isGarageOpen}
        onClose={() => setIsGarageOpen(false)}
        coins={coins}
        onCoinsChange={setCoins}
        selectedCarIdProp={selectedGarageCarId}
      />

      {/* Legal & Policy Modal (Privacy Policy, Terms of Service, Contact, About, Disclaimer, Instructions) */}
      <PolicyModal
        isOpen={isPolicyOpen}
        activeTab={policyTab}
        onClose={handleClosePolicy}
        onSelectTab={(tab) => {
          setPolicyTab(tab);
          window.location.hash = tab;
        }}
      />

      <Footer onOpenPolicy={handleOpenPolicy} theme={theme} />
    </div>
  );
}
