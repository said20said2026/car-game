import React from 'react';
import { ShieldCheck, FileText, Shield, HelpCircle, Mail, Info } from 'lucide-react';
import { PolicyTab } from './PolicyModal';
import { SocialShare } from './SocialShare';

interface FooterProps {
  onOpenPolicy: (tab: PolicyTab) => void;
  theme?: 'dark' | 'light';
}

export const Footer: React.FC<FooterProps> = ({ onOpenPolicy, theme = 'dark' }) => {
  const isDark = theme === 'dark';

  return (
    <footer className={`w-full border-t mt-16 py-10 text-xs transition-colors ${
      isDark
        ? 'border-slate-800 bg-slate-950 text-slate-400'
        : 'border-slate-200 bg-white text-slate-600 shadow-xs'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Top Row: Brand & AdSense Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-start">
            <div className={`font-bold font-game text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
              لعبة سباق سيارات المدينة السريعة للأبطال
            </div>
            <p className={isDark ? 'text-slate-500 text-xs' : 'text-slate-500 text-xs'}>
              ألعاب سيارات للأطفال البالغين مجانية عبر المتصفح · جميع الحقوق محفوظة © 2026
            </p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-xs">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>متوافق مع سياسات AdSense و SEO</span>
            </span>
          </div>
        </div>

        {/* أزرار وأيقونات المشاركة لوسائل التواصل الاجتماعي العشرة */}
        <SocialShare theme={theme} />

        {/* Middle Row: The Essential AdSense Legal Links (سياسة الخصوصية - شروط الخدمة - اتصل بنا - من نحن) */}
        <div className={`py-3 px-4 rounded-xl border flex flex-wrap items-center justify-center sm:justify-between gap-3 text-xs ${
          isDark
            ? 'bg-slate-900/60 border-slate-800/80 text-slate-300'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <span className="font-semibold text-[11px] sm:text-xs opacity-80">
            الصفحات القانونية والتعريفية:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-5">
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                onOpenPolicy('privacy');
              }}
              className="flex items-center gap-1 hover:text-amber-500 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span>سياسة الخصوصية</span>
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
              <span>شروط الخدمة</span>
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
              <span>اتصل بنا</span>
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
              <span>من نحن</span>
            </a>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className={`text-center sm:text-start text-[11px] border-t pt-4 leading-relaxed ${
          isDark ? 'border-slate-900 text-slate-600' : 'border-slate-100 text-slate-500'
        }`}>
          تم تصميم وبناء هذه اللعبة خصيصاً لموقع games-children.com لتوفير تجربة سباق تفاعلية آمنة وسلسة بدون إعلانات منبثقة مزعجة أو برمجيات ضارة. جميع العلامات التجارية وحقوق السيارات الرقمية مخصصة للأغراض الترفيهية.
        </div>
      </div>
    </footer>
  );
};

