import React from 'react';
import { Sparkles, Shield, Users, Trees, HeartHandshake } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="about" className="relative py-24 sm:py-32 bg-[#05070a] border-t border-white/5 overflow-hidden">
      {/* Decorative Halo */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Manifesto */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Our Sacred Creed</span>
            </div>

            <h2 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-white tracking-wide leading-tight mb-6">
              Why <span className="gold-gradient-text">Hidden India</span> Exists
            </h2>

            <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                India’s true essence has never lived in crowded tourist selfie lines or sterilized resort corridors. It thrives in the mist-veiled bamboo hamlets of Lower Subansiri, along silent red sandstone canyons carved by forgotten rivers, and in the courtyard songs of wandering Baul mystics.
              </p>
              <p>
                As mainstream commercial tourism overwhelms fragile Himalayan hill-stations and historic temple towns, <strong>Hidden India</strong> was born as an intentional digital movement: to celebrate and protect the subcontinent's most secluded sanctuaries.
              </p>
              <p>
                We do not just reveal places; we guide conscious travelers into sacred covenants of reverence, cultural respect, and zero-trace exploration that directly enrich indigenous forest dwellers and artisanal master guilds.
              </p>
            </div>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2.5">
                  <Shield className="w-4 h-4" />
                </div>
                <h4 className="font-serif-luxury text-sm font-bold text-white mb-1">Anti-Mass Tourism</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dispersing travelers away from overburdened hotspots to prevent environmental fatigue.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <h4 className="font-serif-luxury text-sm font-bold text-white mb-1">Direct Tribal Economy</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  100% of homestay and local expedition revenue flows directly to host indigenous families.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2.5">
                  <Users className="w-4 h-4" />
                </div>
                <h4 className="font-serif-luxury text-sm font-bold text-white mb-1">Living Oral Traditions</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Archiving endangered tribal songs, lost-wax casting, and vernacular bio-architecture.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2.5">
                  <Trees className="w-4 h-4" />
                </div>
                <h4 className="font-serif-luxury text-sm font-bold text-white mb-1">Leave No Trace</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Strict zero-plastic, no-runoff stewardship across pristine streams and sacred groves.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Card & Impact Statistics */}
          <div className="lg:col-span-5">
            <div className="relative glass-panel-gold p-6 sm:p-8 rounded-3xl border border-amber-500/30 shadow-2xl overflow-hidden">
              <div className="relative rounded-2xl overflow-hidden h-64 mb-6">
                <img
                  src="https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=800&q=80"
                  alt="Apatani elder in Ziro"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80';
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-xs font-serif-luxury italic text-amber-200">
                    "We do not inherit the earth from our ancestors; we borrow it from our children."
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">— Apatani Elder Proverb</span>
                </div>
              </div>

              {/* Impact Metrics */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs text-slate-400">Indigenous Homestay Partners</span>
                  <span className="font-serif-luxury text-lg font-bold text-amber-300">120+ Families</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs text-slate-400">Vanishing Crafts Documented</span>
                  <span className="font-serif-luxury text-lg font-bold text-emerald-400">45 Master Guilds</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs text-slate-400">Carbon & Plastic Neutral Expeditions</span>
                  <span className="font-serif-luxury text-lg font-bold text-cyan-400">100% Certified</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Local Guide Cooperative Equity</span>
                  <span className="font-serif-luxury text-lg font-bold text-amber-400">Direct Pay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
