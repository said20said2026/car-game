import React from 'react';
import { ShieldCheck, FileText, Shield, HelpCircle, Mail, Info, AlertTriangle, Lightbulb, Trophy, Target } from 'lucide-react';
import { PolicyTab } from './PolicyModal';
import { SocialShare } from './SocialShare';
import { getTranslation } from '../utils/i18n';
import { getArticleTranslation } from '../utils/articleTranslations';

interface FooterProps {
  onOpenPolicy: (tab: PolicyTab) => void;
  theme?: 'dark' | 'light';
  currentLang?: string;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPolicy, theme = 'dark', currentLang = 'en' }) => {
  const isDark = theme === 'dark';
  const t = getTranslation(currentLang);
  const article = getArticleTranslation(currentLang);
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(currentLang);

  return (
    <footer className={`w-full border-t mt-16 py-10 text-xs transition-colors ${
      isDark
        ? 'border-slate-800 bg-slate-950 text-slate-400'
        : 'border-slate-200 bg-white text-slate-600 shadow-xs'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Top Row: Brand & AdSense Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className={`font-bold font-game text-base sm:text-lg flex items-center justify-center sm:justify-start gap-2.5 flex-wrap ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <img
                src="/assets/logo.webp"
                alt={isRTL ? "شعار لعبة سباق السيارات ثلاثية الأبعاد Apex Pulse: Neon Horizon" : "Apex Pulse: Neon Horizon Official Racing Game Logo"}
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg border border-amber-500/30 object-contain shadow-xs inline-block"
                loading="lazy"
              />
              <span className="text-[#ffcc00]">APEX PULSE: NEON HORIZON</span>
              <span className="text-xs font-normal text-slate-400">(Formerly known as Metro Racers &amp; City Speed Heroes)</span>
            </div>
            <p className={isDark ? 'text-slate-400 text-xs' : 'text-slate-500 text-xs'}>
              &copy; 2026 <strong>Apex Pulse: Neon Horizon</strong>. Powered by <a href="https://www.games-children.com/" className="text-[#ffcc00] hover:underline font-semibold">games-children.com</a>. All Rights Reserved.
            </p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-xs">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Google AdSense & COPPA Safe Family Gaming</span>
            </span>
          </div>
        </div>

        {/* Social Share Component */}
        <SocialShare theme={theme} />

        {/* Middle Row: Legal & Navigation Links */}
        <div className={`py-3 px-4 rounded-xl border flex flex-wrap items-center justify-center sm:justify-between gap-3 text-xs ${
          isDark
            ? 'bg-slate-900/60 border-slate-800/80 text-slate-300'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <span className="font-semibold text-[11px] sm:text-xs opacity-80">
            Legal & Game Directory:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                onOpenPolicy('privacy');
              }}
              className="flex items-center gap-1 hover:text-amber-500 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span>Privacy Policy</span>
            </a>
            <span className={isDark ? 'text-slate-700 hidden sm:inline' : 'text-slate-300 hidden sm:inline'}>|</span>

            <a
              href="/terms"
              onClick={(e) => {
                e.preventDefault();
                onOpenPolicy('terms');
              }}
              className="flex items-center gap-1 hover:text-amber-500 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-sky-500" />
              <span>Terms of Service</span>
            </a>
            <span className={isDark ? 'text-slate-700 hidden sm:inline' : 'text-slate-300 hidden sm:inline'}>|</span>

            <a
              href="/disclaimer"
              onClick={(e) => {
                e.preventDefault();
                onOpenPolicy('disclaimer');
              }}
              className="flex items-center gap-1 hover:text-amber-500 transition-colors cursor-pointer text-amber-400 font-medium"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Disclaimer</span>
            </a>
            <span className={isDark ? 'text-slate-700 hidden sm:inline' : 'text-slate-300 hidden sm:inline'}>|</span>

            <a
              href="#leaderboard"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('leaderboard');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/#leaderboard';
                }
              }}
              className="flex items-center gap-1 hover:text-amber-500 transition-colors cursor-pointer text-amber-400 font-semibold"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.leaderboard}</span>
            </a>
            <span className={isDark ? 'text-slate-700 hidden sm:inline' : 'text-slate-300 hidden sm:inline'}>|</span>

            <a
              href="#daily-challenges"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('daily-challenges');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/#daily-challenges';
                }
              }}
              className="flex items-center gap-1 hover:text-amber-500 transition-colors cursor-pointer text-amber-400 font-semibold"
            >
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.dailyRewards}</span>
            </a>
            <span className={isDark ? 'text-slate-700 hidden sm:inline' : 'text-slate-300 hidden sm:inline'}>|</span>

            <a
              href="#tips"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('tips');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/#tips';
                }
              }}
              className="flex items-center gap-1 hover:text-amber-500 transition-colors cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>{article.proTipsTitle}</span>
            </a>
            <span className={isDark ? 'text-slate-700 hidden sm:inline' : 'text-slate-300 hidden sm:inline'}>|</span>

            <a
              href="#faq"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('faq');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/#faq';
                }
              }}
              className="flex items-center gap-1 hover:text-amber-500 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>{article.faqsTitle}</span>
            </a>
            <span className={isDark ? 'text-slate-700 hidden sm:inline' : 'text-slate-300 hidden sm:inline'}>|</span>

            <a
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                onOpenPolicy('contact');
              }}
              className="flex items-center gap-1 hover:text-amber-500 transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-500" />
              <span>Contact Us</span>
            </a>
            <span className={isDark ? 'text-slate-700 hidden sm:inline' : 'text-slate-300 hidden sm:inline'}>|</span>

            <a
              href="/about"
              onClick={(e) => {
                e.preventDefault();
                onOpenPolicy('about');
              }}
              className="flex items-center gap-1 hover:text-amber-500 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-purple-500" />
              <span>About Us</span>
            </a>
          </div>
        </div>

        {/* Categories Directory for Global SEO (USA, Canada, Netherlands, Global) */}
        <div className={`p-4 rounded-xl border text-[11px] leading-relaxed space-y-3 ${
          isDark
            ? 'bg-slate-900/30 border-slate-800/60 text-slate-400'
            : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className="font-bold text-xs text-[#ffcc00] font-game">
            Metro Racers High-Speed Racing Highlights:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <span className="font-semibold block text-slate-300 mb-1">Online Highway Racing:</span>
              <p className="opacity-80">
                Metro Racers (formerly City Speed Heroes) 3D · High-speed traffic dodge · Lane swerving gameplay · Nitrous boost rush · Daily challenge quests · Champions high score leaderboard.
              </p>
            </div>
            <div>
              <span className="font-semibold block text-slate-300 mb-1">Instant Browser Simulator:</span>
              <p className="opacity-80">
                Zero download required · High-performance 60 FPS HTML5 canvas engine · Optimized for PC, Mac, Chromebook, Android, iOS & tablets across USA, Canada, Netherlands & worldwide.
              </p>
            </div>
            <div>
              <span className="font-semibold block text-slate-300 mb-1">Supercars & Tracks:</span>
              <p className="opacity-80">
                Fleet of 6 unique supercars · American V8 Muscle, Futuristic Aero Hypercar, All-Terrain 4x4, Desert Dune Marauder · Dynamic weather, night city lights & desert highways.
              </p>
            </div>
            <div>
              <span className="font-semibold block text-slate-300 mb-1">games-children.com Best Services:</span>
              <p className="opacity-80">
                Top tier web gaming experience · Detailed supercar guides & performance reviews · Search engine optimization (SEO) & user experience standards · COPPA compliant and family safe.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className={`text-center sm:text-left text-[11px] border-t pt-4 leading-relaxed flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isDark ? 'border-slate-900 text-slate-500' : 'border-slate-100 text-slate-500'
        }`}>
          <p className="m-0">
            <strong className="text-amber-400/90 font-bold">• Disclaimer:</strong> Metro Racers (formerly City Speed Heroes) is designed exclusively for games-children.com to provide a fun, safe, high-speed arcade simulation for entertainment purposes only. It does not represent real-world traffic laws. Drive safely in real life.
          </p>
          <a
            href="/disclaimer"
            onClick={(e) => {
              e.preventDefault();
              onOpenPolicy('disclaimer');
            }}
            className="text-amber-400 hover:text-amber-300 font-bold whitespace-nowrap underline cursor-pointer shrink-0"
          >
            Full Legal Disclaimer →
          </a>
        </div>
      </div>
    </footer>
  );
};
