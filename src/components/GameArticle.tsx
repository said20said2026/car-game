import React, { useState } from 'react';
import { ChevronDown, Trophy, ShieldCheck, Cpu, Smartphone, Monitor } from 'lucide-react';
import { CARS_DATA } from '../utils/storage';

export const GameArticle: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'هل لعبة سباق سيارات المدينة السريعة مجانية بالكامل؟',
      a: 'نعم، اللعبة مجانية بنسبة 100% ولا تتطلب أي تحميل أو تثبيت برامج، ويمكنك لعبها مباشرة عبر أي متصفح إنترنت على الهواتف الذكية أو أجهزة الكمبيوتر اللوحي والمكتبي.',
    },
    {
      q: 'كيف يمكنني جمع العملات وتطوير سيارتي بسرعة؟',
      a: 'يمكنك جمع العملات الذهبية المنتشرة في مسارات السباق، وتحقيق نقاط مضاعفة عبر ميزة التجاوز الوشيك (Near Miss) بالاقتراب من سيارات المرور دون الاصطدام بها بسرعة عالية، مما يمنحك رصيداً كافياً لترقية المحرك والنيترو في المرآب.',
    },
    {
      q: 'هل تدعم اللعبة أزرار التحكم باللمس على الجوال؟',
      a: 'نعم، تدعم اللعبة نظام تحكم لمسي متطور ومريح للإبهام على كافة الهواتف (Android و iOS) مع أزرار توجيه جانبية ودواسة فرامل ونيترو.',
    },
    {
      q: 'ما هي مواصفات الجهاز المطلوبة لتشغيل اللعبة؟',
      a: 'تعمل اللعبة بسلاسة تامة بمعدل 60 إطاراً في الثانية (60 FPS) على أي جهاز يدعم تقنية HTML5 و WebGL أو Canvas الحديثة، ودون استهلاك مفرط للبطارية.',
    },
  ];

  return (
    <article className="game-description mt-10 space-y-10 text-slate-300 leading-relaxed max-w-4xl mx-auto">
      {/* القسم الرئيسي المطلوب من المستخدم */}
      <section className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black font-game text-white tracking-tight">
          عن لعبة سباق السيارات للمحترفين الصغار
        </h2>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          مرحباً بك في أقوى <strong>لعبة سيارات للأطفال البالغين</strong> على الإنترنت! إذا كنت من محبي السرعة والإثارة، فإن هذه اللعبة مصممة خصيصاً لك لتحدي مهاراتك القيادية. تتيح لك اللعبة قيادة سيارات رياضية خارقة وسط مضامير سباق مليئة بالتحديات والمنعطفات الخطيرة في قلب المدينة.
        </p>
      </section>

      {/* تفاصيل التحكم وطريقة اللعب */}
      <section className="space-y-4 bg-slate-900/70 border border-slate-800 p-5 sm:p-7 rounded-2xl">
        <h3 className="text-xl sm:text-2xl font-bold font-game text-white">
          كيفية اللعب والتحكم (Gameplay Instructions)
        </h3>
        <p className="text-slate-300 text-sm sm:text-base">
          تم تصميم نظام التحكم ليكون سهلاً وسلساً على جميع الأجهزة:
        </p>
        <ul className="space-y-3 text-sm sm:text-base pr-4">
          <li className="flex items-start gap-2">
            <Monitor className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">على الكمبيوتر (PC):</strong> استخدم أسهم لوحة المفاتيح (Up, Down, Left, Right) أو أزرار (W, A, S, D) للتوجيه وزيادة السرعة، وزر الفرامل (Spacebar) للانجراف المثير (Drifting).
            </div>
          </li>
          <li className="flex items-start gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">على الهاتف والموبايل (Mobile):</strong> ستظهر لك أزرار تحكم لمسية شفافة على الشاشة للتوجيه يميناً ويساراً مع دواسة وقود برمجية تلقائية.
            </div>
          </li>
        </ul>
      </section>

      {/* مميزات اللعبة */}
      <section className="space-y-4">
        <h3 className="text-xl sm:text-2xl font-bold font-game text-white">
          مميزات اللعبة التي تجعلها فريدة:
        </h3>
        <p className="text-slate-300 text-sm sm:text-base">
          تتميز هذه اللعبة برسومياتها المتطورة ومؤثراتها الصوتية الحقيقية التي تحاكي أصوات محركات السيارات الحقيقية. تحتوي اللعبة على مستويات متعددة الصعوبة، حيث يمكنك جمع العملات الذهبية أثناء السباق لفتح سيارات جديدة وتعديل محركاتها لزيادة السرعة القصوى وقوة الكبح.
        </p>

        {/* كروت المميزات التوضيحية */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
              <Cpu className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-sm">محرك أصوات تركيبي واقعي</h4>
            <p className="text-xs text-slate-400">
              أصوات محركات وتيربو وانجراف عجلات يتم توليدها صوتياً عبر Web Audio API مع اختلاف سرعة دوران المحرك (RPM).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Trophy className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-sm">نظام ترقيات متكامل</h4>
            <p className="text-xs text-slate-400">
              قم بترقية السرعة والتسارع والمكابح وخزان النيترو حتى 5 مستويات لكل سيارة باستخدام العملات التي تجمعها.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-sm">بيئات سباق وطقس ديناميكي</h4>
            <p className="text-xs text-slate-400">
              تسابق تحت أشعة شمس الظهيرة، أو أثناء الغروب الرومانسي، أو في شوارع النيون الليلية وأجواء المطر العاصف.
            </p>
          </div>
        </div>
      </section>

      {/* نصائح للفوز بالمركز الأول */}
      <section className="space-y-4">
        <h3 className="text-xl sm:text-2xl font-bold font-game text-white">
          نصائح للفوز بالمركز الأول:
        </h3>
        <p className="text-slate-300 text-sm sm:text-base">
          لتخطي المنافسين، تجنب الاصطدام بالجدران الجانبية ومخاريط المرور لأنها تقلل من سرعتك المفاجئة. استخدم نتروجين السرعة (Nitro) في المستقيمات الطويلة لضمان تفوقك والوصول إلى خط النهاية في أقل وقت ممكن وتحطيم الأرقام القياسية.
        </p>
      </section>

      {/* جدول مواصفات السيارات الخارقة (مفيد للسيو وجذب القراء) */}
      <section className="space-y-4">
        <h3 className="text-xl sm:text-2xl font-bold font-game text-white">
          جدول مواصفات السيارات الخارقة في اللعبة
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
          <table className="w-full text-right text-xs sm:text-sm text-slate-300">
            <thead className="bg-slate-900 text-slate-100 border-b border-slate-800 font-bold">
              <tr>
                <th className="py-3 px-4">اسم المركبة</th>
                <th className="py-3 px-4">الفئة</th>
                <th className="py-3 px-4">السرعة القصوى</th>
                <th className="py-3 px-4">التسارع</th>
                <th className="py-3 px-4">التحكم</th>
                <th className="py-3 px-4">العملات المطلوبة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {CARS_DATA.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    {c.arabicName}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{c.type}</td>
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

      {/* الأسئلة الشائعة (FAQ Accordion) */}
      <section className="space-y-4 pt-2">
        <h3 className="text-xl sm:text-2xl font-bold font-game text-white">
          الأسئلة الشائعة حول لعبة سباق سيارات المدينة (FAQ)
        </h3>
        <div className="space-y-2.5">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full py-3.5 px-4 text-start font-semibold text-white flex items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <span className="text-sm sm:text-base">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    openFaq === idx ? 'rotate-180 text-amber-400' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-300 border-t border-slate-800/60 bg-slate-950/30">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </article>
  );
};
