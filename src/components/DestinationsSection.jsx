import React, { useState } from 'react';
import { DESTINATIONS, CATEGORIES } from '../data/destinations';
import { MapPin, Calendar, ArrowRight, Heart, Sparkles, Filter } from 'lucide-react';

export default function DestinationsSection({ onSelectDestination, onToggleWishlist, wishlist = [] }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredDestinations = activeCategory === 'All'
    ? DESTINATIONS
    : DESTINATIONS.filter(d => d.category === activeCategory);

  return (
    <section id="destinations" className="relative py-24 sm:py-32 bg-[#06080c] overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Sanctuaries</span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-white tracking-wide">
              Hidden Destinations of <span className="gold-gradient-text">India</span>
            </h2>
            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              Carefully researched, uncommercialized places where untouched ecology, sacred architectures, and ancient tribal customs survive in serene isolation.
            </p>
          </div>

          <div className="text-right hidden md:block">
            <span className="font-serif-luxury text-4xl font-extrabold text-amber-400/90">{DESTINATIONS.length}</span>
            <span className="text-slate-400 text-xs block uppercase tracking-wider">Curated Sanctuaries</span>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 pr-2 border-r border-white/10 shrink-0">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Filter By:</span>
          </div>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-300 border ${
                activeCategory === category
                  ? 'bg-amber-500 text-black font-bold border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:border-amber-500/30 hover:bg-white/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Destination Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredDestinations.map((dest) => {
            const isSaved = wishlist.includes(dest.id);
            return (
              <div
                key={dest.id}
                className="group relative rounded-3xl glass-panel border border-white/10 hover:border-amber-500/40 transition-all duration-500 overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)]"
              >
                {/* Image Container with Zoom & Badge Overlays */}
                <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80';
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06080c] via-black/30 to-black/20" />

                  {/* Region & State Badge */}
                  <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5">
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      {dest.state}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-md text-slate-300 border border-white/10">
                      {dest.altitude}
                    </span>
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(dest.id);
                    }}
                    className={`absolute top-4 right-4 z-10 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 border ${
                      isSaved
                        ? 'bg-rose-500/25 text-rose-300 border-rose-500/50 shadow-lg shadow-rose-500/30'
                        : 'bg-black/50 text-white/80 border-white/15 hover:bg-black/80 hover:text-rose-400'
                    }`}
                    title={isSaved ? 'Remove from Saved' : 'Save Destination'}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-400 text-rose-400' : ''}`} />
                  </button>

                  {/* Seclusion Badge at bottom edge of image */}
                  <div className="absolute bottom-3 left-4 z-10">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      {dest.seclusionIndex}% Off the Grid
                    </span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Destination Title */}
                    <h3 className="font-serif-luxury text-2xl font-bold text-white group-hover:text-amber-300 transition-colors">
                      {dest.name}
                    </h3>
                    <p className="text-xs text-amber-400/90 font-medium italic mt-0.5 mb-3 line-clamp-1">
                      "{dest.tagline}"
                    </p>

                    {/* Short Description */}
                    <p className="text-slate-300 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
                      {dest.description}
                    </p>

                    {/* Key Info Points */}
                    <div className="space-y-2 mb-6 text-xs border-y border-white/5 py-3">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400 text-[11px] block">Best Window:</span>
                          <span className="text-slate-200 font-medium">{dest.bestTime}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400 text-[11px] block">Signature Lore:</span>
                          <span className="text-slate-200 font-medium line-clamp-2">{dest.uniqueExperience}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-2">
                    <button
                      onClick={() => onSelectDestination(dest)}
                      className="w-full py-3 px-4 rounded-xl glass-panel-gold hover:bg-amber-500 hover:text-black text-amber-200 font-bold text-xs uppercase tracking-wider transition-all duration-300 border border-amber-500/30 hover:border-amber-400 flex items-center justify-center gap-2 group/btn"
                    >
                      <span>Explore Destination</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
