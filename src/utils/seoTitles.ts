/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SeoMeta {
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  canonicalPath: string;
  keywordsEn?: string;
  keywordsAr?: string;
}

export const SEO_DATA_BY_ID: Record<string, SeoMeta> = {
  'apex-pulse': {
    titleEn: 'Apex Pulse: Neon Horizon – Free 3D Car Racing Games & Highway Traffic Racer',
    titleAr: 'أبيكس بالس: الأفق النيوني – لعبة سباق سيارات ثلاثية الأبعاد سريعة ومجانية بدون تحميل',
    descEn: 'Play Apex Pulse: Neon Horizon free online! Dodge highway traffic, unleash nitrous boosts, customize 6 supercars, and dominate rain-slick neon streets in 3D 60 FPS.',
    descAr: 'العب لعبة أبيكس بالس ثلاثية الأبعاد مجاناً بدون تحميل! راوغ حركة المرور الكثيفة، وأطلق النيترو، وسيطر على الشوارع المبللة بالمطر في لعبة السباق السريعة على المتصفح.',
    canonicalPath: '/',
    keywordsEn: 'Apex Pulse, 3D car racing game, highway traffic racer, free browser racing game, nitro boost, online supercar games',
    keywordsAr: 'أبيكس بالس, لعبة سباق سيارات ثلاثية الأبعاد, سباق سيارات بدون تحميل, العاب سيارات سريعة, تفادي المرور, العاب متصفح مجانية',
  },
  'cyber-drift': {
    titleEn: 'Cyber Drift: Tokyo Underground – Japanese Night Street Drift Racing Game | Apex Pulse',
    titleAr: 'سايبر دريفت: طوكيو أندر جراوند – لعبة تفحيط وانجراف السيارات في شوارع طوكيو الليلية | أبيكس بالس',
    descEn: 'Master high-angle slip angles, tire smoke physics, and x10 combo multipliers in Cyber Drift: Tokyo Underground. Free online 3D drift racing simulator.',
    descAr: 'احترف زوايا الانجراف ودخان الإطارات ومضاعفات النقاط في سايبر دريفت طوكيو أندر جراوند. أفضل لعبة تفحيط ودريفت سيارات مجانية بدون تحميل على المتصفح.',
    canonicalPath: '/#cyber-drift',
    keywordsEn: 'Cyber Drift Tokyo, Japanese street drift game, drift racing simulator, tire smoke physics, unblocked drift game',
    keywordsAr: 'سايبر دريفت طوكيو, لعبة تفحيط سيارات, العاب دريفت, سباق شوارع طوكيو, تفحيط سيارات اون لاين',
  },
  'neon-rider': {
    titleEn: 'Neon Rider: Synthwave Circuit – Hypersonic Light-Bike Highway Speed Game | Apex Pulse',
    titleAr: 'نيون رايدر: حلبة السينثويف – لعبة سباق دراجات النيون الضوئية الخارقة في الطريق السريع | أبيكس بالس',
    descEn: 'Ride a glowing photon light-bike across synthwave laser highways in Neon Rider. Vault energy barriers, hit speed boost pads, and trigger plasma shields free online.',
    descAr: 'قُد دراجة نيون ضوئية خارقة عبر شبكات ليزر وسينثويف متوهجة في لعبة نيون رايدر. اقفز فوق الحواجز وفعل درع البلازما مجاناً على المتصفح.',
    canonicalPath: '/#neon-rider',
    keywordsEn: 'Neon Rider, synthwave bike racing, light-bike runner, cyberpunk motorcycle game, neon speed racer',
    keywordsAr: 'نيون رايدر, سباق دراجات نارية نيون, العاب دراجات سريعة, سينثويف ريسينغ, العاب دراجات بدون تحميل',
  },
  'hyper-drag': {
    titleEn: 'Hyper Drag: Nitro Shift – 1/4 Mile Drag Racing & Precision Gear Shifter Game | Apex Pulse',
    titleAr: 'هايبر دراج: نيترو شيفت – لعبة سباق تسارع السيارات ربع ميل (402م) ودقة تبديل السرعات | أبيكس بالس',
    descEn: 'Time your launch off Christmas tree staging lights, hit green sweet-spot gear shifts, and ignite nitrous in Hyper Drag: Nitro Shift. Play free drag racing online.',
    descAr: 'انطلق مع إشارة البداية الخضراء وبدل السرعات في اللحظة المثالية وأطلق نيران النيترو في لعبة هايبر دراج لسباق تسارع ربع الميل (402م) مجاناً.',
    canonicalPath: '/#hyper-drag',
    keywordsEn: 'Hyper Drag Nitro Shift, quarter mile drag racing, manual gear shift game, Christmas tree launch lights, free drag racer',
    keywordsAr: 'هايبر دراج, سباق تسارع سيارات, سباق ربع ميل, تبديل تروس القير, العاب دراج ريسينغ اون لاين',
  },
  'retro-grand-prix': {
    titleEn: 'Retro Speed 2D: Grand Prix Sprint – Formula Circuit Racing & Drafting Game | Apex Pulse',
    titleAr: 'ريترو سبيد: سباق الجائزة الكبرى – لعبة سباق سيارات الفورمولا الكلاسيكية والسحب الهوائي | أبيكس بالس',
    descEn: 'Compete against 8 dynamic AI competitors on coastal circuits with curb clipping and slipstream drafting in Retro Speed 2D Grand Prix. Free browser F1 racer.',
    descAr: 'نافس 8 سيارات ذكاء اصطناعي على الحلبات الساحلية مع تقنية السحب الهوائي في لعبة ريترو سبيد للجائزة الكبرى لسباق سيارات الفورمولا 1 مجاناً.',
    canonicalPath: '/#retro-grand-prix',
    keywordsEn: 'Retro Speed Grand Prix, 2D Formula racing game, slipstream drafting, top-down circuit racer, free F1 arcade game',
    keywordsAr: 'ريترو سبيد فورمولا, سباق الجائزة الكبرى, العاب سباق حلبات, سيارات فورمولا 1 مجانا, سباق سيارات كلاسيكي',
  },
  'highway-pursuit': {
    titleEn: 'Highway Pursuit: Police Interceptor – High-Heat Police Escape & EMP Chase Game | Apex Pulse',
    titleAr: 'هايواي برسوت: مطاردة الشرطة – لعبة الهروب السريع وتفادي دوريات وحواجز الشرطة | أبيكس بالس',
    descEn: 'Dodge police roadblocks, evade tire spikes, and trigger tactical EMP shockwaves in Highway Pursuit: Police Interceptor. Free high-speed action police escape runner.',
    descAr: 'اهرب من كمائن الشرطة وتفادَ فخاخ المسامير وأطلق صدمة النبضة الكهرومغناطيسية EMP في لعبة هايواي برسوت لمطاردات الشرطة السريعة مجاناً على المتصفح.',
    canonicalPath: '/#highway-pursuit',
    keywordsEn: 'Highway Pursuit, police chase game, evade police roadblocks, EMP shockwave car game, high speed getaway runner',
    keywordsAr: 'هايواي برسوت, لعبة مطاردة الشرطة, الهروب من الشرطة, العاب سيارات مطاردات, صدمة EMP, العاب سرعة واكشن',
  },
  'desert-rally': {
    titleEn: 'Desert Rally: Dakar Storm – 4x4 Dune Raid & Off-Road Extreme Racing Game | Apex Pulse',
    titleAr: 'ديزرت رالي: عاصفة داكار – لعبة رالي الصحراء والقفز فوق الكثبان الرملية بسيارات الدفع الرباعي | أبيكس بالس',
    descEn: 'Tear through shifting Sahara dunes, launch over sand crests for massive airtime multipliers, and beat Dakar checkpoints in Desert Rally. Free off-road buggy racer.',
    descAr: 'اقتحم الكثبان الرملية الصحراوية وحقق قفزات هوائية عملاقة وتسابق مع زمن نقاط التفتيش في لعبة ديزرت رالي عاصفة داكار لسيارات الباجي والدفع الرباعي.',
    canonicalPath: '/#desert-rally',
    keywordsEn: 'Desert Rally Dakar Storm, off-road buggy game, sand dune jumping, Dakar rally simulator, free 4x4 racing',
    keywordsAr: 'ديزرت رالي, رالي داكار الصحراوي, العاب سيارات دفع رباعي, قفز الكثبان الرملية, سباق رالي الصحراء',
  },
  'neon-kart': {
    titleEn: 'Neon Kart: Turbo Battle – Arcade Skyway Battle Kart Racing & Missile Combat | Apex Pulse',
    titleAr: 'نيون كارت: معركة التوربو – لعبة سباق سيارات كارت نيون ومعارك أسلحة وصواريخ | أبيكس بالس',
    descEn: 'Battle 4 rival karts on floating neon skyways! Fire homing missiles, drop oil slicks, and charge drift mini-turbos in Neon Kart Turbo Battle. Free browser kart racer.',
    descAr: 'نافس 4 سيارات كارت على مسارات النيون المعلقة! أطلق الصواريخ الموجهة وبقع الزيت واشحن دفعات التوربو عند الانعطاف في لعبة نيون كارت مجاناً.',
    canonicalPath: '/#neon-kart',
    keywordsEn: 'Neon Kart Turbo Battle, arcade kart battle, mystery item boxes, homing missiles kart, free multiplayer style kart game',
    keywordsAr: 'نيون كارت, سباق سيارات كارت, العاب كارتينغ مع اسلحة, صواريخ ودروع سباق, العاب سباق ممتعة للاطفال',
  },
  'midnight-touge': {
    titleEn: 'Midnight Touge: Mountain King – Japanese Downhill Hairpin Drift Duel Game | Apex Pulse',
    titleAr: 'ميدنايت توجي: ملك الجبل – لعبة مبارزة وتفحيط التوجي على المنحدرات الجبلية اليابانية | أبيكس بالس',
    descEn: 'Duel legendary rivals down treacherous Japanese mountain hairpins using the gutter hook drift technique in Midnight Touge. Free downhill drift racing simulator.',
    descAr: 'بارز متسابقي التوجي على منعطفات الجبال اليابانية الحادة واستخدم تقنية مجرى تصريف المياه لتجاوز الخصوم في لعبة ميدنايت توجي ملك الجبل.',
    canonicalPath: '/#midnight-touge',
    keywordsEn: 'Midnight Touge Mountain King, Japanese mountain pass drift, gutter hook drift, touge battle, downhill drift racer',
    keywordsAr: 'ميدنايت توجي, سباق توجي الياباني, دريفت الجبال, لعبة ملك الجبل, تفحيط المنحدرات الجبلية',
  },
  'speedboat-rush': {
    titleEn: 'Speedboat Rush: Hydro Thunder – Offshore Powerboat Racing & Wave Stunts | Apex Pulse',
    titleAr: 'سبيد بوت رش: هايدرو ثندر – لعبة سباق الزوارق السريعة والقفز البهلواني فوق أمواج المحيط | أبيكس بالس',
    descEn: 'Ride ocean swells, perform 360 barrel rolls, and dodge maritime buoys at 180 km/h in Speedboat Rush: Hydro Thunder. Free offshore boat racing game.',
    descAr: 'اقفز فوق أمواج المحيط الهائجة ونفذ الشقلبات البهلوانية وتفادَ العوامات والصخور بسرعة 180 كم/ساعة في لعبة سباق الزوارق المائية السريعة مجاناً.',
    canonicalPath: '/#speedboat-rush',
    keywordsEn: 'Speedboat Rush Hydro Thunder, offshore powerboat racing, 360 barrel roll boat stunts, water wave jumping, free boat racer',
    keywordsAr: 'سبيد بوت رش, لعبة سباق زوارق سريعة, قوارب المحيط, حركات بهلوانية مائية, العاب سباق بحرية',
  },
  'monster-truck': {
    titleEn: 'Monster Truck: Gravity Mayhem – Scrap Car Demolition Derby & Backflip Stunts | Apex Pulse',
    titleAr: 'مونستر تراك: فوضى الجاذبية – لعبة شاحنات الوحش العملاقة وتحطيم السيارات والشقلبة الهوائية | أبيكس بالس',
    descEn: 'Crush scrap sedans under massive tires, perform arena backflips, and unleash nitrous stomps in Monster Truck Gravity Mayhem. Free demolition derby game.',
    descAr: 'سحق السيارات الخردة تحت الإطارات العملاقة ونفذ شقلبات هوائية مذهلة في ساحة العرض في لعبة شاحنات الوحش مونستر تراك فوضى الجاذبية مجاناً.',
    canonicalPath: '/#monster-truck',
    keywordsEn: 'Monster Truck Gravity Mayhem, car crushing game, demolition derby monster truck, arena backflips, big wheel stunt truck',
    keywordsAr: 'مونستر تراك, شاحنات الوحش العملاقة, تحطيم السيارات الخردة, استعراض الشاحنات, العاب شاحنات للاطفال',
  },
  'canyon-infiltrator': {
    titleEn: 'Supersonic Jet: Canyon Infiltrator – Mach 2.5 Low-Altitude Jet Combat Racer | Apex Pulse',
    titleAr: 'المقاتلة النفاثة: متسلل الوادي – لعبة سباق المقاتلات النفاثة الخارقة للصوت بسرعة ماخ 2.5 | أبيكس بالس',
    descEn: 'Scream through narrow canyon ravines at Mach 2.5, shoot laser cannons, and trigger sonic booms in Canyon Infiltrator. Free jet fighter flight racing game.',
    descAr: 'حلق بمقاتلتك النفاثة عبر مضايق الوديان الجبلية الضيقة بسرعة ماخ 2.5 وأطلق مدافع الليزر وجدار الصوت في لعبة سباق المقاتلات النفاثة مجاناً.',
    canonicalPath: '/#canyon-infiltrator',
    keywordsEn: 'Canyon Infiltrator, supersonic jet fighter racer, Mach 2.5 flight game, low altitude canyon runner, laser jet combat',
    keywordsAr: 'المقاتلة النفاثة, سباق طائرات حربية, اختراق جدار الصوت, العاب طيران نفاث, سباق الوادي الجبلي',
  },
  'skyline-blitz': {
    titleEn: 'Cyber Hoverboard: Skyline Blitz – Anti-Gravity Rooftop Surfing & Rail Grinder | Apex Pulse',
    titleAr: 'سايبر هوفربورد: وميض الأفق – لعبة التزلج الهوائي والقفز فوق ناطحات السحاب والتزلج على القضبان | أبيكس بالس',
    descEn: 'Surf anti-gravity hoverboards across glowing skyscraper rooftops, grind neon power rails, and perform 540 spins in Skyline Blitz. Free cyber stunt game.',
    descAr: 'تزلج على ألواح الهوفربورد المضادة للجاذبية فوق أسطح ناطحات السحاب النيونية وتزلج على القضبان الضوئية في لعبة سايبر هوفربورد وميض الأفق مجاناً.',
    canonicalPath: '/#skyline-blitz',
    keywordsEn: 'Skyline Blitz Cyber Hoverboard, anti-gravity hoverboard surfing, rooftop runner, rail grind stunts, cyber parkour game',
    keywordsAr: 'سايبر هوفربورد, تزلج هوائي على الاسطح, باركور ناطحات السحاب, العاب هوفربورد مستقبلية, تزلج على القضبان',
  },
  // Dedicated Pages
  'cars': {
    titleEn: 'Supercars Fleet & 5-Stage Performance Garage Tuning | Apex Pulse: Neon Horizon',
    titleAr: 'مرآب وترقيات أسطول السيارات الخارقة (6 سيارات حصرية) | أبيكس بالس: الأفق النيوني',
    descEn: 'Explore and tune all 6 racing supercars in Apex Pulse: Neon Horizon! Upgrade top speed, acceleration curves, brake response, and nitrous capacity in the garage.',
    descAr: 'استعرض ورقي أسطول السيارات الست الخارقة في مرآب Apex Pulse! ترقيات شاملة للسرعة القصوى، والتسارع، وقوة الفرامل، وسعة خزان النيترو.',
    canonicalPath: '/cars',
  },
  'instructions': {
    titleEn: 'How to Play & Multi-Device Controls Guide (PC & Mobile Touch) | Apex Pulse',
    titleAr: 'دليل طريقة اللعب وأزرار التحكم باللمس والكمبيوتر | أبيكس بالس: الأفق النيوني',
    descEn: 'Master keyboard controls and mobile touch steering in Apex Pulse. Learn near-miss combo multipliers, nitrous hyper-boost, and emergency brake drifting.',
    descAr: 'تعلم أزرار التحكم باللوحة المفاتيح واللمس للهواتف الذكية في أبيكس بالس. أتقن حركات التجاوز الوشيك، ودفع النيترو الخارق، والتفحيط في المنعطفات.',
    canonicalPath: '/instructions',
  },
  'featured-games': {
    titleEn: 'Top 12 Free 3D & 2D Arcade Racing Games Collection | games-children.com',
    titleAr: 'مكتبة أفضل 12 لعبة سباق سيارات وتفحيط مجانية بدون تحميل | games-children.com',
    descEn: 'Play 12 handcrafted 3D and 2D arcade racing games online for free: Tokyo street drift, synthwave light bikes, drag racing, Dakar rally, and powerboats.',
    descAr: 'العب أفضل 12 لعبة أركيد وسباق سيارات ممتازة مجاناً على المتصفح: دريفت طوكيو، دراجات النيون، سباقات التسارع، رالي داكار، وزوارق المحيط السريعة.',
    canonicalPath: '/#featured-games',
  },
  'leaderboard': {
    titleEn: 'Global Champions Leaderboard & High Speed Records | Apex Pulse: Neon Horizon',
    titleAr: 'لوحة الصدارة وأرقام السرعة القياسية العالمية | أبيكس بالس: الأفق النيوني',
    descEn: 'Check the top highway racers on the Apex Pulse global champions leaderboard. Track top scores, longest distances survived, and near-miss combos.',
    descAr: 'استعرض قائمة أفضل متسابقي الطرق السريعة على لوحة شرف أبيكس بالس العالمية. تابع الأرقام القياسية وأطول مسافات الصمود ومضاعفات النقاط.',
    canonicalPath: '/#leaderboard',
  },
  'privacy': {
    titleEn: 'Privacy Policy & COPPA Children Safety Standards | games-children.com',
    titleAr: 'سياسة الخصوصية ومعايير حماية أمان الأطفال (COPPA) | games-children.com',
    descEn: 'Read our Privacy Policy, COPPA compliance, cookie disclosures, and data protection guidelines for Apex Pulse: Neon Horizon on games-children.com.',
    descAr: 'اطلع على سياسة الخصوصية ومعايير حماية بيانات الأطفال (COPPA) والامتثال لسياسات جوجل لبرنامج العائلة والأمان التام لجميع اللاعبين.',
    canonicalPath: '/privacy',
  },
  'terms': {
    titleEn: 'Terms of Service & Fair Play Guidelines | games-children.com',
    titleAr: 'شروط الاستخدام واتفاقية اللعب النظيف | games-children.com',
    descEn: 'Review the Terms of Service, licensing, intellectual property, and community guidelines for Apex Pulse: Neon Horizon on games-children.com.',
    descAr: 'راجع شروط الاستخدام وقواعد اللعب النظيف وحقوق الملكية الفكرية للعبة أبيكس بالس على موقع games-children.com.',
    canonicalPath: '/terms',
  },
  'disclaimer': {
    titleEn: 'Legal Disclaimer & Traffic Safety Notice | games-children.com',
    titleAr: 'إخلاء المسؤولية القانونية وإرشادات السلامة المرورية | games-children.com',
    descEn: 'Important legal disclaimer and real-world safe driving advisory for Apex Pulse: Neon Horizon browser racing simulator.',
    descAr: 'إخلاء مسؤولية وتنويه قانوني حول محاكاة القيادة الافتراضية والالتزام بقواعد السلامة المرورية على أرض الواقع.',
    canonicalPath: '/disclaimer',
  },
  'contact': {
    titleEn: 'Contact Support & Developer Feedback Hub | games-children.com',
    titleAr: 'اتصل بنا ودعم اللاعبين والاقتراحات | games-children.com',
    descEn: 'Contact the Apex Pulse development team for technical assistance, bug reports, feature suggestions, or business inquiries.',
    descAr: 'تواصل مع فريق تطوير لعبة أبيكس بالس للحصول على الدعم الفني، وتقديم الاقتراحات، أو الاستفسارات العامة.',
    canonicalPath: '/contact',
  },
  'about': {
    titleEn: 'About Apex Pulse: Neon Horizon – Next-Gen Browser Racing Engine',
    titleAr: 'نبذة عن محرك أبيكس بالس – الجيل القادم من ألعاب السباق على المتصفح',
    descEn: 'Learn about the history, physics engine, procedural audio architecture, and mission behind Apex Pulse: Neon Horizon on games-children.com.',
    descAr: 'تعرف على قصة وتاريخ محرك أبيكس بالس: الأفق النيوني، وتفاصيل الهندسة الفيزيائية والصوتية المتطورة بدون تحميل.',
    canonicalPath: '/about',
  },
};

