import React, { useState, useMemo } from 'react';
import { DESTINATIONS, CATEGORIES, REGIONS } from '../data/destinations';
import { Search, MapPin, Heart, ArrowRight, X, Compass } from 'lucide-react';

export default function DiscoverySection({ onSelectDestination, onToggleWishlist, wishlist = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [sortBy, setSortBy] = useState('seclusion'); // 'seclusion' | 'name' | 'altitude'
  const [minSeclusion, setMinSeclusion] = useState(80);

  // Extract all unique states
  const states = useMemo(() => {
    const list = Array.from(new Set(DESTINATIONS.map(d => d.state))).sort();
    return ['All', ...list];
  }, []);

  // Filtered & sorted destinations
  const filteredResults = useMemo(() => {
    return DESTINATIONS.filter((item) => {
      // Search text match
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery = !query || (
        item.name.toLowerCase().includes(query) ||
        item.state.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.uniqueExperience.toLowerCase().includes(query) ||
        item.tags.some(t => t.toLowerCase().includes(query))
      );

      // Region match
      const matchesRegion = selectedRegion === 'All' || item.region === selectedRegion;

      // Category match
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

      // State match
      const matchesState = selectedState === 'All' || item.state === selectedState;

      // Seclusion match
      const matchesSeclusion = item.seclusionIndex >= minSeclusion;

      return matchesQuery && matchesRegion && matchesCategory && matchesState && matchesSeclusion;
    }).sort((a, b) => {
      if (sortBy === 'seclusion') return b.seclusionIndex - a.seclusionIndex;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'altitude') {
        const altA = parseInt(a.altitude.replace(/[^0-9]/g, '')) || 0;
        const altB = parseInt(b.altitude.replace(/[^0-9]/g, '')) || 0;
        return altB - altA;
      }
      return 0;
    });
  }, [searchQuery, selectedRegion, selectedCategory, selectedState, sortBy, minSeclusion]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedRegion('All');
    setSelectedCategory('All');
    setSelectedState('All');
    setSortBy('seclusion');
    setMinSeclusion(80);
  };

  const hasActiveFilters = searchQuery !== '' || selectedRegion !== 'All' || selectedCategory !== 'All' || selectedState !== 'All' || minSeclusion > 80;

  return (
    <section id="discovery" className="relative py-24 sm:py-32 bg-[#06080c] border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-widest mb-4">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Subcontinent Exploration Engine</span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-white tracking-wide">
            Travel <span className="gold-gradient-text">Discovery</span> Portal
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Search by experience, filter by seclusion level, state, or terrain type to uncover India's most guarded sanctuaries.
          </p>
        </div>

        {/* Discovery Filter Console */}
        <div className="glass-panel-gold p-6 sm:p-8 rounded-3xl mb-12 border border-amber-500/25 shadow-2xl">
          {/* Main Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by destination, state, tribal lore, or experience (e.g. 'Apatani', 'Living Root', 'Kashmir', 'Trek')..."
              className="w-full pl-12 pr-10 py-4 rounded-2xl bg-black/60 border border-white/15 focus:border-amber-400 focus:outline-none text-white text-sm sm:text-base placeholder:text-slate-500 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Region Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Region / Sector
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-black/50 border border-white/10 text-slate-200 text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r} className="bg-slate-900 text-white">
                    {r === 'All' ? 'All Regions of India' : `${r} India`}
                  </option>
                ))}
              </select>
            </div>

            {/* State Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                State / Union Territory
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-black/50 border border-white/10 text-slate-200 text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
              >
                {states.map((st) => (
                  <option key={st} value={st} className="bg-slate-900 text-white">
                    {st === 'All' ? 'All Indian States' : st}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Experience Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-black/50 border border-white/10 text-slate-200 text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Sort Results By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-black/50 border border-white/10 text-slate-200 text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
              >
                <option value="seclusion" className="bg-slate-900 text-white">Highest Seclusion (% Unexplored)</option>
                <option value="name" className="bg-slate-900 text-white">Alphabetical (A to Z)</option>
                <option value="altitude" className="bg-slate-900 text-white">Highest Altitude First</option>
              </select>
            </div>
          </div>

          {/* Slider & Clear Filter Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs text-slate-400 whitespace-nowrap">
                Min. Seclusion Score: <strong className="text-amber-400">{minSeclusion}%</strong>
              </span>
              <input
                type="range"
                min="80"
                max="98"
                step="1"
                value={minSeclusion}
                onChange={(e) => setMinSeclusion(parseInt(e.target.value))}
                className="accent-amber-400 w-36 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs text-slate-400">
                Found <strong className="text-white font-bold">{filteredResults.length}</strong> matching sanctuaries
              </span>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-amber-300 font-semibold transition-all flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Cards Display */}
        {filteredResults.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-3xl p-8 max-w-md mx-auto">
            <Compass className="w-12 h-12 text-amber-400 mx-auto mb-4 opacity-50" />
            <h4 className="font-serif-luxury text-xl font-bold text-white mb-2">No Sanctuaries Match Filters</h4>
            <p className="text-xs text-slate-400 mb-6">
              Try relaxing your search terms or resetting seclusion filters to discover other regions.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredResults.map((dest) => {
              const isSaved = wishlist.includes(dest.id);
              return (
                <div
                  key={dest.id}
                  className="group rounded-3xl glass-panel border border-white/10 hover:border-amber-500/40 transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1.5 hover:shadow-2xl"
                >
                  {/* Photo */}
                  <div className="relative h-60 w-full overflow-hidden">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80';
                      }}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    <div className="absolute top-4 left-4 z-10 flex gap-2">
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-black/70 backdrop-blur-md text-amber-300 border border-amber-500/30">
                        {dest.state}
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleWishlist(dest.id)}
                      className={`absolute top-4 right-4 z-10 p-2.5 rounded-full backdrop-blur-md transition-all ${
                        isSaved
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-black/50 text-white/80 border border-white/15 hover:text-rose-400'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-400' : ''}`} />
                    </button>

                    <div className="absolute bottom-3 left-4 z-10">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                        {dest.seclusionIndex}% Off the Beaten Track
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif-luxury text-xl font-bold text-white group-hover:text-amber-300 transition-colors mb-1">
                        {dest.name}
                      </h4>
                      <p className="text-xs text-amber-400/90 font-medium mb-3">
                        {dest.altitude} · {dest.category}
                      </p>
                      <p className="text-slate-300 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
                        {dest.description}
                      </p>
                    </div>

                    <button
                      onClick={() => onSelectDestination(dest)}
                      className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-amber-500 hover:text-black text-amber-300 font-bold text-xs uppercase tracking-wider transition-all duration-300 border border-white/10 hover:border-amber-400 flex items-center justify-center gap-2"
                    >
                      <span>Inspect Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
