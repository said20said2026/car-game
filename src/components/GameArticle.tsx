import React, { useState } from 'react';
import {
  ChevronDown,
  Trophy,
  ShieldCheck,
  Cpu,
  Smartphone,
  Monitor,
  Wrench,
  Gauge,
  Zap,
  Shield,
  Flame,
  Sparkles,
  BookOpen,
  History,
  Tag,
  Award,
} from 'lucide-react';
import { CARS_DATA } from '../utils/storage';
import { getArticleTranslation } from '../utils/articleTranslations';

interface GameArticleProps {
  onOpenGarage?: (carId?: string) => void;
  currentLang?: string;
}

export const GameArticle: React.FC<GameArticleProps> = ({ onOpenGarage, currentLang = 'en' }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const article = getArticleTranslation(currentLang);
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(currentLang);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <article
      className={`game-description mt-10 space-y-12 leading-relaxed max-w-4xl mx-auto ${
        isRTL ? 'text-right' : 'text-left'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Main Hero Overview */}
      <section className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black font-game text-inherit tracking-tight">
          {article.heroHeading}
        </h2>
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
          {article.formerlyKnownAs}
        </p>
        <p className="text-base sm:text-lg opacity-90 leading-relaxed">
          {article.welcomeP1}
        </p>
        <p className="text-sm sm:text-base opacity-85 leading-relaxed">
          {article.welcomeP2}
        </p>

        {/* High-res gameplay preview image */}
        <figure className="my-6 rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
          <picture>
            <source srcSet="/assets/gameplay-preview.webp" type="image/webp" />
            <img
              src="/assets/gameplay-preview.jpg"
              alt="Apex Pulse: Neon Horizon 3D highway racing gameplay preview with nitrous boost and traffic dodge"
              width={800}
              height={450}
              loading="lazy"
              className="w-full h-auto object-cover max-h-[380px]"
            />
          </picture>
          <figcaption className="text-center text-xs opacity-70 py-2.5 px-4 bg-slate-900/60 border-t border-slate-800/80">
            {article.gameplayCaption}
          </figcaption>
        </figure>
      </section>

      {/* Controls & How to Play */}
      <section id="instructions" className="scroll-mt-24 space-y-4 p-5 sm:p-7 rounded-2xl bg-slate-900/40 border border-slate-800/80">
        <h2 className="text-2xl sm:text-3xl font-black font-game text-inherit tracking-tight">
          {article.howToPlayTitle}
        </h2>
        <p className="opacity-90 text-sm sm:text-base leading-relaxed">
          {article.howToPlayIntro}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-sky-400">
              <Monitor className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-inherit font-game">{article.pcControlsTitle}</h3>
            </div>
            <ul className={`text-xs sm:text-sm opacity-85 leading-relaxed space-y-1.5 list-disc ${isRTL ? 'pr-5' : 'pl-5'}`}>
              {article.pcControls.map((ctrl, i) => (
                <li key={i}>{ctrl}</li>
              ))}
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <Smartphone className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-inherit font-game">{article.mobileControlsTitle}</h3>
            </div>
            <ul className={`text-xs sm:text-sm opacity-85 leading-relaxed space-y-1.5 list-disc ${isRTL ? 'pr-5' : 'pl-5'}`}>
              {article.mobileControls.map((ctrl, i) => (
                <li key={i}>{ctrl}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Arcade Heritage & Lane Swerving Tactics */}
      <section className="space-y-4 p-5 sm:p-7 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-950 border border-slate-800/80">
        <div className="flex items-center gap-2.5 text-amber-400">
          <History className="w-6 h-6 shrink-0" />
          <h2 className="text-xl sm:text-2xl font-black font-game text-white tracking-tight">
            {article.heritageTitle}
          </h2>
        </div>
        <p className="opacity-90 text-sm sm:text-base leading-relaxed text-slate-300">
          {article.heritageP1}
        </p>
        <p className="opacity-90 text-sm sm:text-base leading-relaxed text-slate-300">
          {article.heritageP2}
        </p>
      </section>

      {/* Key Features Breakdown */}
      <section className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black font-game text-inherit tracking-tight">
          {article.exceptionalTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-inherit text-sm font-game">{article.audioFeatureTitle}</h3>
            <p className="text-xs opacity-80 leading-relaxed">
              {article.audioFeatureDesc}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-inherit text-sm font-game">{article.tuningFeatureTitle}</h3>
            <p className="text-xs opacity-80 leading-relaxed">
              {article.tuningFeatureDesc}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-inherit text-sm font-game">{article.weatherFeatureTitle}</h3>
            <p className="text-xs opacity-80 leading-relaxed">
              {article.weatherFeatureDesc}
            </p>
          </div>
        </div>
      </section>

      {/* Pro Racing Tips & High Score Strategy */}
      <section id="tips" className="scroll-mt-24 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black font-game text-inherit tracking-tight">
          {article.proTipsTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {article.tips.map((tip, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60 space-y-1.5">
              <h3 className="text-sm font-bold text-amber-400 font-game flex items-center gap-2">
                {idx === 0 && <Sparkles className="w-4 h-4" />}
                {idx === 1 && <Flame className="w-4 h-4" />}
                {idx === 2 && <Award className="w-4 h-4" />}
                {idx >= 3 && <BookOpen className="w-4 h-4" />}
                <span>{tip.title}</span>
              </h3>
              <p className="text-xs opacity-80 leading-relaxed">
                {tip.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Supercars Fleet Showcase & Specs */}
      <section id="cars" className="scroll-mt-24 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black font-game text-inherit tracking-tight">
              {article.fleetTitle}
            </h2>
            <p className="text-xs sm:text-sm opacity-80 mt-1">
              {article.fleetSubtitle}
            </p>
          </div>

          {onOpenGarage && (
            <button
              onClick={() => onOpenGarage()}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-amber-400/20 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span>{article.openGarageBtn}</span>
            </button>
          )}
        </div>

        {/* Fleet banner */}
        <figure className="my-6 rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
          <picture>
            <source srcSet="/assets/social-cover.webp" type="image/webp" />
            <img
              src="/assets/social-cover.jpg"
              alt="Apex Pulse fleet of exotic supercars in garage"
              width={1200}
              height={630}
              loading="lazy"
              className="w-full h-auto object-cover max-h-[360px]"
            />
          </picture>
          <figcaption className="text-center text-xs opacity-70 py-2.5 px-4 bg-slate-900/60 border-t border-slate-800/80">
            {article.fleetCaption}
          </figcaption>
        </figure>

        {/* Cars Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CARS_DATA.map((car) => (
            <div
              key={car.id}
              className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between space-y-3 hover:border-amber-400/60 transition-all shadow-md group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 font-semibold opacity-90">
                    {car.type}
                  </span>
                  <span
                    className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: car.color }}
                  />
                </div>

                <h3 className="text-lg font-bold font-game text-inherit">{car.name}</h3>
                <p className="text-xs opacity-80 mt-1 line-clamp-2 leading-relaxed">
                  {car.description}
                </p>
              </div>

              {/* Specs */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/60 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sky-400">
                    <Gauge className="w-3.5 h-3.5" />
                    {article.topSpeed}
                  </span>
                  <span className="font-game font-bold tabular-nums text-sky-400">{car.baseSpeed} km/h</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Zap className="w-3.5 h-3.5" />
                    {article.acceleration}
                  </span>
                  <span className="font-bold tabular-nums">{car.baseAcceleration}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Shield className="w-3.5 h-3.5" />
                    {article.handling}
                  </span>
                  <span className="font-bold tabular-nums">{car.baseHandling}%</span>
                </div>
              </div>

              <button
                onClick={() => onOpenGarage?.(car.id)}
                className="w-full mt-2 py-2 px-3 bg-slate-800 hover:bg-amber-400 hover:text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>{article.tuneThisCarBtn}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Specs Comparison Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 mt-4">
          <table className={`w-full text-xs sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
            <thead className="bg-slate-900 border-b border-slate-800 font-bold opacity-90">
              <tr>
                <th className="py-3 px-4">{article.supercarCol}</th>
                <th className="py-3 px-4">{article.classCol}</th>
                <th className="py-3 px-4">{article.topSpeed}</th>
                <th className="py-3 px-4">{article.acceleration}</th>
                <th className="py-3 px-4">{article.handling}</th>
                <th className="py-3 px-4">{article.price}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {CARS_DATA.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </td>
                  <td className="py-3 px-4 opacity-80">{c.type}</td>
                  <td className="py-3 px-4 font-game font-bold text-sky-400 tabular-nums">{c.baseSpeed} km/h</td>
                  <td className="py-3 px-4 tabular-nums">{c.baseAcceleration}%</td>
                  <td className="py-3 px-4 tabular-nums">{c.baseHandling}%</td>
                  <td className="py-3 px-4 font-game text-amber-400 font-bold tabular-nums">
                    {c.price === 0 ? article.freeStarter : `${c.price} ${article.coinsSuffix}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quality Standards & Platform Services */}
      <section className="space-y-6 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/70 border border-amber-500/30 shadow-xl">
        <div className="border-b border-slate-800 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-bold border border-amber-400/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{article.platformBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-game text-white tracking-tight">
            {article.platformTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {article.platformSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3 hover:border-amber-400/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-game text-white">
              {article.service1Title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {article.service1Desc}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3 hover:border-sky-400/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-game text-white">
              {article.service2Title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {article.service2Desc}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3 hover:border-emerald-400/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-game text-white">
              {article.service3Title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {article.service3Desc}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="scroll-mt-24 space-y-4 pt-2">
        <h2 className="text-2xl sm:text-3xl font-black font-game text-inherit tracking-tight">
          {article.faqsTitle}
        </h2>
        <div className="space-y-2.5">
          {article.faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800/80 bg-slate-900/50 overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className={`w-full py-3.5 px-4 font-semibold flex items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors cursor-pointer ${
                  isRTL ? 'text-right' : 'text-left'
                }`}
              >
                <h3 className="text-sm sm:text-base font-bold text-inherit">{faq.q}</h3>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 shrink-0 opacity-70 ${
                    openFaq === idx ? 'rotate-180 text-amber-400 opacity-100' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 pt-1 text-xs sm:text-sm opacity-85 border-t border-slate-800/60 bg-slate-950/20 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SEO Topic Tags & Global Search Directory */}
      <section className="space-y-5 pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-2 text-amber-400">
          <Tag className="w-5 h-5 shrink-0" />
          <h2 className="text-xl sm:text-2xl font-black font-game text-white tracking-tight">
            {article.searchHubTitle}
          </h2>
        </div>
        <p className="text-xs sm:text-sm opacity-85 leading-relaxed text-slate-300">
          {article.searchHubDesc}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2.5">
            <h3 className="font-bold text-amber-400 font-game flex items-center gap-1.5">
              <Trophy className="w-4 h-4" />
              <span>{article.racingModesTagTitle}</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Apex Pulse 3D',
                'Neon Horizon',
                'Metro Racers',
                'City Speed Heroes',
                'Free online car games',
                'Browser racing simulator',
                'Lane swerving game',
                'Near miss dodge mechanics',
                'Nitrous boost speeds',
                'Top 5 leaderboard',
              ].map((term, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-200 border border-slate-700/60 hover:border-amber-400/50 hover:text-amber-300 transition-colors"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2.5">
            <h3 className="font-bold text-sky-400 font-game flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <span>{article.crossPlatformTagTitle}</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                'No download required',
                'Play in browser on PC & Mac',
                'Mobile touch controls',
                '60 FPS HTML5 canvas engine',
                'US & Canada online car games',
                'Netherlands browser games',
                'COPPA child-safe compliant',
              ].map((term, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-200 border border-slate-700/60 hover:border-sky-400/50 hover:text-sky-300 transition-colors"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-amber-500/30 space-y-2.5 sm:col-span-2">
            <h3 className="font-bold text-amber-400 font-game flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{article.servicesTagTitle}</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Best services of games-children.com',
                'Comprehensive guide and detailed reviews',
                'SEO tips and user experience',
                'Safe family gaming 100%',
                'Supercars fleet & garage upgrades',
                'High performance 60 FPS racing',
                'Instant browser play zero downloads',
                'Global leaderboard & daily challenges',
              ].map((term, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-200 border border-slate-700/60 hover:border-amber-400/50 hover:text-amber-300 transition-colors font-medium"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </article>
  );
};
