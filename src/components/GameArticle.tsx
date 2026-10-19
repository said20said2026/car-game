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
  Tag,
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
      q: 'Is City Speed Heroes 100% free to play with no downloads required?',
      a: 'Yes, City Speed Heroes is completely 100% free with zero downloads or subscriptions. You can play directly inside any modern web browser on PC, Mac, Chromebook, iPhone, iPad, and Android devices across the USA, Canada, Netherlands, and worldwide.',
    },
    {
      q: 'How do I earn gold coins quickly to upgrade supercars in the garage?',
      a: 'You can multiply your earnings in three ways: grabbing gold coins on the road, performing near-miss passes by swerving inches away from traffic at speeds over 100 km/h, and chaining combos with nitrous boost to survive longer race distances.',
    },
    {
      q: 'Does the game support touch controls on smartphones and tablets?',
      a: 'Yes! City Speed Heroes features responsive on-screen mobile touch controls. Left/right thumb buttons provide precise steering, a dedicated brake pedal allows quick deceleration, and an animated nitrous boost button delivers instant supersonic acceleration.',
    },
    {
      q: 'What are the system requirements to run the game smoothly at 60 FPS?',
      a: 'The game is built with lightweight HTML5 Canvas 2.5D technology and runs at a fluid 60 frames per second on almost any desktop, laptop, or mobile device. All you need is an up-to-date web browser such as Google Chrome, Safari, Edge, or Firefox.',
    },
    {
      q: 'Will my high scores and unlocked supercars be saved if I close my browser?',
      a: 'Yes, absolutely. The game uses secure HTML5 LocalStorage in your browser to save your collected coins, unlocked vehicles, garage upgrade levels, and your highest record score automatically without requiring account registration or personal data.',
    },
    {
      q: 'What is the tactical difference between drifting and a near miss?',
      a: 'Drifting is triggered by tapping brake while steering hard through highway curves, preserving vehicle momentum and sliding gracefully. A near miss is an adrenaline stunt executed by passing civil traffic vehicles at high speed within inches, rewarding you with multiplier points and bonus coins.',
    },
    {
      q: 'Is City Speed Heroes safe for children and COPPA compliant?',
      a: 'Yes, the game is designed as a family-safe arcade racing environment fully compliant with COPPA and Google AdSense family safety guidelines. It contains no realistic violence, no chat rooms, and no personal data collection.',
    },
    {
      q: 'Can I install City Speed Heroes as a Progressive Web App (PWA) on mobile?',
      a: 'Yes! City Speed Heroes supports modern PWA capabilities. You can add it directly to your home screen on iOS and Android with a single tap, enjoying full-screen gameplay without downloading heavy APK files from third-party app stores.',
    },
    {
      q: 'What racing classics inspired City Speed Heroes?',
      a: 'City Speed Heroes draws inspiration from legendary retro arcade racing games and highway swerving simulators, combining precise lane-swerving tactics, high-speed drafting, and garage engine tuning into a modern, 60 FPS browser experience.',
    },
    {
      q: 'Why focus on 6 master-crafted supercars instead of generic 500 car games?',
      a: 'Rather than offering hundreds of repetitive, low-detail models found on generic 500-car gaming portals, our curated fleet of 6 supercars offers bespoke physics, unique acceleration curves, custom engine audio profiles, and 5-stage mechanical garage tuning.',
    },
    {
      q: 'Does City Speed Heroes feature desert and weather tracks?',
      a: 'Yes! Experience dynamic tracks including the Sunny Downtown Highway, Rainstorm Slicks with realistic surface hydroplaning, Cyberpunk Neon City, and the vast Desert Dunes track with shifting sand gusts.',
    },
    {
      q: 'What are the best services offered by games-children.com?',
      a: 'The best services of games-children.com include providing instant-play 3D browser games with zero downloads, COPPA-compliant child-safe family environments, seamless 60 FPS performance, and responsive cross-platform support across desktop and mobile devices.',
    },
    {
      q: 'Where can I find comprehensive supercar guides and detailed reviews?',
      a: 'Our comprehensive guide and detailed reviews section breaks down the speed thresholds, acceleration ratings, drift stability, and upgrade pathways for all 6 supercars in the fleet to help you claim #1 on the Champions Leaderboard.',
    },
    {
      q: 'How does games-children.com optimize SEO and user experience?',
      a: 'We implement industry-leading search engine optimization (SEO) and user experience (UX) practices: lightning-fast Core Web Vitals, semantic HTML5 structure, schema.org structured data, touch-friendly UI design, and strict zero-intrusive ad placement.',
    },
  ];

  return (
    <article className="game-description mt-10 space-y-12 leading-relaxed max-w-4xl mx-auto text-left" dir="ltr">
      {/* Main Hero Overview */}
      <section className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black font-game text-inherit tracking-tight">
          City Speed Heroes - Free 3D Car Racing Game Online
        </h2>
        <p className="text-base sm:text-lg opacity-90 leading-relaxed">
          Welcome to <strong>City Speed Heroes</strong>, the premier free 3D browser car racing and highway driving simulation on <strong>games-children.com</strong>! If you love high-octane speed, dodging intense rush-hour traffic, and tuning exotic supercars, this game delivers pure arcade adrenaline directly in your web browser with zero downloads.
        </p>
        <p className="text-sm sm:text-base opacity-85 leading-relaxed">
          Engineered for players across the United States, Canada, the Netherlands, and around the globe, City Speed Heroes combines silky-smooth 60 FPS pseudo-3D graphics, procedural engine acoustics, dynamic weather tracks, and deep garage upgrades. Race anytime on PC, Mac, Chromebook, iPhone, iPad, or Android!
        </p>

        {/* High-res gameplay preview image */}
        <figure className="my-6 rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
          <picture>
            <source srcSet="/assets/gameplay-preview.webp" type="image/webp" />
            <img
              src="/assets/gameplay-preview.jpg"
              alt="City Speed Heroes 3D highway racing gameplay preview with nitrous boost and traffic dodge"
              width={800}
              height={450}
              loading="lazy"
              className="w-full h-auto object-cover max-h-[380px]"
            />
          </picture>
          <figcaption className="text-center text-xs opacity-70 py-2.5 px-4 bg-slate-900/60 border-t border-slate-800/80">
            Interactive City Highway Track - Advanced 3D canvas visuals and realistic arcade driving
          </figcaption>
        </figure>
      </section>

      {/* Controls & How to Play */}
      <section id="instructions" className="scroll-mt-24 space-y-4 p-5 sm:p-7 rounded-2xl bg-slate-900/40 border border-slate-800/80">
        <h2 className="text-2xl sm:text-3xl font-black font-game text-inherit tracking-tight">
          How to Play & Master Highway Lane Swerving
        </h2>
        <p className="opacity-90 text-sm sm:text-base leading-relaxed">
          The control scheme is designed to be instantly accessible for casual players while offering the precision and responsiveness required by competitive speedrunners:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-sky-400">
              <Monitor className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-inherit font-game">PC & Mac Keyboard Controls</h3>
            </div>
            <ul className="text-xs sm:text-sm opacity-85 leading-relaxed space-y-1.5 list-disc pl-5">
              <li><strong>Left & Right Arrows or (A / D):</strong> Steer smoothly between highway lanes to dodge slower trucks and sedans.</li>
              <li><strong>Up Arrow or (W):</strong> Full throttle acceleration to reach maximum horsepower and highway velocity.</li>
              <li><strong>Down Arrow or (S):</strong> Apply hydraulic brakes to slow down safely behind dense traffic congestion.</li>
              <li><strong>Spacebar:</strong> Engage the handbrake to execute high-speed tactical drifts around sweeping road curves.</li>
              <li><strong>Shift Key:</strong> Ignite supersonic Nitrous Oxide (Nitro) boost when your nitrous tank is charged.</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <Smartphone className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-inherit font-game">Mobile & Tablet Touch Controls</h3>
            </div>
            <ul className="text-xs sm:text-sm opacity-85 leading-relaxed space-y-1.5 list-disc pl-5">
              <li><strong>On-Screen Steering Buttons:</strong> Ergonomic transparent left/right touch buttons positioned for natural thumb control.</li>
              <li><strong>Smart Auto-Acceleration:</strong> Keeps your supercar accelerating smoothly so you can focus on quick maneuvers.</li>
              <li><strong>Touch Brake Pedal:</strong> Instant emergency braking to prevent collisions with the rear bumpers of trucks.</li>
              <li><strong>Pulsing Nitro Button:</strong> Glows when nitrous is primed—tap once to blast through traffic in a straight line.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Arcade Heritage & Lane Swerving Tactics */}
      <section className="space-y-4 p-5 sm:p-7 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-950 border border-slate-800/80">
        <div className="flex items-center gap-2.5 text-amber-400">
          <History className="w-6 h-6 shrink-0" />
          <h2 className="text-xl sm:text-2xl font-black font-game text-white tracking-tight">
            Arcade Heritage & High-Speed Highway Swerving
          </h2>
        </div>
        <p className="opacity-90 text-sm sm:text-base leading-relaxed text-slate-300">
          City Speed Heroes pays homage to beloved arcade racing classics while introducing modern pseudo-3D mechanics. Known globally as a high-octane <strong>lane swerving game</strong>, every millisecond counts as you read traffic patterns, spot openings between 18-wheelers, and thread the needle at over 200 km/h.
        </p>
        <p className="opacity-90 text-sm sm:text-base leading-relaxed text-slate-300">
          Unlike static driving titles, dynamic road curvature and intelligent AI traffic vehicles challenge your reflexes. Chaining clean passes and building momentum tests the same sharp hand-eye coordination found in competitive esports.
        </p>
      </section>

      {/* Key Features Breakdown */}
      <section className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black font-game text-inherit tracking-tight">
          What Makes City Speed Heroes Exceptional
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-inherit text-sm font-game">Web Audio Procedural Engine</h3>
            <p className="text-xs opacity-80 leading-relaxed">
              Dynamic synthesized V8 and turbo acoustics that shift pitch realistically with engine RPM, turbo blow-off hiss, and tire screeching.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-inherit text-sm font-game">Comprehensive Garage Tuning</h3>
            <p className="text-xs opacity-80 leading-relaxed">
              Upgrade Top Speed, Acceleration, Handling, and Nitro Capacity across 5 distinct stages for each vehicle using collected gold coins.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-inherit text-sm font-game">Dynamic Weather & Tracks</h3>
            <p className="text-xs opacity-80 leading-relaxed">
              Race through Sunny Downtown, Rainstorm Slicks with hydroplane physics, Cyberpunk Neon skylines, and the golden Desert Dunes.
            </p>
          </div>
        </div>
      </section>

      {/* Pro Racing Tips & High Score Strategy */}
      <section id="tips" className="scroll-mt-24 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black font-game text-inherit tracking-tight">
          Pro Racing Tips & High Score Tactics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60 space-y-1.5">
            <h3 className="text-sm font-bold text-amber-400 font-game flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Near Miss Multiplier (Combo Chains)</span>
            </h3>
            <p className="text-xs opacity-80 leading-relaxed">
              Pass civilian vehicles within inches at speeds above 100 km/h without making contact. Linking consecutive near-misses builds a combo multiplier (up to 5x) that sky-rockets your score and coin accumulation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60 space-y-1.5">
            <h3 className="text-sm font-bold text-sky-400 font-game flex items-center gap-2">
              <Flame className="w-4 h-4" />
              <span>Strategic Nitrous Timing</span>
            </h3>
            <p className="text-xs opacity-80 leading-relaxed">
              Avoid burning nitrous in the middle of tight blind curves or bumper-to-bumper traffic jams. Wait for an open straightaway to fire your nitro boost for maximum speed and safe highway clearance.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60 space-y-1.5">
            <h3 className="text-sm font-bold text-emerald-400 font-game flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Horizon Scanning & Truck Anticipation</span>
            </h3>
            <p className="text-xs opacity-80 leading-relaxed">
              Keep your gaze fixed on the vanishing horizon. Spotting the silhouettes of slow moving trucks early allows you to switch lanes smoothly without braking and losing speed momentum.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60 space-y-1.5">
            <h3 className="text-sm font-bold text-purple-400 font-game flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Survival Over Coin Greed</span>
            </h3>
            <p className="text-xs opacity-80 leading-relaxed">
              While collecting coins is essential for garage upgrades, never risk a terminal collision for a single coin in a congested lane. Surviving longer distances yields far greater score records.
            </p>
          </div>
        </div>
      </section>

      {/* Supercars Fleet Showcase & Specs */}
      <section id="cars" className="scroll-mt-24 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black font-game text-inherit tracking-tight">
              Fleet of 6 Supercars: Performance Specs & Tuning
            </h2>
            <p className="text-xs sm:text-sm opacity-80 mt-1">
              Explore the 6 high-octane racing supercars in the fleet—from American V8 muscle to futuristic aero hypercars.
            </p>
          </div>

          {onOpenGarage && (
            <button
              onClick={() => onOpenGarage()}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-amber-400/20 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span>Open Garage to Upgrade Fleet</span>
            </button>
          )}
        </div>

        {/* Fleet banner */}
        <figure className="my-6 rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
          <picture>
            <source srcSet="/assets/social-cover.webp" type="image/webp" />
            <img
              src="/assets/social-cover.jpg"
              alt="City Speed Heroes fleet of exotic supercars in garage"
              width={1200}
              height={630}
              loading="lazy"
              className="w-full h-auto object-cover max-h-[360px]"
            />
          </picture>
          <figcaption className="text-center text-xs opacity-70 py-2.5 px-4 bg-slate-900/60 border-t border-slate-800/80">
            The 6 High-Performance Racing Supercars available in your garage
          </figcaption>
        </figure>

        {/* Cars Cards Grid */}
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

                <h3 className="text-lg font-bold font-game text-inherit">{car.name}</h3>
                <p className="text-xs opacity-80 mt-1 line-clamp-2 leading-relaxed">
                  {car.description}
                </p>
              </div>

              {/* Specs */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/60 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sky-400">
                    <Gauge className="w-3.5 h-3.5" />
                    Top Speed:
                  </span>
                  <span className="font-game font-bold tabular-nums text-sky-400">{car.baseSpeed} km/h</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Zap className="w-3.5 h-3.5" />
                    Acceleration:
                  </span>
                  <span className="font-bold tabular-nums">{car.baseAcceleration}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Shield className="w-3.5 h-3.5" />
                    Handling:
                  </span>
                  <span className="font-bold tabular-nums">{car.baseHandling}%</span>
                </div>
              </div>

              <button
                onClick={() => onOpenGarage?.(car.id)}
                className="w-full mt-2 py-2 px-3 bg-slate-800 hover:bg-amber-400 hover:text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Tune This Supercar in Garage</span>
              </button>
            </div>
          ))}
        </div>

        {/* Specs Comparison Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 mt-4">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900 border-b border-slate-800 font-bold opacity-90">
              <tr>
                <th className="py-3 px-4">Supercar</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Top Speed</th>
                <th className="py-3 px-4">Acceleration</th>
                <th className="py-3 px-4">Handling</th>
                <th className="py-3 px-4">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {CARS_DATA.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </td>
                  <td className="py-3 px-4 opacity-80">{c.type}</td>
                  <td className="py-3 px-4 font-game font-bold text-sky-400 tabular-nums">{c.baseSpeed} km/h</td>
                  <td className="py-3 px-4 tabular-nums">{c.baseAcceleration}%</td>
                  <td className="py-3 px-4 tabular-nums">{c.baseHandling}%</td>
                  <td className="py-3 px-4 font-game text-amber-400 font-bold tabular-nums">
                    {c.price === 0 ? 'Free Starter' : `${c.price} Coins`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quality Standards & Platform Services: Strategic Keywords Section */}
      <section className="space-y-6 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/70 border border-amber-500/30 shadow-xl">
        <div className="border-b border-slate-800 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-bold border border-amber-400/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Excellence & SEO Standards</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-game text-white tracking-tight">
            Best Services of games-children.com: Comprehensive Guide & User Experience
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Our commitment to delivering the premier free web gaming experience for players in the USA, Netherlands, Canada, and worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Best Services of games-children.com */}
          <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3 hover:border-amber-400/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-game text-white">
              Best Services of games-children.com
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>games-children.com</strong> provides instant-play 3D browser games with zero downloads, 100% family-safe COPPA compliance, silky-smooth 60 FPS performance, and automatic progress saving in your browser across all devices.
            </p>
          </div>

          {/* Card 2: Comprehensive Guide & Detailed Reviews */}
          <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3 hover:border-sky-400/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-game text-white">
              Comprehensive Guide & Detailed Reviews
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our <strong>comprehensive guide and detailed reviews</strong> evaluate the performance curves, top speed limits, and handling dynamics of each supercar in our fleet to help players master high-speed highway racing and top the leaderboard.
            </p>
          </div>

          {/* Card 3: SEO Tips & User Experience Optimization */}
          <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3 hover:border-emerald-400/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-game text-white">
              SEO Tips & User Experience (UX)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We apply the latest <strong>SEO and user experience optimization tips</strong>—ensuring lightning Core Web Vitals loading speeds, fully responsive mobile touch steering, clear semantic structure, and non-intrusive ad layouts.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="scroll-mt-24 space-y-4 pt-2">
        <h2 className="text-2xl sm:text-3xl font-black font-game text-inherit tracking-tight">
          Frequently Asked Questions (FAQ)
        </h2>
        <div className="space-y-2.5">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800/80 bg-slate-900/50 overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full py-3.5 px-4 text-left font-semibold flex items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors cursor-pointer"
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

      {/* SEO Topic Tags & Global Search Directory */}
      <section className="space-y-5 pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-2 text-amber-400">
          <Tag className="w-5 h-5 shrink-0" />
          <h2 className="text-xl sm:text-2xl font-black font-game text-white tracking-tight">
            City Speed Heroes Global Search Hub
          </h2>
        </div>
        <p className="text-xs sm:text-sm opacity-85 leading-relaxed text-slate-300">
          Explore the popular game topics and search terms integrated into City Speed Heroes for global discovery:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2.5">
            <h3 className="font-bold text-amber-400 font-game flex items-center gap-1.5">
              <Trophy className="w-4 h-4" />
              <span>Racing Modes & Highlights</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                'City Speed Heroes 3D',
                'Free online car games',
                'Browser racing simulator',
                'Lane swerving game',
                'Near miss dodge mechanics',
                'Nitrous boost speeds',
                'Top 5 leaderboard',
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

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2.5">
            <h3 className="font-bold text-sky-400 font-game flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <span>Cross-Platform Web Gaming</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                'No download required',
                'Play in browser on PC & Mac',
                'Mobile touch controls',
                '60 FPS HTML5 canvas engine',
                'US & Canada online car games',
                'Netherlands browser games',
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

          <div className="p-4 rounded-xl bg-slate-900/40 border border-amber-500/30 space-y-2.5 sm:col-span-2">
            <h3 className="font-bold text-amber-400 font-game flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>games-children.com Best Services & Reviews</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Best services of games-children.com',
                'Comprehensive guide and detailed reviews',
                'SEO tips and user experience',
                'Safe family gaming 100%',
                'Supercars fleet & garage upgrades',
                'أفضل خدمات games-children.com',
                'دليل شامل ومراجعات مفصلة باللغة العربية',
                'نصائح تحسين محركات البحث وتجربة المستخدم',
              ].map((term, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-200 border border-slate-700/60 hover:border-amber-400/50 hover:text-amber-300 transition-colors font-medium"
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
