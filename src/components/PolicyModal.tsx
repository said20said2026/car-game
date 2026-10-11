import React, { useState } from 'react';
import {
  X,
  Shield,
  FileText,
  Mail,
  Info,
  Send,
  CheckCircle2,
  Lock,
  Globe,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export type PolicyTab = 'privacy' | 'terms' | 'contact' | 'about';

interface PolicyModalProps {
  isOpen: boolean;
  activeTab: PolicyTab;
  onClose: () => void;
  onSelectTab: (tab: PolicyTab) => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  activeTab,
  onClose,
  onSelectTab,
}) => {
  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('general');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;

    // Simulate successful submission
    setContactSubmitted(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setContactSubmitted(false);
    }, 4000);
  };

  const navItems = [
    { id: 'privacy', label: 'سياسة الخصوصية', icon: Shield },
    { id: 'terms', label: 'شروط الخدمة', icon: FileText },
    { id: 'contact', label: 'اتصل بنا', icon: Mail },
    { id: 'about', label: 'من نحن', icon: Info },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col text-slate-100">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold font-game text-white">
              بوابة المعلومات والسياسات القانونية · games-children.com
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2.5 bg-slate-950/30 border-b border-slate-800/80 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body / Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-6">
          {/* TAB 1: سياسة الخصوصية (PRIVACY POLICY) */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl sm:text-2xl font-bold font-game text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-400" />
                  <span>سياسة الخصوصية (Privacy Policy)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  آخر تحديث: 2026 · تتوافق هذه السياسة مع معايير Google AdSense واللائحة العامة لحماية البيانات (GDPR)
                </p>
              </div>

              <section className="space-y-3">
                <h4 className="text-base font-bold text-white">1. التزامنا بخصوصيتك</h4>
                <p>
                  نحن في موقع <strong>games-children.com</strong> نولي أهمية قصوى لخصوصية زوارنا. توضح هذه الوثيقة أنواع المعلومات الشخصية التي يتم استلامها وجمعها عند استخدامك للعبة سباق سيارات المدينة السريعة وكيفية حمايتها واستخدامها.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-base font-bold text-white">2. ملفات تعريف الارتباط وإعلانات Google AdSense</h4>
                <p>
                  يستخدم موقعنا خدمات إعلانية مقدمة من أطراف ثالثة، وعلى رأسها <strong>Google AdSense</strong>:
                </p>
                <ul className="list-disc pr-6 space-y-2">
                  <li>
                    تستخدم شركة Google ملفات تعريف الارتباط (مثل ملف DART) لعرض الإعلانات للمستخدمين استناداً إلى زيارتهم لهذا الموقع وغيره من المواقع على شبكة الإنترنت.
                  </li>
                  <li>
                    يجوز للمستخدمين إلغاء استخدام ملف تعريف الارتباط DART بزيارة سياسة الخصوصية الخاصة بشبكة إعلانات Google ومحتواها.
                  </li>
                  <li>
                    قد تستخدم شبكات الإعلانات التابعة لجهات خارجية تقنيات (مثل ملفات تعريف الارتباط أو إشارات الويب) لقياس فاعلية حملاتها الإعلانية أو لتخصيص محتوى الإعلانات التي تراها.
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h4 className="text-base font-bold text-white">3. التخزين المحلي للعبة (LocalStorage)</h4>
                <p>
                  تستخدم اللعبة خاصية التخزين المحلي في متصفحك (HTML5 LocalStorage) حصرياً لحفظ تقدمك الشخصي في اللعبة (مثل: عدد العملات المجمعة، السيارات المفتوحة، مستويات ترقية المحرك، وأعلى رقم قياسي محقق). هذه البيانات تُحفظ محلياً على جهازك ولا نقوم برفعها أو نقلها إلى أي خوادم خارجية.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-base font-bold text-white">4. خصوصية الأطفال واليافعين</h4>
                <p>
                  موقعنا آمن ومصمم لتقديم محتوى ترفيهي هادف ونظيف للأطفال البالغين والناشئين وجميع الفئات العمرية. لا نطلب تسجيل حساب، ولا نجمع أسماء المستخدمين الحقيقية أو عناوين منازلهم أو أرقام هواتفهم.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-base font-bold text-white">5. التواصل بشأن الخصوصية</h4>
                <p>
                  إذا كانت لديك أي استفسارات أو أسئلة حول سياسة الخصوصية الخاصة بنا، يمكنك التواصل معنا مباشرة عبر البريد الإلكتروني الرسمي: <strong className="text-amber-400">samipico425@gmail.com</strong>.
                </p>
              </section>
            </div>
          )}

          {/* TAB 2: شروط الخدمة (TERMS OF SERVICE) */}
          {activeTab === 'terms' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl sm:text-2xl font-bold font-game text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>شروط الخدمة والاستخدام (Terms of Service)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  شروط الاستخدام القانونية للعبة وموقع games-children.com
                </p>
              </div>

              <section className="space-y-3">
                <h4 className="text-base font-bold text-white">1. الموافقة على الشروط</h4>
                <p>
                  بمجرد دخولك إلى هذا الموقع ولعب <strong>لعبة سباق سيارات المدينة السريعة</strong>، فإنك توافق على الالتزام بشروط وأحكام الاستخدام الموضحة هنا، وجميع القوانين واللوائح المعمول بها محلياً ودولياً.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-base font-bold text-white">2. حقوق الملكية الفكرية</h4>
                <p>
                  كافة الأصول البرمجية، والأكواد المصدرية، وتصميمات سيارات السباق، والمحرك الصوتي، والمحتوى النصي المنشور على الموقع هي ملك حصري لموقع <strong>games-children.com</strong>، ومحمية بموجب قوانين حقوق النشر والعلامات التجارية المعمول بها.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-base font-bold text-white">3. الاستخدام المقبول</h4>
                <p>
                  يُسمح للمستخدمين بالاستمتاع باللعبة لأغراض الترفيه الشخصي غير التجاري. ويُحظر تماماً:
                </p>
                <ul className="list-disc pr-6 space-y-1.5 text-slate-300">
                  <li>محاولة اختراق أو تعطيل أو إغراق خوادم الموقع بحركة مرور ضارة.</li>
                  <li>استخدام برمجيات غير مصرح بها للتلاعب بالنقاط أو الإعلانات المعروضة.</li>
                  <li>إعادة هندسة الأكواد أو نسخ المحتوى لأغراض تجارية مضللة دون إذن كتابي مسبق.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h4 className="text-base font-bold text-white">4. إخلاء المسؤولية</h4>
                <p>
                  يتم تقديم اللعبة ومحتوى الموقع "كما هو" (AS IS) دون أي ضمانات صريحة أو ضمنية. نحن نسعى دائماً لضمان استقرار وسلاسة اللعب بدون انقطاع، ولكننا لا نتحمل المسؤولية عن أي انقطاع مفاجئ ناتج عن المتصفح أو مزودي خدمة الإنترنت.
                </p>
              </section>
            </div>
          )}

          {/* TAB 3: اتصل بنا (CONTACT US) */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl sm:text-2xl font-bold font-game text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-amber-400" />
                  <span>اتصل بنا (Contact Us)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  يسعدنا استقبال استفساراتك واقتراحاتك حول اللعبة أو الشراكات الإعلانية
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Form column (3 cols) */}
                <div className="md:col-span-3">
                  {contactSubmitted ? (
                    <div className="p-6 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-center space-y-3">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                      <h4 className="text-base font-bold text-white">تم إرسال رسالتك بنجاح!</h4>
                      <p className="text-xs text-slate-300">
                        شكراً لتواصلك معنا. سنقوم بمراجعة رسالتك والرد عليك عبر بريدك الإلكتروني في أقرب وقت.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          الاسم الكامل
                        </label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="مثال: أحمد محمد"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          البريد الإلكتروني
                        </label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="example@email.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 text-left"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          موضوع الرسالة
                        </label>
                        <select
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                        >
                          <option value="general">استفسار عام</option>
                          <option value="feedback">اقتراح لتطوير اللعبة وإضافة سيارات</option>
                          <option value="bug">الإبلاغ عن مشكلة برمجية (Bug Report)</option>
                          <option value="ads">استفسار بخصوص الإعلانات والشراكات</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          نص الرسالة
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder="اكتب رسالتك أو ملاحظاتك هنا..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                      >
                        <Send className="w-4 h-4" />
                        <span>إرسال الرسالة الآن</span>
                      </button>
                    </form>
                  )}
                </div>

                {/* Direct Contact Info (2 cols) */}
                <div className="md:col-span-2 space-y-4 bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>معلومات التواصل المباشر</span>
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="text-slate-400 font-semibold mb-0.5">البريد الإلكتروني المعتمد:</div>
                      <a
                        href="mailto:samipico425@gmail.com"
                        className="text-amber-400 font-mono hover:underline text-xs"
                      >
                        samipico425@gmail.com
                      </a>
                    </div>

                    <div>
                      <div className="text-slate-400 font-semibold mb-0.5">الموقع الرسمي:</div>
                      <div className="text-slate-200 font-mono">https://games-children.com</div>
                    </div>

                    <div>
                      <div className="text-slate-400 font-semibold mb-0.5">ساعات المتابعة:</div>
                      <div className="text-slate-300">يومياً من 9:00 صباحاً حتى 6:00 مساءً (الرد خلال 24 ساعة)</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    نرحب بجميع اقتراحات اللاعبين لإضافة ميزات ومضامير وسيارات جديدة في التحديثات الدورية!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: من نحن (ABOUT US) */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl sm:text-2xl font-bold font-game text-white flex items-center gap-2">
                  <Info className="w-5 h-5 text-amber-400" />
                  <span>من نحن (About Us) · ألعاب سباق سيارات المدينة</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  رؤيتنا ورسالتنا في تقديم ألعاب متصفح عربية خفيفة واحترافية
                </p>
              </div>

              <section className="space-y-3">
                <h4 className="text-base font-bold text-white">من نحن؟</h4>
                <p>
                  نحن فريق من مطوري الألعاب ومصممي تجارب الويب العرب، أنشأنا منصة <strong>games-children.com</strong> بهدف تقديم تجربة ألعاب أركيد تفاعلية متطورة للمستخدم العربي ومحبي السرعة من الأطفال البالغين والناشئين والشباب، دون تعقيدات التثبيت وبدون استهلاك مساحات الذاكرة.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-base font-bold text-white">رسالتنا وهدفنا</h4>
                <p>
                  رسالتنا هي إثراء المحتوى الترفيهي العربي على شبكة الإنترنت بألعاب ذات أداء تقني عالٍ تنافس الألعاب العالمية:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="font-bold text-amber-400 text-xs sm:text-sm">بيئة لعب آمنة وموثوقة</div>
                    <p className="text-[11px] text-slate-300">
                      خالية من أي محتوى غير لائق أو برمجيات خبيثة، مع الالتزام التام بإرشادات جوجل لألعاب الأطفال والأسرة.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="font-bold text-sky-400 text-xs sm:text-sm">أعلى كفاءة وسرعة تحميل</div>
                    <p className="text-[11px] text-slate-300">
                      الاعتماد على تقنيات HTML5 و Web Audio لتشغيل اللعبة في أجزاء من الثانية دون انتظار طويل.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-base font-bold text-white">تقنيات تطوير اللعبة</h4>
                <p>
                  تم بناء <strong>لعبة سباق سيارات المدينة السريعة</strong> باستخدام أحدث تقنيات الويب:
                </p>
                <ul className="list-disc pr-6 space-y-1.5 text-slate-300">
                  <li><strong>HTML5 Canvas 2.5D:</strong> لرسم مسارات الطريق المتعرجة والمركبات بمعدل 60 إطاراً في الثانية.</li>
                  <li><strong>Web Audio API:</strong> لتوليد أصوات محركات واقعية وتأثيرات النيترو والانجراف البرمجية.</li>
                  <li><strong>React & TypeScript:</strong> لواجهات مستخدم فائقة الاستجابة وخالية من الأخطاء.</li>
                  <li><strong>تصميم متجاوب بالكامل:</strong> يتأقلم بدقة مع شاشات الهواتف الذكية والأجهزة اللوحية والحواسيب المكتبية.</li>
                </ul>
              </section>

              <section className="space-y-2 border-t border-slate-800 pt-4">
                <p className="text-xs text-slate-400">
                  نتمنى لكم أوقاتاً ممتعة وحافلة بالإثارة والسرعة في سباقات المدينة!
                </p>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
