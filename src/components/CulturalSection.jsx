import React, { useState, useEffect } from 'react';
import { CULTURAL_EXPERIENCES } from '../data/culturalExperiences';
import { Sparkles, Utensils, Palette, Landmark, Music, Users, Calendar, MapPin, ArrowRight } from 'lucide-react';

const CATEGORY_ICONS = {
  festivals: Calendar,
  cuisine: Utensils,
  handicrafts: Palette,
  architecture: Landmark,
  music: Music,
  communities: Users
};

export default function CulturalSection() {
  const [activeTab, setActiveTab] = useState('festivals');
  const [selectedExperience, setSelectedExperience] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedExperience(null);
    };
    if (selectedExperience) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedExperience]);

  const currentCategoryData = CULTURAL_EXPERIENCES.find(cat => cat.category === activeTab) || CULTURAL_EXPERIENCES[0];

  return (
    <section id="culture" className="relative py-24 sm:py-32 bg-[#05070a] border-t border-white/5 overflow-hidden">
      {/* Decorative Golden Orbs */}
      <div className="absolute top-1/3 -right-60 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 -left-60 w-96 h-96 bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Living Soul of the Subcontinent</span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-white tracking-wide">
            Cultural <span className="gold-gradient-text">Experiences</span> & Heritage
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            India is not merely geography—it is a tapestry of unwritten folk epics, ancient alchemy, sacred rhythms, and master guilds preserved through unbroken generations.
          </p>
        </div>

        {/* Category Navigation Pills */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-12">
          {CULTURAL_EXPERIENCES.map((category) => {
            const Icon = CATEGORY_ICONS[category.category] || Sparkles;
            const isActive = activeTab === category.category;

            return (
              <button
                key={category.category}
                onClick={() => setActiveTab(category.category)}
                className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 border ${
                  isActive
                    ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.35)] scale-105'
                    : 'glass-panel text-slate-300 border-white/10 hover:border-amber-500/30 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-amber-400'}`} />
                <span>{category.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Category Title & Subtitle Banner */}
        <div className="glass-panel-gold p-6 sm:p-8 rounded-3xl mb-10 border border-amber-500/25 relative overflow-hidden">
          <div className="max-w-2xl">
            <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white mb-2">
              {currentCategoryData.title}
            </h3>
            <p className="text-amber-300/90 text-sm sm:text-base italic">
              {currentCategoryData.subtitle}
            </p>
          </div>
        </div>

        {/* Culture Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {currentCategoryData.items.map((item) => (
            <div
              key={item.id}
              className="group glass-panel rounded-3xl overflow-hidden border border-white/10 hover:border-amber-500/40 transition-all duration-500 flex flex-col sm:flex-row hover:-translate-y-1 hover:shadow-2xl"
            >
              {/* Card Image */}
              <div className="relative sm:w-2/5 h-56 sm:h-auto overflow-hidden shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80';
                  }}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/80 via-transparent to-transparent" />
                
                {/* Location Badge */}
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 text-[11px] font-medium text-amber-300 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-500/30">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span className="truncate max-w-[140px]">{item.location}</span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif-luxury text-xl font-bold text-white group-hover:text-amber-300 transition-colors mb-2">
                    {item.name}
                  </h4>

                  <p className="text-slate-300 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Highlights / Specific attributes */}
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5 mb-4 text-xs space-y-1.5">
                    {item.period && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400 text-[11px]">Period:</span>
                        <span className="font-medium text-amber-300">{item.period}</span>
                      </div>
                    )}
                    {item.signatureDish && (
                      <div className="flex items-start justify-between gap-2 text-slate-300">
                        <span className="text-slate-400 text-[11px] shrink-0">Signature:</span>
                        <span className="font-medium text-amber-300 text-right">{item.signatureDish}</span>
                      </div>
                    )}
                    {item.craftType && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400 text-[11px]">Guild:</span>
                        <span className="font-medium text-amber-300">{item.craftType}</span>
                      </div>
                    )}
                    {item.system && (
                      <div className="flex items-start justify-between gap-2 text-slate-300">
                        <span className="text-slate-400 text-[11px] shrink-0">Structure:</span>
                        <span className="font-medium text-emerald-300 text-right">{item.system}</span>
                      </div>
                    )}
                    {item.covenant && (
                      <div className="flex items-start justify-between gap-2 text-slate-300">
                        <span className="text-slate-400 text-[11px] shrink-0">Covenant:</span>
                        <span className="font-medium text-amber-300 text-right">{item.covenant}</span>
                      </div>
                    )}
                    {item.form && (
                      <div className="flex items-start justify-between gap-2 text-slate-300">
                        <span className="text-slate-400 text-[11px] shrink-0">Tradition:</span>
                        <span className="font-medium text-amber-300 text-right">{item.form}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags & Action Button */}
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/40 text-slate-300 border border-white/10"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setSelectedExperience(item)}
                    className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-amber-500/20 text-amber-300 hover:text-white text-xs font-semibold transition-all border border-white/10 hover:border-amber-400/40 flex items-center justify-center gap-1.5"
                  >
                    <span>View Lore Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cultural Experience Deep Detail Modal */}
      {selectedExperience && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel-gold p-6 sm:p-8 rounded-3xl border border-amber-500/40 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setSelectedExperience(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Cultural Archive Dossier</span>
            </div>

            <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white mb-2">
              {selectedExperience.name}
            </h3>

            <p className="text-amber-300/90 text-xs sm:text-sm font-medium mb-4 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              {selectedExperience.location}
            </p>

            <div className="rounded-2xl overflow-hidden h-56 w-full mb-6 relative">
              <img
                src={selectedExperience.image}
                alt={selectedExperience.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80';
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-6">
              {selectedExperience.description}
            </p>

            {/* In-depth details */}
            <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-white/10 text-xs sm:text-sm mb-6">
              {selectedExperience.ritual && (
                <div>
                  <span className="text-amber-400 font-bold block mb-0.5">Sacred Ritual & Performance:</span>
                  <span className="text-slate-300">{selectedExperience.ritual}</span>
                </div>
              )}
              {selectedExperience.uniqueness && (
                <div>
                  <span className="text-amber-400 font-bold block mb-0.5">Artisanal Mastery:</span>
                  <span className="text-slate-300">{selectedExperience.uniqueness}</span>
                </div>
              )}
              {selectedExperience.legacy && (
                <div>
                  <span className="text-amber-400 font-bold block mb-0.5">Historical & Ecological Covenant:</span>
                  <span className="text-slate-300">{selectedExperience.legacy}</span>
                </div>
              )}
              {selectedExperience.instruments && (
                <div>
                  <span className="text-amber-400 font-bold block mb-0.5">Acoustic & Folk Instruments:</span>
                  <span className="text-slate-300">{selectedExperience.instruments.join(', ')}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={() => setSelectedExperience(null)}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