const SITE_ORIGIN = 'https://www.games-children.com';

/**
 * Dynamically updates document title, meta descriptions, canonical URLs,
 * and OpenGraph/Twitter social cards based on active target and language.
 */
export function applyPageSeo(targetId: string, currentLang: string = 'en') {
  const meta = SEO_DATA_BY_ID[targetId] || SEO_DATA_BY_ID['apex-pulse'];
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(currentLang);

  const title = isRTL ? meta.titleAr : meta.titleEn;
  const description = isRTL ? meta.descAr : meta.descEn;

  // 1. Update Document Title
  document.title = title;

  // 2. Update Meta Description
  let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = description;

  // 3. Update Canonical Link
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.href = `${SITE_ORIGIN}${meta.canonicalPath === '/' ? '' : meta.canonicalPath}`;

  // 4. Update OpenGraph Tags
  const updateMetaProperty = (prop: string, content: string) => {
    let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', prop);
      document.head.appendChild(el);
    }
    el.content = content;
  };

  updateMetaProperty('og:title', title);
  updateMetaProperty('og:description', description);
  updateMetaProperty('og:url', `${SITE_ORIGIN}${meta.canonicalPath === '/' ? '' : meta.canonicalPath}`);

  // 5. Update Twitter Tags
  const updateMetaName = (name: string, content: string) => {
    let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.name = name;
      document.head.appendChild(el);
    }
    el.content = content;
  };

  updateMetaName('twitter:title', title);
  updateMetaName('twitter:description', description);
}
