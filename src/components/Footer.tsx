import React from 'react';
import { ShieldCheck, FileText, Shield, HelpCircle, Mail, Info, AlertTriangle } from 'lucide-react';
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

        {/* رابط منشور إنستغرام الرسمي لزيادة الزيارات والأرشفة */}
        <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
          isDark
            ? 'bg-slate-900/50 border-slate-800 text-slate-300'
            : 'bg-white border-slate-200 text-slate-700 shadow-xs'
        }`}>
          <div className="flex items-center gap-2.5 text-center sm:text-start">
            <span className="w-2.5 h-2.5 rounded-full bg-[#dc2743] shrink-0" />
            <span className="font-bold text-white">
              تابع تحديات ألعاب سباق سيارات المدينة السريعة على إنستغرام:
            </span>
            <span className="text-[11px] text-slate-400 hidden md:inline">
              مقاطع حصرية، أرقام قياسية ومنافسات المتصدرين
            </span>
          </div>
          <a
            href="https://www.instagram.com/p/Dej81fEjA0J/?utm_source=ig_web_copy_link&rpxt=MzRlODBiNWFlZA==&srtk=MzRlODBiNWFlZA=="
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white font-bold text-xs hover:opacity-90 active:scale-95 transition-all shadow-sm shrink-0"
          >
            <span>زيارة منشور إنستغرام</span>
            <span>↗</span>
          </a>
        </div>

        {/* Middle Row: The Essential AdSense Legal Links (سياسة الخصوصية - شروط الخدمة - إخلاء مسؤولية - اتصل بنا - من نحن) */}
        <div className={`py-3 px-4 rounded-xl border flex flex-wrap items-center justify-center sm:justify-between gap-3 text-xs ${
          isDark
            ? 'bg-slate-900/60 border-slate-800/80 text-slate-300'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <span className="font-semibold text-[11px] sm:text-xs opacity-80">
            الصفحات القانونية والتعريفية:
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
              href="/disclaimer"
              onClick={(e) => {
                e.preventDefault();
                onOpenPolicy('disclaimer');
              }}
              className="flex items-center gap-1 hover:text-amber-500 transition-colors cursor-pointer text-amber-400 font-medium"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>• إخلاء مسؤولية</span>
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

        {/* خريطة الفئات والموضوعات لمحركات البحث وعشاق ألعاب القيادة والسباق */}
        <div className={`p-4 rounded-xl border text-[11px] leading-relaxed space-y-3 ${
          isDark
            ? 'bg-slate-900/30 border-slate-800/60 text-slate-400'
            : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className="font-bold text-xs text-amber-500 font-game">
            دليل أقسام وموضوعات سباق المدينة السريع:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="font-semibold block text-slate-300 mb-1">ألعاب السباق والمنافسات:</span>
              <p className="opacity-80">
                ألعاب سباق سيارات المدينة السريعة للأبطال · لعبة عربيات سباق · مسابقة قيادة احترافية · ألعاب الأركيد وتفادي الحوادث · لوحة المتصدرين والتحديات اليومية.
              </p>
            </div>
            <div>
              <span className="font-semibold block text-slate-300 mb-1">محاكاة الهواتف وألعاب الأونلاين:</span>
              <p className="opacity-80">
                محاكي قيادة واقعي للأندرويد · ألعاب سباق apk للمتصفح · ألعاب أونلاين سريعة بدون تحميل · تجربة ويب خفيفة بدقة 60 FPS.
              </p>
            </div>
            <div>
              <span className="font-semibold block text-slate-300 mb-1">كلاسيكيات ومضامير ألعاب التحدي:</span>
              <p className="opacity-80">
                ذكريات سابق ولاحق · ألعاب حرب الديناميت والصدام التكتيكي · تفادي الحارات lane swerving game · مضمار رمال الصحراء · مرآب وتعديل أسطول 6 car games.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className={`text-center sm:text-start text-[11px] border-t pt-4 leading-relaxed flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isDark ? 'border-slate-900 text-slate-500' : 'border-slate-100 text-slate-500'
        }`}>
          <p className="m-0">
            <strong className="text-amber-400/90 font-bold">• إخلاء مسؤولية:</strong> تم تصميم وبناء هذه اللعبة خصيصاً لموقع games-children.com لتوفير تجربة سباق تفاعلية آمنة وسلسة للأغراض الترفيهية فقط، ولا تمثل محاكاة واقعية لقواعد السير على الطرق العامة. جميع العلامات وحقوق السيارات مخصصة للترفيه الرقمي.
          </p>
          <a
            href="/disclaimer"
            onClick={(e) => {
              e.preventDefault();
              onOpenPolicy('disclaimer');
            }}
            className="text-amber-400 hover:text-amber-300 font-bold whitespace-nowrap underline cursor-pointer shrink-0"
          >
            صفحة إخلاء المسؤولية ◀
          </a>
        </div>
      </div>
    </footer>
  );
};

