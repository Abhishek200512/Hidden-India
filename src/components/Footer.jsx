import React, { useState } from 'react';
import { Compass, Send, Heart, ArrowUp, CheckCircle2 } from 'lucide-react';
import { DESTINATIONS } from '../data/destinations';

export default function Footer({ onSelectDestination, onNavigate }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [modalContent, setModalContent] = useState(null); // 'privacy' | 'terms' | 'contact' | null

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 4000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#030508] border-t border-white/10 text-slate-400 text-xs pt-16 pb-12 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-300 flex items-center justify-center text-black font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-serif-luxury font-black text-xl text-white tracking-wider">
                HIDDEN INDIA
              </span>
            </div>

            <p className="font-serif-luxury italic text-amber-300 text-sm">
              Beyond the Ordinary. Into the Extraordinary.
            </p>

            <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
              An independent cultural initiative archiving India's unmapped geography, indigenous living philosophies, and sacred sanctuaries for conscious global travelers.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <span className="block text-slate-300 font-semibold text-xs mb-2">
                Join the Dispatch of the Uncharted:
              </span>
              <form onSubmit={handleSubscribe} className="flex items-center gap-2 max-w-sm">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="flex-1 py-2 px-3.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:border-amber-400 focus:outline-none placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Join</span>
                </button>
              </form>
              {subscribed && (
                <p className="text-emerald-400 text-[11px] mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Welcome to the inner circle of Hidden India.
                </p>
              )}
            </div>
          </div>

          {/* Column 2: Explore Sanctuaries */}
          <div>
            <h4 className="font-serif-luxury text-sm font-bold text-white uppercase tracking-wider mb-4 text-amber-400">
              Sanctuaries
            </h4>
            <ul className="space-y-2">
              {DESTINATIONS.slice(0, 6).map((dest) => (
                <li key={dest.id}>
                  <button
                    onClick={() => onSelectDestination(dest)}
                    className="hover:text-amber-300 transition-colors text-left"
                  >
                    {dest.name} ({dest.state})
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Cultural Navigation */}
          <div>
            <h4 className="font-serif-luxury text-sm font-bold text-white uppercase tracking-wider mb-4 text-amber-400">
              Cultural Lore
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('culture')} className="hover:text-amber-300 transition-colors">
                  Tribal Festivals (Hornbill & Hemis)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('culture')} className="hover:text-amber-300 transition-colors">
                  Secret Hearth Feasts (Wazwan & Dham)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('culture')} className="hover:text-amber-300 transition-colors">
                  Rare Guild Crafts (Athangudi & Kani)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('culture')} className="hover:text-amber-300 transition-colors">
                  Botanical Architecture (Root Bridges)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('planner')} className="hover:text-amber-300 transition-colors">
                  Interactive Travel Planner
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('map')} className="hover:text-amber-300 transition-colors">
                  3D Interactive India Map
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Ethics & Legal */}
          <div>
            <h4 className="font-serif-luxury text-sm font-bold text-white uppercase tracking-wider mb-4 text-amber-400">
              Governance & Ethos
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setModalContent('responsible')} className="hover:text-amber-300 transition-colors">
                  Responsible Traveler Charter
                </button>
              </li>
              <li>
                <button onClick={() => setModalContent('contact')} className="hover:text-amber-300 transition-colors">
                  Contact Dispatch & Homestay Registry
                </button>
              </li>
              <li>
                <button onClick={() => setModalContent('privacy')} className="hover:text-amber-300 transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => setModalContent('terms')} className="hover:text-amber-300 transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={scrollToTop} className="hover:text-amber-300 transition-colors flex items-center gap-1.5 pt-2 text-amber-400">
                  <ArrowUp className="w-3.5 h-3.5" /> Back to Summit
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} <strong>HIDDEN INDIA</strong>. Curated with reverence for India’s living lands, languages, and tribal guardians.
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              Preserving <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> Sacred Soil
            </span>
          </div>
        </div>
      </div>

      {/* Info Modals for Privacy, Terms, Contact, Responsible Travel */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto glass-panel-gold p-6 sm:p-8 rounded-3xl border border-amber-500/40 shadow-2xl">
            <button
              onClick={() => setModalContent(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-slate-300 hover:text-white"
            >
              ✕
            </button>

            {modalContent === 'privacy' && (
              <div>
                <h3 className="font-serif-luxury text-2xl font-bold text-white mb-3">Privacy Policy</h3>
                <div className="space-y-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
                  <p>
                    Hidden India is built on digital privacy and zero commercial surveillance. We do not sell your personal data or track your travels across external services.
                  </p>
                  <p>
                    All saved wishlist items and custom generated itineraries remain stored exclusively inside your local browser storage (`localStorage`) unless you choose to export them.
                  </p>
                  <p>
                    When joining our newsletter dispatch, your email is securely encrypted and used solely for monthly field notes and newly documented tribal homestays.
                  </p>
                </div>
              </div>
            )}

            {modalContent === 'terms' && (
              <div>
                <h3 className="font-serif-luxury text-2xl font-bold text-white mb-3">Terms & Conditions</h3>
                <div className="space-y-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
                  <p>
                    All geographic coordinates, altitude telemetry, and cultural documentation are verified for informational and cultural preservation purposes.
                  </p>
                  <p>
                    High-altitude expeditions, border regions (ILP zones), and sanctuary treks involve inherent alpine elements. Travelers are personally responsible for acquiring mandatory state permits, hiring accredited indigenous village guides, and maintaining appropriate travel insurance.
                  </p>
                  <p>
                    Respect sacred tribal groves, monastic photography restrictions, and leave zero plastic behind.
                  </p>
                </div>
              </div>
            )}

            {modalContent === 'responsible' && (
              <div>
                <h3 className="font-serif-luxury text-2xl font-bold text-white mb-3">The Responsible Traveler Charter</h3>
                <div className="space-y-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
                  <p className="text-amber-300 font-semibold">
                    Four Sacred Rules of the Hidden India Voyage:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">1.</span>
                      <span><strong>Never Photograph Without Consent:</strong> Always ask tribal elders before taking portraits or sacred ritual recordings.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">2.</span>
                      <span><strong>Support Indigenous Homestays:</strong> Eat local cuisine, drink boiled spring water, and purchase crafts directly from the artisans.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">3.</span>
                      <span><strong>Zero Single-Use Plastic:</strong> Carry reusable insulated flasks and pack out every wrapper you carry into the mountains.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">4.</span>
                      <span><strong>Tread With Humility:</strong> You are an invited guest in ancestral lands with thousands of years of spiritual lineage.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {modalContent === 'contact' && (
              <div>
                <h3 className="font-serif-luxury text-2xl font-bold text-white mb-3">Contact & Homestay Registry</h3>
                <div className="space-y-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
                  <p>
                    Are you an indigenous homestay operator, local guide, or folk artisan residing in an unexplored Indian territory?
                  </p>
                  <div className="bg-black/40 p-4 rounded-xl border border-white/10 space-y-1.5 font-mono text-xs text-amber-300">
                    <div>Dispatch Email: field-notes@hiddenindia.org</div>
                    <div>Heritage Registry: registry@hiddenindia.org</div>
                    <div>Coordinates: New Delhi / Guwahati / Leh Field Hubs</div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    We review and verify all homestays through personal field visits before including them in our registry.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setModalContent(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
