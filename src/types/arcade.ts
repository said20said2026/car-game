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
  {
    id: 'desert-rally',
    slug: 'desert-rally',
    title: 'Desert Rally: Dakar Storm',
    titleAr: 'ديزرت رالي: عاصفة داكار',
    subtitle: 'Off-Road Dune Raid & Giant Jump Airtime Showdown',
    subtitleAr: 'رالي داكار الصحراوي والقفز الهوائي الخارق فوق الكثبان الرملية',
    category: 'Off-Road & Rally',
    categoryAr: 'رالي وطرق وعرة 🏜️',
    genre: 'Dakar Off-Road Racing Simulation',
    badge: 'Dakar Rally 🏜️',
    badgeAr: 'رالي داكار 🏜️',
    rating: 4.9,
    votes: 7890,
    difficulty: 'Hard',
    difficultyAr: 'صعب ومثير',
    poster: '/assets/games/desert-rally.jpg',
    altTextEn: 'Desert Rally: Dakar Storm - Extreme off-road buggy jumping off a giant sand dune at golden hour sunset with dust rooster-tail | لعبة ديزرت رالي عاصفة داكار سباق سيارات الدفع الرباعي في الصحراء',
    altTextAr: 'لعبة ديزرت رالي: عاصفة داكار - سباق سيارات باجي ورالي دفع رباعي يقفز في الهواء فوق الكثبان الرملية الذهبية مع تطاير الرمال وغروب الشمس',
    shortDescEn: 'Tear through shifting desert dunes, launch over sand crests for massive airtime multipliers, and conquer Dakar checkpoints before time runs out.',
    shortDescAr: 'اقتحم الكثبان الرملية المتحركة، واقفز عالياً في الهواء فوق قمم الرمال لمضاعفة نقاطك، واعبر بوابات داكار قبل نفاد الوقت.',
    fullDescEn: `Desert Rally: Dakar Storm captures the raw intensity of endurance off-road rally raiding across an unforgiving Sahara desert landscape. Piloting a twin-turbo Dakar buggy with independent long-travel suspension, players must navigate shifting sand crests, rocky canyon passes, and blinding dust storms.

The custom physics engine models off-road tire slip, suspension damping on hard landings, and 3D elevation airtime dynamics. Hitting dune ramps at top speed catapults your vehicle skyward, triggering an airborne trick multiplier. Manage your nitrous fuel reserves, dodge desert cacti and jagged boulders, and reach the next rally checkpoint before the timer hits zero.`,
    fullDescAr: `تجسد لعبة "ديزرت رالي: عاصفة داكار" الإثارة القصوى لسباقات الرالي الصحراوية العالمية عبر رمال الصحراء الكبرى الوعرة. يقود اللاعبون سيارة باجي داكار توربينية مجهزة بنظام تعليق طويل المدى وممتصات صدمات احترافية، لعبور الكثبان الرملية المتغيرة، والممرات الصخرية الضيقة، والعواصف الترابية المفاجئة.

يحاكي المحرك الفيزيائي انزلاق الإطارات على الرمال، وامتصاص الصدمات عند الهبوط، والارتفاع الجوي ثلاثي الأبعاد. يمنحك الانطلاق بأقصى سرعة فوق قمم الكثبان الرملية قفزات هوائية مذهلة تضاعف نقاطك ومكافآتك التراكمية. راقب مخزون النيترو، وتفادَ الصخور الحادة ونباتات الصبار، واعبر بوابات التفتيش الزمنية قبل نفاد الوقت.`,
    controlsEn: [
      { key: 'W / Up Arrow', action: 'Accelerate off-road buggy' },
      { key: 'A / Left Arrow', action: 'Steer left with suspension lean' },
      { key: 'D / Right Arrow', action: 'Steer right with suspension lean' },
      { key: 'S / Down Arrow', action: 'Brake / Reverse' },
      { key: 'Shift / Space', action: 'Dune launch nitrous boost' },
    ],
    controlsAr: [
      { key: 'W / السهم لأعلى', action: 'زيادة السرعة ودفع المحرك' },
      { key: 'A / السهم يسار', action: 'الانعطاف يساراً مع ميلان نظام التعليق' },
      { key: 'D / السهم يمين', action: 'الانعطاف يميناً مع ميلان نظام التعليق' },
      { key: 'S / السهم لأسفل', action: 'الفرامل / الرجوع للخلف' },
      { key: 'Shift / مسافة', action: 'إطلاق نيترو القفز الصاروخي' },
    ],
    featuresEn: [
      'Realistic off-road suspension bounce and landing damping physics',
      'Dynamic Dune Launch system awarding airtime distance bonuses',
      'Endurance checkpoint timer countdown mechanic with bonus time gates',
      'Dust storm particle roosts and sunset golden-hour lighting',
      'Off-road engine audio and suspension creak sound synthesis',
    ],
    featuresAr: [
      'محاكاة فيزيائية واقعية لارتداد ممتصات الصدمات وامتصاص قوة الهبوط',
      'نظام قفز هوائي يحسب مسافة الطيران في الهواء ويمنح مكافآت مضاعفة',
      'سباق مراحل وتحمل يعتمد على الوصول لبوابات التفتيش الزمنية في الوقت المحدد',
      'تأثيرات جزيئية لتطاير الرمال وغبار العواصف مع إضاءة وقت الغروب الذهبية',
      'أصوات محركات رالي واقعية وحفيف الرمال تحت الإطارات بدون أي تحميل إضافي',
    ],
    proTipsEn: [
      'Align your buggy straight before hitting dune jump ramps to ensure a clean landing without speed loss.',
      'Collect golden oasis fuel canisters along the dunes to keep your nitrous meter perpetually charged.',
      'Cut through low-lying sand valleys when the countdown timer is low for the fastest straight-line sprint.',
    ],
    proTipsAr: [
      'اضبط اتجاه سيارتك في مسار مستقيم قبل صعود منحدرات الكثبان لضمان هبوط سلس دون فقدان السرعة.',
      'التقط علب الوقود والعملات الذهبية المنتشرة على الرمال لشحن النيترو بشكل مستمر.',
      'اسلك المنخفضات الرملية المستوية عندما يوشك الوقت على النفاد للوصول بأسرع خط مستقيم للبوابة التالية.',
    ],
  },
  {
    id: 'neon-kart',
    slug: 'neon-kart',
    title: 'Neon Kart: Turbo Battle',
    titleAr: 'نيون كارت: معركة التوربو',
    subtitle: 'Futuristic High-Speed Kart Racer with Mystery Weapons & 4 AI Rivals',
    subtitleAr: 'سباق سيارات كارت نيون مستقبلية مع أسلحة وقذائف و4 متسابقين ذكاء اصطناعي',
    category: 'Kart & Battle',
    categoryAr: 'كارت ومعارك 🏎️',
    genre: 'Arcade Kart Battle Combat Racing',
    badge: 'Grand Prix 🍄',
    badgeAr: 'جائزة كبرى 🍄',
    rating: 4.95,
    votes: 9410,
    difficulty: 'Medium',
    difficultyAr: 'متوسط ومرح',
    poster: '/assets/games/neon-kart.jpg',
    altTextEn: 'Neon Kart: Turbo Battle - Glowing futuristic racing karts battling on a banked holographic highway above a cyberpunk city | لعبة نيون كارت معركة التوربو سباق سيارات الكارت المستقبلية',
    altTextAr: 'لعبة نيون كارت: معركة التوربو - سباق سيارات كارت نيون مضيئة تتنافس وتطلق الصواريخ والدروع على مضمار علوي فوق مدينة السايبربانك',
    shortDescEn: 'Drift through banked neon curves, collect mystery item boxes, unleash homing missiles and EMP lightning, and battle 4 AI rivals for 1st place.',
    shortDescAr: 'انعطف في منحنيات النيون المرتفعة، واجمع صناديق الأسلحة الغامضة، وأطلق الصواريخ الموجهة وصدمات البرق، وتصدر السباق أمام 4 متنافسين.',
    fullDescEn: `Neon Kart: Turbo Battle delivers exhilarating arcade kart combat racing along an elevated holographic speedway floating above a neon-drenched cyberpunk metropolis. Compete against four finely-tuned AI rivals across three high-intensity laps packed with speed boost pads, banked hairpins, and randomized weapon boxes.

Master the power-slide drift mechanic to ignite dual mini-turbo sparks (cyan to flame orange). Smash into glowing mystery boxes to deploy game-changing arsenal: heat-seeking homing missiles, invulnerable plasma shields, explosive rocket mushrooms, or an EMP lightning orb that electrocutes the entire field. Climb the leaderboard and claim the gold trophy!`,
    fullDescAr: `تقدم لعبة "نيون كارت: معركة التوربو" تجربة سباق كارت حماسية ومرحة مستوحاة من ألعاب المعارك الشهيرة على مضمار هولوجرامي معلق فوق سماء مدينة مستقبلية مضيئة. تنافس ضد 4 متسابقين أذكياء على مدار 3 لفات مليئة بمنصات زيادة السرعة، والمنعطفات المائلة، وصناديق الأسلحة التفاعلية.

أتقن أسلوب الانجراف (Power Slide) لتوليد شرارات النيترو المزدوجة (من الأزرق إلى البرتقالي الناري). التقط صناديق المكافآت لتفعيل أسلحة تكتيكية: صواريخ موجهة تطيح بالخصوم، ودروع بلازما تحميك من الاصطدامات، وفطر التوربو النفاث، وصواعق EMP البرقية التي تشل حركة جميع المنافسين. احتل المركز الأول وتوج بكأس البطولة!`,
    controlsEn: [
      { key: 'W / Up Arrow', action: 'Gas throttle' },
      { key: 'A / Left Arrow', action: 'Steer kart left' },
      { key: 'D / Right Arrow', action: 'Steer kart right' },
      { key: 'S / Down Arrow', action: 'Brake / Reverse' },
      { key: 'Shift', action: 'Drift / Charge mini-turbo boost' },
      { key: 'Space', action: 'Deploy held weapon / power-up' },
    ],
    controlsAr: [
      { key: 'W / السهم لأعلى', action: 'دعسة البنزين والتسارع' },
      { key: 'A / السهم يسار', action: 'توجيه الكارت لليسار' },
      { key: 'D / السهم يمين', action: 'توجيه الكارت لليمين' },
      { key: 'S / السهم لأسفل', action: 'الفرامل والرجوع للخلف' },
      { key: 'Shift', action: 'الدريفت وشحن دفعة التوربو المصغرة' },
      { key: 'مسافة', action: 'إطلاق السلاح أو تفعيل المكافأة المحفوظة' },
    ],
    featuresEn: [
      '4 Unique AI rival karts with distinct livery and dynamic racing AI',
      'Mystery Item Box system featuring Missiles, Shields, Turbo Mushrooms & EMP Lightning',
      'Dual-stage drift charge spark mechanics (Mini-Turbo and Super-Turbo)',
      'Live real-time race standing tracker (1st to 5th position) and lap timers',
      'Vibrant holographic neon skyway visuals with zero browser latency',
    ],
    featuresAr: [
      '4 سيارات كارت منافسة ذكية بتصاميم نيون مميزة وسلوكيات قيادة تنافسية',
      'نظام صناديق مفاجآت يحتوي على: صواريخ موجهة، دروع واقية، فطر نيترو، وصواعق EMP',
      'ميكانيكية دريفت متطورة تولد شرارات توربو ثنائية عند الخروج من المنعطفات',
      'متابعة حية للمركز الحالي في السباق (من الأول إلى الخامس) وحساب أزمنة اللفات',
      'رسوميات نيون هولوجرامية مبهرة ومعدل إطارات سلس وثابت 60FPS',
    ],
    proTipsEn: [
      'Hold the drift key around tight corners until sparks turn orange, then release for a powerful slingshot exit boost.',
      'Fire missiles when directly behind a rival on long straightaways for maximum strike accuracy.',
      'Keep your plasma shield active when entering crowded chicanes to absorb collisions from aggressive competitors.',
    ],
    proTipsAr: [
      'اضغط مطولاً على زر الدريفت في المنعطفات حتى تتحول الشرارات للون البرتقالي، ثم أفلته لتحصل على اندفاعة خارقة.',
      'أطلق الصواريخ عندما تكون خلف الخصم مباشرة في المسارات المستقيمة لضمان إصابته بدقة.',
      'فعل درع البلازما عند الاقتراب من زحام المتسابقين لحماية سيارتك وتجاوزهم بكل سلاسة.',
    ],
  },
  {
    id: 'midnight-touge',
    slug: 'midnight-touge',
    title: 'Midnight Touge: Mountain King',
    titleAr: 'ميدنايت توجي: ملك الجبل',
    subtitle: 'Downhill Mountain Hairpin Drift Duel & Gutter Hook Legend',
    subtitleAr: 'سباق ومبارزة التوجي على المنحدرات الجبلية اليابانية وتقنية مجرى المياه',
    category: 'Touge & Downhill',
    categoryAr: 'توجي ومنحدرات جبلية ⛰️',
    genre: 'Japanese Downhill Mountain Pass Racing Simulator',
    badge: 'Touge King ⛰️',
    badgeAr: 'ملك الجبل ⛰️',
    rating: 4.98,
    votes: 9820,
    difficulty: 'Extreme',
    difficultyAr: 'احترافي ودقيق',
    poster: '/assets/games/midnight-touge.jpg',
    altTextEn: 'Midnight Touge: Mountain King - Japanese mountain pass touge drift battle at night with red taillight trails, foggy mist and sakura cherry blossom petals | لعبة ميدنايت توجي ملك الجبل سباق سيارات في المنحدرات اليابانية',
    altTextAr: 'لعبة ميدنايت توجي: ملك الجبل - مبارزة دريفت ليلية لسيارتين خارقتين في منحنيات جبلية ضيقة مع خطوط ضوئية حمراء للأنوار الخلفية وتطاير أوراق الكرز والضباب',
    shortDescEn: 'Duel a legendary rival down foggy Japanese mountain hairpins, master the inside gutter hook technique, and pull 50m ahead for sudden-death victory.',
    shortDescAr: 'بارز خصماً أسطورياً في منعطفات جبلية ضيقة، وأتقن تقنية مجرى المياه (Gutter Hook)، وابتعد بفارق 50 متراً لتحقيق النصر الحاسم.',
    fullDescEn: `Midnight Touge: Mountain King transports drivers into the hallowed world of Japanese downhill mountain pass racing (Touge). Set on a serpentine downhill pass lined with metal guardrails, misty cedar forests, and drifting cherry blossom petals, players engage in a sudden-death cat-and-mouse duel against an unrelenting rival.

Success hinges on weight-transfer braking, late apex clipping, and executing the fabled "Gutter Hook" technique—hooking your inside wheels into the roadside drain to generate immense centrifugal cornering grip. Monitor the live Distance Lead Gauge: pull 50 meters ahead to break the rival's spirit and claim victory, or fall 50 meters behind and face defeat.`,
    fullDescAr: `تنقلك لعبة "ميدنايت توجي: ملك الجبل" إلى عالم سباقات المنحدرات الجبلية اليابانية الأسطورية (Touge). تدور المنافسة في ممر جبلي منحدر مليء بالمنعطفات الحادة المتتالية (Hairpins)، والحواجز المعدنية، وغابات الأرز الماطرة، وأوراق شجر الكرز المتطايرة، حيث تخوض مبارزة وجهاً لوجه ضد خصم محترف لا يرحم.

يعتمد الفوز على دقة توقيت الفرملة ونقل وزن السيارة، وتنفيذ تقنية "مجرى المياه" الشهيرة (Gutter Hook) عبر إدخال الإطارات الداخلية في حافة الطريق لاكتساب ثبات خارق وسرعة خروج مضاعفة. راقب مقياس المسافة بينك وبين خصمك: وسع الفارق إلى +50 متراً لتحقيق الفوز الحاسم، وتجنب التأخر بـ -50 متراً حتى لا تخسر السباق.`,
    controlsEn: [
      { key: 'W / Up Arrow', action: 'Downhill throttle' },
      { key: 'A / Left Arrow', action: 'Steer into apex left' },
      { key: 'D / Right Arrow', action: 'Steer into apex right' },
      { key: 'S / Down Arrow', action: 'Weight transfer braking' },
      { key: 'Space / Shift', action: 'Handbrake hairpin slide initiation' },
    ],
    controlsAr: [
      { key: 'W / السهم لأعلى', action: 'دعسة الوقود والنزول المنحدر' },
      { key: 'A / السهم يسار', action: 'الانعطاف نحو نقطة رأس المنعطف يساراً' },
      { key: 'D / السهم يمين', action: 'الانعطاف نحو نقطة رأس المنعطف يميناً' },
      { key: 'S / السهم لأسفل', action: 'فرامل نقل الوزن التكتيكية' },
      { key: 'مسافة / Shift', action: 'فرامل اليد وبدء الانجراف في المنعطفات الحادة' },
    ],
    featuresEn: [
      'High-stakes Cat-and-Mouse duel format with live dynamic +/- Lead Meter',
      'Authentic Gutter Hook apex mechanic granting instant grip and cornering speed boost',
      'Glowing LED taillight ribbon light trails and dynamic asphalt skid rendering',
      'Atmospheric night aesthetic with swirling sakura petals and mountain mist',
      'Screaming high-RPM rotary engine and tire screech sound synthesis',
    ],
    featuresAr: [
      'نظام مبارزة حماسي مباشر بمقياس مسافة حي يوضح فارق الأمتار بينك وبين الخصم',
      'ميكانيكية "مجرى المياه" الواقعية التي تمنحك قوة التصاق إضافية وتسارعاً هائلاً',
      'خطوط ضوئية حمراء مشعة تتبع المصابيح الخلفية ورسم خطوط احتكاك الإطارات على الأسفلت',
      'أجواء ليلية يابانية ساحرة مع تطاير بتلات أزهار الكرز وضباب الجبال',
      'محاكاة صوتية متقنة لمحركات الضغط العالي وصفير احتكاك الإطارات مع كل منعطف',
    ],
    proTipsEn: [
      'Brake hard in a straight line before entering hairpins, then tap handbrake to flick the tail into a smooth power slide.',
      'Clip the absolute edge of the inner road curb to trigger the Gutter Hook bonus for an unbeatable apex exit.',
      'Watch your rear-view mirror—block the rival from overtaking when entering narrow bridge crossings.',
    ],
    proTipsAr: [
      'اضغط على الفرامل بقوة في خط مستقيم قبل المنعطف، ثم المس فرامل اليد خفيفاً لتدوير مؤخرة السيارة بسلاسة.',
      'المس الحافة الداخلية للمنعطف بدقة لتفعيل مكافأة مجرى المياه (Gutter Hook) والحصول على أقصى سرعة خروج.',
      'راقب مرآتك الخلفية وأغلق مسار التجاوز أمام الخصم عند الممرات الجسرية الضيقة للحفاظ على تقدمك.',
    ],
  },
  {
    id: 'speedboat-rush',
    slug: 'speedboat-rush',
    title: 'Speedboat Rush: Hydro Thunder',
    titleAr: 'سبيد بوت رش: هايدرو ثندر',
    subtitle: 'Offshore Powerboat Racing, Swell Wave Jumps & 360 Barrel Rolls',
    subtitleAr: 'سباق القوارب السريعة في المحيط والقفز فوق الأمواج وحركات الشقلبة 360',
    category: 'Water & Boat',
    categoryAr: 'قوارب ومحيطات 🚤',
    genre: 'High-Speed Hydroplane Offshore Boat Racing',
    badge: 'Hydro Power 🚤',
    badgeAr: 'قوة الأمواج 🚤',
    rating: 4.93,
    votes: 8120,
    difficulty: 'Medium',
    difficultyAr: 'متوسط ومثير',
    poster: '/assets/games/speedboat-rush.jpg',
    altTextEn: 'Speedboat Rush: Hydro Thunder - Extreme offshore racing powerboat catching air over turquoise ocean wave crests at sunset with dramatic water spray | لعبة سبيد بوت رش سباق القوارب السريعة في المحيط',
    altTextAr: 'لعبة سبيد بوت رش: هايدرو ثندر - سباق قوارب وزوارق سريعة خارقة تقفز فوق أمواج المحيط الفيروزية عند الغروب مع رذاذ الماء وتأثيرات الأمواج الديناميكية',
    shortDescEn: 'Pilot twin-outboard racing catamarans across tropical ocean swells, jump off wave crests for 360 barrel-roll stunts, and hit hydro-boost straightaways.',
    shortDescAr: 'قُد زوارق الكاتاماران السريعة عبر أمواج المحيط الاستوائي، واقفز فوق قمم الأمواج لأداء حركات الشقلبة 360، وفجر النيترو المائي للسرعة القصوى.',
    fullDescEn: `Speedboat Rush: Hydro Thunder delivers supersonic offshore marine racing across sun-drenched tropical lagoons, coastal channels, and turbulent ocean swells. Steer a high-tech racing catamaran equipped with dual high-output marine outboard engines capable of exceeding 100 knots over open water.

The hydrodynamic water simulation creates undulating swells and wake chop that dynamically affect boat trim and stability. Ramp launch off foaming wave crests to perform mid-air 360-degree barrel rolls and unlock stunt score bonuses. Dodge shipping navigation buoys, hazardous ocean whirlpools, and collect golden maritime anchors while blasting your Hydro-Boost!`,
    fullDescAr: `تأخذك لعبة "سبيد بوت رش: هايدرو ثندر" إلى عالم سباقات الزوارق والقوارب السريعة الخارقة عبر الخلجان الاستوائية ومياه المحيط الفيروزية المفتوحة. تحكم في قارب كاتاماران سباق متطور مزود بمحركين بحريين فائقي القوة قادرين على تجاوز سرعة 100 عقدة بحرية فوق سطح الماء.

تحاكي اللعبة حركة أمواج المحيط وارتطام جسم القارب برذاذ المياه بدقة متناهية. استخدم قمم الأمواج كمنصات قفز هوائية لتنفيذ حركات دوران وشقلبة 360 درجة في الهواء للحصول على مكافآت استعراضية ضخمة. تفادَ العوامات البحرية التحذيرية، ودوامات المياه الخطرة، واجمع المراسي الذهبية مع تفعيل دفع النيترو المائي (Hydro-Boost)!`,
    controlsEn: [
      { key: 'W / Up Arrow', action: 'Twin outboard throttle' },
      { key: 'A / Left Arrow', action: 'Steer boat port / left' },
      { key: 'D / Right Arrow', action: 'Steer boat starboard / right' },
      { key: 'S / Down Arrow', action: 'Reverse / Hull brake' },
      { key: 'Space / Shift', action: 'Hydro-Boost nitrous jet' },
    ],
    controlsAr: [
      { key: 'W / السهم لأعلى', action: 'دعسة المحركات البحرية والتسارع' },
      { key: 'A / السهم يسار', action: 'توجيه القارب لليسار (ميناء)' },
      { key: 'D / السهم يمين', action: 'توجيه القارب لليمين (ميمنة)' },
      { key: 'S / السهم لأسفل', action: 'الفرملة المائية والرجوع' },
      { key: 'مسافة / Shift', action: 'إطلاق النفاث المائي الخارق (Hydro-Boost)' },
    ],
    featuresEn: [
      'Dynamic hydrodynamic wave swell physics affecting vessel trim and speed',
      'Airborne wave ramp jump stunts awarding 360 barrel-roll combo multipliers',
      'Twin-outboard wake spray particles and water droplet camera reflections',
      'Marine hazard navigation: warning buoys, ocean whirlpools, and rocky shoals',
      'Synthesized marine engine soundscape and wave impact acoustic effects',
    ],
    featuresAr: [
      'محاكاة فيزيائية للأمواج البحرية تؤثر واقعياً على استقرار القارب وسرعته',
      'قفزات هوائية مذهلة فوق قمم الأمواج مع حركات استعراضية دورانية 360 درجة',
      'تأثيرات بصرية لرذاذ المياه المتطاير من المحركات وفقاعات الأمواج البيضاء',
      'عوائق بحرية متنوعة: عوامات إرشادية مضيئة، دوامات مائية، وصخور ساحلية',
      'مؤثرات صوتية هادرة للمحركات البحرية وارتطام الأمواج بجسم القارب بدون أي تحميل',
    ],
    proTipsEn: [
      'Approach wave crests with full throttle to achieve maximum jump height and complete full barrel rolls.',
      'Swerve gently around warning buoys—glancing collisions will strip away your boat hull integrity.',
      'Save your Hydro-Boost for open calm water stretches to reach blistering speeds over 100 knots.',
    ],
    proTipsAr: [
      'اقترب من قمم الأمواج المرتفعة بأقصى سرعة لتحقيق أعلى قفزة في الهواء وإتمام دورة 360 كاملة.',
      'راوغ العوامات البحرية بهدوء، فالاحتكاك بها يقلل من سلامة هيكل القارب ويفقدك سرعتك.',
      'احتفظ بالنيترو المائي للمسارات المائية الهادئة والمفتوحة لتحقيق سرعات قياسية تتجاوز 100 عقدة.',
    ],
  },
  {
    id: 'monster-truck',
    slug: 'monster-truck',
    title: 'Monster Truck: Gravity Mayhem',
    titleAr: 'مونستر تراك: فوضى الجاذبية',
    subtitle: 'Mega-Tire Stadium Destruction, Scrap Car Crushing & Aerial Stunts',
    subtitleAr: 'تدمير وسحق سيارات الخردة بالإطارات العملاقة والقفزات البهلوانية',
    category: 'Destruction & Stunts',
    categoryAr: 'تدمير واستعراض 💥',
    genre: 'Arena Monster Truck Demolition Derby & Stunt Action',
    badge: 'Monster Crush 💥',
    badgeAr: 'سحق وتدمير 💥',
    rating: 4.96,
    votes: 8730,
    difficulty: 'Medium',
    difficultyAr: 'حماسي ومرح',
    poster: '/assets/games/monster-truck.jpg',
    altTextEn: 'Monster Truck: Gravity Mayhem - Massive neon monster truck crushing scrap cars in a stadium arena with sparks and fireworks | لعبة مونستر تراك فوضى الجاذبية سحق السيارات في الحلبة',
    altTextAr: 'لعبة مونستر تراك: فوضى الجاذبية - شاحنة عملاقة بإطارات ضخمة تقفز في الهواء وتسحق سيارات الخردة مع تطاير الشرر والألعاب النارية في حلبة الاستاد',
    shortDescEn: 'Crush scrap cars beneath massive tires, launch off mega stadium ramps for aerial backflips, and unleash supercharger nitro chaos.',
    shortDescAr: 'اسحق سيارات الخردة تحت الإطارات العملاقة، واقفز من المنحدرات لتنفيذ شقلبات هوائية، وفجر نيترو السوبر تشارجر لإشعال الحلبة.',
    fullDescEn: `Monster Truck: Gravity Mayhem brings the explosive adrenaline of monster truck stadium demolition to your browser! Command a 1,500-horsepower mega truck equipped with 66-inch heavy-tread Terra tires, nitrogen-charged long-travel shocks, and a screaming supercharged V8 engine.

Roar into the floodlit dirt stadium and flatten lines of scrap cars beneath your massive axles to rack up Crush Combo multipliers. Launch off mega dirt ramps to catch towering airtime, and tilt your truck in mid-air to pull off backflips and frontflips before sticking the landing. Keep the stadium crowd roaring and top the destruction scoreboard!`,
    fullDescAr: `تنقل لعبة "مونستر تراك: فوضى الجاذبية" إثارة وتدمير شاحنات الوحش العملاقة إلى متصفحك مباشرة! تحكم في شاحنة خارقة بقوة 1500 حصان مزودة بإطارات ضخمة مقاس 66 بوصة، وممتصات صدمات نيتروجينية طويلة المدى، ومحرك V8 سوبر تشارجر هادر.

انطلق في حلبة الاستاد الترابية المضاءة بكشافات عملاقة واسحق صفوف سيارات الخردة تحت عجلاتك لتحقيق مضاعفات نقاط السحق (Crush Combos). اقفز من منحدرات الاستاد الضخمة للتحليق في الهواء، ووازن شاحنتك لتنفيذ حركات الشقلبة الخلفية والأمامية قبل الهبوط بثبات. أشعل حماس الجماهير وتصدر قائمة أبطال التدمير!`,
    controlsEn: [
      { key: 'W / Up Arrow', action: 'Supercharged V8 throttle' },
      { key: 'A / Left Arrow', action: 'Steer left / Mid-air tilt back' },
      { key: 'D / Right Arrow', action: 'Steer right / Mid-air tilt forward' },
      { key: 'S / Down Arrow', action: 'Heavy hydraulic brake' },
      { key: 'Space / Shift', action: 'Supercharger Nitrous Blast' },
    ],
    controlsAr: [
      { key: 'W / السهم لأعلى', action: 'دعسة البنزين وتسارع محرك V8' },
      { key: 'A / السهم يسار', action: 'توجيه لليسار وميلان الشاحنة للخلف في الهواء' },
      { key: 'D / السهم يمين', action: 'توجيه لليمين وميلان الشاحنة للأمام في الهواء' },
      { key: 'S / السهم لأسفل', action: 'الفرامل الهيدروليكية القوية' },
      { key: 'مسافة / Shift', action: 'إطلاق نيترو السوبر تشارجر الخارق' },
    ],
    featuresEn: [
      'Authentic monster truck bouncy suspension and tire deformation physics',
      'Interactive scrap car crushing mechanic with metal crunch audio and flying sparks',
      'Mid-air rotation physics allowing 360 backflips and aerial stunt landing bonuses',
      'Stadium crowd cheers, stadium floodlight illumination, and celebratory fireworks',
      'Pure Web Audio procedural metal crunch and supercharger whine sound design',
    ],
    featuresAr: [
      'محاكاة فيزيائية واقعية لنظام التعليق الارتدادي ومرونة الإطارات العملاقة',
      'سحق حقيقي لسيارات الخردة مع أصوات تكسير المعادن وتطاير الشرر في الهواء',
      'إمكانية التحكم في دوران وتوازن الشاحنة أثناء الطيران في الهواء لتنفيذ شقلبات 360',
      'أجواء حلبة واستاد تفاعلية مع هتاف الجماهير وإضاءات الكشافات والألعاب النارية',
      'أصوات اصطناعية فورية لصوت السوبر تشارجر وسحق المعادن بدون أي استهلاك للبيانات',
    ],
    proTipsEn: [
      'Hit scrap car piles squarely in the center with nitrous engaged to crush multiple vehicles simultaneously.',
      'Tilt your truck backward slightly before leaving ramps to maintain optimal trajectory for a clean backflip.',
      'Stomp the gas upon touchdown to carry momentum out of hard landings without bouncing off course.',
    ],
    proTipsAr: [
      'اصطدم بصفوف سيارات الخردة في المنتصف تماماً مع تفعيل النيترو لسحق أكبر عدد ممكن دفعة واحدة.',
      'مل شاحنتك للخلف قليلاً لحظة مغادرة المنحدر لتهيئة مسار الشقلبة الخلفية بسلاسة.',
      'اضغط دعسة الوقود فور ملامسة الأرض للحفاظ على الزخم وتفادي التذبذب بعد الهبوط القوي.',
    ],
  },
  {
    id: 'canyon-infiltrator',
    slug: 'canyon-infiltrator',
    title: 'Supersonic Jet: Canyon Infiltrator',
    titleAr: 'سوبر سونيك جت: متسلل الوادي',
    subtitle: 'Low-Altitude Hypersonic Canyon Flight, Laser Defense & Mach 2.5 Sonic Booms',
    subtitleAr: 'طيران نفاث منخفض الارتفاع في ممرات الوادي الضيقة واختراق جدار الصوت وتفادي الليزر',
    category: 'Flight & Jet',
    categoryAr: 'طيران ونفاثات ✈️',
    genre: 'Supersonic Low-Altitude Aerial Combat & Canyon Racer',
    badge: 'Mach 2.5 ✈️',
    badgeAr: 'ماخ 2.5 ✈️',
    rating: 4.97,
    votes: 9320,
    difficulty: 'Extreme',
    difficultyAr: 'سرعة رد فعل فائقة',
    poster: '/assets/games/canyon-infiltrator.jpg',
    altTextEn: 'Supersonic Jet: Canyon Infiltrator - Stealth fighter jet banking through glowing neon red canyon at twilight with sonic boom rings and laser fire | لعبة سوبر سونيك جت طيران المقاتلات النفاثة في الوادي',
    altTextAr: 'لعبة سوبر سونيك جت: متسلل الوادي - مقاتلة نفاثة شبحية فائقة السرعة تنعطف في ممر وادٍ صخري ضيق عند الغسق مع حلقات اختراق جدار الصوت ونيران الدفاعات الجوية',
    shortDescEn: 'Weave through razor-sharp canyon walls at Mach 2+, lock on missiles to obliterate automated laser turrets, and break the sound barrier.',
    shortDescAr: 'حلق عبر ممرات الوادي الجبلي بسرعات تتجاوز ماخ 2، وأطلق الصواريخ لتدمير منصات الليزر، واخترق جدار الصوت باحترافية.',
    fullDescEn: `Supersonic Jet: Canyon Infiltrator delivers the raw rush of high-G low-altitude military flight. At the controls of an advanced delta-wing stealth interceptor, pilots plunge through a treacherous red-rock canyon labyrinth fortified with automated defense laser emplacements, floating EMP energy mines, and narrow rock chasms.

Engage twin afterburners to punch through the sound barrier, generating Mach 2.5 vapor cone shockwaves and intense screen-rumble physics. Deploy twin photon plasma missiles to vaporize laser turrets before they target your cockpit, and collect quantum fuel cores to sustain unlimited afterburner thrust through the gauntlet!`,
    fullDescAr: `تمنحك لعبة "سوبر سونيك جت: متسلل الوادي" تجربة طيران عسكري مقاتل شديد الحماسة على ارتفاعات منخفضة وتحت قوى جاذبية (G-Force) هائلة. في قمرة قيادة مقاتلة شبحية متطورة، يخترق الطيارون ممراً صخرياً ضيقاً محصناً بأبراج دفاع ليزري أوتوماتيكية، وألغام طاقة عائمة، ومضائق جبلية حادة.

شغل غرف الاحتراق اللاحقة (Afterburners) لكسر حاجز الصوت وتوليد سحب صدمة صوتية تفوق سرعة ماخ 2.5 مع اهتزازات واقعية للشاشة. أطلق صواريخ البلازما الفوتونية المزدوجة لتدمير مدافع الليزر قبل أن تصيب درعك، واجمع بطاريات الطاقة الكمومية للبقاء في وضع الاندفاع النفاث الأقصى!`,
    controlsEn: [
      { key: 'W / Up Arrow', action: 'Throttle pitch / Dive' },
      { key: 'A / Left Arrow', action: 'Bank left into canyon cleft' },
      { key: 'D / Right Arrow', action: 'Bank right into canyon cleft' },
      { key: 'S / Down Arrow', action: 'Airbrake pitch up' },
      { key: 'Space', action: 'Fire twin photon missiles' },
      { key: 'Shift', action: 'Engage Mach 2.5 Afterburners' },
    ],
    controlsAr: [
      { key: 'W / السهم لأعلى', action: 'زيادة سرعة الدفع والميل للأسفل' },
      { key: 'A / السهم يسار', action: 'ميلان وانعطاف الجناح لليسار' },
      { key: 'D / السهم يمين', action: 'ميلان وانعطاف الجناح لليمين' },
      { key: 'S / السهم لأسفل', action: 'فرامل الهواء والميل للأعلى' },
      { key: 'مسافة', action: 'إطلاق صواريخ البلازما المزدوجة' },
      { key: 'Shift', action: 'تفعيل الدفع اللاحق واختراق حاجز الصوت (ماخ 2.5)' },
    ],
    featuresEn: [
      'Authentic low-altitude supersonic flight dynamics and wing-banking physics',
      'Mach 2.5 Sonic Boom shockwave ring rendering and camera shake acoustic crack',
      'Dual offensive loadout: targeted photon missiles and plasma defense shields',
      'Dynamic automated laser defense turrets and floating EMP energy mine hazards',
      'High-adrenaline sci-fi military soundscape with zero asset loading latency',
    ],
    featuresAr: [
      'ديناميكا طيران حقيقية للمقاتلات النفاثة وميلان الأجنحة في المنعطفات الجبلية',
      'تجسيد بصري وصوتي لحلقات اختراق جدار الصوت (Sonic Boom) عند سرعة ماخ 2.5',
      'ترسانة هجومية ودفاعية: صواريخ موجهة مدمرة ودروع طاقة هيدروجينية واقية',
      'أبراج دفاعية أرضية تطلق أشعة الليزر وألغام طاقة كهرومغناطيسية تتطلب مناورات سريعة',
      'مؤثرات صوتية هادرة للمحركات التوربينية النفاثة واهتزاز الشاشة بدون أي تأخير',
    ],
    proTipsEn: [
      'Fire missiles preemptively when you see red radar blips indicating defense turrets ahead.',
      'Bank steeply into corners to slip between narrowing rock walls without scraping your wingtips.',
      'Reserve afterburners for straight canyon valleys to reliably trigger sonic boom speed multipliers.',
    ],
    proTipsAr: [
      'أطلق الصواريخ مسبقاً بمجرد ظهور إشارات الرادار الحمراء التي تنذر بوجود مدافع ليزر أمامك.',
      'انعطف بجناحيك بزاوية حادة للمرور عبر الشقوق الصخرية الضيقة دون احتكاك أطراف الأجنحة بالجبال.',
      'احتفظ بالدفع اللاحق للممرات المستقيمة لتحقيق أعلى مضاعف نقاط لاختراق جدار الصوت.',
    ],
  },
  {
    id: 'skyline-blitz',
    slug: 'skyline-blitz',
    title: 'Cyber Hoverboard: Skyline Blitz',
    titleAr: 'سايبر هوفربورد: سكايلين بليتز',
    subtitle: 'Anti-Gravity Rooftop Rail Grinding, Aerial 540s & Hyper-Glide Surfing',
    subtitleAr: 'ركوب ألواح الهوفربورد المعلقة على أسطح ناطحات السحاب والتزلج على سكك النيون',
    category: 'Hover & Extreme',
    categoryAr: 'هوفربورد وتزلج 🛹',
    genre: 'Futuristic Anti-Gravity Hoverboard Street Surfing & Stunts',
    badge: 'Hyper Glide 🛹',
    badgeAr: 'تزلج فضائي 🛹',
    rating: 4.95,
    votes: 8940,
    difficulty: 'Hard',
    difficultyAr: 'مهاري وسلس',
    poster: '/assets/games/skyline-blitz.jpg',
    altTextEn: 'Cyber Hoverboard: Skyline Blitz - Anti-gravity hoverboard rider grinding on a glowing purple neon rail between skyscrapers at night | لعبة سايبر هوفربورد سكايلين بليتز التزلج على سكك النيون',
    altTextAr: 'لعبة سايبر هوفربورد: سكايلين بليتز - متزلج هوفربورد مضاد للجاذبية يتزلج على سكة طاقة نيونية بنفسجية بين أسطح ناطحات السحاب المستقبلية مع تطاير الشرر',
    shortDescEn: 'Surf futuristic skyscraper rooftops on an anti-gravity hoverboard, lock onto neon grind rails, and pull off 540 aerial spins for huge score combos.',
    shortDescAr: 'تزلج فوق أسطح ناطحات السحاب المستقبلية بلوح هوفربورد عائم، وتماسك على سكك النيون، ونفذ شقلبات 540 في الهواء لمضاعفة نقاطك.',
    fullDescEn: `Cyber Hoverboard: Skyline Blitz immerses players in the thrilling subculture of anti-gravity urban rooftop surfing. Gliding atop a cutting-edge magnetic levitation hoverboard, riders carve through the neon skyline of a towering vertical metropolis, jumping massive gaps between skyscrapers and riding elevated maglev transport rails.

Lock onto glowing neon grind rails to trigger Rail Grind combos with showering spark showers and friction sizzle audio. Hit holographic billboard ramps to perform 540-degree grab spins and kickflips before sticking the rooftop landing. Collect blue energy prisms to maintain perpetual hyper-glide momentum!`,
    fullDescAr: `تأخذك لعبة "سايبر هوفربورد: سكايلين بليتز" إلى عالم التزلج المعلق المثير فوق أسطح ناطحات السحاب المستقبلية. على متن لوح تزلج متطور يعمل بتقنية الرفع المغناطيسي ومقاومة الجاذبية، يندفع المتزلجون عبر سماء مدينة عمودية مضيئة بأضواء النيون، للقفز عبر الفجوات بين المباني والتزلج على سكك الطاقة النيونية.

توازن على سكك النيون المضيئة لتفعيل حركات التزلج الطويلة (Rail Grinds) مع تدفق شلالات من الشرر البنفسجي والمؤثرات الصوتية. استخدم منصات اللوحات الإعلانية الهولوجرامية للقفز في الهواء وتنفيذ شقلبات 540 دورانية قبل الهبوط بدقة على الأسطح. اجمع موشورات الطاقة الزرقاء للبقاء في وضع الانزلاق الخارق المستمر!`,
    controlsEn: [
      { key: 'W / Up Arrow', action: 'Maglev propulsion throttle' },
      { key: 'A / Left Arrow', action: 'Carve left / Mid-air spin' },
      { key: 'D / Right Arrow', action: 'Carve right / Mid-air spin' },
      { key: 'S / Down Arrow', action: 'Air brake / Board check' },
      { key: 'Space', action: 'Ollie jump / Lock onto grind rails' },
      { key: 'Shift', action: 'Activate Hyper-Glide overdrive' },
    ],
    controlsAr: [
      { key: 'W / السهم لأعلى', action: 'دفع المحرك المغناطيسي والتسارع' },
      { key: 'A / السهم يسار', action: 'الانعطاف يساراً والشقلبة في الهواء' },
      { key: 'D / السهم يمين', action: 'الانعطاف يميناً والشقلبة في الهواء' },
      { key: 'S / السهم لأسفل', action: 'الفرامل الهوائية وتثبيت اللوح' },
      { key: 'مسافة', action: 'قفزة أولي (Ollie) والتثبت على سكك التزلج' },
      { key: 'Shift', action: 'تفعيل وضع الانزلاق الخارق (Hyper-Glide)' },
    ],
    featuresEn: [
      'Zero-friction magnetic levitation hoverboard handling and carving physics',
      'Dynamic Rail Grind system with sizzling spark showers and combo multiplier score',
      'Mid-air trick rotation engine supporting 360/540 grab flips and landing detection',
      'Cyberpunk skyscraper skyline aesthetic with holographic advertisements and laser rails',
      'Responsive Web Audio magnetic propulsion hum and grinding friction acoustics',
    ],
    featuresAr: [
      'فيزياء انزلاق مغناطيسي عديمة الاحتكاك تمنحك إحساساً سلساً بالطفو والتحكم',
      'نظام تزلج على السكك يولد شلالات شرر ضوئية ومضاعفات نقاط متتالية',
      'محرك حركات بهلوانية هوائية يدعم دورانات 360 و540 واكتشاف دقة الهبوط',
      'بيئة سايبربانك خلابة لناطحات السحاب مع إعلانات هولوجرامية وسكك ليزرية',
      'أصوات محاكاة فورية لأزيز المحرك المغناطيسي واحتكاك السكك المعدنية',
    ],
    proTipsEn: [
      'Line up your jump trajectory directly over purple neon rails to lock into extended grinds for 5x multipliers.',
      'Initiate aerial spins immediately upon leaving ramps to complete a full 540 before rooftop touchdown.',
      'Use Hyper-Glide bursts to clear wide skyscraper chasms without losing forward velocity.',
    ],
    proTipsAr: [
      'اضبط مسار قفزتك مباشرة فوق سكك النيون البنفسجية لتثبيت حركة التزلج ومضاعفة نقاطك حتى 5 أضعاف.',
      'ابدأ الدوران الهوائي فور مغادرة المنحدر لإتمام حركة 540 كاملة قبل ملامسة سطح المبنى التالي.',
      'استخدم دفعات الانزلاق الخارق (Hyper-Glide) لعبور الفجوات الشاسعة بين ناطحات السحاب دون فقدان السرعة.',
    ],
  },
];
