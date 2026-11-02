export interface ArcadeGameInfo {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  category: string;
  categoryAr: string;
  genre: string;
  badge: string;
  badgeAr: string;
  rating: number;
  votes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  difficultyAr: string;
  poster: string;
  altTextEn: string;
  altTextAr: string;
  shortDescEn: string;
  shortDescAr: string;
  fullDescEn: string;
  fullDescAr: string;
  controlsEn: { key: string; action: string }[];
  controlsAr: { key: string; action: string }[];
  featuresEn: string[];
  featuresAr: string[];
  proTipsEn: string[];
  proTipsAr: string[];
}

export const ARCADE_GAMES: ArcadeGameInfo[] = [
  {
    id: 'cyber-drift',
    slug: 'cyber-drift',
    title: 'Cyber Drift: Tokyo Underground',
    titleAr: 'سايبر دريفت: طوكيو أندر جراوند',
    subtitle: 'High-Angle Precision Night Drift Racing',
    subtitleAr: 'سباق الانجراف والتفحيط الليلي عالي الدقة',
    category: 'Drift & Precision',
    categoryAr: 'دريفت وتفحيط دقيق',
    genre: 'Arcade Racing / Drift Simulator',
    badge: 'Popular 🔥',
    badgeAr: 'الأكثر شعبية 🔥',
    rating: 4.9,
    votes: 8420,
    difficulty: 'Medium',
    difficultyAr: 'متوسط',
    poster: '/assets/games/cyber-drift.jpg',
    altTextEn: 'Cyber Drift: Tokyo Underground - Futuristic Japanese night street car drifting on wet neon asphalt with tire smoke | لعبة سايبر دريفت تفحيط السيارات في شوارع طوكيو الليلية',
    altTextAr: 'لعبة سايبر دريفت: طوكيو أندر جراوند - تفحيط وانجراف السيارات الخارقة في شوارع طوكيو الليلية الماطرة مع أضواء النيون ودخان الإطارات',
    shortDescEn: 'Slide through tight Japanese corners, maintain extreme drift angles, and ignite your twin-turbo nitro through glowing neon street canyons.',
    shortDescAr: 'انزلق عبر المنعطفات اليابانية الضيقة، وحافظ على زوايا الدريفت القصوى، وأطلق نيترو التوربو المزدوج عبر ممرات النيون المتوهجة.',
    fullDescEn: `Cyber Drift: Tokyo Underground is an adrenaline-charged drift racing simulator set within the rain-slicked asphalt labyrinth of a futuristic neo-Tokyo. Players commandeer high-torque, rear-wheel-drive drift machines engineered with custom suspension geometries, carbon-ceramic brakes, and high-response turbochargers. 

The physics engine calculates real-time slip angles, counter-steering torque, and tire friction coefficients to deliver an authentic arcade drift feel. The wider your slide angle and the closer you clip the neon apex barriers without crashing, the higher your combo score multiplier skyrockets. Collect glowing cyber fuel cells along the corners to refill your nitrous reserve and trigger hyper-boost exit acceleration.`,
    fullDescAr: `تعتبر لعبة "سايبر دريفت: طوكيو أندر جراوند" محاكياً حماسياً لانجراف وتفحيط السيارات، وتدور أحداثها في شوارع طوكيو المستقبلية الماطرة والمكسوة بإضاءات النيون المبهرة. يقود اللاعبون سيارات دفع خلفي فائقة القوة ومجهزة بنظام تعليق احترافي، وفرامل كربونية، وشواحن توربينية سريعة الاستجابة.

يقوم محرك الفيزياء بحساب زاوية الانزلاق، وتوجيه العكسي بدقة، ومعامل احتكاك الإطارات ليمنحك إحساساً مذهلاً بالتحكم الواقعي. كلما زادت زاوية التفحيط واقتربت من حواجز النيون دون الاصطدام، تضاعفت نقاطك ومكافآتك التراكمية. اجمع بطاريات الطاقة النيونية لشحن مخزون النيترو وتحقيق تسارع خارق عند الخروج من المنعطفات.`,
    controlsEn: [
      { key: 'W / Up Arrow', action: 'Accelerate engine' },
      { key: 'A / Left Arrow', action: 'Steer left / Counter-steer' },
      { key: 'D / Right Arrow', action: 'Steer right / Counter-steer' },
      { key: 'S / Down Arrow / Space', action: 'Handbrake & initiate drift' },
      { key: 'Shift', action: 'Nitrous hyper-boost' },
    ],
    controlsAr: [
      { key: 'W / السهم لأعلى', action: 'زيادة السرعة ودعسة الوقود' },
      { key: 'A / السهم يسار', action: 'انعطاف لليسار والتوجيه العكسي' },
      { key: 'D / السهم يمين', action: 'انعطاف لليمين والتوجيه العكسي' },
      { key: 'S / السهم لأسفل / مسافة', action: 'فرامل اليد وبدء الدريفت' },
      { key: 'Shift', action: 'إطلاق دفعة النيترو التوربينية' },
    ],
    featuresEn: [
      'Realistic counter-steering and slip-angle physics model',
      'Dynamic tire smoke particles and skid mark trajectory rendering',
      'Chained combo drift multipliers (up to 10x multiplier)',
      'Earnable coins and score bonuses integrated with player garage',
      'Smooth 60 FPS HTML5 Canvas performance on desktop and mobile',
    ],
    featuresAr: [
      'محاكاة فيزيائية واقعية لزوايا الانزلاق والتوجيه العكسي',
      'تأثيرات جزيئية متطورة لدخان الإطارات ورسم مسارات الانجراف على الأسفلت',
      'مضاعف نقاط تراكمي متسلسل يصل إلى 10 أضعاف',
      'جمع عملات نقدية تضاف مباشرة إلى رصيدك وترقيات المرآب',
      'أداء فائق السرعة بمعدل 60 إطاراً في الثانية على الهواتف والمتصفحات',
    ],
    proTipsEn: [
      'Feather the handbrake into the turn entry, then counter-steer gently while holding throttle.',
      'Maintain continuous slides between corners to prevent your combo multiplier from resetting.',
      'Save nitrous bursts for straightaways to slingshot past your personal best record.',
    ],
    proTipsAr: [
      'المس فرامل اليد بخفة عند مدخل المنعطف، ثم ابدأ التوجيه العكسي مع الحفاظ على دعسة الوقود.',
      'حافظ على سلاسة الانزلاق بين المنعطفات المتتالية لمنع إعادة ضبط مضاعف النقاط التراكمي.',
      'احتفظ بدفعة النيترو للمسارات المستقيمة لتحقيق أعلى سرعة قصوى وكسر رقمك القياسي.',
    ],
  },
  {
    id: 'neon-rider',
    slug: 'neon-rider',
    title: 'Neon Rider: Synthwave Circuit',
    titleAr: 'نيون رايدر: حلبة السينثويف',
    subtitle: 'Hypersonic Light-Bike Highway Runner',
    subtitleAr: 'سباق دراجات النيون الضوئية فائق السرعة',
    category: 'High-Speed Reflex',
    categoryAr: 'سرعة رد الفعل والمنعكسات',
    genre: 'Cyberpunk Endless Runner / Bike Racing',
    badge: 'Retro Neon ⚡',
    badgeAr: 'نيون كلاسيكي ⚡',
    rating: 4.8,
    votes: 6210,
    difficulty: 'Hard',
    difficultyAr: 'صعب',
    poster: '/assets/games/neon-rider.jpg',
    altTextEn: 'Neon Rider: Synthwave Circuit - Futuristic glowing neon light motorcycle racing on a synthwave cyber grid digital highway | لعبة نيون رايدر سباق دراجات نارية نيون',
    altTextAr: 'لعبة نيون رايدر: حلبة السينثويف - دراجة نارية ضوئية متوهجة تسير بسرعة خارقة على طريق إلكتروني مستقبلي مستوحى من حقبة الثمانينات',
    shortDescEn: 'Ride a luminous quantum superbike through pulsing laser grids, vault over holographic energy walls, and trigger hyper-warp speed gates.',
    shortDescAr: 'قُد دراجة نيون خارقة عبر شبكات ليزر متوهجة، واقفز فوق جدران الطاقة الهولوغرافية، واعبر بوابات السرعة الكونية.',
    fullDescEn: `Neon Rider: Synthwave Circuit transports players onto an electrified cyber-grid highway stretching toward an endless retro-future horizon. Piloting a light-stream motorcycle that leaves radiant photon trails in its wake, you must dodge erratic kinetic barriers, energy blockades, and magnetic anomalies at dizzying velocities.

The game challenges your peripheral reflexes with dynamic multi-lane routing, instant jump capabilities to leap over ground-level laser hazards, and collecting plasma battery cells to power up temporary invulnerability shields. The mesmerizing aesthetic is backed by pulsating retro-futuristic sound synthesis that heightens immersion as your speed climbs past 300 km/h.`,
    fullDescAr: `تنقلك لعبة "نيون رايدر: حلبة السينثويف" إلى طريق سريع إلكتروني متوهج يمتد نحو أفق مستقبلي نابض بالحياة. وأنت تقود دراجة ضوئية تترك وراءها ذيولاً من الفوتونات المتوهجة، يتعين عليك تفادي الحواجز الحركية، وجدران الطاقة، والاضطرابات المغناطيسية بسرعات خاطفة للأنفاس.

تختبر اللعبة سرعة بديهتك عبر التبديل السريع بين المسارات، والقفز لتفادي حواجز الليزر الأرضية، وجمع خلايا البلازما لتفعيل درع الحماية ضد الاصطدامات. تتناغم الرسوم الجمالية النيونية مع مؤثرات صوتية مستقبلية حماسية تزداد وتيرتها كلما تجاوزت سرعتك حاجز الـ 300 كم/ساعة.`,
    controlsEn: [
      { key: 'A / Left Arrow', action: 'Dodge to left lane' },
      { key: 'D / Right Arrow', action: 'Dodge to right lane' },
      { key: 'W / Up Arrow / Space', action: 'Bunny-hop jump over barriers' },
      { key: 'S / Down Arrow', action: 'Brake / Duck beneath laser bars' },
      { key: 'Shift', action: 'Activate Plasma Shield' },
    ],
    controlsAr: [
      { key: 'A / السهم يسار', action: 'الانتقال السريع للمسار الأيسر' },
      { key: 'D / السهم يمين', action: 'الانتقال السريع للمسار الأيمن' },
      { key: 'W / السهم لأعلى / مسافة', action: 'القفز فوق حواجز الطاقة الأرضية' },
      { key: 'S / السهم لأسفل', action: 'إبطاء السرعة والانخفاض لتفادي الليزر' },
      { key: 'Shift', action: 'تفعيل درع البلازما المؤقت' },
    ],
    featuresEn: [
      'Smooth pseudo-3D undulating perspective synthwave highway',
      'Dynamic jump mechanics with airborne shadow projection',
      'Speed boost pads that momentarily multiply point generation by 3x',
      'Collectible power-ups: Shield, Magnet, and Hyper-Overdrive',
      'Responsive touch swipe and tap controls for mobile gameplay',
    ],
    featuresAr: [
      'طريق سريع ثلاثي الأبعاد متموج برمال شبكة السينثويف المتوهجة',
      'آلية قفز هوائي مرنة مع إسقاط ظلال واقعية على المسار',
      'منصات تسارع فورية تضاعف النقاط ثلاث مرات مؤقتاً',
      'مكافآت متنوعة: درع حماية، مغناطيس عملات، ووضع السرعة القصوى',
      'أزرار لمس مريحة للشاشات الذكية وتحكم كامل بلوحة المفاتيح',
    ],
    proTipsEn: [
      'Look two to three obstacles ahead rather than focusing directly on your bike.',
      'Hit green boost pads consecutively to enter the Hyper-Warp invincible state.',
      'Use the jump button right at the base of energy barriers for maximum airtime.',
    ],
    proTipsAr: [
      'وجّه بصرك نحو الحواجز البعيدة بمسافة كافية لتوقع مسار الحركة مسبقاً.',
      'اعبر منصات التسارع الخضراء المتتالية لتفعيل وضع السرعة الخارقة المنيعة.',
      'اضغط زر القفز في اللحظة المناسبة أمام حواجز الليزر لعبورها بأمان تام.',
    ],
  },
  {
    id: 'hyper-drag',
    slug: 'hyper-drag',
    title: 'Hyper Drag: Nitro Shift',
    titleAr: 'هايبر دراج: نيترو شيفت',
    subtitle: 'Precision Quarter-Mile Drag Showdown',
    subtitleAr: 'سباق التسارع ربع ميل ودقة تغيير السرعات',
    category: 'Drag Racing & Timing',
    categoryAr: 'سباق تسارع ودقة التوقيت',
    genre: 'Quarter-Mile Drag Racing Simulator',
    badge: 'Pro Timing ⏱️',
    badgeAr: 'توقيت احترافي ⏱️',
    rating: 4.9,
    votes: 7540,
    difficulty: 'Medium',
    difficultyAr: 'متوسط',
    poster: '/assets/games/hyper-drag.jpg',
    altTextEn: 'Hyper Drag: Nitro Shift - Quarter mile drag racing showdown with tuned muscle supercars, glowing tachometer, launch lights and nitrous exhaust flames | لعبة هايبر دراج سباق تسارع السيارات',
    altTextAr: 'لعبة هايبر دراج: نيترو شيفت - سباق تسارع ربع ميل بين سيارات العضلات المعدلة مع لهب النيترو ومؤشر عداد دوران المحرك وأضواء الانطلاق',
    shortDescEn: 'Time your launch off the Christmas tree lights, nail redline upshifts, and inject twin-bottle nitrous to dominate 402 meters of pure asphalt.',
    shortDescAr: 'اضبط لحظة الانطلاق مع إشارة شجرة البداية، وحقق التغيير المثالي للتروس عند الخط الأحمر، وأطلق النيترو لحسم مسافة 402 متر.',
    fullDescEn: `Hyper Drag: Nitro Shift distills the pure mechanical tension of professional quarter-mile drag racing into a razor-sharp timing competition. Staging at the start line beside a fiercely tuned competitor, players monitor the glowing staging lights of the Christmas Tree (Stage, Amber countdown, and Green go). 

Reaction times under 0.200 seconds grant a decisive launch advantage off the line. As your engine screamingly builds RPM, watch the analog and digital tachometer: shifting gears in the green sweet spot yields a "PERFECT SHIFT" with instantaneous torque continuation, while early or late shifts drop engine boost. Trigger your nitrous bottle at 3rd or 4th gear to break through aerodynamic drag and cross the finish line in record-breaking elapsed times.`,
    fullDescAr: `تجسد لعبة "هايبر دراج: نيترو شيفت" الإثارة الميكانيكية لسباقات التسارع الكلاسيكية لمسافة ربع ميل (402 متر). يقف اللاعب عند خط البداية بمحاذاة سيارة منافسة قوية، مترقباً أضواء شجرة الانطلاق (الأضواء الصفراء التنازلية ثم الضوء الأخضر الحاسم).

تحقيق زمن استجابة أقل من 0.200 ثانية يمنحك انطلاقة ساحقة من الثبات. ومع ارتفاع دوران المحرك (RPM)، عليك مراقبة العداد بدقة: تغيير التروس في النطاق الأخضر يمنحك "تبديلاً مثالياً" يحافظ على عزم الدوران، بينما يؤدي التبديل المبكر أو المتأخر إلى هبوط القوة. أطلق عبوة النيترو في الترس الثالث أو الرابع لاختراق حاجز الهواء وتحقيق زمن قياسي.`,
    controlsEn: [
      { key: 'W / Up Arrow / Space', action: 'Upshift gear / Accelerate' },
      { key: 'S / Down Arrow', action: 'Downshift (if needed)' },
      { key: 'N / Shift', action: 'Inject Nitrous Oxide (NOS)' },
      { key: 'Enter / Tap', action: 'Stage car at launch line' },
    ],
    controlsAr: [
      { key: 'W / السهم لأعلى / مسافة', action: 'رفع الترس (تغيير السرعة) / التسارع' },
      { key: 'S / السهم لأسفل', action: 'تخفيض الترس' },
      { key: 'N / Shift', action: 'حقن غاز أكسيد النيتروز (NOS)' },
      { key: 'Enter / لمس الشاشة', action: 'الاستعداد والانطلاق عند خط البداية' },
    ],
    featuresEn: [
      'Realistic Christmas tree staging lights with false-start detection',
      'Analog RPM tachometer with visual Green Sweet-Spot shifting zone',
      'Detailed telemetry feedback: Reaction Time, 60ft time, Trap Speed, ET',
      'Nitrous burst with screen shake and blue exhaust jet flames',
      'Earn cash rewards to spend across the entire vehicle upgrade garage',
    ],
    featuresAr: [
      'شجرة انطلاق واقعية بأضواء دقيقة مع كشف الانطلاقة الخاطئة المبكرة',
      'عداد دوران محرك (RPM) بمؤشر واضح للنطاق الأخضر للتبديل المثالي',
      'شاشة قياسات تفصيلية: زمن رد الفعل، زمن أول 60 قدماً، والسرعة النهائية',
      'تأثيرات بصرية لنيران النيترو واهتزاز الشاشة عند الوصول للسرعات القصوى',
      'مكافآت نقدية مجزية تضاف لمحفظتك لتطوير سياراتك في المرآب',
    ],
    proTipsEn: [
      'Do not wait until the green light appears; drop the clutch just as the final amber light flashes.',
      'A sequence of 4 Perfect Shifts is worth more than a poorly timed nitrous blast.',
      'Deploy nitrous just as you shift into 3rd gear to eliminate boost lag and pull ahead.',
    ],
    proTipsAr: [
      'لا تنتظر حتى يضيء الضوء الأخضر بالكامل؛ انطلق فور وميض آخر ضوء أصفر.',
      'سلسلة من التبديلات المثالية تمنحك تفوقاً حاسماً أكبر من تفعيل النيترو العشوائي.',
      'أفضل توقيت لإطلاق النيترو هو بداية الترس الثالث لمضاعفة التسارع المتوسط.',
    ],
  },
  {
    id: 'retro-grand-prix',
    slug: 'retro-grand-prix',
    title: 'Retro Speed 2D: Grand Prix Sprint',
    titleAr: 'ريترو سبيد: جائزة الجائزة الكبرى سبرينت',
    subtitle: 'Classic Formula Circuit Racing & Overtakes',
    subtitleAr: 'سباق الحلبات الكلاسيكي لسيارات الفورمولا والجي تي',
    category: 'Circuit Racing',
    categoryAr: 'سباق حلبات ومسارات',
    genre: 'Top-Down 2D Arcade Grand Prix Racer',
    badge: 'Classic GP 🏁',
    badgeAr: 'كلاسيك فورمولا 🏁',
    rating: 4.8,
    votes: 5930,
    difficulty: 'Easy',
    difficultyAr: 'سهل وممتع',
    poster: '/assets/games/retro-grand-prix.jpg',
    altTextEn: 'Retro Speed 2D: Grand Prix Sprint - Formula 1 single seater race cars overtaking on coastal asphalt circuit turn with tire marks | لعبة ريترو سبيد سباق سيارات الفورمولا الكلاسيكي',
    altTextAr: 'لعبة ريترو سبيد: جائزة الجائزة الكبرى سبرينت - سيارات سباق فورمولا مكشوفة تتنافس وتتجاوز بعضها على حلبة ساحلية احترافية',
    shortDescEn: 'Navigate challenging chicanes, slipstream rivals on long straights, hit every corner apex, and climb from P8 to the podium.',
    shortDescAr: 'ناور عبر المنعطفات الصعبة، واستفد من السحب الهوائي خلف المنافسين، وسيطر على نقاط الالتفاف للوصول إلى منصة التتويج.',
    fullDescEn: `Retro Speed 2D: Grand Prix Sprint revives the beloved golden age of top-down arcade circuit racers with responsive, high-grip driving physics. Facing a grid of 7 aggressive AI competitors across a sun-drenched coastal track, you start from the back of the pack and must surgically overtake your way toward victory.

The driving mechanics reward proper racing lines: braking before turning, clipping the red-and-white curb apexes, and accelerating cleanly out of chicanes. Tucking closely behind rival cars creates a low-drag slipstream effect that charges up an overtaking boost bar. Manage your tire wear and track position to claim the fastest lap trophy and championship points.`,
    fullDescAr: `تستعيد لعبة "ريترو سبيد: جائزة الجائزة الكبرى سبرينت" سحر العصر الذهبي لسباقات الحلبات الكلاسيكية ذات المنظور العلوي الممتع مع فيزياء قيادة رشيقة وسريعة الاستجابة. في مواجهة شبكة مكونة من 7 سيارات منافسة على مسار ساحلي مشمس، تبدأ من مؤخرة الترتيب ويتعين عليك التجاوز بمهارة نحو الصدارة.

تعتمد اللعبة على مهارات السباق الحقيقية: الضغط على المكابح قبل المنعطف، واقتناص نقطة رأس المنعطف (Apex)، والتسارع السلس عند الخروج. يمنحك البقاء مباشرة خلف السيارات المنافسة ميزة السحب الهوائي (Slipstream) لتوليد دفعة سرعة تمكنك من التجاوز بسهولة.`,
    controlsEn: [
      { key: 'W / Up Arrow', action: 'Accelerate forward' },
      { key: 'S / Down Arrow', action: 'Brake / Reverse' },
      { key: 'A / Left Arrow', action: 'Steer car counter-clockwise' },
      { key: 'D / Right Arrow', action: 'Steer car clockwise' },
      { key: 'Space', action: 'Slipstream Turbo Boost' },
    ],
    controlsAr: [
      { key: 'W / السهم لأعلى', action: 'دعسة الوقود والتسارع للأمام' },
      { key: 'S / السهم لأسفل', action: 'الفرامل والرجوع للخلف' },
      { key: 'A / السهم يسار', action: 'توجيه السيارة لليسار' },
      { key: 'D / السهم يمين', action: 'توجيه السيارة لليمين' },
      { key: 'مسافة', action: 'تفعيل دفعة التجاوز السريع (Turbo)' },
    ],
    featuresEn: [
      'Multi-car grid with 8 dynamic AI competitors with varying aggressiveness',
      'Aerodynamic slipstream drafting mechanic for dramatic overtakes',
      'Full lap timing, sector splits, and best lap ghost records',
      'Vibrant coastal track with grandstands, curbs, and animated spectators',
      'Dual touch joystick and on-screen pedals for seamless mobile play',
    ],
    featuresAr: [
      'شبكة سباق متكاملة تضم 8 متسابقين بذكاء اصطناعي تنافسي',
      'نظام السحب الهوائي الواقعي لتسهيل التجاوز في المسارات المستقيمة',
      'تسجيل أزمنة الدورات وأفضل لفة قياسية بدقة أجزاء الثانية',
      'مضمار ساحلي ملون بحواجز ومنعطفات ومدرجات جماهير متحركة',
      'خيارات تحكم مريحة للهواتف الذكية مع دواسات افتراضية للشاشات',
    ],
    proTipsEn: [
      'Follow the racing line: start wide, hit the inside apex, and exit wide for maximum exit speed.',
      'Draft in the wake of leading cars on the back straight to slingshot ahead before turn 1.',
      'Avoid grass and gravel verges as they instantly scrub 50% of your forward velocity.',
    ],
    proTipsAr: [
      'اتبع خط التسابق المثالي: ادخل المنعطف من الخارج، والمس النقطة الداخلية، واخرج واسعاً.',
      'ابقَ في تيار الهواء خلف السيارة التي أمامك في الخط المستقيم لتجاوزها قبل المنعطف.',
      'تجنب النزول على العشب أو الرمال لأنها تخفض سرعتك بنسبة 50% فوراً.',
    ],
  },
  {
    id: 'highway-pursuit',
    slug: 'highway-pursuit',
    title: 'Highway Pursuit: Police Interceptor',
    titleAr: 'هايواي برسوت: مطاردة الشرطة',
    subtitle: 'Tactical High-Speed Getaway Escape',
    subtitleAr: 'الهروب التكتيكي من دوريات وحواجز الشرطة',
    category: 'Action & Pursuit',
    categoryAr: 'أكشن ومطاردة سريعة',
    genre: 'High-Speed Action Highway Escape Runner',
    badge: 'Action Packed 🚨',
    badgeAr: 'أكشن ومطاردة 🚨',
    rating: 4.9,
    votes: 9150,
    difficulty: 'Extreme',
    difficultyAr: 'مثير وتحدي',
    poster: '/assets/games/highway-pursuit.jpg',
    altTextEn: 'Highway Pursuit: Police Interceptor - Night highway police chase with matte black supercar dodging police cruisers and helicopter searchlight | لعبة مطاردة الشرطة والهروب السريع',
    altTextAr: 'لعبة هايواي برسوت: مطاردة الشرطة - مطاردة ليلية سريعة لسيارة خارقة تهرب من دوريات الشرطة وطائرة هليكوبتر استطلاعية على الطريق السريع',
    shortDescEn: 'Evade aggressive police cruisers, dodge spike strips, survive tactical roadblocks, and trigger EMP shockwaves to escape the law.',
    shortDescAr: 'راوغ دوريات الشرطة السريعة، وتفادَ أشواك تعطيل الإطارات والحواجز التكتيكية، وأطلق صدمة الـ EMP الكهرومغناطيسية للهروب الكبير.',
    fullDescEn: `Highway Pursuit: Police Interceptor thrusts players into the driver's seat of a high-powered matte-black getaway prototype running an intense gauntlet against metropolitan law enforcement. As your Wanted Heat level escalates from one to five stars, the tactical police response intensifies from standard patrol sedans to heavy armored interceptors, road barricades, and overhead helicopter searchlights.

Survival requires lightning reflexes and strategic counter-measures. Use sharp traffic weaving to cause pursuing cruisers to crash into civilian traffic. Collect EMP ordnance capsules along the highway to unleash an electromagnetic shockwave that temporarily disables all squad cars within range. How many kilometers can you survive before the net closes in?`,
    fullDescAr: `تضعك لعبة "هايواي برسوت: مطاردة الشرطة" في مقعد القيادة لسيارة هروب سوداء خارقة تواجه مطاردة شرسة من دوريات وأجهزة الشرطة عبر طريق سريع مزدحم. مع ارتفاع مستوى الخطر والمطلوبية (Wanted Level) من نجمة إلى خمس نجوم، تتصاعد المطاردة من سيارات الدورية العادية إلى مركبات التدخل السريع، والحواجز الإسمنتية، ومروحيات الاستطلاع.

يتطلب البقاء سرعة بديهة واستخداماً تكتيكياً لحركة المرور لإجبار سيارات الشرطة على الاصطدام بالشاحنات والحافلات. التقط كبسولات الـ EMP على الطريق لإطلاق موجة كهرومغناطيسية تصعق وتعطل جميع دوريات الشرطة القريبة منك لمدة 3 ثوانٍ. كم كيلومتراً يمكنك الصمود قبل أن تحاصرك القوات؟`,
    controlsEn: [
      { key: 'A / Left Arrow', action: 'Steer / Swerve left' },
      { key: 'D / Right Arrow', action: 'Steer / Swerve right' },
      { key: 'W / Up Arrow', action: 'Accelerate engine' },
      { key: 'S / Down Arrow', action: 'Emergency brake' },
      { key: 'Space / Shift', action: 'Trigger EMP Shockwave / Nitro boost' },
    ],
    controlsAr: [
      { key: 'A / السهم يسار', action: 'توجيه السيارة ومراوغة المسار الأيسر' },
      { key: 'D / السهم يمين', action: 'توجيه السيارة ومراوغة المسار الأيمن' },
      { key: 'W / السهم لأعلى', action: 'زيادة السرعة والهروب' },
      { key: 'S / السهم لأسفل', action: 'فرامل الطوارئ' },
      { key: 'مسافة / Shift', action: 'إطلاق موجة EMP الكهرومغناطيسية / النيترو' },
    ],
    featuresEn: [
      'Escalating 5-Star Wanted Level system with helicopter spotlights',
      'Tactical roadblock obstacles: spike strips, SWAT barricades, and rolling roadblocks',
      'EMP Pulse ability that fries pursuing police electronics in a wide radius',
      'Distance survived counter and high-bounty coin multipliers',
      'Realistic siren acoustics and emergency vehicle light bar flashes',
    ],
    featuresAr: [
      'نظام تصاعدي لمستوى المطلوبية (5 نجوم) مع أضواء مروحيات الشرطة',
      'حواجز تكتيكية متنوعة: أشرطة مسامير، حواجز إسمنتية، ومناورات حصار دوريات',
      'قدرة نبضة الـ EMP التي تشل إلكترونيات سيارات الشرطة المحيطة بك',
      'عداد مسافة الصمود بالكيلومترات ومكافآت مالية ضخمة تضاف لمرآبك',
      'مؤثرات صوتية واقعية لصفارات الإنذار وأضواء الطوارئ الوامضة',
    ],
    proTipsEn: [
      'Bait pursuing squad cars to drive directly into civilian semi-trucks for instant takedowns.',
      'Save your EMP pulse specifically for when you spot an impassable police roadblock ahead.',
      'Watch for blinking red warning markers on the road signaling upcoming spike strips.',
    ],
    proTipsAr: [
      'استدرج سيارات الدورية لتصطدم بالشاحنات المدنية الكبيرة للتخلص منها فوراً.',
      'احتفظ بنبضة الـ EMP للحظات الحرجة عند ظهور حواجز إسمنتية مغلقة أمامك.',
      'انتبه للإشارات التحذيرية الحمراء الوامضة على الطريق التي تنبهك لوجود أشرطة مسامير.',
    ],
  },
];
