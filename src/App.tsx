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
  const [isGarageOpen, setIsGarageOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState<PolicyTab>('privacy');
  const [coins, setCoins] = useState(() => {
    return loadPlayerStats().coins;
  });

  // Support direct hash navigation for policy pages (e.g. #privacy, #terms, #contact, #about)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['privacy', 'terms', 'contact', 'about'].includes(hash)) {
        setPolicyTab(hash as PolicyTab);
        setIsPolicyOpen(true);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      <Header onPlayClick={handlePlayNow} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* عنوان الصفحة الرئيسي (سيو) - بالضبط كما في متطلبات المستخدم */}
        <div className="text-center sm:text-start space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400">
            <span>العاب سيارات مجانية على المتصفح</span>
            <span>·</span>
            <span>بدون تحميل</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-game text-white tracking-tight leading-tight">
            لعبة سباق سيارات المدينة السريعة للأبطال
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            العب الآن لعبة سباق السيارات الخارقة في المدينة مجاناً على المتصفح. اختبر مهاراتك في القيادة، وتجنب العقبات، واجمع النقاط لتطوير سيارتك. متوافقة تماماً مع الموبايل والكمبيوتر.
          </p>

          <div className="pt-1">
            <button
              onClick={handlePlayNow}
              className="px-6 sm:px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-slate-950 font-black text-sm sm:text-base rounded-xl shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 transition-all cursor-pointer inline-flex"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>العب الآن - انطلق بالسباق</span>
            </button>
          </div>
        </div>

        {/* مساحة إعلانية علوية مهيأة لأدسنس */}
        <AdSlot slotId="header-leaderboard" format="horizontal" />

        {/* حاوية اللعبة البرمجية - قسم اللعبة الرئيسي */}
        <section id="game-container" className="scroll-mt-20">
          <RacingGame
            ref={racingRef}
            onOpenGarage={() => setIsGarageOpen(true)}
            coins={coins}
            onCoinsChange={setCoins}
          />
        </section>

        {/* مساحات فارغة مهيأة لإعلانات أدسنس المستقبلية دون التأثير على اللعبة */}
        <AdSlot slotId="mid-game-banner" format="horizontal" />

        {/* النص التعريفي الكافي لتخطي شروط أدسنس والسيو */}
        <div id="instructions">
          <GameArticle />
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

      <Footer onOpenPolicy={handleOpenPolicy} />
    </div>
  );
}
