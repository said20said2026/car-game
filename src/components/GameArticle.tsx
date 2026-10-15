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
  Coins,
  Flame,
  CloudRain,
  Sun,
  Moon,
  HelpCircle,
  Award,
  Sparkles,
  BookOpen,
  Gamepad2,
  History,
  Compass,
  Crosshair,
  Tag,
  Activity,
  Layers,
  Car,
} from 'lucide-react';
import { CARS_DATA } from '../utils/storage';

interface GameArticleProps {
  onOpenGarage?: (carId?: string) => void;
}

export const GameArticle: React.FC<GameArticleProps> = ({ onOpenGarage }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'هل لعبة سباق سيارات المدينة السريعة مجانية بالكامل؟',
      a: 'نعم، اللعبة مجانية بنسبة 100% ولا تتطلب أي اشتراك أو تحميل ملفات؛ يمكنك الاستمتاع بكافة المركبات والمضامير مباشرة عبر متصفح الإنترنت على الهاتف المحمول أو الجهاز المكتبي أو اللوحي.',
    },
    {
      q: 'كيف يمكنني جمع العملات وتطوير مركبتي بسرعة؟',
      a: 'يمكنك مضاعفة رصيدك بثلاث طرق: التقاط العملات الذهبية أثناء الانطلاق، تنفيذ مناورات "التجاوز الوشيك" (Near Miss) بالمرور بالقرب الشديد من مركبات المرور بسرعة عالية، والحفاظ على سلاسل السرعة العالية واستخدام النيترو بانتظام لقطع أطول مسافة ممكنة.',
    },
    {
      q: 'هل تدعم اللعبة أزرار التحكم باللمس على الهواتف والأجهزة اللوحية؟',
      a: 'نعم، تم تزويد اللعبة بنظام تحكم لمسي متطور مصمم خصيصاً للهواتف الذكية والشاشات اللمسية (Android و iOS). تظهر أزرار توجيه جانبية سريعة الاستجابة، مع دواسة فرامل لمسية وزر فوري لتفعيل أكسيد النيتروز (Nitro)، مع تسارع تلقائي يتيح لك التركيز الكامل على المناورة وتفادي العقبات.',
    },
    {
      q: 'ما هي مواصفات الجهاز والمتصفحات المتوافقة لتشغيل اللعبة؟',
      a: 'تعمل اللعبة بكفاءة عالية وبمعدل 60 إطاراً في الثانية (60 FPS) على معظم الأجهزة الحديثة والمتوسطة. يكفي وجود متصفح حديث يدعم تقنيات HTML5 و Canvas مثل Google Chrome، Safari، Microsoft Edge، أو Mozilla Firefox، مع استهلاك منخفض جداً لطاقة البطارية والذاكرة العشوائية.',
    },
    {
      q: 'هل يتم حفظ تقدمي والمركبات التي فتحتها إذا أغلقت المتصفح؟',
      a: 'نعم بالتأكيد! تعتمد اللعبة على تقنية التخزين المحلي الآمن (HTML5 LocalStorage) على جهازك مباشرة. يتم حفظ رصيد العملات، وأعلى رقم قياسي حققته، وكافة النماذج التي قمت بشرائها أو ترقية محركاتها تلقائياً، دون الحاجة لإنشاء حساب أو إدخال أي بيانات شخصية.',
    },
    {
      q: 'ما الفرق بين الانجراف (Drift) والتجاوز الوشيك (Near Miss)؟',
      a: 'الانجراف (Drift) يتم تفعيله عند الضغط على زر الفرامل مع الانعطاف السريع، مما يسمح للمركبة بقطع المنحنيات الحادة مع الحفاظ على عزم الدوران. أما التجاوز الوشيك (Near Miss) فهو حركة بهلوانية جريئة تتمثل في المرور بجانب شاحنات وحافلات المرور على مسافة سنتيمترات معدودة بسرعة تفوق 120 كم/س، وهو ما يمنحك مكافآت نقاط إضافية وعملات فورية.',
    },
    {
      q: 'هل اللعبة آمنة للأطفال وخالية من أي محتوى غير لائق؟',
      a: 'نعم تماماً، صُممت اللعبة لتكون بيئة ترفيهية عائلية آمنة 100% متوافقة مع إرشادات حماية الأطفال على الإنترنت (COPPA). لا تحتوي اللعبة على أي مشاهد عنف أو مؤثرات مؤذية، ولا تتضمن غرف دردشة عامة أو روابط خارجية غير آمنة، مما يجعلها خياراً ممتازاً وممتعاً للأطفال والناشئين.',
    },
    {
      q: 'هل تتوفر اللعبة بصيغة تطبيق APK أو محاكي قيادة واقعي للاندرويد؟',
      a: 'بالتأكيد! إذا كنت تبحث عن محاكي قيادة واقعي للاندرويد أو صيغة APK خفيفة، فلن تحتاج إلى تنزيل برامج من مصادر مجهولة؛ حيث تدعم اللعبة تقنية PWA وتعمل كتطبيق أونلاين متكامل يمكن تثبيته بلمسة واحدة على شاشة هاتفك.',
    },
    {
      q: 'هل اللعبة مستوحاة من كلاسيكيات السباق مثل لعبة سابق ولاحق وألعاب زمن الطيبين؟',
      a: 'نعم! تستلهم اللعبة روح التحدي الكلاسيكي، فإذا كنت تعشق سباقات سابق ولاحق وتطوير المحركات المصغرة، أو تبحث عن حماس المناورات الحركية وتفادي الاصطدامات، ستجد هنا إثارة متجددة تجمع بين تفادي الحارات (lane swerving game) وفيزياء الحركة ثلاثية الأبعاد.',
    },
    {
      q: 'ما سر التركيز على أسطول الـ 6 مركبات بدلاً من مواقع الـ 500 car games؟',
      a: 'بدلاً من المواقع المزدحمة بآلاف الألعاب السطحية، ركّزنا في أسطول المركبات الست (6 car games) على تقديم تجربة قيادة متقنة بعناية. تشمل فئات الدفع الرباعي والمحركات الرياضية الخارقة، مع فيزياء تماسك مخصصة ونظام ترقية واقعي لكل طراز.',
    },
    {
      q: 'هل يحتوي المضمار على مسار في الصحراء؟',
      a: 'نعم، يتضمن مسار السباق بيئة الصحراء الكبرى (Desert Storm Track) مع عواصف ترابية خفيفة وكثبان رملية وانزلاق ديناميكي للإطارات يختبر مهاراتك في منافسة حقيقية لا ترحم.',
    },
  ];

  return (
    <article className="game-description mt-10 space-y-12 leading-relaxed max-w-4xl mx-auto">
      {/* القسم الرئيسي المطلوب من المستخدم */}
      <section className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black font-game text-inherit tracking-tight">
          لعبة سباق سيارات المدينة السريعة للأبطال - عالم من السرعة والإثارة
        </h2>
        <p className="text-base sm:text-lg opacity-90 leading-relaxed">
          مرحباً بك في <strong>لعبة سباق سيارات المدينة السريعة للأبطال</strong>، تجربة القيادة والمنافسة الأكثر إثارة على الإنترنت! إذا كنت تبحث عن متعة <strong>لعبة عربيات سباق</strong> حماسية تخطف الأنفاس، فإن هذه التجربة صُممت لتمنحك شعور سائق محترف يخوض <strong>مسابقة قيادة حقيقية</strong> وسط شوارع المدينة التفاعلية.
        </p>
        <p className="text-sm sm:text-base opacity-85 leading-relaxed">
          تجمع اللعبة بين أصالة ألعاب الأركيد الكلاسيكية وفيزياء القيادة العصرية ثلاثية الأبعاد، حيث تتيح لك المناورة وتفادي الازدحام المروري واستخدام غاز النيترو لتحطيم الأرقام القياسية وجمع العملات الذهبية لتطوير مركبتك في المرآب، كل ذلك مباشرة عبر المتصفح على الهاتف والكمبيوتر دون الحاجة إلى انتظار روابط التحميل.
        </p>

        {/* لقطة شاشة اللعبة بصيغة WebP مع نص بديل (Alt Tag) غني بالسيو */}
        <figure className="my-6 rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
          <picture>
            <source srcSet="/assets/gameplay-preview.webp" type="image/webp" />
            <img
              src="/assets/gameplay-preview.jpg"
              alt="لقطة حية من مضمار لعبة سباق سيارات المدينة السريعة للأبطال مع حركة المرور وتأثيرات النيترو"
              width={800}
              height={450}
              loading="lazy"
              className="w-full h-auto object-cover max-h-[380px]"
            />
          </picture>
          <figcaption className="text-center text-xs opacity-70 py-2.5 px-4 bg-slate-900/60 border-t border-slate-800/80">
            مضمار السباق التفاعلي - رسومات ثلاثية الأبعاد متطورة وتجربة قيادة واقعية على المتصفح
          </figcaption>
        </figure>
      </section>

      {/* تفاصيل التحكم وطريقة اللعب */}
      <section id="instructions" className="scroll-mt-24 space-y-4 p-5 sm:p-7 rounded-2xl bg-slate-900/40 border border-slate-800/80">
        <h2 className="text-2xl sm:text-3xl font-black font-game text-inherit tracking-tight">
          كيفية اللعب وإرشادات التحكم (Gameplay Instructions)
        </h2>
        <p className="opacity-90 text-sm sm:text-base leading-relaxed">
          تم تصميم نظام التحكم ليكون بديهياً وسهل الإتقان للمبتدئين، مع احتوائه على عمق تكتيكي يحتاجه المحترفون لتحطيم الأرقام القياسية:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-sky-400">
              <Monitor className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-inherit font-game">التحكم على الكمبيوتر (PC Keyboard)</h3>
            </div>
            <ul className="text-xs sm:text-sm opacity-85 leading-relaxed space-y-1.5 list-disc pr-5">
              <li><strong>الأسهم يميناً ويساراً أو (A / D):</strong> لتوجيه المقود بين حارات الطريق وتفادي المركبات والشاحنات البطيئة.</li>
              <li><strong>السهم للأعلى أو (W):</strong> لزيادة السرعة واستغلال أقصى قدرة للحصان الميكانيكي.</li>
              <li><strong>السهم للأسفل أو (S):</strong> لتخفيف السرعة واستخدام المكابح لتفادي الاصطدامات الطارئة.</li>
              <li><strong>زر المسافة (Spacebar):</strong> لاستخدام فرامل اليد والانجراف (Drift) حول المنعطفات الحادة.</li>
              <li><strong>زر Shift:</strong> لإطلاق دفعة غاز النيترو الخارقة عند اكتمال تعبئة الخزان.</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <Smartphone className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-inherit font-game">التحكم باللمس على الموبايل (Mobile Touch)</h3>
            </div>
            <ul className="text-xs sm:text-sm opacity-85 leading-relaxed space-y-1.5 list-disc pr-5">
              <li><strong>أزرار الأسهم الشفافة أسفل الشاشة:</strong> لتوجيه المقود بدقة فائقة عبر إبهام اليد.</li>
              <li><strong>التسارع التلقائي الذكي:</strong> ينطلق المحرك تلقائياً لتوفير راحة قصوى أثناء اللعب على الشاشات اللمسية.</li>
              <li><strong>دواسة المكابح اللمسية:</strong> زر مخصص للإبطاء السريع وتعديل المسار في الازدحامات المفاجئة.</li>
              <li><strong>زر النيترو الدائري المتوهج:</strong> لتفعيل التيربو فورياً وتخطي المنافسين في خط مستقيم.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* قسم ذكريات ألعاب السباق الكلاسيكية إلى محاكاة تفادي الحارات */}
      <section className="space-y-4 p-5 sm:p-7 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-950 border border-slate-800/80">
        <div className="flex items-center gap-2.5 text-amber-400">
          <History className="w-6 h-6 shrink-0" />
          <h2 className="text-xl sm:text-2xl font-black font-game text-white tracking-tight">
            من كلاسيكيات الزمن الجميل إلى المحاكاة العصرية (Heritage & Arcade Roots)
          </h2>
        </div>
        <p className="opacity-90 text-sm sm:text-base leading-relaxed text-slate-300">
          تستحضر لعبتنا شغف الطفولة والذكريات الذهبية لجيل كامل نشأ على روائع الألعاب؛ فإذا كنت من جيل ارتبطت طفولته بسباقات <strong>لعبة سابق ولاحق</strong> الشهيرة وما فيها من إثارة تعديل التروس وتيربو المحركات الصاروخية، أو كنت تبحث عن الأدرينالين الخالص وتحديات الصمود وتفجير الحواجز كما في <strong>لعبة حرب الديناميت</strong> وتكتيكات ألعاب الصدام الحربية الشرسة، فإن هذه اللعبة صُممت لتلبي كل هذا الشغف في قالب أركيد متجدد.
        </p>
        <p className="opacity-90 text-sm sm:text-base leading-relaxed text-slate-300">
          تعتمد اللعبة على ميكانيكية تفادي الحارات السريعة المعترف بها عالمياً باسم <strong>lane swerving game</strong>، والتي تتطلب دقة متناهية وسرعة رد فعل بديهية تضاهي سرعة البديهة في <strong>لعبة سباق الحروف</strong> الذهنية. هنا لا يوجد وقت للتردد؛ كل حركة للمقود محسوبة وكل مناورة بين حافلات وشاحنات الطريق هي رهان على البقاء وتصدر القمة.
        </p>
      </section>

      {/* قسم محاكي القيادة للاندرويد والويب دون تنزيل */}
      <section className="space-y-4 p-5 sm:p-7 rounded-2xl bg-gradient-to-br from-sky-950/30 via-slate-900/50 to-slate-950 border border-sky-800/40">
        <div className="flex items-center gap-2.5 text-sky-400">
          <Smartphone className="w-6 h-6 shrink-0" />
          <h2 className="text-xl sm:text-2xl font-black font-game text-white tracking-tight">
            أقوى محاكي قيادة واقعي للاندرويد والكمبيوتر أونلاين
          </h2>
        </div>
        <p className="opacity-90 text-sm sm:text-base leading-relaxed text-slate-300">
          بدلاً من إضاعة الوقت في البحث عن روابط تنزيل غير آمنة أو تثبيت ملفات <strong>لعبة سباق سيارات apk</strong> ضخمة تستهلك ذاكرة هاتفك، نوفر لك هنا أقوى محاكي قيادة واقعي للموبايل والكمبيوتر مباشرة على المتصفح عبر أحدث تقنيات HTML5 وWebGL السريعة.
        </p>
        <p className="opacity-85 text-xs sm:text-sm leading-relaxed text-slate-400">
          تمنحك هذه المنصة تجربة لعب متكاملة بسرعة 60 إطاراً في الثانية دون تقطيع، مع فيزياء تماسك وانجراف دقيقة تحاكي قيادة المركبات الرياضية الخارقة، مع حفظ تلقائي لجميع أرقامك القياسية وترقيات الأسطول.
        </p>
      </section>

      {/* مميزات اللعبة التي تجعلها فريدة */}
      <section className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black font-game text-inherit tracking-tight">
          مميزات اللعبة التي تجعلها تجربة أركيد استثنائية:
        </h2>
        <p className="opacity-90 text-sm sm:text-base leading-relaxed">
          تجمع اللعبة بين الأداء التقني الفائق والرسوميات الجذابة لتقديم تجربة قيادة استثنائية لا مثيل لها على شبكة الويب:
        </p>

        {/* كروت المميزات التوضيحية */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-inherit text-sm font-game">محرك أصوات وتوليف واقعي</h3>
            <p className="text-xs opacity-80 leading-relaxed">
              توليد ديناميكي لنغمات المحرك التوربيني عبر تقنية Web Audio API مع اختلاف واقعي لدوران المحرك وسرعة عزم الدوران واحتكاك العجلات.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-inherit text-sm font-game">نظام ترقيات شامل في المرآب</h3>
            <p className="text-xs opacity-80 leading-relaxed">
              تطوير السرعة القصوى، قوة الانطلاق والتسارع، استجابة المكابح، وحجم خزان النيترو حتى 5 مستويات لكل سيارة باستخدام العملات المجمعة.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-inherit text-sm font-game">مضامير وطقس ديناميكي متقلب</h3>
            <p className="text-xs opacity-80 leading-relaxed">
              سباقات تحت أشعة شمس الظهيرة، مع مسارات الغروب الذهبية، وأضواء النيون الليلية مع شوارع مبللة بالعواصف الماطرة تؤثر على ثبات الإطارات.
            </p>
          </div>
        </div>
      </section>

      {/* استراتيجيات القيادة المتقدمة وأسرار النقاط العالية */}
      <section id="tips" className="scroll-mt-24 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black font-game text-inherit tracking-tight">
          أسرار وتكتيكات القيادة للمحترفين لتحقيق أعلى النقاط
        </h2>
        <p className="opacity-90 text-sm sm:text-base leading-relaxed">
          الوصول إلى صدارة قائمة الأبطال ليس مجرد ضغط مستمر على دواسة الوقود، بل يتطلب استراتيجية محكمة وذكاءً حركياً في التعامل مع مسار السباق:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60 space-y-1.5">
            <h3 className="text-sm font-bold text-amber-400 font-game flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>تقنية التجاوز الوشيك (Near Miss Multiplier)</span>
            </h3>
            <p className="text-xs opacity-80 leading-relaxed">
              عندما تقترب من سيارة مرور مدنية وتمر بجانبها بمسافة سنتمترات قليلة دون أن تصطدم بها وأنت تقود بسرعة تزيد عن 100 كم/س، ستكافئك اللعبة بنقاط إضافية وعملات مضاعفة. اربط عدة تجاوزات متتالية لتكوين سلسلة مضاعفة (Combo Chain) ترفع رصيدك بشكل هائل.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60 space-y-1.5">
            <h3 className="text-sm font-bold text-sky-400 font-game flex items-center gap-2">
              <Flame className="w-4 h-4" />
              <span>إدارة شحنة النيترو والتوقيت المثالي</span>
            </h3>
            <p className="text-xs opacity-80 leading-relaxed">
              لا تستهلك طاقة النيترو وأنت في منتصف منعطف حاد أو في حارة مزدحمة بشاحنات النقل. انتظر حتى ترى مساراً مستقيماً ومفتوحاً أمامك، ثم أطلق قوة التيربو للوصول إلى السرعة القصوى وقطع مسافات طويلة في زمن قياسي.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60 space-y-1.5">
            <h3 className="text-sm font-bold text-emerald-400 font-game flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>قراءة إشارات المرور وتوقع حركة الشاحنات</span>
            </h3>
            <p className="text-xs opacity-80 leading-relaxed">
              تسير الشاحنات ومركبات الأجرة بسرعات متفاوتة في الحارات. درّب عينيك على مراقبة أقصى الأفق في الشاشة لتوقع مسار الحافلات والمركبات البطيئة وتغيير حارتك مبكراً قبل أن تُجبر على الضغط على المكابح وخسارة عزم السرعة.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60 space-y-1.5">
            <h3 className="text-sm font-bold text-purple-400 font-game flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>التوازن بين جمع العملات والبقاء على قيد السباق</span>
            </h3>
            <p className="text-xs opacity-80 leading-relaxed">
              رغم أهمية جمع العملات الذهبية لتطوير سيارتك في المرآب، لا تخاطر بالاصطدام من أجل عملة واحدة في حارة ضيقة. البقاء في السباق لقطع كيلومترات أطول يمنحك نقاطاً أساسية وعملات أكثر على المدى البعيد.
            </p>
          </div>
        </div>
      </section>

      {/* قسم مضامير السباق والطقس */}
      <section className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black font-game text-inherit tracking-tight">
          مضامير السباق والبيئات المناخية الديناميكية
        </h2>
        <p className="opacity-90 text-sm sm:text-base leading-relaxed">
          تأخذك اللعبة في جولة شيقة عبر بيئات متنوعة تتغير ديناميكياً مع تقدمك في مسافة السباق، حيث يفرض كل طقس تحدياً قيادياً خاصاً:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/70 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400">
              <Sun className="w-4 h-4" />
              <h3 className="text-sm font-bold text-white font-game">مضمار وسط المدينة المشمس</h3>
            </div>
            <p className="text-xs opacity-80 leading-relaxed">
              إضاءة نهارية ساطعة ورؤية واضحة لحركة المرور، وهو المضمار المثالي لاختبار السرعة القصوى وضبط توقيت التجاوز.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/70 space-y-1.5">
            <div className="flex items-center gap-2 text-sky-400">
              <CloudRain className="w-4 h-4" />
              <h3 className="text-sm font-bold text-white font-game">طريق العاصفة الماطرة</h3>
            </div>
            <p className="text-xs opacity-80 leading-relaxed">
              تأثيرات الأمطار والضباب الخفيف مع شوارع مبللة، حيث تزداد مسافة التوقف وتتطلب السيارة تركيزاً أكبر في التوجيه.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/70 space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400">
              <Moon className="w-4 h-4" />
              <h3 className="text-sm font-bold text-white font-game">طريق النيون الليلي</h3>
            </div>
            <p className="text-xs opacity-80 leading-relaxed">
              أجواء سباقات الشوارع الليلية بين ناطحات السحاب المضاءة بالألوان النيونية وتوهج المصابيح الخلفية للمركبات.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/70 space-y-1.5">
            <div className="flex items-center gap-2 text-orange-400">
              <Flame className="w-4 h-4" />
              <h3 className="text-sm font-bold text-white font-game">طريق الغروب الساحلي</h3>
            </div>
            <p className="text-xs opacity-80 leading-relaxed">
              سماء برتقالية هادئة وظلال ممتدة على الإسفلت، مع سرعات حركة مرور أعلى تتطلب سرعة بديهة لتفادي الشاحنات السريعة.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-amber-500/40 bg-gradient-to-br from-amber-950/20 to-slate-900/60 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400">
              <Compass className="w-4 h-4" />
              <h3 className="text-sm font-bold text-white font-game">مضمار الصحراء الكبرى</h3>
            </div>
            <p className="text-xs opacity-80 leading-relaxed">
              كثبان رملية ممتدة ورياح صحراوية تتحدى ثبات الإطارات، لتمنحك أروع تجربة قيادة في الصحراء مع إحساس المنافسة الحقيقية بين الكثبان.
            </p>
          </div>
        </div>
      </section>

      {/* قسم نماذج الأسطول التفاعلي */}
      <section id="cars" className="scroll-mt-24 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black font-game text-inherit tracking-tight">
              أسطول المركبات الست الخارقة: دليل الترقيات والمواصفات
            </h2>
            <p className="text-xs sm:text-sm opacity-80 mt-1">
              بدلاً من التشتت في مواقع تحتوي على <strong>500 car games</strong> تقليدية مكررة، اخترنا لك تجربة <strong>6 car games</strong> استثنائية ضمن أسطول يضم 6 طرازات رياضية خارقة وفئات دفع رباعي لتطويرها في المرآب.
            </p>
          </div>

          {onOpenGarage && (
            <button
              onClick={() => onOpenGarage()}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-amber-400/20 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span>فتح المرآب لتطوير الأسطول</span>
            </button>
          )}
        </div>

        {/* صورة أسطول المركبات الخارقة بصيغة WebP مع وسم Alt */}
        <figure className="my-6 rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
          <picture>
            <source srcSet="/assets/social-cover.webp" type="image/webp" />
            <img
              src="/assets/social-cover.jpg"
              alt="أسطول المركبات الرياضية الخارقة في مرآب لعبة سباق سيارات المدينة السريعة للأبطال"
              width={1200}
              height={630}
              loading="lazy"
              className="w-full h-auto object-cover max-h-[360px]"
            />
          </picture>
          <figcaption className="text-center text-xs opacity-70 py-2.5 px-4 bg-slate-900/60 border-t border-slate-800/80">
            أسطول المركبات الرياضية الخارقة المتاحة للاختيار والترقية داخل المرآب
          </figcaption>
        </figure>

        {/* كروت تفاعلية لأنواع السيارات */}
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

                <h3 className="text-lg font-bold font-game text-inherit">{car.arabicName}</h3>
                <p className="text-xs opacity-80 mt-1 line-clamp-2 leading-relaxed">
                  {car.description}
                </p>
              </div>

              {/* مواصفات السيارة */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/60 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sky-400">
                    <Gauge className="w-3.5 h-3.5" />
                    السرعة القصوى:
                  </span>
                  <span className="font-game font-bold tabular-nums text-sky-400">{car.baseSpeed} كم/س</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Zap className="w-3.5 h-3.5" />
                    التسارع:
                  </span>
                  <span className="font-bold tabular-nums">{car.baseAcceleration}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Shield className="w-3.5 h-3.5" />
                    التحكم والانجراف:
                  </span>
                  <span className="font-bold tabular-nums">{car.baseHandling}%</span>
                </div>
              </div>

              {/* زر التعديل والترقية */}
              <button
                onClick={() => onOpenGarage?.(car.id)}
                className="w-full mt-2 py-2 px-3 bg-slate-800 hover:bg-amber-400 hover:text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>اختيار وتطوير هذا الطراز</span>
              </button>
            </div>
          ))}
        </div>

        {/* جدول مواصفات الأسطول الرياضي */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 mt-4">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-slate-900 border-b border-slate-800 font-bold opacity-90">
              <tr>
                <th className="py-3 px-4">اسم المركبة</th>
                <th className="py-3 px-4">الفئة الميكانيكية</th>
                <th className="py-3 px-4">السرعة القصوى</th>
                <th className="py-3 px-4">معدل التسارع</th>
                <th className="py-3 px-4">الثبات والانجراف</th>
                <th className="py-3 px-4">تكلفة الفتح</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {CARS_DATA.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    {c.arabicName}
                  </td>
                  <td className="py-3 px-4 opacity-80">{c.type}</td>
                  <td className="py-3 px-4 font-game font-bold text-sky-400 tabular-nums">{c.baseSpeed} كم/س</td>
                  <td className="py-3 px-4 tabular-nums">{c.baseAcceleration}%</td>
                  <td className="py-3 px-4 tabular-nums">{c.baseHandling}%</td>
                  <td className="py-3 px-4 font-game text-amber-400 font-bold tabular-nums">
                    {c.price === 0 ? 'مفتوحة مجاناً' : `${c.price} عملة`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* الفوائد الذهنية والتربوية لألعاب القيادة الإلكترونية */}
      <section className="space-y-4 p-5 sm:p-7 rounded-2xl bg-slate-900/40 border border-slate-800/80">
        <h2 className="text-2xl sm:text-3xl font-black font-game text-inherit tracking-tight">
          الفوائد الذهنية والتربوية لألعاب القيادة والسرعة
        </h2>
        <p className="opacity-90 text-sm sm:text-base leading-relaxed">
          أثبتت العديد من الدراسات المعرفية أن ألعاب القيادة والتحدي المصممة بذكاء تقدم فوائد تعليمية وتطويرية ملموسة للمهارات الذهنية والحركية:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1.5">
            <h3 className="text-sm font-bold text-amber-400 font-game">تسريع ردود الفعل الحركية</h3>
            <p className="text-xs opacity-80 leading-relaxed">
              تتطلب المناورة وتفادي العقبات بسرعات تتجاوز 150 كم/س اتخاذ قرارات في أجزاء من الثانية، مما يدرب الدماغ على المعالجة البصرية الفورية والاستجابة السريعة للمؤثرات الخارجية.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1.5">
            <h3 className="text-sm font-bold text-sky-400 font-game">تعزيز التنسيق البصري الحركي</h3>
            <p className="text-xs opacity-80 leading-relaxed">
              التوافق الدقيق بين ما تراه العين على مسار الطريق وما تفعله الأصابع على أزرار التوجيه يعزز التناسق العصبي العضلي، وهو مهارة حيوية تنعكس إيجابياً على مختلف الأنشطة اليومية.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1.5">
            <h3 className="text-sm font-bold text-emerald-400 font-game">إدارة الموارد والتفكير الاستراتيجي</h3>
            <p className="text-xs opacity-80 leading-relaxed">
              جمع العملات وتحديد أولويات ترقية المحرك مقابل النيترو أو المكابح يعلّم اللاعبين الصغار مفاهيم التخطيط الاقتصادي البسيط وإدارة الموارد لتحقيق أهداف طويلة الأجل.
            </p>
          </div>
        </div>
      </section>

      {/* الأسئلة الشائعة (FAQ Accordion) */}
      <section id="faq" className="scroll-mt-24 space-y-4 pt-2">
        <h2 className="text-2xl sm:text-3xl font-black font-game text-inherit tracking-tight">
          الأسئلة الشائعة حول اللعبة والمضامير (FAQ)
        </h2>
        <div className="space-y-2.5">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800/80 bg-slate-900/50 overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full py-3.5 px-4 text-start font-semibold flex items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors cursor-pointer"
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

      {/* دليل الكلمات المفتاحية وأقسام ألعاب القيادة لمحركات البحث وزوار الموقع */}
      <section className="space-y-5 pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-2 text-amber-400">
          <Tag className="w-5 h-5 shrink-0" />
          <h2 className="text-xl sm:text-2xl font-black font-game text-white tracking-tight">
            دليل وتصنيفات سباق المدينة السريع (SEO Racing Hub)
          </h2>
        </div>
        <p className="text-xs sm:text-sm opacity-85 leading-relaxed text-slate-300">
          استكشف أشهر الموضوعات ومصطلحات البحث الشائعة التي يبحث عنها عشاق ألعاب القيادة والتفحيط في العالم العربي، والمدرجة بالكامل في محرك لعبتنا لتوفير أفضل تجربة لعب مجانية:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* تصنيف 1: ألقاب وبطولات السباق */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2.5">
            <h3 className="font-bold text-amber-400 font-game flex items-center gap-1.5">
              <Trophy className="w-4 h-4" />
              <span>بطولات وألقاب سباق المدينة</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                'لعبة سباق سيارات المدينة السريعة للأبطال',
                'لعبة عربيات سباق',
                'مسابقة قيادة حقيقية',
                'تحديات التفحيط والانجراف',
                'ألعاب المتصفح السريعة',
                'تفادي الحوادث المرورية',
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

          {/* تصنيف 2: محاكي الاندرويد والأونلاين */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2.5">
            <h3 className="font-bold text-sky-400 font-game flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <span>محاكاة الهواتف والاندرويد أونلاين</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                'محاكي قيادة واقعي للاندرويد',
                'لعبة سباق apk للمتصفح',
                'ألعاب أونلاين بدون تحميل',
                'دقة وسلاسة 60 إطاراً',
                'تحكم لمسي سريع الاستجابة',
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

          {/* تصنيف 3: كلاسيكيات وألعاب حربية */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2.5">
            <h3 className="font-bold text-emerald-400 font-game flex items-center gap-1.5">
              <History className="w-4 h-4" />
              <span>كلاسيكيات الزمن الجميل وألعاب الأكشن</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                'لعبة سابق ولاحق',
                'لعبة حرب الديناميت',
                'صدام المركبات وتفادي العوائق',
                'لعبة سباق الحروف',
                'lane swerving game',
                'مناورات التجاوز الوشيك',
              ].map((term, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-200 border border-slate-700/60 hover:border-emerald-400/50 hover:text-emerald-300 transition-colors"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>

          {/* تصنيف 4: الأسطول والمضامير والصحراء */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2.5">
            <h3 className="font-bold text-orange-400 font-game flex items-center gap-1.5">
              <Car className="w-4 h-4" />
              <span>الأسطول ومضمار الصحراء</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                '6 car games',
                'لعبة ستة طرازات خارقة',
                'مركبات الدفع الرباعي 4x4',
                'مقارنة 500 car games',
                'سباق كثبان الصحراء الكبرى',
              ].map((term, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-200 border border-slate-700/60 hover:border-orange-400/50 hover:text-orange-300 transition-colors"
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
