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
  AlertTriangle,
} from 'lucide-react';

export type PolicyTab = 'privacy' | 'terms' | 'disclaimer' | 'contact' | 'about';

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
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'disclaimer', label: 'Disclaimer', icon: AlertTriangle },
    { id: 'contact', label: 'Contact Us', icon: Mail },
    { id: 'about', label: 'About Us', icon: Info },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md" dir="ltr">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col text-slate-100 text-left">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-400" />
            <div className="text-base sm:text-lg font-bold font-game text-white">
              Legal & Information Center · games-children.com
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
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
          {/* TAB 1: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl sm:text-2xl font-bold font-game text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-400" />
                  <span>Privacy Policy</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Last Updated: 2026 · Compliant with Google AdSense Policies, COPPA & GDPR Guidelines
                </p>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-white">1. Our Commitment to Your Privacy</h3>
                <p>
                  At <strong>games-children.com</strong>, the privacy of our visitors is of paramount importance to us. This Privacy Policy document outlines the types of personal and non-personal information received and collected when you play City Speed Heroes, and how that information is safeguarded.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-white">2. Cookies & Google AdSense Advertising</h3>
                <p>
                  Our website displays advertisements served by third-party advertising partners, notably <strong>Google AdSense</strong>:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Google, as a third-party vendor, uses cookies (including the DoubleClick DART cookie) to serve ads based on prior visits to this website or other websites on the internet.
                  </li>
                  <li>
                    Users may opt out of personalized advertising by visiting Google Ads Settings (www.google.com/settings/ads) or through the Network Advertising Initiative opt-out page.
                  </li>
                  <li>
                    Third-party ad networks may also use cookies or web beacons to measure the effectiveness of their advertisements and personalize advertising content.
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-white">3. Local Browser Storage (HTML5 LocalStorage)</h3>
                <p>
                  City Speed Heroes uses your browser’s local storage (LocalStorage) exclusively to store your personal offline game progress, such as collected gold coins, unlocked supercars, engine upgrade levels, and your highest record score. This data is stored strictly on your local device and is never uploaded, tracked, or sold to external servers.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-white">4. Children's Online Privacy (COPPA Compliance)</h3>
                <p>
                  We are deeply committed to child safety and strictly observe COPPA (Children’s Online Privacy Protection Act) regulations. We do not require registration, do not collect personal names, real addresses, phone numbers, or geolocations from any player.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-white">5. Privacy Inquiries & Contact</h3>
                <p>
                  If you have any questions, concerns, or requests regarding this Privacy Policy, feel free to contact our administrative team directly via email: <strong className="text-amber-400">samipico425@gmail.com</strong>.
                </p>
              </section>
            </div>
          )}

          {/* TAB 2: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl sm:text-2xl font-bold font-game text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>Terms of Service</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Legal terms and user guidelines for City Speed Heroes on games-children.com
                </p>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-white">1. Acceptance of Terms</h3>
                <p>
                  By accessing, browsing, or playing <strong>City Speed Heroes</strong> on games-children.com, you agree to be bound by these Terms of Service, all applicable local and international laws, and regulations.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-white">2. Intellectual Property Rights</h3>
                <p>
                  All software code, graphics, interactive canvas elements, audio soundscapes, and written editorial content published on this website are the proprietary property of <strong>games-children.com</strong> and are protected under international copyright and intellectual property treaties.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-white">3. Acceptable Use Policy</h3>
                <p>
                  Users are granted a personal, non-exclusive, revocable license to play the game for personal, non-commercial entertainment. You agree not to:
                </p>
                <ul className="list-disc pl-6 space-y-1.5 text-slate-300">
                  <li>Attempt to compromise, disrupt, or flood site servers with automated bot traffic or malicious requests.</li>
                  <li>Use unauthorized scripts, memory injectors, or ad-block spoofers to manipulate scores or revenue systems.</li>
                  <li>Reverse-engineer or re-host game assets without prior written consent.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-white">4. Disclaimer of Warranties</h3>
                <p>
                  The game and all associated features are provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. While we strive to ensure 99.9% uptime and smooth 60 FPS performance, we are not liable for transient browser crashes or internet dropouts.
                </p>
              </section>
            </div>
          )}

          {/* TAB 3: LEGAL DISCLAIMER */}
          {activeTab === 'disclaimer' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl sm:text-2xl font-bold font-game text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span>Legal Disclaimer</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Effective Date: 2026 · Safety advisories and legal notices for games-children.com
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white">1. General Entertainment Advisory</h3>
                <p>
                  <strong>City Speed Heroes</strong> is designed and published solely for casual video game entertainment on games-children.com. The speeds, near-miss passes, nitro boosts, and lane-swerving tactics depicted within the game are purely fictional arcade simulations and do not represent real-world driving physics or highway safety laws.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white">2. Real-World Traffic Safety Notice</h3>
                <p>
                  We strongly urge all players—especially teenage and new drivers—to strictly follow all posted speed limits, seatbelt regulations, and traffic laws in their jurisdiction. Never attempt or simulate any aggressive driving, high-speed weaving, or emergency braking in real motor vehicles. Road safety is everyone's responsibility.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white">3. Trademarks & Brand Non-Affiliation</h3>
                <p>
                  All vehicle designs, body silhouettes, sound effects, and styling cues are artistic creations or open-source stylized models. Any resemblance to real automobile manufacturers, trademarks, or proprietary names is purely coincidental and does not constitute an endorsement, sponsorship, or licensing agreement by those respective brand holders.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white">4. Third-Party Advertisements</h3>
                <p>
                  Advertisements appearing on this site are served by third-party platforms including Google AdSense. games-children.com does not endorse or assume liability for the products, claims, or services advertised by third-party sponsors.
                </p>
              </section>
            </div>
          )}

          {/* TAB 4: CONTACT US */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl sm:text-2xl font-bold font-game text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-amber-400" />
                  <span>Contact Us & Player Support</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  We welcome feedback, suggestions for new supercars, bug reports, and business inquiries
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Form column (3 cols) */}
                <div className="md:col-span-3">
                  {contactSubmitted ? (
                    <div className="p-6 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-center space-y-3">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                      <div className="text-base font-bold text-white">Message Sent Successfully!</div>
                      <p className="text-xs text-slate-300">
                        Thank you for reaching out. We will review your message and reply to your email as soon as possible.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="e.g. Alex Johnson"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Subject
                        </label>
                        <select
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                        >
                          <option value="general">General Feedback</option>
                          <option value="feedback">Car & Track Suggestion</option>
                          <option value="bug">Bug Report / Performance Issue</option>
                          <option value="ads">Advertising & Partnership Inquiry</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Message
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder="Type your message, suggestions, or question here..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </button>
                    </form>
                  )}
                </div>

                {/* Direct Contact Info (2 cols) */}
                <div className="md:col-span-2 space-y-4 bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Direct Channels</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="text-slate-400 font-semibold mb-0.5">Support Email:</div>
                      <a
                        href="mailto:samipico425@gmail.com"
                        className="text-amber-400 font-mono hover:underline text-xs"
                      >
                        samipico425@gmail.com
                      </a>
                    </div>

                    <div>
                      <div className="text-slate-400 font-semibold mb-0.5">Website:</div>
                      <div className="text-slate-200 font-mono">https://www.games-children.com</div>
                    </div>

                    <div>
                      <div className="text-slate-400 font-semibold mb-0.5">Support Hours:</div>
                      <div className="text-slate-300">Monday - Friday (Response within 24 hours)</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    We review all player feedback to introduce new tracks, cars, and gameplay features in our regular updates!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ABOUT US */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl sm:text-2xl font-bold font-game text-white flex items-center gap-2">
                  <Info className="w-5 h-5 text-amber-400" />
                  <span>About Us · games-children.com</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Our mission to bring safe, lightning-fast browser gaming to players across USA, Canada, Netherlands & worldwide
                </p>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-white">Who We Are</h3>
                <p>
                  At <strong>games-children.com</strong>, we are an independent game studio passionate about building lightweight, high-performance web games. City Speed Heroes combines the thrill of classic arcade racing with modern HTML5 pseudo-3D graphics, delivering instantaneous gameplay directly in any modern browser without heavy downloads or device memory bloat.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-white">Our Core Commitments</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="font-bold text-amber-400 text-xs sm:text-sm">Family-Safe & COPPA Compliant</div>
                    <p className="text-[11px] text-slate-300">
                      Zero tracking of minors, no predatory microtransactions, and strict adherence to Google AdSense family safety guidelines.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="font-bold text-sky-400 text-xs sm:text-sm">Instant 60 FPS Performance</div>
                    <p className="text-[11px] text-slate-300">
                      Built with modern HTML5 Canvas, Web Audio API, and TypeScript for silky smooth frame rates on mobile, tablet, and desktop.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-white">Engineering & Tech Stack</h3>
                <ul className="list-disc pl-6 space-y-1.5 text-slate-300">
                  <li><strong>HTML5 Canvas 2.5D Engine:</strong> Ultra-responsive road curvature rendering and high-speed parallax backgrounds at 60 FPS.</li>
                  <li><strong>Web Audio API:</strong> Dynamic procedural engine revs, turbo spools, nitrous hiss, and drift screech sound effects.</li>
                  <li><strong>React & TypeScript:</strong> Seamless state management, garage upgrades, and career achievements.</li>
                  <li><strong>Cross-Platform Responsiveness:</strong> Smooth touch steering on iOS & Android, and fluid WASD/arrow keys on PC & Mac.</li>
                </ul>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
