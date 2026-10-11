import React from 'react';
import { ShieldCheck, FileText, Shield, HelpCircle, Mail, Info } from 'lucide-react';
import { PolicyTab } from './PolicyModal';

interface FooterProps {
  onOpenPolicy: (tab: PolicyTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPolicy }) => {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 mt-16 py-10 text-slate-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Top Row: Brand & AdSense Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-start">
            <div className="font-bold font-game text-white text-base">
              لعبة سباق سيارات المدينة السريعة للأبطال
            </div>
            <p className="text-slate-500 text-xs">
              ألعاب سيارات للأطفال البالغين مجانية عبر المتصفح · جميع الحقوق محفوظة © 2026
            </p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-xs">
            <a
              href="/ads.txt"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>ملف ads.txt (معتمد)</span>
            </a>
            <span className="text-slate-700">·</span>
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>متوافق مع سياسات AdSense و SEO</span>
            </span>
          </div>
        </div>

        {/* Middle Row: The Essential AdSense Legal Links (سياسة الخصوصية - شروط الخدمة - اتصل بنا - من نحن) */}
        <div className="py-3 px-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-center sm:justify-between gap-3 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] sm:text-xs">
            الصفحات القانونية والتعريفية:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-5">
            <button
              onClick={() => onOpenPolicy('privacy')}
              className="flex items-center gap-1 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>سياسة الخصوصية</span>
            </button>
            <span className="text-slate-700 hidden sm:inline">|</span>

            <button
              onClick={() => onOpenPolicy('terms')}
              className="flex items-center gap-1 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>شروط الخدمة</span>
            </button>
            <span className="text-slate-700 hidden sm:inline">|</span>

            <button
              onClick={() => onOpenPolicy('contact')}
              className="flex items-center gap-1 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>اتصل بنا</span>
            </button>
            <span className="text-slate-700 hidden sm:inline">|</span>

            <button
              onClick={() => onOpenPolicy('about')}
              className="flex items-center gap-1 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-purple-400" />
              <span>من نحن</span>
            </button>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="text-center sm:text-start text-[11px] text-slate-600 border-t border-slate-900 pt-4 leading-relaxed">
          تم تصميم وبناء هذه اللعبة خصيصاً لموقع games-children.com لتوفير تجربة سباق تفاعلية آمنة وسلسة بدون إعلانات منبثقة مزعجة أو برمجيات ضارة. جميع العلامات التجارية وحقوق السيارات الرقمية مخصصة للأغراض الترفيهية.
        </div>
      </div>
    </footer>
  );
};

