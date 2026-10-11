/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import { Header } from './components/Header';
import { RacingGame, RacingGameHandle } from './components/RacingGame';
import { GarageModal } from './components/GarageModal';
import { PolicyModal, PolicyTab } from './components/PolicyModal';
import { AdSlot } from './components/AdSlot';
import { GameArticle } from './components/GameArticle';
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
  const [selectedGarageCarId, setSelectedGarageCarId] = useState<string | undefined>(undefined);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState<PolicyTab>('privacy');
  const [coins, setCoins] = useState(() => {
    return loadPlayerStats().coins;
  });

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

  // Support direct hash navigation for policy pages (e.g. #privacy, #terms, #contact, #about)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['privacy', 'terms', 'contact', 'about'].includes(hash)) {
        setPolicyTab(hash as PolicyTab);
        setIsPolicyOpen(true);
      } else if (hash === 'cars') {
        const el = document.getElementById('cars');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleOpenPolicy = (tab: PolicyTab) => {
    setPolicyTab(tab);
    setIsPolicyOpen(true);
    window.location.hash = tab;
  };

  const handleClosePolicy = () => {
    setIsPolicyOpen(false);
    if (['#privacy', '#terms', '#contact', '#about'].includes(window.location.hash)) {
      history.pushState(null, '', window.location.pathname + window.location.search);
    }
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
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* عنوان الصفحة الرئيسي (سيو) - بالضبط كما في متطلبات المستخدم */}
        <div className="text-center sm:text-start space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-500">
            <span>العاب سيارات مجانية على المتصفح</span>
            <span>·</span>
            <span>بدون تحميل</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-game tracking-tight leading-tight">
            لعبة سباق سيارات المدينة السريعة للأبطال
          </h1>

          <p className="text-sm sm:text-base opacity-85 max-w-2xl leading-relaxed">
            العب الآن لعبة سباق السيارات الخارقة في المدينة مجاناً على المتصفح. اختبر مهاراتك في القيادة، وتجنب العقبات، واجمع النقاط لتطوير سيارتك. متوافقة تماماً مع الموبايل والكمبيوتر.
          </p>

          <div className="pt-1 flex items-center gap-3 flex-wrap">
            <button
              onClick={handlePlayNow}
              className="px-6 sm:px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-slate-950 font-black text-sm sm:text-base rounded-xl shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 transition-all cursor-pointer inline-flex"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>العب الآن - انطلق بالسباق</span>
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
              <span>استعراض أنواع السيارات</span>
            </a>
          </div>
        </div>

        {/* مساحة إعلانية علوية مهيأة لأدسنس */}
        <AdSlot slotId="header-leaderboard" format="horizontal" />

        {/* حاوية اللعبة البرمجية - قسم اللعبة الرئيسي */}
        <section id="game-container" className="scroll-mt-20">
          <RacingGame
            ref={racingRef}
            onOpenGarage={() => handleOpenGarage()}
            coins={coins}
            onCoinsChange={setCoins}
          />
        </section>

        {/* مساحات فارغة مهيأة لإعلانات أدسنس المستقبلية دون التأثير على اللعبة */}
        <AdSlot slotId="mid-game-banner" format="horizontal" />

        {/* النص التعريفي الكافي لتخطي شروط أدسنس والسيو وقسم أنواع السيارات */}
        <div>
          <GameArticle onOpenGarage={handleOpenGarage} />
        </div>

        {/* مساحة إعلانية سفلية مهيأة لأدسنس */}
        <AdSlot slotId="bottom-banner" format="horizontal" />
      </main>

      {/* نافذة المرآب والترقيات */}
      <GarageModal
        isOpen={isGarageOpen}
        onClose={() => setIsGarageOpen(false)}
        coins={coins}
        onCoinsChange={setCoins}
        selectedCarIdProp={selectedGarageCarId}
      />

      {/* نافذة الصفحات الأساسية (سياسة الخصوصية - شروط الخدمة - اتصل بنا - من نحن) */}
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
